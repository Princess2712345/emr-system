import { prisma } from '../../utils/prisma'
import { requireResolvedPatient } from '../../utils/resolvePatient'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    if (method === 'GET') {
      const query = getQuery(event)
      const search = (query.search as string || '').trim()
      const category = query.category as string || 'All'

      const whereClause: Record<string, unknown> = {}

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
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { id: true, email: true, name: true } } }
      })
    }

    if (method === 'POST') {
      const body = await readBody(event)
      const { testName, category, colorClass, patientId, patientName } = body

      if (!testName || !category) {
        throw createError({ statusCode: 400, statusMessage: 'Test name and category are required.' })
      }

      const patient = await requireResolvedPatient({ patientId, patientName })
      const generatedRequestId = `#LAB-${Date.now().toString(36).toUpperCase()}`

      const newRecord = await prisma.labResult.create({
        data: {
          testName: testName.trim(),
          patientName: patient.name,
          category,
          requestId: generatedRequestId,
          colorClass: colorClass || 'teal',
          status: 'Pending',
          patientId: patient.id,
          uploadedBy: 'Clinical Lab'
        }
      })

      await prisma.auditLog.create({
        data: {
          user: 'Staff',
          action: `Lab result uploaded for ${patient.name}: ${testName}`,
          resource: `Patient-${patient.id}`,
          severity: 'Info'
        }
      }).catch(() => {})

      return { success: true, record: newRecord }
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Lab API error:', error)
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Lab operation failed.'
    })
  }
})
