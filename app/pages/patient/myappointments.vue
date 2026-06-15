<template>
  <div class="portal-page">
      <header class="top-bar portal-top-bar">
        <div class="header-info">
          <h1>My Appointments</h1>
          <p class="current-date">{{ displayName }} • MRN {{ registryId }}</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="bookAppointment">
            <Icon name="lucide:calendar-plus" /> Book New Appointment
          </button>
          <PatientNotificationBell class="desktop-only" />
          <NuxtLink to="/patient/profile" class="profile-chip desktop-only" title="My Profile">
            <div class="avatar-circle purple-theme">{{ initials }}</div>
          </NuxtLink>
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
              <div class="card-header-left">
                <h3><Icon name="lucide:list-todo" /> Scheduled & Past Visits</h3>
                <NuxtLink to="/patient/history" class="view-more-link">See all history</NuxtLink>
              </div>
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
              
              <div v-else v-for="apt in filteredAppointments" :key="apt.id" :class="['apt-item', aptStatusClass(apt.status)]">
                <div class="apt-date-box">
                  <span class="month">{{ apt.date.split(' ')[0] }}</span>
                  <span class="day">{{ apt.date.split(' ')[1]?.replace(',', '') }}</span>
                </div>
                
                <div class="apt-main-info">
                  <div class="apt-header">
                    <span class="dr-name">{{ apt.doctor }}</span>
                  </div>
                  <div class="apt-meta">
                    <span><Icon name="lucide:clock" /> {{ apt.time }}</span>
                    <span><Icon name="lucide:info" /> {{ apt.reason }}</span>
                  </div>
                </div>

                <div class="apt-actions">
                  <span :class="['status-pill', 'status-pill-action', aptStatusClass(apt.status)]">{{ apt.status }}</span>
                  <button class="btn-view-sm" @click="openAppt(apt)">
                    <Icon name="lucide:eye" /> View
                  </button>
                  <button v-if="isUpcoming(apt.status)" class="btn-primary-sm" @click="prepareForVisit(apt)">
                    Prepare for Visit
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

    <Transition name="fade">
      <div v-if="isBookModalOpen" class="modal-overlay" @click.self="closeBookModal">
        <div class="book-modal">
          <div class="book-modal-header">
            <div>
              <h3><Icon name="lucide:calendar-plus" /> Book new appointment</h3>
              <p class="modal-sub">Submit a request — our team will confirm date and provider.</p>
            </div>
            <button type="button" class="modal-close clickable" @click="closeBookModal">
              <Icon name="lucide:x" />
            </button>
          </div>

          <form class="book-form" @submit.prevent="submitBooking">
            <div class="form-section">
              <h4>Visit details</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Visit type</label>
                  <select v-model="bookForm.visitType" required>
                    <option value="General consultation">General consultation</option>
                    <option value="Follow-up visit">Follow-up visit</option>
                    <option value="Lab / diagnostics">Lab / diagnostics</option>
                    <option value="Specialist referral">Specialist referral</option>
                    <option value="Telemedicine">Telemedicine</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Preferred clinic</label>
                  <select v-model="bookForm.clinic" required>
                    <option value="Main Clinic — EMR Hub">Main Clinic — EMR Hub</option>
                    <option value="Outpatient Wing A">Outpatient Wing A</option>
                    <option value="Telehealth (video)">Telehealth (video)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Schedule</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Preferred date</label>
                  <input v-model="bookForm.date" type="date" :min="minDate" required />
                </div>
                <div class="form-group">
                  <label>Preferred time</label>
                  <select v-model="bookForm.time" required>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Estimated duration</label>
                  <select v-model="bookForm.duration">
                    <option value="30 min">30 minutes</option>
                    <option value="45 min">45 minutes</option>
                    <option value="1 hr">1 hour</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Preferred doctor (optional)</label>
                  <select v-model="bookForm.staffId">
                    <option value="">Any available physician</option>
                    <option v-for="s in staffList" :key="s.id" :value="s.id">
                      {{ s.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Clinical information</h4>
              <div class="form-group full">
                <label>Reason for visit</label>
                <input v-model="bookForm.reason" type="text" placeholder="e.g. Annual check-up, medication review" required />
              </div>
              <div class="form-group full">
                <label>Current symptoms (optional)</label>
                <textarea v-model="bookForm.symptoms" rows="3" placeholder="Describe symptoms, duration, and severity" />
              </div>
            </div>

            <div class="form-section">
              <h4>Contact</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Contact phone</label>
                  <input v-model="bookForm.phone" type="tel" placeholder="+63 9XX XXX XXXX" />
                </div>
                <div class="form-group">
                  <label>Best way to reach you</label>
                  <select v-model="bookForm.contactMethod">
                    <option value="Phone call">Phone call</option>
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>
              <label class="checkbox-row">
                <input v-model="bookForm.agreed" type="checkbox" required />
                <span>I understand this is a request pending staff confirmation, not a guaranteed booking.</span>
              </label>
            </div>

            <div class="summary-box">
              <h4>Request summary</h4>
              <ul>
                <li><strong>Type:</strong> {{ bookForm.visitType }}</li>
                <li><strong>When:</strong> {{ bookForm.date || '—' }} at {{ bookForm.time }}</li>
                <li><strong>Where:</strong> {{ bookForm.clinic }}</li>
                <li><strong>Duration:</strong> {{ bookForm.duration }}</li>
              </ul>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel clickable" @click="closeBookModal">Cancel</button>
              <button type="submit" class="btn-submit clickable" :disabled="isSubmitting">
                <Icon v-if="isSubmitting" name="lucide:loader-2" class="spin" />
                {{ isSubmitting ? 'Submitting…' : 'Submit request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="viewAppt" class="modal-overlay" @click.self="viewAppt = null">
        <div class="view-modal">
          <div class="view-modal-head">
            <div class="view-modal-title">
              <div class="view-modal-icon"><Icon name="lucide:calendar-check" /></div>
              <div>
                <h3>Appointment details</h3>
                <p>Reference #{{ viewAppt.id }}</p>
              </div>
            </div>
            <button type="button" class="modal-close clickable" @click="viewAppt = null">
              <Icon name="lucide:x" />
            </button>
          </div>

          <div class="view-modal-body">
            <div class="view-status-row">
              <span :class="['status-pill', aptStatusClass(viewAppt.status)]">{{ viewAppt.status }}</span>
            </div>

            <div class="view-grid">
              <div class="view-field">
                <span class="vf-label">Provider</span>
                <span class="vf-value">{{ viewAppt.doctor }}</span>
              </div>
              <div class="view-field">
                <span class="vf-label">Date</span>
                <span class="vf-value">{{ viewAppt.date }}</span>
              </div>
              <div class="view-field">
                <span class="vf-label">Time</span>
                <span class="vf-value">{{ viewAppt.time }}</span>
              </div>
              <div class="view-field" v-if="viewAppt.duration">
                <span class="vf-label">Duration</span>
                <span class="vf-value">{{ viewAppt.duration }}</span>
              </div>
              <div class="view-field view-field-wide">
                <span class="vf-label">Reason for visit</span>
                <span class="vf-value">{{ viewAppt.reason || '—' }}</span>
              </div>
            </div>

            <div class="view-modal-actions">
              <button v-if="isUpcoming(viewAppt.status)" class="btn-primary-sm" @click="prepareForVisit(viewAppt)">
                <Icon name="lucide:clipboard-check" /> Prepare for Visit
              </button>
              <button v-if="viewAppt.status === 'Completed'" class="btn-outline-sm" @click="downloadSummary(viewAppt)">
                <Icon name="lucide:download" /> Download Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, computed, onMounted } from 'vue'
import { downloadWord, buildInfoTable } from '~/utils/exporters'

const isLoading = ref(true)
const currentFilter = ref('All')
const { initials, displayName, registryId, requirePatientSession } = usePatientHeader()
const userId = ref('')
const isBookModalOpen = ref(false)
const isSubmitting = ref(false)
const staffList = ref([])
const viewAppt = ref(null)

const minDate = new Date().toISOString().slice(0, 10)

const defaultBookForm = () => ({
  visitType: 'General consultation',
  clinic: 'Main Clinic — EMR Hub',
  date: '',
  time: '09:00 AM',
  duration: '30 min',
  staffId: '',
  reason: '',
  symptoms: '',
  phone: '',
  contactMethod: 'Phone call',
  agreed: false
})

const bookForm = ref(defaultBookForm())

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

const isUpcoming = (status) => ['Pending', 'Confirmed', 'In Progress', 'Upcoming'].includes(status)

const aptStatusClass = (status) => {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-')
  if (isUpcoming(status)) return 'upcoming'
  if (status === 'Completed') return 'completed'
  if (status === 'Cancelled') return 'cancelled'
  return s
}

const filteredAppointments = computed(() => {
  if (currentFilter.value === 'All') return appointments.value
  if (currentFilter.value === 'Upcoming') {
    return appointments.value.filter((apt) => isUpcoming(apt.status))
  }
  if (currentFilter.value === 'Completed') {
    return appointments.value.filter((apt) => apt.status === 'Completed')
  }
  return appointments.value
})

onMounted(async () => {
  try {
    const user = requirePatientSession()
    if (!user) return
    userId.value = user.id

    const [data, staff] = await Promise.all([
      $fetch(`/api/patient/appointments?userId=${user.id}`),
      $fetch('/api/admins').catch(() => [])
    ])

    if (Array.isArray(staff)) {
      staffList.value = staff.map((s) => ({
        id: s.id,
        label: s.name || s.username || `${s.firstName || ''} ${s.lastName || ''}`.trim()
      }))
    }
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

const bookAppointment = () => {
  bookForm.value = {
    ...defaultBookForm(),
    date: minDate
  }
  isBookModalOpen.value = true
}

const closeBookModal = () => {
  isBookModalOpen.value = false
  isSubmitting.value = false
}

const reloadAppointments = async () => {
  if (!userId.value) return
  const data = await $fetch(`/api/patient/appointments?userId=${userId.value}`)
  if (data.success) {
    metrics.value = data.metrics
    appointments.value = data.appointments
  }
}

const submitBooking = async () => {
  if (!userId.value || !bookForm.value.agreed) return

  isSubmitting.value = true
  try {
    const res = await $fetch(`/api/patient/appointments?userId=${userId.value}`, {
      method: 'POST',
      body: {
        date: bookForm.value.date,
        time: bookForm.value.time,
        duration: bookForm.value.duration,
        visitType: bookForm.value.visitType,
        clinic: bookForm.value.clinic,
        reason: bookForm.value.reason,
        symptoms: bookForm.value.symptoms,
        staffId: bookForm.value.staffId || null,
        phone: bookForm.value.phone,
        contactMethod: bookForm.value.contactMethod
      }
    })
    alert(res.message || 'Appointment request submitted. Staff will confirm shortly.')
    closeBookModal()
    await reloadAppointments()
  } catch (err) {
    const msg = err?.data?.statusMessage || 'Could not book appointment. Please try again.'
    alert(msg)
  } finally {
    isSubmitting.value = false
  }
}
const openClinicMap = () => { window.open('https://maps.google.com', '_blank') }
const prepareForVisit = (apt) => { alert(`Preparation guide sent for ${apt.doctor}`) }
const downloadSummary = (apt) => {
  const body =
    `<h1>Appointment Summary</h1>` +
    `<p class="muted">Reference #${apt.id}</p>` +
    buildInfoTable([
      ['Provider', apt.doctor],
      ['Date', apt.date],
      ['Time', apt.time],
      ['Status', apt.status],
      ['Reason for visit', apt.reason]
    ]) +
    `<p style="margin-top:24pt;" class="muted">Generated on ${new Date().toLocaleString('en-US')}</p>`

  downloadWord(`Appointment_Summary_${String(apt.date).replace(/[^a-z0-9]/gi, '_')}`, 'Appointment Summary', body)
}
const openAppt = (apt) => { viewAppt.value = apt }
const showChecklistHelp = () => { alert('Checklist options help clear check-in protocols quickly.') }
const isTelemedicineVisit = (apt) => {
  const text = `${apt.reason || ''} ${apt.doctor || ''}`.toLowerCase()
  return text.includes('telemedicine') || text.includes('telehealth') || text.includes('video')
}

const switchToVideoCall = () => {
  const teleAppt = appointments.value.find(
    (apt) => isUpcoming(apt.status) && isTelemedicineVisit(apt)
  )

  if (teleAppt) {
    const room = `emr-visit-${String(teleAppt.id).replace(/[^a-zA-Z0-9-]/g, '')}`
    window.open(`https://meet.jit.si/${room}#userInfo.displayName="${encodeURIComponent(displayName.value || 'Patient')}"`, '_blank', 'noopener,noreferrer')
    return
  }

  bookForm.value = {
    ...defaultBookForm(),
    visitType: 'Telemedicine',
    clinic: 'Telehealth (video)',
    date: minDate,
    reason: 'Telemedicine video consultation'
  }
  isBookModalOpen.value = true
}

</script>

<style scoped>
.top-bar h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
.header-actions { display: flex; align-items: center; gap: 1.5rem; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; }
.avatar-circle { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; cursor: pointer; }
.purple-theme { background: #f3e8ff; color: #7e22ce; }

/* --- CONTENT FRAMES --- */
.bento-card {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.bento-card:hover {
  border-color: #2563eb;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.card-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.view-more-link {
  color: #2563eb;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
}
.view-more-link:hover { text-decoration: underline; }
.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* --- VISITS STACK --- */
.appointment-stack { display: flex; flex-direction: column; gap: 1.15rem; }
.apt-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 1.5rem;
  row-gap: 0.75rem;
  padding: 1.35rem 1.5rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background: #fafafa;
  transition: 0.2s;
}
.apt-item:hover { border-color: #dbeafe; background: white; transform: scale(1.01); }
.apt-date-box { width: 64px; height: 64px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.apt-date-box .month { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #2563eb; }
.apt-date-box .day { font-size: 1.2rem; font-weight: 800; color: #1e293b; }
.apt-main-info { min-width: 0; padding-right: 0.25rem; }
.apt-header { margin-bottom: 6px; }
.dr-name { font-weight: 700; color: #1e3a8a; font-size: 1rem; margin: 0; display: block; }
.status-pill { font-size: 0.65rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; }
.status-pill-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 8px;
  text-align: center;
  box-sizing: border-box;
}
.status-pill.upcoming,
.status-pill.pending,
.status-pill.confirmed,
.status-pill.in-progress { background: #e0f2fe; color: #0369a1; }
.status-pill.completed { background: #f1f5f9; color: #475569; }
.status-pill.cancelled { background: #fee2e2; color: #991b1b; }
.apt-meta { display: flex; flex-wrap: wrap; gap: 12px 18px; font-size: 0.85rem; color: #64748b; }
.apt-meta span { display: flex; align-items: center; gap: 5px; }
.apt-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  padding-left: 1.25rem;
  margin-left: 0.25rem;
  border-left: 1px solid #e2e8f0;
  min-width: 130px;
}
.apt-actions .status-pill-action,
.apt-actions .btn-view-sm,
.apt-actions .btn-primary-sm {
  width: 100%;
  min-height: 36px;
  justify-content: center;
  box-sizing: border-box;
}
.apt-actions .btn-view-sm,
.apt-actions .btn-primary-sm { display: inline-flex; align-items: center; }
.btn-primary-sm { background: #2563eb; color: white; border: none; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary-sm:hover { background: #1d4ed8; }
.btn-outline-sm { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.btn-outline-sm:hover { border-color: #2563eb; color: #2563eb; }
.btn-view-sm { background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: 0.15s; }
.btn-view-sm:hover { background: #2563eb; color: white; border-color: #2563eb; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; }

/* View details modal */
.view-modal { background: white; border-radius: 20px; width: min(520px, 100%); box-shadow: 0 25px 50px rgba(0,0,0,0.18); overflow: hidden; }
.view-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.25rem; background: #eff6ff; border-bottom: 1px solid #dbeafe; }
.view-modal-title { display: flex; align-items: center; gap: 0.75rem; }
.view-modal-icon { width: 2.5rem; height: 2.5rem; border-radius: 12px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.view-modal-title h3 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #1e3a8a; }
.view-modal-title p { margin: 2px 0 0; font-size: 0.78rem; color: #3b82f6; font-family: ui-monospace, monospace; }
.view-modal-body { padding: 1.25rem; }
.view-status-row { margin-bottom: 1rem; }
.view-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem 1.25rem; }
.view-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.view-field-wide { grid-column: 1 / -1; }
.vf-label { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; color: #94a3b8; }
.vf-value { font-size: 0.92rem; font-weight: 600; color: #1e293b; word-break: break-word; }
.view-modal-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1.5rem; }
.view-modal-actions .btn-primary-sm, .view-modal-actions .btn-outline-sm { padding: 0.6rem 1rem; font-size: 0.85rem; }

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

/* Booking modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.book-modal {
  background: white;
  border-radius: 20px;
  width: min(640px, 100%);
  max-height: min(92vh, 900px);
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.book-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 0;
  gap: 1rem;
}

.book-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-sub { margin: 0.35rem 0 0; font-size: 0.85rem; color: #64748b; }

.modal-close {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.book-form { padding: 1.25rem 1.5rem 1.5rem; }

.form-section {
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.form-section h4 {
  margin: 0 0 0.85rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group.full { grid-column: 1 / -1; }

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.7rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
}

.form-group textarea { resize: vertical; min-height: 4rem; }

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.8rem;
  color: #475569;
  margin-top: 0.75rem;
  cursor: pointer;
}

.summary-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.15rem;
  margin-bottom: 1.25rem;
}

.summary-box h4 {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.summary-box ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel {
  background: white;
  border: 1.5px solid #e2e8f0;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-submit {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .apt-item {
    grid-template-columns: 56px minmax(0, 1fr);
    column-gap: 1rem;
  }
  .apt-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    min-width: 0;
    width: 100%;
    margin-left: 0;
    padding: 1rem 0 0;
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }
  .apt-actions .status-pill-action,
  .apt-actions .btn-view-sm,
  .apt-actions .btn-primary-sm { width: auto; min-width: 110px; }
}
</style>