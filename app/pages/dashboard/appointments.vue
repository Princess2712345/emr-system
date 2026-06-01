<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar desktop-only portal-top-bar">
        <div class="welcome-msg">
          <h1>Schedule & Appointments</h1>
          <p class="subtitle">{{ currentView === 'list' ? 'Daily Timeline' : 'Monthly View' }} — 2026</p>
        </div>
        <div class="header-actions portal-header-actions">
          <button class="calendar-btn clickable" @click="toggleView">
            <Icon :name="currentView === 'list' ? 'lucide:calendar' : 'lucide:list'" />
            {{ currentView === 'list' ? 'Calendar View' : 'List View' }}
          </button>
        </div>
      </header>

      <header class="appointments-mobile-header mobile-only portal-top-bar">
        <div class="welcome-msg">
          <h1>Schedule</h1>
          <p class="subtitle">{{ currentView === 'list' ? 'Daily Timeline' : 'Monthly View' }} — 2026</p>
        </div>
        <button type="button" class="calendar-btn clickable" @click="toggleView">
          <Icon :name="currentView === 'list' ? 'lucide:calendar' : 'lucide:list'" />
          {{ currentView === 'list' ? 'Calendar' : 'List' }}
        </button>
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
                  <div class="card-right">
                    <span :class="['status-tag', appt.status.toLowerCase().replace(/\s+/g, '-')]">
                      <b>{{ appt.status }}</b>
                    </span>
                    <div class="actions">
                      <button class="action-btn ghost clickable" @click="openDetails(appt)">
                        <Icon name="lucide:eye" /> View
                      </button>
                      <button v-if="appt.status === 'Pending'" class="action-btn outline clickable" @click="confirmAppt(appt.id)"><Icon name="lucide:check" /> Confirm</button>
                      <button v-else-if="appt.status === 'Confirmed'" class="action-btn primary clickable" @click="startVisit(appt.id)"><Icon name="lucide:play" /> Start</button>
                      <button v-else-if="appt.status === 'In Progress'" class="action-btn success-btn clickable" @click="completeVisit(appt.id)"><Icon name="lucide:check-check" /> Complete</button>
                      <span v-else class="checked-out-chip"><Icon name="lucide:check-check" /> Checked out</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="calendar-wrapper animate-in">
              <div class="cal-toolbar">
                <button class="arrow-btn clickable" @click="shiftMonth(-1)"><Icon name="lucide:chevron-left" /></button>
                <span class="cal-month-label">{{ monthLabel }}</span>
                <button class="arrow-btn clickable" @click="shiftMonth(1)"><Icon name="lucide:chevron-right" /></button>
              </div>
              <div class="cal-legend">
                <span class="legend-item"><i class="dot confirmed"></i> Confirmed</span>
                <span class="legend-item"><i class="dot pending"></i> Pending</span>
                <span class="legend-item"><i class="dot in-progress"></i> In progress</span>
                <span class="legend-item"><i class="dot completed"></i> Completed</span>
              </div>
              <div class="cal-weekdays">
                <span v-for="d in weekdays" :key="d">{{ d }}</span>
              </div>
              <div class="calendar-grid">
                <div
                  v-for="(cell, i) in calendarCells"
                  :key="i"
                  class="calendar-day"
                  :class="{ empty: !cell, today: cell && cell.isToday }"
                >
                  <template v-if="cell">
                    <span class="day-num">{{ cell.day }}</span>
                    <div class="day-events">
                      <div
                        v-for="ap in cell.appts"
                        :key="ap.id"
                        :class="['cal-event', ap.status.toLowerCase().replace(/\s+/g, '-')]"
                        :title="`${ap.time} • ${ap.patientName} • ${ap.status}`"
                        @click="openDetails(ap)"
                      >
                        <span class="cal-event-time">{{ ap.time }}</span>
                        <span class="cal-event-name">{{ ap.patientName }}</span>
                      </div>
                    </div>
                  </template>
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
                  <option v-for="pat in patientOptions" :key="pat.id" :value="pat.id">
                    {{ pat.label }}
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

    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="detailOpen" class="appt-modal-overlay" @click.self="detailOpen = false">
          <div class="appt-modal">
            <header class="appt-modal-head">
              <div class="appt-modal-title">
                <div class="appt-modal-icon"><Icon name="lucide:calendar-check" /></div>
                <div>
                  <h3>Appointment details</h3>
                  <p>Reference #{{ selectedAppt?.id }}</p>
                </div>
              </div>
              <button class="appt-modal-close clickable" @click="detailOpen = false"><Icon name="lucide:x" /></button>
            </header>

            <div v-if="selectedAppt" class="appt-modal-body">
              <div class="appt-status-row">
                <span :class="['status-tag', selectedAppt.status.toLowerCase().replace(/\s+/g, '-')]">
                  <b>{{ selectedAppt.status }}</b>
                </span>
              </div>

              <div class="appt-detail-grid">
                <div class="appt-detail">
                  <span class="d-label">Patient</span>
                  <span class="d-value">{{ selectedAppt.patientName }}</span>
                </div>
                <div class="appt-detail">
                  <span class="d-label">Date</span>
                  <span class="d-value">{{ formatFullDate(selectedAppt.date) }}</span>
                </div>
                <div class="appt-detail">
                  <span class="d-label">Time</span>
                  <span class="d-value">{{ selectedAppt.time }}</span>
                </div>
                <div class="appt-detail">
                  <span class="d-label">Duration</span>
                  <span class="d-value">{{ selectedAppt.duration }}</span>
                </div>
                <div class="appt-detail">
                  <span class="d-label">Assigned staff</span>
                  <span class="d-value">
                    {{ selectedAppt.staff ? `${selectedAppt.staff.firstName} ${selectedAppt.staff.lastName}` : 'Unassigned' }}
                  </span>
                </div>
                <div class="appt-detail" v-if="selectedAppt.patient?.email">
                  <span class="d-label">Email</span>
                  <span class="d-value">{{ selectedAppt.patient.email }}</span>
                </div>
                <div class="appt-detail" v-if="selectedAppt.patient?.phone && selectedAppt.patient.phone !== 'N/A'">
                  <span class="d-label">Phone</span>
                  <span class="d-value">{{ selectedAppt.patient.phone }}</span>
                </div>
                <div class="appt-detail appt-detail-wide">
                  <span class="d-label">Reason for visit</span>
                  <span class="d-value">{{ selectedAppt.reason }}</span>
                </div>
              </div>

              <div class="appt-modal-actions">
                <button v-if="selectedAppt.status === 'Pending'" class="action-btn outline clickable" @click="confirmAppt(selectedAppt.id); detailOpen = false">
                  <Icon name="lucide:check" /> Confirm appointment
                </button>
                <button v-else-if="selectedAppt.status === 'Confirmed'" class="action-btn primary clickable" @click="startVisit(selectedAppt.id); detailOpen = false">
                  <Icon name="lucide:play" /> Start visit
                </button>
                <button v-else-if="selectedAppt.status === 'In Progress'" class="action-btn success-btn clickable" @click="completeVisit(selectedAppt.id); detailOpen = false">
                  <Icon name="lucide:check-check" /> Complete visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, computed } from 'vue';

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
const { patientOptions } = usePatientRegistry();

// Dynamic data filtering options based on state selections
const filteredAppointments = computed(() => {
  if (!appointments.value) return [];
  if (activeFilter.value === 'All') return appointments.value;
  return appointments.value.filter(a => a.status === activeFilter.value);
});

const toggleView = () => { 
  currentView.value = currentView.value === 'list' ? 'calendar' : 'list'; 
};

// --- Appointment details modal ---
const detailOpen = ref(false);
const selectedAppt = ref(null);

const openDetails = (appt) => {
  selectedAppt.value = appt;
  detailOpen.value = true;
};

const formatFullDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

// --- Monthly calendar ---
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const calMonth = ref(new Date());

const monthLabel = computed(() =>
  calMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
);

const shiftMonth = (delta) => {
  const d = new Date(calMonth.value);
  d.setMonth(d.getMonth() + delta);
  calMonth.value = d;
};

const calendarCells = computed(() => {
  const year = calMonth.value.getFullYear();
  const month = calMonth.value.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const appts = (appointments.value || []).filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
    cells.push({
      day,
      appts,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
    });
  }
  return cells;
});

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
    
    alert("Appointment linked to patient — it will appear on their portal account.");
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

.appointments-mobile-header {
  flex-wrap: wrap;
  gap: 0.75rem;
}
.appointments-mobile-header h1 { font-size: 1.25rem; color: #1e3a8a; font-weight: 700; margin: 0; }
.appointments-mobile-header .calendar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.appointment-body { padding: 2rem 3rem; min-width: 0; width: 100%; box-sizing: border-box; }
.side-by-side-container { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; min-width: 0; width: 100%; }
.view-content { min-width: 0; width: 100%; }
.booking-sidebar { min-width: 0; width: 100%; }

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
  background: white; display: grid; grid-template-columns: 96px 1fr auto;
  align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0;
  border-left: 4px solid #2563eb; transition: all 0.3s ease;
}
.time-slot { border-right: 1px solid #f1f5f9; padding-right: 1rem; }
.patient-brief { min-width: 0; }
.p-name { margin: 0 0 2px; font-size: 0.95rem; color: #1e293b; }
.p-reason { margin: 0; font-size: 0.82rem; color: #64748b; }
.card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.card-right .status-tag { width: auto; }
.actions { display: flex; flex-direction: row; gap: 8px; }
.actions .action-btn { width: auto; min-width: 84px; }
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

.action-btn { height: 38px; padding: 0 1rem; border-radius: 8px; font-weight: 700; font-size: 0.78rem; border: 1px solid transparent; transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; line-height: 1; white-space: nowrap; }
.action-btn :deep(svg) { font-size: 0.95rem; }
.action-btn:hover { transform: translateY(-1px); }
.action-btn:active { transform: translateY(0); }

/* View — blue */
.action-btn.ghost { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.action-btn.ghost:hover { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 4px 10px -2px rgba(37, 99, 235, 0.45); }

/* Confirm — emerald */
.action-btn.outline { background: #10b981; color: white; box-shadow: 0 2px 6px -1px rgba(16, 185, 129, 0.4); }
.action-btn.outline:hover { background: #059669; box-shadow: 0 6px 14px -2px rgba(16, 185, 129, 0.5); }

/* Start — amber */
.action-btn.primary { background: #f59e0b; color: white; box-shadow: 0 2px 6px -1px rgba(245, 158, 11, 0.4); }
.action-btn.primary:hover { background: #d97706; box-shadow: 0 6px 14px -2px rgba(245, 158, 11, 0.5); }

/* Complete — green */
.action-btn.success-btn { background: #16a34a; color: white; box-shadow: 0 2px 6px -1px rgba(22, 163, 74, 0.4); }
.action-btn.success-btn:hover { background: #15803d; box-shadow: 0 6px 14px -2px rgba(22, 163, 74, 0.5); }

.checked-out-chip { height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.76rem; color: #15803d; font-weight: 700; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0 0.9rem; }
.checked-out-chip :deep(svg) { color: #16a34a; font-size: 0.95rem; }

/* Calendar/List toggle button */
.calendar-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; border-radius: 10px; border: none; background: #2563eb; color: white; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 6px -1px rgba(37, 99, 235, 0.4); transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
.calendar-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 14px -2px rgba(37, 99, 235, 0.5); }
.appointments-mobile-header .calendar-btn { background: #2563eb; color: white; border: none; box-shadow: 0 2px 6px -1px rgba(37, 99, 235, 0.4); }

/* --- DETAILS MODAL --- */
.appt-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 5000; padding: 1rem; }
.appt-modal { background: white; width: 100%; max-width: 520px; border-radius: 18px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); overflow: hidden; }
.appt-modal-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.1rem 1.25rem; background: #eff6ff; border-bottom: 1px solid #dbeafe; }
.appt-modal-title { display: flex; gap: 0.75rem; align-items: center; }
.appt-modal-icon { width: 2.5rem; height: 2.5rem; border-radius: 12px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.appt-modal-title h3 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #1e3a8a; }
.appt-modal-title p { margin: 0.1rem 0 0; font-size: 0.78rem; color: #3b82f6; font-family: ui-monospace, monospace; }
.appt-modal-close { border: none; background: transparent; color: #64748b; cursor: pointer; display: flex; padding: 4px; border-radius: 6px; }
.appt-modal-close:hover { background: #dbeafe; }
.appt-modal-body { padding: 1.25rem; }
.appt-status-row { margin-bottom: 1rem; }
.appt-status-row .status-tag { width: auto; display: inline-block; padding: 0.4rem 0.9rem; }
.appt-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1.25rem; }
.appt-detail { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.appt-detail-wide { grid-column: 1 / -1; }
.d-label { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; color: #94a3b8; }
.d-value { font-size: 0.9rem; font-weight: 600; color: #1e293b; word-break: break-word; }
.appt-modal-actions { margin-top: 1.5rem; }
.appt-modal-actions .action-btn { width: 100%; height: 46px; font-size: 0.85rem; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* --- SELECT / IMPORTS --- */
.form-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; background: white; font-family: inherit; }

/* --- CALENDAR --- */
.calendar-wrapper { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.cal-toolbar { display: flex; align-items: center; justify-content: center; gap: 1.5rem; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
.cal-month-label { font-weight: 800; color: #1e3a8a; font-size: 1.05rem; min-width: 11rem; text-align: center; }
.arrow-btn { background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #475569; cursor: pointer; }
.arrow-btn:hover { background: #e2e8f0; color: #1e3a8a; }
.cal-legend { display: flex; flex-wrap: wrap; gap: 1rem; padding: 0.6rem 1rem; border-bottom: 1px solid #f1f5f9; }
.legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #64748b; font-weight: 600; }
.dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.dot.confirmed { background: #0ea5e9; }
.dot.pending { background: #f59e0b; }
.dot.in-progress { background: #eab308; }
.dot.completed { background: #22c55e; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.cal-weekdays span { padding: 0.6rem; text-align: center; font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); background-color: #e2e8f0; gap: 1px; }
.calendar-day { min-height: 110px; background: white; padding: 0.5rem; display: flex; flex-direction: column; gap: 4px; }
.calendar-day.empty { background: #f8fafc; }
.calendar-day.today { background: #eff6ff; }
.calendar-day.today .day-num { background: #2563eb; color: white; }
.day-num { font-weight: 700; color: #64748b; font-size: 0.78rem; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.day-events { display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
.cal-event { display: flex; flex-direction: column; padding: 3px 6px; border-radius: 6px; font-size: 0.66rem; cursor: pointer; border-left: 3px solid #94a3b8; background: #f1f5f9; line-height: 1.2; transition: filter 0.15s; }
.cal-event:hover { filter: brightness(0.96); }
.cal-event-time { font-weight: 700; color: #475569; }
.cal-event-name { color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cal-event.confirmed { background: #e0f2fe; border-left-color: #0ea5e9; }
.cal-event.confirmed .cal-event-time { color: #0369a1; }
.cal-event.pending { background: #fef3c7; border-left-color: #f59e0b; }
.cal-event.pending .cal-event-time { color: #b45309; }
.cal-event.in-progress { background: #fef9c3; border-left-color: #eab308; }
.cal-event.completed { background: #dcfce7; border-left-color: #22c55e; }
.cal-event.completed .cal-event-time { color: #166534; }
.cal-event.cancelled { background: #fee2e2; border-left-color: #ef4444; text-decoration: line-through; }

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

  .appointment-body {
    padding: 1rem;
    min-width: 0;
    width: 100%;
    overflow-x: visible;
    overflow-y: auto;
  }

  .side-by-side-container {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    width: 100%;
  }

  .schedule-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    width: 100%;
    min-width: 0;
  }

  .date-display {
    width: 100%;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .current-date {
    font-size: 0.9rem;
    text-align: center;
    flex: 1;
    min-width: 0;
  }

  .view-filters {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    padding-left: 0;
    padding-right: 0;
    -webkit-overflow-scrolling: touch;
  }

  .filter-pill {
    flex-shrink: 0;
  }

  .appointment-card {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 1.25rem;
    position: relative;
    border-left-width: 6px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .appointment-card:hover {
    transform: none;
  }

  .time-slot {
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;
    flex-direction: row;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .time-slot {
    border-right: none;
    padding-right: 0;
  }

  .card-right {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .status-tag {
    width: auto;
    min-width: 6rem;
  }

  .actions {
    flex: 1;
    justify-content: flex-end;
  }

  .actions .action-btn {
    flex: 1;
    min-width: 0;
  }

  .booking-card {
    padding: 1.25rem;
  }

  .calendar-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }

  .calendar-grid {
    min-width: 560px;
  }

  .calendar-day {
    height: 72px;
    min-width: 0;
  }
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