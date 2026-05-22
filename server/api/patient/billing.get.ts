import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const { patient } = await requirePatientContext(userId)

  const invoices = await prisma.invoice.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' }
  })

  const unpaid = invoices.filter(i => i.status !== 'Paid')
  const paid = invoices.filter(i => i.status === 'Paid')
  const totalBalance = unpaid.reduce((sum, i) => sum + i.balance, 0)
  const lastPaid = paid[0]

  const nextDue = unpaid.reduce((earliest, inv) => {
    const d = new Date(inv.dueDate)
    return !earliest || d < earliest ? d : earliest
  }, null as Date | null)

  const bills = invoices.map((inv) => ({
    id: inv.id,
    service: `Clinical services — ${inv.patientName}`,
    date: new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    invoiceNo: inv.id.slice(-6).toUpperCase(),
    amount: inv.balance > 0 ? inv.balance : inv.amount,
    status: inv.status,
    dueDate: inv.dueDate
  }))

  return {
    success: true,
    totalBalance,
    dueBy: nextDue
      ? nextDue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    lastPayment: lastPaid
      ? {
          amount: lastPaid.amount,
          date: new Date(lastPaid.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        }
      : { amount: 0, date: 'No payments yet' },
    insurance: {
      provider: 'PhilHealth (linked at registration)',
      policyId: patient.id.slice(0, 8).toUpperCase(),
      status: 'Active Coverage'
    },
    autoPay: { method: 'Not enrolled', accountDisplay: '—' },
    bills
  }
})
