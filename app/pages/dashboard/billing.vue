<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed }">
    <!-- SIDEBAR (Synced with other pages) -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!isCollapsed">
          <Icon name="mdi:hospital-building" class="icon-blue-light" />
          <span class="logo-text">EMR System</span>
        </div>
        <!-- HAMBURGER TOGGLE -->
        <button class="menu-toggle clickable" @click="isCollapsed = !isCollapsed">
          <Icon :name="isCollapsed ? 'lucide:menu' : 'lucide:chevron-left'" />
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="nav-item">
          <Icon :name="link.icon" />
          <span v-if="!isCollapsed" class="nav-label">{{ link.label }}</span>
          <!-- Floating Tooltip for Collapsed State -->
          <span v-if="isCollapsed" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed">Logout</span>
          <!-- Floating Tooltip for Collapsed State -->
          <span v-if="isCollapsed" class="sidebar-tooltip">Logout</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-msg">
          <h1>Statement of Account</h1>
          <p>Manage patient billing, insurance claims, and payment processing.</p>
        </div>
        <div class="header-actions">
          <button class="add-btn clickable" @click="isModalOpen = true">
            <Icon name="lucide:plus" /> Create New Invoice
          </button>
        </div>
      </header>

      <section class="billing-body">
        <div class="billing-stats">
          <div class="b-stat-card blue">
            <span class="b-label">Total Outstanding</span>
            <p class="b-value">₱42,500.00</p>
          </div>
          <div class="b-stat-card orange">
            <span class="b-label">Pending Insurance</span>
            <p class="b-value">₱12,840.00</p>
          </div>
          <div class="b-stat-card green">
            <span class="b-label">Collected (Month)</span>
            <p class="b-value">₱85,200.00</p>
          </div>
        </div>

        <div class="table-controls">
          <div class="search-wrapper">
            <Icon name="lucide:search" class="search-icon-svg" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by Invoice ID or Patient Name..." 
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedStatus" class="filter-dropdown">
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
            <button class="filter-btn clickable" @click="resetFilters">
              <Icon name="lucide:rotate-ccw" /> Reset
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="billing-table">
            <thead>
              <tr>
                <th>Invoice & Patient</th>
                <th>Total Amount</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in filteredInvoices" :key="invoice.id">
                <td>
                  <div class="invoice-info">
                    <div class="inv-icon">
                      <Icon name="lucide:file-text" />
                    </div>
                    <div>
                      <p class="inv-id">{{ invoice.id }}</p>
                      <p class="p-name">{{ invoice.patientName }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="amt-total">{{ invoice.total }}</span></td>
                <td>
                  <span class="amt-balance" :class="{ 'has-balance': invoice.balance !== '₱0.00' }">
                    {{ invoice.balance }}
                  </span>
                </td>
                <td>{{ invoice.dueDate }}</td>
                <td>
                  <span class="badge" :class="invoice.status.toLowerCase()">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-btns">
                    <button class="icon-btn clickable" title="Download PDF" @click="downloadInvoice(invoice)">
                      <Icon name="lucide:download" />
                    </button>
                    <button class="view-link clickable" @click="recordPayment(invoice)">Pay</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- MODAL (Synced) -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Generate New Statement</h3>
            <button class="close-modal clickable" @click="isModalOpen = false">
              <Icon name="lucide:x" />
            </button>
          </div>
          <form @submit.prevent="handleInvoice">
            <div class="form-group">
              <label>Select Patient</label>
              <input type="text" placeholder="Type name or ID..." required />
            </div>
            <div class="form-group">
              <label>Billing Items</label>
              <div class="item-list">
                 <input type="text" placeholder="Consultation Fee" readonly />
                 <input type="text" placeholder="₱150.00" readonly />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary clickable" @click="isModalOpen = false">Cancel</button>
              <button type="submit" class="add-btn clickable">Create Statement</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Layout State
const isCollapsed = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('All')
const isModalOpen = ref(false)

const navLinks = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
  { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
  { to: '/dashboard/registration', icon: 'mdi:account-plus', label: 'Registration' },
  { to: '/dashboard/Disposition', icon: 'lucide:file-output', label: 'Disposition' },
  { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
  { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
  { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
  { to: '/dashboard/History', icon: 'lucide:history', label: 'History' },
]

const invoices = ref([
  { id: '#INV-2045', patientName: 'John Doe', total: '₱1,250.00', balance: '₱0.00', dueDate: 'Oct 24, 2023', status: 'Paid' },
  { id: '#INV-1192', patientName: 'Alice Smith', total: '₱3,400.00', balance: '₱1,400.00', dueDate: 'Nov 05, 2023', status: 'Partial' },
  { id: '#INV-8830', patientName: 'Robert Johnson', total: '₱850.00', balance: '₱850.00', dueDate: 'Oct 15, 2023', status: 'Unpaid' },
  { id: '#INV-5562', patientName: 'Michael Chen', total: '₱150.00', balance: '₱0.00', dueDate: 'Oct 20, 2023', status: 'Paid' }
])

const filteredInvoices = computed(() => {
  return invoices.value.filter(i => {
    const s = searchQuery.value.toLowerCase()
    const matchesSearch = i.patientName.toLowerCase().includes(s) || i.id.toLowerCase().includes(s)
    const matchesStatus = selectedStatus.value === 'All' || i.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const downloadInvoice = (inv) => alert(`Downloading Invoice ${inv.id}...`)
const recordPayment = (inv) => alert(`Opening payment gateway for ${inv.patientName}...`)
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }
const handleInvoice = () => { alert('Invoice generated successfully.'); isModalOpen.value = false }

const handleLogout = async () => {
  if (confirm('Are you sure you want to log out?')) {
    try {
      const token = useCookie('auth_token')
      token.value = null
      if (process.client) {
        localStorage.clear()
        sessionStorage.clear()
      }
      await navigateTo('/auth/login') 
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}
</script>

<style scoped>
/* --- CORE LAYOUT & SIDEBAR (Synced) --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }

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
/* SIDEBAR FOOTER */
.sidebar-footer { 
  padding-top: 1rem; 
  border-top: 1px solid rgba(255, 255, 255, 0.1); 
}

.logout-btn { 
  background: none; 
  border: none; 
  width: 100%; 
  text-align: left; 
  color: #fca5a5; 
  font-weight: 600; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  padding: 0.8rem 1rem; 
  position: relative; /* Necessary for tooltip positioning */
  transition: all 0.2s ease;
}

.logout-btn:hover { 
  background: rgba(252, 165, 165, 0.1); 
  color: #f87171; 
  transform: translateX(5px); 
}

/* Center icon and handle hover when sidebar is collapsed */
.is-collapsed .logout-btn { 
  justify-content: center; 
}

.is-collapsed .logout-btn:hover { 
  transform: none; /* Prevent sliding when collapsed */
}

/* Trigger tooltip visibility on hover when collapsed */
.logout-btn:hover .sidebar-tooltip { 
  opacity: 1; 
  margin-left: 10px; 
}

/* --- MAIN CONTENT AREA --- */
.main-content { flex: 1; display: flex; flex-direction: column; width: 100%; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }
.billing-body { padding: 2.5rem 3rem; width: 100%; box-sizing: border-box; }

/* --- FINANCIAL STATS --- */
.billing-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }

@keyframes fadeInUp {
  from { opacity: 0; margin-top: 20px; }
  to { opacity: 1; margin-top: 0px; }
}

.b-stat-card { 
  padding: 1.5rem; 
  border-radius: 16px; 
  color: white; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  cursor: pointer;
  transform: translateY(0);
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
}

.b-stat-card.blue { background: linear-gradient(135deg, #3b82f6, #1e3a8a); animation-delay: 0.1s; }
.b-stat-card.orange { background: linear-gradient(135deg, #f59e0b, #d97706); animation-delay: 0.2s; }
.b-stat-card.green { background: linear-gradient(135deg, #10b981, #059669); animation-delay: 0.3s; }

.b-stat-card:hover { transform: translateY(-5px); filter: brightness(90%); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
.b-label { font-size: 0.85rem; opacity: 0.9; text-transform: uppercase; font-weight: 600; }
.b-value { font-size: 1.8rem; font-weight: 800; margin: 5px 0 0; }

/* --- TABLE CONTROLS --- */
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 2rem; }
.search-wrapper { position: relative; flex: 1; max-width: 600px; display: flex; align-items: center; }
.search-wrapper input { width: 100%; padding: 0.85rem 1rem 0.85rem 3rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; background: white; font-size: 0.95rem; }
.search-icon-svg { position: absolute; left: 15px; color: #94a3b8; font-size: 1.2rem; }
.filter-group { display: flex; gap: 12px; }
.filter-dropdown, .filter-btn { padding: 0 1.2rem; height: 48px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #475569; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }

/* --- DATA TABLE --- */
.table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); overflow: hidden; }
.billing-table { width: 100%; border-collapse: collapse; }
.billing-table th { background-color: #f8fafc; padding: 1.2rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.billing-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.invoice-info { display: flex; align-items: center; gap: 12px; }
.inv-icon { font-size: 1.2rem; background: #f8fafc; padding: 8px; border-radius: 8px; color: #1e3a8a; display: flex; align-items: center; justify-content: center; }
.inv-id { font-weight: 700; color: #1e3a8a; margin: 0; font-family: monospace; }
.p-name { color: #64748b; margin: 0; font-size: 0.9rem; }

.amt-total { font-weight: 600; color: #1e293b; }
.amt-balance.has-balance { color: #ef4444; font-weight: 700; }

/* --- STATUS BADGES --- */
.badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
.badge.paid { background: #dcfce7; color: #15803d; }
.badge.unpaid { background: #fee2e2; color: #b91c1c; }
.badge.partial { background: #fef3c7; color: #b45309; }

/* --- BUTTONS --- */
.action-btns { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; transition: 0.2s; color: #64748b; }
.icon-btn:hover { background: #e2e8f0; color: #1e3a8a; }
.view-link { color: white; background: #2563eb; padding: 0.5rem 1.2rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
.view-link:hover { background: #1e40af; }
.add-btn { background-color: #2563eb; color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.text-right { text-align: right; }

/* --- MODAL --- */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-content { background: white; width: 480px; border-radius: 20px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.close-modal { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; display: flex; align-items: center; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }
.item-list { display: flex; gap: 10px; }
.item-list input { flex: 1; background: #f8fafc; color: #64748b; font-weight: 600; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 1.5rem; }
.btn-secondary { background: #f1f5f9; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }

.clickable { cursor: pointer; transition: all 0.2s ease; }
.clickable:active { transform: scale(0.96); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>