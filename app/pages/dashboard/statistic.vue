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
        <NuxtLink to="/dashboard/statistic" class="nav-item router-link-active">
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
          <h1>Analytics Intelligence</h1>
          <p>Comprehensive data insights for clinical and operational excellence.</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">
            <Icon name="lucide:filter" /> Filter Date
          </button>
          <button class="export-btn">
            <Icon name="lucide:download" /> Download Full Report
          </button>
        </div>
      </header>

      <section class="stats-body">
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Total Admissions</span>
              <Icon name="lucide:user-plus" class="kpi-icon" />
            </div>
            <h2 class="kpi-value">2,405</h2>
            <div class="kpi-trend up">
              <Icon name="lucide:trending-up" /> +8.2% 
              <span class="trend-label">vs last month</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Bed Occupancy</span>
              <Icon name="lucide:bed" class="kpi-icon" />
            </div>
            <h2 class="kpi-value">84%</h2>
            <div class="progress-bar-mini"><div class="fill" style="width: 84%"></div></div>
            <div class="kpi-trend neutral">Near Capacity</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Avg. ER Wait Time</span>
              <Icon name="lucide:clock" class="kpi-icon" />
            </div>
            <h2 class="kpi-value">24m</h2>
            <div class="kpi-trend down">
              <Icon name="lucide:trending-down" /> -5.4% 
              <span class="trend-label">efficiency gain</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-label">Revenue Growth</span>
              <Icon name="lucide:banknote" class="kpi-icon" />
            </div>
            <h2 class="kpi-value">$142k</h2>
            <div class="kpi-trend up">
              <Icon name="lucide:trending-up" /> +12% 
              <span class="trend-label">this quarter</span>
            </div>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-box main-chart">
            <div class="chart-header">
              <div class="title-group">
                <h3>Patient Demographics & Trends</h3>
                <p>New vs. Returning patients per month</p>
              </div>
              <div class="chart-controls">
                <button class="tab active">Monthly</button>
                <button class="tab">Weekly</button>
              </div>
            </div>
            <div class="visual-placeholder bar-chart">
              <div class="bar-wrapper" v-for="h in [40, 60, 55, 90, 75, 85, 70, 95, 65, 80, 50, 70]" :key="h">
                <div class="bar" :style="{ height: h + '%' }"></div>
                <span class="bar-label">M</span>
              </div>
            </div>
          </div>
          
          <div class="chart-box side-chart">
            <div class="chart-header">
              <h3>Specialty Distribution</h3>
            </div>
            <div class="pie-container">
              <div class="visual-placeholder pie-chart">
                <div class="circle">
                   <div class="inner-circle"><span>78%</span><small>Capacity</small></div>
                </div>
              </div>
              <ul class="chart-legend">
                <li>
                  <span class="dot cardio"></span> 
                  <span class="dept">Cardiology</span>
                  <span class="val">40%</span>
                </li>
                <li>
                  <span class="dot neuro"></span> 
                  <span class="dept">Neurology</span>
                  <span class="val">30%</span>
                </li>
                <li>
                  <span class="dot ped"></span> 
                  <span class="dept">Pediatrics</span>
                  <span class="val">30%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="performance-table-section">
          <h3>Department Performance Leaderboard</h3>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Patient Volume</th>
                <th>Satisfaction Score</th>
                <th>Avg. Stay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>General Medicine</td>
                <td>1,200</td>
                <td>4.8/5.0</td>
                <td>3.2 Days</td>
                <td><span class="status-tag success">Optimal</span></td>
              </tr>
              <tr>
                <td>Emergency Room</td>
                <td>850</td>
                <td>4.2/5.0</td>
                <td>0.4 Days</td>
                <td><span class="status-tag warning">Busy</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* --- Keep your existing Sidebar CSS, then add/update these: --- */

.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.95rem; }

.header-actions { display: flex; gap: 12px; }
.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #475569;
  font-weight: 600;
}

/* KPI Enhancements */
.kpi-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.kpi-icon { background: #eff6ff; color: #2563eb; padding: 8px; border-radius: 8px; font-size: 1.2rem; }
.kpi-label { color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.progress-bar-mini { height: 6px; background: #f1f5f9; border-radius: 10px; margin: 1rem 0; overflow: hidden; }
.progress-bar-mini .fill { height: 100%; background: #2563eb; border-radius: 10px; }

/* Charts Layout */
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.title-group h3 { margin: 0; color: #1e293b; font-size: 1.1rem; }
.title-group p { margin: 4px 0 0; font-size: 0.85rem; color: #94a3b8; }

.chart-controls { display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; }
.tab { border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #64748b; background: transparent; }
.tab.active { background: white; color: #1e3a8a; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* Bar Chart Polish */
.bar-wrapper { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 6%; gap: 8px; }
.bar-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
.bar { width: 100%; background: linear-gradient(to top, #2563eb, #60a5fa); border-radius: 4px; transition: height 0.3s ease; }
.bar:hover { filter: brightness(1.1); cursor: pointer; }

/* Donut Chart Style */
.circle { position: relative; display: flex; align-items: center; justify-content: center; }
.inner-circle { 
  position: absolute; width: 120px; height: 120px; background: white; border-radius: 50%; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
.inner-circle span { font-size: 1.4rem; font-weight: 800; color: #1e293b; }
.inner-circle small { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; }

.chart-legend { margin-top: 1.5rem; }
.chart-legend li { border: none; justify-content: space-between; }
.dept { flex: 1; margin-left: 10px; font-weight: 500; }
.val { font-weight: 700; color: #1e293b; }

/* Table Section */
.performance-table-section { margin-top: 2rem; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.performance-table-section h3 { margin-bottom: 1.5rem; color: #1e293b; }

.stats-table { width: 100%; border-collapse: collapse; text-align: left; }
.stats-table th { padding: 12px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.85rem; text-transform: uppercase; }
.stats-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 0.95rem; }

.status-tag { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.status-tag.success { background: #dcfce7; color: #166534; }
.status-tag.warning { background: #fef9c3; color: #854d0e; }

.kpi-trend { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; margin-top: 0.5rem; }
.trend-label { color: #94a3b8; font-weight: 400; }
</style>