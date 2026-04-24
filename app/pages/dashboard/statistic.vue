<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-blue-light" />
        <span class="logo-text">EMR System</span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item">
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
        <NuxtLink to="/dashboard/inventory" class="nav-item router-link-active">
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
        <div class="welcome-msg">
          <span class="breadcrumb">Supply Chain / Warehouse</span>
          <h1>Inventory Intelligence</h1>
          <p>Automated stock tracking and procurement forecasting.</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">
            <Icon name="lucide:file-text" /> Order History
          </button>
          <button class="add-btn" @click="openAddModal">
            <Icon name="lucide:plus" /> Add New Item
          </button>
        </div>
      </header>

      <div class="scroll-area">
        <section class="stats-row">
          <div v-for="stat in inventoryStats" :key="stat.label" class="stat-card">
            <div class="stat-meta">
              <span class="label">{{ stat.label }}</span>
              <Icon :name="stat.icon" class="stat-icon-mini" />
            </div>
            <div class="stat-body">
              <h3 class="value">{{ stat.value }}</h3>
              <span :class="['trend', stat.trendType]">{{ stat.trend }}</span>
            </div>
          </div>
        </section>

        <section class="inventory-section">
          <div class="panel-header">
            <div class="search-wrapper">
              <Icon name="lucide:search" class="search-icon" />
              <input v-model="searchQuery" type="text" placeholder="Search by SKU, Name, or Category..." />
            </div>
            <div class="filter-group">
              <select v-model="selectedCategory" class="minimal-select">
                <option value="All">All Categories</option>
                <option>Medication</option>
                <option>Equipment</option>
                <option>Disposables</option>
              </select>
              <button class="btn-icon" @click="resetFilters"><Icon name="lucide:rotate-ccw" /></button>
            </div>
          </div>

          <div class="table-container">
            <table class="clinical-table">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Quantity on Hand</th>
                  <th>Unit Price</th>
                  <th>Valuation</th>
                  <th>Availability</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredInventory" :key="item.id">
                  <td>
                    <div class="item-cell">
                      <div class="sku-badge">{{ item.category.substring(0, 3).toUpperCase() }}</div>
                      <div class="item-text">
                        <p class="i-name">{{ item.name }}</p>
                        <p class="i-sub">SKU-{{ 1000 + item.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="stock-cell">
                      <span class="main-stock">{{ item.stock }} {{ item.unit }}</span>
                      <div class="stock-progress"><div class="fill" :style="{ width: (item.stock / 5) + '%' }"></div></div>
                    </div>
                  </td>
                  <td>₱{{ item.price }}</td>
                  <td class="valuation">₱{{ (item.price.replace(',', '') * item.stock).toLocaleString() }}</td>
                  <td>
                    <span class="status-dot" :class="item.status.toLowerCase()"></span>
                    <span class="status-text">{{ item.status }}</span>
                  </td>
                  <td class="text-right">
                    <button class="btn-manage" @click="editItem(item)">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Update Stock Intelligence' : 'Register New Asset' }}</h3>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          <form @submit.prevent="handleSave" class="clinical-form">
            <div class="form-group full">
              <label>Item Description</label>
              <input type="text" v-model="newItem.name" placeholder="Official medical nomenclature..." required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select v-model="newItem.category">
                  <option>Medication</option>
                  <option>Equipment</option>
                  <option>Disposables</option>
                </select>
              </div>
              <div class="form-group">
                <label>Unit Type</label>
                <input type="text" v-model="newItem.unit" placeholder="vials, boxes..." required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Current Count</label>
                <input type="number" v-model="newItem.stock" required />
              </div>
              <div class="form-group">
                <label>Unit Price (₱)</label>
                <input type="number" step="0.01" v-model="newItem.price" required />
              </div>
            </div>
            <div class="modal-footer">
              <button v-if="isEditing" type="button" class="btn-danger" @click="deleteItem">Decommission</button>
              <div class="spacer"></div>
              <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-confirm">{{ isEditing ? 'Save Changes' : 'Add to Inventory' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('All')
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const inventoryStats = [
  { label: 'Total Valuation', value: '₱2.4M', trend: '+4.2%', trendType: 'up', icon: 'lucide:banknote' },
  { label: 'Low Stock Alerts', value: '14', trend: 'Critical', trendType: 'down', icon: 'lucide:alert-triangle' },
  { label: 'Expired (30d)', value: '3', trend: '-2', trendType: 'up', icon: 'lucide:calendar-x' },
  { label: 'Inventory Turnover', value: '84%', trend: 'Optimal', trendType: 'up', icon: 'lucide:refresh-cw' }
]

const newItem = ref({ name: '', category: 'Medication', stock: '', price: '', unit: 'pcs' })

const inventoryItems = ref([
  { id: 1, name: 'Amoxicillin 500mg', category: 'Medication', stock: 450, unit: 'caps', price: '25.00', status: 'In-Stock' },
  { id: 2, name: 'Surgical Gloves (M)', category: 'Disposables', stock: 12, unit: 'boxes', price: '750.00', status: 'Low-Stock' },
  { id: 3, name: 'Digital Thermometer', category: 'Equipment', stock: 0, unit: 'pcs', price: '1250.00', status: 'Out-of-Stock' },
  { id: 4, name: 'Paracetamol Syrup', category: 'Medication', stock: 85, unit: 'bottles', price: '210.00', status: 'In-Stock' },
])

const filteredInventory = computed(() => {
  return inventoryItems.value.filter(item => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = item.name.toLowerCase().includes(s)
    const matchesCat = selectedCategory.value === 'All' || item.category === selectedCategory.value
    return matchesSearch && matchesCat
  })
})

const resetFilters = () => { searchQuery.value = ''; selectedCategory.value = 'All' }
const openAddModal = () => { isEditing.value = false; newItem.value = { name: '', category: 'Medication', stock: '', price: '', unit: 'pcs' }; isModalOpen.value = true }
const editItem = (item) => { isEditing.value = true; editingId.value = item.id; newItem.value = { ...item }; isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false }
const handleSave = () => {
  const status = newItem.value.stock > 50 ? 'In-Stock' : (newItem.value.stock > 0 ? 'Low-Stock' : 'Out-of-Stock')
  if (isEditing.value) {
    const index = inventoryItems.value.findIndex(i => i.id === editingId.value)
    inventoryItems.value[index] = { ...newItem.value, status }
  } else {
    inventoryItems.value.push({ ...newItem.value, id: Date.now(), status })
  }
  closeModal()
}
</script>

<style scoped>
/* --- CONSISTENT LAYOUT CORE --- */
.dashboard-layout { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
.sidebar { width: 240px; background: #0f172a; padding: 1.5rem 1rem; display: flex; flex-direction: column; }
.sidebar-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 2.5rem; color: white; font-weight: 700; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.7rem 0.8rem; color: #94a3b8; text-decoration: none; font-size: 0.9rem; border-radius: 6px; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: white; }
.router-link-active { background: #1e293b; color: #3b82f6; box-shadow: inset 3px 0 0 #3b82f6; }

.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { background: white; padding: 1rem 2rem; border-bottom: 1px solid #e2e8f0; }
.breadcrumb { font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
.top-bar h1 { margin: 4px 0 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.top-bar p { margin: 2px 0 0; font-size: 0.85rem; color: #64748b; }
.scroll-area { padding: 1.5rem 2rem; overflow-y: auto; }

/* --- REALISTIC STATS ROW --- */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
.stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; }
.stat-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.stat-meta .label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
.stat-icon-mini { color: #3b82f6; opacity: 0.7; }
.stat-body { display: flex; justify-content: space-between; align-items: flex-end; }
.stat-body .value { font-size: 1.5rem; font-weight: 700; margin: 0; }
.trend { font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.trend.up { background: #dcfce7; color: #166534; }
.trend.down { background: #fee2e2; color: #991b1b; }

/* --- REFINED TABLE & PANELS --- */
.inventory-section { background: white; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.panel-header { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.search-wrapper { position: relative; width: 350px; }
.search-wrapper input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; outline: none; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1rem; }

.clinical-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.clinical-table th { text-align: left; padding: 12px 20px; background: #f8fafc; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
.clinical-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }

.item-cell { display: flex; align-items: center; gap: 12px; }
.sku-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; color: #475569; }
.i-name { font-weight: 600; color: #1e293b; margin: 0; }
.i-sub { font-size: 0.75rem; color: #94a3b8; margin: 0; }

.stock-progress { height: 4px; width: 100px; background: #f1f5f9; border-radius: 2px; margin-top: 6px; overflow: hidden; }
.stock-progress .fill { height: 100%; background: #3b82f6; }

.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
.status-dot.in-stock { background: #10b981; }
.status-dot.low-stock { background: #f59e0b; }
.status-dot.out-of-stock { background: #ef4444; }

/* --- MODAL REFINEMENT --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; width: 500px; border-radius: 12px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
.clinical-form label { display: block; font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; }
.clinical-form input, .clinical-form select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; margin-bottom: 1rem; font-size: 0.9rem; }
.modal-footer { display: flex; gap: 10px; margin-top: 1rem; }
.btn-confirm { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; flex: 1; }
.btn-cancel { background: #f1f5f9; color: #475569; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-danger { background: transparent; border: none; color: #ef4444; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
</style>