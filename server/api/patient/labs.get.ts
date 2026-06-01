import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'
import { enrichLabRecord } from '../../utils/labResultDetails'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const { user, patient } = await requirePatientContext(userId)

  const labs = await prisma.labResult.findMany({
    where: { patientId: patient.id },
    orderBy: { dateReported: 'desc' }
  })

  const categoryMap: Record<string, string> = {
    Laboratory: 'Labs',
    Imaging: 'Imaging',
    Report: 'Reports'
  }

  const records = labs.map((lab) => {
    const detail = enrichLabRecord(lab)
    return {
      id: lab.id,
      name: lab.testName,
      type: categoryMap[lab.category] || lab.category,
      category: lab.category,
      colorClass: lab.colorClass,
      date: new Date(lab.dateReported).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      doctor: lab.uploadedBy || 'Clinical Lab',
      resultStatus: lab.status === 'Pending' ? 'Pending Review' : lab.status,
      status: lab.status,
      requestId: lab.requestId,
      filePath: lab.filePath,
      pending: detail.pending,
      hasDetails: !detail.pending && detail.lines.length > 0
    }
  })

  const medRows = await prisma.patientMedication.findMany({
    where: { patientId: patient.id, status: 'Active' },
    orderBy: { createdAt: 'asc' }
  })

  const medications = medRows.map((m) => ({
    id: m.id,
    name: m.name,
    dose: m.dose,
    timing: m.timing,
    prescribedBy: m.prescribedBy || ''
  }))

  const latestRefill = await prisma.medicationRefill.findFirst({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' }
  })

  return {
    success: true,
    bloodType: user.bloodType || 'O Positive',
    allergies: patient.allergies || 'Review with care team',
    lastBp: '118/76',
    activeMeds: medications.length,
    medications,
    records,
    refillRequest: latestRefill
      ? {
          id: latestRefill.id,
          requestRef: `RX-${latestRefill.id.slice(0, 8).toUpperCase()}`,
          status: latestRefill.status,
          medications: Array.isArray(latestRefill.medications) ? latestRefill.medications : [],
          medSummary: (Array.isArray(latestRefill.medications) ? latestRefill.medications : []).join(', '),
          notes: latestRefill.notes || '',
          requestedAt: new Date(latestRefill.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })
        }
      : null
  }
})
