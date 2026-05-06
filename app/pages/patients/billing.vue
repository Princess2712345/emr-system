<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon" />
        <span class="logo-text">MyHealth<span class="text-blue-400">Portal</span></span>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/patients" class="nav-item">
          <Icon name="lucide:layout-dashboard" /> Dashboard
        </NuxtLink>
        <NuxtLink to="/patients/myappointments" class="nav-item">
          <Icon name="lucide:calendar-days" /> Appointments
        </NuxtLink>
        <NuxtLink to="/patients/lab-results" class="nav-item">
          <Icon name="lucide:file-heart" /> Health Records
        </NuxtLink>
        <NuxtLink to="/patients/billing" class="nav-item active">
          <Icon name="lucide:credit-card" /> Billing & Payments
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn clickable">
          <Icon name="lucide:log-out" /> Logout Account
        </button>
      </div>
    </aside>

    <main class="main-content">
      <!-- TOP BAR -->
      <header class="top-bar">
        <div class="header-info">
          <h1>Billing & Payments</h1>
          <p class="current-date">Manage your invoices and insurance coverage</p>
        </div>
        
        <div class="header-actions">
          <button class="add-btn clickable" @click="handleMakePayment">
            <Icon name="lucide:wallet" /> Quick Pay
          </button>
          <div class="profile-chip" @click="handleProfileClick">
            <div class="avatar-circle purple-theme">PRP</div>
          </div>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <!-- BILLING STATS BENTO -->
        <div class="bento-grid">
          <div class="bento-card highlight-card" @click="handleStatClick('Total Balance')">
            <label class="label-caps"><Icon name="lucide:alert-circle" /> Total Balance</label>
            <p class="main-val">₱2,450.00</p>
            <p class="sub-val">Due by May 20</p>
          </div>
          <div class="bento-card" @click="handleStatClick('Insurance Status')">
            <label class="label-caps"><Icon name="lucide:shield-check" /> Insurance</label>
            <p class="main-val-sm">PhilHealth Verified</p>
            <div class="trend-tag success">Active</div>
          </div>
          <div class="bento-card" @click="handleStatClick('Last Payment')">
            <label class="label-caps"><Icon name="lucide:receipt" /> Last Payment</label>
            <p class="main-val-sm">₱1,200.00</p>
            <p class="sub-val">April 15, 2026</p>
          </div>
          <div class="bento-card" @click="handleStatClick('Payment Method')">
            <label class="label-caps"><Icon name="lucide:credit-card" /> Auto-Pay</label>
            <p class="main-val-sm">GCash Enabled</p>
            <p class="sub-val">Ends in 2341</p>
          </div>
        </div>

        <div class="bottom-layout">
          <!-- INVOICE LIST -->
          <section class="content-card">
            <div class="card-header">
              <h3><Icon name="lucide:history" /> Statement History</h3>
              <div class="filter-tabs">
                <button 
                  v-for="tab in ['All', 'Unpaid', 'Paid']" 
                  :key="tab"
                  @click="billingFilter = tab"
                  :class="['tab', { active: billingFilter === tab }]"
                >
                  {{ tab }}
                </button>
              </div>
            </div>
            
            <div class="records-stack">
              <div v-for="(bill, index) in filteredBills" :key="index" class="record-item">
                <div class="record-icon-box" :class="bill.status === 'Paid' ? 'paid-icon' : 'unpaid-icon'">
                  <Icon :name="bill.status === 'Paid' ? 'lucide:check' : 'lucide:file-text'" />
                </div>
                
                <div class="record-main-info">
                  <div class="record-header">
                    <span class="record-title">{{ bill.service }}</span>
                    <span :class="['status-pill', bill.status.toLowerCase()]">
                      {{ bill.status }}
                    </span>
                  </div>
                  <div class="record-meta">
                    <span><Icon name="lucide:calendar" /> {{ bill.date }}</span>
                    <span><Icon name="lucide:hash" /> Invoice #{{ bill.invoiceNo }}</span>
                  </div>
                </div>

                <div class="record-actions">
                  <p class="bill-amount">{{ bill.amount }}</p>
                  <button v-if="bill.status === 'Unpaid'" class="btn-primary-sm" @click="handlePayInvoice(bill)">Pay Now</button>
                  <button class="icon-btn-more" @click="handleDownloadInvoice(bill)" title="Download Receipt">
                    <Icon name="lucide:download" />
                  </button>
                </div>
              </div>

              <div v-if="filteredBills.length === 0" class="empty-state">
                <p>No billing records found in this category.</p>
              </div>
            </div>
          </section>

          <!-- SIDEBAR WIDGETS -->
          <aside class="widget-stack">
            <div class="info-card-blue">
              <h4><Icon name="lucide:landmark" /> Financial Assistance</h4>
              <p class="widget-text">Facing difficulties? Explore our flexible payment plans or apply for medical subsidy.</p>
              <button class="widget-action" @click="handleAssistance">View Options</button>
            </div>

            <div class="content-card insurance-widget">
              <h4>Primary Coverage</h4>
              <div class="insurance-card-mini">
                <p class="ins-provider">PhilHealth / Maxicare</p>
                <p class="ins-id">ID: 0021-4452-1102</p>
                <div class="ins-badge">Active Policy</div>
              </div>
              <button class="btn-text-link" @click="handleUpdateInsurance">
                Update Coverage <Icon name="lucide:arrow-right" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- DATA ---
const billingFilter = ref('All')

const bills = ref([
  { id: 1, service: 'Routine Consultation (Dr. Santos)', date: 'May 01, 2026', invoiceNo: '88291', amount: '₱850.00', status: 'Unpaid' },
  { id: 2, service: 'Laboratory: CBC & Lipid Profile', date: 'April 20, 2026', invoiceNo: '88102', amount: '₱1,600.00', status: 'Unpaid' },
  { id: 3, service: 'Telemedicine Session', date: 'March 15, 2026', invoiceNo: '87544', amount: '₱500.00', status: 'Paid' },
  { id: 4, service: 'Annual Physical Exam Package', date: 'Jan 10, 2026', invoiceNo: '86221', amount: '₱3,200.00', status: 'Paid' }
])

// --- COMPUTED ---
const filteredBills = computed(() => {
  if (billingFilter.value === 'All') return bills.value
  return bills.value.filter(b => b.status === billingFilter.value)
})

// --- FUNCTIONS ---
const handleMakePayment = () => {
  alert('Redirecting to the Secure Payment Gateway...')
}

const handleProfileClick = () => {
  alert('Redirecting to Patient Profile Settings...')
}

const handleStatClick = (type) => {
  alert(`Detailed Breakdown for: ${type}`)
}

const handlePayInvoice = (bill) => {
  alert(`Proceeding to pay ${bill.amount} for ${bill.service}.`)
}

const handleDownloadInvoice = (bill) => {
  alert(`Downloading Invoice #${bill.invoiceNo} as PDF...`)
}

const handleAssistance = () => {
  alert('Opening Financial Counseling & Subsidy Request form.')
}

const handleUpdateInsurance = () => {
  alert('Please upload a clear photo of your new HMO or Government ID.')
}

const handleLogout = () => {
  if (confirm('Log out from MyHealth Portal?')) {
    console.log('Logged out')
  }
}
</script>

<style scoped>
/* REUSING CORE STYLES */
.dashboard-layout { display: flex; height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; height: 100vh; flex-shrink: 0; z-index: 50; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s; }
.nav-item.active { background: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.main-content { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; }
.top-bar { background: white; padding: 1.2rem 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
.top-bar h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.add-btn { background: #2563eb; color: white; border: none; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; }

.scrollable-body { padding: 2rem 2.5rem; }
.bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2rem; }
.bento-card { background: white; padding: 1.5rem; border-radius: 18px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s; }
.bento-card:hover { border-color: #2563eb; transform: translateY(-2px); }
.highlight-card { background: #1e3a8a; color: white; border: none; }
.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.main-val { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0; }
.main-val-sm { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
.highlight-card .main-val { color: white; }
.trend-tag.success { background: #dcfce7; color: #166534; font-size: 0.7rem; padding: 2px 8px; border-radius: 5px; margin-top: 8px; display: inline-block; font-weight: 700; }

.bottom-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.content-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; }

/* BILLING SPECIFIC */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.records-stack { display: flex; flex-direction: column; gap: 1rem; }
.record-item { display: flex; align-items: center; padding: 1.2rem; border-radius: 16px; border: 1px solid #f1f5f9; background: #fafafa; gap: 1.2rem; }
.record-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.paid-icon { background: #dcfce7; color: #166534; }
.unpaid-icon { background: #fff7ed; color: #c2410c; }

.record-main-info { flex: 1; }
.record-title { font-weight: 700; color: #1e3a8a; font-size: 1rem; }
.status-pill { font-size: 0.65rem; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; margin-left: 10px; }
.status-pill.unpaid { background: #fee2e2; color: #b91c1c; }
.status-pill.paid { background: #dcfce7; color: #166534; }

.record-actions { display: flex; align-items: center; gap: 15px; }
.bill-amount { font-weight: 800; color: #1e293b; font-size: 1rem; }
.btn-primary-sm { background: #2563eb; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; }

/* WIDGETS */
.info-card-blue { background: #1e3a8a; color: white; padding: 1.5rem; border-radius: 20px; }
.widget-text { font-size: 0.85rem; opacity: 0.8; line-height: 1.5; margin: 10px 0 1.5rem 0; }
.widget-action { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; }

.insurance-card-mini { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1rem; }
.ins-provider { font-weight: 800; color: #1e293b; margin: 0; }
.ins-id { font-size: 0.8rem; color: #64748b; margin: 4px 0 8px 0; }
.ins-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }

.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 5px; }

.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>