import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password, uniqueId, role } = body

    // 1. Core requirement validation
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required credentials.',
      })
    }

    const cleanIdentifier = username.trim().toLowerCase()
    const inputUniqueId = uniqueId ? uniqueId.trim() : ''
    const inputRole = role ? role.toUpperCase().trim() : ''

    // 2. Locate the user solely by their unique identity attributes (Email or Username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanIdentifier },
          { email: cleanIdentifier }
        ]
      }
    })

    // 3. Fail early if account doesn't exist anywhere in the directory
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    // 4. Validate the hashed password securely using bcrypt comparisons
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    // 5. POST-MATCH VALIDATION: Verify uniqueId matching depending on user status
    const actualRole = user.role.toUpperCase()

    if (actualRole === 'PATIENT') {
      // Patients MUST have a matching Unique ID (MRN)
      if (user.uniqueId.trim() !== inputUniqueId) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid Username, Password, or ID.',
        })
      }
    } else {
      // For Staff/Admins, if they passed a uniqueId, validate it. 
      // If the login interface forced an ID input, cross-check it against the DB record.
      if (inputUniqueId && user.uniqueId.trim() !== inputUniqueId) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid Username, Password, or ID.',
        })
      }
    }

    // 6. Strip sensitive password data from response payload cleanly
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      authenticated: true,
      message: 'Authentication successful.',
      user: {
        ...userWithoutPassword,
        role: user.role // Emits the true database string ('ADMIN', 'HR', 'REGISTRAR', 'PATIENT')
      }
    }

  } catch (error: any) {
    console.error("Database Login Error Details:", error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error processing your login.',
    })
  }
})