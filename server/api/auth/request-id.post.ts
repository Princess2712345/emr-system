import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const identifierRaw = (body?.identifier as string | undefined)?.trim() || ''
  const identifier = identifierRaw.toLowerCase()
  const lastName = (body?.lastName as string | undefined)?.trim().toLowerCase() || ''
  const role = (body?.role as string | undefined)?.toUpperCase().trim() || 'PATIENT'

  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide your username or email.'
    })
  }

  // Generic response to avoid leaking which accounts exist
  const genericMessage =
    'If the details match our records, an administrator will be notified and will reach out with your ID shortly.'

  try {
    // Match the same way login does: identifiers are stored/looked up lowercased.
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }]
      }
    })

    // No matching account — respond generically, nothing to notify
    if (!user) {
      return { success: true, message: genericMessage }
    }

    const label = role === 'PATIENT' ? 'MRN #' : 'Staff #'
    const fullName = `${user.firstName} ${user.lastName}`.trim()
    const lastNameMatches = !lastName || user.lastName.trim().toLowerCase() === lastName
    const verifyNote = lastNameMatches
      ? ''
      : ` (note: provided last name "${lastName}" did not match records — verify identity before relaying)`

    await prisma.auditLog.create({
      data: {
        user: fullName,
        action: `${label} recovery request — ${fullName} (${user.email}) forgot their ${label}. On file: ${user.uniqueId}. Please relay it to the account holder${verifyNote}.`,
        resource: `User-${user.id}`,
        severity: 'MrnRequest'
      }
    })

    return { success: true, message: genericMessage }
  } catch (err) {
    console.error('request-id error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not process the request right now. Please try again.'
    })
  }
})
