<template>
  <div class="admin-notif" ref="rootRef">
    <button
      type="button"
      class="admin-notif-trigger clickable"
      aria-label="Payment notifications"
      @click="onBellClick"
    >
      <Icon name="lucide:bell" class="admin-notif-icon" />
      <span v-if="unreadCount > 0" class="admin-notif-dot" />
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="admin-notif-panel">
        <div class="admin-notif-head">
          <h4>Payment alerts</h4>
          <button type="button" class="admin-notif-close" @click="isOpen = false">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p v-if="isLoading" class="admin-notif-empty">Loading…</p>
        <ul v-else-if="notifications.length" class="admin-notif-list">
          <li v-for="item in notifications" :key="item.id" class="admin-notif-item">
            <Icon name="lucide:badge-check" class="paid-check" />
            <div>
              <p class="admin-notif-msg">{{ item.message }}</p>
              <span class="admin-notif-time">{{ item.timeLabel }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="admin-notif-empty">No payment notifications yet.</p>
        <NuxtLink to="/dashboard/billing" class="admin-notif-link" @click="isOpen = false">
          View billing ledger
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const {
  notifications,
  unreadCount,
  isOpen,
  isLoading,
  fetchNotifications,
  markAllRead
} = useAdminNotifications()

const rootRef = ref(null)

const onBellClick = () => {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  isOpen.value = true
  fetchNotifications()
  markAllRead()
}

const onDocClick = (e) => {
  if (!isOpen.value || !rootRef.value) return
  if (!rootRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  document.addEventListener('click', onDocClick)
  fetchNotifications()
  pollTimer = setInterval(fetchNotifications, 15000)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.admin-notif {
  position: relative;
}

.admin-notif-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
}

.admin-notif-trigger:hover {
  background: #f1f5f9;
  color: #1e3a8a;
}

.admin-notif-icon {
  font-size: 1.25rem;
}

.admin-notif-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

.admin-notif-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: min(360px, calc(100vw - 2rem));
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  z-index: 3000;
  overflow: hidden;
}

.admin-notif-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.admin-notif-head h4 {
  margin: 0;
  font-size: 0.9rem;
  color: #1e3a8a;
}

.admin-notif-close {
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
}

.admin-notif-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  max-height: 280px;
  overflow-y: auto;
}

.admin-notif-item {
  display: flex;
  gap: 10px;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #f8fafc;
}

.paid-check {
  color: #10b981;
  flex-shrink: 0;
  margin-top: 2px;
}

.admin-notif-msg {
  margin: 0;
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.4;
}

.admin-notif-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.admin-notif-empty {
  margin: 0;
  padding: 1rem;
  font-size: 0.85rem;
  color: #64748b;
}

.admin-notif-link {
  display: block;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2563eb;
  text-decoration: none;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.admin-notif-link:hover {
  background: #f8fafc;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
