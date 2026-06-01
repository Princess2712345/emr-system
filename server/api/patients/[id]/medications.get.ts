import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
  const patientId = getRouterParam(event, 'id')
  if (!patientId) {
    throw createError({ statusCode: 400, statusMessage: 'Patient id required.' })
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { userAccount: { select: { uniqueId: true, firstName: true, lastName: true } } }
  })
  if (!patient) {
    throw createError({ statusCode: 404, statusMessage: 'Patient not found.' })
  }

  if (!prisma.patientMedication) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database client out of date. Stop the dev server, run npx prisma generate, then npm run dev.'
    })
  }

  let rows = await prisma.patientMedication.findMany({
    where: { patientId },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
  })

  const activeRows = rows.filter((m) => m.status === 'Active')
  if (activeRows.length === 0) {
    const latestRefill = await prisma.medicationRefill.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    })
    const fromRefill = Array.isArray(latestRefill?.medications)
      ? (latestRefill.medications as string[]).filter((n) => typeof n === 'string' && n.trim())
      : []
    if (fromRefill.length) {
      const defaults: Record<string, { dose: string; timing: string }> = {
        Lisinopril: { dose: '10 mg', timing: 'Once daily (morning)' },
        Atorvastatin: { dose: '20 mg', timing: 'Once daily (evening)' },
        Metformin: { dose: '500 mg', timing: 'Twice daily with meals' }
      }
      for (const name of fromRefill) {
        const d = defaults[name] || { dose: 'As directed', timing: 'As directed' }
        await prisma.patientMedication.create({
          data: {
            patientId,
            name,
            dose: d.dose,
            timing: d.timing,
            prescribedBy: 'Imported from refill history',
            status: 'Active'
          }
        }).catch(() => {})
      }
      rows = await prisma.patientMedication.findMany({
        where: { patientId },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
      })
    }
  }

  const ua = patient.userAccount
  return {
    success: true,
    patient: {
      id: patient.id,
      name: patient.name || (ua ? `${ua.firstName} ${ua.lastName}` : 'Patient'),
      mrn: ua?.uniqueId || null,
      email: patient.email,
      avatar: patient.avatar || ''
    },
    medications: rows.map((m) => ({
      id: m.id,
      name: m.name,
      dose: m.dose,
      timing: m.timing,
      prescribedBy: m.prescribedBy || '',
      status: m.status,
      notes: m.notes || '',
      addedAt: new Date(m.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    })),
    activeCount: rows.filter((m) => m.status === 'Active').length
  }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string }
    if (err.statusCode) throw error
    console.error('Load patient medications failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: err.statusMessage || 'Could not load medications. Restart the dev server after npx prisma generate.'
    })
  }
})
