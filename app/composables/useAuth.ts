import { clearStoredUser, getStoredUser, type AuthUser } from '~/utils/authSession'

export function useAuth() {
  const user = ref<AuthUser | null>(null)

  const loadUser = () => {
    const stored = getStoredUser()
    user.value = stored
    return stored
  }

  const logout = () => {
    clearStoredUser()
    user.value = null
    return navigateTo('/auth/login')
  }

  const initials = computed(() => {
    const u = user.value as { firstName?: string; lastName?: string } | null
    if (!u?.firstName) return 'PT'
    return `${u.firstName[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase()
  })

  onMounted(loadUser)

  return { user, loadUser, logout, initials }
}
