<template>
  <div class="portal-page">
    <header class="top-bar portal-top-bar">
      <div class="header-info">
        <h1>My Profile</h1>
        <p class="current-date">Manage your personal & medical information</p>
      </div>

      <div class="header-actions portal-header-actions">
        <PatientNotificationBell />
        <div class="profile-chip">
          <div class="avatar-circle purple-theme">
            <img v-if="form && form.avatar" :src="form.avatar" alt="Profile photo" class="avatar-img" />
            <span v-else>{{ initials }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="scrollable-body animate-in">
      <div v-if="loading" class="loading-state">
        <Icon name="lucide:loader-2" class="spin" />
        <p>Loading your profile…</p>
      </div>

      <template v-else-if="form">
        <!-- Identity hero (read-only) -->
        <section class="identity-hero">
          <div class="avatar-wrap">
            <div class="avatar-large purple-theme">
              <img v-if="form.avatar" :src="form.avatar" alt="Profile photo" class="avatar-img" />
              <span v-else>{{ initials }}</span>
            </div>
            <template v-if="editing">
              <button type="button" class="avatar-cam clickable" title="Change photo" @click="triggerPhoto">
                <Icon name="lucide:camera" />
              </button>
              <input ref="photoInput" type="file" accept=".jpg,.jpeg,.png" class="hidden-file" @change="onPhotoChange" />
              <button v-if="form.avatar" type="button" class="avatar-remove clickable" @click="removePhoto">Remove photo</button>
            </template>
          </div>
          <div class="identity-text">
            <h2>{{ form.fullName || displayName }}</h2>
            <div class="identity-meta">
              <span class="meta-pill"><Icon name="lucide:badge-check" /> MRN {{ form.uniqueId }}</span>
              <span class="meta-pill"><Icon name="lucide:mail" /> {{ form.email }}</span>
              <span class="meta-pill"><Icon name="lucide:user" /> {{ form.username }}</span>
            </div>
            <p class="member-since">Member since {{ formatDate(form.memberSince) }}</p>
          </div>
          <div class="identity-actions">
            <button v-if="!editing" class="edit-btn clickable" @click="startEdit">
              <Icon name="lucide:pencil" /> Edit Profile
            </button>
            <template v-else>
              <button class="save-btn clickable" :disabled="saving" @click="saveProfile">
                <Icon name="lucide:check" /> {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
              <button class="cancel-btn clickable" :disabled="saving" @click="cancelEdit">
                Cancel
              </button>
            </template>
          </div>
        </section>

        <div class="profile-grid">
          <!-- Personal information -->
          <section class="info-card">
            <h3 class="card-title"><Icon name="lucide:id-card" /> Personal Information</h3>
            <div class="field-grid">
              <div class="field">
                <label>Phone number</label>
                <input v-if="editing" v-model="form.phone" type="tel" placeholder="+63 9xx xxx xxxx" />
                <p v-else class="field-value">{{ display(form.phone) }}</p>
              </div>
              <div class="field">
                <label>Gender</label>
                <select v-if="editing" v-model="form.gender">
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <p v-else class="field-value">{{ display(form.gender) }}</p>
              </div>
              <div class="field">
                <label>Date of birth</label>
                <input v-if="editing" v-model="form.birthDate" type="date" />
                <p v-else class="field-value">{{ form.birthDate ? formatDate(form.birthDate) : '—' }}</p>
              </div>
              <div class="field">
                <label>Age</label>
                <input v-if="editing" v-model.number="form.age" type="number" min="0" max="130" placeholder="e.g. 28" />
                <p v-else class="field-value">{{ displayAge !== null ? displayAge + ' yrs' : '—' }}</p>
              </div>
              <div class="field">
                <label>Blood type</label>
                <select v-if="editing" v-model="form.bloodType">
                  <option value="">Unknown</option>
                  <option v-for="bt in bloodTypes" :key="bt" :value="bt">{{ bt }}</option>
                </select>
                <p v-else class="field-value">{{ display(form.bloodType) }}</p>
              </div>
              <div class="field field-wide">
                <label>Home address</label>
                <input v-if="editing" v-model="form.address" type="text" placeholder="Street, City, Province" />
                <p v-else class="field-value">{{ display(form.address) }}</p>
              </div>
              <div class="field field-wide">
                <label>Known allergies</label>
                <textarea v-if="editing" v-model="form.allergies" rows="2" placeholder="e.g. Penicillin, peanuts — or 'None'" />
                <p v-else class="field-value">{{ display(form.allergies) }}</p>
              </div>
            </div>
          </section>

          <!-- Emergency contact -->
          <section class="info-card">
            <h3 class="card-title"><Icon name="lucide:phone-call" /> Emergency Contact</h3>
            <div class="field-grid">
              <div class="field field-wide">
                <label>Contact name</label>
                <input v-if="editing" v-model="form.emergencyContactName" type="text" placeholder="Full name" />
                <p v-else class="field-value">{{ display(form.emergencyContactName) }}</p>
              </div>
              <div class="field">
                <label>Relationship</label>
                <input v-if="editing" v-model="form.emergencyContactRelation" type="text" placeholder="e.g. Mother, Spouse" />
                <p v-else class="field-value">{{ display(form.emergencyContactRelation) }}</p>
              </div>
              <div class="field">
                <label>Contact number</label>
                <input v-if="editing" v-model="form.emergencyContactPhone" type="tel" placeholder="+63 9xx xxx xxxx" />
                <p v-else class="field-value">
                  <a v-if="form.emergencyContactPhone" :href="`tel:${form.emergencyContactPhone}`" class="phone-link">
                    {{ form.emergencyContactPhone }}
                  </a>
                  <span v-else>—</span>
                </p>
              </div>
            </div>
          </section>

          <!-- Insurance -->
          <section class="info-card">
            <h3 class="card-title"><Icon name="lucide:shield-check" /> Insurance</h3>
            <div class="field-grid">
              <div class="field">
                <label>Provider</label>
                <input v-if="editing" v-model="form.insuranceProvider" type="text" placeholder="e.g. PhilHealth" />
                <p v-else class="field-value">{{ display(form.insuranceProvider) }}</p>
              </div>
              <div class="field">
                <label>Policy / member number</label>
                <input v-if="editing" v-model="form.insuranceNumber" type="text" placeholder="Member ID" />
                <p v-else class="field-value">{{ display(form.insuranceNumber) }}</p>
              </div>
            </div>
          </section>
        </div>

        <p v-if="photoError" class="photo-error">{{ photoError }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, computed, watch, onMounted } from 'vue'

const { initials, displayName, requirePatientSession } = usePatientHeader()

const userId = ref('')
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const form = ref(null)
const photoInput = ref(null)
const photoError = ref('')
let snapshot = null

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const bloodTypes = ['A Positive', 'A Negative', 'B Positive', 'B Negative', 'AB Positive', 'AB Negative', 'O Positive', 'O Negative']

const display = (v) => (v && String(v).trim() ? v : '—')

const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const ageFromBirth = (value) => {
  if (!value) return null
  const bd = new Date(value)
  if (Number.isNaN(bd.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const m = today.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--
  return age >= 0 ? age : null
}

const displayAge = computed(() => {
  if (!form.value) return null
  const fromBirth = ageFromBirth(form.value.birthDate)
  if (fromBirth !== null) return fromBirth
  return form.value.age ?? null
})

// Keep age in sync when the patient picks a birth date (still manually editable)
watch(
  () => form.value?.birthDate,
  (val) => {
    if (!editing.value || !form.value) return
    const a = ageFromBirth(val)
    if (a !== null) form.value.age = a
  }
)

const triggerPhoto = () => {
  photoError.value = ''
  if (photoInput.value) photoInput.value.click()
}

const onPhotoChange = (e) => {
  photoError.value = ''
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > MAX_AVATAR_BYTES) {
    photoError.value = 'Image is too large. Please keep it under 2 MB.'
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    if (form.value && typeof reader.result === 'string') form.value.avatar = reader.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const removePhoto = () => {
  if (form.value) form.value.avatar = ''
}

const loadProfile = async () => {
  const data = await $fetch(`/api/patient/profile?userId=${userId.value}`)
  if (data.success) form.value = { ...data.profile }
}

const persistAvatarToSession = () => {
  if (!import.meta.client) return
  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.avatar = form.value?.avatar || ''
    localStorage.setItem('user_data', JSON.stringify(parsed))
  } catch {
    /* ignore */
  }
}

onMounted(async () => {
  try {
    const user = requirePatientSession()
    if (!user) return
    userId.value = user.id
    await loadProfile()
  } catch (e) {
    console.error('Profile load failed:', e)
  } finally {
    loading.value = false
  }
})

const startEdit = () => {
  snapshot = JSON.parse(JSON.stringify(form.value))
  editing.value = true
}

const cancelEdit = () => {
  if (snapshot) form.value = { ...snapshot }
  editing.value = false
}

const saveProfile = async () => {
  if (!form.value) return
  saving.value = true
  try {
    await $fetch('/api/patient/profile', {
      method: 'PUT',
      body: { userId: userId.value, ...form.value }
    })
    await loadProfile()
    persistAvatarToSession()
    editing.value = false
  } catch (e) {
    console.error('Profile save failed:', e)
    alert(e?.data?.statusMessage || 'Could not save your profile. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.header-info h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
.header-actions { display: flex; align-items: center; gap: 1.2rem; }
.avatar-circle { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; overflow: hidden; }
.purple-theme { background: #f3e8ff; color: #7e22ce; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }

/* Avatar with upload controls */
.avatar-wrap { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.avatar-large { overflow: hidden; }
.avatar-cam {
  position: absolute; top: -6px; right: -6px; width: 34px; height: 34px; border-radius: 50%;
  background: #2563eb; color: white; border: 3px solid white; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.avatar-cam:hover { background: #1d4ed8; }
.hidden-file { display: none; }
.avatar-remove { background: none; border: none; color: #dc2626; font-size: 0.72rem; font-weight: 700; cursor: pointer; padding: 0; }
.avatar-remove:hover { text-decoration: underline; }
.photo-error { color: #dc2626; font-size: 0.82rem; margin: 1rem 0 0; font-weight: 600; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 4rem; color: #64748b; }
.spin { animation: spin 1s linear infinite; font-size: 1.6rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Identity hero */
.identity-hero {
  display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
  background: white; border: 1px solid #e2e8f0; border-radius: 20px;
  padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.avatar-large { width: 84px; height: 84px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; flex-shrink: 0; }
.identity-text { flex: 1; min-width: 220px; }
.identity-text h2 { font-size: 1.5rem; color: #1e3a8a; margin: 0 0 0.6rem; font-weight: 800; }
.identity-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.meta-pill { display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; }
.member-since { margin: 0.6rem 0 0; font-size: 0.78rem; color: #94a3b8; }
.identity-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

.edit-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.edit-btn:hover { background: #1d4ed8; }
.save-btn { background: #16a34a; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.save-btn:hover { background: #15803d; }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cancel-btn { background: #f1f5f9; color: #475569; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; }
.cancel-btn:hover { background: #e2e8f0; }

/* Cards */
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.info-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; }
.info-card:first-child { grid-column: 1 / -1; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; color: #1e3a8a; margin: 0 0 1.25rem; font-weight: 800; }

.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.25rem; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field-wide { grid-column: 1 / -1; }
.field label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; color: #94a3b8; }
.field-value { margin: 0; font-size: 0.95rem; font-weight: 600; color: #1e293b; word-break: break-word; }
.field input, .field select, .field textarea {
  width: 100%; padding: 0.65rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 10px;
  outline: none; font-family: inherit; font-size: 0.9rem; background: #f8fafc;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: #2563eb; background: white; }
.field textarea { resize: vertical; }
.phone-link { color: #2563eb; font-weight: 700; text-decoration: none; }
.phone-link:hover { text-decoration: underline; }

.animate-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.clickable { cursor: pointer; transition: all 0.15s ease; }
.clickable:active { transform: scale(0.98); }

@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
  .field-grid { grid-template-columns: 1fr; }
  .identity-hero { flex-direction: column; text-align: center; align-items: center; }
  .identity-meta { justify-content: center; }
}
</style>
