import type { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

type DbClient = PrismaClient | Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>

const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR'] as const

function formatSequentialId(prefix: 'MRN' | 'STAFF', sequence: number) {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(sequence).padStart(6, '0')}`
}

async function findMaxSequence(
  client: DbClient,
  prefix: 'MRN' | 'STAFF',
  roleFilter: 'PATIENT' | 'STAFF'
) {
  const year = new Date().getFullYear()
  const pattern = `${prefix}-${year}-`

  const users = await client.user.findMany({
    where: roleFilter === 'PATIENT'
      ? { role: 'PATIENT', uniqueId: { startsWith: pattern } }
      : { role: { in: [...STAFF_ROLES] }, uniqueId: { startsWith: pattern } },
    select: { uniqueId: true }
  })

  let max = 0
  for (const row of users) {
    const suffix = row.uniqueId.slice(pattern.length)
    const num = parseInt(suffix, 10)
    if (!Number.isNaN(num) && num > max) max = num
  }

  return max
}

async function allocateUniqueId(
  client: DbClient,
  prefix: 'MRN' | 'STAFF',
  roleFilter: 'PATIENT' | 'STAFF'
) {
  const start = (await findMaxSequence(client, prefix, roleFilter)) + 1

  for (let seq = start; seq < start + 500; seq++) {
    const candidate = formatSequentialId(prefix, seq)
    const exists = await client.user.findUnique({
      where: { uniqueId: candidate },
      select: { id: true }
    })
    if (!exists) return candidate
  }

  throw createError({
    statusCode: 500,
    statusMessage: `Unable to allocate a unique ${prefix} number. Please try again.`
  })
}

export async function generateUniqueMrn(client: DbClient = prisma) {
  return allocateUniqueId(client, 'MRN', 'PATIENT')
}

export async function generateUniqueStaffId(client: DbClient = prisma) {
  return allocateUniqueId(client, 'STAFF', 'STAFF')
}

export function isStaffRole(role: string) {
  return STAFF_ROLES.includes(role.toUpperCase() as (typeof STAFF_ROLES)[number])
}
