<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <Icon name="mdi:hospital-building" />
        </div>
        <span class="logo-text">MedFlow <small>EMR</small></span>
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
          <Icon name="lucide:credit-card" /> Billing
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
        <div class="header-left">
          <template v-if="!selectedPatient">
            <h1>Patient Directory</h1>
            <p>Access and manage comprehensive medical records.</p>
          </template>
          <template v-else>
            <button class="back-link" @click="selectedPatient = null">
              <Icon name="lucide:arrow-left" /> Back to Directory
            </button>
            <div class="patient-title-group">
              <h1>{{ selectedPatient.name }}</h1>
              <span class="id-tag">{{ selectedPatient.id }}</span>
            </div>
          </template>
        </div>
        
        <div class="header-actions">
          <button v-if="!selectedPatient" class="primary-btn" @click="isModalOpen = true">
            <Icon name="lucide:user-plus" /> <span>Register Patient</span>
          </button>
          <div v-else class="action-group">
            <button class="secondary-btn"><Icon name="lucide:printer" /> Print File</button>
            <button class="primary-btn"><Icon name="lucide:edit-3" /> Edit Record</button>
          </div>
        </div>
      </header>

      <section v-if="!selectedPatient" class="content-body">
        <div class="filter-bar">
          <div class="search-box">
            <Icon name="lucide:search" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search patients by name, ID, or contact..." 
            />
          </div>
          <div class="filter-actions">
            <div class="select-custom">
               <Icon name="lucide:filter" />
               <select v-model="selectedStatus">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <button class="reset-link" @click="resetFilters">Reset</button>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>ID Number</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th class="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id" class="table-row">
                <td>
                  <div class="patient-cell">
                    <div class="avatar-circle" :style="{ backgroundColor: patient.color }">
                      {{ patient.initials }}
                    </div>
                    <div class="info-meta">
                      <span class="p-full-name">{{ patient.name }}</span>
                      <span class="p-sub-detail">{{ patient.email }}</span>
                    </div>
                  </div>
                </td>
                <td><code class="id-code">{{ patient.id }}</code></td>
                <td>{{ patient.lastVisit }}</td>
                <td>
                  <span class="status-pill" :class="patient.status.toLowerCase()">
                    {{ patient.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="action-icon-btn" @click="viewPatientFile(patient)" title="View Details">
                    <Icon name="lucide:chevron-right" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredPatients.length === 0">
                <td colspan="5" class="empty-row">
                  <Icon name="lucide:user-x" />
                  <p>No records found matching your search criteria.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="content-body">
        <div class="medical-dashboard">
          <div class="profile-summary-card">
            <div class="profile-info-main">
              <div class="avatar-large" :style="{ backgroundColor: selectedPatient.color }">
                {{ selectedPatient.initials }}
              </div>
              <div class="p-meta">
                <span class="status-pill" :class="selectedPatient.status.toLowerCase()">{{ selectedPatient.status }}</span>
                <h2>{{ selectedPatient.name }}</h2>
                <p><Icon name="lucide:map-pin" /> 123 Health Ave, Medical City</p>
              </div>
            </div>
            
            <div class="quick-stats">
              <div class="stat-box">
                <label>Age / Sex</label>
                <span>28 / Female</span>
              </div>
              <div class="stat-box">
                <label>Blood Type</label>
                <span class="text-red">O+</span>
              </div>
              <div class="stat-box">
                <label>Height / Weight</label>
                <span>165cm / 58kg</span>
              </div>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-column main">
              <div class="section-card">
                <div class="section-header">
                  <h3><Icon name="lucide:clipboard-list" /> Clinical History</h3>
                  <button class="text-btn">+ New Note</button>
                </div>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="tm-date">Oct 24, 2025</div>
                    <div class="tm-content">
                      <h4>Dr. Aris — General Checkup</h4>
                      <p>Patient reports mild fatigue. BP: 120/80. Prescribed Vitamin B Complex.</p>
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="tm-date">Sep 15, 2025</div>
                    <div class="tm-content">
                      <h4>Dr. Sarah — Laboratory Review</h4>
                      <p>CBC results within normal range. Glucose levels stable.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-column side">
              <div class="section-card">
                <h3>Contact Information</h3>
                <ul class="contact-list">
                  <li><Icon name="lucide:phone" /> +1 (555) 012-3456</li>
                  <li><Icon name="lucide:mail" /> {{ selectedPatient.email }}</li>
                  <li><Icon name="lucide:shield-check" /> Insurance: MediCare Plus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Transition name="modal-scale">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-window">
          <div class="modal-head">
            <h3>Register New Patient</h3>
            <button class="close-btn" @click="isModalOpen = false"><Icon name="lucide:x" /></button>
          </div>
          <form @submit.prevent="handleRegister" class="modal-form">
            <div class="input-group">
              <label>Full Legal Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
            <div class="input-row">
               <div class="input-group">
                <label>Email</label>
                <input type="email" placeholder="john@example.com" required />
              </div>
               <div class="input-group">
                <label>Date of Birth</label>
                <input type="date" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="primary-btn">Complete Registration</button>
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
  { initials: 'PRP', name: 'Penny Rose Peduhan', email: 'ppeduhan@email.com', id: '#EMR-2045', lastVisit: 'Oct 24, 2025', status: 'Active', color: '#8b5cf6' },
  { initials: 'HJB', name: 'Harvey Jhon Bacla-an', email: 'hbaclaan@email.com', id: '#EMR-1192', lastVisit: 'Oct 20, 2025', status: 'Inpatient', color: '#ec4899' },
  { initials: 'PAB', name: 'Phoebe Angel Barbecho', email: 'pbarbecho@email.com', id: '#EMR-8830', lastVisit: 'Jan 15, 2026', status: 'Pending', color: '#14b8a6' }
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
const handleRegister = () => { alert('Registration successful!'); isModalOpen.value = false }
</script>

<style scoped>
/* --- DESIGN SYSTEM --- */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --bg-main: #f8fafc;
  --sidebar-bg: #0f172a;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Inter', system-ui, sans-serif;
}

/* --- SIDEBAR REFINED --- */
.sidebar {
  width: 280px;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2.5rem;
  padding-left: 0.5rem;
}

.logo-icon {
  background: #2563eb;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.4rem;
}

.logo-text { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; }
.logo-text small { font-weight: 400; opacity: 0.6; font-size: 0.7rem; display: block; margin-top: -4px; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.85rem 1rem;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.nav-item.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

/* --- HEADER & TOP BAR --- */
.main-content { flex: 1; min-width: 0; }
.top-bar {
  background: white;
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar h1 { font-size: 1.5rem; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -0.5px; }
.top-bar p { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

.back-link {
  background: none; border: none; color: #2563eb; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 8px;
}

.patient-title-group { display: flex; align-items: center; gap: 12px; }
.id-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 600; color: #475569; }

/* --- FILTERS & TABLES --- */
.content-body { padding: 2rem 2.5rem; }
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-box { position: relative; flex: 1; max-width: 450px; }
.search-box input {
  width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem;
  border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem;
  transition: all 0.2s;
}
.search-box input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
.search-box .icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.filter-actions { display: flex; align-items: center; gap: 1rem; }
.select-custom { position: relative; }
.select-custom select {
  appearance: none; padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0; border-radius: 10px; background: white;
  font-weight: 600; color: #475569; cursor: pointer;
}
.select-custom .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }

.table-card {
  background: white; border-radius: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden;
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: #f8fafc; padding: 1rem 1.5rem; text-align: left;
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
  color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0;
}

.table-row:hover { background-color: #f8fafc; }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

.patient-cell { display: flex; align-items: center; gap: 12px; }
.avatar-circle {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 0.85rem;
}

.info-meta { display: flex; flex-direction: column; }
.p-full-name { font-weight: 700; color: #0f172a; }
.p-sub-detail { font-size: 0.8rem; color: #64748b; }

.status-pill {
  padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700;
}
.status-pill.active { background: #dcfce7; color: #166534; }
.status-pill.inpatient { background: #fee2e2; color: #991b1b; }
.status-pill.pending { background: #fef3c7; color: #92400e; }

.action-icon-btn {
  background: #f1f5f9; border: none; padding: 8px; border-radius: 8px;
  color: #475569; cursor: pointer; transition: all 0.2s;
}
.action-icon-btn:hover { background: #2563eb; color: white; }

/* --- MEDICAL DETAIL VIEW --- */
.profile-summary-card {
  background: white; border-radius: 20px; padding: 2rem;
  border: 1px solid #e2e8f0; margin-bottom: 2rem;
  display: flex; justify-content: space-between; align-items: center;
}

.profile-info-main { display: flex; align-items: center; gap: 24px; }
.avatar-large {
  width: 80px; height: 80px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.8rem; font-weight: 800;
}

.p-meta h2 { margin: 8px 0 4px; font-size: 1.8rem; letter-spacing: -1px; }
.p-meta p { color: #64748b; font-size: 0.9rem; display: flex; align-items: center; gap: 4px; }

.quick-stats { display: flex; gap: 3rem; }
.stat-box { display: flex; flex-direction: column; gap: 4px; }
.stat-box label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
.stat-box span { font-size: 1.1rem; font-weight: 700; color: #0f172a; }

.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.section-card {
  background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem;
}
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h3 { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; margin: 0; }

.timeline-item {
  padding-left: 20px; border-left: 2px solid #e2e8f0;
  position: relative; padding-bottom: 2rem;
}
.timeline-item::before {
  content: ''; position: absolute; left: -7px; top: 0;
  width: 12px; height: 12px; border-radius: 50%; background: #2563eb; border: 3px solid white;
}
.tm-date { font-size: 0.8rem; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
.tm-content h4 { margin: 0 0 6px; font-size: 0.95rem; }
.tm-content p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.5; }

/* --- BUTTONS & MODALS --- */
.primary-btn {
  background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem;
  border-radius: 12px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: all 0.2s;
}
.primary-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }

.secondary-btn {
  background: white; color: #475569; border: 1px solid #e2e8f0;
  padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 600; cursor: pointer;
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-window {
  background: white; width: 95%; max-width: 500px; border-radius: 24px; padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.modal-form { display: flex; flex-direction: column; gap: 1.25rem; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 0.85rem; font-weight: 700; color: #475569; }
.input-group input {
  padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 1rem;
}
.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.cancel-btn { background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; }

/* ANIMATIONS */
.modal-scale-enter-active, .modal-scale-leave-active { transition: all 0.3s ease; }
.modal-scale-enter-from, .modal-scale-leave-to { opacity: 0; transform: scale(0.95); }

.text-right { text-align: right; }
.text-red { color: #dc2626; }
.empty-row { text-align: center; padding: 4rem !important; color: #94a3b8; }
.empty-row .icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
</style>