<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar portal-top-bar">
        <div class="welcome-msg">
          <h1>Laboratory Reports</h1>
          <p>Review and validate diagnostic results from all departments.</p>
        </div>
        
        <div class="header-actions portal-header-actions">
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
            <button class="filter-btn clickable" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" /> Reset
            </button>
          </div>
        </div>

        <div class="table-container">
  <table class="patient-table">
    <thead>
      <tr>
        <th>TEST & PATIENT</th>
        <th>REQUEST ID</th>
        <th>CATEGORY</th>
        <th>DATE REPORTED</th>
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
                <td>{{ formatDate(lab.createdAt) }}</td>
                <td>
                  <span class="badge pending">
                    {{ lab.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-link clickable" @click="openDetails(lab)">
                    <Icon name="lucide:file-text" /> Details
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredLabs || filteredLabs.length === 0">
                <td colspan="6" class="text-center" style="padding: 3rem; color: #64748b; text-align: center;">
                  No matching laboratory records found inside your directory.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-with-icon">
              <Icon name="lucide:file-up" class="modal-title-icon" />
              <h3>Upload Laboratory Result</h3>
            </div>
            <button class="close-modal clickable" @click="isModalOpen = false">
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
              <button type="button" class="btn-secondary clickable" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn clickable" :disabled="!selectedFile">
                <Icon name="lucide:check" /> Complete Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="slide">
      <div v-if="isDetailOpen" class="detail-sidebar">
        <div class="detail-sidebar-header">
          <button class="back-btn clickable" @click="isDetailOpen = false">
            <Icon name="lucide:chevron-right" /> Close Details
          </button>
          <div class="status-wrap">
            <span class="badge pending">{{ selectedLab?.status }}</span>
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
              <span class="detail-value">{{ formatDate(selectedLab.createdAt) }}</span>
            </div>
          </div>

          <div class="detail-actions-vertical">
            <button class="action-btn-primary clickable">
              <Icon name="lucide:printer" /> Print Official Report
            </button>
            <button class="action-btn-secondary clickable">
              <Icon name="lucide:mail" /> Email to Patient
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <div v-if="isDetailOpen" class="sidebar-overlay" @click="isDetailOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('All')
const isModalOpen = ref(false)
const isDetailOpen = ref(false)
const selectedLab = ref<any>(null)
const selectedFile = ref<File | null>(null)

// Modal Input Bindings Payload State Context
const newRecord = ref({
  patientName: '',
  category: 'Hematology',
  testName: ''
})

// 🚀 FIXED: Point directly to the correct server handler route
const { data: filteredLabs, refresh: reloadLabData } = await useFetch<any[]>('/api/labs/upload', {
  query: computed(() => ({
    search: searchQuery.value,
    category: selectedCategory.value
  }))
})

const openDetails = (lab: any) => {
  selectedLab.value = lab
  isDetailOpen.value = true
}

const onFileChange = (e: any) => {
  selectedFile.value = e.target.files[0] || null
}

// 🚀 FIXED: Formats raw database ISO dates into clean, beautiful text
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 🚀 FIXED: Submit payload tracking to the relational backend API
const handleFileUpload = async () => {
  try {
    const colorMap: Record<string, string> = { 
      Hematology: 'purple', 
      Chemistry: 'pink', 
      Microbiology: 'teal' 
    }
    const assignedColor = colorMap[newRecord.value.category] || 'teal'

    const response = await $fetch<{ success: boolean }>('/api/labs/upload', {
      method: 'POST',
      body: {
        patientName: newRecord.value.patientName,
        testName: newRecord.value.testName,
        category: newRecord.value.category,
        colorClass: assignedColor
      }
    })

    if (response?.success) {
      await reloadLabData() // Direct reactive refresh from the database
      isModalOpen.value = false
      selectedFile.value = null
      newRecord.value = { patientName: '', category: 'Hematology', testName: '' }
      alert('Lab result successfully saved to your database instance directory!')
    }
  } catch (error) {
    console.error('Failed to submit document row payload:', error)
    alert('Failed to insert record profile entries.')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
}
</script>

<style scoped>
/* All CSS layout styles remain untouched and fully preserved */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 100; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.menu-toggle { background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; display: flex; cursor: pointer; transition: background 0.2s; }
.menu-toggle:hover { background: rgba(255, 255, 255, 0.2); }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; white-space: nowrap; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { padding-left: 0.8rem; }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.sidebar-tooltip { position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; transition: all 0.2s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 1000; }
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }
.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; }
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px); }
.is-collapsed .logout-btn { justify-content: center; }
.main-content { flex: 1; display: flex; flex-direction: column; transition: all 0.3s; }
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
.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #475569; }
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow-x: auto; -webkit-overflow-scrolling: touch; }
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
.view-link { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 90%; max-width: 480px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-with-icon { display: flex; align-items: center; gap: 12px; color: #1e3a8a; }
.modal-title-icon { font-size: 1.5rem; }
.close-modal { background: none; border: none; color: #94a3b8; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #475569; }
.form-group input, .modal-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.file-dropzone { border: 2px dashed #cbd5e1; padding: 2rem; border-radius: 12px; text-align: center; position: relative; cursor: pointer; color: #64748b; }
.file-dropzone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.file-dropzone:hover { background: #f8fafc; border-color: #2563eb; }
.file-name { color: #2563eb; font-weight: 600; margin-top: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 2rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 600; }
.detail-sidebar { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: white; z-index: 3000; padding: 2rem; box-shadow: -10px 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 2500; backdrop-filter: blur(2px); }
.detail-sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.back-btn { background: none; border: none; display: flex; align-items: center; gap: 5px; color: #64748b; font-weight: 700; }
.patient-avatar-large { width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 1.5rem; }
.detail-top-info h2 { color: #1e3a8a; margin: 0; font-size: 1.5rem; }
.detail-top-info p { color: #64748b; margin: 5px 0 2rem 0; font-size: 1.1rem; font-weight: 500; }
.detail-list { border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
.detail-item { display: flex; justify-content: space-between; margin-bottom: 1.2rem; }
.detail-label { color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
.detail-value { color: #1e293b; font-weight: 700; }
.detail-actions-vertical { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.action-btn-primary { background: #1e3a8a; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
.action-btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 1rem; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>