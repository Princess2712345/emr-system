import { ref, computed } from 'vue'

const STORAGE_KEY = 'admin_notifications_seen_at'

export type AdminNotificationItem = {
  id: number
  message: string
  patient: string
  resource: string
  timeLabel: string
  title: string
  amount: string | null
  invoiceRef: string | null
  type: 'payment' | 'other'
}

const notifications = ref<AdminNotificationItem[]>([])
const unreadCount = ref(0)
const isOpen = ref(false)
const isLoading = ref(false)
const activeFilter = ref<'all' | 'payments'>('all')

function parseNotification(raw: {
  id: number
  message: string
  patient: string
  resource: string
  timeLabel: string
}): AdminNotificationItem {
  const msg = raw.message || ''
  const amountMatch = msg.match(/₱([\d,.]+)/)
  const invMatch = msg.match(/invoice #([A-Z0-9]+)/i)
  const isPayment = msg.toLowerCase().includes('payment') || raw.resource.startsWith('Invoice-')

  return {
    ...raw,
    title: isPayment ? 'Payment received' : 'System alert',
    amount: amountMatch ? amountMatch[1] : null,
    invoiceRef: invMatch ? invMatch[1] : null,
    type: isPayment ? 'payment' : 'other'
  }
}

export function useAdminNotifications() {
  const filteredNotifications = computed(() => {
    if (activeFilter.value === 'payments') {
      return notifications.value.filter((n) => n.type === 'payment')
    }
    return notifications.value
  })

  const paymentCount = computed(() =>
    notifications.value.filter((n) => n.type === 'payment').length
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
    unreadCount,
    isOpen,
    isLoading,
    activeFilter,
    fetchNotifications,
    markAllRead
  }
}
