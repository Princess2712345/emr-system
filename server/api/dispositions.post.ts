// server/api/dispositions.post.ts
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { patientName, patientId, type, physician } = body

    if (!patientName || !patientId || !type || !physician) {
      throw createError({ statusCode: 400, statusMessage: 'All fields are strictly required.' })
    }

    const createdRecord = await prisma.disposition.create({
      data: {
        patientName: patientName.trim(),
        patientId: patientId.trim(),
        type,
        physician: physician.trim()
      }
    })

    return { success: true, record: createdRecord }

  } catch (error: any) {
    console.error('Failed to write operational database entry:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      statusMessage: error.statusMessage || 'Failed to complete operational database entry write.' 
    })
  }
})