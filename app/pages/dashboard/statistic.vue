<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar portal-top-bar">
        <div class="welcome-msg">
          <span class="breadcrumb">REPORTS / ANALYTICS</span>
          <h1>System Statistics</h1>
          <p>Real-time analytics and performance metrics across all departments.</p>
        </div>
        <div class="header-actions portal-header-actions">
          <div class="status-indicator">
            <span class="pulse-dot"></span>
            Live Updates
          </div>
          <button class="export-btn clickable">
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
              <div v-for="(height, index) in statsData.monthlyAdmissions" 
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
                <li v-for="item in statsData.distribution" :key="item.name">
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
                <tr v-for="dept in statsData.departments" :key="dept.name">
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
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { computed } from 'vue'

// Securely pull dynamic live numbers from your Prisma Client backend layout route
const { data: statsData } = await useFetch('/api/statistic', {
  default: () => ({
    kpis: { totalPatients: '0', totalStaff: '0', appointmentsCount: '0' },
    distribution: [],
    monthlyAdmissions: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    departments: []
  })
})

// Computed array formatting data seamlessly into your layout grid template loops
const kpiData = computed(() => [
  { label: 'Patient Registry', value: statsData.value.kpis.totalPatients, trend: '+8.2%', trendType: 'up', icon: 'lucide:user-plus' },
  { label: 'Booked Appointments', value: statsData.value.kpis.appointmentsCount, trend: 'Stable', trendType: 'up', icon: 'lucide:clock' },
  { label: 'System Uptime', value: '99.9%', trend: 'Stable', trendType: 'up', icon: 'lucide:activity' },
  { label: 'Active Staff Users', value: statsData.value.kpis.totalStaff, trend: '+2', trendType: 'up', icon: 'lucide:shield-check' }
])
</script>

<style scoped>
/* --- CORE LAYOUT & SIDEBAR (Synced) --- */
.dashboard-layout { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; overflow: hidden; }

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

.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { padding-left: 0.8rem; }

.router-link-active { background: #2563eb !important; color: white !important; }

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
  position: relative; 
  transition: all 0.2s ease;
}

.logout-btn:hover { 
  background: rgba(252, 165, 165, 0.1); 
  color: #f87171; 
  transform: translateX(5px); 
}

.is-collapsed .logout-btn { 
  justify-content: center; 
}

.is-collapsed .logout-btn:hover { 
  transform: none; 
}

.logout-btn:hover .sidebar-tooltip { 
  opacity: 1; 
  margin-left: 10px; 
}

/* --- MAIN CONTENT AREA --- */
.main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.top-bar { background: white; padding: 1.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
.stats-body { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }

/* KPI CARDS */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.kpi-card { 
  background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; border-top: 4px solid #2563eb; 
  position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.kpi-card:hover { transform: translateY(-6px); box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1); border-top-color: #3b82f6; }
.kpi-top { display: flex; justify-content: space-between; align-items: center; }
.kpi-label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.kpi-icon-bg { position: absolute; right: -10px; top: -10px; font-size: 4rem; opacity: 0.03; color: #1e3a8a; pointer-events: none; }
.kpi-value { font-size: 2rem; font-weight: 800; margin: 1rem 0; color: #1e293b; letter-spacing: -1px; }

/* CHARTS */
.charts-container { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; }
.chart-box { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.chart-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e3a8a; }

.visual-placeholder { background: #f8fafc; border-radius: 8px; height: 300px; display: flex; align-items: flex-end; justify-content: space-around; padding: 1.5rem 1rem; border: 1px solid #f1f5f9; }
.bar-wrapper { width: 7%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; position: relative; }
.bar { width: 100%; background: linear-gradient(to top, #1e3a8a, #3b82f6); border-radius: 4px 4px 0 0; transition: 0.3s; cursor: pointer; }
.bar:hover { filter: brightness(1.2); }
.bar-tooltip { position: absolute; top: -30px; background: #1e293b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; opacity: 0; transition: 0.2s; }
.bar-wrapper:hover .bar-tooltip { opacity: 1; transform: translateY(-5px); }

/* SVG Pie Fallback Colors */
.circle { width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#2563eb 0% 40%, #10b981 40% 70%, #f59e0b 70% 100%); mask: radial-gradient(transparent 55%, black 56%); }
.pie-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; margin-top: 1rem; }
.pie-visual { position: relative; }
.inner-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; flex-direction: column; }

.full-width-table { grid-column: span 2; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.data-table th { text-align: left; padding: 12px; font-size: 0.8rem; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.data-table td { padding: 12px; font-size: 0.9rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; }

.status-pill { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.font-bold { font-weight: 700; }

.export-btn { background: #1e3a8a; color: white; padding: 0.7rem 1.2rem; border-radius: 8px; border: none; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; transition: 0.2s; cursor: pointer; }
.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
.pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
</style>