import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid appointment id.' })
  }

  const body = await readBody(event)
  const status = body?.status as string | undefined

  if (!status) {
    throw createError({ statusCode: 400, statusMessage: 'Status is required.' })
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: { staff: true, patient: true }
  })

  await prisma.auditLog.create({
    data: {
      user: 'Staff',
      action: `Appointment #${id} status → ${status}`,
      resource: `Appointment-${id}`,
      severity: 'Info'
    }
  }).catch(() => {})

  // Let the patient know about meaningful status changes
  const patientFacing = {
    Confirmed: 'confirmed',
    Cancelled: 'cancelled',
    Completed: 'completed'
  }[status]

  if (patientFacing && updated.patientId) {
    const dateLabel = new Date(updated.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    await prisma.auditLog.create({
      data: {
        user: 'Care team',
        action: `Your appointment on ${dateLabel} at ${updated.time} was ${patientFacing}.`,
        resource: `Patient-${updated.patientId}`,
        severity: 'PatientNotify'
      }
    }).catch(() => {})
  }

  return { success: true, data: updated }
})
