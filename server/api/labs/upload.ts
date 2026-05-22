import { prisma } from '../../utils/prisma' // <-- Exactly 3 levels up to reach your root utils path!

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  try {
    // === GET METHOD: FETCH RECORD MATCHES ===
    if (method === 'GET') {
      const query = getQuery(event)
      const search = (query.search as string || '').trim()
      const category = query.category as string || 'All'

      const whereClause: any = {}
      
      if (category !== 'All') {
        whereClause.category = category
      }
      
      if (search) {
        whereClause.OR = [
          { patientName: { contains: search, mode: 'insensitive' } },
          { testName: { contains: search, mode: 'insensitive' } },
          { requestId: { contains: search, mode: 'insensitive' } }
        ]
      }

      return await prisma.labResult.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      })
    }

    // === POST METHOD: LOG NEW LAB RECORDS ===
    if (method === 'POST') {
      const body = await readBody(event)
      const { testName, patientName, category, colorClass } = body

      if (!testName || !patientName || !category) {
        throw createError({ statusCode: 400, statusMessage: 'Incomplete payload items.' })
      }

      // 1. Search for the patient using the unified schema 'name' property
      let patient = await prisma.patient.findFirst({
        where: {
          name: { equals: patientName.trim(), mode: 'insensitive' }
        }
      })

      if (!patient) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Patient must be registered before lab results can be uploaded.'
        })
      }

      // 3. Generate a fresh lab tracking reference code
      const generatedRequestId = `#LAB-${Math.floor(Math.random() * 8999) + 1000}`

      // 4. Log the complete laboratory entry mapped tightly to the found or new patient ID
      const newRecord = await prisma.labResult.create({
        data: {
          testName,
          patientName,
          category,
          requestId: generatedRequestId,
          colorClass: colorClass || 'teal',
          status: 'Pending',
          patientId: patient.id
        }
      })

      return { success: true, record: newRecord }
    }

  } catch (error: any) {
    console.error("Database Endpoint Failure:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || "Internal database operational write failure."
    })
  }
})