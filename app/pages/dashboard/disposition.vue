<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR (Refined CSS Applied) -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue-light" />
        <span class="logo-text">EMR System</span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item">
          <Icon name="lucide:layout-dashboard" /> Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/dashboard/registration" class="nav-item">
          <Icon name="mdi:account-plus" /> Registration
        </NuxtLink>
        <NuxtLink to="/dashboard/Disposition" class="nav-item active">
          <Icon name="lucide:file-output" /> Disposition
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

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Patient Disposition</h1>
          <p>Finalize patient status and discharge summaries.</p>
        </div>
        <div class="header-actions">
           <button class="export-btn clickable" @click="isModalOpen = true">
             <Icon name="lucide:plus" /> New Disposition
           </button>
        </div>
      </header>

      <section class="dashboard-body animate-in">
        <!-- SEARCH & INLINE CATEGORY FILTER (Verbatim from image_03d43a.png) -->
        <div class="table-controls glass-card">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input v-model="searchQuery" type="text" placeholder="Search patient..." />
          </div>
          
          <div class="filter-group">
            <div class="select-wrapper" :class="selectedCategory.toLowerCase()">
              <span class="inline-label">Category</span>
              <div class="divider"></div>
              <Icon name="lucide:filter" class="filter-icon-svg" />
              <select v-model="selectedCategory" class="filter-dropdown clickable">
                <option value="All">All Categories</option>
                <option value="Discharged">Discharged</option>
                <option value="Admitted">Admitted</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
          </div>
        </div>

        <!-- DISPOSITION TABLE -->
        <div class="activity-card glass-card">
          <table class="custom-table">
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
              <tr v-for="item in filteredDispositions" :key="item.id" class="table-row">
                <td>
                  <div class="user-meta">
                    <div class="disposition-icon"><Icon name="lucide:user" /></div>
                    <div>
                      <p class="patient-name">{{ item.patientName }}</p>
                      <p class="patient-id">{{ item.patientId }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="status-pill" :class="item.type.toLowerCase()">{{ item.type }}</span></td>
                <td><p class="physician-name">Dr. {{ item.physician }}</p></td>
                <td><p class="date-text">{{ item.dateTime }}</p></td>
                <td class="text-right">
                  <!-- FIXED: Function Call Linked -->
                  <button class="manage-btn clickable" @click="manageCase(item)">
                    Manage Case
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- NEW DISPOSITION MODAL -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-box glass-card">
        <div class="modal-head">
          <h3>Add New Disposition</h3>
          <button @click="isModalOpen = false" class="close-x">✕</button>
        </div>
        <form @submit.prevent="submitNewEntry">
          <div class="form-body">
            <div class="field">
              <label>Patient Name</label>
              <input v-model="newEntry.patientName" type="text" required placeholder="Enter name..." />
            </div>
            <div class="field">
              <label>Patient ID</label>
              <input v-model="newEntry.patientId" type="text" required placeholder="P-2026-XXXX" />
            </div>
            <div class="field">
              <label>Disposition Type</label>
              <select v-model="newEntry.type">
                <option value="Discharged">Discharged</option>
                <option value="Admitted">Admitted</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>
            <div class="field">
              <label>Physician</label>
              <input v-model="newEntry.physician" type="text" required placeholder="Dr. Name" />
            </div>
          </div>
          <div class="form-footer">
            <button type="button" class="btn-clear" @click="isModalOpen = false">Cancel</button>
            <button type="submit" class="btn-save">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');
const selectedCategory = ref('All');
const isModalOpen = ref(false);

const dispositions = ref([
  { id: 1, patientName: 'Juan Dela Cruz', patientId: 'P-2026-0412', type: 'Discharged', physician: 'Santos', dateTime: 'May 05, 2026 - 09:00 AM' },
  { id: 2, patientName: 'Maria Clara', patientId: 'P-2026-0501', type: 'Admitted', physician: 'Reyes', dateTime: 'May 05, 2026 - 08:30 AM' }
]);

const newEntry = ref({
  patientName: '',
  patientId: '',
  type: 'Discharged',
  physician: ''
});

const filteredDispositions = computed(() => {
  return dispositions.value.filter(d => {
    const matchesSearch = d.patientName.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCat = selectedCategory.value === 'All' || d.type === selectedCategory.value;
    return matchesSearch && matchesCat;
  });
});

const submitNewEntry = () => {
  const now = new Date();
  const timeStr = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  dispositions.value.unshift({ id: Date.now(), ...newEntry.value, dateTime: timeStr.replace(',', ' -') });
  newEntry.value = { patientName: '', patientId: '', type: 'Discharged', physician: '' };
  isModalOpen.value = false;
};

// FUNCTION FOR MANAGE CASE
const manageCase = (item) => {
  console.log("Opening case for:", item.patientName);
  alert(`Opening file for ${item.patientName} (${item.patientId})`);
};

const handleLogout = () => console.log("Logout triggered");
</script>

<style scoped>
/* REFINED LAYOUT & SIDEBAR */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; box-shadow: 4px 0 10px rgba(0,0,0,0.05); }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; letter-spacing: -0.5px; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.nav-item.active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
.logout-btn:hover { color: #f87171; transform: translateX(5px); }

/* MAIN CONTENT STYLES (Restored for image_03d43a.png compliance) */
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.welcome-msg h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; }
.select-wrapper { display: flex; align-items: center; background: white; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 0 12px; height: 46px; }
.inline-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-right: 10px; }
.divider { width: 1px; height: 20px; background: #e2e8f0; margin-right: 12px; }
.filter-dropdown { background: transparent; border: none; font-weight: 700; color: #1e293b; outline: none; font-size: 0.95rem; cursor: pointer; }
.glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.table-controls { display: flex; justify-content: space-between; padding: 1rem 1.25rem; margin-bottom: 1.5rem; align-items: center; }
.search-wrapper { position: relative; width: 320px; }
.search-wrapper input { width: 100%; height: 46px; padding: 0 12px 0 42px; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; }
.search-icon-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { padding: 16px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; font-weight: 800; }
.table-row td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
.status-pill { padding: 5px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.status-pill.discharged { background: #dcfce7; color: #166534; }
.status-pill.admitted { background: #dbeafe; color: #1e40af; }
.status-pill.transferred { background: #fef3c7; color: #92400e; }
.manage-btn { color: #2563eb; font-weight: 700; background: #eff6ff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.manage-btn:hover { background: #2563eb; color: white; }
.export-btn { background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; }

/* MODAL STYLES */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(4px); }
.modal-box { width: 450px; padding: 2rem; border: none; }
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.close-x { background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
.form-body { display: flex; flex-direction: column; gap: 1rem; }
.field label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
.field input, .field select { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-family: inherit; }
.form-footer { margin-top: 2rem; display: flex; gap: 10px; }
.btn-save { flex: 1; background: #1e3a8a; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-clear { background: #f1f5f9; color: #64748b; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
</style>