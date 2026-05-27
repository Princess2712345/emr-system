<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar portal-top-bar">
        <div class="welcome-msg">
          <h1>Patient Registration Directory</h1>
          <p>Admit new patients and manage master profiles to link appointments, billing, and lab records.</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="openCreateModal">
            <Icon name="lucide:user-plus" /> Admission / New Patient
          </button>
        </div>
      </header>

      <section class="patient-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search patients by full name, email, or record ID..." 
            />
          </div>
          <div class="filter-group">
            <button class="filter-btn clickable" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" /> Reset Filters
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="patient-table">
            <thead>
              <tr>
                <th>Patient Name & Contact</th>
                <th>Patient ID</th>
                <th>Gender / Sex</th>
                <th>Birth Date</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!patients || patients.length === 0">
                <td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">
                  No master patient profiles found matching criteria.
                </td>
              </tr>
              <tr v-for="patient in patients" :key="patient.id">
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar" :class="patient.gender === 'Female' ? 'purple' : 'teal'">
                      <Icon :name="patient.gender === 'Female' ? 'lucide:user-round-text' : 'lucide:user'" />
                    </div>
                    <div>
                      <p class="p-name">
                        {{ patient.name || (patient.userAccount ? `${patient.userAccount.firstName} ${patient.userAccount.lastName}` : 'Anonymous Patient') }}
                      </p>
                      <p class="p-email">{{ patient.email || 'No Email Logged' }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ patient.uniqueId || (patient.userAccount ? patient.userAccount.uniqueId : 'PAT-PENDING') }}</span></td>
                <td><span class="role-text-badge">{{ patient.gender || (patient.userAccount ? 'Logged' : 'N/A') }}</span></td>
                <td>{{ patient.birthDate || 'N/A' }}</td>
                <td>
                  <span class="badge active">Active Portal</span>
                </td>
                <td class="text-right">
                  <button class="view-link clickable" @click="openEditModal(patient)">
                    <Icon name="lucide:edit-3" /> Edit Profile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>
            <Icon :name="isEditing ? 'lucide:edit-3' : 'lucide:user-plus'" />
            {{ isEditing ? 'Update Patient Clinical Master' : 'Register New Patient Portal Profile' }}
          </h3>
          <button class="close-modal-btn" @click="closeModal">✕</button>
        </div>
        
        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>First Name</label>
              <input v-model="form.firstName" type="text" placeholder="Given name" required />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="form.lastName" type="text" placeholder="Family surname" required />
            </div>
            <div class="form-group">
              <label>Log Email Address</label>
              <input v-model="form.email" type="email" placeholder="patient@example.com" required :disabled="isEditing" />
            </div>
            <div class="form-group">
              <label>Unique Patient ID Registry</label>
              <input v-model="form.uniqueId" type="text" placeholder="e.g. PAT-2026-88" required :disabled="isEditing" />
            </div>
            <div class="form-group">
              <label>Biological Sex</label>
              <select v-model="form.gender" required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Birth Date</label>
              <input v-model="form.birthDate" type="date" required />
            </div>
            
            <div class="form-group full-width" v-if="!isEditing">
              <label>Patient Portal Activation Password</label>
              <input v-model="form.password" type="password" placeholder="Temporary security access key" required />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn clickable" @click="closeModal">Cancel</button>
            <button type="submit" class="submit-btn clickable" :disabled="isSubmitting">
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="spin-icon" />
              {{ isEditing ? 'Update Records' : 'Generate Patient Profile' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, watch, reactive } from 'vue'

const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const selectedPatientId = ref(null)

const form = reactive({
  email: '',
  password: '',
  firstName: '',
  middleName: '',
  lastName: '',
  uniqueId: '',
  gender: 'Female',
  birthDate: '',
  bloodType: 'O Positive'
})

const { data: patients, refresh: reloadPatients } = await useFetch('/api/patients', {
  key: 'patient-roster-stream',
  query: { search: searchQuery }
})

watch(searchQuery, () => {
  reloadPatients()
})

const resetFilters = () => {
  searchQuery.value = ''
}

const openCreateModal = () => {
  isEditing.value = false
  selectedPatientId.value = null
  Object.assign(form, {
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    uniqueId: '',
    gender: 'Female',
    birthDate: '',
    bloodType: 'O Positive'
  })
  isModalOpen.value = true
}

const openEditModal = (patient) => {
  isEditing.value = true
  selectedPatientId.value = patient.id
  
  // Cleanly fall back to userAccount subproperties if editing an aliased schema layer record
  const rootFirst = patient.firstName || (patient.userAccount ? patient.userAccount.firstName : '')
  const rootLast = patient.lastName || (patient.userAccount ? patient.userAccount.lastName : '')
  const rootId = patient.uniqueId || (patient.userAccount ? patient.userAccount.uniqueId : '')

  Object.assign(form, {
    email: patient.email || '',
    password: '', 
    firstName: rootFirst,
    middleName: patient.middleName || (patient.userAccount ? patient.userAccount.middleName : ''),
    lastName: rootLast,
    uniqueId: rootId,
    gender: patient.gender || 'Female',
    birthDate: patient.birthDate || '',
    bloodType: patient.bloodType || 'O Positive'
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  try {
    isSubmitting.value = true
    let payload = {}

    if (isEditing.value) {
      payload = {
        ...form,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        role: 'PATIENT'
      }
      
      await $fetch(`/api/patients/${selectedPatientId.value}`, {
        method: 'PUT',
        body: payload
      })
      alert('Patient master data metrics updated.')
      
    } else {
      const birthYear = form.birthDate ? new Date(form.birthDate).getFullYear() : null
      const currentYear = new Date().getFullYear()
      const calculatedAge = birthYear ? (currentYear - birthYear) : 24

      payload = {
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        middleName: form.middleName?.trim() || null,
        lastName: form.lastName.trim(),
        uniqueId: form.uniqueId.trim(),
        role: 'PATIENT',
        age: calculatedAge || 24,
        bloodType: form.bloodType || 'O Positive'
      }

      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: payload
      })
      
      if (response.success) {
        alert('Patient profile successfully initialized across identity and clinical records.')
      }
    }
    
    if (reloadPatients) {
      await reloadPatients()
    }
    closeModal()
  } catch (err) {
    console.error('Registration action halted:', err)
    alert(err.data?.statusMessage || 'Registration process halted by design rules.')
  } finally {
    isSubmitting.value = false
  }
}

</script>

<style scoped>
/* BASE LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR CORE */
.sidebar { 
  width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; 
  padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 100; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.menu-toggle { background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; display: flex; cursor: pointer; }

/* NAVIGATION */
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { 
  position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; white-space: nowrap;
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.router-link-active { background: #2563eb !important; color: white !important; }

/* TOOLTIP */
.sidebar-tooltip {
  position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; padding: 6px 12px;
  border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; transition: all 0.2s ease; z-index: 1000;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* SIDEBAR FOOTER */
.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; }

/* MAIN CONTENT LAYOUTS */
.main-content { flex: 1; display: flex; flex-direction: column; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }

/* BODY ELEMENTS AND CONTROLS */
.patient-body { padding: 2rem 3rem; }
.table-controls { display: flex; justify-content: space-between; margin-bottom: 1.5rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem; border: 1px solid #e2e8f0; border-radius: 12px; background: white; outline: none; font-size: 0.9rem; }
.search-icon-svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.filter-btn { display: flex; align-items: center; gap: 8px; padding: 0 1.2rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; color: #475569; height: 44px; font-size: 0.85rem; }

.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
.patient-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; }

.patient-info { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.patient-avatar.purple { background: #f3e8ff; color: #7e22ce; }
.patient-avatar.teal { background: #ccfbf1; color: #0d9488; }

.p-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 0.95rem; }
.p-email { font-size: 0.8rem; color: #64748b; margin: 0; }
.id-badge { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; color: #1e3a8a; font-weight: 600; font-size: 0.8rem; }
.role-text-badge { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.active { background: #dcfce7; color: #15803d; }

.view-link { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }

/* MODAL LAYOUT */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { background: white; border-radius: 16px; width: 100%; max-width: 600px; overflow: hidden; animation: modalSlideUp 0.3s ease-out; }
@keyframes modalSlideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header { background: #f8fafc; padding: 1.25rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { display: flex; align-items: center; gap: 8px; color: #1e3a8a; margin: 0; font-size: 1.15rem; font-weight: 700; }
.close-modal-btn { background: none; border: none; color: #94a3b8; font-size: 1.2rem; }

.modal-form { padding: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: span 2; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; }
.form-group input, .form-group select { padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-size: 0.9rem; }
.form-group input:disabled { background: #f1f5f9; color: #64748b; cursor: not-allowed; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 1.25rem; }
.cancel-btn { background: #f1f5f9; color: #475569; border: none; padding: 0.65rem 1.5rem; border-radius: 8px; font-weight: 600; }
.submit-btn { background: #2563eb; color: white; border: none; padding: 0.65rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; }

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }
.text-right { text-align: right; }
</style>