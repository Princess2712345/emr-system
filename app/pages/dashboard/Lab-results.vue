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
        <NuxtLink to="/dashboard/lab-results" class="nav-item active">
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
        <button @click="handleLogout" class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Laboratory Reports</h1>
          <p>Review and validate diagnostic results from all departments.</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn" @click="isModalOpen = true">
            <Icon name="lucide:file-up" /> Upload Lab Result
          </button>
        </div>
      </header>

      <section class="patient-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by patient name, test type, or ID..." 
            />
          </div>
          <div class="filter-group">
            <div class="select-wrapper">
               <Icon name="lucide:filter" class="filter-icon" />
               <select v-model="selectedCategory" class="filter-dropdown">
                <option value="All">All Categories</option>
                <option value="Hematology">Hematology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Microbiology">Microbiology</option>
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
                <th>Test & Patient</th>
                <th>Request ID</th>
                <th>Category</th>
                <th>Date Reported</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lab in filteredLabs" :key="lab.id">
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar" :class="lab.colorClass">
                      <Icon name="lucide:beaker" />
                    </div>
                    <div>
                      <p class="p-name">{{ lab.testName }}</p>
                      <p class="p-email">{{ lab.patientName }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ lab.requestId }}</span></td>
                <td>{{ lab.category }}</td>
                <td>{{ lab.date }}</td>
                <td>
                  <span class="badge" :class="lab.status.toLowerCase()">
                    {{ lab.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-link">
                    <Icon name="lucide:file-text" /> Details
                  </button>
                </td>
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
            <div class="header-with-icon">
              <Icon name="lucide:file-up" class="modal-title-icon" />
              <h3>Upload Laboratory Result</h3>
            </div>
            <button class="close-modal" @click="isModalOpen = false">
              <Icon name="lucide:x" />
            </button>
          </div>
          
          <form @submit.prevent="handleFileUpload">
            <div class="form-group">
              <label>Patient Name</label>
              <input v-model="newRecord.patientName" type="text" placeholder="Type patient name" required />
            </div>

            <div class="form-group">
              <label>Test Name</label>
              <input v-model="newRecord.testName" type="text" placeholder="e.g. Blood Sugar, X-Ray" required />
            </div>
            
            <div class="form-group">
              <label>Test Category</label>
              <select v-model="newRecord.category" class="modal-select">
                <option value="Hematology">Hematology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Microbiology">Microbiology</option>
              </select>
            </div>

            <div class="form-group file-input-group">
              <label>Select PDF/Image Report</label>
              <div class="file-dropzone">
                <Icon name="lucide:cloud-upload" />
                <input type="file" @change="onFileChange" accept=".pdf,.jpg,.png" />
                <p v-if="!selectedFile">Click to browse files</p>
                <p v-else class="file-name">{{ selectedFile.name }}</p>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn" :disabled="!selectedFile">
                <Icon name="lucide:check" /> Complete Upload
              </button>
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
const selectedCategory = ref('All')
const isModalOpen = ref(false)
const selectedFile = ref(null)

// Initializing form data
const newRecord = ref({
  patientName: '',
  category: 'Hematology',
  testName: ''
})

const labResults = ref([
  { id: 1, testName: 'Complete Blood Count', patientName: 'Penny Rose Peduhan', requestId: '#LAB-4055', category: 'Hematology', date: 'Oct 24, 2025', status: 'Active', colorClass: 'purple' },
  { id: 2, testName: 'Lipid Profile', patientName: 'Harvey Jhon Bacla-an', requestId: '#LAB-1122', category: 'Chemistry', date: 'Oct 20, 2025', status: 'Pending', colorClass: 'pink' }
])

const filteredLabs = computed(() => {
  return labResults.value.filter(l => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = l.testName.toLowerCase().includes(s) || l.patientName.toLowerCase().includes(s)
    const matchesCategory = selectedCategory.value === 'All' || l.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
}

const handleFileUpload = () => {
  // 1. Create the new entry from the form inputs
  const newEntry = {
    id: Date.now(),
    testName: newRecord.value.testName || 'New Lab Report',
    patientName: newRecord.value.patientName,
    requestId: `#LAB-${Math.floor(Math.random() * 8999) + 1000}`,
    category: newRecord.value.category,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Pending',
    colorClass: 'teal' // New uploads get a distinct color
  }
  
  // 2. Add to the list (at the top)
  labResults.value.unshift(newEntry)
  
  // 3. Reset the form and close modal
  isModalOpen.value = false
  selectedFile.value = null
  newRecord.value = { patientName: '', category: 'Hematology', testName: '' }
  
  alert('Lab result successfully added to the directory!')
}

const resetFilters = () => { searchQuery.value = ''; selectedCategory.value = 'All' }
const handleLogout = () => { alert('Logging out...') }
</script>

<style scoped>
/* ALL STYLES REMAIN UNCHANGED TO PRESERVE YOUR DESIGN */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: 0.2s; }
.nav-item:hover, .nav-item.active { background: rgba(255, 255, 255, 0.1); color: white; }
.nav-item.active { background: #2563eb; }
.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.main-content { flex: 1; display: flex; flex-direction: column; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }
.patient-body { padding: 2rem 3rem; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 1.5rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; outline: none; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.filter-group { display: flex; gap: 10px; }
.select-wrapper { position: relative; }
.filter-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
.filter-dropdown { padding: 0 1rem 0 2.2rem; height: 44px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-weight: 600; color: #475569; }
.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #475569; cursor: pointer; }
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.patient-avatar.purple { background: #f3e8ff; color: #7e22ce; }
.patient-avatar.pink { background: #fce7f3; color: #db2777; }
.patient-avatar.teal { background: #ccfbf1; color: #0d9488; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.id-badge { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #1e3a8a; font-weight: 600; font-size: 0.8rem; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.active { background: #dcfce7; color: #15803d; }
.badge.pending { background: #fef3c7; color: #b45309; }
.view-link { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }

/* MODAL STYLES */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 90%; max-width: 480px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-with-icon { display: flex; align-items: center; gap: 12px; color: #1e3a8a; }
.modal-title-icon { font-size: 1.5rem; }
.close-modal { background: none; border: none; cursor: pointer; color: #94a3b8; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #475569; }
.form-group input, .modal-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.file-dropzone { border: 2px dashed #cbd5e1; padding: 2rem; border-radius: 12px; text-align: center; position: relative; cursor: pointer; color: #64748b; }
.file-dropzone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.file-dropzone:hover { background: #f8fafc; border-color: #2563eb; }
.file-name { color: #2563eb; font-weight: 600; margin-top: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 2rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
