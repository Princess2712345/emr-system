<template>
  <div class="portal-page">
      <header class="top-bar portal-top-bar">
        <div class="header-info">
          <h1>My Appointments</h1>
          <p class="current-date">Manage your schedule and visit history</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="bookAppointment">
            <Icon name="lucide:calendar-plus" /> Book New Appointment
          </button>
          <div class="profile-chip">
            <div class="avatar-circle purple-theme" title="View Profile" @click="viewProfile">{{ userInitials }}</div>
          </div>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <div class="bento-grid portal-bento-grid">
          <div class="bento-card highlight-card">
            <label class="label-caps"><Icon name="lucide:calendar-check" /> Next Visit</label>
            <p class="main-val">{{ metrics.nextDate }}</p>
            <p class="sub-val">{{ metrics.daysRemaining }}</p>
          </div>
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:history" /> Past Year</label>
            <p class="main-val">{{ metrics.completedVisits }}</p>
            <p class="sub-val">Visits Completed</p>
          </div>
          <div class="bento-card" @click="openClinicMap" style="cursor:pointer">
            <label class="label-caps"><Icon name="lucide:map-pin" /> Preferred Clinic</label>
            <p class="main-val-sm">{{ metrics.preferredClinic }}</p>
            <p class="sub-val">Main Medical Center</p>
          </div>
          <div class="bento-card">
            <label class="label-caps"><Icon name="lucide:thumbs-up" /> Attendance</label>
            <p class="main-val">100%</p>
            <div class="trend-tag success">Excellent Record</div>
          </div>
        </div>

        <div class="bottom-layout portal-bottom-layout">
          <section class="content-card">
            <div class="card-header">
              <h3><Icon name="lucide:list-todo" /> Scheduled & Past Visits</h3>
              <div class="filter-tabs">
                <button 
                  v-for="tab in ['All', 'Upcoming', 'Completed']" 
                  :key="tab"
                  @click="currentFilter = tab"
                  :class="['tab', { active: currentFilter === tab }]"
                >
                  {{ tab }}
                </button>
              </div>
            </div>
            
            <div class="appointment-stack">
              <div v-if="isLoading" class="empty-state">Loading schedules...</div>
              
              <div v-else v-for="(apt, index) in filteredAppointments" :key="index" :class="['apt-item', apt.status.toLowerCase()]">
                <div class="apt-date-box">
                  <span class="month">{{ apt.date.split(' ')[0] }}</span>
                  <span class="day">{{ apt.date.split(' ')[1]?.replace(',', '') }}</span>
                </div>
                
                <div class="apt-main-info">
                  <div class="apt-header">
                    <span class="dr-name">{{ apt.doctor }}</span>
                    <span :class="['status-pill', apt.status.toLowerCase()]">{{ apt.status }}</span>
                  </div>
                  <div class="apt-meta">
                    <span><Icon name="lucide:clock" /> {{ apt.time }}</span>
                    <span><Icon name="lucide:info" /> {{ apt.reason }}</span>
                  </div>
                </div>

                <div class="apt-actions">
                  <button v-if="apt.status === 'Upcoming'" class="btn-primary-sm" @click="prepareForVisit(apt)">
                    Prepare for Visit
                  </button>
                  <button v-if="apt.status === 'Completed'" class="btn-outline-sm" @click="downloadSummary(apt)">
                    Download Summary
                  </button>
                  <button class="icon-btn-more" @click="toggleAptMenu(apt)">
                    <Icon name="lucide:more-vertical" />
                  </button>
                </div>
              </div>

              <div v-if="!isLoading && filteredAppointments.length === 0" class="empty-state">
                <p>No appointments found for this category.</p>
              </div>
            </div>
          </section>

          <aside class="widget-stack">
            <div class="info-card-blue">
              <h4><Icon name="lucide:lightbulb" /> Pre-visit Checklist</h4>
              <ul class="check-list">
                <li v-for="(item, i) in checklist" :key="i" @click="item.done = !item.done" style="cursor:pointer">
                  <Icon :name="item.done ? 'lucide:check-circle' : 'lucide:circle'" :class="{'text-blue-300': item.done}" />
                  <span :style="item.done ? 'text-decoration: line-through; opacity: 0.7;' : ''">{{ item.label }}</span>
                </li>
              </ul>
              <button class="widget-action" @click="showChecklistHelp">Learn More</button>
            </div>

            <div class="content-card tele-widget">
              <h4>Telemedicine</h4>
              <p>Can't make it to the clinic?</p>
              <button class="btn-text-link" @click="switchToVideoCall">
                Switch to Video Call <Icon name="lucide:arrow-right" />
              </button>
            </div>
          </aside>
        </div>
      </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, computed, onMounted } from 'vue'

const isLoading = ref(true)
const currentFilter = ref('All')
const userInitials = ref('PR')

const metrics = ref({
  nextDate: '--',
  daysRemaining: '--',
  completedVisits: 0,
  preferredClinic: "St. Luke's Hub"
})

const appointments = ref([])

const checklist = ref([
  { label: 'Confirm Insurance', done: false },
  { label: 'Note New Symptoms', done: false },
  { label: 'List Current Meds', done: false },
  { label: 'Valid Photo ID', done: false },
])

const filteredAppointments = computed(() => {
  if (currentFilter.value === 'All') return appointments.value
  return appointments.value.filter(apt => apt.status === currentFilter.value)
})

onMounted(async () => {
  try {
    const cachedUser = localStorage.getItem('user_data')
    if (!cachedUser) return navigateTo('/auth/login')

    const user = JSON.parse(cachedUser)
    
    // Compute display initials dynamically
    if (user.firstName && user.lastName) {
      userInitials.value = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }

    // Hit our database API handler
    const data = await $fetch(`/api/patient/appointments?userId=${user.id}`)
    if (data.success) {
      metrics.value = data.metrics
      appointments.value = data.appointments
    }
  } catch (err) {
    console.error('Failed to resolve dynamic appointments data stream:', err)
  } finally {
    isLoading.value = false
  }
})

const bookAppointment = async () => {
  const cachedUser = localStorage.getItem('user_data')
  if (!cachedUser) return navigateTo('/auth/login')
  const user = JSON.parse(cachedUser)
  const date = prompt('Preferred date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10))
  if (!date) return
  const time = prompt('Preferred time:', '09:00 AM') || '09:00 AM'
  const reason = prompt('Reason for visit:', 'General consultation') || 'General consultation'
  try {
    await $fetch(`/api/patient/appointments?userId=${user.id}`, {
      method: 'POST',
      body: { date, time, reason }
    })
    alert('Appointment request submitted. Staff will confirm shortly.')
    const data = await $fetch(`/api/patient/appointments?userId=${user.id}`)
    if (data.success) {
      metrics.value = data.metrics
      appointments.value = data.appointments
    }
  } catch {
    alert('Could not book appointment. Please try again.')
  }
}
const viewProfile = () => { alert('Opening Profile Settings...') }
const openClinicMap = () => { window.open('https://maps.google.com', '_blank') }
const prepareForVisit = (apt) => { alert(`Preparation guide sent for ${apt.doctor}`) }
const downloadSummary = (apt) => { alert(`Downloading Summary for ${apt.date}`) }
const toggleAptMenu = (apt) => { alert(`Opening contextual menu for ${apt.doctor}`) }
const showChecklistHelp = () => { alert('Checklist options help clear check-in protocols quickly.') }
const switchToVideoCall = () => { alert('Requesting change to virtual format...') }

</script>

<style scoped>
.top-bar h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
.header-actions { display: flex; align-items: center; gap: 1.5rem; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; }
.avatar-circle { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; cursor: pointer; }
.purple-theme { background: #f3e8ff; color: #7e22ce; }

/* --- CONTENT FRAMES --- */
.bento-card { background: white; padding: 1.5rem; border-radius: 18px; border: 1px solid #e2e8f0; }
.highlight-card { background: #1e3a8a; color: white; border: none; }
.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.highlight-card .label-caps { color: #93c5fd; }
.main-val { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0; }
.main-val-sm { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; }
.highlight-card .main-val { color: white; }
.sub-val { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.highlight-card .sub-val { color: #bfdbfe; }
.trend-tag { font-size: 0.7rem; font-weight: 700; margin-top: 8px; display: inline-block; padding: 2px 8px; border-radius: 5px; }
.trend-tag.success { background: #dcfce7; color: #166534; }

.content-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* --- VISITS STACK --- */
.appointment-stack { display: flex; flex-direction: column; gap: 1rem; }
.apt-item { display: flex; align-items: center; padding: 1.2rem; border-radius: 16px; border: 1px solid #f1f5f9; background: #fafafa; gap: 1.5rem; transition: 0.2s; }
.apt-item:hover { border-color: #dbeafe; background: white; transform: scale(1.01); }
.apt-date-box { width: 60px; height: 60px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.apt-date-box .month { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #2563eb; }
.apt-date-box .day { font-size: 1.2rem; font-weight: 800; color: #1e293b; }
.dr-name { font-weight: 700; color: #1e3a8a; font-size: 1rem; }
.status-pill { font-size: 0.65rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; }
.status-pill.upcoming { background: #e0f2fe; color: #0369a1; }
.status-pill.completed { background: #f1f5f9; color: #475569; }
.apt-meta { display: flex; gap: 15px; font-size: 0.85rem; color: #64748b; }
.apt-meta span { display: flex; align-items: center; gap: 5px; }
.btn-primary-sm { background: #2563eb; color: white; border: none; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-outline-sm { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; }

/* --- SIDE WIDGETS --- */
.widget-stack { display: flex; flex-direction: column; gap: 1.5rem; }
.info-card-blue { background: #1e3a8a; color: white; padding: 1.5rem; border-radius: 20px; }
.info-card-blue h4 { margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
.check-list { list-style: none; padding: 0; margin-bottom: 1.5rem; }
.check-list li { font-size: 0.85rem; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.text-blue-300 { color: #93c5fd; }
.widget-action { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.tele-widget h4 { margin: 0 0 8px 0; color: #1e3a8a; }
.tele-widget p { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }
.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 0; }
.empty-state { padding: 2rem; text-align: center; color: #94a3b8; font-style: italic; }

.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.clickable { cursor: pointer; }
.clickable:active { transform: scale(0.98); }
</style>