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
        <NuxtLink to="/dashboard/disposition" class="nav-item">
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
        <!-- ACTIVE LINK -->
        <NuxtLink to="/dashboard/history" class="nav-item active">
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
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Filter by user, action, or patient ID..." 
            />
          </div>
          <div class="filter-group">
            <label>Severity:</label>
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
                      <p class="font-bold">{{ log.user }}</p>
                      <p class="text-xs text-muted">{{ log.timestamp }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="action-desc">{{ log.action }}</p>
                </td>
                <td>
                  <span class="mono-tag">{{ log.resource }}</span>
                </td>
                <td>
                  <span class="status-pill" :class="log.severity.toLowerCase()">
                    {{ log.severity }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="details-btn clickable" @click="viewLogDetails(log)">
                    View details
                  </button>
                </td>
              </tr>
              <tr v-if="filteredLogs.length === 0">
                <td colspan="5" class="empty-state">No matching logs found.</td>
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
const selectedSeverity = ref('All')

const logs = ref([
  { id: 1, user: 'Admin_Maria', timestamp: 'May 05, 2026 - 10:15 AM', action: 'Modified Patient Record', resource: 'P-2024-001', severity: 'Info' },
  { id: 2, user: 'Dr. Smith', timestamp: 'May 05, 2026 - 09:45 AM', action: 'Authorized Discharge', resource: 'Room 402-A', severity: 'Warning' },
  { id: 3, user: 'System', timestamp: 'May 05, 2026 - 08:00 AM', action: 'Database Backup Completed', resource: 'SQL_Server_DB', severity: 'Info' },
  { id: 4, user: 'Nurse_John', timestamp: 'May 04, 2026 - 11:20 PM', action: 'Failed Login Attempt', resource: 'IP: 192.168.1.45', severity: 'Critical' }
])

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = l.user.toLowerCase().includes(s) || 
                         l.action.toLowerCase().includes(s) || 
                         l.resource.toLowerCase().includes(s)
    const matchesSeverity = selectedSeverity.value === 'All' || l.severity === selectedSeverity.value
    return matchesSearch && matchesSeverity
  })
})

const getLogIcon = (sev) => {
  if (sev === 'Critical') return 'lucide:shield-alert'
  if (sev === 'Warning') return 'lucide:alert-triangle'
  return 'lucide:info'
}

const viewLogDetails = (log) => alert(`Audit ID: ${log.id}\nAction: ${log.action}\nPerformed by: ${log.user}`)
const exportLogs = () => alert('Generating CSV Audit Report...')
const handleLogout = () => confirm('Log out of system?')
</script>

<style scoped>
/* CORE LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background: #f8fafc; color: #1e293b; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }

/* SIDEBAR & LOGO */
.sidebar { width: 280px; background: #1e3a8a; color: white; padding: 1.5rem; display: flex; flex-direction: column; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 2.5rem; padding-left: 0.5rem; }
.logo-icon { font-size: 2rem; color: #93c5fd; }
.logo-text { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; }

/* NAV ITEMS */
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.nav-item { 
  display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
  text-decoration: none; color: #bfdbfe; border-radius: 12px; transition: 0.3s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }

/* TOP BAR */
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.welcome-msg h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.welcome-msg p { color: #64748b; font-size: 0.95rem; }

/* UTILITIES & CARDS */
.glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.table-controls { display: flex; justify-content: space-between; padding: 1.25rem; margin-bottom: 1.5rem; align-items: center; }

/* INPUTS */
.search-wrapper { position: relative; width: 400px; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-wrapper input { 
  width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #e2e8f0; 
  border-radius: 10px; font-size: 0.9rem; outline: none; transition: 0.2s;
}
.search-wrapper input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.filter-group { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 600; color: #64748b; }
.filter-dropdown { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }

/* TABLE STYLING */
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { padding: 16px; text-align: left; font-size: 0.85rem; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
.custom-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
.table-row:hover { background: #f8fafc; }

/* LOG INDICATORS */
.user-meta { display: flex; align-items: center; gap: 12px; }
.log-indicator { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.log-indicator.info { background: #eff6ff; color: #3b82f6; }
.log-indicator.warning { background: #fffbeb; color: #f59e0b; }
.log-indicator.critical { background: #fef2f2; color: #ef4444; }

.mono-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #475569; }

/* STATUS PILLS */
.status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-pill.info { background: #dcfce7; color: #166534; }
.status-pill.warning { background: #fef3c7; color: #92400e; }
.status-pill.critical { background: #fee2e2; color: #991b1b; }

/* BUTTONS */
.export-btn { background: #1e293b; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; border: none; }
.details-btn { color: #3b82f6; font-weight: 700; background: none; border: none; font-size: 0.85rem; }
.details-btn:hover { text-decoration: underline; }

.clickable { cursor: pointer; transition: filter 0.2s; }
.clickable:active { transform: scale(0.98); }

/* ANIMATION */
.animate-in { animation: slideUp 0.5s ease-out forwards; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.text-muted { color: #94a3b8; }
.font-bold { font-weight: 700; }
.text-right { text-align: right; }
.empty-state { padding: 40px; text-align: center; color: #94a3b8; }
</style>