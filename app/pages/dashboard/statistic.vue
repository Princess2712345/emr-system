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
        <NuxtLink to="/dashboard/statistic" class="nav-item active">
          <Icon name="lucide:bar-chart-3" /> Statistics
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
          <span class="breadcrumb">REPORTS / ANALYTICS</span>
          <h1>System Statistics</h1>
          <p>Real-time analytics and performance metrics across all departments.</p>
        </div>
        <div class="header-actions">
          <div class="status-indicator">
            <span class="pulse-dot"></span>
            Live Updates
          </div>
          <button class="export-btn">
            <Icon name="lucide:download" /> Download Full Report
          </button>
        </div>
      </header>

      <section class="stats-body">
        <div class="kpi-grid">
          <div v-for="kpi in kpiData" :key="kpi.label" class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">{{ kpi.label }}</span>
              <Icon :name="kpi.icon" class="kpi-icon-bg" />
            </div>
            <h2 class="kpi-value">{{ kpi.value }}</h2>
            <div :class="['kpi-trend', kpi.trendType]">
              <Icon :name="kpi.trendType === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'" />
              {{ kpi.trend }} <span class="trend-label">vs last month</span>
            </div>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-box main-chart">
            <div class="chart-header">
              <div>
                <h3>Patient Admissions (Monthly)</h3>
                <p class="chart-sub">Volume tracking for current fiscal year</p>
              </div>
              <select class="chart-filter">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div class="visual-placeholder bar-chart">
              <div v-for="(height, index) in [40, 60, 55, 90, 75, 85, 70, 95, 65, 80]" 
                   :key="index" 
                   class="bar-wrapper">
                <div class="bar-tooltip">{{ height }}%</div>
                <div class="bar" :style="{ height: height + '%' }"></div>
                <span class="bar-label">M{{ index + 1 }}</span>
              </div>
            </div>
          </div>
          
          <div class="chart-box side-chart">
            <div class="chart-header">
              <h3>Distribution</h3>
            </div>
            <div class="pie-container">
              <div class="pie-visual">
                <div class="circle"></div>
                <div class="inner-label">
                  <strong>100%</strong>
                  <span>Total</span>
                </div>
              </div>
              <ul class="chart-legend">
                <li v-for="item in distribution" :key="item.name">
                  <div class="legend-info">
                    <span :class="['dot', item.class]"></span>
                    {{ item.name }}
                  </div>
                  <strong>{{ item.pct }}%</strong>
                </li>
              </ul>
            </div>
          </div>

          <div class="chart-box full-width-table">
            <div class="chart-header">
              <h3>Departmental Performance Index</h3>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Patients</th>
                  <th>Avg. Stay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dept in departments" :key="dept.name">
                  <td class="font-bold">{{ dept.name }}</td>
                  <td>{{ dept.patients }}</td>
                  <td>{{ dept.stay }} Days</td>
                  <td><span class="status-pill">Optimal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
const kpiData = [
  { label: 'Patient Growth', value: '2,405', trend: '+8.2%', trendType: 'up', icon: 'lucide:user-plus' },
  { label: 'Avg. Consultation', value: '18m', trend: '-2.1%', trendType: 'up', icon: 'lucide:clock' },
  { label: 'System Uptime', value: '99.9%', trend: 'Stable', trendType: 'up', icon: 'lucide:activity' },
  { label: 'Active Staff', value: '142', trend: '+4', trendType: 'up', icon: 'lucide:shield-check' }
];

const distribution = [
  { name: 'Cardiology', pct: 40, class: 'cardio' },
  { name: 'Neurology', pct: 30, class: 'neuro' },
  { name: 'Pediatrics', pct: 30, class: 'ped' }
];

const departments = [
  { name: 'Cardiology Unit', patients: '1,204', stay: '4.2' },
  { name: 'Neurology Dept', patients: '840', stay: '6.1' },
  { name: 'Pediatric Ward', patients: '361', stay: '2.5' }
];

const handleLogout = () => {
  console.log("Logged out");
}
</script>

<style scoped>
/* --- SIDEBAR (NO CHANGES TO COLOR) --- */
.dashboard-layout { 
  display: flex; 
  height: 100vh; /* Fixed height */
  background: #f8fafc; 
  font-family: 'Inter', sans-serif; 
  color: #1e293b; 
  overflow: hidden; /* Prevent global scroll */
}

.sidebar { 
  width: 260px; 
  background: #1e3a8a; 
  color: white; 
  display: flex; 
  flex-direction: column; 
  padding: 2rem 1.5rem; 
  height: 100vh; 
  position: sticky; 
  top: 0; 
  z-index: 10; 
}

.main-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  height: 100vh; /* Fixed height */
  overflow: hidden; 
}

.top-bar { 
  background: white; 
  padding: 1.25rem 2.5rem; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 1px solid #e2e8f0; 
  flex-shrink: 0; /* Header won't shrink or scroll */
}

/* Renamed from .patient-body to .stats-body to match template */
.stats-body { 
  flex: 1; 
  overflow-y: auto; /* Independent scroll enabled */
  padding: 2rem 2.5rem; 
}

/* --- SIDEBAR STYLING --- */
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.nav-item.active { background: #2563eb; color: white; }
.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px);}

/* --- ENHANCED CONTENT --- */
.breadcrumb { font-size: 0.7rem; font-weight: 800; color: #64748b; letter-spacing: 1px; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 800; }
.top-bar p { color: #64748b; margin: 4px 0 0; font-size: 0.9rem; }

.status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: #10b981; margin-right: 1.5rem; }
.pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }

/* KPI CARDS ENHANCEMENT */
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
  border: 1px solid #e2e8f0; 
  border-top: 4px solid #2563eb; 
  position: relative; 
  overflow: hidden;
  /* Added for the lifting effect */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Hover Lift Effect */
.kpi-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
}

/* Click Press Effect */
.kpi-card:active {
  transform: translateY(-2px);
  transition: all 0.1s ease;
}

.kpi-top { display: flex; justify-content: space-between; align-items: center; }

.kpi-label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

.kpi-icon-bg { 
  position: absolute; 
  right: -10px; 
  top: -10px; 
  font-size: 4rem; 
  opacity: 0.03; 
  color: #1e3a8a; 
  pointer-events: none;
}

.kpi-value { 
  font-size: 2rem; 
  font-weight: 800; 
  margin: 1rem 0; 
  color: #1e293b; 
  letter-spacing: -1px; 
}

/* BAR CHART ENHANCEMENT */
.charts-container { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; }
.chart-box { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.chart-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e3a8a; }
.chart-sub { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }

.visual-placeholder { background: #f8fafc; border-radius: 8px; height: 300px; display: flex; align-items: flex-end; justify-content: space-around; padding: 1.5rem 1rem; border: 1px solid #f1f5f9; }
.bar-wrapper { width: 7%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; position: relative; }
.bar { width: 100%; background: linear-gradient(to top, #1e3a8a, #3b82f6); border-radius: 4px 4px 0 0; transition: 0.3s; cursor: pointer; }
.bar:hover { filter: brightness(1.2); }
.bar-tooltip { position: absolute; top: -30px; background: #1e293b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; opacity: 0; transition: 0.2s; }
.bar-wrapper:hover .bar-tooltip { opacity: 1; transform: translateY(-5px); }
.bar-label { font-size: 10px; color: #94a3b8; margin-top: 8px; font-weight: 600; }

/* PIE CHART ENHANCEMENT */
.pie-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; margin-top: 1rem; }
.pie-visual { position: relative; }
.inner-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; flex-direction: column; }
.inner-label strong { font-size: 1.2rem; color: #1e293b; }
.inner-label span { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; }
.circle { width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#2563eb 0% 40%, #10b981 40% 70%, #f59e0b 70% 100%); mask: radial-gradient(transparent 55%, black 56%); }

.chart-legend { width: 100%; list-style: none; padding: 0; }
.chart-legend li { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
.legend-info { display: flex; align-items: center; gap: 10px; color: #475569; font-weight: 500; }

.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.cardio { background: #2563eb; }
.dot.neuro { background: #10b981; }
.dot.ped { background: #f59e0b; }

/* DATA TABLE */
.full-width-table { grid-column: span 2; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.data-table th { text-align: left; padding: 12px; font-size: 0.8rem; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.data-table td { padding: 12px; font-size: 0.9rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
.status-pill { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
.export-btn { background: #1e3a8a; color: white; padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; transition: 0.2s; cursor: pointer; }
.export-btn:hover { background: #1e40af; }
</style>