import { ref, computed } from 'vue'
import { getStoredUser } from '~/utils/authSession'

const STORAGE_KEY = 'patient_notifications_seen_at'

export type PatientNotificationType = 'approved' | 'rejected' | 'submitted' | 'other'

export type PatientNotificationItem = {
  id: number
  message: string
  timeLabel: string
  title: string
  type: PatientNotificationType
}

const notifications = ref<PatientNotificationItem[]>([])
const unreadCount = ref(0)
const isOpen = ref(false)
const isLoading = ref(false)

function parseNotification(raw: { id: number; message: string; timeLabel: string }): PatientNotificationItem {
  const msg = (raw.message || '').toLowerCase()

  let type: PatientNotificationType = 'other'
  let title = 'Notification'

  if (msg.includes('approved') || msg.includes('thank you')) {
    type = 'approved'
    title = 'Payment approved'
  } else if (msg.includes('not approved') || msg.includes('rejected') || msg.includes('declined')) {
    type = 'rejected'
    title = 'Payment not approved'
  } else if (msg.includes('awaiting') || msg.includes('submitted')) {
    type = 'submitted'
    title = 'Payment submitted'
  }

  return { ...raw, title, type }
}

export function usePatientNotifications() {
  const getSeenAt = () => {
    if (!import.meta.client) return null
    return localStorage.getItem(STORAGE_KEY) || null
  }

  const hasUnread = computed(() => unreadCount.value > 0)

  const fetchNotifications = async () => {
    if (!import.meta.client) return
    const stored = getStoredUser()
    if (!stored || stored.role !== 'PATIENT') return

    isLoading.value = true
    try {
      const since = getSeenAt()
      const data = await $fetch<{
        success: boolean
        unreadCount: number
        notifications: { id: number; message: string; timeLabel: string }[]
      }>('/api/patient/notifications', {
        query: { userId: stored.id, ...(since ? { since } : {}) }
      })
      if (data.success) {
        notifications.value = data.notifications.map(parseNotification)
        unreadCount.value = data.unreadCount
      }
    } catch (e) {
      console.error('Failed to load patient notifications:', e)
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
    hasUnread,
    isOpen,
    isLoading,
    fetchNotifications,
    markAllRead
  }
}
