const STAFF_ROLES = ['ADMIN', 'HR', 'REGISTRAR', 'DOCTOR']

export default defineNuxtRouteMiddleware((to) => {
  // 1. Never run on the server side to avoid hydration mismatches
  if (import.meta.server) return

  // 2. Fetch and parse user data
  const userData = localStorage.getItem('user_data')
  const user = userData ? JSON.parse(userData) : null
  const role = user?.role?.toUpperCase() || ''

  // 3. Define paths
  const publicPaths = ['/', '/auth/login', '/auth/register']
  const isPublic = publicPaths.includes(to.path)
  
  // Determine where the user SHOULD be based on their role
  const targetPath = role === 'PATIENT' ? '/patient' : '/dashboard'

  // 4. Handle Unauthenticated Users
  if (!user && !isPublic && !to.path.startsWith('/auth/')) {
    return navigateTo('/auth/login')
  }

  // 5. Handle Authenticated Users
  if (user) {
    // If they are on a public page or auth page, redirect to their proper area
    // but ONLY if they aren't already there (prevents infinite loop)
    if ((isPublic || to.path.startsWith('/auth/')) && to.path !== targetPath) {
      return navigateTo(targetPath)
    }

    // Role-based access control (RBAC)
    // If a non-staff tries to go to dashboard, boot them to /patient
    if (to.path.startsWith('/dashboard') && !STAFF_ROLES.includes(role)) {
      return navigateTo('/patient')
    }

    // If a staff member tries to go to /patient, you might want to allow it 
    // or restrict it. Currently, it allows it based on your requirements.
  }
})