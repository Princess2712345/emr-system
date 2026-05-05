<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon icon-blue-light" />
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

      <!-- MAXIMIZED BODY SECTION -->
      <section class="dashboard-body animate-in">
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
            <span>Severity:</span>
            <div class="custom-select-wrapper">
              <select v-model="selectedSeverity" class="filter-dropdown clickable">
                <option value="All">All Levels</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

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
                <td colspan="5" class="empty-state">
                  <Icon name="lucide:database-zap" class="empty-icon" />
                  <p>No matching logs found.</p>
                </td>
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
/* RESTORED ORIGINAL CORE STYLES */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }

.router-link-active, .nav-item.active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

/* MAXIMIZED SPACE ADJUSTMENTS */
.main-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  min-width: 0; 
}

.top-bar { 
  background: white; 
  padding: 1rem 1.5rem; /* Tightened from 3rem */
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 1px solid #e2e8f0; 
}

.dashboard-body { 
  padding: 1rem 1.5rem; /* Tightened from 3rem */
  flex: 1;
}

/* CARDS & TABLES */
.glass-card { 
  background: white; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  width: 100%;
}

.table-controls { display: flex; justify-content: space-between; padding: 1.25rem; margin-bottom: 1rem; }
.activity-card { padding: 0.5rem; }

.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { 
  padding: 1rem; text-align: left; font-size: 0.75rem; 
  text-transform: uppercase; color: #64748b; font-weight: 700;
  border-bottom: 1px solid #f1f5f9;
}

.table-row td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }

/* SHARED ELEMENTS */
.search-wrapper { position: relative; width: 100%; max-width: 500px; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-wrapper input { width: 100%; padding: 0.7rem 1rem 0.7rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }

.user-meta { display: flex; align-items: center; gap: 12px; }
.log-indicator { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.log-indicator.info { background: #eff6ff; color: #2563eb; }
.log-indicator.warning { background: #fffbeb; color: #d97706; }
.log-indicator.critical { background: #fef2f2; color: #dc2626; }

.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.status-pill.info { background: #dcfce7; color: #15803d; }
.status-pill.warning { background: #fef3c7; color: #b45309; }
.status-pill.critical { background: #fee2e2; color: #991b1b; }

.mono-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #475569; }
.export-btn { background: #1e3a8a; color: white; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 600; border: none; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.details-btn { color: #2563eb; font-weight: 700; background: none; border: none; cursor: pointer; }

.animate-in { animation: fadeInUp 0.5s ease-out forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>