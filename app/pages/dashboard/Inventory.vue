<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue" />
        <span class="logo-text">EMR System</span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item active">
          <Icon name="lucide:layout-dashboard" /> Overview
        </NuxtLink>
        <NuxtLink to="/dashboard/patients" class="nav-item">
          <Icon name="lucide:users" /> Patients
        </NuxtLink>
        <NuxtLink to="/dashboard/lab-results" class="nav-item">
          <Icon name="lucide:test-tube-2" /> Lab Results
        </NuxtLink>
         <NuxtLink to="/dashboard/confinement" class="nav-item">
          <Icon name="lucide:bed" /> Confinement
         </NuxtLink>
        <NuxtLink to="/dashboard/inventory" class="nav-item">
          <Icon name="lucide:package" /> Inventory
        </NuxtLink>
        <NuxtLink to="/dashboard/billing" class="nav-item">
          <Icon name="lucide:credit-card" /> Statement of Account
        </NuxtLink>
        <NuxtLink to="/dashboard/appointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/dashboard/statistic" class="nav-item">
          <Icon name="lucide:bar-chart-3" /> Statistics
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="search-section">
          <div class="search-bar">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input type="text" placeholder="Search inventory items..." aria-label="Inventory Search" />
          </div>
        </div>
        <div class="user-profile">
          <div class="notification-wrapper clickable" title="Notifications">
            <Icon name="lucide:bell" class="bell-icon-svg" />
            <span class="notification-dot"></span>
          </div>
          <div class="avatar clickable">JS</div>
        </div>
      </header>

      <section class="dashboard-body">
        <div class="welcome-header">
          <div class="header-flex">
            <div class="header-text">
              <h1>Inventory Management</h1>
              <p>Monitor and manage your medical supplies and equipment.</p>
            </div>
            <button class="add-btn" @click="showModal = true">+ Add New Item</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card" v-for="stat in stats" :key="stat.label">
            <h3>{{ stat.label }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
            <span class="stat-change" :class="stat.type">{{ stat.meta }}</span>
          </div>
        </div>

        <div class="activity-card">
          <div class="section-header">
            <h3>Supply Stock List</h3>
            <div class="table-actions">
              <span class="filter-chip active">All</span>
              <span class="filter-chip">Medications</span>
              <span class="filter-chip">Equipment</span>
            </div>
          </div>

          <table class="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in inventoryItems" :key="item.id">
                <td><strong>{{ item.name }}</strong></td>
                <td>{{ item.category }}</td>
                <td>{{ item.stock }} {{ item.unit }}</td>
                <td>₱{{ item.price }}</td>
                <td>
                  <span class="status-badge" :class="item.status">
                    {{ item.status.replace('-', ' ') }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="edit-btn" @click="editItem(item)" title="Edit Item">
                      <Icon name="lucide:pencil" />
                    </button>
                    <button class="delete-btn" @click="deleteItem(item.id)" title="Delete Item">
                      <Icon name="lucide:trash-2" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-content">
            <h3 class="modal-title">Add New Inventory Item</h3>
            <form @submit.prevent="saveItem">
              <div class="form-group">
                <label>Item Name</label>
                <input type="text" v-model="newItem.name" placeholder="e.g. Paracetamol" required>
              </div>
              
              <div class="form-group">
                <label>Category</label>
                <select v-model="newItem.category">
                  <option>Medication</option>
                  <option>Disposables</option>
                  <option>Equipment</option>
                  <option>Medical Supplies</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" v-model="newItem.stock" placeholder="0" required>
                </div>
                <div class="form-group">
                  <label>Price (₱)</label>
                  <input type="number" step="0.01" v-model="newItem.price" placeholder="0.00" required>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="cancel-btn" @click="showModal = false">Cancel</button>
                <button type="submit" class="save-btn">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)
const newItem = ref({ name: '', category: 'Medication', stock: 0, price: '', unit: 'pcs' })

const stats = [
  { label: 'Total Items', value: '412', meta: 'Active SKUs', type: '' },
  { label: 'Low Stock', value: '12', meta: 'Requires order', type: 'negative' },
  { label: 'Out of Stock', value: '2', meta: 'Critical alerts', type: 'negative' },
  { label: 'Recent Orders', value: '5', meta: 'In transit', type: 'positive' }
]

const inventoryItems = ref([
  { id: 1, name: 'Amoxicillin 500mg', category: 'Medication', stock: 450, unit: 'caps', price: '25.00', status: 'in-stock' },
  { id: 2, name: 'Surgical Gloves (M)', category: 'Disposables', stock: 12, unit: 'boxes', price: '750.00', status: 'low-stock' },
  { id: 3, name: 'Digital Thermometer', category: 'Equipment', stock: 0, unit: 'pcs', price: '1,250.00', status: 'out-of-stock' },
  { id: 4, name: 'Paracetamol Syrup', category: 'Medication', stock: 85, unit: 'bottles', price: '210.00', status: 'in-stock' },
  { id: 5, name: 'IV Cannula 20G', category: 'Medical Supplies', stock: 15, unit: 'pcs', price: '55.00', status: 'low-stock' },
])

const saveItem = () => {
  const id = inventoryItems.value.length + 1
  inventoryItems.value.push({ 
    ...newItem.value, 
    id, 
    status: newItem.value.stock > 0 ? 'in-stock' : 'out-of-stock' 
  })
  showModal.value = false
  newItem.value = { name: '', category: 'Medication', stock: 0, price: '', unit: 'pcs' }
}

const deleteItem = (id) => {
  if(confirm('Are you sure you want to delete this item?')) {
    inventoryItems.value = inventoryItems.value.filter(item => item.id !== id)
  }
}

const editItem = (item) => {
  alert(`Editing: ${item.name}`)
}

const handleLogout = () => {
  router.push('/auth/login')
}
</script>

<style scoped>
/* --- CORE THEME --- */
.dashboard-layout {
  --bg-main: #f0f4f8;
  --bg-sidebar: #1e3a8a;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #cbd5e1;
  --accent-blue: #2563eb;
  display: flex; min-height: 100vh; background-color: var(--bg-main); font-family: 'Segoe UI', Roboto, sans-serif;
}

/* --- SIDEBAR --- */
.sidebar { width: 260px; background: var(--bg-sidebar); color: white; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; flex-shrink: 0; display: flex; flex-direction: column; }
.sidebar-logo { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 800; margin-bottom: 2.5rem; }
.icon-blue { color: #60a5fa; font-size: 1.5rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: 0.2s; }
.nav-item:hover, .nav-item.active { background: rgba(255, 255, 255, 0.1); color: white; }
.nav-item.active { background: var(--accent-blue); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { 
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  background: transparent; border: none; color: #fca5a5; font-weight: 600; 
  cursor: pointer; text-align: left; border-radius: 8px; transition: 0.2s; font-size: 1rem;
}
.logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ffffff; }

/* --- TOP BAR --- */
.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow-x: hidden; }
.top-bar { 
  background: var(--bg-card); padding: 1rem 3rem; display: flex; justify-content: space-between; 
  align-items: center; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 50;
}
.search-bar { background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 20px; padding: 0.5rem 1.2rem; width: 380px; display: flex; align-items: center; gap: 10px; }
.search-icon-svg { color: var(--text-secondary); font-size: 1.1rem; }
.search-bar input { background: transparent; border: none; outline: none; width: 100%; font-size: 0.9rem; }

.user-profile { display: flex; align-items: center; gap: 1.5rem; }
.notification-wrapper { position: relative; display: flex; align-items: center; font-size: 1.4rem; color: var(--text-secondary); }
.bell-icon-svg { color: var(--text-secondary); font-size: 1.4rem; }
.notification-dot { position: absolute; top: 2px; right: 2px; width: 9px; height: 9px; background: #ef4444; border-radius: 50%; border: 2px solid white; }
.avatar { width: 38px; height: 38px; background: var(--accent-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }

/* --- DASHBOARD BODY --- */
.dashboard-body { padding: 2.5rem 3rem; max-width: 1400px; width: 100%; }
.welcome-header { margin-bottom: 2.5rem; }
.header-flex { display: flex; justify-content: space-between; align-items: center; }
.header-text h1 { font-size: 1.6rem; color: var(--bg-sidebar); margin: 0; font-weight: 700; }
.header-text p { color: var(--text-secondary); margin-top: 5px; }

.add-btn { 
  background: var(--accent-blue); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; 
  font-weight: 600; cursor: pointer; transition: 0.2s;
}
.add-btn:hover { background: #1d4ed8; }

/* --- STATS CARDS --- */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
.stat-card { background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); transition: transform 0.3s ease; }
.stat-card:hover { transform: translateY(-5px); border-color: var(--accent-blue); }
.stat-card h3 { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.5px; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: var(--bg-sidebar); margin: 0; }
.negative { color: #ef4444; font-weight: 600; }
.positive { color: #10b981; font-weight: 600; }

/* --- TABLE SECTION --- */
.activity-card { background: var(--bg-card); padding: 1.8rem; border-radius: 16px; border: 1px solid var(--border-color); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.filter-chip { padding: 5px 15px; background: var(--bg-main); border-radius: 20px; font-size: 0.85rem; cursor: pointer; margin-left: 8px; font-weight: 500; }
.filter-chip.active { background: var(--accent-blue); color: white; }

.inventory-table { width: 100%; border-collapse: collapse; text-align: left; }
.inventory-table th { padding: 12px; border-bottom: 2px solid var(--bg-main); color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; }
.inventory-table td { padding: 15px 12px; border-bottom: 1px solid var(--bg-main); font-size: 0.95rem; }

/* --- STATUS & ACTIONS --- */
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.in-stock { background: #dcfce7; color: #166534; }
.low-stock { background: #fef3c7; color: #92400e; }
.out-of-stock { background: #fee2e2; color: #991b1b; }

.action-buttons { display: flex; gap: 10px; }
.action-buttons button { display: flex; align-items: center; background: #f1f5f9; border: none; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: var(--text-primary); }
.action-buttons button:hover { background: #e2e8f0; }

/* --- MODAL STYLES --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(2px); }
.modal-content { background: white; padding: 2rem; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-title { margin-top: 0; margin-bottom: 1.5rem; color: var(--bg-sidebar); font-size: 1.4rem; font-weight: 700; }

.form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
input, select { padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; width: 100%; box-sizing: border-box; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 2rem; }
.cancel-btn { background: #f1f5f9; border: none; padding: 0.8rem 1.8rem; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-secondary); }
.save-btn { background: var(--accent-blue); color: white; border: none; padding: 0.8rem 1.8rem; border-radius: 8px; cursor: pointer; font-weight: 600; }

.clickable { cursor: pointer; }
.clickable:hover { opacity: 0.8; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
