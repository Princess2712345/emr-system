<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon" />
        <span class="logo-text">MyHealth<span class="text-blue-400">Portal</span></span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/patients/index" class="nav-item">
          <Icon name="lucide:layout-dashboard" /> Dashboard
        </NuxtLink>
        <NuxtLink to="/patients/myappointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/patients/lab-results" class="nav-item active">
          <Icon name="lucide:file-heart" /> Health Records
        </NuxtLink>
        <NuxtLink to="/patients/billing" class="nav-item">
          <Icon name="lucide:credit-card" /> Billing & Payments
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" /> Logout Account
        </button>
      </div>
    </aside>

    <main class="main-content">
      <!-- TOP BAR -->
      <header class="top-bar">
        <div class="header-info">
          <h1>Health Records</h1>
          <p class="current-date">Your clinical history and test results</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable" @click="requestRecord">
            <Icon name="lucide:file-up" /> Request Medical Record
          </button>
          <div class="profile-chip">
            <div class="avatar-circle purple-theme">PRP</div>
          </div>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <!-- VITAL STATS BENTO -->
        <div class="bento-grid">
          <div class="bento-card highlight-card">
            <label class="label-caps"><Icon name="lucide:droplet" /> Blood Type</label>
            <p class="main-val">O+</p>
            <p class="sub-val">Verified Record</p>
          </div>
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:shield-alert" /> Allergies</label>
            <p class="main-val">None</p>
            <p class="sub-val">No known drug allergies</p>
          </div>
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:activity" /> Last BP</label>
            <p class="main-val-sm">118/76</p>
            <div class="trend-tag success">Optimal</div>
          </div>
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:pill" /> Active Meds</label>
            <p class="main-val">2</p>
            <p class="sub-val">Prescriptions active</p>
          </div>
        </div>

        <div class="bottom-layout">
          <!-- RECORDS LIST -->
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
                  <button class="btn-outline-sm" @click="viewDetail(record)">View Results</button>
                  <button class="icon-btn-more" @click="downloadPDF(record)">
                    <Icon name="lucide:download" />
                  </button>
                </div>
              </div>

              <div v-if="filteredRecords.length === 0" class="empty-state">
                <p>No health records found in this category.</p>
              </div>
            </div>
          </section>

          <!-- SIDEBAR WIDGETS -->
          <aside class="widget-stack">
            <div class="info-card-blue">
              <h4><Icon name="lucide:info" /> How to read results?</h4>
              <p class="widget-text">Understand your lab values and reference ranges before your next follow-up.</p>
              <button class="widget-action" @click="openGuide">Open Patient Guide</button>
            </div>

            <div class="content-card medication-widget">
              <h4>Active Medications</h4>
              <div class="med-item" v-for="med in medications" :key="med.name">
                <p class="med-name">{{ med.name }}</p>
                <p class="med-instruction">{{ med.dose }} • {{ med.timing }}</p>
              </div>
              <button class="btn-text-link" @click="requestRefill">
                Request Refill <Icon name="lucide:arrow-right" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const recordFilter = ref('All')

const records = ref([
  { 
    name: 'Complete Blood Count (CBC)', 
    date: 'April 12, 2026', 
    doctor: 'Dr. Cruz', 
    type: 'Labs', 
    resultStatus: 'Normal' 
  },
  { 
    name: 'Chest X-Ray Digital', 
    date: 'March 05, 2026', 
    doctor: 'Dr. Aris', 
    type: 'Imaging', 
    resultStatus: 'Needs Review' 
  },
  { 
    name: 'Lipid Profile', 
    date: 'Jan 20, 2026', 
    doctor: 'Dr. Cruz', 
    type: 'Labs', 
    resultStatus: 'Normal' 
  }
])

const medications = ref([
  { name: 'Lisinopril 10mg', dose: '1 Tablet', timing: 'Once Daily' },
  { name: 'Atorvastatin 20mg', dose: '1 Tablet', timing: 'At Bedtime' }
])

const filteredRecords = computed(() => {
  if (recordFilter.value === 'All') return records.value
  return records.value.filter(r => r.type === recordFilter.value)
})

// --- FUNCTIONS ---
const requestRecord = () => alert('Requesting official signed medical records...')
const viewDetail = (r) => alert(`Opening detailed breakdown for ${r.name}`)
const downloadPDF = (r) => alert(`Downloading PDF for ${r.name}...`)
const openGuide = () => alert('Opening Laboratory Reference Range Guide...')
const requestRefill = () => alert('Your doctor has been notified of your refill request.')
const handleLogout = () => confirm('Sign out?') && navigateTo('/auth')
</script>

<style scoped>
/* REUSING YOUR DASHBOARD CORE STYLES */
.dashboard-layout { display: flex; height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; flex-shrink: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s; }
.nav-item.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
.top-bar { background: white; padding: 1.2rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
.top-bar h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; }

.scrollable-body { padding: 2rem 2.5rem; }
.bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2rem; }
.bento-card { background: white; padding: 1.5rem; border-radius: 18px; border: 1px solid #e2e8f0; }
.highlight-card { background: #1e3a8a; color: white; border: none; }
.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.main-val { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0; }
.highlight-card .main-val { color: white; }
.trend-tag.success { background: #dcfce7; color: #166534; font-size: 0.7rem; padding: 2px 8px; border-radius: 5px; margin-top: 8px; display: inline-block; font-weight: 700; }

.bottom-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.content-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; }

/* RECORDS SPECIFIC */
.records-stack { display: flex; flex-direction: column; gap: 1rem; }
.record-item { display: flex; align-items: center; padding: 1.2rem; border-radius: 16px; border: 1px solid #f1f5f9; background: #fafafa; gap: 1.2rem; transition: 0.2s; }
.record-item:hover { border-color: #dbeafe; background: white; transform: translateY(-2px); }

.record-icon-box { width: 48px; height: 48px; background: #eff6ff; color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.record-main-info { flex: 1; }
.record-title { font-weight: 700; color: #1e3a8a; font-size: 1rem; }
.record-meta { display: flex; gap: 15px; font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.record-meta span { display: flex; align-items: center; gap: 5px; }

.status-pill { font-size: 0.65rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; margin-left: 10px; }
.status-pill.normal { background: #dcfce7; color: #166534; }
.status-pill.needs-review { background: #fef2f2; color: #991b1b; }

.btn-outline-sm { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; }

/* WIDGETS */
.info-card-blue { background: #1e3a8a; color: white; padding: 1.5rem; border-radius: 20px; }
.widget-text { font-size: 0.85rem; opacity: 0.8; line-height: 1.5; margin: 10px 0 1.5rem 0; }
.widget-action { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px; border-radius: 10px; font-weight: 700; cursor: pointer; }

.medication-widget h4 { margin-bottom: 1rem; color: #1e3a8a; }
.med-item { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.med-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.med-instruction { font-size: 0.8rem; color: #64748b; }
.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; font-size: 0.85rem; margin-top: 1rem; cursor: pointer; display: flex; align-items: center; gap: 5px; }

.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>