<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon" />
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
        <!-- ACTIVE LINK -->
        <NuxtLink to="/dashboard/disposition" class="nav-item active">
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
        <NuxtLink to="/dashboard/history" class="nav-item">
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
          <p>Finalize patient status, discharge summaries, and hospital transfers.</p>
        </div>
        <div class="header-actions">
           <button class="export-btn clickable">
             <Icon name="lucide:plus" /> New Disposition
           </button>
        </div>
      </header>

      <section class="dashboard-body animate-in">
        <!-- SEARCH & STATUS FILTERS -->
        <div class="table-controls glass-card">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search patient name or ID..." 
            />
          </div>
          <div class="filter-group">
            <label>Category:</label>
            <select v-model="selectedCategory" class="filter-dropdown clickable">
              <option value="All">All Categories</option>
              <option value="Discharged">Discharged</option>
              <option value="Admitted">Admitted</option>
              <option value="Transferred">Transferred</option>
            </select>
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
                    <div class="log-indicator disposition-icon">
                      <Icon name="lucide:user" />
                    </div>
                    <div>
                      <p class="font-bold">{{ item.patientName }}</p>
                      <p class="text-xs text-muted">{{ item.patientId }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status-pill" :class="item.type.toLowerCase()">
                    {{ item.type }}
                  </span>
                </td>
                <td>
                  <p class="action-desc">{{ item.physician }}</p>
                </td>
                <td>
                  <p class="date-text">{{ item.dateTime }}</p>
                </td>
                <td class="text-right">
                  <button class="details-btn clickable">
                    Manage Case
                  </button>
                </td>
              </tr>
              <tr v-if="filteredDispositions.length === 0">
                <td colspan="5" class="empty-state">No disposition records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('All')

const dispositions = ref([
  { id: 1, patientName: 'Juan Dela Cruz', patientId: 'P-2026-0412', type: 'Discharged', physician: 'Dr. Santos', dateTime: 'May 05, 2026 - 09:00 AM' },
  { id: 2, patientName: 'Maria Clara', patientId: 'P-2026-0501', type: 'Admitted', physician: 'Dr. Reyes', dateTime: 'May 05, 2026 - 08:30 AM' },
  { id: 3, patientName: 'Pedro Penduko', patientId: 'P-2026-0388', type: 'Transferred', physician: 'Dr. Gomez', dateTime: 'May 04, 2026 - 04:15 PM' }
])

const filteredDispositions = computed(() => {
  return dispositions.value.filter(d => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = d.patientName.toLowerCase().includes(s) || d.patientId.toLowerCase().includes(s)
    const matchesCategory = selectedCategory.value === 'All' || d.type === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const handleLogout = () => confirm('Log out of system?')
</script>

<style scoped>
/* REUSING CORE DASHBOARD STYLES */
.dashboard-layout { display: flex; min-height: 100vh; background: #f8fafc; color: #1e293b; font-family: 'Inter', sans-serif; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }

/* SIDEBAR STYLES (Matching History/Registration) */
.sidebar { width: 280px; background: #1e3a8a; color: white; padding: 1.5rem; display: flex; flex-direction: column; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 2.5rem; }
.logo-icon { font-size: 2rem; color: #93c5fd; }
.logo-text { font-size: 1.25rem; font-weight: 800; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.nav-item { 
  display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
  text-decoration: none; color: #bfdbfe; border-radius: 12px; transition: 0.3s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }

/* TOP BAR & GLASS CARDS */
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.welcome-msg h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.table-controls { display: flex; justify-content: space-between; padding: 1.25rem; margin-bottom: 1.5rem; align-items: center; }

/* SEARCH BAR */
.search-wrapper { position: relative; width: 400px; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-wrapper input { 
  width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e2e8f0; 
  border-radius: 10px; font-size: 0.9rem; outline: none;
}

/* DISPOSITION SPECIFIC PILLS */
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-pill.discharged { background: #dcfce7; color: #166534; }
.status-pill.admitted { background: #eff6ff; color: #1e40af; }
.status-pill.transferred { background: #fef3c7; color: #92400e; }

/* TABLE STYLES */
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { padding: 16px; text-align: left; font-size: 0.85rem; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.custom-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
.user-meta { display: flex; align-items: center; gap: 12px; }
.disposition-icon { background: #f1f5f9; color: #64748b; border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }

/* UTILS */
.export-btn { background: #1e3a8a; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.details-btn { color: #3b82f6; font-weight: 700; background: none; border: none; cursor: pointer; }
.text-muted { color: #94a3b8; }
.font-bold { font-weight: 700; margin: 0; }
.date-text { font-size: 0.85rem; color: #475569; margin: 0; }
.action-desc { font-weight: 500; color: #1e293b; margin: 0; }
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>