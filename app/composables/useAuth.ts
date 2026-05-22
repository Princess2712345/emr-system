export function useAuth() {
  const user = ref<Record<string, unknown> | null>(null)

  const loadUser = () => {
    if (!import.meta.client) return null
    const raw = localStorage.getItem('user_data')
    if (!raw) {
      user.value = null
      return null
    }
    user.value = JSON.parse(raw)
    return user.value
  }

  const logout = () => {
    if (import.meta.client) {
      localStorage.removeItem('user_data')
    }
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
