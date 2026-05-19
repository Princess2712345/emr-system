// server/api/history.get.ts
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Fetch logs from the database sorted newest first
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Map database results to match your table's date format expectations
    return auditLogs.map(log => ({
      id: log.id,
      user: log.user,
      action: log.action,
      resource: log.resource,
      severity: log.severity,
      // Format the ISO database DateTime into a clean string for your Vue template
      timestamp: new Date(log.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }))

  } catch (error) {
    console.error('Failed to fetch operational audit history logs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not load system history data from database.'
    })
  }
})