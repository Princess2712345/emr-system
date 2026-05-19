// server/api/dispositions.get.ts
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string || '').toLowerCase().trim()

    // Query database with clean filters matching your custom searching properties
    const data = await prisma.disposition.findMany({
      where: {
        OR: [
          { patientName: { contains: search, mode: 'insensitive' } },
          { patientId: { contains: search, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map database shape to match your frontend table keys exactly
    return data.map(item => ({
      id: item.id,
      patientName: item.patientName,
      patientId: item.patientId,
      type: item.type,
      physician: item.physician,
      dateTime: item.dateTime.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ' -')
    }))

  } catch (error) {
    console.error('Failed to stream dispositions data:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Database Retrieval Error.' })
  }
})