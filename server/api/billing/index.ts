import { prisma } from '../../utils/prisma'
import { requireResolvedPatient } from '../../utils/resolvePatient'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  if (method === 'GET') {
    const search = (query.search as string) || ''
    const status = (query.status as string) || 'All'

    const whereCondition: Record<string, unknown> = {}

    if (status !== 'All') {
      whereCondition.status = status
    }

    if (search.trim() !== '') {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { patientName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const databaseInvoices = await prisma.invoice.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        balance: true,
        dueDate: true,
        status: true,
        patientId: true,
        patientName: true,
        paymentMethod: true,
        paymentRef: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
        patient: { select: { id: true, email: true, name: true } }
      }
    })

    const allInvoices = await prisma.invoice.findMany()
    const totalOutstanding = allInvoices.reduce((acc, curr) => acc + (curr.status !== 'Paid' ? curr.balance : 0), 0)
    const collectedThisMonth = allInvoices.reduce((acc, curr) => acc + (curr.amount - curr.balance), 0)

    return {
      invoices: databaseInvoices,
      stats: {
        outstanding: totalOutstanding,
        collected: collectedThisMonth
      }
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)

    const patient = await requireResolvedPatient({
      patientId: body.patientId,
      patientName: body.patientName,
      uniqueId: body.uniqueId,
      email: body.email
    })

    const amount = parseFloat(body.amount || 150)

    const createdBill = await prisma.invoice.create({
      data: {
        patientId: patient.id,
        patientName: patient.name,
        amount,
        balance: amount,
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Unpaid'
      }
    })

    await prisma.auditLog.create({
      data: {
        user: 'Staff',
        action: `Invoice created for ${patient.name}: ₱${amount}`,
        resource: `Patient-${patient.id}`,
        severity: 'Info'
      }
    }).catch(() => {})

    return createdBill
  }
})
