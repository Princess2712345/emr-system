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
              <p>{{ paymentCount }} payment · {{ appointmentCount }} appointment{{ appointmentCount === 1 ? '' : 's' }} · {{ requestCount }} ID</p>
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
            <button
              type="button"
              :class="['tab', { active: activeFilter === 'appointments' }]"
              @click="activeFilter = 'appointments'"
            >
              Appts
            </button>
            <button
              type="button"
              :class="['tab', { active: activeFilter === 'requests' }]"
              @click="activeFilter = 'requests'"
            >
              Requests
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
            <span>Patient payments, appointment requests, and ID requests will appear here.</span>
          </div>

          <ul v-else class="notif-list">
            <li
              v-for="item in filteredNotifications"
              :key="item.id"
              class="notif-card"
              :class="[item.type, { clickable: item.type === 'mrn' || item.type === 'appointment' }]"
              @click="onCardClick(item)"
            >
              <div class="notif-icon-wrap" :class="item.type">
                <Icon :name="iconFor(item.type)" />
              </div>
              <div class="notif-content">
                <div class="notif-top">
                  <span class="notif-title">{{ item.title }}</span>
                  <span v-if="item.type === 'payment'" class="status-chip paid">Paid</span>
                  <span v-else-if="item.type === 'review'" class="status-chip review">Pending</span>
                  <span v-else-if="item.type === 'mrn'" class="status-chip mrn">Action</span>
                  <span v-else-if="item.type === 'appointment'" class="status-chip appointment">New</span>
                </div>
                <p class="notif-patient">
                  <Icon name="lucide:user" />
                  {{ item.patient }}
                </p>
                <p v-if="item.amount" class="notif-amount">₱{{ item.amount }}</p>
                <p v-if="item.invoiceRef && item.type !== 'mrn'" class="notif-meta">
                  Invoice #{{ item.invoiceRef }}
                </p>
                <p v-else class="notif-meta notif-msg-clamp">{{ item.message }}</p>
                <span class="notif-bottom">
                  <span class="notif-time">
                    <Icon name="lucide:clock" />
                    {{ item.timeLabel }}
                  </span>
                  <span v-if="item.type === 'mrn'" class="notif-cta">
                    View &amp; relay <Icon name="lucide:chevron-right" />
                  </span>
                  <span v-else-if="item.type === 'appointment'" class="notif-cta">
                    View schedule <Icon name="lucide:chevron-right" />
                  </span>
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

    <Teleport to="body">
      <Transition name="req-fade">
        <div v-if="requestOpen" class="req-overlay" @click.self="closeRequest">
          <div class="req-modal">
            <header class="req-header">
              <div class="req-header-icon"><Icon name="lucide:id-card" /></div>
              <div>
                <h3>ID recovery request</h3>
                <p>Relay the requested ID to the account holder.</p>
              </div>
              <button type="button" class="req-close" @click="closeRequest"><Icon name="lucide:x" /></button>
            </header>

            <div v-if="requestLoading" class="req-state">
              <Icon name="lucide:loader-2" class="spin" /> Loading account…
            </div>

            <div v-else-if="requestError" class="req-state error">
              <Icon name="lucide:alert-triangle" /> {{ requestError }}
            </div>

            <div v-else-if="requestDetail" class="req-body">
              <div class="req-rows">
                <div class="req-row"><span>Name</span><strong>{{ requestDetail.name }}</strong></div>
                <div class="req-row"><span>Email</span><strong>{{ requestDetail.email }}</strong></div>
                <div class="req-row"><span>Username</span><strong>{{ requestDetail.username }}</strong></div>
              </div>

              <div class="req-id-box">
                <span class="req-id-label">{{ requestDetail.idLabel }} on file</span>
                <div class="req-id-value">
                  <code>{{ requestDetail.uniqueId }}</code>
                  <button type="button" class="req-copy" @click="copyId">
                    <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" />
                    {{ copied ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              </div>

              <div class="req-actions">
                <a class="req-btn email" :href="mailtoLink">
                  <Icon name="lucide:mail" /> Email the ID
                </a>
                <button type="button" class="req-btn resolve" :disabled="resolving" @click="resolveRequest">
                  <Icon name="lucide:check-check" />
                  {{ resolving ? 'Saving…' : 'Mark relayed' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const {
  filteredNotifications,
  paymentCount,
  requestCount,
  appointmentCount,
  unreadCount,
  isOpen,
  isLoading,
  activeFilter,
  fetchNotifications,
  markAllRead
} = useAdminNotifications()

const rootRef = ref(null)

const iconFor = (type) => {
  if (type === 'payment') return 'lucide:badge-check'
  if (type === 'review') return 'lucide:clock-alert'
  if (type === 'mrn') return 'lucide:id-card'
  if (type === 'appointment') return 'lucide:calendar-clock'
  return 'lucide:info'
}

const onCardClick = (item) => {
  if (item.type === 'mrn') {
    openRequest(item)
  } else if (item.type === 'appointment') {
    isOpen.value = false
    navigateTo('/dashboard/appointments')
  }
}

// --- ID recovery request detail ---
const requestOpen = ref(false)
const requestLoading = ref(false)
const requestError = ref('')
const requestDetail = ref(null)
const copied = ref(false)
const resolving = ref(false)
const activeRequestId = ref(null)

const parseUserId = (resource) => {
  if (!resource) return null
  const m = String(resource).match(/^User-(.+)$/)
  return m ? m[1] : null
}

const mailtoLink = computed(() => {
  const d = requestDetail.value
  if (!d) return '#'
  const subject = encodeURIComponent(`Your ${d.idLabel} for MyHealth Clinic`)
  const body = encodeURIComponent(
    `Hello ${d.name},\n\nAs requested, your ${d.idLabel} is: ${d.uniqueId}\n\nYou can use this to sign in to the portal.\n\nRegards,\nMyHealth Clinic`
  )
  return `mailto:${d.email}?subject=${subject}&body=${body}`
})

const openRequest = async (item) => {
  const userId = parseUserId(item.resource)
  if (!userId) {
    requestError.value = 'Could not resolve the account for this request.'
    requestOpen.value = true
    return
  }
  activeRequestId.value = item.id
  requestOpen.value = true
  requestLoading.value = true
  requestError.value = ''
  requestDetail.value = null
  copied.value = false
  try {
    const data = await $fetch('/api/admin/user-lookup', { query: { userId } })
    if (data.success) requestDetail.value = data.account
  } catch (e) {
    requestError.value = e.data?.statusMessage || 'Could not load the account details.'
  } finally {
    requestLoading.value = false
  }
}

const closeRequest = () => {
  requestOpen.value = false
  requestDetail.value = null
  requestError.value = ''
}

const copyId = async () => {
  if (!requestDetail.value) return
  try {
    await navigator.clipboard.writeText(requestDetail.value.uniqueId)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    copied.value = false
  }
}

const resolveRequest = async () => {
  resolving.value = true
  try {
    // Hide it locally for this session and bump the seen marker
    markAllRead()
    closeRequest()
  } finally {
    resolving.value = false
  }
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
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
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

.notif-card.review {
  border-left: 3px solid #f59e0b;
}

.notif-card.mrn {
  border-left: 3px solid #6366f1;
}

.notif-card.appointment {
  border-left: 3px solid #0ea5e9;
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

.notif-icon-wrap.review {
  background: #fef3c7;
  color: #d97706;
}

.notif-icon-wrap.mrn {
  background: #e0e7ff;
  color: #4f46e5;
}

.notif-icon-wrap.appointment {
  background: #e0f2fe;
  color: #0284c7;
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

.status-chip.paid,
.status-chip.review,
.status-chip.mrn,
.status-chip.appointment {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

.status-chip.appointment {
  background: #e0f2fe;
  color: #0369a1;
}

.status-chip.paid {
  background: #dcfce7;
  color: #15803d;
}

.status-chip.review {
  background: #fef3c7;
  color: #b45309;
}

.status-chip.mrn {
  background: #e0e7ff;
  color: #4338ca;
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

.notif-msg-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: inherit;
}

.notif-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.notif-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  color: var(--emr-text-muted, #94a3b8);
}

.notif-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #4f46e5;
}

.notif-card.clickable {
  cursor: pointer;
}

.notif-card.clickable:hover {
  background: #eef2ff;
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

/* --- ID recovery request modal --- */
.req-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  padding: 1rem;
}

.req-modal {
  background: #fff;
  width: 100%;
  max-width: 440px;
  border-radius: 18px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.req-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.1rem 1.25rem;
  background: #eef2ff;
  border-bottom: 1px solid #e0e7ff;
}

.req-header-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.req-header h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #312e81;
}

.req-header p {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  color: #6366f1;
}

.req-close {
  margin-left: auto;
  border: none;
  background: transparent;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  padding: 4px;
  border-radius: 6px;
}

.req-close:hover {
  background: #e0e7ff;
}

.req-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1.25rem;
  color: #64748b;
  font-size: 0.9rem;
}

.req-state.error {
  color: #b91c1c;
}

.req-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.req-rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.req-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.req-row strong {
  color: #1e293b;
  text-align: right;
  word-break: break-word;
}

.req-id-box {
  background: #f8fafc;
  border: 1px dashed #c7d2fe;
  border-radius: 12px;
  padding: 1rem;
}

.req-id-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.req-id-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.req-id-value code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.03em;
  word-break: break-all;
}

.req-copy {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid #c7d2fe;
  background: #fff;
  color: #4f46e5;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
}

.req-copy:hover {
  background: #eef2ff;
}

.req-actions {
  display: flex;
  gap: 0.6rem;
}

.req-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 0.75rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: none;
}

.req-btn.email {
  background: #fff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
}

.req-btn.email:hover {
  background: #eef2ff;
}

.req-btn.resolve {
  background: #4f46e5;
  color: #fff;
}

.req-btn.resolve:hover {
  background: #4338ca;
}

.req-btn.resolve:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.req-fade-enter-active,
.req-fade-leave-active {
  transition: opacity 0.2s ease;
}

.req-fade-enter-from,
.req-fade-leave-to {
  opacity: 0;
}
</style>
