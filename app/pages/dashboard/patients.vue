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
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const searchQuery = ref('')
const selectedStatus = ref('All')
const selectedPatient = ref(null)
const patients = ref([
  { initials: 'PRP', name: 'Penny Rose Peduhan', email: 'ppeduhan@email.com', id: '#EMR-2045', lastVisit: 'Oct 24, 2025', status: 'Active', colorClass: 'purple' },
  { initials: 'HJB', name: 'Harvey Jhon Bacla-an', email: 'hbaclaan@email.com', id: '#EMR-1192', lastVisit: 'Oct 20, 2025', status: 'Inpatient', colorClass: 'pink' },
  { initials: 'PAB', name: 'Phoebe Angel Barbecho', email: 'pbarbecho@email.com', id: '#EMR-8830', lastVisit: 'Jan 15, 2026', status: 'Pending', colorClass: 'teal' }
])
const filteredPatients = computed(() => {
  return patients.value.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
const viewPatientFile = (p) => { selectedPatient.value = p }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }
const handleLogout = () => { console.log('Logout') }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* GLOBAL THEME WITHOUT BREAKING LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
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

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { background: white; padding: 1.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.header-info h1 { font-size: 1.5rem; font-weight: 800; margin: 0; }
.patient-body { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }

/* ICON ALIGNMENT FIXES (CRITICAL) */
.search-wrapper { position: relative; width: 400px; display: flex; align-items: center; }
.search-icon-svg { position: absolute; left: 12px; color: #94a3b8; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 10px; font-family: 'Inter', sans-serif; }

.select-wrapper { position: relative; display: flex; align-items: center; }
.filter-icon { position: absolute; left: 12px; color: #64748b; z-index: 1; }
.filter-dropdown { padding: 0 1rem 0 2.5rem; height: 42px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-family: 'Inter', sans-serif; font-weight: 600; }

/* TABLE RE-STABILIZED */
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.p-name { font-weight: 700; margin: 0; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.id-badge { font-family: 'Inter', monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; color: #1e3a8a; }

/* COLORS */
.purple { background: #f3e8ff; color: #7e22ce; }
.pink { background: #fce7f3; color: #db2777; }
.teal { background: #ccfbf1; color: #0d9488; }

.badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
.badge.active { background: #dcfce7; color: #15803d; }
.badge.inpatient { background: #fee2e2; color: #b91c1c; }
.badge.pending { background: #fef3c7; color: #b45309; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.clickable { cursor: pointer; transition: 0.2s; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
</style>