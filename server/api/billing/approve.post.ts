import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const invoiceId = body?.invoiceId as string | undefined
  const decision = (body?.decision as string | undefined) || 'approve'

  if (!invoiceId) {
    throw createError({ statusCode: 400, statusMessage: 'Invoice id required.' })
  }

  if (!['approve', 'reject'].includes(decision)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid decision.' })
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) {
    throw createError({ statusCode: 404, statusMessage: 'Invoice not found.' })
  }

  const invShort = invoice.id.slice(0, 8).toUpperCase()
  const amountDue = invoice.balance > 0 ? invoice.balance : invoice.amount
  const method = invoice.paymentMethod || 'payment'

  if (decision === 'approve') {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'Paid', balance: 0 }
    })

    await prisma.auditLog.create({
      data: {
        user: invoice.patientName,
        action: `Payment confirmed — ${invoice.patientName}'s ${method} payment of ₱${amountDue.toFixed(2)} for invoice #${invShort} was approved.`,
        resource: `Invoice-${invoice.id}`,
        severity: 'Payment'
      }
    })

    await prisma.auditLog.create({
      data: {
        user: invoice.patientName,
        action: `Your ${method} payment of ₱${amountDue.toFixed(2)} for invoice #${invShort} was approved. Thank you!`,
        resource: `Patient-${invoice.patientId}`,
        severity: 'PatientNotify'
      }
    })

    return { success: true, status: 'Paid', message: 'Payment approved and patient notified.' }
  }

  // Reject — send invoice back to Unpaid and clear the submitted proof
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'Unpaid',
      paymentProof: null,
      paymentRef: null,
      paymentMethod: null,
      submittedAt: null
    }
  })

  await prisma.auditLog.create({
    data: {
      user: invoice.patientName,
      action: `Payment rejected — ${invoice.patientName}'s ${method} payment for invoice #${invShort} was declined.`,
      resource: `Invoice-${invoice.id}`,
      severity: 'PaymentReview'
    }
  })

  await prisma.auditLog.create({
    data: {
      user: invoice.patientName,
      action: `Your ${method} payment for invoice #${invShort} was not approved. Please re-submit a valid receipt or contact the front desk.`,
      resource: `Patient-${invoice.patientId}`,
      severity: 'PatientNotify'
    }
  })

  return { success: true, status: 'Unpaid', message: 'Payment rejected and patient notified.' }
})
