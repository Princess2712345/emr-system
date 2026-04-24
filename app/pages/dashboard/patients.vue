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
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn clickable" @click="handleLogout">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div v-if="!selectedPatient" class="welcome-msg">
          <h1>Patient Directory</h1>
          <p>Manage and view registered records.</p>
        </div>
        <div v-else class="welcome-msg">
          <button class="back-btn clickable" @click="selectedPatient = null">
            <Icon name="lucide:arrow-left" /> Back to Directory
          </button>
          <h1>{{ selectedPatient.name }}</h1>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable" @click="isModalOpen = true">
            <Icon name="lucide:user-plus" /> {{ selectedPatient ? 'Update File' : 'Register Patient' }}
          </button>
        </div>
      </header>

      <section v-if="!selectedPatient" class="patient-body">
        <div class="table-controls animate-in">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input v-model="searchQuery" type="text" placeholder="Search records..." />
          </div>
          <div class="filter-group">
            <select v-model="selectedStatus" class="filter-dropdown clickable">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inpatient">Inpatient</option>
            </select>
          </div>
        </div>

        <div class="table-container animate-in">
          <table class="patient-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>ID</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id" class="patient-row clickable" @click="viewPatientFile(patient)">
                <td>
                  <div class="patient-info">
                    <div class="avatar-circle" :class="patient.colorClass">{{ patient.initials }}</div>
                    <div>
                      <p class="p-name">{{ patient.name }}</p>
                      <p class="p-email">{{ patient.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ patient.id }}</span></td>
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

      <section v-else class="patient-body animate-in">
        <div class="detail-card main-info">
          <div class="detail-header">
            <div class="avatar-circle large" :class="selectedPatient.colorClass">{{ selectedPatient.initials }}</div>
            <div class="header-text">
              <div class="title-row">
                <h2>{{ selectedPatient.name }}</h2>
                <span class="badge" :class="selectedPatient.status.toLowerCase()">{{ selectedPatient.status }}</span>
              </div>
              <p class="id-badge">{{ selectedPatient.id }}</p>
            </div>
          </div>
          <div class="medical-grid">
            <div class="grid-item">
              <label><Icon name="lucide:mail" /> Email</label>
              <p>{{ selectedPatient.email }}</p>
            </div>
            <div class="grid-item">
              <label><Icon name="lucide:calendar" /> Last Visit</label>
              <p>{{ selectedPatient.lastVisit }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-content animate-in">
        <h3>Register New Patient</h3>
        <p>Enter patient details to create a new EMR file.</p>
        <button class="add-btn" style="width: 100%; justify-content: center; margin-top: 1rem;" @click="isModalOpen = false">Close</button>
      </div>
    </div>
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
])

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = selectedStatus.value === 'All' || p.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const viewPatientFile = (patient) => { selectedPatient.value = patient }
const handleLogout = () => { alert('Logged out') }
</script>

<style scoped>
/* ANIMATIONS FROM INSPO */
@keyframes popIn {
  0% { opacity: 0; transform: scale(0.97) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-in { animation: popIn 0.4s ease-out forwards; }

/* LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; }

/* SIDEBAR ENHANCED */
.sidebar {
  width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column;
  padding: 2rem 1.2rem; height: 100vh; position: sticky; top: 0;
}
.sidebar-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.2rem; margin-bottom: 2.5rem; }
.icon-blue-light { color: #60a5fa; }

.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe;
  text-decoration: none; border-radius: 8px; transition: all 0.3s;
}
.nav-item:hover { transform: translateX(5px); color: white; background: rgba(255,255,255,0.1); }
.nav-item.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }

/* MAIN CONTENT */
.main-content { flex: 1; min-width: 0; }
.top-bar { background: white; padding: 1.2rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { color: #1e3a8a; font-size: 1.4rem; font-weight: 700; margin: 0; }

/* TABLE & CARDS */
.patient-body { padding: 2rem 2.5rem; }
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; }
.patient-row { border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
.patient-row:hover { background: #f8fafc; }

.avatar-circle {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 0.8rem;
}
.avatar-circle.purple { background: #f3e8ff; color: #7e22ce; }
.avatar-circle.pink { background: #fce7f3; color: #db2777; }
.avatar-circle.large { width: 60px; height: 60px; font-size: 1.2rem; }

/* BUTTONS */
.add-btn {
  background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem;
  border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;
}
.logout-btn { background: none; border: none; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 8px; padding: 1rem; width: 100%; text-align: left; cursor: pointer; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 2rem; border-radius: 16px; width: 400px; }

/* UTILS */
.clickable { cursor: pointer; }
.text-right { text-align: right; }
.id-badge { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; color: #1e3a8a; }
</style>