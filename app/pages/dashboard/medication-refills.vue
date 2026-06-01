<template>
  <div class="portal-page dashboard-page">
    <header class="top-bar portal-top-bar">
      <div class="welcome-msg">
        <h1>Pharmacy Refills</h1>
        <p>Review e-prescription refill requests and authorize pharmacy fulfillment.</p>
      </div>
      <div class="header-actions portal-header-actions">
        <button class="filter-btn clickable" type="button" @click="reloadRefills">
          <Icon name="lucide:refresh-cw" /> Refresh
        </button>
      </div>
    </header>

    <section class="refills-body animate-in">
      <div class="billing-stats">
        <button
          type="button"
          class="b-stat-card purple clickable"
          :class="{ active: statusFilter === 'Pending' }"
          @click="statusFilter = 'Pending'"
        >
          <span class="b-label">Awaiting pharmacy</span>
          <p class="b-value">{{ pendingCount }}</p>
        </button>
        <button
          type="button"
          class="b-stat-card green clickable"
          :class="{ active: statusFilter === 'Approved' }"
          @click="statusFilter = 'Approved'"
        >
          <span class="b-label">Approved (30 days)</span>
          <p class="b-value">{{ approvedCount }}</p>
        </button>
        <button
          type="button"
          class="b-stat-card orange clickable"
          :class="{ active: statusFilter === 'Denied' }"
          @click="statusFilter = 'Denied'"
        >
          <span class="b-label">Not approved</span>
          <p class="b-value">{{ deniedCount }}</p>
        </button>
      </div>

      <div class="table-controls">
        <div class="search-wrapper">
          <Icon name="lucide:search" class="search-icon-svg" />
          <input v-model="searchQuery" type="text" placeholder="Search RX ID, patient, or medication..." />
        </div>
        <div class="filter-group">
          <div class="select-wrapper">
            <Icon name="lucide:filter" class="filter-icon" />
            <select v-model="statusFilter" class="filter-dropdown clickable">
              <option value="All">All requests</option>
              <option value="Pending">Pending review</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
          <button class="filter-btn clickable" type="button" @click="resetFilters">
            <Icon name="lucide:rotate-ccw" /> Reset
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="billing-table">
          <thead>
            <tr>
              <th>RX &amp; patient</th>
              <th>Medications</th>
              <th>Requested</th>
              <th>Status</th>
              <th class="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.id">
              <td>
                <div class="rx-info">
                  <div class="rx-icon">
                    <Icon name="lucide:pill" />
                  </div>
                  <div>
                    <p class="rx-id">{{ row.requestRef }}</p>
                    <div class="patient-inline">
                      <div class="patient-avatar purple">
                        <img v-if="row.avatar" :src="row.avatar" alt="" class="avatar-img" />
                        <Icon v-else name="lucide:user" />
                      </div>
                      <div>
                        <p class="p-name">{{ row.patientName }}</p>
                        <p class="p-email">{{ row.mrn || 'MRN pending' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="med-chips">
                  <span v-for="med in row.medications" :key="med" class="med-chip">{{ med }}</span>
                </div>
                <p class="med-count">{{ row.medCount }} prescription{{ row.medCount === 1 ? '' : 's' }}</p>
              </td>
              <td><p class="date-text">{{ row.requestedAt }}</p></td>
              <td>
                <span class="badge" :class="badgeClass(row.status)">{{ row.status }}</span>
              </td>
              <td class="col-action">
                <div class="action-btns">
                  <template v-if="row.status === 'Pending'">
                    <button
                      type="button"
                      class="approve-link clickable"
                      :disabled="processingId === row.id"
                      @click="openReview(row)"
                    >
                      <Icon name="lucide:check" /> Approve
                    </button>
                    <button
                      type="button"
                      class="deny-btn clickable"
                      :disabled="processingId === row.id"
                      @click="openReview(row, 'reject')"
                    >
                      <Icon name="lucide:x" /> Deny
                    </button>
                  </template>
                  <template v-else>
                    <button type="button" class="view-link clickable" @click="openCase(row)">
                      View record
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="5" class="empty-row">
                <Icon name="lucide:inbox" />
                <p>No refill requests match your filters.</p>
                <span>Patient requests from Health Records will appear here.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Review modal (billing-style) -->
    <Transition name="fade">
      <div v-if="reviewOpen" class="modal-overlay" @click.self="closeReview">
        <div class="modal-content review-modal">
          <div class="modal-header">
            <div class="header-with-icon">
              <Icon name="lucide:pill" class="modal-title-icon" />
              <h3>Review refill request</h3>
            </div>
            <button type="button" class="close-modal clickable" @click="closeReview">
              <Icon name="lucide:x" />
            </button>
          </div>

          <div v-if="reviewRow" class="review-body">
            <div class="case-identity">
              <div class="case-avatar">
                <img v-if="reviewRow.avatar" :src="reviewRow.avatar" alt="" class="avatar-img" />
                <Icon v-else name="lucide:user" />
              </div>
              <div>
                <p class="case-name">{{ reviewRow.patientName }}</p>
                <p class="case-sub">{{ reviewRow.requestRef }} • {{ reviewRow.mrn || 'MRN pending' }}</p>
              </div>
              <span class="badge pending-approval">Pending</span>
            </div>

            <div class="review-rows">
              <div class="review-row">
                <span>Requested</span>
                <strong>{{ reviewRow.requestedAt }}</strong>
              </div>
              <div class="review-row" v-if="reviewRow.phone">
                <span>Contact</span>
                <strong>{{ reviewRow.phone }}</strong>
              </div>
              <div class="review-row" v-if="reviewRow.email">
                <span>Email</span>
                <strong>{{ reviewRow.email }}</strong>
              </div>
            </div>

            <div class="rx-med-list">
              <span class="proof-label">Medications requested</span>
              <ul>
                <li v-for="med in reviewRow.medications" :key="med">
                  <Icon name="lucide:pill" />
                  {{ med }}
                </li>
              </ul>
            </div>

            <div v-if="reviewMode === 'reject'" class="form-group">
              <label>Denial note (optional)</label>
              <textarea
                v-model="denyNotes"
                rows="3"
                placeholder="e.g. Needs follow-up visit before refill"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary clickable" @click="closeReview">Cancel</button>
            <div class="modal-actions-end">
              <template v-if="reviewMode === 'reject'">
                <button
                  type="button"
                  class="btn-secondary clickable"
                  :disabled="!!processingId"
                  @click="reviewMode = 'approve'"
                >
                  Back
                </button>
                <button
                  type="button"
                  class="deny-btn clickable"
                  :disabled="!!processingId"
                  @click="submitDecision('reject')"
                >
                  <Icon name="lucide:x" /> Confirm denial
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="deny-btn clickable"
                  :disabled="!!processingId"
                  @click="reviewMode = 'reject'"
                >
                  <Icon name="lucide:x" /> Deny
                </button>
                <button
                  type="button"
                  class="approve-link clickable"
                  :disabled="!!processingId"
                  @click="submitDecision('approve')"
                >
                  <Icon name="lucide:check" /> Approve refill
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Case file modal -->
    <Transition name="fade">
      <div v-if="activeCase" class="modal-overlay" @click.self="activeCase = null">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-with-icon">
              <Icon name="lucide:folder-open" class="modal-title-icon" />
              <h3>Refill record</h3>
            </div>
            <button type="button" class="close-modal" @click="activeCase = null">✕</button>
          </div>

          <div class="case-identity">
            <div class="case-avatar">
              <img v-if="activeCase.avatar" :src="activeCase.avatar" alt="" class="avatar-img" />
              <Icon v-else name="lucide:user" />
            </div>
            <div>
              <p class="case-name">{{ activeCase.patientName }}</p>
              <p class="case-sub">{{ activeCase.requestRef }}</p>
            </div>
            <span class="badge" :class="badgeClass(activeCase.status)">{{ activeCase.status }}</span>
          </div>

          <div class="case-rows">
            <div class="case-row">
              <span class="case-label"><Icon name="lucide:pill" /> Medications</span>
              <span class="case-val">{{ activeCase.medSummary }}</span>
            </div>
            <div class="case-row">
              <span class="case-label"><Icon name="lucide:calendar" /> Requested</span>
              <span class="case-val">{{ activeCase.requestedAt }}</span>
            </div>
            <div v-if="activeCase.reviewedBy" class="case-row">
              <span class="case-label"><Icon name="lucide:user-check" /> Reviewed by</span>
              <span class="case-val">{{ activeCase.reviewedBy }}</span>
            </div>
            <div v-if="activeCase.reviewedAt" class="case-row">
              <span class="case-label"><Icon name="lucide:clock" /> Reviewed at</span>
              <span class="case-val">{{ activeCase.reviewedAt }}</span>
            </div>
            <div v-if="activeCase.notes" class="case-row">
              <span class="case-label"><Icon name="lucide:message-square" /> Notes</span>
              <span class="case-val">{{ activeCase.notes }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary clickable" @click="activeCase = null">Close</button>
            <NuxtLink to="/dashboard/registration" class="add-btn clickable">
              <Icon name="lucide:external-link" /> Patient registry
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, computed, onMounted, onUnmounted } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('Pending')
const activeCase = ref(null)
const processingId = ref(null)
const reviewOpen = ref(false)
const reviewRow = ref(null)
const reviewMode = ref('approve')
const denyNotes = ref('')

let refillPoll = null

const { data: refills, refresh: reloadRefills } = await useFetch('/api/medication-refills', {
  key: 'medication-refills-feed'
})

const badgeClass = (status) => {
  if (status === 'Approved') return 'paid'
  if (status === 'Denied') return 'unpaid'
  return 'pending-approval'
}

const filteredRows = computed(() => {
  const list = refills.value || []
  const q = searchQuery.value.trim().toLowerCase()
  return list.filter((row) => {
    if (statusFilter.value !== 'All' && row.status !== statusFilter.value) return false
    if (!q) return true
    return (
      row.patientName?.toLowerCase().includes(q) ||
      row.medSummary?.toLowerCase().includes(q) ||
      row.mrn?.toLowerCase().includes(q) ||
      row.requestRef?.toLowerCase().includes(q)
    )
  })
})

const pendingCount = computed(() => (refills.value || []).filter((r) => r.status === 'Pending').length)
const approvedCount = computed(() => (refills.value || []).filter((r) => r.status === 'Approved').length)
const deniedCount = computed(() => (refills.value || []).filter((r) => r.status === 'Denied').length)

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'Pending'
}

const openCase = (row) => {
  activeCase.value = row
}

const openReview = (row, mode = 'approve') => {
  reviewRow.value = row
  reviewMode.value = mode
  denyNotes.value = ''
  reviewOpen.value = true
}

const closeReview = () => {
  reviewOpen.value = false
  reviewRow.value = null
  reviewMode.value = 'approve'
  denyNotes.value = ''
}

const submitDecision = async (decision) => {
  const row = reviewRow.value
  if (!row || processingId.value) return

  processingId.value = row.id
  try {
    const res = await $fetch(`/api/medication-refills/${row.id}`, {
      method: 'PATCH',
      body: {
        decision,
        notes: decision === 'reject' ? denyNotes.value : '',
        reviewedBy: 'Pharmacy — Central'
      }
    })
    await reloadRefills()
    closeReview()
    if (activeCase.value?.id === row.id) activeCase.value = null
    alert(res.message || 'Refill updated.')
  } catch (e) {
    alert(e?.data?.statusMessage || 'Could not process refill.')
  } finally {
    processingId.value = null
  }
}

onMounted(() => {
  refillPoll = setInterval(() => reloadRefills(), 20000)
})

onUnmounted(() => {
  if (refillPoll) clearInterval(refillPoll)
})
</script>

<style scoped>
.refills-body {
  padding: 2.5rem 3rem;
  width: 100%;
  box-sizing: border-box;
}

.billing-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.b-stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  min-height: 120px;
  border: 2px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.b-stat-card.purple {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  animation-delay: 0.1s;
}
.b-stat-card.green {
  background: linear-gradient(135deg, #10b981, #059669);
  animation-delay: 0.2s;
}
.b-stat-card.orange {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation-delay: 0.3s;
}

.b-stat-card:hover,
.b-stat-card.active {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

.b-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
  opacity: 0.95;
}

.b-value {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 800;
  margin: 0;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 600px;
}

.search-wrapper input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  background: white;
}

.search-icon-svg {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 12px;
}

.filter-icon {
  color: #64748b;
  margin-right: 8px;
}

.filter-dropdown {
  border: none;
  height: 48px;
  font-weight: 600;
  color: #475569;
  outline: none;
  background: transparent;
}

.filter-btn {
  padding: 0 1.2rem;
  height: 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
}

.billing-table th {
  background: #f8fafc;
  padding: 1.2rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  border-bottom: 1px solid #e2e8f0;
}

.billing-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.col-action {
  text-align: right;
  width: 220px;
  white-space: nowrap;
}

.rx-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rx-icon {
  width: 44px;
  height: 44px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.rx-id {
  font-weight: 700;
  color: #1e3a8a;
  margin: 0 0 8px;
  font-family: ui-monospace, monospace;
  font-size: 0.85rem;
}

.patient-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.patient-avatar.purple {
  background: #f3e8ff;
  color: #7e22ce;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p-name {
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  font-size: 0.9rem;
}

.p-email {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.med-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.med-chip {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.med-count {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

.date-text {
  margin: 0;
  color: #475569;
  font-weight: 500;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}

.badge.paid { background: #dcfce7; color: #15803d; }
.badge.unpaid { background: #fee2e2; color: #b91c1c; }
.badge.pending-approval { background: #ede9fe; color: #6d28d9; }

.action-btns {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.approve-link,
.deny-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1;
  min-height: 36px;
  white-space: nowrap;
  transition: background 0.2s, opacity 0.2s;
}

.approve-link {
  color: white;
  background: #059669;
}

.approve-link:hover:not(:disabled) {
  background: #047857;
}

.deny-btn {
  color: #b91c1c;
  background: #fee2e2;
}

.deny-btn:hover:not(:disabled) {
  background: #fecaca;
}

.approve-link:disabled,
.deny-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.view-link {
  color: #2563eb;
  background: #eff6ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
}

.empty-row {
  text-align: center;
  padding: 3rem 1.5rem !important;
  color: #64748b;
}

.empty-row :deep(svg) {
  font-size: 2rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.empty-row p {
  font-weight: 700;
  color: #475569;
  margin: 0.5rem 0;
}

.empty-row span {
  font-size: 0.85rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.review-modal {
  max-width: 520px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e3a8a;
}

.modal-title-icon {
  font-size: 1.3rem;
}

.close-modal {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.25rem;
}

.case-identity > div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.case-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f3e8ff;
  color: #7e22ce;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.case-name {
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.case-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 2px 0 0;
  font-family: ui-monospace, monospace;
}

.case-identity .badge {
  margin-left: auto;
}

.review-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1.25rem;
}

.review-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.review-row span {
  color: #64748b;
}

.proof-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.75rem;
  letter-spacing: 0.04em;
}

.rx-med-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rx-med-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 10px;
  font-weight: 600;
  color: #1e293b;
}

.case-rows {
  display: flex;
  flex-direction: column;
}

.case-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0.7rem 0.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.case-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
}

.case-val {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
}

.form-group {
  margin-top: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #475569;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.modal-actions-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: auto;
}

.btn-secondary {
  background: #f1f5f9;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.add-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  cursor: pointer;
}

.modal-actions .approve-link {
  padding: 0.65rem 1.2rem;
}

.modal-actions .deny-btn {
  padding: 0.65rem 1.2rem;
}

.clickable {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .refills-body {
    padding: 1.25rem 1rem;
  }

  .billing-stats {
    grid-template-columns: 1fr;
  }

  .col-action {
    width: auto;
    white-space: normal;
  }

  .action-btns {
    flex-direction: column;
    align-items: stretch;
  }

  .approve-link,
  .deny-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
