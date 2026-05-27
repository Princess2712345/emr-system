import {
  clearStoredUser,
  getHomeRouteForRole,
  getStoredUser,
  STAFF_ROLES
} from '~/utils/authSession'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const hadStoredData = !!localStorage.getItem('user_data')
  const user = getStoredUser()

  if (hadStoredData && !user) {
    clearStoredUser()
  }

  const role = user?.role?.toUpperCase() || ''
  const isAuthPath = to.path === '/auth' || to.path.startsWith('/auth/')
  const isPublic =
    to.path === '/' ||
    isAuthPath

  if (!user && !isPublic) {
    return navigateTo('/auth/login')
  }

  if (!user) return

  if (to.path.startsWith('/dashboard') && !STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number])) {
    return navigateTo(getHomeRouteForRole(role))
  }

  if (to.path.startsWith('/patient') && role !== 'PATIENT') {
    return navigateTo(getHomeRouteForRole(role))
  }
})
