import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
  const patientId = getRouterParam(event, 'id')
  if (!patientId) {
    throw createError({ statusCode: 400, statusMessage: 'Patient id required.' })
  }

  if (!prisma.patientMedication) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database client out of date. Stop the dev server, run npx prisma generate, then npm run dev.'
    })
  }

  const body = await readBody(event)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const dose = typeof body?.dose === 'string' ? body.dose.trim() : ''
  const timing = typeof body?.timing === 'string' ? body.timing.trim() : ''
  const prescribedBy = typeof body?.prescribedBy === 'string' ? body.prescribedBy.trim() : 'Clinical staff'
  const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Medication name is required.' })
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } })
  if (!patient) {
    throw createError({ statusCode: 404, statusMessage: 'Patient not found.' })
  }

  const med = await prisma.patientMedication.create({
    data: {
      patientId,
      name,
      dose: dose || 'As directed',
      timing: timing || 'As directed',
      prescribedBy: prescribedBy || 'Clinical staff',
      notes: notes || null,
      status: 'Active'
    }
  })

  await prisma.auditLog.create({
    data: {
      user: patient.name,
      action: `Prescription added: ${name}${dose ? ` ${dose}` : ''}`,
      resource: `Patient-${patientId}`,
      severity: 'Info'
    }
  }).catch(() => {})

  await prisma.auditLog.create({
    data: {
      user: 'Care team',
      action: `A new medication (${name}) was added to your health record by your care team.`,
      resource: `Patient-${patientId}`,
      severity: 'PatientNotify'
    }
  }).catch(() => {})

  return {
    success: true,
    medication: {
      id: med.id,
      name: med.name,
      dose: med.dose,
      timing: med.timing,
      prescribedBy: med.prescribedBy || '',
      status: med.status,
      notes: med.notes || ''
    },
    message: `${name} added to ${patient.name}'s active medications.`
  }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string }
    if (err.statusCode) throw error
    console.error('Add patient medication failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: err.statusMessage || 'Could not add medication. Restart the dev server after running npx prisma generate.'
    })
  }
})
