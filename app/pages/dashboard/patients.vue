<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue-light" />
        <span class="logo-text">EMR System</span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item" style="--order: 1">
          <Icon name="lucide:layout-dashboard" /> Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/patients" class="nav-item active animate-nav" style="--order: 2">
          <Icon name="lucide:users" /> Patients
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item animate-nav" style="--order: 3">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
         <NuxtLink to="/dashboard/confinement" class="nav-item animate-nav" style="--order: 4">
          <Icon name="lucide:bed" /> Confinement
         </NuxtLink>
        <NuxtLink to="/dashboard/inventory" class="nav-item animate-nav" style="--order: 5">
          <Icon name="lucide:package" /> Inventory
        </NuxtLink>
        <NuxtLink to="/dashboard/billing" class="nav-item animate-nav" style="--order: 6">
          <Icon name="lucide:credit-card" /> Statement of Account
        </NuxtLink>
        <NuxtLink to="/dashboard/appointments" class="nav-item animate-nav" style="--order: 7">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/dashboard/statistic" class="nav-item animate-nav" style="--order: 8">
          <Icon name="lucide:bar-chart-3" /> Statistics
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink to="/auth/login" class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </NuxtLink>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div v-if="!selectedPatient" class="welcome-msg">
          <h1>Patient Directory</h1>
          <p>Manage and view all registered patient records across the network.</p>
        </div>
        <div v-else class="welcome-msg">
          <button class="back-btn" @click="selectedPatient = null">
            <Icon name="lucide:chevron-left" /> Back to List
          </button>
          <h1>Medical File: {{ selectedPatient.name }}</h1>
        </div>
        
        <div class="header-actions">
          <button v-if="!selectedPatient" class="add-btn" @click="isModalOpen = true">
            <Icon name="lucide:user-plus" /> Register New Patient
          </button>
          <button v-else class="add-btn" @click="selectedPatient = null">
            <Icon name="lucide:file-x-2" /> Close File
          </button>
        </div>
      </header>

      <section v-if="!selectedPatient" class="patient-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by name, ID, or email..." 
            />
          </div>
          <div class="filter-group">
            <div class="select-wrapper">
               <Icon name="lucide:filter" class="filter-icon" />
               <select v-model="selectedStatus" class="filter-dropdown">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <button class="filter-btn" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" /> Reset
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="patient-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>ID Number</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id">
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar" :class="patient.colorClass">
                      {{ patient.initials }}
                    </div>
                    <div>
                      <p class="p-name">{{ patient.name }}</p>
                      <p class="p-email">{{ patient.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ patient.id }}</span></td>
                <td>{{ patient.lastVisit }}</td>
                <td>
                  <span class="badge" :class="patient.status.toLowerCase()">
                    {{ patient.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-link" @click="viewPatientFile(patient)">
                    <Icon name="lucide:eye" /> View File
                  </button>
                </td>
              </tr>
              <tr v-if="filteredPatients.length === 0">
                <td colspan="5" class="empty-state">
                  No patients found matching "{{ searchQuery }}"
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="patient-body">
        <div class="detail-container">
          <div class="detail-card main-info">
             <div class="detail-header">
                <div class="patient-avatar large" :class="selectedPatient.colorClass">
                  {{ selectedPatient.initials }}
                </div>
                <div>
                  <div class="title-with-status">
                    <h2>{{ selectedPatient.name }}</h2>
                    <span class="badge" :class="selectedPatient.status.toLowerCase()">{{ selectedPatient.status }}</span>
                  </div>
                  <span class="id-badge">{{ selectedPatient.id }}</span>
                </div>
             </div>
             
             <div class="medical-grid">
                <div class="grid-item">
                  <label><Icon name="lucide:mail" /> Primary Email</label>
                  <p>{{ selectedPatient.email }}</p>
                </div>
                <div class="grid-item">
                  <label><Icon name="lucide:clock" /> Last Consultation</label>
                  <p>{{ selectedPatient.lastVisit }}</p>
                </div>
                <div class="grid-item">
                  <label><Icon name="lucide:droplet" /> Blood Type</label>
                  <p>O+</p>
                </div>
                <div class="grid-item">
                  <label><Icon name="lucide:phone" /> Emergency Contact</label>
                  <p>+1 (555) 0123</p>
                </div>
             </div>
          </div>

          <div class="detail-card clinical-notes">
            <div class="section-title-icon">
              <Icon name="lucide:clipboard-list" />
              <h3>Recent Clinical Notes</h3>
            </div>
            <div class="note-entry">
              <p class="note-date">October 24, 2023 — Dr. Aris</p>
              <p>Patient reports mild fatigue. Blood pressure stable at 120/80. Recommended routine blood work for next visit.</p>
            </div>
            <div class="note-entry">
              <p class="note-date">September 15, 2023 — Dr. Aris</p>
              <p>Annual physical examination completed. All vitals within normal range. Vaccinations up to date.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-with-icon">
              <Icon name="lucide:user-circle-2" class="modal-title-icon" />
              <h3>New Patient Registration</h3>
            </div>
            <button class="close-modal" @click="isModalOpen = false">
              <Icon name="lucide:x" />
            </button>
          </div>
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. Jane Smith" required />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="jane@example.com" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn">Create Record</button>
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
const selectedPatient = ref(null)

const patients = ref([
  { initials: 'PRP', name: 'Penny Rose Peduhan', email: 'ppeduhan@email.com', id: '#EMR-2045', lastVisit: 'Oct 24, 2025', status: 'Active', colorClass: 'purple' },
  { initials: 'HJB', name: 'Harvey Jhon Bacla-an', email: 'hbaclaan@email.com', id: '#EMR-1192', lastVisit: 'Oct 20, 2025', status: 'Inpatient', colorClass: 'pink' },
  { initials: 'PAB', name: 'Phoebe Angel Barbecho', email: 'pbarbecho@email.com', id: '#EMR-8830', lastVisit: 'Jan 15, 2026', status: 'Pending', colorClass: 'teal' }
])

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s) || p.email.toLowerCase().includes(s)
    const matchesStatus = selectedStatus.value === 'All' || p.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const viewPatientFile = (patient) => { selectedPatient.value = patient }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }
const handleRegister = () => { alert('Registration successful!'); isModalOpen.value = false }
</script>

<style scoped>
/* --- BASE LAYOUT --- */
dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }

/* Nuxt Active Link Style */
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; }

/* 1. Animation Keyframes */
@keyframes popIn {
  0% { 
    opacity: 0; 
    transform: scale(0.8) translateY(10px); 
  }
  70% { 
    transform: scale(1.05) translateY(-2px); 
  }
  100% { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

.animate-in { 
  opacity: 0; 
  animation: popIn 0.5s cubic-bezier(0.26, 1.36, 0.74, 1) forwards; 
}
.nav-item.active { background: #2563eb; color: white; }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { color: #fca5a5; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 10px; font-size: 1rem; }

/* --- THE REST OF YOUR ORIGINAL STYLES --- */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }
.back-btn { background: none; border: none; color: #2563eb; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; margin-bottom: 4px; }
.patient-body { padding: 2rem 3rem; box-sizing: border-box; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 1.5rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; font-size: 0.9rem; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1.1rem; }
.filter-group { display: flex; gap: 10px; }
.select-wrapper { position: relative; }
.filter-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 0.9rem; pointer-events: none; }
.filter-dropdown { padding: 0 1rem 0 2.2rem; height: 44px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-weight: 600; cursor: pointer; color: #475569; }
.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; cursor: pointer; color: #475569; transition: 0.2s; }
.filter-btn:hover { background: #f8fafc; }
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; background: #dbeafe; color: #2563eb; }
.patient-avatar.purple { background: #f3e8ff; color: #7e22ce; }
.patient-avatar.pink { background: #fce7f3; color: #db2777; }
.patient-avatar.teal { background: #ccfbf1; color: #0d9488; }
.patient-avatar.large { width: 56px; height: 56px; font-size: 1.2rem; border-radius: 14px; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.id-badge { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #1e3a8a; font-weight: 600; font-size: 0.8rem; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.active { background: #dcfce7; color: #15803d; }
.badge.inpatient { background: #fee2e2; color: #b91c1c; }
.badge.pending { background: #fef3c7; color: #b45309; }
.view-link { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: 0.2s; }
.view-link:hover { background: #2563eb; color: white; }
.detail-card { background: white; border-radius: 16px; padding: 2rem; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
.detail-header { display: flex; align-items: center; gap: 20px; margin-bottom: 2rem; }
.title-with-status { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.title-with-status h2 { margin: 0; color: #1e3a8a; font-size: 1.5rem; }
.medical-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.grid-item label { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; }
.grid-item p { margin: 0; font-weight: 600; color: #1e293b; font-size: 1rem; }
.section-title-icon { display: flex; align-items: center; gap: 10px; color: #1e3a8a; margin-bottom: 1rem; }
.section-title-icon h3 { margin: 0; font-size: 1.1rem; }
.note-entry { padding: 1.2rem 0; border-bottom: 1px solid #f1f5f9; }
.note-date { font-weight: 700; color: #2563eb; font-size: 0.85rem; margin-bottom: 6px; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
.add-btn:hover { background: #1d4ed8; }
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 90%; max-width: 440px; border-radius: 16px; padding: 2rem; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-with-icon { display: flex; align-items: center; gap: 10px; color: #1e3a8a; }
.modal-title-icon { font-size: 1.5rem; }
.close-modal { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.text-right { text-align: right; }
.empty-state { padding: 3rem; text-align: center; color: #64748b; font-style: italic; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>