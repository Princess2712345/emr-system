import { prisma } from '../../../utils/prisma'
import { requirePatientContext } from '../../../utils/patient'

const MAX_PROOF_CHARS = 4_000_000 // ~3MB image as base64 data URL

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const userId = body?.userId as string | undefined
  const invoiceId = body?.invoiceId as string | undefined
  const payAll = Boolean(body?.payAll)
  const method = (body?.method as string | undefined)?.trim() || 'GCash'
  const reference = (body?.reference as string | undefined)?.trim() || ''
  const proof = body?.proof as string | undefined

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  if (!['GCash', 'Card'].includes(method)) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported payment method.' })
  }

  if (method === 'GCash' && !proof) {
    throw createError({ statusCode: 400, statusMessage: 'Please attach your GCash receipt screenshot.' })
  }

  if (method === 'Card' && !reference) {
    throw createError({ statusCode: 400, statusMessage: 'Card reference is required.' })
  }

  if (proof && proof.length > MAX_PROOF_CHARS) {
    throw createError({ statusCode: 413, statusMessage: 'Receipt image is too large (max ~3MB).' })
  }

  const { user, patient } = await requirePatientContext(userId)

  const targets = await prisma.invoice.findMany({
    where:
      invoiceId && !payAll
        ? { id: invoiceId, patientId: patient.id }
        : { patientId: patient.id, status: { notIn: ['Paid', 'Pending Approval'] } }
  })

  if (!targets.length) {
    throw createError({ statusCode: 404, statusMessage: 'No payable invoice found.' })
  }

  const payable = targets.filter((inv) => inv.status !== 'Paid' && inv.status !== 'Pending Approval')
  if (!payable.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Selected invoice is already paid or awaiting approval.'
    })
  }

  const patientLabel = patient.name || `${user.firstName} ${user.lastName}`.trim()
  const submittedResults = []

  for (const invoice of payable) {
    const amountDue = invoice.balance > 0 ? invoice.balance : invoice.amount

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'Pending Approval',
        paymentMethod: method,
        paymentRef: reference || null,
        paymentProof: proof || null,
        submittedAt: new Date()
      }
    })

    const invShort = invoice.id.slice(0, 8).toUpperCase()

    // Admin notification — awaiting review
    await prisma.auditLog.create({
      data: {
        user: patientLabel,
        action: `Payment submitted — ${patientLabel} sent a ${method} payment of ₱${amountDue.toFixed(2)} for invoice #${invShort} — awaiting approval`,
        resource: `Invoice-${invoice.id}`,
        severity: 'PaymentReview'
      }
    })

    // Patient notification — confirmation of submission
    await prisma.auditLog.create({
      data: {
        user: patientLabel,
        action: `Your ${method} payment of ₱${amountDue.toFixed(2)} for invoice #${invShort} was submitted and is awaiting admin approval.`,
        resource: `Patient-${patient.id}`,
        severity: 'PatientNotify'
      }
    })

    submittedResults.push({ id: updated.id, amount: amountDue, status: updated.status })
  }

  const totalSubmitted = submittedResults.reduce((sum, row) => sum + row.amount, 0)

  return {
    success: true,
    message: `${method} payment submitted. An admin will confirm it shortly.`,
    submittedCount: submittedResults.length,
    totalSubmitted,
    invoices: submittedResults
  }
})
