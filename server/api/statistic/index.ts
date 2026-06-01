import { prisma } from '../../utils/prisma'

const peso = (n: number) =>
  `\u20B1${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET') return { success: false }

  // ---- Core counts across every operational table ----
  const [
    totalPatients,
    totalStaff,
    totalAppointments,
    totalLabs,
    pendingLabs,
    completedLabs,
    totalInvoices,
    totalDispositions,
    invoices,
    appointments
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR'] } } }),
    prisma.appointment.count(),
    prisma.labResult.count(),
    prisma.labResult.count({ where: { status: { notIn: ['Completed', 'Cancelled'] } } }),
    prisma.labResult.count({ where: { status: 'Completed' } }),
    prisma.invoice.count(),
    prisma.disposition.count(),
    prisma.invoice.findMany({ select: { amount: true, balance: true, status: true } }),
    prisma.appointment.findMany({ select: { status: true } })
  ])

  // ---- Revenue (collected vs outstanding) ----
  const revenueCollected = invoices.reduce(
    (sum, inv) => sum + Math.max((inv.amount || 0) - (inv.balance || 0), 0),
    0
  )
  const outstanding = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)

  // ---- Appointment status distribution (real) ----
  const statusCounts: Record<string, number> = {}
  for (const a of appointments) {
    const key = a.status || 'Pending'
    statusCounts[key] = (statusCounts[key] || 0) + 1
  }
  const apptTotal = appointments.length || 1
  const statusMeta: { key: string; class: string }[] = [
    { key: 'Confirmed', class: 'cardio' },
    { key: 'Completed', class: 'neuro' },
    { key: 'Pending', class: 'ped' },
    { key: 'Cancelled', class: 'amber' }
  ]
  const distribution = statusMeta
    .map((m) => ({
      name: m.key,
      pct: Math.round(((statusCounts[m.key] || 0) / apptTotal) * 100),
      count: statusCounts[m.key] || 0,
      class: m.class
    }))
    .filter((d) => d.count > 0)

  // ---- Monthly patient admissions for the last 6 months (real) ----
  const now = new Date()
  const months: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const value = await prisma.patient.count({
      where: { createdAt: { gte: start, lt: end } }
    })
    months.push({ label: start.toLocaleDateString('en-US', { month: 'short' }), value })
  }
  const maxMonth = Math.max(...months.map((m) => m.value), 1)
  const monthly = months.map((m) => ({
    label: m.label,
    value: m.value,
    pct: Math.max(Math.round((m.value / maxMonth) * 100), m.value > 0 ? 8 : 3)
  }))
  // Backwards-compatible flat array of heights
  const monthlyAdmissions = monthly.map((m) => m.pct)

  // ---- Module activity table (everything happening in the system) ----
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const [apptThisMonth, labsThisMonth, invThisMonth, dispThisMonth, patientsThisMonth] =
    await Promise.all([
      prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.labResult.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.invoice.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.disposition.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } })
    ])

  const activity = [
    { name: 'Patient Registry', total: totalPatients, thisMonth: patientsThisMonth, icon: 'lucide:users' },
    { name: 'Appointments', total: totalAppointments, thisMonth: apptThisMonth, icon: 'lucide:calendar-days' },
    { name: 'Lab Results', total: totalLabs, thisMonth: labsThisMonth, icon: 'lucide:test-tube-2' },
    { name: 'Billing Statements', total: totalInvoices, thisMonth: invThisMonth, icon: 'lucide:credit-card' },
    { name: 'Dispositions', total: totalDispositions, thisMonth: dispThisMonth, icon: 'lucide:file-output' }
  ]

  return {
    success: true,
    kpis: {
      totalPatients: totalPatients.toLocaleString(),
      totalStaff: totalStaff.toLocaleString(),
      appointmentsCount: totalAppointments.toLocaleString(),
      labResults: totalLabs.toLocaleString(),
      pendingLabs: pendingLabs.toLocaleString(),
      completedLabs: completedLabs.toLocaleString(),
      dispositions: totalDispositions.toLocaleString(),
      revenueCollected: peso(revenueCollected),
      outstanding: peso(outstanding)
    },
    distribution,
    monthly,
    monthlyAdmissions,
    activity,
    // legacy key kept so older bindings don't break
    departments: activity.map((a) => ({ name: a.name, patients: a.total.toLocaleString(), stay: '—' })),
    updatedAt: new Date().toISOString()
  }
})
