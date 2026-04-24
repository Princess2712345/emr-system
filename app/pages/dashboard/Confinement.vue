<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon" />
        <span class="logo-text">EMR System</span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item">
          <Icon name="lucide:layout-dashboard" /> Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/patients" class="nav-item">
          <Icon name="lucide:users" /> Patients
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/dashboard/confinement" class="nav-item active">
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
        <div class="welcome-msg">
          <h1>Confinement Records</h1>
          <p>Track patient admissions, room assignments, and discharge summaries.</p>
        </div>
        <div class="header-actions">
          <button class="add-btn" @click="isModalOpen = true">+ Admit New Patient</button>
        </div>
      </header>

      <section class="confinement-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by patient, room, or diagnosis..." 
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedStatus" class="filter-dropdown">
              <option value="All">All Admissions</option>
              <option value="Admitted">Currently Admitted</option>
              <option value="Discharged">Discharged</option>
              <option value="Observation">Observation</option>
            </select>
            <button class="filter-btn" @click="resetFilters">Reset Filters</button>
          </div>
        </div>

        <div class="table-container">
          <table class="confinement-table">
            <thead>
              <tr>
                <th>Patient & Room</th>
                <th>Admission Date</th>
                <th>Stay Duration</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in filteredRecords" :key="record.id">
                <td>
                  <div class="patient-info">
                    <div class="room-badge" :class="record.status.toLowerCase()">
                      {{ record.roomNumber }}
                    </div>
                    <div>
                      <p class="p-name">{{ record.patientName }}</p>
                      <p class="diagnosis">{{ record.diagnosis }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    <span class="main-date">{{ record.admitDate }}</span>
                    <span class="sub-date" v-if="record.dischargeDate">Discharged: {{ record.dischargeDate }}</span>
                  </div>
                </td>
                <td><span class="duration-tag">{{ record.duration }}</span></td>
                <td>
                  <span class="badge" :class="record.status.toLowerCase()">
                    {{ record.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-link" @click="viewSummary(record)">
                    View Summary
                  </button>
                </td>
              </tr>
              
              <tr v-if="filteredRecords.length === 0">
                <td colspan="5" class="empty-state">No confinement records found matching your search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>New Admission Request</h3>
            <button class="close-modal" @click="isModalOpen = false">&times;</button>
          </div>
          <form @submit.prevent="handleAdmission">
            <div class="form-group">
              <label>Patient Name</label>
              <input type="text" placeholder="Search patient..." required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Room Number</label>
                <input type="text" placeholder="e.g. 402-A" required />
              </div>
              <div class="form-group">
                <label>Ward</label>
                <select class="modal-select">
                  <option>General Medicine</option>
                  <option>Pediatrics</option>
                  <option>ICU</option>
                  <option>Maternity</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Initial Diagnosis</label>
              <textarea placeholder="Brief clinical notes..." rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn">Process Admission</button>
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
const isModalOpen = ref(false)

const confinementRecords = ref([
  {
    id: 1,
    patientName: 'John Doe',
    diagnosis: 'Acute Appendicitis',
    roomNumber: '402-A',
    admitDate: 'Oct 20, 2023',
    dischargeDate: 'Oct 24, 2023',
    duration: '4 Days',
    status: 'Discharged'
  },
  {
    id: 2,
    patientName: 'Alice Smith',
    diagnosis: 'Pneumonia',
    roomNumber: '205-B',
    admitDate: 'Oct 22, 2023',
    dischargeDate: null,
    duration: '2 Days (Current)',
    status: 'Admitted'
  },
  {
    id: 3,
    patientName: 'Robert Johnson',
    diagnosis: 'Post-Op Monitoring',
    roomNumber: 'ICU-04',
    admitDate: 'Oct 23, 2023',
    dischargeDate: null,
    duration: '1 Day (Current)',
    status: 'Observation'
  },
  {
    id: 4,
    patientName: 'Sarah Williams',
    diagnosis: 'Dengue Fever',
    roomNumber: '310-C',
    admitDate: 'Oct 15, 2023',
    dischargeDate: 'Oct 20, 2023',
    duration: '5 Days',
    status: 'Discharged'
  }
])

const filteredRecords = computed(() => {
  return confinementRecords.value.filter(r => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = r.patientName.toLowerCase().includes(s) || 
                          r.roomNumber.toLowerCase().includes(s) || 
                          r.diagnosis.toLowerCase().includes(s)
    
    const matchesStatus = selectedStatus.value === 'All' || r.status === selectedStatus.value
    
    return matchesSearch && matchesStatus
  })
})

const viewSummary = (record) => {
  alert(`Loading Admission Summary for ${record.patientName}\nRoom: ${record.roomNumber}\nStay: ${record.duration}`)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'All'
}

const handleAdmission = () => {
  alert('Patient successfully admitted to the ward.')
  isModalOpen.value = false
}
</script>

<style scoped>
/* --- CORE LAYOUT --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }

/* --- SIDEBAR --- */
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }

/* --- UPDATED LOGO STYLES (MATCHING SIZE) --- */
.sidebar-logo { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin-bottom: 3rem; 
}
.logo-icon { 
  color: #60a5fa; 
  font-size: 1.25rem; /* Icon size */
  flex-shrink: 0;
}
.logo-text { 
  font-size: 1.25rem; /* Exact same font size as icon */
  font-weight: 800; 
  line-height: 1;    /* Removes extra spacing around letters */
  color: white;
}

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }

.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

/* --- MAIN CONTENT & TOP BAR --- */
.main-content { flex: 1; display: flex; flex-direction: column; width: 100%; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.8rem; color: #1e3a8a; margin: 0; }
.top-bar p { color: #64748b; margin-top: 4px; }
.confinement-body { padding: 2.5rem 3rem; width: 100%; box-sizing: border-box; }

/* --- CONTROLS --- */
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 2rem; }
.search-wrapper { position: relative; flex: 1; max-width: 600px; }
.search-wrapper input { width: 100%; padding: 0.85rem 1rem 0.85rem 3rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; background: white; font-size: 0.95rem; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); }
.filter-group { display: flex; gap: 12px; }
.filter-dropdown, .filter-btn { padding: 0 1.2rem; height: 48px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #475569; font-weight: 600; cursor: pointer; }

/* --- TABLE --- */
.table-container { background: white; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; overflow: hidden; }
.confinement-table { width: 100%; border-collapse: collapse; }
.confinement-table th { background-color: #f8fafc; padding: 1.2rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.confinement-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.patient-info { display: flex; align-items: center; gap: 16px; }
.room-badge { width: 50px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
.room-badge.admitted { background: #dbeafe; color: #2563eb; }
.room-badge.discharged { background: #f1f5f9; color: #64748b; }
.room-badge.observation { background: #fef3c7; color: #b45309; }

.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 1rem; }
.diagnosis { font-size: 0.85rem; color: #64748b; margin: 0; }

.date-info { display: flex; flex-direction: column; }
.main-date { font-weight: 600; color: #334155; }
.sub-date { font-size: 0.75rem; color: #94a3b8; }

.duration-tag { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #475569; }

/* --- STATUS BADGES --- */
.badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
.badge.admitted { background: #dcfce7; color: #15803d; }
.badge.discharged { background: #f1f5f9; color: #64748b; }
.badge.observation { background: #fef3c7; color: #b45309; }

/* --- BUTTONS --- */
.view-link { color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.view-link:hover { background: #2563eb; color: white; }
.add-btn { background-color: #2563eb; color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 12px; font-weight: 700; cursor: pointer; }
.text-right { text-align: right; }
.empty-state { text-align: center; color: #94a3b8; padding: 4rem !important; font-style: italic; }

/* --- MODAL --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 520px; border-radius: 20px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.form-group { margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input, .modal-select, textarea { width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box;}
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1.5rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>