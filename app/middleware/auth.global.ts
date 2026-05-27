const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR']

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const user = JSON.parse(localStorage.getItem('user_data') || 'null')
  const role = user?.role?.toUpperCase() || ''
  
  // Define strictly public paths
  const publicPaths = ['/', '/auth/login', '/auth/register']
  const isPublic = publicPaths.includes(to.path)

  // 1. If not logged in and trying to access a protected route
  if (!user && !isPublic && !to.path.startsWith('/auth/')) {
    return navigateTo('/auth/login')
  }

  // 2. If logged in
  if (user) {
    // Redirect logged-in users away from auth pages
    if (to.path.startsWith('/auth/')) {
      return navigateTo(role === 'PATIENT' ? '/patient' : '/dashboard')
    }

    // Redirect logged-in users from root '/' to their respective home
    if (to.path === '/') {
      return navigateTo(role === 'PATIENT' ? '/patient' : '/dashboard')
    }

    // Role-based access control
    if (to.path.startsWith('/patient') && role !== 'PATIENT' && !STAFF_ROLES.includes(role)) {
       // Optional: Add logic here if you want to block unauthorized staff from patient pages
    }
    
    if (to.path.startsWith('/dashboard') && !STAFF_ROLES.includes(role)) {
      return navigateTo('/patient')
    }
  }
})