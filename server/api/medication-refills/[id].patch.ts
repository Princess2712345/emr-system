import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Refill request id required.' })
    }

    const body = await readBody(event)
    const decision = (body?.decision as string) || ''
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''
    const reviewedBy = typeof body?.reviewedBy === 'string' ? body.reviewedBy.trim() : 'Pharmacy staff'

    if (!['approve', 'reject'].includes(decision)) {
      throw createError({ statusCode: 400, statusMessage: 'Decision must be approve or reject.' })
    }

    const refill = await prisma.medicationRefill.findUnique({ where: { id } })
    if (!refill) {
      throw createError({ statusCode: 404, statusMessage: 'Refill request not found.' })
    }

    if (refill.status !== 'Pending') {
      throw createError({ statusCode: 400, statusMessage: 'This refill request was already processed.' })
    }

    const meds = Array.isArray(refill.medications) ? (refill.medications as string[]).join(', ') : 'medications'
    const nextStatus = decision === 'approve' ? 'Approved' : 'Denied'

    await prisma.medicationRefill.update({
      where: { id },
      data: {
        status: nextStatus,
        notes: notes || null,
        reviewedBy,
        reviewedAt: new Date()
      }
    })

    if (decision === 'approve') {
      await prisma.auditLog.create({
        data: {
          user: 'Pharmacy',
          action: `Refill approved for ${refill.patientName}: ${meds}`,
          resource: `Patient-${refill.patientId}`,
          severity: 'Info'
        }
      }).catch(() => {})

      await prisma.auditLog.create({
        data: {
          user: 'Pharmacy team',
          action: `Your medication refill (${meds}) was approved. Pick up or delivery will follow pharmacy instructions.`,
          resource: `Patient-${refill.patientId}`,
          severity: 'PatientNotify'
        }
      }).catch(() => {})
    } else {
      await prisma.auditLog.create({
        data: {
          user: 'Pharmacy',
          action: `Refill denied for ${refill.patientName}: ${meds}${notes ? ` — ${notes}` : ''}`,
          resource: `Patient-${refill.patientId}`,
          severity: 'Info'
        }
      }).catch(() => {})

      await prisma.auditLog.create({
        data: {
          user: 'Pharmacy team',
          action: `Your medication refill (${meds}) was not approved.${notes ? ` Note: ${notes}` : ' Contact the clinic for details.'}`,
          resource: `Patient-${refill.patientId}`,
          severity: 'PatientNotify'
        }
      }).catch(() => {})
    }

    return {
      success: true,
      status: nextStatus,
      message: decision === 'approve' ? 'Refill approved and patient notified.' : 'Refill denied and patient notified.'
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string }
    console.error('Refill review failed:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to process refill request.'
    })
  }
})
