<template>
  <div class="portal-page">
      <header class="top-bar portal-top-bar">
        <div class="header-info">
          <h1>Health Records</h1>
          <p class="current-date">Your clinical history and test results</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="handleRequestRecord">
            <Icon name="lucide:file-up" /> Request Medical Record
          </button>
          <div class="profile-chip" @click="handleProfileClick">
            <div class="avatar-circle purple-theme">PRP</div>
          </div>
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
            </div>
            
            <div class="records-stack">
              <div v-for="(record, index) in filteredRecords" :key="index" class="record-item">
                <div class="record-icon-box">
                  <Icon :name="record.type === 'Labs' ? 'lucide:test-tube-2' : 'lucide:clipboard-list'" />
                </div>
                
                <div class="record-main-info">
                  <div class="record-header">
                    <span class="record-title">{{ record.name }}</span>
                    <span :class="['status-pill', record.resultStatus.toLowerCase().replace(' ', '-')]">
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
                  <button class="icon-btn-more" @click="handleDownload(record)" title="Download PDF">
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
              <h4>Active Medications</h4>
              <div class="med-item" v-for="med in medications" :key="med.name">
                <div class="med-info">
                  <p class="med-name">{{ med.name }}</p>
                  <p class="med-instruction">{{ med.dose }} • {{ med.timing }}</p>
                </div>
                <button class="med-icon-btn" @click="handleMedInfo(med)">
                  <Icon name="lucide:info" />
                </button>
              </div>
              <button class="btn-text-link" @click="handleRequestRefill">
                Request Refill <Icon name="lucide:arrow-right" />
              </button>
            </div>
          </aside>
        </div>
      </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, computed, onMounted } from 'vue'

const recordFilter = ref('All')
const bloodType = ref('—')
const activeMeds = ref(0)
const records = ref([])
const medications = ref([])

onMounted(async () => {
  try {
    const cachedUser = localStorage.getItem('user_data')
    if (!cachedUser) return navigateTo('/auth/login')
    const user = JSON.parse(cachedUser)
    const data = await $fetch(`/api/patient/labs?userId=${user.id}`)
    if (data.success) {
      bloodType.value = data.bloodType
      activeMeds.value = data.activeMeds
      records.value = data.records
    }
  } catch (e) {
    console.error('Labs load failed:', e)
  }
})

// --- COMPUTED ---
const filteredRecords = computed(() => {
  if (recordFilter.value === 'All') return records.value
  return records.value.filter(r => r.type === recordFilter.value)
})

// --- FUNCTIONS ---
const handleRequestRecord = () => {
  alert('Your request for a certified Medical Record has been submitted. You will be notified via email when it is ready for download.')
}

const handleProfileClick = () => {
  alert('Redirecting to Patient Profile Settings...')
}

const handleVitalClick = (type) => {
  alert(`Viewing historical trends for: ${type}`)
}

const handleViewResults = (record) => {
  alert(`Displaying detailed lab breakdown for: ${record.name}\nDate: ${record.date}`)
}

const handleDownload = (record) => {
  alert(`Generating secure PDF for ${record.name}... Download starting soon.`)
}

const handleOpenGuide = () => {
  alert('Opening the "Patient Guide to Laboratory Results". This includes common terminology and reference ranges.')
}

const handleMedInfo = (med) => {
  alert(`Clinical Information for ${med.name}:\nUsed to treat blood pressure/cholesterol. Do not skip doses.`)
}

const handleRequestRefill = () => {
  const confirmRefill = confirm('Send a refill request to your primary physician for all active medications?')
  if (confirmRefill) alert('Refill request sent! Check your notifications for approval status.')
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
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
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
.status-pill.normal { background: #dcfce7; color: #166534; }
.status-pill.needs-review { background: #fef2f2; color: #991b1b; }
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
.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; font-size: 0.85rem; margin-top: 1rem; cursor: pointer; display: flex; align-items: center; gap: 5px; }

.empty-state { padding: 3rem; text-align: center; color: #94a3b8; font-style: italic; }

.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.clickable { cursor: pointer; }
.clickable:active { transform: scale(0.98); }
</style>