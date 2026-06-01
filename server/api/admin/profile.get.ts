import { prisma } from '../../utils/prisma'

const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR']

const roleLabel = (role: string) => (role === 'DOCTOR' ? 'Doctor #' : 'Staff #')

export default defineEventHandler(async (event) => {
  try {
    const userId = getQuery(event).userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User id required.' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !STAFF_ROLES.includes(user.role)) {
      throw createError({ statusCode: 403, statusMessage: 'Staff session required.' })
    }

    return {
      success: true,
      profile: {
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        username: user.username,
        uniqueId: user.uniqueId,
        idLabel: roleLabel(user.role),
        role: user.role,
        status: user.status,
        memberSince: user.createdAt,
        age: user.age ?? null,
        bloodType: user.bloodType || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      }
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Admin profile GET error:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to load profile.'
    })
  }
})
