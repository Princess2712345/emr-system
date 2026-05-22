<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed, 'mobile-open': isMobileOpen }">
    
    <div class="sidebar-overlay" @click="isMobileOpen = false"></div>

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
        <NuxtLink 
          v-for="link in navLinks" 
          :key="link.to" 
          :to="link.to" 
          class="nav-item"
          @click="isMobileOpen = false"
        >
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

    <main class="main-content">
      <header class="mobile-nav-bar mobile-only">
        <button class="mobile-menu-toggle" @click="isMobileOpen = true">
          <Icon name="lucide:menu" />
        </button>
        <div class="mobile-logo-text">EMR System</div>
        <div class="mobile-avatar clickable">JS</div>
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
                  <span class="current-date">Today, Scheduled Track</span>
                  <button class="arrow-btn clickable"><Icon name="lucide:chevron-right" /></button>
                </div>
                <div class="view-filters">
                  <button 
                    v-for="status in ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']" 
                    :key="status"
                    :class="['filter-pill', 'clickable', { active: activeFilter === status }]"
                    @click="activeFilter = status"
                  >
                    {{ status }}
                  </button>
                </div>
              </div>

              <div class="appointment-list">
                <div v-if="filteredAppointments.length === 0" class="empty-state-card">
                  No appointments registered under "{{ activeFilter }}" status filter.
                </div>
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
                    <p class="p-doctor-tag" v-if="appt.staff">
                      <Icon name="lucide:stethoscope" class="mini-icon" /> 
                      Assigned: {{ appt.staff.firstName }} {{ appt.staff.lastName }}
                    </p>
                  </div>
                  <div class="status-box">
                    <span :class="['status-tag', appt.status.toLowerCase().replace(/\s+/g, '-')]">
                      <b>{{ appt.status }}</b>
                    </span>
                  </div>
                  <div class="actions">
                    <button v-if="appt.status === 'Pending'" class="action-btn outline clickable" @click="confirmAppt(appt.id)">Confirm</button>
                    <button v-else-if="appt.status === 'Confirmed'" class="action-btn primary clickable" @click="startVisit(appt.id)">Start</button>
                    <button v-else-if="appt.status === 'In Progress'" class="action-btn success-btn clickable" @click="completeVisit(appt.id)">Complete</button>
                    <span v-else class="completed-placeholder-text">Checked Out</span>
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
                <label>Registered Patient File</label>
                <select v-model="form.patientId" class="form-select">
                  <option value="">Select Target Profile</option>
                  <option v-for="pat in patients" :key="pat.id" :value="pat.id">
                    {{ pat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Assign Clinical Staff / Attendant</label>
                <select v-model="form.staffId" class="form-select">
                  <option value="">Select System Practitioner</option>
                  <option v-for="member in staffMembers" :key="member.id" :value="member.id">
                    {{ member.name || member.username }}
                  </option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Date</label>
                  <input v-model="form.date" type="date" />
                </div>
                <div class="form-group">
                  <label>Time</label>
                  <input v-model="form.time" type="text" placeholder="e.g., 09:00 AM" />
                </div>
              </div>

              <div class="form-group">
                <label>Estimated Duration</label>
                <select v-model="form.duration" class="form-select">
                  <option value="30 min">30 min</option>
                  <option value="45 min">45 min</option>
                  <option value="1 hr">1 hr</option>
                  <option value="2 hr">2 hr</option>
                </select>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const handleResize = () => {
  if (process.client && window.innerWidth > 768) {
    isMobileOpen.value = false;
  }
};

onMounted(() => {
  if (process.client) {
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize);
  }
});

const navLinks = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
  { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
  { to: '/dashboard/registration', icon: 'mdi:account-plus', label: 'Registration' },
  { to: '/dashboard/disposition', icon: 'lucide:file-output', label: 'Disposition' },
  { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
  { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
  { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
  { to: '/dashboard/history', icon: 'lucide:history', label: 'History' },
];

const currentView = ref('list');
const activeFilter = ref('All');
const form = ref({ patientId: '', staffId: '', time: '', date: '', reason: '', duration: '30 min' });

// Fetch real-time appointments data from backend structure
const { data: appointments, refresh } = await useFetch('/api/appointments', {
  default: () => []
});

// Pull master staff registry safely from backend
const { data: staffMembers } = await useFetch('/api/admins', {
  default: () => []
});

// Fetch master patients file registry 
const { data: patients } = await useFetch('/api/patients', {
  default: () => []
});

// Dynamic data filtering options based on state selections
const filteredAppointments = computed(() => {
  if (!appointments.value) return [];
  if (activeFilter.value === 'All') return appointments.value;
  return appointments.value.filter(a => a.status === activeFilter.value);
});

const toggleView = () => { 
  currentView.value = currentView.value === 'list' ? 'calendar' : 'list'; 
};

const getApptsForDay = (dayNum) => {
  if (!appointments.value) return 0;
  return appointments.value.filter(a => {
    const d = new Date(a.date);
    return d.getDate() === dayNum;
  }).length;
};

// Form submit booking function to save records straight to database table structures
const submitBooking = async () => {
  if (!form.value.patientId || !form.value.date || !form.value.time) {
    alert("Please complete required scheduling parameters.");
    return;
  }

  try {
    await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        patientId: form.value.patientId,
        staffId: form.value.staffId || null,
        date: form.value.date,
        time: form.value.time,
        reason: form.value.reason,
        duration: form.value.duration
      }
    });
    
    alert("Booking Confirmed and saved to system database!");
    form.value = { patientId: '', staffId: '', time: '', date: '', reason: '', duration: '30 min' }; 
    refresh(); 
  } catch (err) {
    alert(err.data?.statusMessage || "Booking operation failed. Ensure identity options match registry profiles.");
  }
};

const confirmAppt = async (id) => { 
  try {
    await $fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: { status: 'Confirmed' }
    });
    refresh();
  } catch (err) {
    alert("Failed to update appointment status registry.");
  }
};

const startVisit = async (id) => { 
  try {
    await $fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: { status: 'In Progress' }
    });
    refresh();
  } catch (err) {
    alert("Failed to track room visit processing state.");
  }
};

const completeVisit = async (id) => { 
  try {
    await $fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: { status: 'Completed' }
    });
    refresh();
  } catch (err) {
    alert("Failed to complete treatment cycle tracking.");
  }
};

const handleLogout = () => { 
  if (confirm('Logout?')) navigateTo('/auth/login'); 
};
</script>

<style scoped>
/* --- CORE LAYOUT --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* --- SIDEBAR --- */
.sidebar { 
  width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; 
  padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 1001; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
}
.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.menu-toggle { background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; display: flex; cursor: pointer; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { 
  position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.router-link-active { background: #2563eb !important; color: white !important; }

.sidebar-tooltip {
  position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; padding: 6px 12px;
  border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; transition: all 0.2s ease;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { 
  background: none; border: none; width: 100%; text-align: left; color: #fca5a5; 
  font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  border-radius: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateY(-3px); }

/* --- MAIN CONTENT --- */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.subtitle { color: #64748b; font-size: 0.85rem; margin-top: 4px; }

.appointment-body { padding: 2rem 3rem; }
.side-by-side-container { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; }

.schedule-header { display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center; }
.date-display { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 0.6rem 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.current-date { font-weight: 700; color: #1e3a8a; }

/* --- VIEW FILTERS --- */
.view-filters { 
  display: flex; 
  gap: 8px; 
  overflow-x: auto; 
  white-space: nowrap; 
  padding-bottom: 8px; 
  scrollbar-width: none; 
}
.view-filters::-webkit-scrollbar { display: none; }
.filter-pill { padding: 0.5rem 1.2rem; border-radius: 20px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; font-size: 0.85rem; }
.filter-pill.active { background: #1e3a8a; color: white; border-color: #1e3a8a; }

/* --- APPOINTMENT CARDS --- */
.appointment-list { display: flex; flex-direction: column; gap: 1rem; }
.empty-state-card { background: white; text-align: center; padding: 3rem; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; font-weight: 500; }
.appointment-card {
  background: white; display: grid; grid-template-columns: 120px 1fr 120px 140px; 
  align-items: center; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; 
  border-left: 4px solid #2563eb; transition: all 0.3s ease;
}
.appointment-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.in-progress-card { border-left-color: #eab308 !important; background: #fefcf2; }

.p-doctor-tag { font-size: 0.8rem; color: #2563eb; font-weight: 600; display: flex; align-items: center; gap: 5px; margin-top: 4px; }
.mini-icon { font-size: 0.9rem; }

.booking-card { 
  background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; 
  border-top: 4px solid #2563eb; transition: all 0.3s ease;
}
.booking-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

.time-slot .time { font-weight: 800; color: #1e293b; font-size: 0.95rem; display: block; }
.time-slot .duration { color: #64748b; font-size: 0.75rem; font-weight: 600; }

.status-tag { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.65rem; text-transform: uppercase; text-align: center; display: inline-block; width: 100%; }
.confirmed { background: #e0f2fe; color: #0369a1; }
.pending { background: #fef3c7; color: #b45309; }
.in-progress { background: #fef9c3; color: #a16207; }
.completed { background: #dcfce7; color: #166534; }
.cancelled { background: #fee2e2; color: #991b1b; }

.action-btn { padding: 0.6rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; width: 100%; border: none; transition: 0.2s; cursor: pointer; }
.action-btn.primary { background: #1e293b; color: white; }
.action-btn.outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.action-btn.success-btn { background: #166534; color: white; }
.completed-placeholder-text { font-size: 0.8rem; color: #94a3b8; font-weight: 600; text-align: center; display: block; }

/* --- SELECT / IMPORTS --- */
.form-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; background: white; font-family: inherit; }

/* --- CALENDAR --- */
.calendar-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #e2e8f0; gap: 1px; }
.calendar-day { height: 100px; background: white; padding: 0.8rem; }
.day-num { font-weight: 700; color: #94a3b8; font-size: 0.8rem; }
.event-indicator { background: #eff6ff; color: #2563eb; font-size: 0.7rem; padding: 4px; border-radius: 4px; margin-top: 8px; font-weight: 700; }

/* --- RESPONSIVE UPDATES --- */
.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 1200px) {
  .side-by-side-container { grid-template-columns: 1fr; }
  .booking-sidebar { order: 2; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex; }

  .mobile-nav-bar { 
    background: #1e3a8a; color: white; padding: 0.8rem 1.5rem; justify-content: space-between; 
    align-items: center; position: sticky; top: 0; z-index: 1000;
  }
  .mobile-avatar { width: 32px; height: 32px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; }

  .sidebar { position: fixed; top: 0; left: 0; width: 280px; transform: translateX(-100%); z-index: 2001; }
  .mobile-open .sidebar { transform: translateX(0); }
  .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: none; backdrop-filter: blur(2px); }
  .mobile-open .sidebar-overlay { display: block; }

  .appointment-body { padding: 1rem; overflow-x: hidden; }
  .schedule-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .date-display { width: 100%; justify-content: space-between; }

  .view-filters { 
    width: calc(100% + 2rem); 
    margin-left: -1rem; 
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .appointment-card { 
    grid-template-columns: 1fr; gap: 12px; padding: 1.25rem; position: relative; 
    border-left-width: 6px; width: 100%;
  }
  .time-slot { border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; flex-direction: row; display: flex; gap: 10px; align-items: center; }
  .status-box { position: absolute; top: 1.25rem; right: 1.25rem; width: auto; }
}

/* --- UTILS --- */
.clickable:active { transform: scale(0.95); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: #475569; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.submit-btn { background: #2563eb; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; width: 100%; margin-top: 1rem; cursor: pointer; }
.animate-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>