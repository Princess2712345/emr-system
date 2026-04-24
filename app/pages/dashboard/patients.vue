<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue-light" />
        <span class="logo-text">EMR System</span>
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
          <Icon name="lucide:credit-card" /> Statement of Account
        </NuxtLink>
        <NuxtLink to="/dashboard/appointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/dashboard/statistic" class="nav-item">
          <Icon name="lucide:bar-chart-3" /> Statistics
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div v-if="!selectedPatient" class="header-info">
          <h1>Patient Directory</h1>
          <p>Centralized database for hospital records</p>
        </div>
        <div v-else class="header-info">
          <button class="back-btn clickable" @click="selectedPatient = null">
            <Icon name="lucide:arrow-left" /> Back to Directory
          </button>
          <h1>{{ selectedPatient.name }}</h1>
        </div>
        
        <div class="header-actions">
          <button v-if="!selectedPatient" class="add-btn clickable" @click="isModalOpen = true">
            <Icon name="lucide:user-plus" /> Register Patient
          </button>
          <button v-else class="close-file-btn clickable" @click="selectedPatient = null">
            <Icon name="lucide:file-x-2" /> Close File
          </button>
        </div>
      </header>

      <div class="patient-body">
        <section v-if="!selectedPatient" class="view-section animate-in">
          <div class="table-controls">
            <div class="search-wrapper">
              <Icon name="lucide:search" class="search-icon-svg" />
              <input v-model="searchQuery" type="text" placeholder="Search by name, ID, or email..." />
            </div>
            <div class="filter-group">
              <div class="select-wrapper">
                <Icon name="lucide:filter" class="filter-icon" />
                <select v-model="selectedStatus" class="filter-dropdown clickable">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inpatient">Inpatient</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <button class="reset-btn clickable" @click="resetFilters">
                <Icon name="lucide:rotate-ccw" />
              </button>
            </div>
          </div>

          <div class="table-container">
            <table class="patient-table">
              <thead>
                <tr>
                  <th>Patient Profile</th>
                  <th>ID Number</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th class="text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="patient in filteredPatients" :key="patient.id" class="patient-row clickable" @click="viewPatientFile(patient)">
                  <td>
                    <div class="patient-info">
                      <div class="patient-avatar" :class="patient.colorClass">{{ patient.initials }}</div>
                      <div>
                        <p class="p-name">{{ patient.name }}</p>
                        <p class="p-email">{{ patient.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td><span class="id-badge">{{ patient.id }}</span></td>
                  <td class="visit-date">{{ patient.lastVisit }}</td>
                  <td>
                    <span class="badge" :class="patient.status.toLowerCase()">
                      <span class="dot"></span> {{ patient.status }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="row-action-btn"><Icon name="lucide:chevron-right" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-else class="view-section animate-in">
          <div class="detail-container">
            <div class="detail-card profile-section">
              <div class="detail-header">
                <div class="patient-avatar large" :class="selectedPatient.colorClass">{{ selectedPatient.initials }}</div>
                <div class="header-text">
                  <div class="title-row">
                    <h2>{{ selectedPatient.name }}</h2>
                    <span class="badge" :class="selectedPatient.status.toLowerCase()">
                      <span class="dot"></span> {{ selectedPatient.status }}
                    </span>
                  </div>
                  <div class="meta-row">
                    <span class="id-badge">{{ selectedPatient.id }}</span>
                    <span class="location-tag"><Icon name="lucide:map-pin" /> OPD - Wing B</span>
                  </div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <label><Icon name="lucide:mail" /> Email</label>
                  <p>{{ selectedPatient.email }}</p>
                </div>
                <div class="info-item">
                  <label><Icon name="lucide:calendar" /> Last Seen</label>
                  <p>{{ selectedPatient.lastVisit }}</p>
                </div>
                <div class="info-item">
                  <label><Icon name="lucide:droplet" /> Blood Group</label>
                  <p>O Positive</p>
                </div>
                <div class="info-item">
                  <label><Icon name="lucide:phone" /> Emergency</label>
                  <p>+1 (555) 0123</p>
                </div>
              </div>
            </div>

            <div class="detail-card notes-section">
              <div class="section-title">
                <div class="title-left">
                  <Icon name="lucide:clipboard-list" />
                  <h3>Recent Clinical Notes</h3>
                </div>
                <button class="add-note-btn clickable"><Icon name="lucide:plus" /> New Note</button>
              </div>
              
              <div class="note-item">
                <div class="note-meta">
                  <span class="note-author">Dr. Aris (Cardiology)</span>
                  <span class="note-date">Oct 24, 2025</span>
                </div>
                <p>Patient reports mild fatigue. BP stable at 120/80. No abnormal heart murmurs detected. Suggested routine blood work for next follow-up.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Register New Patient</h3>
            <button class="close-btn" @click="isModalOpen = false"><Icon name="lucide:x" /></button>
          </div>
          <form class="modal-form" @submit.prevent="handleRegister">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter patient name" required />
            </div>
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="email@hospital.com" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="btn-submit">Create Record</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedStatus = ref('All')
const selectedPatient = ref(null)
const isModalOpen = ref(false)

const patients = ref([
  { initials: 'PRP', name: 'Penny Rose Peduhan', email: 'ppeduhan@email.com', id: '#EMR-2045', lastVisit: 'Oct 24, 2025', status: 'Active', colorClass: 'purple' },
  { initials: 'HJB', name: 'Harvey Jhon Bacla-an', email: 'hbaclaan@email.com', id: '#EMR-1192', lastVisit: 'Oct 20, 2025', status: 'Inpatient', colorClass: 'pink' },
  { initials: 'PAB', name: 'Phoebe Angel Barbecho', email: 'pbarbecho@email.com', id: '#EMR-8830', lastVisit: 'Jan 15, 2026', status: 'Pending', colorClass: 'teal' }
])

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const s = searchQuery.value.toLowerCase()
    return p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s)
  })
})

const viewPatientFile = (p) => { selectedPatient.value = p }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }
const handleRegister = () => { alert('Patient Registered'); isModalOpen.value = false }
const handleLogout = () => { if (confirm('Log out?')) alert('Goodbye!') }
</script>

<style scoped>
/* --- 1. CORE LAYOUT (NO DIMENSIONS CHANGED) --- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.dashboard-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, sans-serif; /* Applied globally */
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  background: white;
  padding: 1.25rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.patient-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 2.5rem;
}

/* --- 2. TEXT WEIGHTS & THEME --- */
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item.active { background: #2563eb; color: white; }

.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-family: 'Inter', sans-serif; font-weight: 600; display: flex; align-items: center; gap: 10px; }

/* HEADER TEXT */
.header-info h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.025em; }
.header-info p { color: #64748b; font-size: 0.85rem; font-weight: 400; margin: 4px 0 0; }

/* TABLE COMPONENTS */
.patient-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; font-weight: 400; }
.id-badge { font-family: 'Inter', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #1e3a8a; font-weight: 700; font-size: 0.8rem; }
.visit-date { font-size: 0.9rem; font-weight: 500; color: #475569; }

/* BUTTONS & BADGES */
.add-btn, .btn-submit { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-family: 'Inter', sans-serif; font-weight: 700; }
.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }

/* DETAIL TEXT */
.detail-header h2 { margin: 0; font-size: 1.7rem; font-weight: 800; color: #0f172a; }
.info-item label { font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; }
.info-item p { margin: 0; font-weight: 700; color: #1e293b; font-size: 1rem; }
.note-author { font-weight: 800; color: #1e3a8a; }
.note-item p { font-size: 0.95rem; line-height: 1.6; font-weight: 400; color: #334155; }

/* CONTROLS */
.search-wrapper input { font-family: 'Inter', sans-serif; width: 400px; padding: 0.7rem 1rem 0.7rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
.filter-dropdown { font-family: 'Inter', sans-serif; font-weight: 600; padding: 0 1rem 0 2rem; border-radius: 10px; height: 42px; background: white; border: 1px solid #e2e8f0; }

/* --- 3. ORIGINAL LAYOUT PRESERVATION --- */
.patient-table { width: 100%; border-collapse: collapse; }
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
.patient-avatar.large { width: 64px; height: 64px; font-size: 1.2rem; border-radius: 16px; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; background: #f8fafc; padding: 1.5rem; border-radius: 12px; }

/* UTILS */
.clickable { cursor: pointer; transition: 0.2s; }
.clickable:active { transform: scale(0.98); }
.text-right { text-align: right; }
.row-action-btn { background: none; border: none; color: #cbd5e1; font-size: 1.2rem; }
@keyframes popIn { 0% { opacity: 0; transform: scale(0.8) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
.animate-in { opacity: 0; animation: popIn 0.5s cubic-bezier(0.26, 1.36, 0.74, 1) forwards; }
</style>