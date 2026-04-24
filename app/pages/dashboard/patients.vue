<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <Icon name="mdi:hospital-building" />
        </div>
        <span class="logo-text">MedFlow <small>EMR</small></span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item">
          <Icon name="lucide:layout-dashboard" /> Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/patients" class="nav-item active">
          <Icon name="lucide:users" /> Patients
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
         <NuxtLink to="/dashboard/confinement" class="nav-item">
          <Icon name="lucide:bed" /> Confinement
         </NuxtLink>
        <NuxtLink to="/dashboard/inventory" class="nav-item">
          <Icon name="lucide:package" /> Inventory
        </NuxtLink>
        <NuxtLink to="/dashboard/billing" class="nav-item">
          <Icon name="lucide:credit-card" /> Billing
        </NuxtLink>
        <NuxtLink to="/dashboard/statistic" class="nav-item">
          <Icon name="lucide:bar-chart-3" /> Statistics
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn"><Icon name="lucide:log-out" /> Logout</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="header-left">
          <template v-if="!selectedPatient">
            <h1>Patient Directory</h1>
            <p>Managing {{ patients.length }} registered records</p>
          </template>
          <template v-else>
            <button class="back-link" @click="selectedPatient = null">
              <Icon name="lucide:chevron-left" /> Back to Directory
            </button>
            <div class="title-with-badge">
              <h1>{{ selectedPatient.name }}</h1>
              <span class="id-tag">{{ selectedPatient.id }}</span>
            </div>
          </template>
        </div>
        
        <div class="header-actions">
          <button v-if="!selectedPatient" class="primary-btn" @click="isModalOpen = true">
            <Icon name="lucide:user-plus" /> Register Patient
          </button>
          <div v-else class="action-group">
            <button class="secondary-btn"><Icon name="lucide:printer" /></button>
            <button class="primary-btn"><Icon name="lucide:edit-3" /> Edit File</button>
          </div>
        </div>
      </header>

      <section class="content-body">
        <div v-if="!selectedPatient" class="view-animate">
          <div class="action-bar">
            <div class="search-box">
              <Icon name="lucide:search" />
              <input v-model="searchQuery" type="text" placeholder="Search by name, ID, or email..." />
            </div>
            <div class="filter-group">
              <div class="custom-select">
                <Icon name="lucide:filter" />
                <select v-model="selectedStatus">
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inpatient">Inpatient</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <button class="refresh-btn" @click="resetFilters"><Icon name="lucide:rotate-ccw" /></button>
            </div>
          </div>

          <div class="table-card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Medical ID</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(patient, index) in filteredPatients" 
                    :key="patient.id" 
                    class="table-row"
                    :style="{ '--delay': index * 0.05 + 's' }">
                  <td>
                    <div class="patient-profile-cell">
                      <div class="avatar-box" :style="{ backgroundColor: patient.color }">
                        {{ patient.initials }}
                      </div>
                      <div class="profile-info">
                        <span class="p-name">{{ patient.name }}</span>
                        <span class="p-sub">{{ patient.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td><code class="id-code">{{ patient.id }}</code></td>
                  <td>{{ patient.lastVisit }}</td>
                  <td>
                    <span class="status-pill" :class="patient.status.toLowerCase()">
                      {{ patient.status }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="view-btn" @click="viewPatientFile(patient)">
                      View File <Icon name="lucide:arrow-right" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="view-animate">
          <div class="patient-master-grid">
            <div class="card profile-card">
              <div class="profile-header">
                <div class="avatar-large" :style="{ backgroundColor: selectedPatient.color }">
                  {{ selectedPatient.initials }}
                </div>
                <div class="main-meta">
                  <span class="status-pill" :class="selectedPatient.status.toLowerCase()">{{ selectedPatient.status }}</span>
                  <h2>{{ selectedPatient.name }}</h2>
                  <p><Icon name="lucide:mail" /> {{ selectedPatient.email }}</p>
                </div>
              </div>
              
              <div class="quick-vitals">
                <div class="vital-item">
                  <label>Blood Type</label>
                  <span>O Positive</span>
                </div>
                <div class="vital-item">
                  <label>Emergency Contact</label>
                  <span>+1 (555) 098-7654</span>
                </div>
              </div>
            </div>

            <div class="card notes-card">
              <div class="card-header">
                <div class="title-with-icon">
                  <Icon name="lucide:clipboard-list" />
                  <h3>Clinical Observations</h3>
                </div>
                <button class="text-link">+ Add Note</button>
              </div>
              <div class="notes-timeline">
                <div class="timeline-entry">
                  <span class="entry-date">Oct 24, 2025</span>
                  <h4>Routine Consultation — Dr. Aris</h4>
                  <p>Patient reports stable energy levels. Blood pressure maintained at 120/80. No medication changes needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedStatus = ref('All')
const isModalOpen = ref(false)
const selectedPatient = ref(null)

const patients = ref([
  { initials: 'PRP', name: 'Penny Rose Peduhan', email: 'ppeduhan@email.com', id: '#EMR-2045', lastVisit: 'Oct 24, 2025', status: 'Active', color: '#8b5cf6' },
  { initials: 'HJB', name: 'Harvey Jhon Bacla-an', email: 'hbaclaan@email.com', id: '#EMR-1192', lastVisit: 'Oct 20, 2025', status: 'Inpatient', color: '#ec4899' },
  { initials: 'PAB', name: 'Phoebe Angel Barbecho', email: 'pbarbecho@email.com', id: '#EMR-8830', lastVisit: 'Jan 15, 2026', status: 'Pending', color: '#14b8a6' }
])

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s)
    const matchesStatus = selectedStatus.value === 'All' || p.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const viewPatientFile = (p) => { selectedPatient.value = p }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }
</script>

<style scoped>
/* --- CORE LAYOUT --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }

/* --- SIDEBAR (Standardized) --- */
.sidebar { width: 280px; background: #0f172a; color: white; display: flex; flex-direction: column; padding: 2rem 1.25rem; position: sticky; top: 0; height: 100vh; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 2.5rem; }
.logo-icon { background: #2563eb; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 1.4rem; }
.logo-text { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; }
.logo-text small { font-weight: 400; opacity: 0.6; font-size: 0.7rem; display: block; margin-top: -4px; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.85rem 1rem; color: #94a3b8; text-decoration: none; border-radius: 10px; font-weight: 500; transition: 0.2s; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-item.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

.sidebar-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
.logout-btn { background: none; border: none; color: #fca5a5; font-weight: 700; width: 100%; display: flex; align-items: center; gap: 10px; cursor: pointer; }

/* --- HEADER --- */
.main-content { flex: 1; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
.header-left h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
.header-left p { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

.back-link { background: none; border: none; color: #2563eb; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; margin-bottom: 4px; }
.title-with-badge { display: flex; align-items: center; gap: 12px; }
.id-tag { background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; color: #475569; font-weight: 700; }

.primary-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.primary-btn:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

/* --- CONTENT --- */
.content-body { padding: 2rem 2.5rem; }

.action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; }
.search-box { position: relative; flex: 1; max-width: 500px; }
.search-box input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; transition: 0.2s; }
.search-box input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
.search-box .icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.filter-group { display: flex; gap: 10px; }
.custom-select { position: relative; }
.custom-select select { appearance: none; background: white; border: 1px solid #e2e8f0; padding: 0.75rem 2.5rem; border-radius: 12px; font-weight: 700; color: #475569; cursor: pointer; }
.custom-select .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.refresh-btn { background: white; border: 1px solid #e2e8f0; width: 44px; border-radius: 12px; cursor: pointer; color: #64748b; }

/* --- TABLE --- */
.table-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }

.table-row { transition: 0.2s; animation: slideUp 0.4s ease forwards; opacity: 0; animation-delay: var(--delay); }
.table-row:hover { background: #f8fafc; }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

.patient-profile-cell { display: flex; align-items: center; gap: 12px; }
.avatar-box { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 0.85rem; }
.profile-info { display: flex; flex-direction: column; }
.p-name { font-weight: 700; color: #0f172a; }
.p-sub { font-size: 0.8rem; color: #64748b; }

.id-code { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; color: #1e3a8a; font-weight: 600; }

.status-pill { padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.status-pill.active { background: #dcfce7; color: #166534; }
.status-pill.inpatient { background: #fee2e2; color: #991b1b; }
.status-pill.pending { background: #fef3c7; color: #92400e; }

.view-btn { background: #f1f5f9; border: none; padding: 0.6rem 1rem; border-radius: 10px; font-weight: 700; color: #2563eb; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
.view-btn:hover { background: #2563eb; color: white; }

/* --- DETAIL VIEW --- */
.patient-master-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; animation: slideUp 0.4s ease; }
.card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 2rem; }

.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 2rem; }
.avatar-large { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: 800; }
.main-meta h2 { margin: 8px 0 4px; font-size: 1.5rem; color: #0f172a; letter-spacing: -0.5px; }
.main-meta p { margin: 0; color: #64748b; font-size: 0.9rem; }

.quick-vitals { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.vital-item label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
.vital-item span { font-weight: 700; color: #1e293b; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.title-with-icon { display: flex; align-items: center; gap: 10px; color: #2563eb; }
.title-with-icon h3 { margin: 0; color: #0f172a; font-weight: 800; }
.text-link { color: #2563eb; font-weight: 700; background: none; border: none; cursor: pointer; }

.timeline-entry { padding-left: 1.5rem; border-left: 2px solid #2563eb; position: relative; }
.timeline-entry::before { content: ''; position: absolute; left: -7px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: white; border: 3px solid #2563eb; }
.entry-date { font-size: 0.8rem; font-weight: 800; color: #2563eb; }
.timeline-entry h4 { margin: 8px 0; font-size: 1rem; }
.timeline-entry p { color: #64748b; line-height: 1.6; font-size: 0.95rem; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.text-right { text-align: right; }
</style>