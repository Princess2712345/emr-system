import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const invoiceId = getQuery(event).invoiceId as string | undefined
  if (!invoiceId) {
    throw createError({ statusCode: 400, statusMessage: 'Invoice id required.' })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      patientName: true,
      paymentMethod: true,
      paymentRef: true,
      paymentProof: true,
      submittedAt: true,
      amount: true,
      balance: true
    }
  })

  if (!invoice) {
    throw createError({ statusCode: 404, statusMessage: 'Invoice not found.' })
  }

  return {
    success: true,
    invoice: {
      id: invoice.id,
      patientName: invoice.patientName,
      method: invoice.paymentMethod,
      reference: invoice.paymentRef,
      proof: invoice.paymentProof,
      amount: invoice.balance > 0 ? invoice.balance : invoice.amount,
      submittedAt: invoice.submittedAt
    }
  }
})
