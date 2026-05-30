import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId as string | undefined
  const sinceRaw = query.since as string | undefined
  const since = sinceRaw ? new Date(sinceRaw) : null

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id required.' })
  }

  const { patient } = await requirePatientContext(userId)
  const resource = `Patient-${patient.id}`

  const unreadFilter = {
    severity: 'PatientNotify' as const,
    resource,
    ...(since && !Number.isNaN(since.getTime()) ? { timestamp: { gt: since } } : {})
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.auditLog.findMany({
      where: { severity: 'PatientNotify', resource },
      orderBy: { timestamp: 'desc' },
      take: 30
    }),
    prisma.auditLog.count({ where: unreadFilter })
  ])

  return {
    success: true,
    unreadCount,
    notifications: notifications.map((log) => ({
      id: log.id,
      message: log.action,
      resource: log.resource,
      time: log.timestamp,
      timeLabel: new Date(log.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }))
  }
})
