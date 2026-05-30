<template>
  <div class="admin-notif" ref="rootRef">
    <button
      type="button"
      class="admin-notif-trigger clickable"
      aria-label="Open notifications"
      @click.stop="onBellClick"
    >
      <Icon name="lucide:bell" class="admin-notif-icon" />
      <span v-if="unreadCount > 0" class="admin-notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <Transition name="panel">
      <div v-if="isOpen" class="admin-notif-panel" @click.stop>
        <header class="panel-header">
          <div class="panel-title-row">
            <Icon name="lucide:bell-ring" class="panel-title-icon" />
            <div>
              <h3>Notifications</h3>
              <p>{{ paymentCount }} payment alert{{ paymentCount === 1 ? '' : 's' }}</p>
            </div>
          </div>
          <button type="button" class="panel-close" aria-label="Close" @click="isOpen = false">
            <Icon name="lucide:x" />
          </button>
        </header>

        <div class="panel-toolbar">
          <div class="panel-tabs">
            <button
              type="button"
              :class="['tab', { active: activeFilter === 'all' }]"
              @click="activeFilter = 'all'"
            >
              All
            </button>
            <button
              type="button"
              :class="['tab', { active: activeFilter === 'payments' }]"
              @click="activeFilter = 'payments'"
            >
              Payments
            </button>
          </div>
          <button type="button" class="mark-read-btn" @click="markAllRead">
            Mark all read
          </button>
        </div>

        <div class="panel-body">
          <div v-if="isLoading" class="panel-state">
            <Icon name="lucide:loader-2" class="spin" />
            <p>Loading notifications…</p>
          </div>

          <div v-else-if="!filteredNotifications.length" class="panel-state empty">
            <Icon name="lucide:inbox" />
            <p class="state-title">No notifications</p>
            <span>Patient payments will appear here when they pay an invoice.</span>
          </div>

          <ul v-else class="notif-list">
            <li
              v-for="item in filteredNotifications"
              :key="item.id"
              class="notif-card"
              :class="{ payment: item.type === 'payment' }"
            >
              <div class="notif-icon-wrap" :class="item.type">
                <Icon :name="item.type === 'payment' ? 'lucide:badge-check' : 'lucide:info'" />
              </div>
              <div class="notif-content">
                <div class="notif-top">
                  <span class="notif-title">{{ item.title }}</span>
                  <span v-if="item.type === 'payment'" class="status-chip paid">Paid</span>
                </div>
                <p class="notif-patient">
                  <Icon name="lucide:user" />
                  {{ item.patient }}
                </p>
                <p v-if="item.amount" class="notif-amount">₱{{ item.amount }}</p>
                <p v-if="item.invoiceRef" class="notif-meta">
                  Invoice #{{ item.invoiceRef }}
                </p>
                <p v-else class="notif-meta notif-msg-truncate">{{ item.message }}</p>
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
          <NuxtLink to="/dashboard/billing" class="footer-btn primary" @click="isOpen = false">
            <Icon name="lucide:receipt" />
            Billing ledger
          </NuxtLink>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const {
  filteredNotifications,
  paymentCount,
  unreadCount,
  isOpen,
  isLoading,
  activeFilter,
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
.admin-notif {
  position: relative;
}

.admin-notif-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--emr-text-muted, #64748b);
  border-radius: 8px;
  cursor: pointer;
}

.admin-notif-trigger:hover {
  background: var(--emr-surface-muted, #f1f5f9);
  color: var(--emr-heading, #1e3a8a);
}

.admin-notif-icon {
  font-size: 1.25rem;
}

.admin-notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 4px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 1.1rem;
  text-align: center;
  color: white;
  background: #ef4444;
  border-radius: 999px;
  border: 2px solid var(--emr-surface, #fff);
}

.admin-notif-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(400px, calc(100vw - 1.5rem));
  max-height: min(520px, calc(100vh - 6rem));
  display: flex;
  flex-direction: column;
  background: var(--emr-notif-bg, #fff);
  border: 1px solid var(--emr-border, #e2e8f0);
  border-radius: 14px;
  box-shadow: var(--emr-card-shadow, 0 20px 40px rgba(15, 23, 42, 0.15));
  z-index: 4000;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--emr-border, #e2e8f0);
  background: var(--emr-surface-muted, #f8fafc);
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
  color: var(--emr-heading, #1e3a8a);
}

.panel-header p {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: var(--emr-text-muted, #64748b);
}

.panel-close {
  border: none;
  background: transparent;
  color: var(--emr-text-muted, #94a3b8);
  cursor: pointer;
  display: flex;
  padding: 4px;
  border-radius: 6px;
}

.panel-close:hover {
  background: var(--emr-notif-hover, #f1f5f9);
  color: var(--emr-text, #334155);
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--emr-border, #e2e8f0);
}

.panel-tabs {
  display: flex;
  gap: 4px;
  background: var(--emr-surface-muted, #f1f5f9);
  padding: 3px;
  border-radius: 8px;
}

.tab {
  border: none;
  background: transparent;
  color: var(--emr-text-muted, #64748b);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
}

.tab.active {
  background: var(--emr-surface, #fff);
  color: var(--emr-heading, #1e3a8a);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.mark-read-btn {
  border: none;
  background: none;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
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
  color: var(--emr-text-muted, #64748b);
  font-size: 0.85rem;
}

.panel-state.empty :deep(svg) {
  font-size: 2rem;
  opacity: 0.45;
}

.state-title {
  margin: 0;
  font-weight: 700;
  color: var(--emr-text, #334155);
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
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--emr-border, #f1f5f9);
  transition: background 0.15s ease;
}

.notif-card:hover {
  background: var(--emr-notif-hover, #f8fafc);
}

.notif-card.payment {
  border-left: 3px solid #10b981;
}

.notif-icon-wrap {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-icon-wrap.payment {
  background: #dcfce7;
  color: #059669;
}

.notif-icon-wrap.other {
  background: #dbeafe;
  color: #2563eb;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.notif-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--emr-text, #1e293b);
}

.status-chip.paid {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #dcfce7;
  color: #15803d;
}

.notif-patient {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.2rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--emr-text, #334155);
}

.notif-amount {
  margin: 0 0 0.15rem;
  font-size: 1rem;
  font-weight: 800;
  color: #059669;
}

.notif-meta {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  color: var(--emr-text-muted, #64748b);
  font-family: ui-monospace, monospace;
}

.notif-msg-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  color: var(--emr-text-muted, #94a3b8);
}

.panel-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--emr-border, #e2e8f0);
  background: var(--emr-surface-muted, #f8fafc);
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
  background: var(--emr-surface, #fff);
  color: var(--emr-text-muted, #475569);
  border: 1px solid var(--emr-border, #e2e8f0);
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
