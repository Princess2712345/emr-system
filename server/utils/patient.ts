import { prisma } from './prisma'

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } })
}

export async function getPatientByUserId(userId: string) {
  const user = await getUserById(userId)
  if (!user) return null
  return prisma.patient.findUnique({
    where: { email: user.email },
    include: { userAccount: true }
  })
}

export async function requirePatientContext(userId: string) {
  const user = await getUserById(userId)
  if (!user || user.role !== 'PATIENT') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Patient session required.'
    })
  }
  let patient = await prisma.patient.findUnique({ where: { email: user.email } })

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: 'N/A',
        status: 'Active'
      }
    })
  }

  return { user, patient }
}
