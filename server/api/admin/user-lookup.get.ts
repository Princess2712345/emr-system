import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string | undefined
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      uniqueId: true,
      role: true
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found.' })
  }

  const isPatient = (user.role || '').toUpperCase() === 'PATIENT'

  return {
    success: true,
    account: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      username: user.username,
      uniqueId: user.uniqueId,
      role: user.role,
      idLabel: isPatient ? 'MRN #' : 'Staff #'
    }
  }
})
