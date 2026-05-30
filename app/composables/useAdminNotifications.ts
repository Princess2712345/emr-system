import { ref, computed } from 'vue'

const STORAGE_KEY = 'admin_notifications_seen_at'

export type AdminNotificationType = 'payment' | 'review' | 'mrn' | 'other'

export type AdminNotificationItem = {
  id: number
  message: string
  patient: string
  resource: string
  severity: string
  timeLabel: string
  title: string
  amount: string | null
  invoiceRef: string | null
  type: AdminNotificationType
}

const notifications = ref<AdminNotificationItem[]>([])
const unreadCount = ref(0)
const isOpen = ref(false)
const isLoading = ref(false)
const activeFilter = ref<'all' | 'payments' | 'requests'>('all')

function parseNotification(raw: {
  id: number
  message: string
  patient: string
  resource: string
  severity: string
  timeLabel: string
}): AdminNotificationItem {
  const msg = raw.message || ''
  const amountMatch = msg.match(/₱([\d,.]+)/)
  const invMatch = msg.match(/invoice #([A-Z0-9]+)/i)

  let type: AdminNotificationType = 'other'
  let title = 'System alert'

  if (raw.severity === 'MrnRequest') {
    type = 'mrn'
    title = 'ID recovery request'
  } else if (raw.severity === 'PaymentReview') {
    type = 'review'
    title = 'Payment awaiting approval'
  } else if (raw.severity === 'Payment' || raw.resource.startsWith('Invoice-')) {
    type = 'payment'
    title = 'Payment confirmed'
  }

  return {
    ...raw,
    title,
    amount: amountMatch ? amountMatch[1] : null,
    invoiceRef: invMatch ? invMatch[1] : null,
    type
  }
}

export function useAdminNotifications() {
  const filteredNotifications = computed(() => {
    if (activeFilter.value === 'payments') {
      return notifications.value.filter((n) => n.type === 'payment' || n.type === 'review')
    }
    if (activeFilter.value === 'requests') {
      return notifications.value.filter((n) => n.type === 'mrn')
    }
    return notifications.value
  })

  const paymentCount = computed(() =>
    notifications.value.filter((n) => n.type === 'payment' || n.type === 'review').length
  )

  const requestCount = computed(() =>
    notifications.value.filter((n) => n.type === 'mrn').length
  )

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
        notifications: {
          id: number
          message: string
          patient: string
          resource: string
          severity: string
          timeLabel: string
        }[]
      }>('/api/admin/notifications', {
        query: since ? { since } : {}
      })
      if (data.success) {
        notifications.value = data.notifications.map(parseNotification)
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
    filteredNotifications,
    paymentCount,
    requestCount,
    unreadCount,
    isOpen,
    isLoading,
    activeFilter,
    fetchNotifications,
    markAllRead
  }
}
