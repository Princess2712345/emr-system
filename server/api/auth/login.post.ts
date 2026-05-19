// server/api/auth/login.post.ts
import { prisma } from '../../utils/prisma' 
import bcrypt from 'bcryptjs' // Import bcrypt to read the hashed password safely

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password, uniqueId, role } = body

    // 1. Validate payload requirements
    if (!username || !password || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required credentials.',
      })
    }

    const normalizedRole = role.toUpperCase().trim()

    // 2. Find the user based on their specific role requirements
    const user = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        role: normalizedRole,
        // 🔄 Conditional matching: Admin/Staff can bypass strict ID matching if needed, Patients remain strict
        ...(['ADMIN', 'HR', 'REGISTRAR'].includes(normalizedRole)
          ? uniqueId?.trim() 
            ? { uniqueId: uniqueId.trim() } // If an ID is provided, match it
            : {} // If no ID is provided, don't let it block the admin login
          : { uniqueId: uniqueId ? uniqueId.trim() : '' } // Patients MUST match their uniqueId
        )
      }
    })

    // 3. If user doesn't exist in the database, fail early
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    // 4. Validate the hashed password securely using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    // 5. Strip sensitive password data from response payload
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      authenticated: true,
      user: {
        ...userWithoutPassword,
        role: user.role // Returns the exact enum role from the database ('ADMIN', 'PATIENT', etc.)
      }
    }

  } catch (error: any) {
    console.error("Database Login Error Details:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error processing your login.',
    })
  }
})