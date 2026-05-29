import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from 'db-client'
import bcrypt from 'bcryptjs'
import { registerPatientAccount } from '../../utils/patientRegistry'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      uniqueId,
      role,
      age,
      bloodType,
      phone,
      gender,
      birthDate
    } = body

    if (!email || !password || !firstName || !lastName || !uniqueId || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing mandatory registration field attributes.'
      })
    }

    const cleanRole = role.toUpperCase().trim()
    let normalizedRole = 'ADMIN'

    if (cleanRole.includes('HUMAN') || cleanRole === 'HR') {
      normalizedRole = 'HR'
    } else if (cleanRole.includes('REGISTRAR')) {
      normalizedRole = 'REGISTRAR'
    } else if (cleanRole.includes('PATIENT')) {
      normalizedRole = 'PATIENT'
    } else if (cleanRole.includes('DOCTOR')) {
      normalizedRole = 'DOCTOR'
    } else {
      normalizedRole = 'ADMIN'
    }

    if (normalizedRole === 'PATIENT') {
      const transactionResult = await registerPatientAccount({
        email,
        password,
        firstName,
        middleName,
        lastName,
        uniqueId,
        age: age ? parseInt(age) : undefined,
        bloodType,
        phone: body.phone,
        gender,
        birthDate,
        username
      })

      await prisma.auditLog.create({
        data: {
          user: 'System',
          action: `Registered new patient account: ${transactionResult.newUser.username}`,
          resource: `User-${transactionResult.newUser.id}`,
          severity: 'Info'
        }
      })

      return {
        success: true,
        message: 'Patient account and clinical profile registered.',
        user: {
          id: transactionResult.newUser.id,
          email: transactionResult.newUser.email,
          username: transactionResult.newUser.username,
          firstName: transactionResult.newUser.firstName,
          lastName: transactionResult.newUser.lastName,
          uniqueId: transactionResult.newUser.uniqueId,
          role: transactionResult.newUser.role,
          status: transactionResult.newUser.status,
          createdAt: transactionResult.newUser.createdAt
        },
        patient: transactionResult.clinicalProfile
      }
    }

    const normalizedEmail = email.toLowerCase().trim()
    const baseUsername = username ? username.trim() : normalizedEmail.split('@')[0]

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: baseUsername.toLowerCase() },
          { uniqueId: uniqueId.trim() }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User credentials (Email, Username, or unique ID) are already registered.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: baseUsername.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        middleName: middleName ? middleName.trim() : null,
        lastName: lastName.trim(),
        uniqueId: uniqueId.trim(),
        age: age ? parseInt(age) : 24,
        bloodType: bloodType || 'O Positive',
        role: normalizedRole,
        status: 'Active'
      }
    })

    await prisma.auditLog.create({
      data: {
        user: 'System',
        action: `Registered new account: ${newUser.username} (${newUser.role})`,
        resource: `User-${newUser.id}`,
        severity: 'Info'
      }
    })

    return {
      success: true,
      message: 'Account successfully registered to directory database.',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        uniqueId: newUser.uniqueId,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; code?: string; message?: string }
    console.error('Unified registration endpoint failure:', error)

    if (err.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Registration conflict: Unique constraint violation on account write.'
      })
    }

    if (err.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to complete operational registration write.'
    })
  }
})
