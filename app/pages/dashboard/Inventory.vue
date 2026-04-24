<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="icon-white" />
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
        <NuxtLink to="/dashboard/inventory" class="nav-item active">
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
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" /> Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Inventory Management</h1>
          <p>Monitor medical supplies, equipment stock levels, and procurement alerts.</p>
        </div>
        <div class="header-actions">
          <button class="add-btn" @click="isModalOpen = true">+ Add New Item</button>
        </div>
      </header>

      <section class="inventory-body">
        <div class="table-controls">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by item name, category, or SKU..." 
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedCategory" class="filter-dropdown">
              <option value="All">All Categories</option>
              <option value="Medication">Medication</option>
              <option value="Equipment">Equipment</option>
              <option value="Disposables">Disposables</option>
            </select>
            <button class="filter-btn" @click="resetFilters">Reset</button>
          </div>
        </div>

        <div class="table-container">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Item & Category</th>
                <th>Stock Level</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredInventory" :key="item.id">
                <td>
                  <div class="item-info">
                    <div class="category-badge" :class="item.status.toLowerCase()">
                      {{ item.category.charAt(0) }}
                    </div>
                    <div>
                      <p class="i-name">{{ item.name }}</p>
                      <p class="i-subtext">ID: SKU-00{{ item.id }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="stock-info">
                    <span class="main-stock">{{ item.stock }} {{ item.unit }}</span>
                    <span class="sub-stock">Min. Req: 50</span>
                  </div>
                </td>
                <td><span class="price-tag">₱{{ item.price }}</span></td>
                <td>
                  <span class="badge" :class="item.status.toLowerCase()">
                    {{ item.status.replace('-', ' ') }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="view-link" @click="editItem(item)">
                    Manage
                  </button>
                </td>
              </tr>
              
              <tr v-if="filteredInventory.length === 0">
                <td colspan="5" class="empty-state">No inventory items found matching your search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add New Inventory Item</h3>
            <button class="close-modal" @click="isModalOpen = false">&times;</button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="form-group">
              <label>Item Name</label>
              <input type="text" v-model="newItem.name" placeholder="e.g. Amoxicillin" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select v-model="newItem.category" class="modal-select">
                  <option>Medication</option>
                  <option>Equipment</option>
                  <option>Disposables</option>
                  <option>Supplies</option>
                </select>
              </div>
              <div class="form-group">
                <label>Stock Quantity</label>
                <input type="number" v-model="newItem.stock" placeholder="0" required />
              </div>
            </div>
            <div class="form-group">
              <label>Unit Price (₱)</label>
              <input type="number" step="0.01" v-model="newItem.price" placeholder="0.00" required />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn">Add to Stock</button>
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

const newItem = ref({
  name: '',
  category: 'Medication',
  stock: '',
  price: '',
  unit: 'pcs'
})

const inventoryItems = ref([
  { id: 1, name: 'Amoxicillin 500mg', category: 'Medication', stock: 450, unit: 'caps', price: '25.00', status: 'In-Stock' },
  { id: 2, name: 'Surgical Gloves (M)', category: 'Disposables', stock: 12, unit: 'boxes', price: '750.00', status: 'Low-Stock' },
  { id: 3, name: 'Digital Thermometer', category: 'Equipment', stock: 0, unit: 'pcs', price: '1,250.00', status: 'Out-of-Stock' },
  { id: 4, name: 'Paracetamol Syrup', category: 'Medication', stock: 85, unit: 'bottles', price: '210.00', status: 'In-Stock' },
])

const filteredInventory = computed(() => {
  return inventoryItems.value.filter(item => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = item.name.toLowerCase().includes(s) || item.category.toLowerCase().includes(s)
    const matchesCat = selectedCategory.value === 'All' || item.category === selectedCategory.value
    return matchesSearch && matchesCat
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
}

const handleSave = () => {
  const status = newItem.value.stock > 50 ? 'In-Stock' : (newItem.value.stock > 0 ? 'Low-Stock' : 'Out-of-Stock')
  inventoryItems.value.push({ ...newItem.value, id: Date.now(), status })
  isModalOpen.value = false
  newItem.value = { name: '', category: 'Medication', stock: '', price: '', unit: 'pcs' }
}

const editItem = (item) => {
  alert(`Opening management panel for: ${item.name}`)
}
</script>

<style scoped>
/* --- CORE LAYOUT --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, sans-serif; }

/* --- SIDEBAR --- */
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; position: sticky; top: 0; z-index: 10; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.icon-white { color: white; font-size: 1.6rem; }

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

/* --- MAIN CONTENT & TOP BAR --- */
.main-content { flex: 1; display: flex; flex-direction: column; width: 100%; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.8rem; color: #1e3a8a; margin: 0; }
.top-bar p { color: #64748b; margin-top: 4px; }
.inventory-body { padding: 2.5rem 3rem; width: 100%; box-sizing: border-box; }

/* --- CONTROLS --- */
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 2rem; }
.search-wrapper { position: relative; flex: 1; max-width: 600px; }
.search-wrapper input { width: 100%; padding: 0.85rem 1rem 0.85rem 3rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; background: white; font-size: 0.95rem; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); }
.filter-group { display: flex; gap: 12px; }
.filter-dropdown, .filter-btn { padding: 0 1.2rem; height: 48px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #475569; font-weight: 600; cursor: pointer; }

/* --- TABLE --- */
.table-container { background: white; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; overflow: hidden; }
.inventory-table { width: 100%; border-collapse: collapse; }
.inventory-table th { background-color: #f8fafc; padding: 1.2rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.inventory-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.item-info { display: flex; align-items: center; gap: 16px; }
.category-badge { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }
.category-badge.in-stock { background: #dcfce7; color: #15803d; }
.category-badge.low-stock { background: #fef3c7; color: #b45309; }
.category-badge.out-of-stock { background: #fee2e2; color: #991b1b; }

.i-name { font-weight: 700; color: #1e293b; margin: 0; font-size: 1rem; }
.i-subtext { font-size: 0.8rem; color: #94a3b8; margin: 0; }

.stock-info { display: flex; flex-direction: column; }
.main-stock { font-weight: 600; color: #334155; }
.sub-stock { font-size: 0.75rem; color: #94a3b8; }

.price-tag { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; color: #1e3a8a; }

/* --- STATUS BADGES --- */
.badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; display: inline-block; }
.badge.in-stock { background: #dcfce7; color: #15803d; }
.badge.low-stock { background: #fef3c7; color: #b45309; }
.badge.out-of-stock { background: #fee2e2; color: #991b1b; }

/* --- BUTTONS --- */
.view-link { color: #2563eb; background: #eff6ff; border: 1px solid #dbeafe; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.view-link:hover { background: #2563eb; color: white; }
.add-btn { background-color: #2563eb; color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 12px; font-weight: 700; cursor: pointer; }
.text-right { text-align: right; }
.empty-state { text-align: center; color: #94a3b8; padding: 4rem !important; font-style: italic; }

/* --- MODAL --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 500px; border-radius: 20px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
.form-group { margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input, .modal-select { width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1.5rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>