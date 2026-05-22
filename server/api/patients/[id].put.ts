import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const patientId = getRouterParam(event, 'id')
  if (!patientId) {
    throw createError({ statusCode: 400, statusMessage: 'Patient id required.' })
  }

  const body = await readBody(event)
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { userAccount: true }
  })

  if (!patient) {
    throw createError({ statusCode: 404, statusMessage: 'Patient not found.' })
  }

  const fullName = body.name
    || `${(body.firstName || patient.userAccount?.firstName || '').trim()} ${(body.lastName || patient.userAccount?.lastName || '').trim()}`.trim()

  await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id: patientId },
      data: {
        name: fullName || patient.name,
        phone: body.phone ?? patient.phone,
        status: body.status ?? patient.status
      }
    })

    if (patient.userAccount) {
      await tx.user.update({
        where: { id: patient.userAccount.id },
        data: {
          firstName: body.firstName?.trim() ?? patient.userAccount.firstName,
          middleName: body.middleName?.trim() ?? patient.userAccount.middleName,
          lastName: body.lastName?.trim() ?? patient.userAccount.lastName,
          uniqueId: body.uniqueId?.trim() ?? patient.userAccount.uniqueId,
          age: body.age != null ? parseInt(body.age) : patient.userAccount.age,
          bloodType: body.bloodType ?? patient.userAccount.bloodType
        }
      })
    }
  })

  const refreshed = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { userAccount: true }
  })

  return { success: true, patient: refreshed }
})
