import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // This fetches all patients from your PostgreSQL database
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return patients
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch patients',
    })
  }
})