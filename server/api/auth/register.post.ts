import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from 'db-client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 1. Parse incoming parameters from the frontend form payload
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
      bloodType
    } = body

    // 2. Strict validation check for mandatory parameters
    if (!email || !password || !firstName || !lastName || !uniqueId || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing mandatory registration field attributes.'
      })
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    // Fallback auto-generated username from the email prefix if it wasn't supplied explicitly
    const baseUsername = username ? username.trim() : normalizedEmail.split('@')[0]

    // 3. Multi-risk lookups: Prevent any duplicate entries cleanly across unique bounds
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

    // 4. Safely parse and normalize incoming roles to fit system string structures
    let normalizedRole = 'ADMIN'
    const cleanRole = role.toUpperCase().trim()

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

    // 5. Securely hash the text password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. Database Transaction: Ensures safe isolated atomic operations
    const transactionResult = await prisma.$transaction(async (tx) => {
      
      // Step A: Write primary Auth Identity User row
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          username: baseUsername.toLowerCase(),
          password: hashedPassword,
          firstName: firstName.trim(),
          middleName: middleName ? middleName.trim() : null,
          lastName: lastName.trim(),
          uniqueId: uniqueId.trim(),
          age: age ? parseInt(age) : 24,
          bloodType: bloodType || "O Positive",
          role: normalizedRole,
          status: 'Active'
        }
      })

      // Step B: Relational Clinical Anchor creation ONLY triggered for true PATIENT profiles
      let clinicalProfile = null
      if (normalizedRole === 'PATIENT') {
        clinicalProfile = await tx.patient.create({
          data: {
            email: normalizedEmail,
            name: `${firstName.trim()} ${lastName.trim()}`,
            phone: body.phone || "N/A",
            status: 'Active'
          }
        })
      }

      return { newUser, clinicalProfile }
    })

    // 7. Record Audit Log: Trace backend tracking entries beautifully
    await prisma.auditLog.create({
      data: {
        user: 'System',
        action: `Registered new account: ${transactionResult.newUser.username} (${transactionResult.newUser.role})`,
        resource: `User-${transactionResult.newUser.id}`,
        severity: 'Info'
      }
    })

    // 8. Return data map cleanly back to frontend dashboards
    return {
      success: true,
      message: 'Account successfully registered to directory database.',
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
      }
    }

  } catch (error: any) {
    console.error('Unified registration endpoint failure:', error)
    
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Registration conflict: Unique constraint violation on account write.'
      })
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to complete operational registration write.'
    })
  }
})