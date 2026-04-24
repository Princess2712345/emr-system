<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <Icon name="mdi:hospital-building" />
        </div>
        <span class="logo-text">EMR<span>System</span></span>
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
          <Icon name="lucide:credit-card" /> Billing
        </NuxtLink>
        <NuxtLink to="/dashboard/appointments" class="nav-item active">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/dashboard/statistic" class="nav-item">
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
        <div class="header-left">
          <h1>Appointments</h1>
          <p class="subtitle">{{ currentView === 'list' ? 'Daily Schedule' : 'Monthly Overview' }} • April 3, 2026</p>
        </div>
        <div class="header-actions">
          <button class="secondary-btn" @click="toggleView">
            <Icon :name="currentView === 'list' ? 'lucide:calendar' : 'lucide:list-ordered'" />
            {{ currentView === 'list' ? 'Calendar View' : 'List View' }}
          </button>
          <button class="primary-btn" @click="showModal = true">
            <Icon name="lucide:plus" /> Book Appointment
          </button>
        </div>
      </header>

      <section class="content-body">
        <div v-if="currentView === 'list'" class="fade-in">
          <div class="toolbar">
            <div class="date-navigator">
              <button class="icon-btn"><Icon name="lucide:chevron-left" /></button>
              <span class="nav-date">Friday, April 03</span>
              <button class="icon-btn"><Icon name="lucide:chevron-right" /></button>
            </div>
            <div class="filter-tabs">
              <button 
                v-for="status in ['All', 'Confirmed', 'Pending', 'Urgent', 'In Progress']" 
                :key="status"
                :class="['tab-link', { active: activeFilter === status }]"
                @click="activeFilter = status"
              >
                {{ status }}
              </button>
            </div>
          </div>

          <div class="appointment-grid">
            <div 
              v-for="appt in filteredAppointments" 
              :key="appt.id" 
              :class="['appt-card', appt.status.toLowerCase().replace(/\s+/g, '-'), { 'is-urgent': appt.status === 'Urgent' }]"
            >
              <div class="appt-time">
                <span class="main-time">{{ appt.time }}</span>
                <span class="duration-tag">{{ appt.duration }}</span>
              </div>
              
              <div class="appt-info">
                <div class="patient-meta">
                  <h3>{{ appt.patientName }}</h3>
                  <p>{{ appt.reason }}</p>
                </div>
              </div>

              <div class="appt-status">
                <span class="status-pill">
                  <span v-if="appt.status === 'In Progress'" class="live-dot"></span>
                  {{ appt.status }}
                </span>
              </div>

              <div class="appt-actions">
                <button v-if="appt.status === 'Pending'" class="btn-confirm" @click="confirmAppt(appt.id)">Confirm</button>
                <button v-else class="btn-start" @click="startVisit(appt.id)">
                  {{ appt.status === 'In Progress' ? 'Resume' : 'Start Visit' }}
                </button>
              </div>
            </div>
            
            <div v-if="filteredAppointments.length === 0" class="empty-state">
              <Icon name="lucide:calendar-x" class="empty-icon" />
              <p>No appointments found for this filter.</p>
            </div>
          </div>
        </div>

        <div v-else class="calendar-container fade-in">
          <div class="calendar-header">
            <span v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="d">{{ d }}</span>
          </div>
          <div class="calendar-grid">
            <div v-for="day in 30" :key="day" :class="['cal-day', { 'today': day === 3 }]">
              <span class="day-label">{{ day }}</span>
              <div v-if="getApptsForDay(day) > 0" class="appt-indicator">
                {{ getApptsForDay(day) }} Appts
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Transition name="scale">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal-sheet">
          <div class="modal-header">
            <h2>New Appointment</h2>
            <button class="close-x" @click="showModal = false"><Icon name="lucide:x" /></button>
          </div>
          <div class="modal-body">
            <div class="input-field">
              <label>Patient Full Name</label>
              <input v-model="form.name" type="text" placeholder="Johnathan Doe" />
            </div>
            <div class="input-row">
              <div class="input-field">
                <label>Date</label>
                <input v-model="form.date" type="date" />
              </div>
              <div class="input-field">
                <label>Time</label>
                <input v-model="form.time" type="time" />
              </div>
            </div>
            <div class="input-field">
              <label>Reason for Visit</label>
              <textarea v-model="form.reason" rows="3" placeholder="Symptoms or checkup type..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showModal = false">Cancel</button>
            <button class="btn-submit" @click="submitBooking">Complete Booking</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Base Theme & Typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

/* Sidebar Realism */
.sidebar {
  width: 280px;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-right: 1px solid #1e293b;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2.5rem;
  padding: 0.5rem;
}

.logo-icon {
  background: #3b82f6;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logo-text span {
  color: #3b82f6;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: 0.2s;
}

.nav-item:hover {
  background: #1e293b;
  color: #fff;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.logout-btn {
  margin-top: auto;
  background: #1e293b;
  border: none;
  color: #fca5a5;
  padding: 0.75rem;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Header & Actions */
.main-content { flex: 1; min-width: 0; }

.top-bar {
  background: white;
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.top-bar h1 { font-size: 1.75rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 2px; color: #0f172a; }
.subtitle { color: #64748b; font-size: 0.9rem; font-weight: 500; }

.header-actions { display: flex; gap: 0.75rem; }

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
}

.primary-btn { background: #3b82f6; color: white; border: none; }
.primary-btn:hover { background: #2563eb; transform: translateY(-1px); }

.secondary-btn { background: white; border: 1px solid #e2e8f0; color: #475569; }
.secondary-btn:hover { background: #f8fafc; }

/* Dashboard Body */
.content-body { padding: 2rem 2.5rem; }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.date-navigator {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.nav-date { font-weight: 700; font-size: 0.95rem; color: #0f172a; }

.filter-tabs { display: flex; gap: 0.5rem; }

.tab-link {
  background: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.tab-link.active {
  background: white;
  border-color: #e2e8f0;
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Appointment Cards - Realistic Grid */
.appointment-grid { display: flex; flex-direction: column; gap: 1rem; }

.appt-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: 120px 1fr 140px 140px;
  align-items: center;
  border: 1px solid #e2e8f0;
  transition: 0.3s;
}

.appt-card:hover { border-color: #3b82f6; transform: translateX(4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.appt-time { display: flex; flex-direction: column; gap: 4px; }
.main-time { font-weight: 800; font-size: 1.1rem; color: #0f172a; }
.duration-tag { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }

.patient-meta h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.patient-meta p { font-size: 0.9rem; color: #64748b; font-weight: 500; }

.status-pill {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Status Colors */
.confirmed .status-pill { background: #dcfce7; color: #166534; }
.pending .status-pill { background: #fef3c7; color: #92400e; }
.urgent .status-pill { background: #fee2e2; color: #991b1b; }
.in-progress .status-pill { background: #dbeafe; color: #1e40af; }

.live-dot {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.btn-confirm, .btn-start {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-confirm { background: white; border: 1px solid #3b82f6; color: #3b82f6; }
.btn-confirm:hover { background: #3b82f6; color: white; }

.btn-start { background: #0f172a; color: white; border: none; }
.btn-start:hover { background: #334155; }

/* Modal Realism */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-sheet {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { font-size: 1.25rem; font-weight: 800; color: #0f172a; }

.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.input-field label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: 0.2s;
}

input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.modal-footer {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel { background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; }
.btn-submit { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }

/* Animations */
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

/* Calendar Grid */
.calendar-container { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.calendar-header { display: grid; grid-template-columns: repeat(7, 1fr); background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.calendar-header span { padding: 1rem; text-align: center; font-weight: 700; font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.cal-day { height: 120px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 0.75rem; position: relative; }
.cal-day.today { background: #f0f7ff; }
.day-label { font-weight: 700; font-size: 0.9rem; color: #94a3b8; }
.cal-day.today .day-label { color: #3b82f6; }
.appt-indicator { background: #dbeafe; color: #1e40af; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-top: 5px; }
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

  appointments.value.push({
    id: Date.now(),
    date: form.value.date,
    time: displayTime,
    duration: '30 min',
    patientName: form.value.name,
    reason: form.value.reason || 'General Consultation',
    status: 'Pending'
  });
  
  showModal.value = false;
  form.value = { name: '', time: '', date: '', reason: '' };
};
</script>