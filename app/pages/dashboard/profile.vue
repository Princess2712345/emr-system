<template>
  <div class="portal-page dashboard-page">
    <header class="top-bar portal-top-bar">
      <div class="welcome-msg">
        <h1>My Profile</h1>
        <p>Manage your staff account information.</p>
      </div>
      <div class="header-actions portal-header-actions">
        <AdminNotificationBell />
      </div>
    </header>

    <section class="profile-body animate-in">
      <div v-if="loading" class="loading-state">
        <Icon name="lucide:loader-2" class="spin" />
        <p>Loading your profile…</p>
      </div>

      <template v-else-if="form">
        <!-- Identity hero -->
        <section class="identity-hero">
          <div class="avatar-wrap">
            <div class="avatar-large">
              <img v-if="form.avatar" :src="form.avatar" alt="Profile photo" class="avatar-img" />
              <span v-else>{{ initials }}</span>
            </div>
            <template v-if="editing">
              <button type="button" class="avatar-cam clickable" title="Change photo" @click="triggerPhoto">
                <Icon name="lucide:camera" />
              </button>
              <input ref="photoInput" type="file" accept=".jpg,.jpeg,.png" class="hidden-file" @change="onPhotoChange" />
              <button v-if="form.avatar" type="button" class="avatar-remove clickable" @click="form.avatar = ''">Remove photo</button>
            </template>
          </div>
          <div class="identity-text">
            <h2>{{ form.fullName || displayName }}</h2>
            <div class="identity-meta">
              <span class="meta-pill"><Icon name="lucide:shield" /> {{ roleLabel }}</span>
              <span class="meta-pill"><Icon name="lucide:badge-check" /> {{ form.idLabel }} {{ form.uniqueId }}</span>
              <span class="meta-pill"><Icon name="lucide:mail" /> {{ form.email }}</span>
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
              <button class="cancel-btn clickable" :disabled="saving" @click="cancelEdit">Cancel</button>
            </template>
          </div>
        </section>

        <div class="profile-grid">
          <section class="info-card">
            <h3 class="card-title"><Icon name="lucide:id-card" /> Account Information</h3>
            <div class="field-grid">
              <div class="field">
                <label>First name</label>
                <input v-if="editing" v-model="form.firstName" type="text" />
                <p v-else class="field-value">{{ display(form.firstName) }}</p>
              </div>
              <div class="field">
                <label>Last name</label>
                <input v-if="editing" v-model="form.lastName" type="text" />
                <p v-else class="field-value">{{ display(form.lastName) }}</p>
              </div>
              <div class="field">
                <label>Middle name</label>
                <input v-if="editing" v-model="form.middleName" type="text" placeholder="Optional" />
                <p v-else class="field-value">{{ display(form.middleName) }}</p>
              </div>
              <div class="field">
                <label>Username</label>
                <input v-if="editing" v-model="form.username" type="text" placeholder="username" />
                <p v-else class="field-value">{{ form.username }}</p>
              </div>
              <div class="field">
                <label>{{ form.idLabel }}</label>
                <p class="field-value mono">{{ form.uniqueId }}</p>
              </div>
              <div class="field">
                <label>Role</label>
                <select v-if="editing" v-model="form.role">
                  <option value="ADMIN">Administrator</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
                <p v-else class="field-value">{{ roleLabel }}</p>
              </div>
            </div>
          </section>

          <section class="info-card">
            <h3 class="card-title"><Icon name="lucide:user" /> Personal Details</h3>
            <div class="field-grid">
              <div class="field">
                <label>Phone number</label>
                <input v-if="editing" v-model="form.phone" type="tel" placeholder="+63 9xx xxx xxxx" />
                <p v-else class="field-value">{{ display(form.phone) }}</p>
              </div>
              <div class="field">
                <label>Age</label>
                <input v-if="editing" v-model.number="form.age" type="number" min="0" max="130" />
                <p v-else class="field-value">{{ form.age !== null && form.age !== '' ? form.age + ' yrs' : '—' }}</p>
              </div>
              <div class="field">
                <label>Blood type</label>
                <select v-if="editing" v-model="form.bloodType">
                  <option value="">Unknown</option>
                  <option v-for="bt in bloodTypes" :key="bt" :value="bt">{{ bt }}</option>
                </select>
                <p v-else class="field-value">{{ display(form.bloodType) }}</p>
              </div>
              <div class="field">
                <label>Email</label>
                <p class="field-value">{{ form.email }}</p>
              </div>
            </div>
          </section>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, computed, onMounted } from 'vue'
import { getStoredUser } from '~/utils/authSession'

const { initials } = useAuth()

const userId = ref('')
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const form = ref(null)
const photoInput = ref(null)
let snapshot = null

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const bloodTypes = ['A Positive', 'A Negative', 'B Positive', 'B Negative', 'AB Positive', 'AB Negative', 'O Positive', 'O Negative']

const ROLE_LABELS = { ADMIN: 'Administrator', HR: 'Human Resources', REGISTRAR: 'Registrar', DOCTOR: 'Doctor' }

const displayName = computed(() => form.value?.fullName || 'Staff')
const roleLabel = computed(() => ROLE_LABELS[form.value?.role] || form.value?.role || 'Staff')

const display = (v) => (v && String(v).trim() ? v : '—')

const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const loadProfile = async () => {
  const data = await $fetch(`/api/admin/profile?userId=${userId.value}`)
  if (data.success) form.value = { ...data.profile }
}

const persistToSession = () => {
  if (!import.meta.client || !form.value) return
  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return
    const parsed = JSON.parse(raw)
    parsed.avatar = form.value.avatar || ''
    parsed.username = form.value.username
    parsed.role = form.value.role
    parsed.firstName = form.value.firstName
    parsed.lastName = form.value.lastName
    localStorage.setItem('user_data', JSON.stringify(parsed))
  } catch {
    /* ignore */
  }
}

onMounted(async () => {
  try {
    const stored = getStoredUser()
    if (!stored || stored.role === 'PATIENT') {
      navigateTo('/auth/login')
      return
    }
    userId.value = stored.id
    await loadProfile()
  } catch (e) {
    console.error('Admin profile load failed:', e)
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

const triggerPhoto = () => {
  if (photoInput.value) photoInput.value.click()
}

const onPhotoChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > MAX_AVATAR_BYTES) {
    alert('Image is too large. Please keep it under 2 MB.')
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

const saveProfile = async () => {
  if (!form.value) return
  saving.value = true
  try {
    await $fetch('/api/admin/profile', {
      method: 'PUT',
      body: { userId: userId.value, ...form.value }
    })
    await loadProfile()
    persistToSession()
    editing.value = false
  } catch (e) {
    console.error('Admin profile save failed:', e)
    alert(e?.data?.statusMessage || 'Could not save your profile. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }
.profile-body { padding: 2rem 3rem; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 4rem; color: #64748b; }
.spin { animation: spin 1s linear infinite; font-size: 1.6rem; }
@keyframes spin { to { transform: rotate(360deg); } }

.identity-hero {
  display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
  background: white; border: 1px solid #e2e8f0; border-radius: 20px;
  padding: 1.75rem; margin-bottom: 1.5rem;
}
.avatar-wrap { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.avatar-large { width: 84px; height: 84px; border-radius: 20px; background: #dbeafe; color: #1e3a8a; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-cam { position: absolute; top: -6px; right: -6px; width: 34px; height: 34px; border-radius: 50%; background: #2563eb; color: white; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.avatar-cam:hover { background: #1d4ed8; }
.hidden-file { display: none; }
.avatar-remove { background: none; border: none; color: #dc2626; font-size: 0.72rem; font-weight: 700; cursor: pointer; padding: 0; }
.avatar-remove:hover { text-decoration: underline; }

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

.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.info-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; color: #1e3a8a; margin: 0 0 1.25rem; font-weight: 800; }
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.25rem; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; color: #94a3b8; }
.field-value { margin: 0; font-size: 0.95rem; font-weight: 600; color: #1e293b; word-break: break-word; }
.field-value.mono { font-family: ui-monospace, monospace; }
.field input, .field select { width: 100%; padding: 0.65rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; font-family: inherit; font-size: 0.9rem; background: #f8fafc; }
.field input:focus, .field select:focus { border-color: #2563eb; background: white; }

.animate-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.clickable { cursor: pointer; transition: all 0.15s ease; }
.clickable:active { transform: scale(0.98); }

@media (max-width: 768px) {
  .top-bar { padding: 1.25rem 1.25rem; }
  .profile-body { padding: 1.25rem; }
  .profile-grid { grid-template-columns: 1fr; }
  .field-grid { grid-template-columns: 1fr; }
  .identity-hero { flex-direction: column; text-align: center; align-items: center; }
  .identity-meta { justify-content: center; }
}
</style>
