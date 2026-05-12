<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed, 'mobile-open': isMobileOpen }">
    
    <!-- MOBILE OVERLAY -->
    <div class="sidebar-overlay" @click="isMobileOpen = false"></div>

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!isCollapsed || isMobileOpen">
          <Icon name="mdi:hospital-building" class="icon-blue-light" />
          <span class="logo-text">EMR System</span>
        </div>
        <button class="menu-toggle clickable desktop-only" @click="isCollapsed = !isCollapsed">
          <Icon :name="isCollapsed ? 'lucide:menu' : 'lucide:chevron-left'" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-item">
          <Icon :name="link.icon" />
          <span v-if="!isCollapsed || isMobileOpen" class="nav-label">{{ link.label }}</span>
          <span v-if="isCollapsed && !isMobileOpen" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed || isMobileOpen">Logout</span>
          <span v-if="isCollapsed && !isMobileOpen" class="sidebar-tooltip">Logout</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <!-- MOBILE MENU BAR -->
      <header class="mobile-nav-bar mobile-only">
        <button class="mobile-menu-toggle" @click="isMobileOpen = true">
          <Icon name="lucide:menu" />
        </button>
        <div class="mobile-logo-text">EMR System</div>
        <div class="mobile-avatar">JS</div>
      </header>

      <header class="top-bar desktop-only">
        <div class="welcome-msg">
          <h1>Schedule & Appointments</h1>
          <p class="subtitle">{{ currentView === 'list' ? 'Daily Timeline' : 'Monthly View' }} — 2026</p>
        </div>
        <div class="header-actions">
          <button class="calendar-btn clickable" @click="toggleView">
            <Icon :name="currentView === 'list' ? 'lucide:calendar' : 'lucide:list'" />
            {{ currentView === 'list' ? 'Calendar View' : 'List View' }}
          </button>
        </div>
      </header>

      <section class="appointment-body">
        <div class="side-by-side-container">
          
          <div class="view-content animate-in">
            <div v-if="currentView === 'list'">
              <div class="schedule-header">
                <div class="date-display">
                  <button class="arrow-btn clickable"><Icon name="lucide:chevron-left" /></button>
                  <span class="current-date">Today, April 3</span>
                  <button class="arrow-btn clickable"><Icon name="lucide:chevron-right" /></button>
                </div>
                <div class="view-filters">
                  <button 
                    v-for="status in ['All', 'Confirmed', 'Pending', 'Urgent', 'In Progress']" 
                    :key="status"
                    :class="['filter-pill', 'clickable', { active: activeFilter === status }]"
                    @click="activeFilter = status"
                  >
                    {{ status }}
                  </button>
                </div>
              </div>

              <div class="appointment-list">
                <div 
                  v-for="appt in filteredAppointments" 
                  :key="appt.id" 
                  :class="['appointment-card', { urgent: appt.status === 'Urgent', 'in-progress-card': appt.status === 'In Progress' }]"
                >
                  <div class="time-slot">
                    <span class="time">{{ appt.time }}</span>
                    <span class="duration">{{ appt.duration }}</span>
                  </div>
                  <div class="patient-brief">
                    <p class="p-name"><b>{{ appt.patientName }}</b></p>
                    <p class="p-reason">{{ appt.reason }}</p>
                  </div>
                  <div class="status-box">
                    <span :class="['status-tag', appt.status.toLowerCase().replace(/\s+/g, '-')]">
                      <b>{{ appt.status }}</b>
                    </span>
                  </div>
                  <div class="actions">
                    <button v-if="appt.status === 'Pending'" class="action-btn outline clickable" @click="confirmAppt(appt.id)">Confirm</button>
                    <button v-else class="action-btn primary clickable" @click="startVisit(appt.id)">
                      <b>{{ appt.status === 'In Progress' ? 'Continue Visit' : 'Start Visit' }}</b>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="calendar-wrapper animate-in">
              <div class="calendar-grid">
                <div v-for="day in 30" :key="day" class="calendar-day">
                  <span class="day-num">{{ day }}</span>
                  <div v-if="getApptsForDay(day) > 0" class="event-indicator">
                    {{ getApptsForDay(day) }} Appts
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside class="booking-sidebar">
            <div class="booking-card">
              <h3 class="booking-title">Book Appointment</h3>
              <div class="form-group">
                <label>Patient Name</label>
                <input v-model="form.name" type="text" placeholder="Full Name" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Date</label>
                  <input v-model="form.date" type="date" />
                </div>
                <div class="form-group">
                  <label>Time</label>
                  <input v-model="form.time" type="time" />
                </div>
              </div>
              <div class="form-group">
                <label>Reason for Visit</label>
                <input v-model="form.reason" type="text" placeholder="Reason for checkup" />
              </div>
              <button class="submit-btn clickable" @click="submitBooking">Confirm Booking</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

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
];

const currentView = ref('list');
const activeFilter = ref('All');
const form = ref({ name: '', time: '', date: '', reason: '' });

const appointments = ref([
  { id: 1, date: '2026-04-03', time: '09:00 AM', duration: '30 min', patientName: 'John Doe', reason: 'Routine Checkup - Hypertension', status: 'Confirmed' },
  { id: 2, date: '2026-04-03', time: '10:30 AM', duration: '45 min', patientName: 'Alice Smith', reason: 'Emergency - Severe Abdominal Pain', status: 'Urgent' },
  { id: 3, date: '2026-04-03', time: '01:15 PM', duration: '15 min', patientName: 'Robert Johnson', reason: 'Follow-up: Lab Results', status: 'Pending' },
]);

const filteredAppointments = computed(() => {
  if (activeFilter.value === 'All') return appointments.value;
  return appointments.value.filter(a => a.status === activeFilter.value);
});

const toggleView = () => { currentView.value = currentView.value === 'list' ? 'calendar' : 'list'; };
const getApptsForDay = (dayNum) => {
  const formattedDay = dayNum < 10 ? `0${dayNum}` : dayNum;
  return appointments.value.filter(a => a.date === `2026-04-${formattedDay}`).length;
};
const confirmAppt = (id) => { const appt = appointments.value.find(a => a.id === id); if (appt) appt.status = 'Confirmed'; };
const startVisit = (id) => { const appt = appointments.value.find(a => a.id === id); if (appt) appt.status = 'In Progress'; };
const submitBooking = () => { alert("Booking Confirmed"); };
const handleLogout = () => { if(confirm('Logout?')) navigateTo('/auth/login'); };
</script>

<style scoped>
/* --- CORE LAYOUT --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* --- SIDEBAR --- */
.sidebar { 
  width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; 
  padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 100; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; white-space: nowrap;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-tooltip {
  position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; padding: 6px 12px;
  border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; transition: all 0.2s ease; z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* --- SYNCED LOGOUT BUTTON (FIXED TO LIFT UP) --- */
.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { 
  background: none; border: none; width: 100%; text-align: left; color: #fca5a5; 
  font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  position: relative; border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Match Stats page timing */
}

.logout-btn:hover { 
  background: rgba(252, 165, 165, 0.1); 
  color: #f87171; 
  transform: translateY(-6px) !important; /* Forces Lift instead of Slide */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.is-collapsed .logout-btn { justify-content: center; }
.logout-btn:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* --- APPOINTMENT & BOOKING CARDS (SYNCED LIFT) --- */
.appointment-card {
  background: white; display: grid; grid-template-columns: 120px 1fr 120px 140px; 
  align-items: center; padding: 1.5rem; border-radius: 12px; 
  border: 1px solid #e2e8f0; border-left: 4px solid #2563eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); margin-bottom: 1rem;
}
.appointment-card:hover { 
  transform: translateY(-6px) !important;
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
}

.booking-card { 
  background: white; padding: 2rem; border-radius: 12px; 
  border: 1px solid #e2e8f0; border-top: 4px solid #2563eb; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.booking-card:hover { 
  transform: translateY(-6px) !important;
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
}

/* --- OTHER CONTENT STYLES --- */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.subtitle { color: #64748b; font-size: 0.85rem; margin-top: 4px; }
.appointment-body { padding: 2.5rem 3rem; }
.side-by-side-container { display: grid; grid-template-columns: 1fr 380px; gap: 2.5rem; align-items: start; }
.schedule-header { display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center; }
.date-display { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 0.6rem 1.2rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.current-date { font-weight: 700; color: #1e3a8a; }
.arrow-btn { background: none; border: none; color: #2563eb; }
.filter-pill { padding: 0.5rem 1.2rem; border-radius: 20px; border: none; background: white; color: #64748b; font-weight: 600; font-size: 0.85rem; margin-left: 5px; }
.filter-pill.active { background: #1e3a8a; color: white; }

.time-slot { display: flex; flex-direction: column; gap: 4px; }
.time-slot .time { font-weight: 800; color: #1e293b; font-size: 0.95rem; }
.time-slot .duration { color: #64748b; font-size: 0.75rem; font-weight: 600; }

.urgent { border-left-color: #f43f5e; }
.urgent:hover { background: #fff1f2; }
.in-progress-card { border-left-color: #3b82f6; }
.in-progress-card:hover { background: #eff6ff; }

.calendar-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #e2e8f0; gap: 1px; width: 100%; }
.calendar-day { height: 100px; background: white; padding: 0.8rem; }
.day-num { font-weight: 700; color: #94a3b8; font-size: 0.8rem; }
.event-indicator { background: #dbeafe; color: #1e3a8a; font-size: 0.7rem; font-weight: 700; padding: 4px; border-radius: 6px; margin-top: 4px; text-align: center; }

.booking-title { margin-bottom: 1.5rem; font-size: 1.3rem; color: #1e3a8a; font-weight: 800; }
.form-group { margin-bottom: 1.2rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: #475569; }
input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }
.submit-btn { background: #2563eb; color: white; border: none; padding: 0.9rem; border-radius: 10px; font-weight: 700; width: 100%; margin-top: 1rem; }
.action-btn { padding: 0.6rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; width: 100%; border: none; }
.action-btn.primary { background: #1e293b; color: white; }
.action-btn.outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.calendar-btn { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.status-tag { padding: 0.4rem; border-radius: 6px; font-size: 0.65rem; text-transform: uppercase; }
.confirmed { background: #dcfce7; color: #15803d; }
.pending { background: #fef3c7; color: #b45309; }
.in-progress { background: #3b82f6; color: white; }

/* --- RESPONSIVE --- */
.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 1024px) {
  .side-by-side-container { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex; }
  .mobile-nav-bar { background: #1e3a8a; color: white; padding: 0.8rem 1.5rem; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 999; }
  .mobile-menu-toggle { background: none; border: none; color: white; font-size: 1.5rem; }
  .mobile-logo-text { font-weight: 800; font-size: 1rem; }
  .sidebar { position: fixed; top: 0; left: 0; width: 280px; transform: translateX(-100%); z-index: 2001; }
  .mobile-open .sidebar { transform: translateX(0); }
  .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: none; }
  .mobile-open .sidebar-overlay { display: block; }
  .appointment-body { padding: 1.2rem; }
  .appointment-card { grid-template-columns: 1fr; gap: 8px; padding: 1rem; }
}

.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:hover { opacity: 0.9; }
.clickable:active { transform: scale(0.96); }
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateY(0); } }
</style>