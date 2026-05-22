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

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(body.date),
      time: body.time,
      duration: body.duration || '30 min',
      reason: body.reason || 'Patient-requested consultation',
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
      action: `Patient requested appointment for ${body.date}`,
      resource: `Appointment-${appointment.id}`,
      severity: 'Info'
    }
  }).catch(() => {})

  return { success: true, appointment }
})
