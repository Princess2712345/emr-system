<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR: Standardized with standard portal navigation -->
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
        <NuxtLink to="/patients/billing" class="nav-item">
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
      <!-- TOP BAR: Consistent with the Profile and Action alignment -->
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
        <!-- BILLING STATS BENTO: Standard 4-Column Grid -->
        <div class="bento-grid">
          <div class="bento-card highlight-card" @click="handleStatClick('Total Balance')">
            <label class="label-caps"><Icon name="lucide:alert-circle" /> Total Balance</label>
            <p class="main-val">₱2,450.00</p>
            <p class="sub-val">Due by May 20, 2026</p>
          </div>
          <div class="bento-card" @click="handleStatClick('Insurance Status')">
            <label class="label-caps"><Icon name="lucide:shield-check" /> Insurance</label>
            <p class="main-val-sm">PhilHealth Verified</p>
            <div class="trend-tag success">Active Coverage</div>
          </div>
          <div class="bento-card" @click="handleStatClick('Last Payment')">
            <label class="label-caps"><Icon name="lucide:receipt" /> Last Payment</label>
            <p class="main-val-sm">₱1,200.00</p>
            <p class="sub-val">Processed April 15</p>
          </div>
          <div class="bento-card" @click="handleStatClick('Payment Method')">
            <label class="label-caps"><Icon name="lucide:credit-card" /> Auto-Pay</label>
            <p class="main-val-sm">GCash Enabled</p>
            <p class="sub-val">Linked: **** 2341</p>
          </div>
        </div>

        <!-- 2-COLUMN MAIN LAYOUT -->
        <div class="bottom-layout">
          <!-- LEFT: INVOICE LIST -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-title-group">
                <h3><Icon name="lucide:history" /> Statement History</h3>
              </div>
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
              <div v-for="bill in filteredBills" :key="bill.id" class="record-item" :class="{ 'item-paid': bill.status === 'Paid' }">
                <div class="record-icon-box" :class="bill.status === 'Paid' ? 'paid-icon' : 'unpaid-icon'">
                  <Icon :name="bill.status === 'Paid' ? 'lucide:badge-check' : 'lucide:file-warning'" />
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
                    <span><Icon name="lucide:hash" /> INV-{{ bill.invoiceNo }}</span>
                  </div>
                </div>

                <div class="record-actions">
                  <p class="bill-amount" :class="{ 'text-muted': bill.status === 'Paid' }">{{ bill.amount }}</p>
                  
                  <button v-if="bill.status === 'Unpaid'" class="btn-primary-sm" @click="handlePayInvoice(bill)">
                    Pay Now
                  </button>
                  <button v-else class="btn-receipt-sm" @click="handleDownloadInvoice(bill)">
                    <Icon name="lucide:receipt-text" /> Receipt
                  </button>

                  <button class="icon-btn-more" @click="handleDownloadInvoice(bill)">
                    <Icon name="lucide:download" />
                  </button>
                </div>
              </div>

              <div v-if="filteredBills.length === 0" class="empty-state">
                <Icon name="lucide:search-x" class="empty-icon" />
                <p>No billing records found for this category.</p>
              </div>
            </div>
          </section>

          <!-- RIGHT: WIDGET STACK -->
          <aside class="widget-stack">
            <div class="info-card-blue">
              <h4><Icon name="lucide:landmark" /> Financial Assistance</h4>
              <p class="widget-text">Explore 0% interest installment plans or request a medical subsidy evaluation.</p>
              <button class="widget-action" @click="handleAssistance">Explore Options</button>
            </div>

            <div class="content-card insurance-widget">
              <h4>Primary Coverage</h4>
              <div class="insurance-card-mini">
                <p class="ins-provider">PhilHealth / Maxicare</p>
                <p class="ins-id">ID: 0021-4452-1102</p>
                <div class="ins-badge">Verified Active</div>
              </div>
              <button class="btn-text-link" @click="handleUpdateInsurance">
                Update Insurance <Icon name="lucide:arrow-right" />
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

const billingFilter = ref('All')

const bills = ref([
  { id: 1, service: 'Routine Consultation (Dr. Santos)', date: 'May 01, 2026', invoiceNo: '88291', amount: '₱850.00', status: 'Unpaid' },
  { id: 2, service: 'Laboratory: CBC & Lipid Profile', date: 'April 20, 2026', invoiceNo: '88102', amount: '₱1,600.00', status: 'Unpaid' },
  { id: 3, service: 'Telemedicine Session', date: 'March 15, 2026', invoiceNo: '87544', amount: '₱500.00', status: 'Paid' },
  { id: 4, service: 'Annual Physical Exam Package', date: 'Jan 10, 2026', invoiceNo: '86221', amount: '₱3,200.00', status: 'Paid' }
])

const filteredBills = computed(() => {
  if (billingFilter.value === 'All') return bills.value
  return bills.value.filter(b => b.status === billingFilter.value)
})

const handleMakePayment = () => alert('Redirecting to Secure Payment Portal...')
const handleProfileClick = () => alert('Accessing Profile Settings...')
const handleStatClick = (type) => alert(`Detail view for: ${type}`)
const handlePayInvoice = (bill) => alert(`Processing payment for: ${bill.service}`)
const handleDownloadInvoice = (bill) => alert(`Generating INV-${bill.invoiceNo}.pdf...`)
const handleAssistance = () => alert('Opening Financial Aid Portal...')
const handleUpdateInsurance = () => alert('Upload your new Health Card/ID...')

const handleLogout = () => {
  if (confirm('Sign out from MyHealth Portal?')) {
    // navigateTo is a Nuxt utility
    navigateTo('/auth/login')
  }
}

const printRecord = () => { window.print() }
</script>


<style scoped>
/* REUSABLE BASE STYLES */
.dashboard-layout { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }

/* SIDEBAR: Universal Style */
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 2rem 1.5rem; flex-shrink: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.25rem; font-weight: 800; margin-bottom: 3rem; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { 
  display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; 
  color: #bfdbfe; text-decoration: none; border-radius: 12px; font-weight: 500; 
  transition: 0.2s ease; 
}
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; transform: translateX(5px); }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }

.sidebar-footer { padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; }

/* MAIN CONTENT & TOP BAR */
.main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
.top-bar { 
  background: white; padding: 1.2rem 2.5rem; display: flex; 
  justify-content: space-between; align-items: center; 
  border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; 
}
.header-actions { display: flex; align-items: center; gap: 1.2rem; }
.add-btn { 
  background: #2563eb; color: white; border: none; padding: 0.75rem 1.4rem; 
  border-radius: 10px; font-weight: 700; display: flex; align-items: center; 
  gap: 10px; font-size: 0.85rem; cursor: pointer; 
}
.avatar-circle { 
  width: 44px; height: 44px; border-radius: 50%; display: flex; 
  align-items: center; justify-content: center; font-weight: 800; cursor: pointer;
}
.purple-theme { background: #f3e8ff; color: #7e22ce; border: 2px solid #e9d5ff; }

/* BENTO GRID */
.scrollable-body { padding: 2rem 2.5rem; }
.bento-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 2.5rem; }
.bento-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; }
.bento-card:hover { border-color: #2563eb; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.highlight-card { background: #1e3a8a; color: white; border: none; }
.main-val { font-size: 1.7rem; font-weight: 800; color: #1e293b; margin: 4px 0; }
.main-val-sm { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.highlight-card .main-val { color: white; }

/* RECORDS TABLE/LIST */
.bottom-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.content-card { background: white; padding: 1.8rem; border-radius: 24px; border: 1px solid #e2e8f0; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.record-item { 
  display: flex; align-items: center; padding: 1.3rem; border-radius: 18px; 
  border: 1px solid #f1f5f9; background: #fafafa; gap: 1.2rem; 
  margin-bottom: 1rem; transition: 0.2s;
}
.record-item:hover { border-color: #cbd5e1; background: white; }
.item-paid { border-left: 4px solid #10b981; }

.record-icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.paid-icon { background: #dcfce7; color: #10b981; }
.unpaid-icon { background: #fff7ed; color: #f97316; }

.record-main-info { flex: 1; }
.record-title { font-weight: 700; color: #1e3a8a; font-size: 1rem; }
.record-meta { display: flex; gap: 15px; margin-top: 5px; color: #64748b; font-size: 0.85rem; }
.status-pill { font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; margin-left: 10px; }
.status-pill.unpaid { background: #fee2e2; color: #ef4444; }
.status-pill.paid { background: #dcfce7; color: #10b981; }

.record-actions { display: flex; align-items: center; gap: 15px; }
.bill-amount { font-weight: 800; color: #1e293b; font-size: 1.1rem; }
.text-muted { color: #94a3b8; text-decoration: line-through; opacity: 0.6; }

.btn-primary-sm { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-receipt-sm { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; }

/* WIDGETS */
.widget-stack { display: flex; flex-direction: column; gap: 1.5rem; }
.info-card-blue { background: #1e3a8a; color: white; padding: 1.5rem; border-radius: 20px; }
.widget-text { font-size: 0.85rem; opacity: 0.8; margin: 10px 0 1.5rem 0; line-height: 1.5; }
.widget-action { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; }

.insurance-card-mini { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 1rem 0; }
.ins-provider { font-weight: 800; color: #1e293b; }
.ins-id { font-size: 0.8rem; color: #64748b; margin-top: 4px; }
.ins-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-top: 10px; }
.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.9rem; }

/* UTILS */
.empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.sub-val { font-size: 0.85rem; color: #64748b; margin: 0; }
.trend-tag.success { background: #dcfce7; color: #166534; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; font-weight: 700; display: inline-block; margin-top: 8px; }
.animate-in { animation: slideUp 0.5s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>