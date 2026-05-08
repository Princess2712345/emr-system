<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed }">
    <!-- SIDEBAR (Exact Replica) -->
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
          <!-- Floating Tooltip for Collapsed State -->
          <span v-if="isCollapsed" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed">Logout</span>
          <!-- Floating Tooltip for Collapsed State -->
          <span v-if="isCollapsed" class="sidebar-tooltip">Logout</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Patient Registration</h1>
          <p>Manage and register patient records for the hospital directory.</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable" @click="isModalOpen = true">
            <Icon name="lucide:user-plus" /> New Registration
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
              placeholder="Search patients by name, ID, or contact..." 
            />
          </div>
          <div class="filter-group">
            <button class="filter-btn clickable" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" /> Reset
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="patient-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Patient ID</th>
                <th>Contact</th>
                <th>Reg. Date</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id">
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar" :class="patient.colorClass">
                      <Icon name="lucide:user" />
                    </div>
                    <div>
                      <p class="p-name">{{ patient.name }}</p>
                      <p class="p-email">{{ patient.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ patient.patientId }}</span></td>
                <td>{{ patient.phone }}</td>
                <td>{{ patient.date }}</td>
                <td>
                  <span class="badge" :class="patient.status.toLowerCase()">
                    {{ patient.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-link clickable">
                    <Icon name="lucide:edit-3" /> Edit
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

// Layout State
const isCollapsed = ref(false)
const searchQuery = ref('')
const isModalOpen = ref(false)

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

const patients = ref([
  { id: 1, name: 'Alice Thompson', email: 'alice.t@example.com', patientId: '#PT-9021', phone: '0912-345-6789', date: 'Oct 25, 2025', status: 'Active', colorClass: 'teal' },
  { id: 2, name: 'Bob Richards', email: 'bob.r@example.com', patientId: '#PT-4412', phone: '0917-882-1234', date: 'Oct 23, 2025', status: 'Active', colorClass: 'purple' }
])

const filteredPatients = computed(() => {
  return patients.value.filter(p => {
    const s = searchQuery.value.toLowerCase()
    return p.name.toLowerCase().includes(s) || p.patientId.toLowerCase().includes(s)
  })
})

const resetFilters = () => { searchQuery.value = '' }

// LOGOUT LOGIC (Exact Replica)
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
/* BASE LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR CORE (Exact Replica) */
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
  transition: background 0.2s;
}
.menu-toggle:hover { background: rgba(255, 255, 255, 0.2); }

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

.nav-item:hover { 
  background: rgba(255, 255, 255, 0.1); 
  color: white; 
  padding-left: 1.25rem; 
}

.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { padding-left: 0.8rem; }

.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

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
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
  z-index: 1000;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* SIDEBAR FOOTER (Exact Replica) */
.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { 
  background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; 
  display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; position: relative;
}
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px); }
.is-collapsed .logout-btn { justify-content: center; }
.logout-btn:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }

/* TABLE & BODY */
.patient-body { padding: 2rem 3rem; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 1.5rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; outline: none; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #475569; height: 44px; }

.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.patient-avatar.purple { background: #f3e8ff; color: #7e22ce; }
.patient-avatar.teal { background: #ccfbf1; color: #0d9488; }

.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.id-badge { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #1e3a8a; font-weight: 600; font-size: 0.8rem; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.active { background: #dcfce7; color: #15803d; }

.view-link { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; border: none; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }

.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }
</style>