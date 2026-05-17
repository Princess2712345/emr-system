<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed }">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!isCollapsed">
          <Icon name="mdi:hospital-building" class="icon-blue-light" />
          <span class="logo-text">EMR System</span>
        </div>
        <button class="menu-toggle clickable" @click="isCollapsed = !isCollapsed">
          <Icon :name="isCollapsed ? 'lucide:menu' : 'lucide:chevron-left'" />
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-item">
          <Icon :name="link.icon" />
          <span v-if="!isCollapsed" class="nav-label">{{ link.label }}</span>
          <span v-if="isCollapsed" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed">Logout</span>
          <span v-if="isCollapsed" class="sidebar-tooltip">Logout</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Admin Registration</h1>
          <p>Manage and register administrative access credentials for the hospital directory.</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable" @click="openCreateModal">
            <Icon name="lucide:user-plus" /> New Registration
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
              placeholder="Search administration users by name or log email..." 
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
                <th>Administrator Details</th>
                <th>Admin ID</th>
                <th>Assigned Role</th>
                <th>Reg. Date</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!admins || admins.length === 0">
                <td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">
                  No registered administrative accounts found.
                </td>
              </tr>
              <tr v-for="admin in admins" :key="admin.id">
                <td>
                  <div class="patient-info">
                    <div class="patient-avatar" :class="admin.colorClass || 'purple'">
                      <Icon name="lucide:user" />
                    </div>
                    <div>
                      <p class="p-name">{{ admin.name || `${admin.firstName} ${admin.lastName}` }}</p>
                      <p class="p-email">{{ admin.email }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="id-badge">{{ admin.uniqueId || admin.adminId }}</span></td>
                <td><span class="role-text-badge">{{ admin.role }}</span></td>
                <td>{{ admin.date || new Date(admin.createdAt || Date.now()).toLocaleDateString() }}</td>
                <td>
                  <span class="badge active">{{ admin.status || 'Active' }}</span>
                </td>
                <td class="text-right">
                  <button class="view-link clickable" @click="openEditModal(admin)">
                    <Icon name="lucide:edit-3" /> Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>
            <Icon :name="isEditing ? 'lucide:edit-3' : 'lucide:user-plus'" />
            {{ isEditing ? 'Modify Administrative Access' : 'Create Admin Credentials' }}
          </h3>
          <button class="close-modal-btn" @click="closeModal">✕</button>
        </div>
        
        <form @submit.prevent="submitForm" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Username</label>
              <input v-model="form.username" type="text" placeholder="e.g. admin_penny" required :disabled="isEditing" />
            </div>
            <div class="form-group">
              <label>Log Email Address</label>
              <input v-model="form.email" type="email" placeholder="name@hospital.com" required :disabled="isEditing" />
            </div>
            <div class="form-group">
              <label>First Name</label>
              <input v-model="form.firstName" type="text" placeholder="First name" required />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="form.lastName" type="text" placeholder="Last name" required />
            </div>
            <div class="form-group">
              <label>Unique Admin ID Registry</label>
              <input v-model="form.uniqueId" type="text" placeholder="e.g. ADM-2026-01" required :disabled="isEditing" />
            </div>
            <div class="form-group">
              <label>Administrative Role Scope</label>
              <select v-model="form.role" required>
                <option value="ADMIN">ADMIN</option>
                <option value="HR">HUMAN RESOURCES</option>
                <option value="REGISTRAR">REGISTRAR SCOPE</option>
              </select>
            </div>
            <div class="form-group full-width" v-if="!isEditing">
              <label>Security Access Password</label>
              <input v-model="form.password" type="password" placeholder="••••••••" required />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn clickable" @click="closeModal">Cancel</button>
            <button type="submit" class="submit-btn clickable" :disabled="isSubmitting">
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="spin-icon" />
              {{ isEditing ? 'Save Changes' : 'Complete Registration' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

// --- Basic Layout & UI States ---
const isCollapsed = ref(false)
const searchQuery = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const selectedAdminId = ref(null)

const navLinks = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
  { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
  { to: '/dashboard/registration', icon: 'lucide:user-plus', label: 'Registration' }, // Cleaned up layout to use uniform professional Lucide icons
  { to: '/dashboard/Disposition', icon: 'lucide:file-output', label: 'Disposition' },
  { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
  { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
  { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
  { to: '/dashboard/History', icon: 'lucide:history', label: 'History' },
]

// --- Reactive Input State Form Definition ---
const form = reactive({
  username: '',
  email: '',
  password: '',
  firstName: '',
  middleName: '', // Included to match your structural schema layout cleanly!
  lastName: '',
  uniqueId: '',
  role: 'ADMIN'
})

// --- Live Server Data Pipeline Fetcher ---
// Binds query params to your search ref so it syncs smoothly with the API endpoint
const { data: admins, refresh: reloadAdmins } = await useFetch('/api/admins', {
  key: 'admin-roster-stream',
  query: { search: searchQuery }
})

// Watcher triggers an endpoint query refresh immediately upon typing
watch(searchQuery, () => {
  reloadAdmins()
})

const resetFilters = () => {
  searchQuery.value = ''
}

// --- Modal Action Management ---
const openCreateModal = () => {
  isEditing.value = false
  selectedAdminId.value = null
  Object.assign(form, {
    username: '',
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    uniqueId: '',
    role: 'ADMIN'
  })
  isModalOpen.value = true
}

const openEditModal = (admin) => {
  isEditing.value = true
  selectedAdminId.value = admin.id
  
  Object.assign(form, {
    username: admin.username || '',
    email: admin.email || '',
    password: '', // Kept blank to safeguard administrative password encryption
    firstName: admin.firstName || '',
    middleName: admin.middleName || '',
    lastName: admin.lastName || '',
    uniqueId: admin.uniqueId || admin.adminId || '',
    role: admin.role || 'ADMIN'
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// --- Synchronous Form Submission Database Router ---
const submitForm = async () => {
  try {
    isSubmitting.value = true
    
    if (isEditing.value) {
      // Execute REST PUT update operation to your nested ID subfolder
      await $fetch(`/api/admins/${selectedAdminId.value}`, {
        method: 'PUT',
        body: form
      })
      alert('Administrative metadata records modified successfully.')
    } else {
      // Execute registration POST operation passing inputs to your authentication layer
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: form
      })
      alert('New administrative employee registered successfully.')
    }
    
    // Refresh table array values cleanly via useFetch wrapper
    if (reloadAdmins) {
      await reloadAdmins()
    }
    closeModal()
  } catch (err) {
    console.error('Operational database sync error:', err)
    // Extracts contextual message passed from H3 handler instances beautifully
    const message = err.data?.statusMessage || err.statusMessage || 'Action rejected by server schema rules.'
    alert(message)
  } finally {
    isSubmitting.value = false
  }
}

// --- User Authorization Session Killer ---
const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      const token = useCookie('auth_token')
      token.value = null
      
      if (process.client) {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Clean redirect down to the core layout root landing portal
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout process failed:', error)
    }
  }
}
</script>

<style scoped>
/* BASE LAYOUT */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

/* SIDEBAR CORE */
.sidebar { 
  width: 260px; 
  background: #1e3a8a; 
  color: white; 
  display: flex; 
  flex-direction: column; 
  padding: 1.5rem 1rem; 
  height: 100vh; 
  position: sticky; 
  top: 0; 
  z-index: 100; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }

.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.menu-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-toggle:hover { background: rgba(255, 255, 255, 0.2); }

/* NAVIGATION */
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }

.nav-item { 
  position: relative;
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 0.8rem 1rem; 
  color: #bfdbfe; 
  text-decoration: none; 
  border-radius: 8px; 
  font-weight: 500; 
  transition: all 0.2s ease; 
  white-space: nowrap;
}

.nav-item:hover { 
  background: rgba(255, 255, 255, 0.1); 
  color: white; 
  padding-left: 1.25rem; 
}

.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { padding-left: 0.8rem; }

.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

/* TOOLTIP */
.sidebar-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 15px;
  background: #0f172a;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
  z-index: 1000;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* SIDEBAR FOOTER */
.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { 
  background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; 
  display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; position: relative;
}
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #fca5a5; transform: translateX(5px); }
.is-collapsed .logout-btn { justify-content: center; }
.logout-btn:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

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
.filter-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
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
.view-link:hover { background: #2563eb; color: white; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }

/* RESPONSIVE MODAL POPUP BACKDROP LAYOUT */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}
.modal-card {
  background: white; border-radius: 16px; width: 100%; max-width: 600px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header {
  background: #f8fafc; padding: 1.25rem 2rem; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { display: flex; align-items: center; gap: 8px; color: #1e3a8a; margin: 0; font-size: 1.15rem; font-weight: 700; }
.close-modal-btn { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; }
.close-modal-btn:hover { color: #475569; }

.modal-form { padding: 2rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: span 2; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.02em; }
.form-group input, .form-group select {
  padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-size: 0.9rem; transition: border 0.2s;
}
.form-group input:focus, .form-group select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-group input:disabled { background: #f1f5f9; color: #64748b; cursor: not-allowed; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 1.25rem; }
.cancel-btn { background: #f1f5f9; color: #475569; border: none; padding: 0.65rem 1.5rem; border-radius: 8px; font-weight: 600; }
.cancel-btn:hover { background: #e2e8f0; }
.submit-btn { background: #2563eb; color: white; border: none; padding: 0.65rem 1.5rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.submit-btn:hover { background: #1d4ed8; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }
.text-right { text-align: right; }
</style>