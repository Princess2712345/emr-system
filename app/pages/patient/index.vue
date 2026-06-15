<template>
  <div class="portal-page">
      <header class="top-bar portal-top-bar">
        <div class="header-info">
          <h1>Welcome, {{ patientInfo.name }}</h1>
          <p class="current-date">{{ currentDate }}</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="action-outline clickable" @click="printRecord">
            <Icon name="lucide:printer" /> Download E-Record
          </button>
          <PatientNotificationBell class="desktop-only" />
          <NuxtLink to="/patient/profile" class="profile-chip desktop-only" title="My Profile">
            <div class="avatar-circle" :class="patientInfo.colorClass">
              <img v-if="patientInfo.avatar" :src="patientInfo.avatar" alt="Profile" class="avatar-img" />
              <span v-else>{{ patientInfo.initials }}</span>
            </div>
          </NuxtLink>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <section class="patient-hero">
          <div class="hero-content">
            <div class="avatar-large-container">
            <div class="avatar-large shadow-sm" :class="patientInfo.colorClass">
              <img v-if="patientInfo.avatar" :src="patientInfo.avatar" alt="Profile" class="avatar-img" />
              <span v-else>{{ patientInfo.initials }}</span>
            </div>
            <div class="status-badge-online"></div>
            </div>
            <div class="hero-text">
              <div class="title-row">
                <h2>{{ patientInfo.name }}</h2>
                <span :class="['badge-status', patientInfo.careStatusClass || 'outpatient']">
                  {{ patientInfo.careStatus || 'Outpatient' }}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-item"><strong>ID:</strong> {{ patientInfo.id }}</span>
                <span class="meta-item"><strong>Blood:</strong> {{ patientInfo.bloodType }}</span>
                <span class="meta-item"><strong>Age:</strong> {{ patientInfo.age }}</span>
              </div>
            </div>
          </div>
        </section>

        <div class="bento-grid portal-bento-grid">
          <div class="bento-card highlight-card">
            <label class="label-caps"><Icon name="lucide:clock" /> Incoming Visit</label>
            <div class="appt-details">
              <p class="main-val">{{ nextAppt.date }}</p>
              <p class="sub-val">{{ nextAppt.details }}</p>
            </div>
            <button class="card-btn clickable" @click="addToCalendar">Add to Calendar</button>
          </div>

          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:activity" /> Blood Pressure</label>
            <p class="main-val">{{ vitalsData.bloodPressure }}</p>
            <div class="trend-tag success">Within Normal Range</div>
          </div>

          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:heart" /> Heart Rate</label>
            <p class="main-val">{{ vitalsData.heartRate }}</p>
            <div class="trend-tag info">{{ vitalsData.lastRecorded }}</div>
          </div>

          <div class="bento-card warning-bg">
            <label class="label-caps text-red-700"><Icon name="lucide:shield-alert" /> Critical Allergy</label>
            <p class="main-val text-red-700">{{ vitalsData.criticalAllergy }}</p>
            <p class="small-text text-red-600">Contact staff if updated</p>
          </div>
        </div>

        <div class="bottom-layout portal-bottom-layout">
          <section class="content-card timeline-card">
            <div class="card-header">
              <h3><Icon name="lucide:history" /> Medical Timeline</h3>
              <NuxtLink to="/patient/history" class="view-more clickable">See All History</NuxtLink>
            </div>
            
            <div class="timeline-container">
              <div v-for="(note, index) in displayedTimeline" :key="index" class="timeline-item">
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

          <aside class="widget-stack">
            <div class="emergency-card">
              <div class="card-header-sm">
                <Icon name="lucide:phone-call" />
                <span>Emergency Contact</span>
              </div>
              <div v-if="emergencyContact.name || emergencyContact.phone" class="contact-details">
                <p class="c-name">{{ emergencyContact.name || 'Not set' }}</p>
                <p v-if="emergencyContact.relation" class="c-rel">{{ emergencyContact.relation }}</p>
                <a v-if="emergencyContact.phone" :href="`tel:${emergencyContact.phone}`" class="c-phone">{{ emergencyContact.phone }}</a>
              </div>
              <div v-else class="contact-empty">
                <p>No emergency contact yet.</p>
                <NuxtLink to="/patient/profile" class="contact-add-link">Add one in your profile</NuxtLink>
              </div>
            </div>

            <div class="content-card insurance-card">
              <label class="label-caps">Insurance</label>
              <div class="provider-row">
                <Icon name="lucide:shield-check" class="text-blue-600" />
                <p>{{ insurance.provider ? `${insurance.provider}${insurance.number ? ' • ' + insurance.number : ''}` : 'Not on file' }}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, onMounted, computed } from 'vue'
import { downloadWord, buildInfoTable, buildTable } from '~/utils/exporters'

const isLoading = ref(true)

// Reactive holders initialized with safe placeholder defaults
const patientInfo = ref({
  initials: '...',
  name: 'Loading...',
  id: '#...',
  colorClass: 'purple-theme',
  age: '--',
  bloodType: '--',
  avatar: '',
  careStatus: 'Outpatient',
  careStatusClass: 'outpatient'
})
const vitalsData = ref({ bloodPressure: '--/--', heartRate: '--', criticalAllergy: 'None', lastRecorded: '' })
const nextAppt = ref({ date: 'No upcoming visits', details: '' })
const patientNotes = ref([])
const emergencyContact = ref({ name: '', relation: '', phone: '' })
const insurance = ref({ provider: '', number: '' })

onMounted(async () => {
  try {
    // 1. Grab the user session object saved during login
    const cachedUser = localStorage.getItem('user_data')
    if (!cachedUser) {
      // Direct unauthorized snoopers back to security checkpoint
      return await navigateTo('/auth/login')
    }

    const user = JSON.parse(cachedUser)

    // 2. Query our backend endpoint passing the logged-in ID
    const data = await $fetch(`/api/patient/dashboard?userId=${user.id}`)

    if (data.success) {
      // 3. Hydrate state values dynamically
      patientInfo.value = {
        ...data.patientInfo,
        colorClass: 'purple-theme'
      }
      vitalsData.value = data.vitals
      nextAppt.value = data.nextAppointment
      patientNotes.value = data.timelineNotes
      if (data.emergencyContact) emergencyContact.value = data.emergencyContact
      if (data.insurance) insurance.value = data.insurance
    }
  } catch (error) {
    console.error('Failed to load profile parameters:', error)
  } finally {
    isLoading.value = false
  }
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})

const displayedTimeline = computed(() => patientNotes.value.slice(0, 5))

const printRecord = () => {
  const p = patientInfo.value
  const v = vitalsData.value
  const ec = emergencyContact.value
  const ins = insurance.value

  const timelineHtml = patientNotes.value.length
    ? buildTable(
        ['Date', 'Activity'],
        patientNotes.value.map((n) => [n.date || n.time || '', n.title || n.text || n.action || ''])
      )
    : '<p class="muted">No recent activity recorded.</p>'

  const body =
    `<h1>Electronic Health Record</h1>` +
    `<p class="muted">${p.name} • ${p.id}</p>` +
    `<h2>Patient Information</h2>` +
    buildInfoTable([
      ['Name', p.name],
      ['Record ID', p.id],
      ['Age', p.age],
      ['Blood Type', p.bloodType]
    ]) +
    `<h2>Latest Vitals</h2>` +
    buildInfoTable([
      ['Blood Pressure', v.bloodPressure],
      ['Heart Rate', v.heartRate],
      ['Critical Allergy', v.criticalAllergy],
      ['Last Recorded', v.lastRecorded]
    ]) +
    `<h2>Emergency Contact</h2>` +
    buildInfoTable([
      ['Name', ec.name || 'Not provided'],
      ['Relation', ec.relation || '—'],
      ['Phone', ec.phone || '—']
    ]) +
    `<h2>Insurance</h2>` +
    buildInfoTable([
      ['Provider', ins.provider || 'Not provided'],
      ['Policy Number', ins.number || '—']
    ]) +
    `<h2>Recent Activity</h2>${timelineHtml}` +
    `<p style="margin-top:24pt;" class="muted">Generated on ${new Date().toLocaleString('en-US')}</p>`

  downloadWord(`E-Record_${String(p.name || 'patient').replace(/[^a-z0-9]/gi, '_')}`, 'Electronic Health Record', body)
}

const addToCalendar = () => {
  const title = "Ophthalmology Appointment - MyHealth Portal"
  const details = "Location: Ophthalmology Clinic, Main Wing"
  const start = "20260515T090000"
  const end = "20260515T100000"
  
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`
  window.open(calendarUrl, '_blank')
}
</script>

<style scoped>
.header-info h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }

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
  font-weight: 700; font-size: 0.85rem; overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }

/* --- ENHANCED BODY --- */
/* scrollable-body padding: portal.css */

/* Patient Hero Card */
.patient-hero { 
  background: white; padding: 2rem; border-radius: 20px; border: 1px solid #e2e8f0; 
  margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.hero-content { display: flex; align-items: center; gap: 24px; }
.avatar-large-container { position: relative; }
.avatar-large { width: 85px; height: 85px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; overflow: hidden; }
.status-badge-online { width: 14px; height: 14px; background: #22c55e; border: 3px solid white; border-radius: 50%; position: absolute; bottom: -2px; right: -2px; }
.purple-theme { background: #f3e8ff; color: #7e22ce; }

.title-row { display: flex; align-items: center; gap: 15px; margin-bottom: 8px; }
.title-row h2 { font-size: 1.6rem; color: #1e3a8a; margin: 0; }
.badge-status { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid transparent; }
.badge-status.outpatient { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
.badge-status.admitted { background: #dbeafe; color: #1e40af; border-color: #93c5fd; }
.badge-status.transferred { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.meta-row { display: flex; gap: 20px; font-size: 0.9rem; color: #64748b; }

/* Bento Grid — columns defined in portal.css */
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

.content-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.view-more {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.view-more:hover { background: #eff6ff; color: #1d4ed8; }

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
.contact-empty { font-size: 0.85rem; opacity: 0.92; }
.contact-empty p { margin: 0 0 8px; }
.contact-add-link { color: white; font-weight: 700; text-decoration: underline; }

.provider-row { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #1e293b; margin-top: 10px; }

/* Transitions */
.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Utility */
.clickable { cursor: pointer; }
.clickable:active { transform: scale(0.98); }

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .patient-hero {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .title-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .title-row h2 {
    font-size: 1.25rem;
  }

  .meta-row {
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .header-actions {
    gap: 0.5rem;
  }

  .action-outline {
    padding: 0.5rem 0.85rem;
    font-size: 0.75rem;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .card-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>