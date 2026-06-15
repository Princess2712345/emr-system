import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'
import { enrichLabRecord } from '../../utils/labResultDetails'
import { loadStaffMap, staffDoctorLabel } from '../../utils/appointmentStaff'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const { user, patient } = await requirePatientContext(userId)

  const [appointments, labs, invoices, auditLogs, dispositions] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { date: 'desc' }
    }),
    prisma.labResult.findMany({
      where: { patientId: patient.id },
      orderBy: { dateReported: 'desc' }
    }),
    prisma.invoice.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.auditLog.findMany({
      where: { resource: { contains: patient.id } },
      orderBy: { timestamp: 'desc' },
      take: 50
    }),
    prisma.disposition.findMany({
      where: { patientId: patient.id },
      orderBy: { dateTime: 'desc' }
    })
  ])

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const staffMap = await loadStaffMap(appointments.map((apt) => apt.staffId))

  const visitRows = appointments.map((apt) => {
    const staff = apt.staffId ? staffMap.get(apt.staffId) : undefined
    const doctor = staffDoctorLabel(staff, 'Clinical team')
    return {
      id: `apt-${apt.id}`,
      type: 'visit',
      date: formatDate(apt.date),
      sortDate: apt.date,
      title: apt.reason,
      subtitle: `${doctor} • ${apt.time} • ${apt.duration}`,
      status: apt.status,
      meta: apt.status
    }
  })

  const labRows = labs.map((lab) => {
    const detail = enrichLabRecord(lab)
    return {
      id: `lab-${lab.id}`,
      type: 'lab',
      date: formatDate(lab.dateReported),
      sortDate: lab.dateReported,
      title: lab.testName,
      subtitle: `${lab.category} • ${lab.requestId}`,
      status: lab.status === 'Pending' ? 'Pending Review' : lab.status,
      meta: detail.pending ? 'Awaiting results' : `${detail.lines.length} result lines`,
      labId: lab.id
    }
  })

  const billRows = invoices.map((inv) => ({
    id: `bill-${inv.id}`,
    type: 'billing',
    date: formatDate(inv.createdAt),
    sortDate: inv.createdAt,
    title: inv.patientName,
    subtitle: `Invoice ${inv.id.slice(-8).toUpperCase()}`,
    status: inv.status,
    meta: `₱${inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }))

  const dispositionRows = dispositions.map((d) => ({
    id: `disp-${d.id}`,
    type: 'disposition',
    date: formatDate(d.dateTime),
    sortDate: d.dateTime,
    title: d.type,
    subtitle: `Dr. ${d.physician}`,
    status: 'Recorded',
    meta: 'Clinical disposition'
  }))

  const auditRows = auditLogs.map((log) => ({
    id: `log-${log.id}`,
    type: 'activity',
    date: formatDate(log.timestamp),
    sortDate: log.timestamp,
    title: log.action,
    subtitle: log.resource,
    status: log.severity,
    meta: log.user
  }))

  const timeline = [...visitRows, ...labRows, ...billRows, ...dispositionRows, ...auditRows]
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

  return {
    success: true,
    patient: {
      name: `${user.firstName} ${user.lastName}`,
      id: user.uniqueId
    },
    counts: {
      visits: visitRows.length,
      labs: labRows.length,
      bills: billRows.length,
      total: timeline.length
    },
    timeline,
    visits: visitRows,
    labs: labRows,
    bills: billRows
  }
})
