<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed }">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!isCollapsed">
          <Icon name="mdi:hospital-building" class="icon-blue-light" />
          <span class="logo-text">EMR System</span>
        </div>
        <!-- HAMBURGER TOGGLE -->
        <button class="menu-toggle clickable" @click="isCollapsed = !isCollapsed">
          <Icon :name="isCollapsed ? 'lucide:menu' : 'lucide:chevron-left'" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-item">
          <Icon :name="link.icon" />
          <span v-if="!isCollapsed" class="nav-label">{{ link.label }}</span>
          <!-- Floating Tooltip for Collapsed State -->
          <span v-if="isCollapsed" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed">Logout</span>
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
             <Icon name="lucide:plus" /> Register New Patient
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
            <div class="select-wrapper">
              <Icon name="lucide:filter" class="filter-icon" />
              <select v-model="selectedType" class="filter-dropdown clickable">
                <option value="All">All Patient Types</option>
                <option value="In-patient">In-patient</option>
                <option value="Out-patient">Out-patient</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
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
          <div class="modal-header">
            <h3>New Patient Registration</h3>
            <button @click="isModalOpen = false" class="close-x">✕</button>
          </div>
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
                <select class="modal-select">
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
                <select class="modal-select">
                  <option>Out-patient</option>
                  <option>In-patient</option>
                  <option>Emergency</option>
                </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-clear" @click="isModalOpen = false">Cancel</button>
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
const isCollapsed = ref(false)
const searchQuery = ref('')
const selectedType = ref('All')
const isModalOpen = ref(false)

const navLinks = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
  { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
  { to: '/dashboard/registration', icon: 'mdi:account-plus', label: 'Registration' },
  { to: '/dashboard/Disposition', icon: 'lucide:file-output', label: 'Disposition' },
  { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
  { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
  { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
  { to: '/dashboard/History', icon: 'lucide:history', label: 'History' },
]

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
  alert(`Opening clinical profile for ${p.name}`)
}

const handleRegistration = () => {
  alert('Patient Registered Successfully!')
  isModalOpen.value = false
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    const token = useCookie('auth_token')
    token.value = null
    if (process.client) {
      localStorage.removeItem('user_data')
      sessionStorage.clear()
    }
    await navigateTo('/auth/login')
  }
}
</script>

<style scoped>
/* BASE LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR REFINED DESIGN */
.sidebar { 
  width: 260px; 
  background: #1e3a8a; 
  color: white; 
  display: flex; 
  flex-direction: column; 
  padding: 1.5rem 1rem; 
  height: 100vh; 
  position: sticky; 
  top: 0; 
  z-index: 100; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }

.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.menu-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  cursor: pointer;
}

/* SIDEBAR NAVIGATION */
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { 
  position: relative;
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 0.8rem 1rem; 
  color: #bfdbfe; 
  text-decoration: none; 
  border-radius: 8px; 
  font-weight: 500; 
  transition: all 0.2s ease; 
  white-space: nowrap;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { padding-left: 0.8rem; }

.router-link-active { background: #2563eb !important; color: white !important; }

/* TOOLTIP FOR COLLAPSED STATE */
.sidebar-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 15px;
  background: #0f172a;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 1000;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; }
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; }
.is-collapsed .logout-btn { justify-content: center; }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.dashboard-body { padding: 2rem 3rem; }

/* CONTROLS & TABLE */
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.select-wrapper { display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 12px; }
.filter-icon { color: #64748b; margin-right: 8px; }
.filter-dropdown { border: none; height: 44px; font-weight: 600; color: #475569; outline: none; background: transparent; }

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
.badge.inpatient { background: #dcfce7; color: #15803d; }
.badge.outpatient { background: #dbeafe; color: #2563eb; }
.badge.emergency { background: #fee2e2; color: #dc2626; }

.add-btn { background: #2563eb; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.view-all-link { color: #2563eb; font-weight: 700; cursor: pointer; border: none; background: none; }

/* MODAL STYLES */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 2.5rem; border-radius: 16px; width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.close-x { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 5px; }
.form-group input, .modal-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-clear { background: #f1f5f9; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

.clickable:hover { opacity: 0.8; transform: translateY(-1px); transition: 0.2s; }
.animate-in { animation: popIn 0.4s ease-out forwards; }
@keyframes popIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
</style>