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
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
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
         <NuxtLink to="/dashboard/History" class="nav-item active">
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
          <h1>System History & Logs</h1>
          <p>Real-time audit trail and clinical activity monitoring.</p>
        </div>
        <div class="header-actions">
           <button class="export-btn clickable" @click="exportLogs">
             <Icon name="lucide:download" /> Export CSV
           </button>
        </div>
      </header>

      <section class="dashboard-body animate-in">
        <!-- SEARCH & FILTERS -->
        <div class="table-controls glass-card">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input v-model="searchQuery" type="text" placeholder="Search user, action, or resource..." />
          </div>
          <div class="filter-group">
            <span class="filter-label">Severity Level:</span>
            <select v-model="selectedSeverity" class="filter-dropdown clickable">
              <option value="All">All Levels</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <!-- LOGS TABLE -->
        <div class="activity-card glass-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Timestamp & User</th>
                <th>Action Description</th>
                <th>Target Resource</th>
                <th>Level</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredLogs" :key="log.id" class="table-row">
                <td>
                  <div class="user-meta">
                    <div class="log-indicator" :class="log.severity.toLowerCase()">
                      <Icon :name="getLogIcon(log.severity)" />
                    </div>
                    <div>
                      <p class="user-name">{{ log.user }}</p>
                      <p class="timestamp">{{ log.timestamp }}</p>
                    </div>
                  </div>
                </td>
                <td><p class="action-desc">{{ log.action }}</p></td>
                <td><span class="mono-tag">{{ log.resource }}</span></td>
                <td>
                  <span class="status-pill" :class="log.severity.toLowerCase()">{{ log.severity }}</span>
                </td>
                <td class="text-right">
                  <button class="details-btn clickable" @click="openModal(log)">
                    View details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredLogs.length === 0" class="empty-state">
            <Icon name="lucide:database-zap" class="empty-icon" />
            <p>No matching audit logs found for your current filters.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- MODAL SYSTEM -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass-card animate-pop">
          <div class="modal-header">
            <div class="modal-title">
              <Icon name="lucide:file-search" class="modal-title-icon" />
              <h3>Audit Detail Log</h3>
            </div>
            <button @click="closeModal" class="close-icon-btn"><Icon name="lucide:x" /></button>
          </div>
          <div class="modal-body" v-if="selectedLog">
            <div class="detail-grid">
              <div class="detail-item">
                <label>Audit Reference</label>
                <p class="value">#LOG-{{ selectedLog.id }}</p>
              </div>
              <div class="detail-item">
                <label>Status Level</label>
                <div><span class="status-pill" :class="selectedLog.severity.toLowerCase()">{{ selectedLog.severity }}</span></div>
              </div>
              <div class="detail-item full">
                <label>Performed By</label>
                <p class="value text-primary">{{ selectedLog.user }}</p>
              </div>
              <div class="detail-item full">
                <label>Action Performed</label>
                <p class="value action-callout">{{ selectedLog.action }}</p>
              </div>
              <div class="detail-item">
                <label>Timestamp</label>
                <p class="value">{{ selectedLog.timestamp }}</p>
              </div>
              <div class="detail-item">
                <label>Affected Resource</label>
                <p class="value mono-tag">{{ selectedLog.resource }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="close-btn clickable" @click="closeModal">Dismiss</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- STATE MANAGEMENT ---
const searchQuery = ref('')
const selectedSeverity = ref('All')
const isModalOpen = ref(false)
const selectedLog = ref(null)

const logs = ref([
  { id: 1042, user: 'Admin_Maria', timestamp: 'May 05, 2026 - 10:15 AM', action: 'Modified Patient Record', resource: 'P-2024-001', severity: 'Info' },
  { id: 1041, user: 'Dr. Smith', timestamp: 'May 05, 2026 - 09:45 AM', action: 'Authorized Discharge', resource: 'Room 402-A', severity: 'Warning' },
  { id: 1040, user: 'System', timestamp: 'May 05, 2026 - 08:00 AM', action: 'Database Backup Completed', resource: 'SQL_Server_DB', severity: 'Info' },
  { id: 1039, user: 'Nurse_John', timestamp: 'May 04, 2026 - 11:20 PM', action: 'Failed Login Attempt', resource: 'IP: 192.168.1.45', severity: 'Critical' }
])

// --- COMPUTED PROPERTIES ---
const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = 
      l.user.toLowerCase().includes(s) || 
      l.action.toLowerCase().includes(s) || 
      l.resource.toLowerCase().includes(s)
    
    const matchesSeverity = selectedSeverity.value === 'All' || l.severity === selectedSeverity.value
    return matchesSearch && matchesSeverity
  })
})

// --- METHODS ---

// Dynamic Icon Picker based on Severity
const getLogIcon = (sev) => {
  const icons = { 
    Critical: 'lucide:shield-alert', 
    Warning: 'lucide:alert-triangle', 
    Info: 'lucide:info' 
  }
  return icons[sev] || 'lucide:info'
}

const openModal = (log) => {
  selectedLog.value = log
  isModalOpen.value = true
}

const closeModal = () => { 
  isModalOpen.value = false 
  selectedLog.value = null
}

const exportLogs = () => {
  alert('Generating CSV report for Audit History...')
}

const clearLogs = () => {
  if (confirm('Are you sure you want to clear the audit history? This action is permanent.')) {
    logs.value = []
  }
}

/** 
 * Functional Logout Handler 
 * Ensures security by clearing session data before redirecting
 */
const handleLogout = async () => {
  if (confirm('Are you sure you want to log out of the EMR system?')) {
    try {
      const token = useCookie('auth_token')
      token.value = null
      
      if (process.client) {
        localStorage.removeItem('user_data')
        sessionStorage.clear()
      }

      await navigateTo('/auth/login') 
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}
</script>


<style scoped>
/* COLOR VARIABLES */
:root {
  --primary: #1e3a8a;
  --primary-light: #2563eb;
  --info-bg: #e0f2fe;
  --info-text: #0369a1;
  --warning-bg: #fef3c7;
  --warning-text: #92400e;
  --critical-bg: #fee2e2;
  --critical-text: #991b1b;
  --glass: rgba(255, 255, 255, 0.95);
}

.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR REFINEMENT */
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

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
.welcome-msg p { color: #64748b; font-size: 0.9rem; margin-top: 2px; }

.export-btn { background: #1e3a8a; color: white; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 600; border: none; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
.export-btn:hover { background: #1e40af; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2); }

/* TABLE CONTROLS */
.dashboard-body { padding: 1.5rem 2rem; flex: 1; }
.glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.table-controls { display: flex; align-items: center; gap: 2rem; padding: 1.25rem; margin-bottom: 1.5rem; }

.search-wrapper { flex: 1; position: relative; }
.search-icon-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; transition: 0.2s; font-size: 0.95rem; }
.search-wrapper input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.filter-label { font-size: 0.85rem; font-weight: 600; color: #64748b; margin-right: 8px; }
.filter-dropdown { padding: 0.6rem 1rem; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; font-weight: 500; color: #1e293b; outline: none; }

/* TABLE STYLING */
.activity-card { overflow: hidden; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { padding: 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.table-row { transition: 0.2s; }
.table-row:hover { background: #f8fafc; }
.table-row td { padding: 1.2rem 1rem; border-bottom: 1px solid #f1f5f9; }

.user-meta { display: flex; align-items: center; gap: 12px; }
.user-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.timestamp { font-size: 0.75rem; color: #94a3b8; }

.log-indicator { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.log-indicator.info { background: #e0f2fe; color: #0369a1; }
.log-indicator.warning { background: #fef3c7; color: #92400e; }
.log-indicator.critical { background: #fee2e2; color: #991b1b; }

.action-desc { color: #475569; font-weight: 500; }
.mono-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; color: #1e293b; border: 1px solid #e2e8f0; }

.status-pill { padding: 4px 12px; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; }
.status-pill.info { background: #dcfce7; color: #15803d; }
.status-pill.warning { background: #fef3c7; color: #b45309; }
.status-pill.critical { background: #fee2e2; color: #991b1b; }

.details-btn { color: #2563eb; font-weight: 700; background: none; border: none; cursor: pointer; padding: 6px 12px; border-radius: 6px; transition: 0.2s; }
.details-btn:hover { background: rgba(37, 99, 235, 0.05); text-decoration: underline; }

/* MODAL STYLING */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-content { width: 100%; max-width: 550px; background: white; padding: 0; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-title { display: flex; align-items: center; gap: 10px; }
.modal-title-icon { color: #2563eb; font-size: 1.4rem; }
.modal-title h3 { font-size: 1.2rem; font-weight: 800; color: #1e293b; }

.close-icon-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: 0.2s; }
.close-icon-btn:hover { background: #e2e8f0; color: #0f172a; }

.modal-body { padding: 1.5rem; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.detail-item.full { grid-column: span 2; }
.detail-item label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
.detail-item .value { font-weight: 600; color: #1e293b; font-size: 1rem; }
.action-callout { color: #2563eb !important; font-size: 1.1rem !important; }

.modal-footer { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: right; border-radius: 0 0 16px 16px; }
.close-btn { background: #1e293b; color: white; padding: 0.75rem 1.5rem; border-radius: 10px; border: none; font-weight: 700; transition: 0.2s; cursor: pointer; }
.close-btn:hover { background: #0f172a; transform: translateY(-1px); }

/* ANIMATIONS */
.animate-in { animation: fadeInUp 0.4s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-pop { animation: pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

.empty-state { padding: 4rem; text-align: center; color: #94a3b8; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; }
</style>