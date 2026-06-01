import { prisma } from '../../utils/prisma'

const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR']
const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body?.userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User id required.' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !STAFF_ROLES.includes(user.role)) {
      throw createError({ statusCode: 403, statusMessage: 'Staff session required.' })
    }

    let avatar: string | null | undefined
    if (typeof body.avatar === 'string') {
      avatar = body.avatar.trim() ? body.avatar : null
    }

    const typedAge = Number.parseInt(String(body.age ?? ''), 10)
    const nextAge = Number.isFinite(typedAge) && typedAge >= 0 && typedAge <= 130 ? typedAge : user.age

    // Username: normalize, validate, and ensure uniqueness
    let nextUsername = user.username
    const rawUsername = clean(body.username).toLowerCase()
    if (rawUsername && rawUsername !== user.username) {
      if (rawUsername.length < 3) {
        throw createError({ statusCode: 400, statusMessage: 'Username must be at least 3 characters.' })
      }
      const taken = await prisma.user.findFirst({
        where: { username: rawUsername, NOT: { id: user.id } }
      })
      if (taken) {
        throw createError({ statusCode: 409, statusMessage: 'That username is already taken.' })
      }
      nextUsername = rawUsername
    }

    // Role: only allow switching between Administrator and Doctor
    const SELECTABLE_ROLES = ['ADMIN', 'DOCTOR']
    let nextRole = user.role
    const rawRole = clean(body.role).toUpperCase()
    if (rawRole && rawRole !== user.role && SELECTABLE_ROLES.includes(rawRole)) {
      nextRole = rawRole
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: clean(body.firstName) || user.firstName,
        middleName: clean(body.middleName) || null,
        lastName: clean(body.lastName) || user.lastName,
        username: nextUsername,
        role: nextRole,
        phone: clean(body.phone) || null,
        bloodType: clean(body.bloodType) || user.bloodType,
        age: nextAge,
        ...(avatar !== undefined ? { avatar } : {})
      }
    })

    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Admin profile PUT error:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to save profile.'
    })
  }
})
