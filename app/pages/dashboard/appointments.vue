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
        <NuxtLink to="/dashboard/appointments" class="nav-item active">
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
          <h1>Schedule & Appointments</h1>
          <p class="subtitle">{{ currentView === 'list' ? 'Daily Timeline' : 'Monthly View' }} — 2026</p>
        </div>
        <div class="header-actions">
          <button class="calendar-btn" @click="toggleView">
            <Icon :name="currentView === 'list' ? 'lucide:calendar' : 'lucide:list'" />
            {{ currentView === 'list' ? 'Calendar View' : 'List View' }}
          </button>
        </div>
      </header>

      <section class="appointment-body">
        <div class="side-by-side-container">
          
          <div class="view-content">
            <div v-if="currentView === 'list'">
              <div class="schedule-header">
                <div class="date-display">
                  <button class="arrow-btn"><Icon name="lucide:chevron-left" /></button>
                  <span class="current-date">Today, April 3</span>
                  <button class="arrow-btn"><Icon name="lucide:chevron-right" /></button>
                </div>
                <div class="view-filters">
                  <button 
                    v-for="status in ['All', 'Confirmed', 'Pending', 'Urgent', 'In Progress']" 
                    :key="status"
                    :class="['filter-pill', { active: activeFilter === status }]"
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
                    <button v-if="appt.status === 'Pending'" class="action-btn outline" @click="confirmAppt(appt.id)">Confirm</button>
                    <button v-else class="action-btn primary" @click="startVisit(appt.id)">
                      <b>{{ appt.status === 'In Progress' ? 'Continue Visit' : 'Start Visit' }}</b>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="calendar-wrapper">
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
              <button class="submit-btn" @click="submitBooking">Confirm Booking</button>
            </div>
          </aside>

        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const getApptsForDay = (dayNum) => {
  const formattedDay = dayNum < 10 ? `0${dayNum}` : dayNum;
  const targetDate = `2026-04-${formattedDay}`;
  return appointments.value.filter(a => a.date === targetDate).length;
};

const toggleView = () => {
  currentView.value = currentView.value === 'list' ? 'calendar' : 'list';
};

const confirmAppt = (id) => {
  const appt = appointments.value.find(a => a.id === id);
  if (appt) appt.status = 'Confirmed';
};

const startVisit = (id) => {
  const appt = appointments.value.find(a => a.id === id);
  if (appt) appt.status = 'In Progress';
};

const submitBooking = () => {
  if (!form.value.name || !form.value.time || !form.value.date) {
    alert("Please fill in the patient name, date, and time.");
    return;
  }
  const [hours, minutes] = form.value.time.split(':');
  const h = parseInt(hours);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = ((h + 11) % 12 + 1);
  const displayTime = `${displayHours}:${minutes} ${period}`;
  
  appointments.value.push({ 
    id: Date.now(), 
    date: form.value.date, 
    time: displayTime, 
    duration: '30 min', 
    patientName: form.value.name, 
    reason: form.value.reason || 'General Consultation', 
    status: 'Pending' 
  });
  
  form.value = { name: '', time: '', date: '', reason: '' };
};
</script>

<style scoped>
/* --- BASE SIDEBAR & LAYOUT --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }

.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; padding: 0.8rem 1rem; border-radius: 8px; transition: all 0.2s ease;}
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px);}

.main-content { flex: 1; display: flex; flex-direction: column; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.8rem; color: #1e3a8a; margin: 0; font-weight: 800; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; }

/* --- SIDE-BY-SIDE GRID --- */
.appointment-body { padding: 2.5rem 3rem; }
.side-by-side-container {
  display: grid;
  grid-template-columns: 1fr 380px; 
  gap: 2.5rem;
  align-items: start;
}

/* LEFT SIDE: LIST/CALENDAR VIEW */
.schedule-header { display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center; }
.date-display { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 0.6rem 1.2rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.current-date { font-weight: 700; color: #1e3a8a; }
.arrow-btn { background: none; border: none; cursor: pointer; color: #2563eb; transition: transform 0.2s; }
.arrow-btn:hover { transform: scale(1.2); }

.filter-pill { padding: 0.5rem 1.2rem; border-radius: 20px; border: 1px solid #e2e8f0; background: white; cursor: pointer; color: #64748b; font-weight: 600; font-size: 0.85rem; margin-left: 5px; transition: all 0.2s; }
.filter-pill:hover { border-color: #cbd5e1; background: #f8fafc; }
.filter-pill.active { background: #1e3a8a; color: white; border-color: #1e3a8a; }

.appointment-card {
  background: white;
  display: grid;
  grid-template-columns: 100px 1fr 120px 140px; 
  align-items: center;
  padding: 1.5rem;
  border-radius: 16px;
  border-left: 5px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}
.appointment-card:hover { transform: translateX(5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.urgent { border-left-color: #f43f5e; background: #fff1f2; }
.in-progress-card { border-left-color: #3b82f6; background: #eff6ff; }

/* CALENDAR GRID */
.calendar-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #e2e8f0; gap: 1px; }
.calendar-day { height: 110px; background: white; padding: 0.8rem; transition: background 0.2s; }
.calendar-day:hover { background: #f8fafc; }
.day-num { font-weight: 700; color: #94a3b8; font-size: 0.9rem; }
.event-indicator { background: #dbeafe; color: #1e3a8a; font-size: 0.75rem; font-weight: 700; padding: 4px; border-radius: 6px; margin-top: 4px; text-align: center; }

/* RIGHT SIDE: BOOKING PANEL */
.booking-sidebar { position: sticky; top: 2rem; }
.booking-card {
  background: white;
  padding: 2.2rem;
  border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}
.booking-title { margin: 0 0 1.5rem 0; font-size: 1.4rem; color: #1e3a8a; font-weight: 800; }
.form-group { margin-bottom: 1.3rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: #475569; }
input { width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; font-size: 0.95rem; transition: border-color 0.2s; }
input:focus { border-color: #2563eb; }

.submit-btn { background: #2563eb; color: white; border: none; padding: 0.9rem; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 1rem; transition: all 0.2s; }
.submit-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

/* SHARED ITEM STYLES */
.time { font-weight: 800; color: #1e293b; font-size: 1rem; }
.duration { font-size: 0.75rem; color: #94a3b8; font-weight: 700; display: block; }
.p-name { color: #1e3a8a; font-size: 1rem; margin: 0; }
.p-reason { color: #64748b; margin: 2px 0 0; font-size: 0.85rem; }
.status-tag { padding: 0.4rem 0.6rem; border-radius: 8px; font-size: 0.7rem; text-transform: uppercase; }
.confirmed { background: #dcfce7; color: #15803d; }
.pending { background: #fef3c7; color: #b45309; }
.in-progress { background: #3b82f6; color: white; }

.action-btn { padding: 0.6rem 0.8rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.8rem; width: 100%; transition: all 0.2s; }
.action-btn.primary { background: #1e293b; color: white; border: none; }
.action-btn.primary:hover { background: #0f172a; }
.action-btn.outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.action-btn.outline:hover { background: #f1f5f9; }

.calendar-btn { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 0.7rem 1.4rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
.calendar-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
</style>