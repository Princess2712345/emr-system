import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const identifier = (body?.identifier as string | undefined)?.trim().toLowerCase() || ''
  const lastName = (body?.lastName as string | undefined)?.trim().toLowerCase() || ''
  const role = (body?.role as string | undefined)?.toUpperCase().trim() || 'PATIENT'

  if (!identifier || !lastName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide your username/email and last name.'
    })
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }]
    }
  })

  // Generic response to avoid leaking which accounts exist
  const genericMessage =
    'If the details match our records, an administrator will be notified and will reach out with your ID shortly.'

  if (!user || user.lastName.trim().toLowerCase() !== lastName) {
    return { success: true, message: genericMessage }
  }

  const label = role === 'PATIENT' ? 'MRN #' : 'Staff #'
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  await prisma.auditLog.create({
    data: {
      user: fullName,
      action: `${label} recovery request — ${fullName} (${user.email}) forgot their ${label}. On file: ${user.uniqueId}. Please relay it to the account holder.`,
      resource: `User-${user.id}`,
      severity: 'MrnRequest'
    }
  })

  return { success: true, message: genericMessage }
})
