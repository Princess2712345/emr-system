import { getStoredUser } from '~/utils/authSession'

export function usePatientHeader() {
  const { user, loadUser, initials } = useAuth()

  const displayName = computed(() => {
    const u = user.value
    if (!u) return 'Patient'
    const full = `${u.firstName || ''} ${u.lastName || ''}`.trim()
    return full || (u.username as string) || 'Patient'
  })

  const registryId = computed(() => (user.value?.uniqueId as string) || '')

  const requirePatientSession = () => {
    const stored = loadUser() || getStoredUser()
    if (!stored || stored.role !== 'PATIENT') {
      navigateTo('/auth/login')
      return null
    }
    return stored
  }

  return {
    user,
    loadUser,
    initials,
    displayName,
    registryId,
    requirePatientSession
  }
}
