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
        <button class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <span class="breadcrumb">Analytics / Institutional Performance</span>
          <h1>System Intelligence</h1>
          <p>Real-time clinical metrics and departmental throughput.</p>
        </div>
        <div class="header-actions">
          <div class="date-range-picker">
            <Icon name="lucide:calendar" class="icon-sm" />
            <span>Apr 01 - Apr 24, 2026</span>
          </div>
          <button class="btn-download">
            <Icon name="lucide:download" /> Export Data
          </button>
        </div>
      </header>

      <div class="scroll-area">
        <section class="stats-row">
          <div v-for="stat in systemKpis" :key="stat.label" class="stat-card">
            <div class="stat-meta">
              <span class="label">{{ stat.label }}</span>
              <div :class="['trend-badge', stat.trendType]">
                <Icon :name="stat.trendType === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'" />
                {{ stat.trend }}
              </div>
            </div>
            <div class="stat-body">
              <h3 class="value">{{ stat.value }}</h3>
              <div class="mini-chart">
                <div v-for="n in 6" :key="n" class="spark-bar" :style="{ height: Math.random() * 80 + 20 + '%' }"></div>
              </div>
            </div>
          </div>
        </section>

        <div class="analytics-grid">
          <div class="panel main-panel">
            <div class="panel-header">
              <div>
                <h4>Patient Admissions Volume</h4>
                <p>Monthly trends compared to previous year</p>
              </div>
              <div class="chart-legend">
                <span class="legend-item"><span class="dot primary"></span> 2026</span>
                <span class="legend-item"><span class="dot secondary"></span> 2025</span>
              </div>
            </div>
            <div class="visual-container">
              <div class="bar-chart">
                <div v-for="month in months" :key="month" class="bar-column">
                  <div class="bar-stack">
                    <div class="bar curr" :style="{ height: Math.random() * 70 + 30 + '%' }"></div>
                    <div class="bar prev" :style="{ height: Math.random() * 50 + 20 + '%' }"></div>
                  </div>
                  <span class="label">{{ month }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel side-panel">
            <div class="panel-header">
              <h4>Bed Occupancy</h4>
            </div>
            <div class="donut-container">
              <div class="donut-svg">
                <div class="donut-inner">
                  <span class="percent">92%</span>
                  <span class="sub">Capacity</span>
                </div>
              </div>
            </div>
            <ul class="stat-list">
              <li><span>Emergency</span> <strong>12/15</strong></li>
              <li><span>ICU</span> <strong>08/10</strong></li>
              <li><span>General Ward</span> <strong>45/50</strong></li>
              <li><span>Pediatrics</span> <strong>18/20</strong></li>
            </ul>
          </div>

          <div class="panel full-panel">
            <div class="panel-header">
              <h4>Departmental Performance Index</h4>
            </div>
            <div class="table-container">
              <table class="clinical-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Head Physician</th>
                    <th>Avg. Stay</th>
                    <th>Patient Satisfaction</th>
                    <th>Efficiency</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dept in departments" :key="dept.name">
                    <td>
                      <div class="dept-cell">
                        <div class="dept-icon">{{ dept.name.charAt(0) }}</div>
                        <strong>{{ dept.name }}</strong>
                      </div>
                    </td>
                    <td>{{ dept.head }}</td>
                    <td>{{ dept.los }} Days</td>
                    <td>
                      <div class="rating-stars">
                        <Icon name="lucide:star" v-for="n in 5" :key="n" :class="{ filled: n <= dept.rating }" />
                      </div>
                    </td>
                    <td>
                      <div class="efficiency-bar">
                        <div class="fill" :style="{ width: dept.efficiency + '%' }"></div>
                        <span>{{ dept.efficiency }}%</span>
                      </div>
                    </td>
                    <td class="text-right"><button class="btn-manage">Details</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const systemKpis = [
  { label: 'Avg. Consultation', value: '18.4m', trend: '12%', trendType: 'up' },
  { label: 'Mortality Rate', value: '0.02%', trend: '0.1%', trendType: 'down' },
  { label: 'Wait Time', value: '12m', trend: '4%', trendType: 'down' },
  { label: 'Staff Activity', value: '94%', trend: 'Stable', trendType: 'up' }
];

const departments = [
  { name: 'Cardiology', head: 'Dr. Aris Thorne', los: '4.2', rating: 5, efficiency: 92 },
  { name: 'Pediatrics', head: 'Dr. Sarah Jenkins', los: '2.8', rating: 4, efficiency: 88 },
  { name: 'Neurology', head: 'Dr. Robert Lim', los: '6.1', rating: 5, efficiency: 75 }
];
</script>

<style scoped>
/* --- BASE LAYOUT (Matching Screenshot 538) --- */
.dashboard-layout { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
.sidebar { width: 240px; background: #0f172a; padding: 1.5rem 1rem; display: flex; flex-direction: column; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 2.5rem; color: white; font-weight: 700; }
.icon-blue-light { color: #3b82f6; font-size: 1.5rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1rem; color: #94a3b8; text-decoration: none; font-size: 0.9rem; border-radius: 8px; transition: 0.2s; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.router-link-active { background: #1e293b; color: #3b82f6; box-shadow: inset 3px 0 0 #3b82f6; }

.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { background: white; padding: 1.25rem 2.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.breadcrumb { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 1px; font-weight: 600; }
.top-bar h1 { margin: 4px 0 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
.top-bar p { margin: 2px 0 0; font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 12px; }
.date-range-picker { background: #f1f5f9; padding: 0.6rem 1rem; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #475569; font-weight: 600; }
.btn-download { background: #0f172a; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; }

.scroll-area { padding: 2rem 2.5rem; overflow-y: auto; }

/* --- KPI CARDS --- */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.stat-meta { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.stat-meta .label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.trend-badge { font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
.trend-badge.up { background: #dcfce7; color: #166534; }
.trend-badge.down { background: #fee2e2; color: #991b1b; }
.stat-body { display: flex; justify-content: space-between; align-items: flex-end; }
.stat-body .value { font-size: 1.75rem; font-weight: 800; margin: 0; color: #0f172a; }
.mini-chart { display: flex; align-items: flex-end; gap: 3px; height: 35px; }
.spark-bar { width: 4px; background: #e2e8f0; border-radius: 2px; }

/* --- ANALYTICS PANELS --- */
.analytics-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; }
.panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.panel-header h4 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.panel-header p { margin: 4px 0 0; font-size: 0.85rem; color: #64748b; }

.visual-container { height: 280px; }
.bar-chart { display: flex; justify-content: space-between; align-items: flex-end; height: 100%; padding-bottom: 20px; }
.bar-column { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-stack { width: 14px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; }
.bar.curr { background: #3b82f6; border-radius: 3px; }
.bar.prev { background: #cbd5e1; border-radius: 3px; }
.bar-column .label { margin-top: 12px; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

.donut-container { height: 200px; display: flex; justify-content: center; align-items: center; }
.donut-svg { width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#3b82f6 0% 92%, #f1f5f9 92% 100%); display: flex; align-items: center; justify-content: center; }
.donut-inner { width: 120px; height: 120px; background: white; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.donut-inner .percent { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.donut-inner .sub { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

.stat-list { list-style: none; padding: 0; margin-top: 1.5rem; }
.stat-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #475569; }
.stat-list li strong { color: #0f172a; }

/* --- PERFORMANCE TABLE --- */
.full-panel { grid-column: span 2; }
.clinical-table { width: 100%; border-collapse: collapse; }
.clinical-table th { text-align: left; padding: 12px 20px; background: #f8fafc; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.clinical-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }

.dept-cell { display: flex; align-items: center; gap: 12px; }
.dept-icon { width: 32px; height: 32px; background: #eff6ff; color: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }

.rating-stars { color: #e2e8f0; display: flex; gap: 2px; }
.rating-stars .filled { color: #f59e0b; }

.efficiency-bar { display: flex; align-items: center; gap: 10px; }
.efficiency-bar .fill { height: 6px; width: 80px; background: #10b981; border-radius: 3px; }
.efficiency-bar span { font-size: 0.75rem; font-weight: 700; color: #10b981; }

.btn-manage { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; color: #475569; }
.btn-manage:hover { background: #3b82f6; color: white; border-color: #3b82f6; }
.text-right { text-align: right; }
</style>