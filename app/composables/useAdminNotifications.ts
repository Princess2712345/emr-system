import { ref } from 'vue'

const STORAGE_KEY = 'admin_notifications_seen_at'

const notifications = ref<{ id: number; message: string; patient: string; timeLabel: string }[]>([])
const unreadCount = ref(0)
const isOpen = ref(false)
const isLoading = ref(false)

export function useAdminNotifications() {
  const getSeenAt = () => {
    if (!import.meta.client) return null
    return localStorage.getItem(STORAGE_KEY) || null
  }

  const fetchNotifications = async () => {
    if (!import.meta.client) return
    isLoading.value = true
    try {
      const since = getSeenAt()
      const data = await $fetch<{
        success: boolean
        unreadCount: number
        notifications: { id: number; message: string; patient: string; timeLabel: string }[]
      }>('/api/admin/notifications', {
        query: since ? { since } : {}
      })
      if (data.success) {
        notifications.value = data.notifications
        unreadCount.value = data.unreadCount
      }
    } catch (e) {
      console.error('Failed to load admin notifications:', e)
    } finally {
      isLoading.value = false
    }
  }

  const markAllRead = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    }
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    fetchNotifications,
    markAllRead
  }
}
