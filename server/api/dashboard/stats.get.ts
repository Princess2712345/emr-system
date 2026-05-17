import { prisma } from '../../utils/prisma' // <-- Safe, centralized database instance

export default defineEventHandler(async (event) => {
  try {
    // 1. Query role counts from your PostgreSQL user table simultaneously
    const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } })
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    // 2. Fallback checks for optional operational tables using soft error catch blocks
    let totalAppointments = 0
    let pendingLabs = 0

    try { 
      totalAppointments = await prisma.appointment.count() 
    } catch (e) { 
      console.log("Appointment table empty or not yet migrated, falling back to 0") 
    }

    try { 
      pendingLabs = await prisma.labResult.count() 
    } catch (e) { 
      console.log("LabResult table empty or not yet migrated, falling back to 0") 
    }

    // 3. Return the fully formed data payload to your dashboard metrics cards
    return {
      success: true,
      data: {
        totalPatients,
        totalAdmins,
        todayAppointments: totalAppointments,
        pendingLabs: pendingLabs,
        unpaidInvoices: 0, // Placeholder metric
        updatedAt: new Date().toISOString()
      }
    }

  } catch (error: any) {
    console.error("Dashboard Analytics Server Error:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error.statusMessage || 'Could not fetch dashboard analytics metrics from PostgreSQL.',
    })
  }
})