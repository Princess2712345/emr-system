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
  const patient = await prisma.patient.findUnique({ where: { email: user.email } })
  if (!patient) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Clinical patient profile not linked to this account.'
    })
  }
  return { user, patient }
}
