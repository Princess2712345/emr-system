import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export type RegisterPatientInput = {
  email: string
  password: string
  firstName: string
  middleName?: string | null
  lastName: string
  uniqueId: string
  age?: number
  bloodType?: string
  phone?: string
  gender?: string
  birthDate?: string | Date | null
  username?: string
}

function parseBirthDate(value?: string | Date | null) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function registerPatientAccount(input: RegisterPatientInput) {
  const normalizedEmail = input.email.toLowerCase().trim()
  const baseUsername = (input.username || normalizedEmail.split('@')[0]).toLowerCase().trim()
  const uniqueId = input.uniqueId.trim()

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { username: baseUsername },
        { uniqueId }
      ]
    }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User credentials (Email, Username, or unique ID) are already registered.'
    })
  }

  const hashedPassword = await bcrypt.hash(input.password, 10)
  const birthDate = parseBirthDate(input.birthDate)
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`

  return prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        username: baseUsername,
        password: hashedPassword,
        firstName: input.firstName.trim(),
        middleName: input.middleName?.trim() || null,
        lastName: input.lastName.trim(),
        uniqueId,
        age: input.age ?? 24,
        bloodType: input.bloodType || 'O Positive',
        role: 'PATIENT',
        status: 'Active'
      }
    })

    const clinicalProfile = await tx.patient.create({
      data: {
        email: normalizedEmail,
        name: fullName,
        phone: input.phone?.trim() || 'N/A',
        gender: input.gender?.trim() || null,
        birthDate,
        status: 'Active'
      }
    })

    return { newUser, clinicalProfile }
  })
}
