// server/api/patients.get.ts
import { prisma } from '../utils/prisma' // Using a direct relative path bypasses Nuxt's alias system completely

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string || '').toLowerCase().trim()

    // Query Prisma using insensitive mode for smoother search matching
    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: 'desc' }
    })

    // Fixed the typo here: (patient) instead of (patienlt)
    return patients.map((patient: any) => {
      const fullName = `${patient.firstName} ${patient.lastName}`
      
      return {
        id: patient.id,
        name: fullName,
        email: patient.email,
        patientId: patient.uniqueId || `#PAT-${String(patient.id).slice(0, 4).toUpperCase()}`,
        status: patient.status || 'Active',
        date: new Date(patient.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve patient records from database.'
    })
  }
})