import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const sinceRaw = getQuery(event).since as string | undefined
  const since = sinceRaw ? new Date(sinceRaw) : null

  const paymentFilter = {
    severity: 'Payment' as const,
    ...(since && !Number.isNaN(since.getTime()) ? { timestamp: { gt: since } } : {})
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.auditLog.findMany({
      where: { severity: 'Payment' },
      orderBy: { timestamp: 'desc' },
      take: 25
    }),
    prisma.auditLog.count({ where: paymentFilter })
  ])

  return {
    success: true,
    unreadCount,
    notifications: notifications.map((log) => ({
      id: log.id,
      message: log.action,
      patient: log.user,
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
