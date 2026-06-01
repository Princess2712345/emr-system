import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

export default defineEventHandler(async (event) => {
  try {
    const userId = getQuery(event).userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User id required.' })
    }

    const body = await readBody(event).catch(() => ({}))
    const meds = Array.isArray(body?.medications)
      ? body.medications.filter((m: unknown) => typeof m === 'string' && m.trim())
      : []
    const medLabel = meds.length ? meds.join(', ') : 'all active medications'

    const { patient } = await requirePatientContext(userId)

    const pending = await prisma.medicationRefill.findFirst({
      where: { patientId: patient.id, status: 'Pending' }
    })
    if (pending) {
      throw createError({
        statusCode: 409,
        statusMessage: 'You already have a refill request awaiting pharmacy review.'
      })
    }

    await prisma.medicationRefill.create({
      data: {
        patientId: patient.id,
        patientName: patient.name,
        medications: meds.length ? meds : ['Active medications'],
        status: 'Pending'
      }
    })

    await prisma.auditLog.create({
      data: {
        user: patient.name,
        action: `Medication refill requested: ${medLabel}`,
        resource: `Patient-${patient.id}`,
        severity: 'RefillRequest'
      }
    })

    await prisma.auditLog.create({
      data: {
        user: 'Pharmacy team',
        action: `Your refill request (${medLabel}) was sent to the care team for review.`,
        resource: `Patient-${patient.id}`,
        severity: 'PatientNotify'
      }
    }).catch(() => {})

    return {
      success: true,
      message: 'Refill request submitted. A staff member will review it shortly.'
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string }
    console.error('Medication refill request failed:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to submit refill request.'
    })
  }
})
