import { prisma } from '../../utils/prisma'

const ALLOWED = ['Pending', 'Completed', 'Cancelled']

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Lab result id required.' })
    }

    const body = await readBody(event)
    const status = typeof body?.status === 'string' ? body.status.trim() : ''
    if (!ALLOWED.includes(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid status value.' })
    }

    const existing = await prisma.labResult.findUnique({ where: { id } })
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Lab result not found.' })
    }

    const updated = await prisma.labResult.update({
      where: { id },
      data: { status }
    })

    // Clinical timeline + patient notification when results are finalized
    if (status === 'Completed' && existing.status !== 'Completed') {
      await prisma.auditLog.create({
        data: {
          user: 'Clinical Lab',
          action: `Lab result "${existing.testName}" marked as completed.`,
          resource: `Patient-${existing.patientId}`,
          severity: 'Info'
        }
      }).catch(() => {})

      await prisma.auditLog.create({
        data: {
          user: 'Care team',
          action: `Your "${existing.testName}" lab result is now available to view.`,
          resource: `Patient-${existing.patientId}`,
          severity: 'PatientNotify'
        }
      }).catch(() => {})
    }

    return { success: true, record: updated }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Lab status update failed:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update lab result.'
    })
  }
})
