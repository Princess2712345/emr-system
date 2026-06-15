import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'
import { staffDoctorLabel } from '../../utils/appointmentStaff'

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

    const staffUser = nextAppointment?.staffId
      ? await prisma.user.findUnique({
          where: { id: nextAppointment.staffId },
          select: { id: true, lastName: true, role: true }
        })
      : null

    const staffLabel = staffDoctorLabel(staffUser ?? undefined, 'Clinical Staff')

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

    const dispositionType = recentDisposition?.type || null
    let careStatus = 'Outpatient'
    let careStatusClass = 'outpatient'
    if (dispositionType === 'Admitted') {
      careStatus = 'Admitted'
      careStatusClass = 'admitted'
    } else if (dispositionType === 'Transferred') {
      careStatus = 'Transferred'
      careStatusClass = 'transferred'
    } else if (dispositionType === 'Discharged') {
      careStatus = 'Outpatient'
      careStatusClass = 'outpatient'
    }

    return {
      success: true,
      patientInfo: {
        id: user.uniqueId || `#EMR-${user.id.slice(0, 6)}`,
        name: `${user.firstName} ${user.lastName}`,
        initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'PT',
        age: user.age ?? 24,
        bloodType: user.bloodType || 'O Positive',
        avatar: patient.avatar || '',
        careStatus,
        careStatusClass,
        dispositionType
      },
      vitals: {
        bloodPressure: recentDisposition ? 'See last visit' : '120/80',
        heartRate: '72 bpm',
        criticalAllergy: patient.allergies || 'None on file',
        lastRecorded: recentDisposition
          ? new Date(recentDisposition.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'At registration'
      },
      emergencyContact: {
        name: patient.emergencyContactName || '',
        relation: patient.emergencyContactRelation || '',
        phone: patient.emergencyContactPhone || ''
      },
      insurance: {
        provider: patient.insuranceProvider || '',
        number: patient.insuranceNumber || ''
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
