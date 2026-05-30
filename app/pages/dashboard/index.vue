<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar desktop-only portal-top-bar">
        <div class="welcome-msg">
          <h1>Welcome back, {{ doctorName }}</h1>
          <p>Here is what's happening with your clinic today.</p>
        </div>
        
        <div class="header-actions">
           <div class="user-profile">
            <AdminNotificationBell />
            <div class="avatar clickable" @click="goToProfile">
              {{ userInitials }}
            </div>
          </div>
        </div>
      </header>

      <section class="dashboard-body">
        <!-- Search & Filter logic preserved -->
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search patients or lab tests..." 
            />
          </div>
          <div class="filter-group desktop-only">
            <button class="filter-btn clickable" @click="refreshData">
              <Icon name="lucide:calendar" /> {{ currentDate }}
            </button>
          </div>
        </div>

        <!-- Grid system: 4 cols on desktop, 2 on tablet, 1 on phone -->
        <div class="stats-grid">
          <div 
            v-for="(stat, index) in stats" 
            :key="stat.label" 
            class="stat-card animate-in"
            :style="{ animationDelay: `${index * 0.12}s` }"
          >
            <h3>{{ stat.label }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
            <span class="stat-change" :class="stat.trendClass">{{ stat.trendText }}</span>
          </div>
        </div>

        <div class="dashboard-main-grid">
          <div class="activity-card">
            <div class="section-header">
              <h3>Recent Lab Updates</h3>
              <NuxtLink to="/dashboard/lab-results" class="view-all-link">View All</NuxtLink>
            </div>
            <div class="activity-list">
              <div v-for="item in filteredLabs" :key="item.id" class="activity-item">
                <div class="activity-icon-bg">
                  <Icon name="lucide:flask-conical" class="lab-icon" />
                </div>
                <div class="activity-text">
                  <p class="p-name">{{ item.test }}</p>
                  <p class="p-email">Patient: {{ item.patient }} • {{ item.time }}</p>
                </div>
                <span class="badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
              </div>
              <div v-if="filteredLabs.length === 0" class="empty-results">
                No matching records found.
              </div>
            </div>
          </div>

          <div class="quick-actions-card">
            <div class="section-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="actions-grid">
              <div class="action-item clickable" @click="navigateTo('/dashboard/registration')">
                <div class="action-icon-circle blue">
                  <Icon name="lucide:user-plus" />
                </div>
                <span>Register</span>
              </div>
              <div class="action-item clickable" @click="navigateTo('/dashboard/appointments')">
                <div class="action-icon-circle green">
                  <Icon name="lucide:calendar-plus" />
                </div>
                <span>Appointment</span>
              </div>
              <div class="action-item clickable" @click="navigateTo('/dashboard/lab-results')">
                <div class="action-icon-circle purple">
                  <Icon name="lucide:file-text" />
                </div>
                <span>Lab Test</span>
              </div>
              <div class="action-item clickable" @click="navigateTo('/dashboard/billing')">
                <div class="action-icon-circle orange">
                  <Icon name="lucide:credit-card" />
                </div>
                <span>Billing</span>
              </div>
            </div>
            
            <div class="system-health">
              <div class="health-item">
                <span class="dot online"></span>
                <span class="health-label">Database Sync: Active</span>
              </div>
              <div class="health-item">
                <span class="dot warning"></span>
                <span class="health-label">Pending Backups: 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, computed, onMounted } from 'vue'

// 🚀 CHANGE 1: Turn these into empty reactive references
const doctorName = ref('User') 
const userInitials = ref('U')
const searchQuery = ref('')
// 🚀 CHANGE 2: Read the logged-in user's details when the component loads on the client
onMounted(() => {
  if (process.client) {
    const storedData = localStorage.getItem('user_data')
    if (storedData) {
      try {
        const user = JSON.parse(storedData)
        
        // Assuming your backend login returns an object containing firstName and lastName
        if (user.firstName) {
          doctorName.value = user.firstName
          
          // Generate initials automatically (e.g., "Penny Rose" -> "PR")
          const firstLetter = user.firstName.charAt(0).toUpperCase()
          const lastLetter = user.lastName ? user.lastName.charAt(0).toUpperCase() : ''
          userInitials.value = firstLetter + lastLetter
        } else if (user.username) {
          // Fallback if firstName isn't available
          doctorName.value = user.username
          userInitials.value = user.username.slice(0, 2).toUpperCase()
        }
      } catch (error) {
        console.error("Error parsing logged-in user data:", error)
      }
    }
  }
})

// Fetch live database counts directly from your stats API endpoint
const { data: metricsResponse, refresh: refreshData } = await useFetch('/api/dashboard/stats')

// Compute stats block dynamically from database metrics
const stats = computed(() => {
  const dbMetrics = metricsResponse.value?.data
  return [
    { 
      label: 'Total Patients', 
      value: dbMetrics?.totalPatients !== undefined ? dbMetrics.totalPatients.toLocaleString() : '0', 
      trendText: 'Live registered list', 
      trendClass: 'positive' 
    },
    { 
      label: 'Pending Lab Results', 
      value: dbMetrics?.pendingLabs || '0', 
      trendText: 'Requires validation', 
      trendClass: 'warning' 
    },
    { 
      label: 'Today\'s Appointments', 
      value: dbMetrics?.todayAppointments || '0', 
      trendText: 'Scheduled today', 
      trendClass: 'next-appt' 
    },
    { 
      label: 'Unpaid Invoices', 
      value: dbMetrics?.unpaidInvoices != null
        ? `₱${Number(dbMetrics.unpaidInvoices).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : '₱0', 
      trendText: 'Requires follow-up', 
      trendClass: 'negative' 
    }
  ]
})

const recentLabs = ref([])

watch(metricsResponse, (res) => {
  const labs = res?.data?.recentLabs
  if (labs?.length) {
    recentLabs.value = labs.map((lab, i) => ({
      id: i + 1,
      test: lab.testName,
      patient: lab.patientName,
      time: lab.status,
      status: lab.status
    }))
  }
}, { immediate: true })

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const filteredLabs = computed(() => {
  if (!searchQuery.value) return recentLabs.value
  const query = searchQuery.value.toLowerCase()
  return recentLabs.value.filter(item => 
    item.patient.toLowerCase().includes(query) || 
    item.test.toLowerCase().includes(query)
  )
})

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      if (process.client) {
        const { clearStoredUser } = await import('~/utils/authSession')
        clearStoredUser()
        sessionStorage.clear()
      }
      await navigateTo('/auth/login') 
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}

const goToProfile = () => { alert('Navigating to profile...') }
</script>

<style scoped>
/* --- ORIGINAL BASE STYLES PRESERVED --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

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
  z-index: 1001; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
}

.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }

.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }

.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.menu-toggle { background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; display: flex; cursor: pointer; transition: background 0.2s; }
.menu-toggle:hover { background: rgba(255, 255, 255, 0.2); }

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
.is-collapsed .nav-item:hover { padding-left: 1rem; }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-tooltip {
  position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; padding: 6px 12px;
  border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; transition: all 0.2s ease;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 1000;
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

.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }

.user-profile { display: flex; align-items: center; gap: 1.5rem; }
.notification-wrapper { position: relative; font-size: 1.3rem; color: #64748b; padding: 4px; display: flex; }
.notification-dot { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid white; }
.avatar { width: 40px; height: 40px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

.dashboard-body { padding: 2rem 3rem; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; transition: all 0.3s ease; }
.search-wrapper input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #475569; height: 44px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; transition: transform 0.4s ease, box-shadow 0.4s ease; }
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px -5px rgba(30, 58, 138, 0.1); }
.stat-card h3 { font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 700; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; margin: 0; }
.stat-change { font-size: 0.85rem; font-weight: 700; display: block; margin-top: 4px; }
.positive { color: #16a34a; }
.warning { color: #ea580c; }
.negative { color: #dc2626; }
.next-appt { color: #2563eb; }

.dashboard-main-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; }
.activity-card, .quick-actions-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h3 { font-size: 1.1rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.view-all-link { color: #2563eb; font-weight: 700; text-decoration: none; font-size: 0.85rem; }

.activity-item { display: flex; align-items: center; gap: 12px; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
.activity-icon-bg { width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.lab-icon { color: #2563eb; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }

.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-left: auto;}
.badge.active { background: #dcfce7; color: #15803d; }
.badge.pending { background: #fef3c7; color: #b45309; }

.actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.action-item { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; transition: all 0.2s; }
.action-item span { font-size: 0.75rem; font-weight: 700; color: #475569; }
.action-item:hover { background: #eff6ff; border-color: #2563eb; transform: translateY(-3px); }
.action-icon-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.action-icon-circle.blue { background: #dbeafe; color: #2563eb; }
.action-icon-circle.green { background: #dcfce7; color: #16a34a; }
.action-icon-circle.purple { background: #f3e8ff; color: #9333ea; }
.action-icon-circle.orange { background: #ffedd5; color: #ea580c; }

.system-health { padding-top: 1rem; border-top: 1px solid #f1f5f9; }
.health-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.online { background: #22c55e; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
.dot.warning { background: #f59e0b; }
.health-label { font-size: 0.75rem; color: #64748b; font-weight: 500; }

.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }

@keyframes fadeInUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
.animate-in { opacity: 0; animation: fadeInUp 0.5s cubic-bezier(0.26, 1.36, 0.74, 1) forwards; }

/* --- RESPONSIVE / MOBILE OVERRIDES --- */
.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-main-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex; }

  /* Sidebar Transformation into Drawer */
  .sidebar {
    position: fixed; top: 0; left: 0; height: 100vh; width: 280px; z-index: 2000;
    transform: translateX(-100%); transition: transform 0.3s ease;
  }
  .mobile-open .sidebar { transform: translateX(0); }
  .sidebar-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1999;
    backdrop-filter: blur(2px); display: none;
  }
  .mobile-open .sidebar-overlay { display: block; }

  /* Content Padding Adjustments */
  .dashboard-body { padding: 1.25rem; }
  .table-controls { flex-direction: column; }
  .search-wrapper { max-width: 100%; }
  .stats-grid { grid-template-columns: 1fr; }
  
  .activity-item { flex-wrap: wrap; }
  .badge { margin-left: 52px; margin-top: 8px; width: fit-content; }
}
</style>