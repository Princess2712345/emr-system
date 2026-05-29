import { prisma } from './prisma'

export type ResolvePatientInput = {
  patientId?: string
  patientName?: string
  email?: string
  uniqueId?: string
}

export async function resolvePatient(input: ResolvePatientInput) {
  const patientId = input.patientId?.trim()
  if (patientId) {
    const byId = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { userAccount: true }
    })
    if (byId) return byId
  }

  const uniqueId = input.uniqueId?.trim()
  if (uniqueId) {
    const byMrn = await prisma.patient.findFirst({
      where: { userAccount: { uniqueId } },
      include: { userAccount: true }
    })
    if (byMrn) return byMrn
  }

  const email = input.email?.toLowerCase().trim()
  if (email) {
    const byEmail = await prisma.patient.findUnique({
      where: { email },
      include: { userAccount: true }
    })
    if (byEmail) return byEmail
  }

  const patientName = input.patientName?.trim()
  if (patientName) {
    const byExactName = await prisma.patient.findFirst({
      where: { name: { equals: patientName, mode: 'insensitive' } },
      include: { userAccount: true }
    })
    if (byExactName) return byExactName

    const byPartialName = await prisma.patient.findFirst({
      where: { name: { contains: patientName, mode: 'insensitive' } },
      include: { userAccount: true }
    })
    if (byPartialName) return byPartialName
  }

  return null
}

export async function requireResolvedPatient(input: ResolvePatientInput) {
  const patient = await resolvePatient(input)
  if (!patient) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Patient not found in registry. Register the patient first.'
    })
  }
  return patient
}
