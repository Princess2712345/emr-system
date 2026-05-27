export const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR'] as const
export const ALL_ROLES = [...STAFF_ROLES, 'PATIENT'] as const

export type AuthUser = {
  id: number | string
  role: string
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  uniqueId?: string
  [key: string]: unknown
}

export function getStoredUser(): AuthUser | null {
  if (!import.meta.client) return null

  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const id = parsed.id
    if (id === undefined || id === null || id === '') return null

    const role = String(parsed.role || '').toUpperCase()
    if (!ALL_ROLES.includes(role as (typeof ALL_ROLES)[number])) return null

    return { ...parsed, id, role } as AuthUser
  } catch {
    return null
  }
}

export function clearStoredUser() {
  if (!import.meta.client) return
  localStorage.removeItem('user_data')
}

export function getHomeRouteForRole(role: string) {
  return role === 'PATIENT' ? '/patient' : '/dashboard'
}
