// server/api/admins/[id].put.ts
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 1. Grab the dynamic admin ID from the URL path parameter
    const adminId = getRouterParam(event, 'id')
    if (!adminId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing administrative target identifier.'
      })
    }

    // 2. Read the incoming update payload from the modal form
    const body = await readBody(event)
    const { firstName, lastName, role } = body

    if (!firstName || !lastName || !role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name, last name, and role are required fields.'
      })
    }

    // 3. Perform the update operation using a String type lookup
    const updatedUser = await prisma.user.update({
      where: { 
        id: adminId // <-- Fixed: Removed Number() conversion because your ID is a string!
      },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role.toUpperCase().trim()
      }
    })

    return {
      success: true,
      user: {
        id: updatedUser.id,
        role: updatedUser.role
      }
    }

  } catch (error: any) {
    console.error("Database Administrative Update Error:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error updating database user record.'
    })
  }
})