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
          <button class="add-btn" @click="showModal = true">+ Book Appointment</button>
        </div>
      </header>

      <section class="appointment-body">
        <div v-if="currentView === 'list'" class="fade-in">
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
              :class="['appointment-card', appt.status.toLowerCase().replace(/\s+/g, '-'), { urgent: appt.status === 'Urgent' }]"
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
                  <span v-if="appt.status === 'In Progress'" class="live-dot"></span>
                  <b>{{ appt.status }}</b>
                </span>
              </div>
              <div class="actions">
                <button v-if="appt.status === 'Pending'" class="action-btn outline" @click="confirmAppt(appt.id)">
                  Confirm
                </button>
                <button v-else class="action-btn primary" @click="startVisit(appt.id)">
                  <b>{{ appt.status === 'In Progress' ? 'Continue Visit' : 'Start Visit' }}</b>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="calendar-wrapper fade-in">
          <div class="calendar-grid">
            <div v-for="day in 30" :key="day" :class="['calendar-day', { today: day === 3 }]">
              <span class="day-num">{{ day }}</span>
              <div v-if="getApptsForDay(day) > 0" class="event-indicator">
                {{ getApptsForDay(day) }} Appts
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-card">
          <h3 class="modal-title">New Appointment</h3>
          <div class="form-group">
            <label>Patient Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. John Doe" />
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
            <input v-model="form.reason" type="text" placeholder="e.g. Consultation" />
          </div>
          <div class="modal-btns">
            <button class="cancel-link" @click="showModal = false">Cancel</button>
            <button class="submit-btn" @click="submitBooking">Book Now</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* --- ORIGINAL SIDEBAR COLORS --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }

/* NuxtLink Active Class */
.router-link-active, .nav-item.active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }

/* --- ENHANCED MAIN CONTENT --- */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.8rem; color: #1e3a8a; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-top: 4px; font-weight: 500; }

.calendar-btn, .add-btn { display: flex; align-items: center; gap: 8px; padding: 0.7rem 1.4rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.calendar-btn { background: white; border: 1px solid #e2e8f0; color: #475569; }
.add-btn { background-color: #2563eb; color: white; border: none; }
.add-btn:hover { background-color: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

/* --- REALISTIC APPOINTMENT CARDS --- */
.appointment-body { padding: 2.5rem 3rem; max-width: 1200px; width: 100%; box-sizing: border-box; }
.schedule-header { display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center; }
.date-display { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 0.6rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.current-date { font-weight: 800; color: #1e3a8a; }
.arrow-btn { background: none; border: none; cursor: pointer; color: #2563eb; display: flex; align-items: center; }

.filter-pill { padding: 0.5rem 1.2rem; border-radius: 20px; border: 1px solid #e2e8f0; background: white; cursor: pointer; color: #64748b; font-weight: 600; font-size: 0.85rem; transition: 0.2s; }
.filter-pill.active { background: #1e3a8a; color: white; border-color: #1e3a8a; }

.appointment-card {
  background: white;
  display: grid;
  grid-template-columns: 120px 1fr 150px 160px; 
  align-items: center;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.appointment-card:hover { border-color: #2563eb; transform: translateX(5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.time { font-weight: 800; color: #0f172a; font-size: 1.1rem; }
.duration { font-size: 0.75rem; color: #94a3b8; font-weight: 600; display: block; }

.p-name { color: #0f172a; font-size: 1.05rem; margin: 0; }
.p-reason { color: #64748b; margin: 4px 0 0; font-size: 0.9rem; font-weight: 500; }

.status-tag { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 6px; }
.confirmed { background: #dcfce7; color: #15803d; }
.urgent { background: #fee2e2; color: #b91c1c; border-left: 4px solid #f43f5e; }
.pending { background: #fef3c7; color: #92400e; }
.in-progress { background: #dbeafe; color: #1e40af; }

.live-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse 2s infinite; }

@keyframes pulse { 0% { transform: scale(0.95); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(0.95); opacity: 1; } }

.action-btn { padding: 0.6rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
.action-btn.primary { background: #0f172a; color: white; border: none; }
.action-btn.outline { background: white; border: 1px solid #e2e8f0; color: #1e3a8a; }
.action-btn.primary:hover { background: #334155; }

/* Calendar Realism */
.calendar-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #f8fafc; }
.calendar-day { height: 120px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 1rem; }
.calendar-day.today { background: #eff6ff; }
.day-num { font-weight: 800; color: #94a3b8; font-size: 0.9rem; }
.today .day-num { color: #2563eb; }
.event-indicator { background: #2563eb; color: white; font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; margin-top: 8px; text-align: center; }

/* Fade animation */
.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.modal-card { background: white; padding: 2.5rem; border-radius: 20px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-title { margin: 0 0 1.5rem 0; font-size: 1.5rem; color: #1e3a8a; font-weight: 800; }
.submit-btn { background: #2563eb; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; }
</style>

<script setup>
import { ref, computed } from 'vue';

const currentView = ref('list');
const activeFilter = ref('All');
const showModal = ref(false);
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
  appointments.value.push({ id: Date.now(), date: form.value.date, time: displayTime, duration: '30 min', patientName: form.value.name, reason: form.value.reason || 'General Consultation', status: 'Pending' });
  showModal.value = false;
  form.value = { name: '', time: '', date: '', reason: '' };
};
</script>