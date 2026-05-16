import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5433/emr_db"
  const pool = new pg.Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    if (method === 'GET') {
      const query = getQuery(event)
      const search = (query.search as string || '').trim()
      const category = query.category as string || 'All'

      const whereClause: any = {}
      
      if (category !== 'All') {
        whereClause.category = category
      }
      
      if (search) {
        whereClause.OR = [
          { patientName: { contains: search, mode: 'insensitive' } },
          { testName: { contains: search, mode: 'insensitive' } },
          { requestId: { contains: search, mode: 'insensitive' } }
        ]
      }

      return await prisma.labResult.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      })
    }

    if (method === 'POST') {
      const body = await readBody(event)
      const { testName, patientName, category, colorClass } = body

      if (!testName || !patientName || !category) {
        throw createError({ statusCode: 400, statusMessage: 'Incomplete payload items.' })
      }

      let patient = await prisma.patient.findFirst({
        where: { name: { equals: patientName, mode: 'insensitive' } }
      })

      if (!patient) {
        const cleanEmail = `${patientName.toLowerCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}@example.com`
        patient = await prisma.patient.create({
          data: { name: patientName, email: cleanEmail, phone: "N/A" }
        })
      }

      const generatedRequestId = `#LAB-${Math.floor(Math.random() * 8999) + 1000}`

      const newRecord = await prisma.labResult.create({
        data: {
          testName,
          patientName,
          category,
          requestId: generatedRequestId,
          colorClass: colorClass || 'teal',
          status: 'Pending',
          patientId: patient.id
        }
      })

      return { success: true, record: newRecord }
    }

  } catch (error: any) {
    console.error("Database Endpoint Failure:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || "Internal database operational write failure."
    })
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
})