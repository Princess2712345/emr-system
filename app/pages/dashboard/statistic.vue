<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue" />
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
        <NuxtLink to="/auth/login" class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </NuxtLink>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>System Statistics</h1>
          <p>Real-time analytics and performance metrics across all departments.</p>
        </div>
        <div class="header-actions">
          <button class="export-btn">Download Full Report</button>
        </div>
      </header>

      <section class="stats-body">
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Patient Growth</span>
            <h2 class="kpi-value">2,405</h2>
            <div class="kpi-trend up">+8.2% <span class="trend-label">vs last month</span></div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Avg. Consultation Time</span>
            <h2 class="kpi-value">18m</h2>
            <div class="kpi-trend down">-2.1% <span class="trend-label">efficiency increase</span></div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">System Uptime</span>
            <h2 class="kpi-value">99.9%</h2>
            <div class="kpi-trend up">Stable <span class="trend-label">Service status</span></div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Active Staff</span>
            <h2 class="kpi-value">142</h2>
            <div class="kpi-trend up">+4 <span class="trend-label">on duty</span></div>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-box main-chart">
            <div class="chart-header">
              <h3>Patient Admissions (Monthly)</h3>
              <select class="chart-filter">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div class="visual-placeholder bar-chart">
              <div class="bar" style="height: 40%"></div>
              <div class="bar" style="height: 60%"></div>
              <div class="bar" style="height: 55%"></div>
              <div class="bar" style="height: 90%"></div>
              <div class="bar" style="height: 75%"></div>
              <div class="bar" style="height: 85%"></div>
              <div class="bar" style="height: 70%"></div>
              <div class="bar" style="height: 95%"></div>
              <div class="bar" style="height: 65%"></div>
              <div class="bar" style="height: 80%"></div>
            </div>
          </div>
          
          <div class="chart-box side-chart">
            <h3>Department Distribution</h3>
            <div class="pie-container">
              <div class="visual-placeholder pie-chart">
                <div class="circle"></div>
              </div>
              <ul class="chart-legend">
                <li><span class="dot cardio"></span> Cardiology (40%)</li>
                <li><span class="dot neuro"></span> Neurology (30%)</li>
                <li><span class="dot ped"></span> Pediatrics (30%)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f1f5f9;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

/* --- SIDEBAR RESTORATION --- */
.sidebar {
  width: 260px;
  background: #1e3a8a;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 3rem;
  color: #ffffff;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.8rem 1rem;
  color: #bfdbfe; /* Restored light blue for readability */
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-item.active {
  background: #2563eb;
  color: white;
}

.sidebar-footer {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  color: #fca5a5;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

/* --- MAIN CONTENT (WIDE) --- */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.top-bar {
  background: white;
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.top-bar h1 {
  font-size: 1.8rem;
  color: #1e3a8a;
  margin: 0;
}

.stats-body {
  padding: 2rem 3rem;
  width: 100%;
  box-sizing: border-box;
}

/* 4-Column Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid #2563eb;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.kpi-value {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0.5rem 0;
  color: #1e293b;
}

/* Wide Charts */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.chart-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.visual-placeholder {
  background: #f8fafc;
  border-radius: 8px;
  height: 350px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 1.5rem;
}

.bar {
  width: 6%;
  background: linear-gradient(to top, #2563eb, #60a5fa);
  border-radius: 4px 4px 0 0;
}

.circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(#2563eb 0% 40%, #10b981 40% 70%, #f59e0b 70% 100%);
}

.chart-legend li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #475569;
}

.dot { width: 12px; height: 12px; border-radius: 50%; }
.cardio { background: #2563eb; }
.neuro { background: #10b981; }
.ped { background: #f59e0b; }

.up { color: #10b981; font-weight: 600; }
.down { color: #f43f5e; font-weight: 600; }
.export-btn { cursor: pointer; background: #1e3a8a; color: white; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; }
</style>