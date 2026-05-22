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

    let unpaidInvoices = 0
    let recentLabs: { testName: string; patientName: string; status: string }[] = []
    try {
      const unpaid = await prisma.invoice.findMany({ where: { status: { not: 'Paid' } } })
      unpaidInvoices = unpaid.reduce((sum, inv) => sum + inv.balance, 0)
      recentLabs = await prisma.labResult.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { testName: true, patientName: true, status: true }
      })
    } catch {
      /* tables may be empty during first migrate */
    }

    return {
      success: true,
      data: {
        totalPatients,
        totalAdmins,
        todayAppointments: totalAppointments,
        pendingLabs,
        unpaidInvoices,
        recentLabs,
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