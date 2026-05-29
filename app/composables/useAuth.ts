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
    const u = user.value as { firstName?: string; lastName?: string; username?: string } | null
    if (!u) return 'PT'
    const first = u.firstName?.[0] || ''
    const last = u.lastName?.[0] || ''
    if (first || last) return `${first}${last}`.toUpperCase()
    return (u.username?.slice(0, 2) || 'PT').toUpperCase()
  })

  onMounted(loadUser)

  return { user, loadUser, logout, initials }
}
