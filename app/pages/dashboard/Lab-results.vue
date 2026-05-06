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
        <NuxtLink to="/dashboard/lab-results" class="nav-item active">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/dashboard/registration" class="nav-item">
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
                  <button class="view-link" @click="openDetails(lab)">
                    <Icon name="lucide:file-text" /> Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Upload Modal -->
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

    <!-- Details Sidebar (New Feature) -->
    <Transition name="slide">
      <div v-if="isDetailOpen" class="detail-sidebar">
        <div class="detail-sidebar-header">
          <button class="back-btn" @click="isDetailOpen = false">
            <Icon name="lucide:chevron-right" /> Close Details
          </button>
          <div class="status-wrap">
            <span class="badge" :class="selectedLab?.status.toLowerCase()">{{ selectedLab?.status }}</span>
          </div>
        </div>

        <div class="detail-sidebar-content" v-if="selectedLab">
          <div class="detail-top-info">
            <div class="patient-avatar-large" :class="selectedLab.colorClass">
              <Icon name="lucide:beaker" />
            </div>
            <h2>{{ selectedLab.testName }}</h2>
            <p>{{ selectedLab.patientName }}</p>
          </div>

          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-label">Request ID</span>
              <span class="detail-value id-badge">{{ selectedLab.requestId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Category</span>
              <span class="detail-value">{{ selectedLab.category }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Report Date</span>
              <span class="detail-value">{{ selectedLab.date }}</span>
            </div>
          </div>

          <div class="detail-actions-vertical">
            <button class="action-btn-primary">
              <Icon name="lucide:printer" /> Print Official Report
            </button>
            <button class="action-btn-secondary">
              <Icon name="lucide:mail" /> Email to Patient
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Sidebar Overlay -->
    <div v-if="isDetailOpen" class="sidebar-overlay" @click="isDetailOpen = false"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('All')
const isModalOpen = ref(false)
const selectedFile = ref(null)

// Details Logic
const isDetailOpen = ref(false)
const selectedLab = ref(null)

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

const openDetails = (lab) => {
  selectedLab.value = lab
  isDetailOpen.value = true
}

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
}

const handleFileUpload = () => {
  const newEntry = {
    id: Date.now(),
    testName: newRecord.value.testName || 'New Lab Report',
    patientName: newRecord.value.patientName,
    requestId: `#LAB-${Math.floor(Math.random() * 8999) + 1000}`,
    category: newRecord.value.category,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Pending',
    colorClass: 'teal'
  }
  
  labResults.value.unshift(newEntry)
  isModalOpen.value = false
  selectedFile.value = null
  newRecord.value = { patientName: '', category: 'Hematology', testName: '' }
  alert('Lab result successfully added to the directory!')
}

const resetFilters = () => { searchQuery.value = ''; selectedCategory.value = 'All' }

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      const token = useCookie('auth_token')
      token.value = null
      if (process.client) {
        localStorage.clear()
        sessionStorage.clear()
      }
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout process failed:', error)
    }
  }
}
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }

.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px);}

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

/* Detail Sidebar Styles */
.detail-sidebar { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: white; z-index: 3000; padding: 2rem; box-shadow: -10px 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 2500; backdrop-filter: blur(2px); }
.detail-sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.back-btn { background: none; border: none; display: flex; align-items: center; gap: 5px; color: #64748b; font-weight: 700; cursor: pointer; }
.patient-avatar-large { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 1.5rem; }
.detail-top-info h2 { color: #1e3a8a; margin: 0; font-size: 1.5rem; }
.detail-top-info p { color: #64748b; margin: 5px 0 2rem 0; font-size: 1.1rem; font-weight: 500; }
.detail-list { border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
.detail-item { display: flex; justify-content: space-between; margin-bottom: 1.2rem; }
.detail-label { color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
.detail-value { color: #1e293b; font-weight: 700; }
.detail-actions-vertical { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.action-btn-primary { background: #1e3a8a; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
.action-btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 1rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>