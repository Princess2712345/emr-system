<template>
  <div class="patient-notif" ref="rootRef">
    <button
      type="button"
      class="patient-notif-trigger clickable"
      aria-label="Open notifications"
      @click.stop="onBellClick"
    >
      <Icon name="lucide:bell" class="patient-notif-icon" />
      <span v-if="unreadCount > 0" class="patient-notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <Transition name="panel">
      <div v-if="isOpen" class="patient-notif-panel" @click.stop>
        <header class="panel-header">
          <div class="panel-title-row">
            <Icon name="lucide:bell-ring" class="panel-title-icon" />
            <div>
              <h3>Notifications</h3>
              <p>{{ notifications.length }} update{{ notifications.length === 1 ? '' : 's' }}</p>
            </div>
          </div>
          <button type="button" class="panel-close" aria-label="Close" @click="isOpen = false">
            <Icon name="lucide:x" />
          </button>
        </header>

        <div class="panel-toolbar">
          <span class="toolbar-label">Recent activity</span>
          <button type="button" class="mark-read-btn" @click="markAllRead">Mark all read</button>
        </div>

        <div class="panel-body">
          <div v-if="isLoading" class="panel-state">
            <Icon name="lucide:loader-2" class="spin" />
            <p>Loading…</p>
          </div>

          <div v-else-if="!notifications.length" class="panel-state empty">
            <Icon name="lucide:inbox" />
            <p class="state-title">You're all caught up</p>
            <span>Payment confirmations and updates will appear here.</span>
          </div>

          <ul v-else class="notif-list">
            <li
              v-for="item in notifications"
              :key="item.id"
              class="notif-card"
              :class="item.type"
            >
              <div class="notif-icon-wrap" :class="item.type">
                <Icon :name="iconFor(item.type)" />
              </div>
              <div class="notif-content">
                <span class="notif-title">{{ item.title }}</span>
                <p class="notif-msg">{{ item.message }}</p>
                <span class="notif-time">
                  <Icon name="lucide:clock" />
                  {{ item.timeLabel }}
                </span>
              </div>
            </li>
          </ul>
        </div>

        <footer class="panel-footer">
          <button type="button" class="footer-btn secondary" @click="fetchNotifications">
            <Icon name="lucide:refresh-cw" />
            Refresh
          </button>
          <NuxtLink to="/patient/billing" class="footer-btn primary" @click="isOpen = false">
            <Icon name="lucide:credit-card" />
            Billing
          </NuxtLink>
        </footer>
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
} = usePatientNotifications()

const rootRef = ref(null)

const iconFor = (type) => {
  if (type === 'approved') return 'lucide:badge-check'
  if (type === 'rejected') return 'lucide:circle-x'
  if (type === 'submitted') return 'lucide:clock-alert'
  if (type === 'appointment') return 'lucide:calendar-clock'
  return 'lucide:info'
}

const onBellClick = () => {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  isOpen.value = true
  fetchNotifications()
}

const onDocClick = (e) => {
  if (!isOpen.value || !rootRef.value) return
  if (!rootRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

let pollTimer = null

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
.patient-notif {
  position: relative;
}

.patient-notif-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s;
}

.patient-notif-trigger:hover {
  border-color: #2563eb;
  color: #1e3a8a;
}

.patient-notif-icon {
  font-size: 1.2rem;
}

.patient-notif-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 4px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1.15rem;
  text-align: center;
  color: white;
  background: #ef4444;
  border-radius: 999px;
  border: 2px solid #fff;
}

.patient-notif-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(380px, calc(100vw - 1.5rem));
  max-height: min(520px, calc(100vh - 6rem));
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
  z-index: 4000;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-title-row {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.panel-title-icon {
  font-size: 1.35rem;
  color: #2563eb;
  flex-shrink: 0;
  margin-top: 2px;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e3a8a;
}

.panel-header p {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.panel-close {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  padding: 4px;
  border-radius: 6px;
}

.panel-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.toolbar-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #94a3b8;
}

.mark-read-btn {
  border: none;
  background: none;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.mark-read-btn:hover {
  text-decoration: underline;
}

.panel-body {
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
}

.panel-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1.25rem;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

.panel-state.empty :deep(svg) {
  font-size: 2rem;
  opacity: 0.45;
}

.state-title {
  margin: 0;
  font-weight: 700;
  color: #334155;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0.35rem 0;
}

.notif-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.notif-card.approved { border-left: 3px solid #10b981; }
.notif-card.rejected { border-left: 3px solid #ef4444; }
.notif-card.submitted { border-left: 3px solid #f59e0b; }
.notif-card.appointment { border-left: 3px solid #0ea5e9; }

.notif-icon-wrap {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-icon-wrap.approved { background: #dcfce7; color: #059669; }
.notif-icon-wrap.rejected { background: #fee2e2; color: #dc2626; }
.notif-icon-wrap.submitted { background: #fef3c7; color: #d97706; }
.notif-icon-wrap.appointment { background: #e0f2fe; color: #0284c7; }
.notif-icon-wrap.other { background: #dbeafe; color: #2563eb; }

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
}

.notif-msg {
  margin: 0.2rem 0 0.35rem;
  font-size: 0.78rem;
  color: #475569;
  line-height: 1.4;
}

.notif-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  color: #94a3b8;
}

.panel-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.footer-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.footer-btn.secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.footer-btn.primary {
  background: #2563eb;
  color: white;
}

.footer-btn.primary:hover {
  background: #1d4ed8;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
