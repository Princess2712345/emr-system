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
        <div class="welcome-msg">
          <h1>Confinement Records</h1>
          <p>Manage patient admissions and room status.</p>
        </div>
        <div class="header-actions">
           <button class="add-btn clickable" @click="isModalOpen = true">
             + Admit New Patient
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
              placeholder="Search by patient name or room..." 
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedStatus" class="filter-dropdown clickable">
              <option value="All">All Admissions</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
              <option value="Observation">Observation</option>
            </select>
          </div>
        </div>

        <div class="activity-card animate-in">
          <table class="confinement-table">
            <thead>
              <tr>
                <th>Patient & Room</th>
                <th>Admission Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in filteredRecords" :key="record.id" class="activity-item">
                <td>
                  <div class="patient-info">
                    <div class="room-badge" :class="record.status.toLowerCase()">
                      {{ record.roomNumber }}
                    </div>
                    <div>
                      <p class="p-name">{{ record.patientName }}</p>
                      <p class="p-email">{{ record.diagnosis }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    <p class="p-name">{{ record.admitDate }}</p>
                  </div>
                </td>
                <td><span class="duration-tag">{{ record.duration }}</span></td>
                <td>
                  <span class="badge" :class="record.status.toLowerCase()">
                    {{ record.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-all-link clickable" @click="viewSummary(record)">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredRecords.length === 0" class="empty-results">
            No confinement records found.
          </div>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content animate-in">
          <h3>Admit New Patient</h3>
          <form @submit.prevent="handleAdmission">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter patient name" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Room Number</label>
                <input type="text" placeholder="e.g. 101" required />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select class="filter-dropdown">
                  <option>Admitted</option>
                  <option>Observation</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="view-all-link" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn">Confirm Admission</button>
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
  { id: 1, patientName: 'John Doe', diagnosis: 'Acute Appendicitis', roomNumber: '402-A', admitDate: 'Oct 20, 2023', duration: '4 Days', status: 'Discharged' },
  { id: 2, patientName: 'Alice Smith', diagnosis: 'Pneumonia', roomNumber: '205-B', admitDate: 'Oct 22, 2023', duration: '2 Days', status: 'Admitted' },
  { id: 3, patientName: 'Robert Johnson', diagnosis: 'Observation', roomNumber: 'ICU-04', admitDate: 'Oct 23, 2023', duration: '1 Day', status: 'Observation' }
])

const filteredRecords = computed(() => {
  return confinementRecords.value.filter(r => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = r.patientName.toLowerCase().includes(s) || r.roomNumber.toLowerCase().includes(s)
    const matchesStatus = selectedStatus.value === 'All' || r.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const viewSummary = (record) => alert(`Details for ${record.patientName}`)
const handleAdmission = () => { alert('Patient Admitted!'); isModalOpen.value = false }
const handleLogout = () => { if (confirm('Log out?')) alert('Goodbye!') }
</script>

<style scoped>
/* BASE THEME IMPORTS */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR & LOGO */
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 3rem; padding-left: 0.5rem; height: 32px; }
.logo-icon { color: #60a5fa; font-size: 24px !important; width: 24px; height: 24px; flex-shrink: 0; }
.logo-text { font-size: 20px; font-weight: 800; line-height: 1; color: white; letter-spacing: -0.5px; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.dashboard-body { padding: 2rem 3rem; }

/* CONTROLS */
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; transition: 0.3s; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.filter-dropdown { padding: 0 1rem; height: 44px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-weight: 600; color: #475569; }

/* TABLE & ACTIVITY CARDS */
.activity-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.confinement-table { width: 100%; border-collapse: collapse; }
.confinement-table th { text-align: left; padding: 1rem; font-size: 0.75rem; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.activity-item td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }

/* PATIENT INFO & BADGES */
.patient-info { display: flex; align-items: center; gap: 12px; }
.room-badge { width: 45px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
.room-badge.admitted { background: #dbeafe; color: #2563eb; }
.room-badge.discharged { background: #f1f5f9; color: #64748b; }
.room-badge.observation { background: #fef3c7; color: #b45309; }

.p-name { font-weight: 700; color: #1e293b; margin: 0; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.admitted { background: #dcfce7; color: #15803d; }
.badge.discharged { background: #f1f5f9; color: #64748b; }
.badge.observation { background: #fef3c7; color: #b45309; }

/* BUTTONS */
.add-btn { background: #2563eb; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; transition: 0.2s; }
.view-all-link { color: #2563eb; font-weight: 700; text-decoration: none; font-size: 0.85rem; border: none; background: none; }
.text-right { text-align: right; }

/* ANIMATIONS */
@keyframes popIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
.animate-in { animation: popIn 0.4s ease-out forwards; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; padding: 2.5rem; border-radius: 16px; width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 5px; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }

/* UTILITIES */
.clickable { cursor: pointer; transition: 0.2s; }
.clickable:hover { opacity: 0.8; transform: translateY(-1px); }
.empty-results { padding: 2rem; text-align: center; color: #94a3b8; font-style: italic; }
.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; }
</style>