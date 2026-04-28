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

            <div class="search-wrapper">
              <Icon name="lucide:search" class="search-icon-svg" />
              <input v-model="searchQuery" type="text" placeholder="Search by name, ID, or email..." />
            </div>
          </div>

          <div class="table-container">
            <table class="patient-table">
              <thead>
                <tr>
                  <th>PATIENT PROFILE</th>
                  <th>ID NUMBER</th>
                  <th>LAST VISIT</th>
                  <th>STATUS</th>
                  <th>MANAGE</th>
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
                  <td>{{ patient.lastVisit }}</td>
                  <td>
                    <span class="badge" :class="patient.status.toLowerCase()">
                      <span class="dot"></span> {{ patient.status }}
                    </span>
                  </td>
                  <td class="text-right">
                    <Icon name="lucide:chevron-right" class="row-arrow" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-else class="view-section animate-in">
          <div class="detail-header-card">
             <div class="patient-avatar large" :class="selectedPatient.colorClass">{{ selectedPatient.initials }}</div>
             <div class="detail-title-area">
                <h2>{{ selectedPatient.name }}</h2>
                <div class="detail-sub">
                  <span class="badge" :class="selectedPatient.status.toLowerCase()"><span class="dot"></span> {{ selectedPatient.status }}</span>
                  <span class="id-badge">{{ selectedPatient.id }}</span>
                  <span class="loc"><Icon name="lucide:map-pin" /> OPD - Wing B</span>
                </div>
             </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label><Icon name="lucide:mail" /> EMAIL</label>
              <p>{{ selectedPatient.email }}</p>
            </div>
            <div class="info-item">
              <label><Icon name="lucide:calendar" /> LAST SEEN</label>
              <p>{{ selectedPatient.lastVisit }}</p>
            </div>
            <div class="info-item">
              <label><Icon name="lucide:droplet" /> BLOOD GROUP</label>
              <p>O Positive</p>
            </div>
            <div class="info-item">
              <label><Icon name="lucide:phone" /> EMERGENCY</label>
              <p>+1 (555) 0123</p>
            </div>
          </div>

          <div class="notes-container">
            <div class="notes-header">
              <h3><Icon name="lucide:clipboard-list" /> Recent Clinical Notes</h3>
              <button class="add-note-btn clickable" @click="handleNewNote">+ New Note</button>
            </div>
            
            <div v-for="(note, index) in patientNotes" :key="index" class="note-box">
               <div class="note-head">
                 <span class="dr">{{ note.doctor }}</span>
                 <span class="date">{{ note.date }}</span>
               </div>
               <p>{{ note.content }}</p>
            </div>
          </div>
        </section>
      </div>

      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content animate-in">
          <div class="modal-header">
            <h3>Register New Patient</h3>
            <button @click="isModalOpen = false" class="close-modal-btn">✕</button>
          </div>
          
          <form @submit.prevent="handleRegister" class="modal-form">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="regForm.name" type="text" placeholder="Enter patient name" required />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input v-model="regForm.email" type="email" placeholder="email@hospital.com" required />
            </div>
            <div class="form-group">
              <label>Initial Status</label>
              <select v-model="regForm.status">
                <option value="Active">Active</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="submit-btn">Complete Registration</button>
            </div>
          </form>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// UI States
const searchQuery = ref('')
const selectedStatus = ref('All')
const selectedPatient = ref(null)
const isModalOpen = ref(false)

// Registration Form State
const regForm = ref({
  name: '',
  email: '',
  status: 'Active'
})

// Patient Data
const patients = ref([
  { initials: 'PRP', name: 'Penny Rose Peduhan', email: 'ppeduhan@email.com', id: '#EMR-2045', lastVisit: 'Oct 24, 2025', status: 'Active', colorClass: 'purple' },
  { initials: 'HJB', name: 'Harvey Jhon Bacla-an', email: 'hbaclaan@email.com', id: '#EMR-1192', lastVisit: 'Oct 20, 2025', status: 'Inpatient', colorClass: 'pink' },
  { initials: 'PAB', name: 'Phoebe Angel Barbecho', email: 'pbarbecho@email.com', id: '#EMR-8830', lastVisit: 'Jan 15, 2026', status: 'Pending', colorClass: 'teal' }
])

const patientNotes = ref([
  { 
    doctor: 'Dr. Aris (Cardiology)', 
    date: 'Oct 24, 2025', 
    content: 'Patient reports mild fatigue. BP stable at 120/80. No abnormal heart murmurs detected. Suggested routine blood work for next follow-up.' 
  }
])

// --- Methods ---

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = selectedStatus.value === 'All' || p.status === selectedStatus.value;
    return matchesSearch && matchesStatus;
  })
})

const viewPatientFile = (p) => { selectedPatient.value = p }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }

const handleRegister = () => {
  // Generate initials (e.g., "John Doe" -> "JD")
  const initials = regForm.value.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);

  // Pick a random color class for the avatar
  const colors = ['purple', 'pink', 'teal'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newPatientObj = {
    initials,
    name: regForm.value.name,
    email: regForm.value.email,
    id: `#EMR-${Math.floor(1000 + Math.random() * 8999)}`,
    lastVisit: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: regForm.value.status,
    colorClass: randomColor
  }

  // Add to start of list
  patients.value.unshift(newPatientObj)

  // Reset and Close
  regForm.value = { name: '', email: '', status: 'Active' }
  isModalOpen.value = false
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      const token = useCookie('auth_token')
      token.value = null
      if (process.client) {
        localStorage.clear()
        sessionStorage.clear()
      }
      await navigateTo('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}

const handleNewNote = () => {
  const newNote = prompt("Enter clinical note:")
  if (newNote) {
    patientNotes.value.unshift({
      doctor: 'Dr. User (Internal Medicine)',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: newNote
    })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { font-family: 'Inter', sans-serif !important; }

/* Original Layout Styles */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; }

.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { background: white; padding: 1.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.header-info h1 { font-size: 1.5rem; font-weight: 800; margin: 0; }
.header-info p { color: #64748b; font-size: 0.85rem; margin: 4px 0 0; }

.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.add-btn:hover { background: #1d4ed8; }
.back-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.close-file-btn { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }

.patient-body { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }
.table-controls { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; width: 100%; }
.filter-group { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
.search-wrapper { position: relative; flex: 1; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-wrapper input { width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }

.select-wrapper { position: relative; }
.filter-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
.filter-dropdown { padding: 8px 10px 8px 30px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; font-weight: 600; min-width: 160px; }
.reset-btn { padding: 8px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; display: flex; align-items: center; }

.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { padding: 15px 20px; text-align: left; font-size: 11px; color: #64748b; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; }
.patient-row:hover { background: #f8fafc; }
.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; }
.p-name { font-weight: 700; margin: 0; font-size: 14px; }
.p-email { font-size: 12px; color: #64748b; margin: 0; }
.id-badge { background: #f1f5f9; padding: 3px 8px; border-radius: 5px; color: #1e3a8a; font-weight: 700; font-size: 12px; }

.detail-header-card { display: flex; gap: 20px; align-items: center; margin-bottom: 30px; }
.detail-title-area h2 { margin: 0; font-size: 24px; font-weight: 800; }
.detail-sub { display: flex; align-items: center; gap: 15px; margin-top: 8px; }
.loc { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 5px; }

.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.info-item { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #f1f5f9; }
.info-item label { font-size: 10px; font-weight: 800; color: #64748b; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
.info-item p { margin: 0; font-weight: 700; font-size: 15px; }

.notes-container { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
.notes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.note-box { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #f1f5f9; margin-bottom: 12px; }
.note-head { display: flex; justify-content: space-between; margin-bottom: 10px; }
.dr { font-weight: 800; color: #1e3a8a; font-size: 14px; }
.date { font-size: 12px; color: #94a3b8; }

.purple { background: #f3e8ff; color: #7e22ce; }
.pink { background: #fce7f3; color: #db2777; }
.teal { background: #ccfbf1; color: #0d9488; }
.patient-avatar.large { width: 60px; height: 60px; font-size: 20px; }

.badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; }
.badge.active { background: #dcfce7; color: #15803d; }
.badge.inpatient { background: #fee2e2; color: #b91c1c; }
.badge.pending { background: #fef3c7; color: #b45309; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* MODAL SPECIFIC STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e3a8a; }
.close-modal-btn { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }

.modal-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.form-group input, .form-group select { padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; }
.form-group input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.modal-actions { display: flex; gap: 12px; margin-top: 1rem; }
.cancel-btn { flex: 1; padding: 0.8rem; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.submit-btn { flex: 2; padding: 0.8rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
.submit-btn:hover { background: #1d4ed8; }

.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.clickable { cursor: pointer; }
</style>