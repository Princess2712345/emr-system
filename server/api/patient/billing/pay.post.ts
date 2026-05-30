import { prisma } from '../../../utils/prisma'
import { requirePatientContext } from '../../../utils/patient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = body?.userId as string | undefined
  const invoiceId = body?.invoiceId as string | undefined
  const payAll = Boolean(body?.payAll)

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const { user, patient } = await requirePatientContext(userId)

  const targets = await prisma.invoice.findMany({
    where:
      invoiceId && !payAll
        ? { id: invoiceId, patientId: patient.id }
        : { patientId: patient.id, status: { not: 'Paid' } }
  })

  if (!targets.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No unpaid invoice found to settle.'
    })
  }

  const unpaidOnly = targets.filter((inv) => inv.status !== 'Paid')
  if (!unpaidOnly.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Selected invoice is already paid.'
    })
  }

  const patientLabel = patient.name || `${user.firstName} ${user.lastName}`.trim()
  const paidResults = []

  for (const invoice of unpaidOnly) {
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'Paid',
        balance: 0
      }
    })

    const amountPaid = invoice.balance > 0 ? invoice.balance : invoice.amount

    await prisma.auditLog.create({
      data: {
        user: patientLabel,
        action: `Payment received — ${patientLabel} paid invoice #${invoice.id.slice(0, 8).toUpperCase()} (₱${amountPaid.toFixed(2)}) — Status: Paid`,
        resource: `Invoice-${invoice.id}`,
        severity: 'Payment'
      }
    })

    paidResults.push({
      id: updated.id,
      amount: amountPaid,
      status: updated.status
    })
  }

  const totalPaid = paidResults.reduce((sum, row) => sum + row.amount, 0)

  return {
    success: true,
    message: `Payment recorded. Admin has been notified.`,
    paidCount: paidResults.length,
    totalPaid,
    invoices: paidResults
  }
})
