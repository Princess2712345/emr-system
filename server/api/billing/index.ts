import { PrismaClient } from 'db-client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // 1. Handle live searches & status filter combinations
  if (method === 'GET') {
    const search = (query.search as string) || ''
    const status = (query.status as string) || 'All'

    // Build conditions dynamically
    const whereCondition: any = {}
    
    if (status !== 'All') {
      whereCondition.status = status
    }

    if (search.trim() !== '') {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { patientName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const databaseInvoices = await prisma.invoice.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }
    })

    // Compute aggregations across metrics
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

  // 2. Handle standard new generation creations
  if (method === 'POST') {
    // Fixed: Passing 'event' context properly into readBody
    const body = await readBody(event) 
    
    // Look up patient to pull core relationship ID
    const targetedPatient = await prisma.patient.findFirst({
      where: { name: { contains: body.patientName, mode: 'insensitive' } }
    })

    if (!targetedPatient) {
      throw createError({ statusCode: 404, statusMessage: 'Patient registry target profiling missing.' })
    }

    const createdBill = await prisma.invoice.create({
      data: {
        patientId: targetedPatient.id,
        patientName: targetedPatient.name,
        amount: parseFloat(body.amount || 150.00),
        balance: parseFloat(body.amount || 150.00),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date 7 days out
        status: 'Unpaid'
      }
    })

    return createdBill
  }
})