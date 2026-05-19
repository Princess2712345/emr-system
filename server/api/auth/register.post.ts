// server/api/auth/register.post.ts
import { prisma } from '../../utils/prisma' // Up two levels from auth/ to reach utils
import bcrypt from 'bcryptjs'

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
      role 
    } = body

    // 1. Mandatory field validation check (allowing middleName to be optional)
    if (!username || !email || !password || !firstName || !lastName || !uniqueId || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All registration fields except middle name are required.'
      })
    }

    // 2. Multi-risk unique credential check (Immediate, clean user feedback)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { username: username.trim() },
          { uniqueId: uniqueId.trim() }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User credentials (Email, Username, or Admin ID) are already registered.'
      })
    }

    // 3. Map the frontend dropdown strings (like 'HUMAN RESOURCES') to your enum shapes
    let normalizedRole: 'ADMIN' | 'HR' | 'REGISTRAR' | 'PATIENT' = 'ADMIN'
    const cleanRole = role.toUpperCase().trim()

    if (cleanRole.includes('HUMAN') || cleanRole === 'HR') {
      normalizedRole = 'HR'
    } else if (cleanRole.includes('REGISTRAR')) {
      normalizedRole = 'REGISTRAR'
    } else if (cleanRole.includes('PATIENT')) {
      normalizedRole = 'PATIENT'
    } else {
      normalizedRole = 'ADMIN'
    }

    // 4. Securely hash the text password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Write cleanly into your PostgreSQL table using your exact schema properties
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        middleName: middleName ? middleName.trim() : null,
        lastName: lastName.trim(),
        uniqueId: uniqueId.trim(),
        role: normalizedRole // Emits 'HR', 'REGISTRAR', or 'ADMIN' safely
      }
    })

    // 6. RECORD LOG ENTRY: Log the successful account registration to your history tracking table
    await prisma.auditLog.create({
      data: {
        user: 'System', // Since the account is brand new, the action is initially handled by the registration engine
        action: `Registered new staff account: ${newUser.username} (${newUser.role})`,
        resource: `User-${newUser.id}`,
        severity: 'Info' // Logged as general audit information
      }
    })

    // 7. Return clean feedback payload to the user dashboard table
    return {
      success: true,
      message: 'Account successfully registered to directory database.',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    }

  } catch (error: any) {
    console.error('Registration backend validation error:', error)
    
    // Safety fallback block for race-condition database collisions
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Registration conflict: This account data is already registered.'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to complete operational registration write.'
    })
  }
})