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
        <NuxtLink to="/dashboard/patients" class="nav-item active">
          <Icon name="lucide:user-circle" /> My Profile
        </NuxtLink>
        <NuxtLink to="/dashboard/appointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> My Appointments
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:microscope" /> Lab Results
        </NuxtLink>
        <NuxtLink to="/dashboard/billing" class="nav-item">
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
      <!-- Top Bar: Focus on Personalized Welcome -->
      <header class="top-bar">
        <div class="header-info">
          <h1>Welcome, {{ patientInfo.name }}</h1>
          <p>Your centralized health overview</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable" @click="printRecord">
            <Icon name="lucide:printer" /> Print Health Record
          </button>
        </div>
      </header>

      <div class="patient-body animate-in">
        <!-- Profile Header Section -->
        <section class="profile-header-card">
           <div class="patient-avatar large" :class="patientInfo.colorClass">{{ patientInfo.initials }}</div>
           <div class="detail-title-area">
             <h2>{{ patientInfo.name }}</h2>
             <div class="detail-sub">
               <span class="badge active"><span class="dot"></span> {{ patientInfo.status }} Patient</span>
               <span class="id-badge">ID: {{ patientInfo.id }}</span>
               <span class="loc"><Icon name="lucide:heart-pulse" /> Blood Type: O+</span>
             </div>
           </div>
        </section>

        <!-- Health Stats Grid -->
        <div class="info-grid">
          <div class="info-item highlight-blue">
            <label><Icon name="lucide:calendar-check" /> NEXT APPOINTMENT</label>
            <p>May 15, 2026</p>
            <span class="sub-text">Dr. Santos (Opthalmology)</span>
          </div>
          <div class="info-item">
            <label><Icon name="lucide:activity" /> RECENT BP</label>
            <p>120/80 mmHg</p>
            <span class="sub-text">Recorded: Oct 24, 2025</span>
          </div>
          <div class="info-item">
            <label><Icon name="lucide:pill" /> MEDICATIONS</label>
            <p>2 Active</p>
            <span class="sub-text">View Prescriptions</span>
          </div>
          <div class="info-item">
            <label><Icon name="lucide:alert-circle" /> ALLERGIES</label>
            <p class="text-danger">Aspirin</p>
          </div>
        </div>

        <!-- Records & Notes Section -->
        <div class="records-layout">
          <section class="notes-container">
            <div class="notes-header">
              <h3><Icon name="lucide:history" /> My Clinical Timeline</h3>
            </div>
            
            <div v-for="(note, index) in patientNotes" :key="index" class="note-box">
               <div class="note-head">
                 <span class="dr">{{ note.doctor }}</span>
                 <span class="date">{{ note.date }}</span>
               </div>
               <p>{{ note.content }}</p>
            </div>
          </section>

          <!-- Sidebar Widget: Emergency Contact -->
          <aside class="emergency-widget">
            <h3><Icon name="lucide:phone-call" /> Emergency Contact</h3>
            <div class="contact-card">
              <p class="contact-name">Maria Peduhan</p>
              <p class="contact-relation">Mother</p>
              <p class="contact-phone">+63 912 345 6789</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Since this is the Patient's view, we load ONLY their data
const patientInfo = ref({ 
  initials: 'PRP', 
  name: 'Penny Rose Peduhan', 
  id: '#EMR-2045', 
  status: 'Active', 
  colorClass: 'purple' 
})

const patientNotes = ref([
  { 
    doctor: 'Dr. Aris (Cardiology)', 
    date: 'Oct 24, 2025', 
    content: 'Routine check-up complete. Heart rate is normal. Continue current lifestyle and balanced diet. No medication changes required.' 
  },
  { 
    doctor: 'Dr. Cruz (General Medicine)', 
    date: 'Aug 12, 2025', 
    content: 'Patient treated for mild seasonal flu. Prescribed Vitamin C and bed rest.' 
  }
])

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    await navigateTo('/auth')
  }
}

const printRecord = () => {
  window.print()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Inherit your existing layout styles from previous version */
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

.profile-header-card { display: flex; gap: 24px; align-items: center; background: white; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
.patient-avatar.large { width: 80px; height: 80px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
.purple { background: #f3e8ff; color: #7e22ce; }

.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2rem; }
.info-item { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.info-item label { font-size: 10px; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.info-item p { font-size: 1.25rem; font-weight: 800; margin: 0; color: #1e3a8a; }
.sub-text { font-size: 11px; color: #94a3b8; display: block; margin-top: 4px; }
.text-danger { color: #dc2626 !important; }

.records-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.notes-container { background: white; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0; }
.note-box { background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #f1f5f9; }

.emergency-widget { background: #fff1f2; padding: 1.5rem; border-radius: 16px; border: 1px solid #fecaca; height: fit-content; }
.emergency-widget h3 { font-size: 1rem; color: #9f1239; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
.contact-card p { margin: 4px 0; font-weight: 600; }
.contact-name { font-size: 1.1rem; color: #1e293b; }

.badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; }
.id-badge { background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #1e3a8a; }

.animate-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>