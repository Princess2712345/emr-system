import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    return prisma.appointment.findMany({
      include: { staff: true, patient: true },
      orderBy: { date: 'asc' }
    })
  }

  if (method === 'POST') {
    const body = await readBody(event)

    let targetedPatient = null
    if (body.patientId) {
      targetedPatient = await prisma.patient.findUnique({ where: { id: body.patientId } })
    } else if (body.name) {
      targetedPatient = await prisma.patient.findFirst({
        where: { name: { contains: body.name, mode: 'insensitive' } }
      })
    }

    if (!targetedPatient) {
      throw createError({ statusCode: 404, statusMessage: 'Patient not found in registry.' })
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        time: body.time,
        duration: body.duration || '30 min',
        reason: body.reason || 'General Consultation',
        status: body.status || 'Pending',
        patientId: targetedPatient.id,
        patientName: targetedPatient.name,
        staffId: body.staffId || body.doctorId || null
      },
      include: { staff: true, patient: true }
    })

    await prisma.auditLog.create({
      data: {
        user: 'Staff',
        action: `Scheduled appointment for ${targetedPatient.name}`,
        resource: `Appointment-${newAppointment.id}`,
        severity: 'Info'
      }
    }).catch(() => {})

    return {
      success: true,
      message: 'Appointment scheduled successfully.',
      data: newAppointment
    }
  }
})
