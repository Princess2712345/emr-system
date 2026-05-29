import { prisma } from '../utils/prisma'
import { requireResolvedPatient } from '../utils/resolvePatient'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { patientName, patientId, type, physician, uniqueId, email } = body

    if (!type || !physician) {
      throw createError({ statusCode: 400, statusMessage: 'Disposition type and physician are required.' })
    }

    const patient = await requireResolvedPatient({
      patientId,
      patientName,
      uniqueId,
      email
    })

    const createdRecord = await prisma.disposition.create({
      data: {
        patientName: patient.name,
        patientId: patient.id,
        type,
        physician: physician.trim()
      }
    })

    await prisma.auditLog.create({
      data: {
        user: 'Staff',
        action: `Disposition (${type}) recorded for ${patient.name}`,
        resource: `Patient-${patient.id}`,
        severity: 'Info'
      }
    }).catch(() => {})

    return { success: true, record: createdRecord }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Disposition write failed:', error)
    if (err.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to save disposition record.'
    })
  }
})
