import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export default defineEventHandler(async (event) => {
  // 1. Define your local PostgreSQL connection string
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5433/emr_db"
  
  // 2. Set up the pg connection pool for driver adapter usage
  const pool = new pg.Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  
  // 3. Instantiate the Prisma Client explicitly using the adapter (Required for Prisma v7)
  const prisma = new PrismaClient({ adapter })

  try {
    // 4. Query row counts from your PostgreSQL tables simultaneously 
    // (If some tables don't exist yet, you can comment them out or return 0 temporarily)
    const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } })
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    // Fallback checks for optional tables if you haven't populated them yet
    let totalAppointments = 0
    let pendingLabs = 0

    try { totalAppointments = await prisma.appointment.count() } catch (e) { console.log("Appointment table empty or skipped") }
    try { pendingLabs = await prisma.labResult.count() } catch (e) { console.log("LabResult table empty or skipped") }

    // 5. Return the gathered payload data safely to the client side
    return {
      success: true,
      data: {
        totalPatients,
        totalAdmins,
        todayAppointments: totalAppointments,
        pendingLabs: pendingLabs,
        unpaidInvoices: 0 // Placeholder until your billing system is hooked up
      }
    }

  } catch (error: any) {
    console.error("Dashboard Analytics Server Error:", error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not fetch database metrics from PostgreSQL.',
    })
  } finally {
    // 6. CRITICAL: Always close the pool connection to prevent client resource leaks!
    await pool.end()
  }
})