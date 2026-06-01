import { prisma } from '../utils/prisma'

function fmtTime(d: Date) {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

/**
 * Sync any AuditLog RefillRequest entries that have no corresponding
 * MedicationRefill row (e.g. submitted before the table existed).
 * This is idempotent — it checks a 2-minute window around each log timestamp.
 */
async function syncOrphanedLogs() {
  const logs = await prisma.auditLog.findMany({
    where: { severity: 'RefillRequest' },
    orderBy: { timestamp: 'asc' }
  })

  for (const log of logs) {
    const m = log.resource.match(/^Patient-(.+)$/)
    if (!m) continue
    const patientId = m[1]

    const existing = await prisma.medicationRefill.findFirst({
      where: {
        patientId,
        createdAt: {
          gte: new Date(log.timestamp.getTime() - 120_000),
          lte: new Date(log.timestamp.getTime() + 120_000)
        }
      }
    })
    if (existing) continue

    const medMatch = log.action.match(/Medication refill requested:\s*(.+)$/)
    const meds = medMatch
      ? medMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
      : ['Active medications']

    const patient = await prisma.patient
      .findUnique({ where: { id: patientId }, select: { name: true } })
      .catch(() => null)

    await prisma.medicationRefill.create({
      data: {
        patientId,
        patientName: patient?.name || log.user,
        medications: meds,
        status: 'Pending',
        createdAt: log.timestamp,
        updatedAt: log.timestamp
      }
    }).catch(() => {}) // ignore race-condition duplicates
  }
}

export default defineEventHandler(async () => {
  try {
    // Auto-backfill any orphaned AuditLog refill entries silently
    await syncOrphanedLogs()

    const rows = await prisma.medicationRefill.findMany({
      include: {
        patient: {
          select: {
            email: true,
            phone: true,
            avatar: true,
            gender: true,
            userAccount: { select: { uniqueId: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return rows.map((row) => {
      const meds = Array.isArray(row.medications) ? (row.medications as string[]) : []
      const ua = row.patient?.userAccount
      return {
        id: row.id,
        requestRef: `RX-${row.id.slice(0, 8).toUpperCase()}`,
        patientId: row.patientId,
        patientName: row.patientName,
        medications: meds,
        medSummary: meds.join(', '),
        medCount: meds.length,
        status: row.status,
        notes: row.notes || '',
        reviewedBy: row.reviewedBy || '',
        reviewedAt: row.reviewedAt ? fmtTime(new Date(row.reviewedAt)) : null,
        requestedAt: fmtTime(new Date(row.createdAt)),
        mrn: ua?.uniqueId || null,
        email: row.patient?.email || null,
        phone: row.patient?.phone && row.patient.phone !== 'N/A' ? row.patient.phone : null,
        gender: row.patient?.gender || null,
        avatar: row.patient?.avatar || ''
      }
    })
  } catch (error) {
    console.error('Failed to load medication refills:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to load refill requests.' })
  }
})
