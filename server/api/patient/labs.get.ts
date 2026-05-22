import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

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

  const records = labs.map((lab) => ({
    name: lab.testName,
    type: categoryMap[lab.category] || lab.category,
    date: new Date(lab.dateReported).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    doctor: lab.uploadedBy || 'Clinical Lab',
    resultStatus: lab.status === 'Pending' ? 'Pending Review' : lab.status,
    requestId: lab.requestId,
    filePath: lab.filePath
  }))

  return {
    success: true,
    bloodType: user.bloodType || 'O Positive',
    allergies: 'Review with care team',
    lastBp: '118/76',
    activeMeds: 0,
    records
  }
})
