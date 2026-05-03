<template>
  <div class="dashboard-layout">
    <!-- Updated Sidebar: Simplified for Patients -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue-light" />
        <span class="logo-text">My Health Portal</span>
      </div>
      
      <nav class="sidebar-nav">
        <!-- Navigation limited to patient-relevant views -->
        <NuxtLink to="/patients/index" class="nav-item active">
          <Icon name="lucide:user-circle" /> My Profile
        </NuxtLink>
        <NuxtLink to="/patients/myappointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> My Appointments
        </NuxtLink>
        <NuxtLink to="/patients/lab-results" class="nav-item">
          <Icon name="lucide:microscope" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/patients/billing" class="nav-item">
          <Icon name="lucide:receipt" /> My Bills
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="header-info">
          <h1>My Appointments</h1>
          <p>Manage your upcoming and past visits</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable">
            <Icon name="lucide:calendar-plus" /> Book New Appointment
          </button>
        </div>
      </header>

      <div class="patient-body animate-in">
        <!-- Stats Grid (Aligned with Profile Style) -->
        <div class="info-grid">
          <div class="info-item highlight-blue">
            <label><Icon name="lucide:clock" /> UPCOMING</label>
            <p>1 Scheduled</p>
            <span class="sub-text">Next: May 15, 2026</span>
          </div>
          <div class="info-item">
            <label><Icon name="lucide:check-circle" /> COMPLETED</label>
            <p>12 Total</p>
            <span class="sub-text">Past 12 months</span>
          </div>
          <div class="info-item">
            <label><Icon name="lucide:x-circle" /> CANCELLED</label>
            <p>0</p>
            <span class="sub-text">Reliability: 100%</span>
          </div>
          <div class="info-item">
            <label><Icon name="lucide:stretcher" /> CLINIC</label>
            <p>St. Luke's</p>
            <span class="sub-text">Primary Care Hub</span>
          </div>
        </div>

        <div class="records-layout">
          <!-- Appointments List -->
          <section class="notes-container">
            <div class="notes-header">
              <h3><Icon name="lucide:list-ordered" /> Appointment Schedule</h3>
            </div>
            
            <div v-for="(apt, index) in appointments" :key="index" class="note-box">
               <div class="note-head">
                 <span class="dr">{{ apt.doctor }}</span>
                 <span :class="['badge', apt.status.toLowerCase()]">{{ apt.status }}</span>
               </div>
               <div class="apt-details">
                 <div class="apt-info-row">
                    <Icon name="lucide:calendar" /> <span>{{ apt.date }}</span>
                    <Icon name="lucide:clock-3" /> <span>{{ apt.time }}</span>
                 </div>
                 <p class="apt-reason"><strong>Reason:</strong> {{ apt.reason }}</p>
               </div>
               <div class="apt-actions">
                 <button v-if="apt.status === 'Upcoming'" class="btn-outline">Reschedule</button>
                 <button v-if="apt.status === 'Completed'" class="btn-text">View Summary</button>
               </div>
            </div>
          </section>

          <!-- Sidebar Widget: Appointment Guide -->
          <aside class="emergency-widget info-widget">
            <h3><Icon name="lucide:info" /> Appointment Tips</h3>
            <div class="contact-card">
              <p class="contact-name">Be Prepared</p>
              <ul class="tips-list">
                <li>Arrive 15 mins early</li>
                <li>Bring ID & Insurance</li>
                <li>List current symptoms</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const appointments = ref([
  { 
    doctor: 'Dr. Santos (Opthalmology)', 
    date: 'May 15, 2026', 
    time: '09:00 AM',
    reason: 'Annual Eye Exam & Grade Check',
    status: 'Upcoming'
  },
  { 
    doctor: 'Dr. Aris (Cardiology)', 
    date: 'Oct 24, 2025', 
    time: '02:30 PM',
    reason: 'Routine Heart Monitoring',
    status: 'Completed'
  },
  { 
    doctor: 'Dr. Cruz (General Medicine)', 
    date: 'Aug 12, 2025', 
    time: '10:00 AM',
    reason: 'Fever and Seasonal Flu consultation',
    status: 'Completed'
  }
])

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    await navigateTo('/auth')
  }
}
</script>

<style scoped>
/* Inheriting your base styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Existing Layout Styles */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: 0.2s; }
.nav-item.active { background: #2563eb; color: white; }

.main-content { flex: 1; display: flex; flex-direction: column; }
.top-bar { background: white; padding: 1.5rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }

.patient-body { padding: 2rem 2.5rem; }

/* Appointments Specific Styling */
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2rem; }
.info-item { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.info-item label { font-size: 10px; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.info-item p { font-size: 1.25rem; font-weight: 800; margin: 0; color: #1e3a8a; }
.sub-text { font-size: 11px; color: #94a3b8; display: block; margin-top: 4px; }

.records-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.notes-container { background: white; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; }
.note-box { background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #f1f5f9; }

.note-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.dr { font-weight: 700; color: #1e3a8a; }

/* Appointment details row */
.apt-info-row { display: flex; gap: 15px; align-items: center; color: #64748b; font-size: 0.9rem; margin-bottom: 10px; }
.apt-info-row span { font-weight: 600; color: #334155; }
.apt-reason { font-size: 0.95rem; color: #475569; }

/* Status Badges */
.badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.upcoming { background: #dbeafe; color: #1e40af; }
.completed { background: #dcfce7; color: #15803d; }

/* Buttons */
.add-btn { background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.btn-outline { border: 1px solid #e2e8f0; background: white; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-text { background: none; border: none; color: #2563eb; font-weight: 600; font-size: 0.85rem; cursor: pointer; }

/* Sidebar Widget Variation */
.info-widget { background: #eff6ff; border-color: #bfdbfe; }
.info-widget h3 { color: #1e40af; }
.tips-list { padding-left: 1.2rem; margin-top: 10px; font-size: 0.9rem; color: #1e3a8a; }
.tips-list li { margin-bottom: 8px; }

.animate-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>