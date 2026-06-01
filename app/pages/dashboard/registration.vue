<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar portal-top-bar">
        <div class="welcome-msg">
          <h1>Patient Registration Directory</h1>
          <p>Admit patients, edit profiles, and prescribe active medications shown on the patient portal.</p>
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
                      <img v-if="patient.avatar" :src="patient.avatar" alt="Patient photo" class="avatar-img" />
                      <Icon v-else :name="patient.gender === 'Female' ? 'lucide:user-round-text' : 'lucide:user'" />
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
                <td>{{ patient.birthDateDisplay || patient.birthDate || 'N/A' }}</td>
                <td>
                  <span class="badge active">Active Portal</span>
                </td>
                <td class="col-actions">
                  <div class="action-cell">
                    <button type="button" class="rx-link clickable" @click="openRxModal(patient)">
                      <Icon name="lucide:pill" /> Manage Rx
                    </button>
                    <button type="button" class="view-link clickable" @click="openEditModal(patient)">
                      <Icon name="lucide:edit-3" /> Edit
                    </button>
                  </div>
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
            <div v-if="isEditing" class="form-group">
              <label>Medical Record Number (MRN)</label>
              <input v-model="form.uniqueId" type="text" disabled />
            </div>
            <div v-else class="form-group full-width">
              <label>Medical Record Number (MRN)</label>
              <p class="field-hint">Assigned automatically by the system when the profile is created (e.g. MRN-2026-000042). No duplicates.</p>
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
            <div class="form-group">
              <label>Phone</label>
              <input v-model="form.phone" type="tel" placeholder="Contact number" />
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

    <Transition name="fade">
      <div v-if="rxOpen" class="modal-backdrop" @click.self="closeRxModal">
        <div class="modal-card rx-modal">
          <div class="modal-header">
            <h3>
              <Icon name="lucide:pill" />
              Manage prescriptions
            </h3>
            <button type="button" class="close-modal-btn" @click="closeRxModal">✕</button>
          </div>

          <div v-if="rxPatient" class="rx-patient-bar">
            <div class="patient-avatar purple">
              <img v-if="rxPatient.avatar" :src="rxPatient.avatar" alt="" class="avatar-img" />
              <Icon v-else name="lucide:user" />
            </div>
            <div>
              <p class="rx-patient-name">{{ rxPatient.name }}</p>
              <p class="rx-patient-mrn">{{ rxPatient.mrn || 'MRN pending' }}</p>
            </div>
            <span class="rx-active-badge">{{ rxActiveCount }} active</span>
          </div>

          <div v-if="rxLoading" class="rx-state">
            <Icon name="lucide:loader-2" class="spin-icon" />
            Loading medications…
          </div>

          <div v-else class="rx-modal-body">
            <div class="rx-list-section">
              <p class="rx-section-label">Active medications</p>
              <ul v-if="rxMedications.filter((m) => m.status === 'Active').length" class="rx-list">
                <li v-for="med in rxMedications.filter((m) => m.status === 'Active')" :key="med.id" class="rx-item">
                  <div class="rx-item-main">
                    <p class="rx-med-name">{{ med.name }}</p>
                    <p class="rx-med-detail">{{ med.dose }} • {{ med.timing }}</p>
                    <p v-if="med.prescribedBy" class="rx-med-by">Prescribed by {{ med.prescribedBy }}</p>
                  </div>
                  <button
                    type="button"
                    class="rx-stop-btn clickable"
                    :disabled="rxSaving"
                    @click="discontinueMed(med)"
                  >
                    Discontinue
                  </button>
                </li>
              </ul>
              <p v-else class="rx-empty">No active medications on file. Add one below — the patient will see it on Health Records.</p>
            </div>

            <form class="rx-add-form" @submit.prevent="addMedication">
              <p class="rx-section-label">Add medication</p>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Medication name</label>
                  <input v-model="rxForm.name" type="text" placeholder="e.g. Lisinopril" required />
                </div>
                <div class="form-group">
                  <label>Dose</label>
                  <input v-model="rxForm.dose" type="text" placeholder="e.g. 10 mg" />
                </div>
                <div class="form-group">
                  <label>Timing</label>
                  <input v-model="rxForm.timing" type="text" placeholder="e.g. Once daily (morning)" />
                </div>
                <div class="form-group full-width">
                  <label>Prescribed by</label>
                  <input v-model="rxForm.prescribedBy" type="text" placeholder="Dr. Name" />
                </div>
              </div>
              <button type="submit" class="submit-btn clickable" :disabled="rxSaving">
                <Icon v-if="rxSaving" name="lucide:loader-2" class="spin-icon" />
                <Icon v-else name="lucide:plus" />
                Add to patient chart
              </button>
            </form>
          </div>

          <div class="modal-actions rx-modal-footer">
            <button type="button" class="cancel-btn clickable" @click="closeRxModal">Close</button>
          </div>
        </div>
      </div>
    </Transition>
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
  bloodType: 'O Positive',
  phone: ''
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
    bloodType: 'O Positive',
    phone: ''
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
    bloodType: patient.bloodType || 'O Positive',
    phone: patient.phone || ''
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const rxOpen = ref(false)
const rxLoading = ref(false)
const rxSaving = ref(false)
const rxPatient = ref(null)
const rxMedications = ref([])
const rxActiveCount = ref(0)
const rxPatientId = ref(null)

const rxForm = reactive({
  name: '',
  dose: '',
  timing: '',
  prescribedBy: 'Dr. Clinical Staff'
})

const loadRxMedications = async () => {
  if (!rxPatientId.value) return
  rxLoading.value = true
  try {
    const data = await $fetch(`/api/patients/${rxPatientId.value}/medications`)
    if (data.success) {
      rxPatient.value = data.patient
      rxMedications.value = data.medications || []
      rxActiveCount.value = data.activeCount ?? 0
    }
  } catch (e) {
    console.error('Failed to load medications:', e)
    alert(e?.data?.statusMessage || e?.statusMessage || e?.message || 'Could not load medications.')
  } finally {
    rxLoading.value = false
  }
}

const openRxModal = async (patient) => {
  rxPatientId.value = patient.id
  rxPatient.value = {
    name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
    mrn: patient.uniqueId || patient.patientId,
    avatar: patient.avatar || ''
  }
  Object.assign(rxForm, {
    name: '',
    dose: '',
    timing: '',
    prescribedBy: 'Dr. Clinical Staff'
  })
  rxOpen.value = true
  await loadRxMedications()
}

const closeRxModal = () => {
  rxOpen.value = false
  rxPatientId.value = null
  rxMedications.value = []
}

const addMedication = async () => {
  if (!rxPatientId.value || !rxForm.name.trim()) return
  rxSaving.value = true
  try {
    const res = await $fetch(`/api/patients/${rxPatientId.value}/medications`, {
      method: 'POST',
      body: { ...rxForm }
    })
    Object.assign(rxForm, { name: '', dose: '', timing: '', prescribedBy: rxForm.prescribedBy })
    await loadRxMedications()
    alert(res.message || 'Medication added.')
  } catch (e) {
    alert(e?.data?.statusMessage || e?.statusMessage || e?.message || 'Could not add medication.')
  } finally {
    rxSaving.value = false
  }
}

const discontinueMed = async (med) => {
  if (!confirm(`Discontinue ${med.name} for this patient?`)) return
  rxSaving.value = true
  try {
    const res = await $fetch(`/api/patient-medications/${med.id}`, {
      method: 'PATCH',
      body: { discontinue: true }
    })
    await loadRxMedications()
    alert(res.message || 'Medication discontinued.')
  } catch (e) {
    alert(e?.data?.statusMessage || 'Could not discontinue medication.')
  } finally {
    rxSaving.value = false
  }
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
        age: calculatedAge || 24,
        bloodType: form.bloodType || 'O Positive',
        gender: form.gender,
        birthDate: form.birthDate || null,
        phone: form.phone?.trim() || 'N/A'
      }

      const response = await $fetch('/api/patients', {
        method: 'POST',
        body: payload
      })
      
      if (response.success) {
        const mrn = response.user?.uniqueId || 'assigned'
        alert(`Patient profile created.\n\nName: ${form.firstName} ${form.lastName}\nMRN: ${mrn}\n\nShare this MRN with the patient for portal login.`)
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
.patient-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; overflow: hidden; }
.patient-avatar.purple { background: #f3e8ff; color: #7e22ce; }
.patient-avatar.teal { background: #ccfbf1; color: #0d9488; }
.patient-avatar .avatar-img { width: 100%; height: 100%; object-fit: cover; }

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
.field-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.45;
  padding: 0.65rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
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

.col-actions { text-align: right; white-space: nowrap; }
.action-cell {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.rx-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6d28d9;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.rx-modal {
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.rx-modal-body {
  padding: 0 2rem;
  overflow-y: auto;
  flex: 1;
}

.rx-patient-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.rx-patient-name {
  margin: 0;
  font-weight: 800;
  color: #1e293b;
}

.rx-patient-mrn {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #64748b;
  font-family: ui-monospace, monospace;
}

.rx-active-badge {
  margin-left: auto;
  background: #ede9fe;
  color: #6d28d9;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
}

.rx-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.rx-section-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
  margin: 0 0 0.75rem;
}

.rx-list-section {
  padding-top: 1.25rem;
  padding-bottom: 1rem;
  max-height: 220px;
  overflow-y: auto;
}

.rx-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.rx-med-name {
  margin: 0;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.rx-med-detail {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.rx-med-by {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

.rx-stop-btn {
  flex-shrink: 0;
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
}

.rx-empty {
  margin: 0;
  font-size: 0.85rem;
  color: #94a3b8;
  font-style: italic;
  line-height: 1.5;
}

.rx-add-form {
  padding-bottom: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.25rem;
}

.rx-add-form .submit-btn {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
}

.rx-modal-footer {
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .action-cell {
    flex-direction: column;
    align-items: stretch;
  }
  .rx-link,
  .view-link {
    justify-content: center;
  }
}
</style>