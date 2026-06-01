import { prisma } from '../../utils/prisma'

const ADMIN_SEVERITIES = ['Payment', 'PaymentReview', 'MrnRequest', 'Appointment', 'RefillRequest']

export default defineEventHandler(async (event) => {
  const sinceRaw = getQuery(event).since as string | undefined
  const since = sinceRaw ? new Date(sinceRaw) : null

  const unreadFilter = {
    severity: { in: ADMIN_SEVERITIES },
    ...(since && !Number.isNaN(since.getTime()) ? { timestamp: { gt: since } } : {})
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.auditLog.findMany({
      where: { severity: { in: ADMIN_SEVERITIES } },
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
      patient: log.user,
      resource: log.resource,
      severity: log.severity,
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
