import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, uniqueId, role } = body

  // Fallback connection string ensures it works even if .env is missing
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5433/emr_db"
  
  const pool = new pg.Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        password: password, 
        uniqueId: uniqueId,
        // Matches the 'ADMIN' or 'PATIENT' case in your Prisma Studio
        role: role.toUpperCase() 
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    // Success! Return the user data (excluding the password)
    const { password: _, ...userWithoutPassword } = user
    return {
      authenticated: true,
      user: userWithoutPassword
    }

  } catch (error: any) {
    // Check your VS Code terminal to see this specific error!
    console.error("Database Login Error:", error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  } finally {
    // Close the connection to avoid "too many clients" errors
    await pool.end()
  }
})