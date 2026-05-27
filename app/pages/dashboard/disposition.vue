<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar portal-top-bar">
        <div class="welcome-msg">
          <h1>Patient Disposition</h1>
          <p>Finalize patient status and discharge summaries.</p>
        </div>
        <div class="header-actions portal-header-actions">
           <button class="add-btn clickable" @click="isModalOpen = true">
             <Icon name="lucide:plus" /> New Disposition
           </button>
        </div>
      </header>

      <section class="dashboard-body animate-in">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input v-model="searchQuery" type="text" placeholder="Search patient name or ID..." />
          </div>
          
          <div class="filter-group">
            <div class="select-wrapper">
              <Icon name="lucide:filter" class="filter-icon" />
              <select v-model="selectedCategory" class="filter-dropdown clickable">
                <option value="All">All Categories</option>
                <option value="Discharged">Discharged</option>
                <option value="Admitted">Admitted</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="patient-table">
            <thead>
              <tr>
                <th>Patient Information</th>
                <th>Disposition Type</th>
                <th>Attending Physician</th>
                <th>Date & Time</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredDispositions" :key="item.id">
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar purple">
                      <Icon name="lucide:user" />
                    </div>
                    <div>
                      <p class="p-name">{{ item.patientName }}</p>
                      <p class="p-email">{{ item.patientId }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-pill" :class="item.type.toLowerCase()">
                    {{ item.type }}
                  </span>
                </td>
                <td><p class="physician-name">Dr. {{ item.physician }}</p></td>
                <td><p class="date-text">{{ item.dateTime }}</p></td>
                <td class="text-right">
                  <button class="view-link clickable" @click="manageCase(item)">
                    Manage Case
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    <!-- NEW DISPOSITION MODAL -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-with-icon">
              <Icon name="lucide:file-output" class="modal-title-icon" />
              <h3>New Disposition</h3>
            </div>
            <button @click="isModalOpen = false" class="close-modal">✕</button>
          </div>
          <form @submit.prevent="submitNewEntry">
            <div class="form-group">
              <label>Patient Name</label>
              <input v-model="newEntry.patientName" type="text" required placeholder="Enter name..." />
            </div>
            <div class="form-group">
              <label>Patient ID</label>
              <input v-model="newEntry.patientId" type="text" required placeholder="P-2026-XXXX" />
            </div>
            <div class="form-group">
              <label>Disposition Type</label>
              <select v-model="newEntry.type" class="modal-select">
                <option value="Discharged">Discharged</option>
                <option value="Admitted">Admitted</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
            <div class="form-group">
              <label>Physician</label>
              <input v-model="newEntry.physician" type="text" required placeholder="Dr. Name" />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary clickable" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn clickable">Confirm Entry</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, computed, watch } from 'vue';

const searchQuery = ref('');
const selectedCategory = ref('All');
const isModalOpen = ref(false);

// --- Live Pipeline Data Stream ---
const { data: dispositions, refresh: reloadDispositions } = await useFetch('/api/dispositions', {
  key: 'disposition-live-feed',
  query: { search: searchQuery }
})

// Triggers search updates on typing
watch(searchQuery, () => {
  reloadDispositions()
})

// Handle client category filter grouping cleanly
const filteredDispositions = computed(() => {
  if (!dispositions.value) return [];
  return dispositions.value.filter(d => {
    return selectedCategory.value === 'All' || d.type === selectedCategory.value;
  });
});

const newEntry = ref({
  patientName: '',
  patientId: '',
  type: 'Discharged',
  physician: ''
});

// Write to your database real-time
const submitNewEntry = async () => {
  try {
    await $fetch('/api/dispositions', {
      method: 'POST',
      body: newEntry.value
    })
    
    alert('New patient disposition securely filed to clinical record database.')
    await reloadDispositions() // Triggers instant data refresh!
    
    newEntry.value = { patientName: '', patientId: '', type: 'Discharged', physician: '' };
    isModalOpen.value = false;
  } catch (err) {
    console.error(err)
    alert('Failed to save disposition record.')
  }
};

const manageCase = (item) => {
  alert(`Accessing Electronic Health Record: ${item.patientName}`);
};
</script>

<style scoped>
/* BASE LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR CORE */
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

/* NAVIGATION */
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

/* TOOLTIP */
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
.main-content { flex: 1; display: flex; flex-direction: column; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }

/* TABLE STYLING */
.dashboard-body { padding: 2rem 3rem; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 1.5rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.select-wrapper { position: relative; display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 12px; }
.filter-icon { color: #64748b; margin-right: 8px; }
.filter-dropdown { border: none; height: 44px; font-weight: 600; color: #475569; outline: none; background: transparent; }

.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow-x: auto; -webkit-overflow-scrolling: touch; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }

.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.patient-avatar.purple { background: #f3e8ff; color: #7e22ce; }

.p-name { font-weight: 700; color: #1e293b; margin: 0; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }

.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.status-pill.discharged { background: #dcfce7; color: #15803d; }
.status-pill.admitted { background: #dbeafe; color: #1e40af; }
.status-pill.transferred { background: #fef3c7; color: #92400e; }

.view-link { color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; border: none; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 450px; border-radius: 16px; padding: 2rem; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-with-icon { display: flex; align-items: center; gap: 12px; color: #1e3a8a; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #475569; }
.form-group input, .modal-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 2rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 600; }

.clickable { cursor: pointer; transition: transform 0.2s; }
.clickable:active { transform: scale(0.95); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>