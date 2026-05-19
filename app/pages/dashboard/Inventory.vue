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
          <h1>Inventory Management</h1>
          <p>Monitor medical supplies, equipment stock levels, and procurement alerts.</p>
        </div>
        <div class="header-actions">
          <button class="add-btn clickable" @click="openAddModal">
            <Icon name="lucide:plus" /> Add New Item
          </button>
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
            <button class="filter-btn clickable" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" size="16" /> Reset
            </button>
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
              <tr v-for="item in filteredInventory" :key="item.id" class="table-row">
                <td>
                  <div class="item-info">
                    <div class="category-badge" :class="item.status.toLowerCase()">
                      {{ item.category.charAt(0) }}
                    </div>
                    <div>
                      <p class="i-name">{{ item.name }}</p>
                      <p class="i-subtext">ID: SKU-{{ item.id.substring(0, 8).toUpperCase() }}</p>
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
                  <button class="view-link clickable" @click="editItem(item)">
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
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Manage Inventory Item' : 'Add New Inventory Item' }}</h3>
            <button class="close-modal" @click="closeModal">&times;</button>
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
            <div class="form-row">
              <div class="form-group">
                <label>Unit Price (₱)</label>
                <input type="number" step="0.01" v-model="newItem.price" placeholder="0.00" required />
              </div>
              <div class="form-group">
                <label>Unit Type</label>
                <input type="text" v-model="newItem.unit" placeholder="pcs, caps, boxes" required />
              </div>
            </div>
            <div class="modal-actions">
              <div class="left-actions">
                <button v-if="isEditing" type="button" class="btn-delete clickable" @click="deleteItem">
                  <Icon name="lucide:trash-2" /> Delete Item
                </button>
              </div>
              <div class="right-actions">
                <button type="button" class="btn-secondary clickable" @click="closeModal">Cancel</button>
                <button type="submit" class="add-btn clickable">
                  {{ isEditing ? 'Update Stock' : 'Add to Stock' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const isCollapsed = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('All')
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const navLinks = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
  { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
  { to: '/dashboard/registration', icon: 'lucide:user-plus', label: 'Registration' },
  { to: '/dashboard/Disposition', icon: 'lucide:file-output', label: 'Disposition' },
  { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
  { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
  { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
  { to: '/dashboard/History', icon: 'lucide:history', label: 'History' },
]

const newItem = ref({
  name: '',
  category: 'Medication',
  stock: '',
  price: '',
  unit: 'pcs'
})

// --- Live Pipeline Data Stream ---
const { data: inventoryItems, refresh: reloadInventory } = await useFetch('/api/inventory', {
  key: 'inventory-live-feed',
  query: { search: searchQuery }
})

// Refetches whenever the client uses search bars
watch(searchQuery, () => {
  reloadInventory()
})

// Process local grouping selection categories across our upstream responses
const filteredInventory = computed(() => {
  if (!inventoryItems.value) return [];
  return inventoryItems.value.filter(item => {
    return selectedCategory.value === 'All' || item.category === selectedCategory.value
  })
})

const resetFilters = () => { searchQuery.value = ''; selectedCategory.value = 'All'; }
const openAddModal = () => { isEditing.value = false; newItem.value = { name: '', category: 'Medication', stock: '', price: '', unit: 'pcs' }; isModalOpen.value = true; }

const editItem = (item) => { 
  isEditing.value = true; 
  editingId.value = item.id; 
  // Parse standard localized numeric strings back to basic inputs for editing forms cleanly
  newItem.value = { 
    ...item, 
    price: typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price 
  }; 
  isModalOpen.value = true; 
}

const closeModal = () => { isModalOpen.value = false; isEditing.value = false; editingId.value = null; }

// --- Database Mutation Handles ---
const handleSave = async () => {
  try {
    const targetEndpoint = isEditing.value ? `/api/inventory/${editingId.value}` : '/api/inventory/new'
    const targetMethod = isEditing.value ? 'PUT' : 'POST'

    await $fetch(targetEndpoint, {
      method: targetMethod,
      body: newItem.value
    })

    alert(isEditing.value ? 'Inventory stock updates saved.' : 'New stock entry added to system core registry.')
    await reloadInventory()
    closeModal()
  } catch (err) {
    console.error(err)
    alert('Failed to execute item data update mutations.')
  }
}

const deleteItem = async () => {
  if (confirm(`Are you sure you want to remove ${newItem.value.name} from the inventory?`)) {
    try {
      await $fetch(`/api/inventory/${editingId.value}`, {
        method: 'DELETE'
      })
      alert('Supply item cleanly dropped from catalog indexes.')
      await reloadInventory()
      closeModal()
    } catch (err) {
      console.error(err)
      alert('Failed to safely drop the requested logistics registry profile.')
    }
  }
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    const token = useCookie('auth_token'); token.value = null;
    if (process.client) { localStorage.removeItem('user_data'); sessionStorage.clear(); }
    await navigateTo('/auth/login');
  }
}
</script>

<style scoped>
/* --- CORE LAYOUT & SIDEBAR --- */
.dashboard-layout { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; overflow: hidden; }

.sidebar { 
  width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; 
  padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 100; 
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }

.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }

.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }

.menu-toggle {
  background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; 
  display: flex; cursor: pointer; transition: background 0.2s;
}

.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }

.nav-item { 
  position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; 
}

.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(4px); }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { transform: none; }

.router-link-active { background: #2563eb !important; color: white !important; }

.sidebar-tooltip {
  position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; 
  padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; 
  transition: all 0.2s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 1000;
}
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { 
  background: none; border: none; width: 100%; text-align: left; color: #fca5a5; 
  font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  position: relative; transition: all 0.2s ease;
}
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px); }
.is-collapsed .logout-btn { justify-content: center; }
.is-collapsed .logout-btn:hover { transform: none; }
.logout-btn:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }

/* MAIN CONTENT */
.main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.top-bar { background: white; padding: 1.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 800; }
.inventory-body { flex: 1; overflow-y: auto; padding: 2rem 2.5rem; }

/* CONTROLS */
.table-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1.5rem; }
.search-wrapper { position: relative; flex: 1; max-width: 500px; }
.search-wrapper input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; background: white; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }

.filter-group { display: flex; align-items: center; gap: 0.75rem; }
.filter-dropdown { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; background: white; color: #475569; font-weight: 500; outline: none; min-width: 160px; cursor: pointer; }
.filter-btn { display: flex; align-items: center; gap: 6px; background: #f1f5f9; color: #475569; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; white-space: nowrap; }
.filter-btn:hover { background: #e2e8f0; color: #1e3a8a; }

/* TABLE STYLING */
.table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
.inventory-table { width: 100%; border-collapse: collapse; }
.inventory-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.inventory-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
.i-name { font-weight: 700; margin: 0; color: #1e293b; }
.i-subtext { font-size: 0.75rem; color: #64748b; margin: 0; }
.stock-info { display: flex; flex-direction: column; }
.main-stock { font-weight: 700; color: #1e293b; }
.sub-stock { font-size: 0.7rem; color: #94a3b8; }
.text-right { text-align: right; }

/* BADGES */
.category-badge { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.category-badge.in-stock { background: #dcfce7; color: #15803d; }
.category-badge.low-stock { background: #fef3c7; color: #b45309; }
.category-badge.out-of-stock { background: #fee2e2; color: #991b1b; }
.price-tag { background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-weight: 700; color: #1e3a8a; font-size: 0.85rem; }
.badge { padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.badge.in-stock { background: #dcfce7; color: #166534; }
.badge.low-stock { background: #fef3c7; color: #92400e; }
.badge.out-of-stock { background: #fee2e2; color: #991b1b; }

/* BUTTONS */
.add-btn { background: #1e3a8a; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.add-btn:hover { background: #1e40af; }
.view-link { color: #2563eb; background: #eff6ff; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; }
.view-link:hover { background: #2563eb; color: white; }

/* MODAL STYLING */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 480px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { color: #1e3a8a; font-weight: 800; margin: 0; }
.close-modal { background: none; border: none; font-size: 1.5rem; color: #64748b; cursor: pointer; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 4px; }
.form-group input, .modal-select { width: 100%; padding: 0.7rem; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; }
.form-group input:focus, .modal-select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }

.modal-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.right-actions { display: flex; gap: 0.75rem; }

.btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 0.7rem 1.2rem; border-radius: 8px; font-weight: 600; }
.btn-secondary:hover { background: #e2e8f0; }

.btn-delete { background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; padding: 0.7rem 1rem; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.btn-delete:hover { background: #be123c; color: white; }

.clickable { cursor: pointer; transition: 0.2s; }
.clickable:active { transform: scale(0.97); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>