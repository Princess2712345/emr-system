import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Medication id required.' })
  }

  const body = await readBody(event)
  const existing = await prisma.patientMedication.findUnique({
    where: { id },
    include: { patient: { select: { id: true, name: true } } }
  })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Medication not found.' })
  }

  const discontinue = body?.discontinue === true || body?.status === 'Discontinued'

  const data: {
    name?: string
    dose?: string
    timing?: string
    prescribedBy?: string
    notes?: string | null
    status?: string
  } = {}

  if (discontinue) {
    data.status = 'Discontinued'
  } else {
    if (typeof body?.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (typeof body?.dose === 'string') data.dose = body.dose.trim()
    if (typeof body?.timing === 'string') data.timing = body.timing.trim()
    if (typeof body?.prescribedBy === 'string') data.prescribedBy = body.prescribedBy.trim()
    if (typeof body?.notes === 'string') data.notes = body.notes.trim() || null
  }

  const updated = await prisma.patientMedication.update({
    where: { id },
    data
  })

  if (discontinue) {
    await prisma.auditLog.create({
      data: {
        user: 'Care team',
        action: `${existing.name} was removed from your active medication list.`,
        resource: `Patient-${existing.patientId}`,
        severity: 'PatientNotify'
      }
    }).catch(() => {})
  }

  return {
    success: true,
    medication: {
      id: updated.id,
      name: updated.name,
      dose: updated.dose,
      timing: updated.timing,
      prescribedBy: updated.prescribedBy || '',
      status: updated.status,
      notes: updated.notes || ''
    },
    message: discontinue
      ? `${existing.name} discontinued.`
      : 'Medication updated.'
  }
})
