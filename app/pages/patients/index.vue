<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR: Solid Professional Style -->
     <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon" />
        <span class="logo-text">MyHealth<span class="text-blue-400">Portal</span></span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/patients" class="nav-item active">
          <Icon name="lucide:layout-dashboard" /> Dashboard
        </NuxtLink>
        <NuxtLink to="/patients/myappointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/patients/lab-results" class="nav-item">
          <Icon name="lucide:file-heart" /> Health Records
        </NuxtLink>
        <NuxtLink to="/patients/billing" class="nav-item">
          <Icon name="lucide:credit-card" /> Billing & Payments
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" /> Logout Account
        </button>
      </div>
    </aside>

    <main class="main-content">
      <!-- TOP BAR: Refined Alignment -->
      <header class="top-bar">
        <div class="header-info">
          <h1>Welcome, {{ patientInfo.name }}</h1>
          <p class="current-date">{{ currentDate }}</p>
        </div>
        
        <div class="header-actions">
          <button class="action-outline clickable" @click="printRecord">
            <Icon name="lucide:printer" /> Download E-Record
          </button>
          <div class="profile-chip">
            <div class="avatar-circle" :class="patientInfo.colorClass">{{ patientInfo.initials }}</div>
          </div>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <!-- HERO SECTION: Realistic Patient Profile -->
        <section class="patient-hero">
          <div class="hero-content">
            <div class="avatar-large-container">
              <div class="avatar-large shadow-sm" :class="patientInfo.colorClass">{{ patientInfo.initials }}</div>
              <div class="status-badge-online"></div>
            </div>
            <div class="hero-text">
              <div class="title-row">
                <h2>{{ patientInfo.name }}</h2>
                <span class="badge-status">Outpatient</span>
              </div>
              <div class="meta-row">
                <span class="meta-item"><strong>ID:</strong> {{ patientInfo.id }}</span>
                <span class="meta-item"><strong>Blood:</strong> O Positive</span>
                <span class="meta-item"><strong>Age:</strong> 24</span>
              </div>
            </div>
          </div>
        </section>

        <!-- DASHBOARD GRID: Realistic Health Monitoring -->
        <div class="bento-grid">
          <!-- Next Appointment (Primary Action) -->
          <div class="bento-card highlight-card">
            <label class="label-caps"><Icon name="lucide:clock" /> Incoming Visit</label>
            <div class="appt-details">
              <p class="main-val">May 15</p>
              <p class="sub-val">Ophthalmology • 09:00 AM</p>
            </div>
            <button class="card-btn clickable" @click="addToCalendar">Add to Calendar</button>
          </div>

          <!-- Vital: BP -->
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:activity" /> Blood Pressure</label>
            <p class="main-val">120<span class="unit">/80</span></p>
            <div class="trend-tag success">Within Normal Range</div>
          </div>

          <!-- Vital: Pulse -->
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:heart" /> Heart Rate</label>
            <p class="main-val">72 <span class="unit">bpm</span></p>
            <div class="trend-tag info">Recorded Oct 24</div>
          </div>

          <!-- Vital: Allergy -->
          <div class="bento-card warning-bg">
            <label class="label-caps text-red-700"><Icon name="lucide:shield-alert" /> Critical Allergy</label>
            <p class="main-val text-red-700">Aspirin</p>
            <p class="small-text text-red-600">Contact staff if updated</p>
          </div>
        </div>

        <div class="bottom-layout">
          <!-- TIMELINE: Clinical History -->
          <section class="content-card timeline-card">
            <div class="card-header">
              <h3><Icon name="lucide:history" /> Medical Timeline</h3>
              <button class="view-more">See All History</button>
            </div>
            
            <div class="timeline-container">
              <div v-for="(note, index) in patientNotes" :key="index" class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="dr-name">{{ note.doctor }}</span>
                    <span class="timeline-date">{{ note.date }}</span>
                  </div>
                  <p class="timeline-text">{{ note.content }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- SIDEBAR WIDGETS -->
          <aside class="widget-stack">
            <!-- Emergency Card -->
            <div class="emergency-card">
              <div class="card-header-sm">
                <Icon name="lucide:phone-call" />
                <span>Emergency Contact</span>
              </div>
              <div class="contact-details">
                <p class="c-name">Maria Peduhan</p>
                <p class="c-rel">Mother</p>
                <a href="tel:+639123456789" class="c-phone">+63 912 345 6789</a>
              </div>
            </div>

            <!-- Insurance Card -->
            <div class="content-card insurance-card">
              <label class="label-caps">Insurance</label>
              <div class="provider-row">
                <Icon name="lucide:shield-check" class="text-blue-600" />
                <p>PhilHealth • Verified</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const patientInfo = ref({ 
  initials: 'PRP', 
  name: 'Penny Rose Peduhan', 
  id: '#EMR-2045', 
  colorClass: 'purple-theme' 
})

const patientNotes = ref([
  { 
    doctor: 'Dr. Aris (Cardiology)', 
    date: 'Oct 24, 2025', 
    content: 'Standard cardiac screening. Rhythm is regular. Patient encouraged to maintain current physical activity levels.' 
  },
  { 
    doctor: 'Dr. Cruz (General Medicine)', 
    date: 'Aug 12, 2025', 
    content: 'Seasonal influenza consultation. Prescription provided for symptoms. Bed rest advised for 3 days.' 
  }
])

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})

const handleLogout = () => {
  if (confirm('Sign out from MyHealth Portal?')) {
    navigateTo('/auth/login')
  }
}

const printRecord = () => { window.print() }

const addToCalendar = () => {
  const title = "Ophthalmology Appointment - MyHealth Portal";
  const details = "Location: Ophthalmology Clinic, Main Wing";
  const start = "20250515T090000";
  const end = "20250515T100000";
  
  // Direct link to Google Calendar Template
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
  window.open(calendarUrl, '_blank');
}
</script>

<style scoped>
/* --- BASE & SIDEBAR --- */
.dashboard-layout { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }

/* SIDEBAR: Universal Style */
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; flex-shrink: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { 
  display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 12px; font-weight: 500; 
  transition: 0.2s ease; 
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

/* --- MAIN CONTENT & TOP BAR --- */
.main-content { flex: 1; display: flex; flex-direction: column; }

.top-bar { 
  background: white; padding: 1.2rem 2.5rem; display: flex; justify-content: space-between; 
  align-items: center; border-bottom: 1px solid #e2e8f0;
}

.header-info h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }

/* ALIGNMENT FIX: header-actions */
.header-actions { 
  display: flex; 
  align-items: center; 
  gap: 1.5rem; 
}

.action-outline { 
  background: white; border: 1.5px solid #e2e8f0; padding: 0.6rem 1rem; 
  border-radius: 10px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 8px; font-size: 0.85rem;
  transition: all 0.2s;
}
.action-outline:hover { background: #f8fafc; border-color: #cbd5e1; }

.avatar-circle { 
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
  font-weight: 700; font-size: 0.85rem;
}

/* --- ENHANCED BODY --- */
.scrollable-body { padding: 2rem 2.5rem; }

/* Patient Hero Card */
.patient-hero { 
  background: white; padding: 2rem; border-radius: 20px; border: 1px solid #e2e8f0; 
  margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.hero-content { display: flex; align-items: center; gap: 24px; }
.avatar-large-container { position: relative; }
.avatar-large { width: 85px; height: 85px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; }
.status-badge-online { width: 14px; height: 14px; background: #22c55e; border: 3px solid white; border-radius: 50%; position: absolute; bottom: -2px; right: -2px; }
.purple-theme { background: #f3e8ff; color: #7e22ce; }

.title-row { display: flex; align-items: center; gap: 15px; margin-bottom: 8px; }
.title-row h2 { font-size: 1.6rem; color: #1e3a8a; margin: 0; }
.badge-status { background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid #dbeafe; }
.meta-row { display: flex; gap: 20px; font-size: 0.9rem; color: #64748b; }

/* Bento Grid */
.bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2rem; }
.bento-card { background: white; padding: 1.5rem; border-radius: 18px; border: 1px solid #e2e8f0; transition: 0.3s; }
.bento-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.03); }

.highlight-card { background: #1e3a8a; color: white; border: none; display: flex; flex-direction: column; }
.highlight-card .label-caps { color: #93c5fd; }
.highlight-card .main-val { color: white; }
.highlight-card .sub-val { font-size: 0.85rem; opacity: 0.9; }

.card-btn { 
  background: #2563eb; color: white; border: none; width: 100%; padding: 10px; border-radius: 8px; 
  margin-top: auto; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: background 0.2s;
}
.card-btn:hover { background: #1d4ed8; }

.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.main-val { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0; }
.unit { font-size: 0.9rem; color: #94a3b8; font-weight: 500; }

.trend-tag { font-size: 0.7rem; font-weight: 700; margin-top: 10px; display: inline-block; padding: 2px 8px; border-radius: 5px; }
.trend-tag.success { background: #dcfce7; color: #166534; }
.trend-tag.info { background: #f1f5f9; color: #475569; }
.warning-bg { background: #fff1f2; border-color: #fecaca; }

/* Content Layout */
.bottom-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.content-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.view-more { background: none; border: none; color: #2563eb; font-weight: 700; font-size: 0.85rem; cursor: pointer; }

.timeline-item { display: flex; gap: 15px; margin-bottom: 1.5rem; position: relative; }
.timeline-marker { width: 3px; background: #e2e8f0; position: relative; margin-top: 10px; }
.timeline-marker::after { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 10px; height: 10px; background: #2563eb; border-radius: 50%; }
.timeline-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.dr-name { font-weight: 700; color: #1e3a8a; }
.timeline-date { font-size: 0.8rem; color: #94a3b8; }
.timeline-text { font-size: 0.9rem; color: #475569; line-height: 1.5; }

/* Widget Styles */
.widget-stack { display: flex; flex-direction: column; gap: 1.5rem; }
.emergency-card { background: #be123c; color: white; padding: 1.5rem; border-radius: 20px; }
.card-header-sm { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 0.85rem; margin-bottom: 1rem; }
.c-name { font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; }
.c-rel { font-size: 0.85rem; opacity: 0.8; margin-bottom: 12px; }
.c-phone { display: block; background: rgba(255,255,255,0.2); padding: 8px; border-radius: 8px; text-align: center; color: white; text-decoration: none; font-weight: 700; }

.provider-row { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #1e293b; margin-top: 10px; }

/* Transitions */
.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Utility */
.clickable { cursor: pointer; }
.clickable:active { transform: scale(0.98); }
</style>