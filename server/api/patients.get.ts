import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string || '').toLowerCase().trim()

    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { userAccount: { uniqueId: { contains: search, mode: 'insensitive' } } },
          { userAccount: { firstName: { contains: search, mode: 'insensitive' } } },
          { userAccount: { lastName: { contains: search, mode: 'insensitive' } } }
        ]
      } : {},
      include: { userAccount: true },
      orderBy: { createdAt: 'desc' }
    })

    return patients.map((patient) => {
      const ua = patient.userAccount
      const displayName = patient.name || (ua ? `${ua.firstName} ${ua.lastName}` : 'Unknown')
      return {
        id: patient.id,
        name: displayName,
        email: patient.email,
        phone: patient.phone,
        patientId: ua?.uniqueId || `#PAT-${patient.id.slice(0, 8).toUpperCase()}`,
        uniqueId: ua?.uniqueId,
        firstName: ua?.firstName,
        lastName: ua?.lastName,
        middleName: ua?.middleName,
        bloodType: ua?.bloodType,
        age: ua?.age,
        gender: ua ? 'Logged' : 'N/A',
        status: patient.status || 'Active',
        userAccount: ua,
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
