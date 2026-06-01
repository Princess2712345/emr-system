<template>
  <div class="portal-page">
      <header class="top-bar portal-top-bar">
        <div class="header-info">
          <h1>Health Records</h1>
          <p class="current-date">{{ displayName }} • MRN {{ registryId }}</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="handleRequestRecord">
            <Icon name="lucide:file-up" /> Request Medical Record
          </button>
          <PatientNotificationBell />
          <NuxtLink to="/patient/profile" class="profile-chip" :title="displayName">
            <div class="avatar-circle purple-theme">{{ initials }}</div>
          </NuxtLink>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <div class="bento-grid portal-bento-grid">
          <div class="bento-card highlight-card" @click="handleVitalClick('Blood Type')">
            <label class="label-caps"><Icon name="lucide:droplet" /> Blood Type</label>
            <p class="main-val">{{ bloodType }}</p>
            <p class="sub-val">Verified Record</p>
          </div>
          <div class="bento-card" @click="handleVitalClick('Allergies')">
            <label class="label-caps"><Icon name="lucide:shield-alert" /> Allergies</label>
            <p class="main-val">None</p>
            <p class="sub-val">No known drug allergies</p>
          </div>
          <div class="bento-card" @click="handleVitalClick('Blood Pressure')">
            <label class="label-caps"><Icon name="lucide:activity" /> Last BP</label>
            <p class="main-val-sm">118/76</p>
            <div class="trend-tag success">Optimal</div>
          </div>
          <div class="bento-card" @click="handleVitalClick('Medications')">
            <label class="label-caps"><Icon name="lucide:pill" /> Active Meds</label>
            <p class="main-val">{{ activeMeds }}</p>
            <p class="sub-val">Prescriptions active</p>
          </div>
        </div>

        <div class="bottom-layout portal-bottom-layout">
          <section class="content-card">
            <div class="card-header">
              <h3><Icon name="lucide:flask-conical" /> Clinical Laboratory Results</h3>
              <div class="header-actions-row">
              <div class="filter-tabs">
                <button 
                  v-for="tab in ['All', 'Labs', 'Imaging', 'Reports']" 
                  :key="tab"
                  @click="recordFilter = tab"
                  :class="['tab', { active: recordFilter === tab }]"
                >
                  {{ tab }}
                </button>
              </div>
              <NuxtLink to="/patient/history" class="view-more-link">See all history</NuxtLink>
              </div>
            </div>
            
            <div class="records-stack">
              <div v-for="record in filteredRecords" :key="record.id" class="record-item">
                <div class="record-icon-box">
                  <Icon :name="record.type === 'Labs' ? 'lucide:test-tube-2' : 'lucide:clipboard-list'" />
                </div>
                
                <div class="record-main-info">
                  <div class="record-header">
                    <span class="record-title">{{ record.name }}</span>
                    <span :class="['status-pill', statusClass(record.resultStatus)]">
                      {{ record.resultStatus }}
                    </span>
                  </div>
                  <div class="record-meta">
                    <span><Icon name="lucide:calendar" /> {{ record.date }}</span>
                    <span><Icon name="lucide:user-round" /> Ordered by {{ record.doctor }}</span>
                  </div>
                </div>

                <div class="record-actions">
                  <button class="btn-outline-sm" @click="handleViewResults(record)">View Results</button>
                  <button class="icon-btn-more" @click="handleDownload(record)" title="Download report (Word)">
                    <Icon name="lucide:download" />
                  </button>
                </div>
              </div>

              <div v-if="filteredRecords.length === 0" class="empty-state">
                <p>No health records found in this category.</p>
              </div>
            </div>
          </section>

          <aside class="widget-stack">
            <div class="info-card-blue">
              <h4><Icon name="lucide:info" /> How to read results?</h4>
              <p class="widget-text">Understand your lab values and reference ranges before your next follow-up.</p>
              <button class="widget-action" @click="handleOpenGuide">Open Patient Guide</button>
            </div>

            <div class="content-card medication-widget">
              <div class="med-widget-head">
                <h4><Icon name="lucide:pill" /> Active Medications</h4>
                <span class="med-count-badge">{{ medications.length }} Rx</span>
              </div>
              <div class="med-item" v-for="med in medications" :key="med.name">
                <div class="med-info">
                  <p class="med-name">{{ med.name }}</p>
                  <p class="med-instruction">{{ med.dose }} • {{ med.timing }}</p>
                </div>
                <button class="med-icon-btn" @click="handleMedInfo(med)">
                  <Icon name="lucide:info" />
                </button>
              </div>

              <div
                v-if="refillRequest"
                class="refill-tracker"
                :class="refillTrackerClass(refillRequest.status)"
              >
                <div class="refill-tracker-top">
                  <div class="refill-tracker-icon">
                    <Icon :name="refillTrackerIcon(refillRequest.status)" />
                  </div>
                  <div class="refill-tracker-text">
                    <p class="refill-tracker-title">{{ refillTrackerTitle(refillRequest.status) }}</p>
                    <p class="refill-tracker-meta">
                      {{ refillRequest.requestRef }} • {{ refillRequest.requestedAt }}
                    </p>
                  </div>
                  <span class="refill-status-pill">{{ refillRequest.status }}</span>
                </div>
                <p class="refill-tracker-meds">{{ refillRequest.medSummary }}</p>
                <p v-if="refillRequest.status === 'Denied' && refillRequest.notes" class="refill-tracker-note">
                  {{ refillRequest.notes }}
                </p>
              </div>

              <button
                class="btn-text-link"
                :disabled="refillSubmitting || !medications.length || refillRequest?.status === 'Pending'"
                @click="handleRequestRefill"
              >
                <Icon v-if="refillSubmitting" name="lucide:loader-2" class="spin" />
                {{ refillSubmitting ? 'Sending…' : refillRequest?.status === 'Pending' ? 'Awaiting pharmacy review' : 'Request Refill' }}
                <Icon v-if="!refillSubmitting && refillRequest?.status !== 'Pending'" name="lucide:arrow-right" />
              </button>
            </div>
          </aside>
        </div>
      </div>

    <Transition name="fade">
      <div v-if="isDetailOpen" class="detail-overlay" @click.self="closeDetail" />
    </Transition>

    <Transition name="slide-panel">
      <aside v-if="isDetailOpen" class="result-detail-panel">
        <div class="detail-panel-header">
          <button type="button" class="detail-close-btn clickable" @click="closeDetail">
            <Icon name="lucide:x" />
          </button>
          <span v-if="selectedRecord" :class="['status-pill', statusClass(selectedRecord.resultStatus)]">
            {{ selectedRecord.resultStatus }}
          </span>
        </div>

        <div v-if="detailLoading" class="detail-loading">
          <Icon name="lucide:loader-2" class="spin-icon" />
          <p>Loading results…</p>
        </div>

        <div v-else-if="selectedRecord" class="detail-panel-body">
          <div class="detail-hero">
            <div class="detail-icon" :class="selectedRecord.colorClass || 'teal'">
              <Icon name="lucide:flask-conical" />
            </div>
            <h2>{{ selectedRecord.name }}</h2>
            <p class="detail-sub">{{ selectedRecord.category }} • {{ selectedRecord.requestId }}</p>
          </div>

          <div class="detail-meta-grid">
            <div class="meta-cell">
              <span class="meta-label">Report date</span>
              <span class="meta-value">{{ selectedRecord.date }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">Ordered by</span>
              <span class="meta-value">{{ selectedRecord.doctor }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">Patient</span>
              <span class="meta-value">{{ selectedRecord.patientName }}</span>
            </div>
            <div class="meta-cell">
              <span class="meta-label">Request ID</span>
              <span class="meta-value id-mono">{{ selectedRecord.requestId }}</span>
            </div>
          </div>

          <section v-if="selectedRecord.pending" class="detail-pending-box">
            <Icon name="lucide:clock" />
            <h3>Results pending review</h3>
            <p>Your sample has been received. Final values will appear here once the laboratory completes review.</p>
          </section>

          <section v-else class="detail-results-section">
            <h3 class="section-title">Test results</h3>
            <div class="results-table-wrap patient-table-wrap">
              <table class="results-table patient-data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Reference</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, idx) in selectedRecord.lines" :key="idx">
                    <td class="test-name">{{ line.name }}</td>
                    <td class="test-value">
                      {{ line.value }}<span v-if="line.unit" class="unit"> {{ line.unit }}</span>
                    </td>
                    <td class="test-range">{{ line.range }}</td>
                    <td>
                      <span :class="['flag-badge', line.flag]">{{ line.flag }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="selectedRecord.findings" class="findings-box">
              <h4>Clinical findings</h4>
              <p>{{ selectedRecord.findings }}</p>
            </div>

            <div v-if="selectedRecord.interpretation" class="interpretation-box">
              <h4>Interpretation</h4>
              <p>{{ selectedRecord.interpretation }}</p>
            </div>

            <div v-if="selectedRecord.filePath" class="report-attachment">
              <h4>Attached report</h4>
              <div v-if="isImage(selectedRecord.filePath)" class="report-image">
                <img :src="selectedRecord.filePath" alt="Lab report" />
              </div>
              <a :href="selectedRecord.filePath" target="_blank" rel="noopener" class="report-file-link">
                <Icon name="lucide:external-link" /> Open full file
              </a>
            </div>
          </section>

          <div class="detail-panel-actions">
            <button type="button" class="action-primary clickable" @click="handlePrint">
              <Icon name="lucide:printer" /> Print report
            </button>
            <button type="button" class="action-secondary clickable" @click="handleDownload(selectedRecord)">
              <Icon name="lucide:download" /> Download Report
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, computed, onMounted } from 'vue'
import { downloadWord, buildInfoTable, buildTable } from '~/utils/exporters'

const { initials, displayName, registryId, requirePatientSession } = usePatientHeader()
const route = useRoute()

const recordFilter = ref('All')
const bloodType = ref('—')
const activeMeds = ref(0)
const records = ref([])
const medications = ref([])
const refillRequest = ref(null)
const userId = ref('')

const isDetailOpen = ref(false)
const detailLoading = ref(false)
const selectedRecord = ref(null)

onMounted(async () => {
  try {
    const user = requirePatientSession()
    if (!user) return
    userId.value = user.id
    const data = await $fetch(`/api/patient/labs?userId=${user.id}`)
    if (data.success) {
      bloodType.value = data.bloodType
      activeMeds.value = data.activeMeds
      medications.value = data.medications || []
      records.value = data.records
      refillRequest.value = data.refillRequest || null
    }

    const openLabId = route.query.open
    if (openLabId && typeof openLabId === 'string') {
      const match = records.value.find((r) => r.id === openLabId)
      if (match) await handleViewResults(match)
    }
  } catch (e) {
    console.error('Labs load failed:', e)
  }
})

const isImage = (src) => typeof src === 'string' && src.startsWith('data:image')

const statusClass = (status) => {
  const s = (status || '').toLowerCase()
  if (s.includes('pending')) return 'pending-review'
  if (s.includes('completed') || s.includes('normal')) return 'normal'
  return 'needs-review'
}

const closeDetail = () => {
  isDetailOpen.value = false
  selectedRecord.value = null
}

// --- COMPUTED ---
const filteredRecords = computed(() => {
  if (recordFilter.value === 'All') return records.value
  return records.value.filter(r => r.type === recordFilter.value)
})

// --- FUNCTIONS ---
const handleRequestRecord = () => {
  alert('Your request for a certified Medical Record has been submitted. You will be notified via email when it is ready for download.')
}

const handleVitalClick = (type) => {
  alert(`Viewing historical trends for: ${type}`)
}

const handleViewResults = async (record) => {
  if (!userId.value || !record?.id) return

  isDetailOpen.value = true
  detailLoading.value = true
  selectedRecord.value = { ...record, lines: [] }

  try {
    const data = await $fetch(`/api/patient/labs/${record.id}?userId=${userId.value}`)
    if (data.success && data.record) {
      selectedRecord.value = data.record
    }
  } catch (e) {
    console.error('Lab detail load failed:', e)
    alert('Could not load result details. Please try again.')
    closeDetail()
  } finally {
    detailLoading.value = false
  }
}

const handlePrint = () => {
  if (!selectedRecord.value) return
  window.print()
}

const buildLabDoc = (rec) => {
  const lines = Array.isArray(rec.lines) ? rec.lines : []
  const resultsHtml = lines.length
    ? buildTable(
        ['Test', 'Result', 'Reference', 'Flag'],
        lines.map((l) => [l.name, `${l.value || ''}${l.unit ? ' ' + l.unit : ''}`, l.range || '', l.flag || 'normal'])
      )
    : '<p class="muted">Results are pending and not yet available.</p>'

  const body =
    `<h1>Laboratory Report</h1>` +
    `<p class="muted">${rec.requestId || ''}</p>` +
    buildInfoTable([
      ['Test', rec.name],
      ['Category', rec.category],
      ['Patient', rec.patientName],
      ['Date reported', rec.date],
      ['Ordered by', rec.doctor],
      ['Status', rec.resultStatus]
    ]) +
    `<h2>Test Results</h2>${resultsHtml}` +
    (rec.findings ? `<h2>Clinical Findings</h2><p>${rec.findings}</p>` : '') +
    (rec.interpretation ? `<h2>Interpretation</h2><p>${rec.interpretation}</p>` : '') +
    `<p style="margin-top:24pt;" class="muted">Generated on ${new Date().toLocaleString('en-US')}</p>`

  downloadWord(`Lab_Report_${(rec.requestId || rec.name || 'result').replace(/[^a-z0-9]/gi, '_')}`, `Lab Report — ${rec.name}`, body)
}

const handleDownload = async (record) => {
  const target = record || selectedRecord.value
  if (!target) return
  // Ensure we have detailed result lines before exporting
  let full = target
  if (!Array.isArray(target.lines) || !target.lines.length) {
    try {
      const data = await $fetch(`/api/patient/labs/${target.id}?userId=${userId.value}`)
      if (data?.record) full = data.record
    } catch (e) {
      console.error('Could not load full lab record for export:', e)
    }
  }
  buildLabDoc(full)
}

const handleOpenGuide = () => {
  alert('Opening the "Patient Guide to Laboratory Results". This includes common terminology and reference ranges.')
}

const handleMedInfo = (med) => {
  alert(`Clinical Information for ${med.name}:\nUsed to treat blood pressure/cholesterol. Do not skip doses.`)
}

const refillSubmitting = ref(false)

const refillTrackerClass = (status) => {
  if (status === 'Approved') return 'approved'
  if (status === 'Denied') return 'denied'
  return 'pending'
}

const refillTrackerIcon = (status) => {
  if (status === 'Approved') return 'lucide:check-circle'
  if (status === 'Denied') return 'lucide:x-circle'
  return 'lucide:clock'
}

const refillTrackerTitle = (status) => {
  if (status === 'Approved') return 'Refill approved — ready for pickup'
  if (status === 'Denied') return 'Refill not approved'
  return 'Pharmacy review in progress'
}

const handleRequestRefill = async () => {
  if (!userId.value || !medications.value.length) {
    alert('No active medications on file to refill.')
    return
  }
  const names = medications.value.map((m) => m.name).join(', ')
  if (!confirm(`Submit a pharmacy refill request for:\n\n${names}\n\nYour care team will review it within 1–2 business days.`)) return

  refillSubmitting.value = true
  try {
    const res = await $fetch(`/api/patient/medication-refill?userId=${userId.value}`, {
      method: 'POST',
      body: { medications: medications.value.map((m) => m.name) }
    })
    alert(res.message || 'Refill request submitted. Staff will review it shortly.')
    const data = await $fetch(`/api/patient/labs?userId=${userId.value}`)
    if (data.success) refillRequest.value = data.refillRequest || null
  } catch (e) {
    console.error('Refill request failed:', e)
    alert(e?.data?.statusMessage || 'Could not submit refill request. Please try again.')
  } finally {
    refillSubmitting.value = false
  }
}

</script>

<style scoped>
.top-bar h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
.header-actions { display: flex; align-items: center; gap: 1.2rem; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; }
.add-btn:hover { background: #1d4ed8; }
.avatar-circle { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: transform 0.2s; }
.avatar-circle:hover { transform: scale(1.05); }
.purple-theme { background: #f3e8ff; color: #7e22ce; border: 2px solid transparent; }
.purple-theme:hover { border-color: #d8b4fe; }

/* --- CONTENT BODY --- */
.bento-card { background: white; padding: 1.5rem; border-radius: 18px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s; }
.bento-card:hover { border-color: #2563eb; transform: translateY(-2px); }
.highlight-card { background: #1e3a8a; color: white; border: none; }
.highlight-card:hover { background: #1e40af; }
.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; pointer-events: none; }
.highlight-card .label-caps { color: #93c5fd; }
.main-val { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0; }
.main-val-sm { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; }
.highlight-card .main-val { color: white; }
.sub-val { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.trend-tag.success { background: #dcfce7; color: #166534; font-size: 0.7rem; padding: 2px 8px; border-radius: 5px; margin-top: 8px; display: inline-block; font-weight: 700; }

.content-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; }

/* --- RECORDS --- */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.header-actions-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.view-more-link {
  color: #2563eb;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
}
.view-more-link:hover { text-decoration: underline; }
.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.records-stack { display: flex; flex-direction: column; gap: 1rem; }
.record-item { display: flex; align-items: center; padding: 1.2rem; border-radius: 16px; border: 1px solid #f1f5f9; background: #fafafa; gap: 1.2rem; transition: 0.2s; }
.record-item:hover { border-color: #dbeafe; background: white; }
.record-icon-box { width: 48px; height: 48px; background: #eff6ff; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.record-main-info { flex: 1; }
.record-title { font-weight: 700; color: #1e3a8a; font-size: 1rem; }
.status-pill { font-size: 0.65rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; margin-left: 10px; vertical-align: middle; }
.status-pill.normal,
.status-pill.completed { background: #dcfce7; color: #166534; }
.status-pill.needs-review { background: #fef2f2; color: #991b1b; }
.status-pill.pending-review { background: #fef3c7; color: #b45309; }
.record-meta { display: flex; gap: 15px; font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.record-meta span { display: flex; align-items: center; gap: 5px; }

.record-actions { display: flex; align-items: center; gap: 8px; }
.btn-outline-sm { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-outline-sm:hover { border-color: #2563eb; color: #2563eb; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; transition: color 0.2s; }
.icon-btn-more:hover { color: #1e3a8a; }

/* --- WIDGETS --- */
.widget-stack { display: flex; flex-direction: column; gap: 1.5rem; }
.info-card-blue { background: #1e3a8a; color: white; padding: 1.5rem; border-radius: 20px; }
.widget-text { font-size: 0.85rem; opacity: 0.8; line-height: 1.5; margin: 10px 0 1.5rem 0; }
.widget-action { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.widget-action:hover { background: rgba(255,255,255,0.2); }

.med-item { padding: 12px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.med-item:last-of-type { border: none; }
.med-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.med-instruction { font-size: 0.8rem; color: #64748b; }
.med-icon-btn { background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 4px; border-radius: 4px; }
.med-icon-btn:hover { color: #2563eb; background: #eff6ff; }
.med-widget-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.med-widget-head h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.med-count-badge {
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
}

.refill-tracker {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.refill-tracker.pending {
  background: #f5f3ff;
  border-color: #ddd6fe;
}
.refill-tracker.approved {
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.refill-tracker.denied {
  background: #fef2f2;
  border-color: #fecaca;
}
.refill-tracker-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.refill-tracker-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
}
.refill-tracker.pending .refill-tracker-icon { color: #7c3aed; }
.refill-tracker.approved .refill-tracker-icon { color: #059669; }
.refill-tracker.denied .refill-tracker-icon { color: #dc2626; }
.refill-tracker-text { flex: 1; min-width: 0; }
.refill-tracker-title {
  margin: 0;
  font-weight: 700;
  font-size: 0.85rem;
  color: #1e293b;
}
.refill-tracker-meta {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: #64748b;
  font-family: ui-monospace, monospace;
}
.refill-status-pill {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.refill-tracker.pending .refill-status-pill { background: #ede9fe; color: #6d28d9; }
.refill-tracker.approved .refill-status-pill { background: #dcfce7; color: #15803d; }
.refill-tracker.denied .refill-status-pill { background: #fee2e2; color: #b91c1c; }
.refill-tracker-meds {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
}
.refill-tracker-note {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: #b91c1c;
  font-style: italic;
}

.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; font-size: 0.85rem; margin-top: 1rem; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.btn-text-link:disabled { color: #94a3b8; cursor: not-allowed; }

.empty-state { padding: 3rem; text-align: center; color: #94a3b8; font-style: italic; }

.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.clickable { cursor: pointer; }
.clickable:active { transform: scale(0.98); }

/* --- RESULT DETAIL PANEL --- */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 2100;
  backdrop-filter: blur(2px);
}

.result-detail-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(480px, 100vw);
  height: 100vh;
  background: white;
  z-index: 2101;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.detail-close-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
}

.detail-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem 2rem;
  -webkit-overflow-scrolling: touch;
}

.detail-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #64748b;
}

.spin-icon,
.spin { animation: spin 1s linear infinite; }
.spin-icon { font-size: 1.5rem; }
@keyframes spin { to { transform: rotate(360deg); } }

.detail-hero { text-align: center; margin-bottom: 1.5rem; }
.detail-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.detail-icon.teal { background: #ccfbf1; color: #0d9488; }
.detail-icon.purple { background: #f3e8ff; color: #7e22ce; }
.detail-icon.pink { background: #fce7f3; color: #db2777; }

.detail-hero h2 {
  font-size: 1.35rem;
  color: #1e3a8a;
  margin: 0 0 0.35rem;
  font-weight: 800;
}

.detail-sub { color: #64748b; font-size: 0.85rem; margin: 0; }

.detail-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.meta-cell {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem;
}

.meta-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 4px;
}

.meta-value { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.id-mono { font-family: ui-monospace, monospace; font-size: 0.75rem; }

.detail-pending-box {
  text-align: center;
  padding: 2rem 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 14px;
  color: #92400e;
}

.detail-pending-box h3 { margin: 0.75rem 0 0.5rem; font-size: 1.1rem; }
.detail-pending-box p { margin: 0; font-size: 0.9rem; line-height: 1.5; }

.section-title {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  margin: 0 0 0.75rem;
  letter-spacing: 0.04em;
}

.results-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.results-table {
  width: 100%;
  min-width: 360px;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.results-table th {
  background: #f8fafc;
  text-align: left;
  padding: 0.65rem 0.75rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}

.results-table td {
  padding: 0.65rem 0.75rem;
  border-top: 1px solid #f1f5f9;
  color: #334155;
}

.test-name { font-weight: 600; color: #1e3a8a; }
.test-value { font-weight: 700; }
.unit { font-weight: 500; color: #64748b; font-size: 0.8rem; }

.flag-badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
}

.flag-badge.normal { background: #dcfce7; color: #166534; }
.flag-badge.high { background: #fee2e2; color: #991b1b; }
.flag-badge.low { background: #dbeafe; color: #1d4ed8; }

.findings-box,
.interpretation-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.findings-box h4,
.interpretation-box h4 {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
}

.findings-box p,
.interpretation-box p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #334155;
}

.report-attachment { margin-bottom: 1rem; }
.report-attachment h4 { margin: 0 0 0.5rem; font-size: 0.8rem; font-weight: 800; color: #475569; text-transform: uppercase; }
.report-image { margin-bottom: 0.6rem; }
.report-image img { width: 100%; max-height: 320px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
.report-file-link { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; font-weight: 700; font-size: 0.85rem; text-decoration: none; }
.report-file-link:hover { text-decoration: underline; }

.detail-panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.action-primary,
.action-secondary {
  width: 100%;
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
}

.action-primary { background: #2563eb; color: white; }
.action-primary:hover { background: #1d4ed8; }
.action-secondary { background: white; border: 1.5px solid #e2e8f0; color: #475569; }
.action-secondary:hover { border-color: #2563eb; color: #2563eb; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 0.3s ease; }
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }

@media (max-width: 768px) {
  .record-item { flex-wrap: wrap; }
  .record-actions { width: 100%; justify-content: flex-end; }
  .result-detail-panel { width: 100vw; }
}
</style>