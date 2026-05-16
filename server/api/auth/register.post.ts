import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password, firstName, middleName, lastName, uniqueId, role } = body

  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5433/emr_db"
  
  const pool = new pg.Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
          { uniqueId: uniqueId }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User credentials already registered.'
      })
    }

    // Create the user record
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: password, 
        firstName: firstName,
        middleName: middleName || null,
        lastName: lastName,
        uniqueId: uniqueId,          // 🚀 Matches your database column field
        role: role.toUpperCase() 
      }
    })

    return {
      success: true,
      user: { username: newUser.username, role: newUser.role }
    }

  } catch (error: any) {
    console.error("Database Registration Error:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  } finally {
    await pool.end()
  }
})