import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, uniqueId, role } = body

  if (!username || !password || !uniqueId || !role) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required credentials.',
    })
  }

  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5433/emr_db"
  
  const pool = new pg.Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        password: password, 
        uniqueId: uniqueId,       // 🚀 FIXED: Changed from 'id' to 'uniqueId' to match registration
        role: role.toUpperCase()   
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Username, Password, or ID.',
      })
    }

    const { password: _, ...userWithoutPassword } = user
    return {
      authenticated: true,
      user: userWithoutPassword
    }

  } catch (error: any) {
    console.error("Database Login Error Details:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error processing your login.',
    })
  } finally {
    await pool.end()
  }
})