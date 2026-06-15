<template>
  <div class="portal-page">
    <header class="top-bar portal-top-bar">
      <div class="header-info">
        <h1>Medical History</h1>
        <p class="current-date">Complete record of visits, labs, and billing</p>
      </div>
      <div class="header-actions portal-header-actions">
        <NuxtLink to="/patient" class="action-outline clickable">
          <Icon name="lucide:arrow-left" /> Back to Dashboard
        </NuxtLink>
        <PatientNotificationBell class="desktop-only" />
      </div>
    </header>

    <div class="scrollable-body animate-in">
      <div class="history-summary">
        <div class="summary-chip">
          <span class="chip-label">Total entries</span>
          <span class="chip-value">{{ counts.total }}</span>
        </div>
        <div class="summary-chip">
          <span class="chip-label">Visits</span>
          <span class="chip-value">{{ counts.visits }}</span>
        </div>
        <div class="summary-chip">
          <span class="chip-label">Lab results</span>
          <span class="chip-value">{{ counts.labs }}</span>
        </div>
        <div class="summary-chip">
          <span class="chip-label">Statements</span>
          <span class="chip-value">{{ counts.bills }}</span>
        </div>
      </div>

      <section class="content-card">
        <div class="card-header">
          <h3><Icon name="lucide:history" /> All history</h3>
          <div class="filter-tabs">
            <button
              v-for="tab in historyTabs"
              :key="tab.id"
              type="button"
              :class="['tab', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="empty-state">Loading your medical history…</div>

        <div v-else class="table-container patient-table-wrap">
          <table class="patient-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Details</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayRows.length === 0">
                <td colspan="6" class="empty-cell">No records in this category yet.</td>
              </tr>
              <tr v-for="row in displayRows" :key="row.id">
                <td class="cell-date">{{ row.date }}</td>
                <td>
                  <span :class="['type-badge', row.type]">{{ typeLabel(row.type) }}</span>
                </td>
                <td class="cell-title">{{ row.title }}</td>
                <td class="cell-sub">{{ row.subtitle }}</td>
                <td>
                  <span :class="['status-pill', statusClass(row.status)]">{{ row.status }}</span>
                </td>
                <td class="text-right">
                  <button
                    v-if="row.type === 'lab' && row.labId"
                    type="button"
                    class="btn-link-sm clickable"
                    @click="goToLab(row.labId)"
                  >
                    View results
                  </button>
                  <NuxtLink
                    v-else-if="row.type === 'visit'"
                    to="/patient/myappointments"
                    class="btn-link-sm"
                  >
                    View visits
                  </NuxtLink>
                  <NuxtLink
                    v-else-if="row.type === 'billing'"
                    to="/patient/billing"
                    class="btn-link-sm"
                  >
                    View billing
                  </NuxtLink>
                  <span v-else class="cell-meta">{{ row.meta }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

const loading = ref(true)
const activeTab = ref('all')
const timeline = ref([])
const visits = ref([])
const labs = ref([])
const bills = ref([])
const counts = ref({ total: 0, visits: 0, labs: 0, bills: 0 })

const historyTabs = [
  { id: 'all', label: 'All' },
  { id: 'visit', label: 'Visits' },
  { id: 'lab', label: 'Labs' },
  { id: 'billing', label: 'Billing' }
]

const displayRows = computed(() => {
  if (activeTab.value === 'all') return timeline.value
  if (activeTab.value === 'visit') return visits.value
  if (activeTab.value === 'lab') return labs.value
  if (activeTab.value === 'billing') return bills.value
  return timeline.value
})

const typeLabel = (type) => {
  const map = {
    visit: 'Visit',
    lab: 'Lab',
    billing: 'Billing',
    disposition: 'Disposition',
    activity: 'Activity'
  }
  return map[type] || type
}

const statusClass = (status) => {
  const s = (status || '').toLowerCase()
  if (s.includes('pending')) return 'pending'
  if (s.includes('paid') || s.includes('completed')) return 'success'
  if (s.includes('unpaid')) return 'warning'
  return 'neutral'
}

const goToLab = (labId) => {
  navigateTo({ path: '/patient/lab-results', query: { open: labId } })
}

onMounted(async () => {
  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return navigateTo('/auth/login')
    const user = JSON.parse(raw)
    const data = await $fetch(`/api/patient/history?userId=${user.id}`)
    if (data.success) {
      timeline.value = data.timeline
      visits.value = data.visits
      labs.value = data.labs
      bills.value = data.bills
      counts.value = data.counts
    }
  } catch (e) {
    console.error('History load failed:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.header-info h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
.header-actions { display: flex; align-items: center; gap: 1rem; }
.action-outline {
  background: white;
  border: 1.5px solid #e2e8f0;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  text-decoration: none;
}

.history-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-chip {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem 1.25rem;
}

.chip-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 4px;
}

.chip-value { font-size: 1.5rem; font-weight: 800; color: #1e3a8a; }

.content-card {
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}

.tab {
  border: none;
  background: none;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
}

.tab.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.type-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
}

.type-badge.visit { background: #dbeafe; color: #1d4ed8; }
.type-badge.lab { background: #f3e8ff; color: #7e22ce; }
.type-badge.billing { background: #fef3c7; color: #b45309; }
.type-badge.disposition { background: #e0e7ff; color: #4338ca; }
.type-badge.activity { background: #f1f5f9; color: #475569; }

.status-pill {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.status-pill.success { background: #dcfce7; color: #166534; }
.status-pill.pending { background: #fef3c7; color: #b45309; }
.status-pill.warning { background: #fee2e2; color: #991b1b; }
.status-pill.neutral { background: #f1f5f9; color: #475569; }

.btn-link-sm {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: none;
}

.cell-title { font-weight: 600; color: #1e293b; max-width: 220px; }
.cell-sub { color: #64748b; font-size: 0.85rem; max-width: 280px; }
.cell-date { white-space: nowrap; font-weight: 600; color: #475569; }
.cell-meta { font-size: 0.8rem; color: #94a3b8; }
.empty-cell { text-align: center; padding: 2.5rem !important; color: #94a3b8; }
.empty-state { padding: 3rem; text-align: center; color: #94a3b8; }

.text-right { text-align: right; }

.animate-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .history-summary { grid-template-columns: repeat(2, 1fr); }
}
</style>
