import { prisma } from './prisma'

export type StaffBrief = { id: string; lastName: string; role: string }

export async function loadStaffMap(staffIds: Array<string | null | undefined>) {
  const ids = [...new Set(staffIds.filter((id): id is string => Boolean(id)))]
  const map = new Map<string, StaffBrief>()
  if (!ids.length) return map

  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, lastName: true, role: true }
  })

  for (const user of users) {
    map.set(user.id, user)
  }

  return map
}

export function staffDoctorLabel(staff: StaffBrief | undefined, fallback = 'Clinical Staff') {
  if (!staff?.lastName) return fallback
  return `Dr. ${staff.lastName}`
}
