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
        <NuxtLink to="/dashboard/patients" class="nav-item">
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
        <NuxtLink to="/auth/login" class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </NuxtLink>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div v-if="!selectedPatient" class="welcome-msg">
          <h1>Patient Directory</h1>
          <p>Manage and view all registered patient records.</p>
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
            <input v-model="searchQuery" type="text" placeholder="Search by name, ID, or email..." />
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
                    <div class="patient-avatar" :class="patient.colorClass">{{ patient.initials }}</div>
                    <div>
                      <p class="p-name">{{ patient.name }}</p>
                      <p class="p-email">{{ patient.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ patient.id }}</span></td>
                <td>{{ patient.lastVisit }}</td>
                <td><span class="badge" :class="patient.status.toLowerCase()">{{ patient.status }}</span></td>
                <td class="text-right">
                  <button class="view-link" @click="viewPatientFile(patient)">
                    <Icon name="lucide:eye" /> View File
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="patient-body">
        <div class="detail-card">
          <div class="detail-header">
            <div class="patient-avatar large" :class="selectedPatient.colorClass">{{ selectedPatient.initials }}</div>
            <div>
              <h2>{{ selectedPatient.name }}</h2>
              <span class="id-badge">{{ selectedPatient.id }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>New Patient Registration</h3>
            <button class="close-modal" @click="isModalOpen = false"><Icon name="lucide:x" /></button>
          </div>
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" required />
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
    const matchesSearch = p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s)
    const matchesStatus = selectedStatus.value === 'All' || p.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const viewPatientFile = (patient) => { selectedPatient.value = patient }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }
const handleRegister = () => { alert('Success!'); isModalOpen.value = false }
</script>

<style scoped>
/* Restored Layout & Sidebar Styles */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }

.sidebar { 
  width: 280px; background: #1e3a8a; color: white; display: flex; flex-direction: column; 
  padding: 2rem 0.75rem; height: 100vh; position: sticky; top: 0; 
}

.sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 0 1rem; font-weight: 800; margin-bottom: 2.5rem; }

.nav-item { 
  display: flex; align-items: center; gap: 16px; padding: 0.85rem 1.25rem; color: #bfdbfe; 
  text-decoration: none; border-radius: 8px; font-size: 1.05rem; font-weight: 500; transition: 0.2s; 
}

.router-link-active { background: #2563eb !important; color: white !important; }

/* Functional Styles */
.main-content { flex: 1; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.patient-body { padding: 2rem 3rem; }
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table td, .patient-table th { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

/* Utilities */
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.active { background: #dcfce7; color: #15803d; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; padding: 2rem; border-radius: 16px; width: 400px; }
.text-right { text-align: right; }
</style>