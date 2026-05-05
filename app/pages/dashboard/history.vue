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
        <NuxtLink to="/dashboard/billing" class="nav-item active">
          <Icon name="lucide:credit-card" /> Statement of Account
        </NuxtLink>
        <NuxtLink to="/dashboard/appointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/dashboard/statistic" class="nav-item">
          <Icon name="lucide:bar-chart-3" /> Statistics
        </NuxtLink>
         <NuxtLink to="/dashboard/History" class="nav-item">
          <Icon name="lucide:history" /> history
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
          <h1>System History & Logs</h1>
          <p>Track all user activities and clinical updates in real-time.</p>
        </div>
        <div class="header-actions">
           <button class="export-btn clickable" @click="exportLogs">
             <Icon name="lucide:download" /> Export Audit Trail
           </button>
        </div>
      </header>

      <section class="dashboard-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by user, action, or patient ID..." 
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedSeverity" class="filter-dropdown clickable">
              <option value="All">All Severities</option>
              <option value="Info">Information</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div class="activity-card animate-in">
          <table class="confinement-table">
            <thead>
              <tr>
                <th>Timestamp & User</th>
                <th>Action Performed</th>
                <th>Target Resource</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredLogs" :key="log.id" class="activity-item">
                <td>
                  <div class="patient-info">
                    <div class="log-icon-wrapper" :class="log.severity.toLowerCase()">
                      <Icon :name="getLogIcon(log.severity)" />
                    </div>
                    <div>
                      <p class="p-name">{{ log.user }}</p>
                      <p class="p-email">{{ log.timestamp }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="action-text">{{ log.action }}</p>
                </td>
                <td>
                  <span class="resource-tag">{{ log.resource }}</span>
                </td>
                <td>
                  <span class="badge" :class="log.severity.toLowerCase()">
                    {{ log.severity }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-all-link clickable" @click="viewLogDetails(log)">
                    Details
                  </button>
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
    const matchesSearch = l.user.toLowerCase().includes(s) || l.action.toLowerCase().includes(s)
    const matchesSeverity = selectedSeverity.value === 'All' || l.severity === selectedSeverity.value
    return matchesSearch && matchesSeverity
  })
})

const getLogIcon = (sev) => {
  if (sev === 'Critical') return 'lucide:shield-alert'
  if (sev === 'Warning') return 'lucide:alert-triangle'
  return 'lucide:info'
}

const viewLogDetails = (log) => alert(`Audit ID: ${log.id}\nAction: ${log.action}\nPerformed by: ${l.user}`)
const exportLogs = () => alert('Generating CSV Audit Report...')
const handleLogout = () => confirm('Log out of system?')
</script>

<style scoped>
/* Re-using your base layout styles */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }
/* ... (Keep your Sidebar and TopBar CSS exactly as provided before) ... */

/* Specific History Page Styles */
.log-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.log-icon-wrapper.info { background: #dbeafe; color: #2563eb; }
.log-icon-wrapper.warning { background: #fef3c7; color: #b45309; }
.log-icon-wrapper.critical { background: #fee2e2; color: #dc2626; }

.action-text { font-weight: 500; color: #334155; margin: 0; font-size: 0.9rem; }
.resource-tag { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 0.8rem; color: #475569; border: 1px solid #e2e8f0; }

.export-btn { background: white; color: #1e3a8a; border: 1px solid #cbd5e1; padding: 0.8rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.export-btn:hover { background: #f8fafc; border-color: #1e3a8a; }

/* Badge Severity Colors */
.badge.info { background: #dcfce7; color: #15803d; }
.badge.warning { background: #fef3c7; color: #b45309; }
.badge.critical { background: #fee2e2; color: #dc2626; }

/* ... (Include your animation and table utility CSS) ... */
</style>