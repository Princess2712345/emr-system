const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR']

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const publicPaths = ['/', '/auth', '/auth/login', '/auth/register', '/auth/']
  const isPublic = publicPaths.some(p => to.path === p || to.path.startsWith('/auth/'))

  const cachedUser = import.meta.client ? localStorage.getItem('user_data') : null
  const user = cachedUser ? JSON.parse(cachedUser) : null
  const role = user?.role?.toUpperCase() || ''

  if (!user && !isPublic) {
    if (to.path.startsWith('/patient') || to.path.startsWith('/dashboard')) {
      return navigateTo('/auth/login')
    }
  }

  if (user) {
    if (to.path.startsWith('/patient') && role !== 'PATIENT') {
      return navigateTo('/dashboard')
    }
    if (to.path.startsWith('/dashboard') && !STAFF_ROLES.includes(role)) {
      return navigateTo('/patient')
    }
    if (to.path.startsWith('/auth/login') || to.path === '/auth') {
      return navigateTo(role === 'PATIENT' ? '/patient' : '/dashboard')
    }
  }
})
