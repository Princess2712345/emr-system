<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed }">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!isCollapsed">
          <Icon name="mdi:hospital-building" class="icon-blue-light" />
          <span class="logo-text">EMR System</span>
        </div>
        <!-- HAMBURGER TOGGLE -->
        <button class="menu-toggle clickable" @click="isCollapsed = !isCollapsed">
          <Icon :name="isCollapsed ? 'lucide:menu' : 'lucide:chevron-left'" />
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-item">
          <Icon :name="link.icon" />
          <span v-if="!isCollapsed" class="nav-label">{{ link.label }}</span>
          <!-- Floating Tooltip -->
          <span v-if="isCollapsed" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed">Logout</span>
          <span v-if="isCollapsed" class="sidebar-tooltip">Logout</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <span class="breadcrumb">ADMINISTRATION</span>
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
        <div class="modal-content animate-pop">
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

const isCollapsed = ref(false)
const searchQuery = ref('')
const selectedSeverity = ref('All')
const isModalOpen = ref(false)
const selectedLog = ref(null)

const navLinks = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
  { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
  { to: '/dashboard/registration', icon: 'mdi:account-plus', label: 'Registration' },
  { to: '/dashboard/Disposition', icon: 'lucide:file-output', label: 'Disposition' },
  { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
  { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
  { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
  { to: '/dashboard/History', icon: 'lucide:history', label: 'History' },
]

const logs = ref([
  { id: 1042, user: 'Admin_Maria', timestamp: 'May 05, 2026 - 10:15 AM', action: 'Modified Patient Record', resource: 'P-2024-001', severity: 'Info' },
  { id: 1041, user: 'Dr. Smith', timestamp: 'May 05, 2026 - 09:45 AM', action: 'Authorized Discharge', resource: 'Room 402-A', severity: 'Warning' },
  { id: 1040, user: 'System', timestamp: 'May 05, 2026 - 08:00 AM', action: 'Database Backup Completed', resource: 'SQL_Server_DB', severity: 'Info' },
  { id: 1039, user: 'Nurse_John', timestamp: 'May 04, 2026 - 11:20 PM', action: 'Failed Login Attempt', resource: 'IP: 192.168.1.45', severity: 'Critical' }
])

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = l.user.toLowerCase().includes(s) || l.action.toLowerCase().includes(s) || l.resource.toLowerCase().includes(s)
    const matchesSeverity = selectedSeverity.value === 'All' || l.severity === selectedSeverity.value
    return matchesSearch && matchesSeverity
  })
})

const getLogIcon = (sev) => {
  const icons = { Critical: 'lucide:shield-alert', Warning: 'lucide:alert-triangle', Info: 'lucide:info' }
  return icons[sev] || 'lucide:info'
}

const openModal = (log) => { selectedLog.value = log; isModalOpen.value = true; }
const closeModal = () => { isModalOpen.value = false; selectedLog.value = null; }
const exportLogs = () => { alert('Generating CSV report for Audit History...') }

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    const token = useCookie('auth_token'); token.value = null;
    if (process.client) { localStorage.removeItem('user_data'); sessionStorage.clear(); }
    await navigateTo('/auth/login');
  }
}
</script>

<style scoped>
/* --- CORE LAYOUT & SIDEBAR --- */
.dashboard-layout { display: flex; height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; overflow: hidden; }

.sidebar { 
  width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; 
  padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 100; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }

.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }

.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.menu-toggle {
  background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; 
  display: flex; cursor: pointer; transition: background 0.2s;
}

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { 
  position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; 
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(4px); }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.router-link-active { background: #2563eb !important; color: white !important; }

/* TOOLTIP */
.sidebar-tooltip {
  position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; 
  padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; 
  transition: all 0.2s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 1000;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* SIDEBAR FOOTER */
.sidebar-footer { 
  padding-top: 1rem; 
  border-top: 1px solid rgba(255, 255, 255, 0.1); 
}

.logout-btn { 
  background: none; 
  border: none; 
  width: 100%; 
  text-align: left; 
  color: #fca5a5; 
  font-weight: 600; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 0.8rem 1rem; 
  position: relative; /* Necessary for tooltip positioning */
  transition: all 0.2s ease;
}

.logout-btn:hover { 
  background: rgba(252, 165, 165, 0.1); 
  color: #f87171; 
  transform: translateX(5px); 
}

/* Center icon and handle hover when sidebar is collapsed */
.is-collapsed .logout-btn { 
  justify-content: center; 
}

.is-collapsed .logout-btn:hover { 
  transform: none; /* Prevent sliding when collapsed */
}

/* Trigger tooltip visibility on hover when collapsed */
.logout-btn:hover .sidebar-tooltip { 
  opacity: 1; 
  margin-left: 10px; 
}

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
.top-bar { background: white; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.breadcrumb { font-size: 0.7rem; font-weight: 800; color: #64748b; letter-spacing: 1px; }
.top-bar h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; }

.export-btn { background: #1e3a8a; color: white; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 600; border: none; display: flex; align-items: center; gap: 8px; }

/* BODY & TABLES */
.dashboard-body { padding: 1.5rem 2rem; }
.glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.table-controls { display: flex; align-items: center; gap: 2rem; padding: 1.25rem; margin-bottom: 1.5rem; }

.search-wrapper { flex: 1; position: relative; }
.search-icon-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; }

.filter-dropdown { padding: 0.6rem 1rem; border-radius: 8px; border: 1.5px solid #e2e8f0; }

.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { padding: 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.table-row td { padding: 1.2rem 1rem; border-bottom: 1px solid #f1f5f9; }

.user-meta { display: flex; align-items: center; gap: 12px; }
.log-indicator { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.log-indicator.info { background: #e0f2fe; color: #0369a1; }
.log-indicator.warning { background: #fef3c7; color: #92400e; }
.log-indicator.critical { background: #fee2e2; color: #991b1b; }

.mono-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }

.status-pill { padding: 4px 12px; border-radius: 100px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.status-pill.info { background: #dcfce7; color: #15803d; }
.status-pill.warning { background: #fef3c7; color: #b45309; }
.status-pill.critical { background: #fee2e2; color: #991b1b; }

.details-btn { color: #2563eb; font-weight: 700; background: none; border: none; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-content { width: 100%; max-width: 550px; background: white; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.detail-item.full { grid-column: span 2; }
.detail-item label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
.value { font-weight: 600; color: #1e293b; }

.modal-footer { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: right; }
.close-btn { background: #1e293b; color: white; padding: 0.75rem 1.5rem; border-radius: 10px; border: none; font-weight: 700; }

.clickable { cursor: pointer; transition: 0.2s; }
.clickable:active { transform: scale(0.98); }

.animate-in { animation: fadeInUp 0.4s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-pop { animation: pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>