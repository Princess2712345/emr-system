import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'
import { loadStaffMap } from '../../utils/appointmentStaff'

export default defineEventHandler(async (event) => {
  try {
    const userId = getQuery(event).userId as string
    if (!userId) {
      return { success: false, error: 'User id required.' }
    }

    const { patient } = await requirePatientContext(userId)

    const dbAppointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { date: 'asc' }
    })

    const staffMap = await loadStaffMap(dbAppointments.map((apt) => apt.staffId))

    const now = new Date()
    const upcomingVisits = dbAppointments.filter(a =>
      ['Confirmed', 'Pending', 'In Progress'].includes(a.status)
    )
    const completedCount = dbAppointments.filter(a => a.status === 'Completed').length

    const nextApt = upcomingVisits.find(a => new Date(a.date) >= now) || upcomingVisits[0] || null
    let nextDateStr = 'No upcoming visits'
    let daysRemainingStr = '--'

    if (nextApt) {
      const aptDate = new Date(nextApt.date)
      nextDateStr = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const diffDays = Math.ceil((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      daysRemainingStr = diffDays <= 0 ? 'Today' : `In ${diffDays} Days`
    }

    const staffName = (staffId: string | null) => {
      const staff = staffId ? staffMap.get(staffId) : undefined
      if (!staff) return 'General Physician'
      return `Dr. ${staff.lastName} (${staff.role})`
    }

    const formattedAppointments = dbAppointments.map((apt) => {
      const dt = new Date(apt.date)
      return {
        id: apt.id,
        doctor: staffName(apt.staffId),
        date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: apt.time || '09:00 AM',
        reason: apt.reason,
        status: apt.status,
        clinic: 'Main Clinic — EMR Hub'
      }
    })

    return {
      success: true,
      metrics: {
        nextDate: nextDateStr,
        daysRemaining: daysRemainingStr,
        completedVisits: completedCount,
        preferredClinic: 'Main Clinic — EMR Hub'
      },
      appointments: formattedAppointments
    }
  } catch (error: any) {
    console.error('Appointments fetch error:', error)
    return { success: false, error: error.message || 'Failed to load appointments.' }
  }
})
