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
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/dashboard/registration" class="nav-item active">
          <Icon name="mdi:account-plus" /> Registration
        </NuxtLink>
        <NuxtLink to="/dashboard/Disposition" class="nav-item">
          <Icon name=lucide:file-output /> Disposition
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
         <NuxtLink to="/dashboard/History" class="nav-item">
          <Icon name="lucide:history" /> History
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
          <h1>Patient Registration</h1>
          <p>Register and manage hospital-wide patient records.</p>
        </div>
        <div class="header-actions">
           <button class="add-btn clickable" @click="isModalOpen = true">
             + Register New Patient
           </button>
        </div>
      </header>

      <section class="dashboard-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by name, ID, or contact number..." 
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedType" class="filter-dropdown clickable">
              <option value="All">All Patient Types</option>
              <option value="In-patient">In-patient</option>
              <option value="Out-patient">Out-patient</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div class="activity-card animate-in">
          <table class="confinement-table">
            <thead>
              <tr>
                <th>Patient Name & ID</th>
                <th>Contact Information</th>
                <th>Registration Date</th>
                <th>Type</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id" class="activity-item">
                <td>
                  <div class="patient-info">
                    <div class="room-badge admitted">
                      {{ patient.initials }}
                    </div>
                    <div>
                      <p class="p-name">{{ patient.name }}</p>
                      <p class="p-email">ID: {{ patient.patientId }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    <p class="p-name">{{ patient.phone }}</p>
                    <p class="p-email">{{ patient.email }}</p>
                  </div>
                </td>
                <td><span class="duration-tag">{{ patient.regDate }}</span></td>
                <td>
                  <span class="badge" :class="patient.type.toLowerCase().replace('-', '')">
                    {{ patient.type }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-all-link clickable" @click="viewProfile(patient)">
                    Edit Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredPatients.length === 0" class="empty-results">
            No patients found matching your criteria.
          </div>
        </div>
      </section>
    </main>

    <!-- REGISTRATION MODAL -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content animate-in">
          <h3>New Patient Registration</h3>
          <form @submit.prevent="handleRegistration">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Last Name, First Name Middle Name" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date of Birth</label>
                <input type="date" required />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select class="filter-dropdown" style="width: 100%">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Contact Number</label>
              <input type="tel" placeholder="09XX-XXX-XXXX" required />
            </div>
            <div class="form-group">
                <label>Patient Classification</label>
                <select class="filter-dropdown" style="width: 100%">
                  <option>Out-patient</option>
                  <option>In-patient</option>
                  <option>Emergency</option>
                </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="view-all-link" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn">Save Record</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- STATE MANAGEMENT ---
const searchQuery = ref('')
const selectedType = ref('All')
const isModalOpen = ref(false)

const patients = ref([
  { id: 1, name: 'John Doe', initials: 'JD', patientId: 'P-2024-001', phone: '0912-345-6789', email: 'john@example.com', regDate: 'May 01, 2026', type: 'In-patient' },
  { id: 2, name: 'Alice Smith', initials: 'AS', patientId: 'P-2024-002', phone: '0998-765-4321', email: 'alice.s@mail.com', regDate: 'May 03, 2026', type: 'Out-patient' },
  { id: 3, name: 'Robert Johnson', initials: 'RJ', patientId: 'P-2024-003', phone: '0915-111-2222', email: 'rob.j@hospital.com', regDate: 'May 05, 2026', type: 'Emergency' }
])

// --- COMPUTED PROPERTIES ---
const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(s) || p.patientId.toLowerCase().includes(s)
    const matchesType = selectedType.value === 'All' || p.type === selectedType.value
    return matchesSearch && matchesType
  })
})

// --- METHODS ---

const viewProfile = (p) => {
  console.log("Navigating to patient profile:", p.patientId)
  alert(`Opening clinical profile for ${p.name}`)
}

const handleRegistration = () => {
  // Logic for adding a new patient would go here
  alert('Patient Registered Successfully!')
  isModalOpen.value = false
}

const deletePatient = (id) => {
  if (confirm('Are you sure you want to remove this patient record? This action cannot be undone.')) {
    patients.value = patients.value.filter(p => p.id !== id)
  }
}

/** 
 * Functional Logout Handler 
 * Clears authentication cookies and session data
 */
const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      // 1. Clear the Auth Cookie
      const token = useCookie('auth_token')
      token.value = null
      
      // 2. Clear Client-side storage
      if (process.client) {
        localStorage.removeItem('user_data')
        sessionStorage.clear()
      }

      // 3. Redirect to login page
      await navigateTo('/auth/login') 
      
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}
</script>


<style scoped>
/* ALL STYLES REMAIN IDENTICAL TO YOUR ORIGINAL TO PRESERVE DESIGN */
/* Added specific badge colors for the registration types */
.badge.inpatient { background: #dcfce7; color: #15803d; }
.badge.outpatient { background: #dbeafe; color: #2563eb; }
.badge.emergency { background: #fee2e2; color: #dc2626; }

/* Import your original styles here... (copied from your provided code) */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.dashboard-body { padding: 2rem 3rem; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.filter-dropdown { padding: 0 1rem; height: 44px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-weight: 600; color: #475569; }
.activity-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.confinement-table { width: 100%; border-collapse: collapse; }
.confinement-table th { text-align: left; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.activity-item td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
.patient-info { display: flex; align-items: center; gap: 12px; }
.room-badge { width: 45px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
.room-badge.admitted { background: #dbeafe; color: #2563eb; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.view-all-link { color: #2563eb; font-weight: 700; cursor: pointer; border: none; background: none; }
.text-right { text-align: right; }
.animate-in { animation: popIn 0.4s ease-out forwards; }
@keyframes popIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 2.5rem; border-radius: 16px; width: 500px; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 5px; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.clickable:hover { opacity: 0.8; transform: translateY(-1px); transition: 0.2s; cursor: pointer; }
</style>