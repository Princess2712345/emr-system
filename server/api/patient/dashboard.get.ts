import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

export default defineEventHandler(async (event) => {
  try {
    const userId = getQuery(event).userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User id required.' })
    }

    const { user, patient } = await requirePatientContext(userId)

    const [nextAppointment, recentLabs, recentLogs, recentDisposition, upcomingCount] = await Promise.all([
      prisma.appointment.findFirst({
        where: {
          patientId: patient.id,
          status: { in: ['Pending', 'Confirmed', 'In Progress'] },
          date: { gte: new Date() }
        },
        include: { staff: true },
        orderBy: { date: 'asc' }
      }),
      prisma.labResult.findMany({
        where: { patientId: patient.id },
        take: 3,
        orderBy: { dateReported: 'desc' }
      }),
      prisma.auditLog.findMany({
        where: { resource: { contains: patient.id } },
        take: 5,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.disposition.findFirst({
        where: { patientId: patient.id },
        orderBy: { dateTime: 'desc' }
      }),
      prisma.appointment.count({
        where: {
          patientId: patient.id,
          status: { in: ['Pending', 'Confirmed', 'In Progress'] }
        }
      })
    ])

    const staffLabel = nextAppointment?.staff
      ? `Dr. ${nextAppointment.staff.lastName}`
      : 'Clinical Staff'

    const labNotes = recentLabs.map((lab) => ({
      doctor: lab.uploadedBy || 'Clinical Lab',
      date: new Date(lab.dateReported).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: `${lab.testName} (${lab.category}) — ${lab.status}`
    }))

    const auditNotes = recentLogs.map((log) => ({
      doctor: log.user === 'Staff' ? 'Care team' : log.user,
      date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: log.action
    }))

    const dispositionNote = recentDisposition
      ? [{
          doctor: `Dr. ${recentDisposition.physician}`,
          date: new Date(recentDisposition.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          content: `Disposition: ${recentDisposition.type}`
        }]
      : []

    const timelineNotes = [...labNotes, ...dispositionNote, ...auditNotes].slice(0, 6)

    if (timelineNotes.length === 0) {
      timelineNotes.push({
        doctor: 'Registration',
        date: new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: 'Patient portal account linked to clinical record.'
      })
    }

    return {
      success: true,
      patientInfo: {
        id: user.uniqueId || `#EMR-${user.id.slice(0, 6)}`,
        name: `${user.firstName} ${user.lastName}`,
        initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'PT',
        age: user.age ?? 24,
        bloodType: user.bloodType || 'O Positive',
        status: patient.status === 'Active' ? 'Outpatient' : patient.status
      },
      vitals: {
        bloodPressure: recentDisposition ? 'See last visit' : '120/80',
        heartRate: '72 bpm',
        criticalAllergy: 'Review with physician',
        lastRecorded: recentDisposition
          ? new Date(recentDisposition.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'At registration'
      },
      nextAppointment: nextAppointment
        ? {
            date: new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            details: `${nextAppointment.reason} • ${nextAppointment.time} • ${staffLabel}`
          }
        : { date: 'None scheduled', details: upcomingCount > 0 ? 'Check Appointments tab' : 'Book from Appointments' },
      timelineNotes
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Patient Dashboard API error:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch clinical records.'
    })
  }
})
