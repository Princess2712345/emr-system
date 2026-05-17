import { prisma } from '../../utils/prisma' // <-- Points safely to your central engine

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password, uniqueId, role } = body

    // 1. Validate payload requirements
    if (!username || !password || !uniqueId || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required credentials.',
      })
    }

    // 2. Query the user with strict role and ID checks
    const user = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        password: password, // Note: Consider hashing this in production later!
        uniqueId: uniqueId.trim(),
        role: role.toUpperCase().trim()   
      }
    })

    // 3. Handle incorrect authentication attempts
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    // 4. Strip sensitive password data from response payload
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      authenticated: true,
      user: {
        ...userWithoutPassword,
        role: user.role || 'ADMIN'
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