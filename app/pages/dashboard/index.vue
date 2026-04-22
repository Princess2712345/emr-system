<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue-light" />
        <span class="logo-text">EMR System</span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item active">
          <Icon name="lucide:layout-dashboard" /> Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/patients" class="nav-item">
          <Icon name="lucide:users" /> Patients
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/dashboard/confinement" class="nav-item">
          <Icon name="lucide:bed" /> Confinement
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
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Welcome back, Dr. Smith</h1>
          <p>Here is what's happening with your clinic today.</p>
        </div>
        
        <div class="header-actions">
           <div class="user-profile">
            <div class="notification-bell clickable">
              <Icon name="lucide:bell" />
            </div>
            <div class="avatar clickable">JS</div>
          </div>
        </div>
      </header>

      <section class="dashboard-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              type="text" 
              placeholder="Search patients, records, or inventory..." 
            />
          </div>
          <div class="filter-group">
            <button class="filter-btn">
              <Icon name="lucide:calendar" /> Today's Date
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Patients</h3>
            <p class="stat-value">1,284</p>
            <span class="stat-change positive">+12% this month</span>
          </div>
          <div class="stat-card">
            <h3>Pending Lab Results</h3>
            <p class="stat-value">14</p>
            <span class="stat-change warning">6 Urgent requests</span>
          </div>
          <div class="stat-card">
            <h3>Today's Appointments</h3>
            <p class="stat-value">24</p>
            <span class="stat-change next-appt">Next at 2:00 PM</span>
          </div>
          <div class="stat-card">
            <h3>Unpaid Invoices</h3>
            <p class="stat-value">8</p>
            <span class="stat-change negative">Requires follow-up</span>
          </div>
        </div>

        <div class="dashboard-main-grid">
          <div class="activity-card">
            <div class="section-header">
              <h3>Recent Lab Updates</h3>
              <NuxtLink to="/dashboard/lab-results" class="view-all-link">View All</NuxtLink>
            </div>
            <div class="activity-list">
              <div class="activity-item" v-for="item in recentLabs" :key="item.id">
                <div class="activity-icon-bg">
                  <Icon name="lucide:flask-conical" class="lab-icon" />
                </div>
                <div class="activity-text">
                  <p class="p-name">{{ item.test }}</p>
                  <p class="p-email">Patient: {{ item.patient }} • {{ item.time }}</p>
                </div>
                <span class="badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
              </div>
            </div>
          </div>

          <div class="analysis-promo-card">
            <div class="promo-content">
              <Icon name="lucide:line-chart" class="promo-icon" />
              <h2>Analyze your data</h2>
              <p>View detailed insights into demographics and hospital efficiency.</p>
              <NuxtLink to="/dashboard/statistic" class="view-stats-btn">
                View Statistics →
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
const recentLabs = [
  { id: 1, test: 'CBC Panel', patient: 'John Doe', time: '10 mins ago', status: 'Active' },
  { id: 2, test: 'Lipid Profile', patient: 'Alice Smith', time: '45 mins ago', status: 'Pending' },
  { id: 3, test: 'Chest X-Ray', patient: 'Robert Johnson', time: '2 hours ago', status: 'Active' },
]

const handleLogout = () => { alert('Logging out...') }
</script>

<style scoped>
/* REUSING YOUR EXACT STYLES FOR CONSISTENCY */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: 0.2s; }
.nav-item:hover, .nav-item.active { background: rgba(255, 255, 255, 0.1); color: white; }
.nav-item.active { background: #2563eb; }
.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

.main-content { flex: 1; display: flex; flex-direction: column; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }

/* USER PROFILE SECTION */
.user-profile { display: flex; align-items: center; gap: 1.5rem; }
.notification-bell { font-size: 1.3rem; color: #64748b; }
.avatar { width: 40px; height: 40px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

.dashboard-body { padding: 2rem 3rem; }

/* CONTROLS (SAME AS MAIN) */
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; outline: none; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #475569; cursor: pointer; height: 44px; }

/* STATS CARDS */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.stat-card h3 { font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 700; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #1e3a8a; margin: 0; }
.stat-change { font-size: 0.8rem; font-weight: 600; }
.positive { color: #16a34a; }
.warning { color: #ea580c; }
.negative { color: #dc2626; }
.next-appt { color: #2563eb; }

/* BOTTOM GRID */
.dashboard-main-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; }
.activity-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h3 { color: #1e3a8a; font-weight: 700; margin: 0; }
.view-all-link { color: #2563eb; font-weight: 700; text-decoration: none; font-size: 0.85rem; }

.activity-item { display: flex; align-items: center; gap: 12px; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
.activity-icon-bg { width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.lab-icon { color: #2563eb; }
.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }

/* BADGES (SYNCED WITH MAIN) */
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-left: auto;}
.badge.active { background: #dcfce7; color: #15803d; }
.badge.pending { background: #fef3c7; color: #b45309; }

.analysis-promo-card { background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%); color: white; border-radius: 12px; padding: 2rem; display: flex; align-items: center; justify-content: center; text-align: center; }
.promo-icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.9; }
.promo-content h2 { font-size: 1.4rem; margin-bottom: 0.5rem; }
.promo-content p { font-size: 0.9rem; opacity: 0.8; margin-bottom: 1.5rem; }
.view-stats-btn { background: white; color: #1e3a8a; padding: 0.75rem 1.25rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.9rem; }

.clickable { cursor: pointer; transition: 0.2s; }
.clickable:hover { opacity: 0.7; }
</style>