import { prisma } from '../../utils/prisma'
import { requireResolvedPatient } from '../../utils/resolvePatient'
import {
  buildDefaultInterpretation,
  buildDefaultResultDetails
} from '../../utils/labResultDetails'

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
      const {
        testName,
        category,
        colorClass,
        patientId,
        patientName,
        findings,
        interpretation,
        filePath,
        resultDetails: inputResultDetails,
        status: inputStatus
      } = body

      if (!testName || !category) {
        throw createError({ statusCode: 400, statusMessage: 'Test name and category are required.' })
      }

      const patient = await requireResolvedPatient({ patientId, patientName })
      const generatedRequestId = `#LAB-${Date.now().toString(36).toUpperCase()}`

      const hasManualLines = Array.isArray(inputResultDetails) && inputResultDetails.length > 0
      const resultLines = hasManualLines
        ? inputResultDetails
        : buildDefaultResultDetails(category)
      const recordStatus = inputStatus === 'Pending' ? 'Pending' : 'Completed'

      const newRecord = await prisma.labResult.create({
        data: {
          testName: testName.trim(),
          patientName: patient.name,
          category,
          requestId: generatedRequestId,
          colorClass: colorClass || 'teal',
          status: recordStatus,
          patientId: patient.id,
          uploadedBy: 'Clinical Lab',
          filePath: typeof filePath === 'string' && filePath.length ? filePath : null,
          findings: findings?.trim() || null,
          interpretation:
            interpretation?.trim()
            || (recordStatus === 'Completed'
              ? buildDefaultInterpretation(testName.trim(), category)
              : null),
          resultDetails: recordStatus === 'Completed' ? resultLines : undefined
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

      await prisma.auditLog.create({
        data: {
          user: 'Clinical Lab',
          action:
            recordStatus === 'Completed'
              ? `Your lab result "${testName.trim()}" is now available to view.`
              : `A new lab test "${testName.trim()}" was added to your record. Results are pending review.`,
          resource: `Patient-${patient.id}`,
          severity: 'PatientNotify'
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
