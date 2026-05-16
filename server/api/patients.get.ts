import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export default defineEventHandler(async (event) => {
  // Setup the connection pool for Postgres
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  
  // Initialize the client WITH the adapter
  const prisma = new PrismaClient({ adapter })

  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return patients
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed',
    })
  } finally {
    // Optional: await pool.end() if you want to close connections immediately
  }
})