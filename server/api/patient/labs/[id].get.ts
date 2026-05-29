import { prisma } from '../../../utils/prisma'
import { requirePatientContext } from '../../../utils/patient'
import { enrichLabRecord } from '../../../utils/labResultDetails'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string
  const labId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }
  if (!labId) {
    throw createError({ statusCode: 400, statusMessage: 'Lab result id required.' })
  }

  const { patient } = await requirePatientContext(userId)

  const lab = await prisma.labResult.findFirst({
    where: { id: labId, patientId: patient.id }
  })

  if (!lab) {
    throw createError({ statusCode: 404, statusMessage: 'Lab result not found.' })
  }

  const detail = enrichLabRecord(lab)

  return {
    success: true,
    record: {
      id: lab.id,
      name: lab.testName,
      category: lab.category,
      type: lab.category,
      requestId: lab.requestId,
      status: lab.status,
      resultStatus: lab.status === 'Pending' ? 'Pending Review' : lab.status,
      date: new Date(lab.dateReported).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      dateReported: lab.dateReported,
      doctor: lab.uploadedBy || 'Clinical Lab',
      patientName: lab.patientName,
      filePath: lab.filePath,
      colorClass: lab.colorClass,
      ...detail
    }
  }
})
