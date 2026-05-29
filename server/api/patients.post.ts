import { prisma } from '../utils/prisma'
import { registerPatientAccount } from '../utils/patientRegistry'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      uniqueId,
      age,
      bloodType,
      phone,
      gender,
      birthDate
    } = body

    if (!email || !password || !firstName || !lastName || !uniqueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, password, first name, last name, and patient ID are required.'
      })
    }

    const { newUser, clinicalProfile } = await registerPatientAccount({
      email,
      password,
      firstName,
      middleName,
      lastName,
      uniqueId,
      age: age != null ? parseInt(age) : undefined,
      bloodType,
      phone,
      gender,
      birthDate
    })

    await prisma.auditLog.create({
      data: {
        user: 'System',
        action: `Registered patient clinical profile: ${clinicalProfile.name}`,
        resource: `Patient-${clinicalProfile.id}`,
        severity: 'Info'
      }
    })

    return {
      success: true,
      message: 'Patient profile created in database.',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        uniqueId: newUser.uniqueId,
        role: newUser.role
      },
      patient: clinicalProfile
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; code?: string; message?: string }

    if (err.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: 'A patient with this email or ID already exists.'
      })
    }

    if (err.statusCode) throw error

    console.error('Patient creation failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to create patient record.'
    })
  }
})
