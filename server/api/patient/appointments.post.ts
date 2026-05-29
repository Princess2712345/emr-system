import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const body = await readBody(event)
  const { patient, user } = await requirePatientContext(userId)

  if (!body.date || !body.time) {
    throw createError({ statusCode: 400, statusMessage: 'Date and time are required.' })
  }

  const reasonParts = []
  if (body.visitType) reasonParts.push(body.visitType)
  if (body.reason) reasonParts.push(body.reason)
  if (body.symptoms) reasonParts.push(`Symptoms: ${body.symptoms}`)
  const fullReason = reasonParts.join(' • ') || 'Patient-requested consultation'

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(body.date),
      time: body.time,
      duration: body.duration || '30 min',
      reason: fullReason,
      status: 'Pending',
      patientId: patient.id,
      patientName: patient.name,
      staffId: body.staffId || null
    },
    include: { staff: true }
  })

  await prisma.auditLog.create({
    data: {
      user: user.id,
      action: `Appointment request: ${fullReason} on ${body.date} at ${body.time}`,
      resource: `Patient-${patient.id}`,
      severity: 'Info'
    }
  }).catch(() => {})

  return {
    success: true,
    message: 'Your appointment request was submitted. Staff will confirm shortly.',
    appointment: {
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      reason: appointment.reason,
      status: appointment.status,
      clinic: body.clinic || 'Main Clinic — EMR Hub'
    }
  }
})
