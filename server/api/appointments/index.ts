import { PrismaClient } from 'db-client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)

  // 1. GET: Fetch appointments for the dashboard
  if (method === 'GET') {
    const databaseAppointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' }
    })
    return databaseAppointments
  }

  // 2. POST: Handle New Sidebar Bookings
  if (method === 'POST') {
    const body = await readBody(event)

    // Look up the patient profile to link the relation ID
    const targetedPatient = await prisma.patient.findFirst({
      where: { name: { contains: body.name, mode: 'insensitive' } }
    })

    if (!targetedPatient) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Patient record not found. Please register the patient first.' 
      })
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        date: new Date(body.date), // Expects "YYYY-MM-DD" layout strings
        time: body.time,
        reason: body.reason || 'General Consultation',
        status: 'Pending',
        patientId: targetedPatient.id,
        patientName: targetedPatient.name
      }
    })

    return newAppointment
  }
})