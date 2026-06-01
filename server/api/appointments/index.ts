import { prisma } from '../../utils/prisma'
import { requireResolvedPatient } from '../../utils/resolvePatient'

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

    const patient = await requireResolvedPatient({
      patientId: body.patientId,
      patientName: body.name || body.patientName,
      uniqueId: body.uniqueId,
      email: body.email
    })

    const newAppointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date),
        time: body.time,
        duration: body.duration || '30 min',
        reason: body.reason || 'General Consultation',
        status: body.status || 'Pending',
        patientId: patient.id,
        patientName: patient.name,
        staffId: body.staffId || body.doctorId || null
      },
      include: { staff: true, patient: true }
    })

    const apptDateLabel = new Date(body.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    await prisma.auditLog.create({
      data: {
        user: 'Staff',
        action: `Scheduled appointment for ${patient.name} on ${body.date}`,
        resource: `Patient-${patient.id}`,
        severity: 'Info'
      }
    }).catch(() => {})

    await prisma.auditLog.create({
      data: {
        user: 'Care team',
        action: `An appointment was scheduled for you on ${apptDateLabel} at ${body.time}. ${body.reason || 'General consultation'}.`,
        resource: `Patient-${patient.id}`,
        severity: 'PatientNotify'
      }
    }).catch(() => {})

    return {
      success: true,
      message: 'Appointment scheduled successfully.',
      data: newAppointment
    }
  }
})
