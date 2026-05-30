<template>
  <div class="portal-page">
      <header class="top-bar portal-top-bar">
        <div class="header-info">
          <h1>Billing & Payments</h1>
          <p class="current-date">{{ displayName }} • MRN {{ registryId }}</p>
        </div>
        
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="openPaymentModal(null)">
            <Icon name="lucide:wallet" /> Quick Pay
          </button>
          <div class="profile-chip" @click="handleProfileClick" :title="displayName">
            <div class="avatar-circle purple-theme">{{ initials }}</div>
          </div>
        </div>
      </header>

      <div class="scrollable-body animate-in">
        <div class="bento-grid portal-bento-grid">
          <div class="bento-card highlight-card" @click="billingFilter = 'Unpaid'">
            <label class="label-caps"><Icon name="lucide:alert-circle" /> Total Balance</label>
            <p class="main-val">₱{{ totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
            <p class="sub-val text-blue-200">{{ dueByLabel }}</p>
          </div>
          <div class="bento-card" @click="handleStatClick('Insurance Status')">
            <label class="label-caps"><Icon name="lucide:shield-check" /> Insurance</label>
            <p class="main-val-sm">{{ insurance.provider }}</p>
            <div class="trend-tag success">{{ insurance.status }}</div>
          </div>
          <div class="bento-card" @click="billingFilter = 'Paid'">
            <label class="label-caps"><Icon name="lucide:receipt" /> Last Payment</label>
            <p class="main-val-sm">₱{{ lastPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            <p class="sub-val">Processed {{ lastPayment.date }}</p>
          </div>
          <div class="bento-card" @click="handleStatClick('Payment Method')">
            <label class="label-caps"><Icon name="lucide:credit-card" /> Auto-Pay</label>
            <p class="main-val-sm">{{ autoPay.method }} Enabled</p>
            <p class="sub-val">Linked: {{ autoPay.accountDisplay }}</p>
          </div>
        </div>

        <div class="bottom-layout portal-bottom-layout">
          <section class="content-card">
            <div class="card-header">
              <div class="header-title-group">
                <h3><Icon name="lucide:history" /> Statement History</h3>
                <NuxtLink to="/patient/history" class="view-more-link">See all history</NuxtLink>
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
                  <p class="bill-amount" :class="{ 'text-muted': bill.status === 'Paid' }">
                    ₱{{ bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </p>
                  
                  <button v-if="bill.status === 'Unpaid'" class="btn-primary-sm" @click="openPaymentModal(bill)">
                    Pay Now
                  </button>
                  <button v-else class="btn-receipt-sm" @click="handleDownloadInvoice(bill)">
                    <Icon name="lucide:receipt-text" /> Receipt
                  </button>

                  <button class="icon-btn-more" @click="handleDownloadInvoice(bill)" title="Download Invoice">
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

          <aside class="widget-stack">
            <div class="info-card-blue">
              <h4><Icon name="lucide:landmark" /> Financial Assistance</h4>
              <p class="widget-text">Explore 0% interest installment plans or request a medical subsidy evaluation.</p>
              <button class="widget-action" @click="handleAssistance">Explore Options</button>
            </div>

            <div class="content-card insurance-widget">
              <h4>Primary Coverage</h4>
              <div class="insurance-card-mini">
                <p class="ins-provider">{{ insurance.provider }}</p>
                <p class="ins-id">ID: {{ insurance.policyId }}</p>
                <div class="ins-badge">Verified Active</div>
              </div>
              <button class="btn-text-link" @click="isInsuranceModalOpen = true">
                Update Insurance <Icon name="lucide:arrow-right" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    <div v-if="isPaymentModalOpen" class="modal-overlay" @click.self="isPaymentModalOpen = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Secure Payment Gateway</h3>
          <button class="close-modal" @click="isPaymentModalOpen = false"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <p v-if="selectedBill">Processing payment for <strong>{{ selectedBill.service }}</strong></p>
          <p v-else>Processing custom checkout settlement amount.</p>
          <div class="amount-summary">
            <span>Total Outstanding Amount:</span>
            <span class="amount-highlight">₱{{ (selectedBill ? selectedBill.amount : totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="payment-methods-grid">
            <button class="method-option active">
              <Icon name="lucide:wallet" /> GCash
            </button>
            <button class="method-option" @click="alert('Credit/Debit system integration pending.')">
              <Icon name="lucide:credit-card" /> Card
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="isPaymentModalOpen = false">Cancel</button>
          <button class="btn-primary" @click="executePayment">Confirm Settlement</button>
        </div>
      </div>
    </div>

    <div v-if="isInsuranceModalOpen" class="modal-overlay" @click.self="isInsuranceModalOpen = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Update Insurance Records</h3>
          <button class="close-modal" @click="isInsuranceModalOpen = false"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Insurance Provider Group</label>
            <input type="text" v-model="insuranceForm.provider" class="form-input" placeholder="e.g., PhilHealth / Maxicare" />
          </div>
          <div class="form-group">
            <label class="form-label">Policy / Member ID Card Reference</label>
            <input type="text" v-model="insuranceForm.policyId" class="form-input" placeholder="0000-0000-0000" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="isInsuranceModalOpen = false">Cancel</button>
          <button class="btn-primary" @click="saveInsurance">Save Verification Document</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'patient' })

import { ref, computed, onMounted } from 'vue'

const { initials, displayName, registryId, requirePatientSession } = usePatientHeader()

const billingFilter = ref('All')
const isPaymentModalOpen = ref(false)
const isInsuranceModalOpen = ref(false)
const selectedBill = ref(null)

// Application Mock Reactive Targets
const insurance = ref({
  provider: 'PhilHealth / Maxicare',
  policyId: '0021-4452-1102',
  status: 'Active Coverage'
})

const insuranceForm = ref({ ...insurance.value })

const autoPay = ref({
  method: 'GCash',
  accountDisplay: '**** 2341'
})

const lastPayment = ref({
  amount: 1200.00,
  date: 'April 15, 2026'
})

const bills = ref([])
const dueByLabel = ref('No outstanding balance')

onMounted(async () => {
  try {
    const user = requirePatientSession()
    if (!user) return
    const data = await $fetch(`/api/patient/billing?userId=${user.id}`)
    if (data.success) {
      bills.value = data.bills
      insurance.value = data.insurance
      insuranceForm.value = { ...data.insurance }
      lastPayment.value = data.lastPayment
      autoPay.value = data.autoPay
      dueByLabel.value = data.dueBy ? `Due by ${data.dueBy}` : 'No outstanding balance'
    }
  } catch (e) {
    console.error('Billing load failed:', e)
  }
})

// Computed Properties
const filteredBills = computed(() => {
  if (billingFilter.value === 'All') return bills.value
  return bills.value.filter(b => b.status === billingFilter.value)
})

const totalBalance = computed(() => {
  return bills.value
    .filter(bill => bill.status === 'Unpaid')
    .reduce((sum, current) => sum + current.amount, 0)
})

// Handlers
const openPaymentModal = (bill) => {
  selectedBill.value = bill
  isPaymentModalOpen.value = true
}

const reloadBilling = async () => {
  const user = requirePatientSession()
  if (!user) return
  const data = await $fetch(`/api/patient/billing?userId=${user.id}`)
  if (data.success) {
    bills.value = data.bills
    lastPayment.value = data.lastPayment
    dueByLabel.value = data.dueBy ? `Due by ${data.dueBy}` : 'No outstanding balance'
  }
}

const executePayment = async () => {
  const user = requirePatientSession()
  if (!user) return

  try {
    const response = await $fetch('/api/patient/billing/pay', {
      method: 'POST',
      body: {
        userId: user.id,
        invoiceId: selectedBill.value?.id,
        payAll: !selectedBill.value
      }
    })

    await reloadBilling()
    isPaymentModalOpen.value = false
    selectedBill.value = null
    alert(response.message || 'Payment successful. Admin has been notified.')
  } catch (e) {
    console.error('Payment failed:', e)
    alert(e.data?.statusMessage || e.statusMessage || 'Payment could not be processed.')
  }
}

const saveInsurance = () => {
  insurance.value = { ...insuranceForm.value, status: 'Verification Pending' }
  isInsuranceModalOpen.value = false
  alert('Insurance dataset updated.')
}

const handleProfileClick = () => alert('Accessing Profile Settings...')
const handleStatClick = (type) => alert(`Detail view for: ${type}`)
const handleDownloadInvoice = (bill) => alert(`Generating INV-${bill.invoiceNo}.pdf...`)
const handleAssistance = () => alert('Opening Financial Aid Portal...')

</script>

<style scoped>
.top-bar h1 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin: 0; }
.current-date { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
.header-actions { display: flex; align-items: center; gap: 1.2rem; }
.add-btn { 
  background: #2563eb; color: white; border: none; padding: 0.75rem 1.4rem; 
  border-radius: 10px; font-weight: 700; display: flex; align-items: center; 
  gap: 10px; font-size: 0.85rem; cursor: pointer; transition: background 0.2s;
}
.add-btn:hover { background: #1d4ed8; }
.avatar-circle { 
  width: 44px; height: 44px; border-radius: 50%; display: flex; 
  align-items: center; justify-content: center; font-weight: 800; cursor: pointer; transition: transform 0.2s;
}
.avatar-circle:hover { transform: scale(1.05); }
.purple-theme { background: #f3e8ff; color: #7e22ce; border: 2px solid #e9d5ff; }
.purple-theme:hover { border-color: #d8b4fe; }

/* BENTO GRID */
.bento-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; }
.bento-card:hover { border-color: #2563eb; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.highlight-card { background: #1e3a8a; color: white; border: none; }
.highlight-card:hover { background: #1e40af; }
.main-val { font-size: 1.7rem; font-weight: 800; color: #1e293b; margin: 4px 0; }
.main-val-sm { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.highlight-card .main-val { color: white; }
.text-blue-200 { color: #bfdbfe; }

/* RECONSTRUCTED BOTTOM LAYOUT Elements */
.content-card { background: white; padding: 1.8rem; border-radius: 24px; border: 1px solid #e2e8f0; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.view-more-link {
  color: #2563eb;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
}
.view-more-link:hover { text-decoration: underline; }
.filter-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; }
.tab { border: none; background: none; padding: 6px 16px; font-size: 0.8rem; font-weight: 700; color: #64748b; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.record-item { 
  display: flex; align-items: center; padding: 1.3rem; border-radius: 18px; 
  border: 1px solid #f1f5f9; background: #fafafa; gap: 1.2rem; 
  margin-bottom: 1rem; transition: 0.2s;
}
.record-item:hover { border-color: #cbd5e1; background: white; }
.item-paid { border-left: 4px solid #10b981; }

.record-icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
.paid-icon { background: #dcfce7; color: #10b981; }
.unpaid-icon { background: #fff7ed; color: #f97316; }

.record-main-info { flex: 1; }
.record-title { font-weight: 700; color: #1e3a8a; font-size: 1rem; }
.record-meta { display: flex; gap: 15px; margin-top: 5px; color: #64748b; font-size: 0.85rem; }
.record-meta span { display: flex; align-items: center; gap: 5px; }
.status-pill { font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; margin-left: 10px; vertical-align: middle; }
.status-pill.unpaid { background: #fee2e2; color: #ef4444; }
.status-pill.paid { background: #dcfce7; color: #10b981; }

.record-actions { display: flex; align-items: center; gap: 15px; }
.bill-amount { font-weight: 800; color: #1e293b; font-size: 1.1rem; }
.text-muted { color: #94a3b8; text-decoration: line-through; opacity: 0.6; }

.btn-primary-sm { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-receipt-sm { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.icon-btn-more { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; transition: color 0.2s; }
.icon-btn-more:hover { color: #1e3a8a; }

/* WIDGET INTERFACES */
.widget-stack { display: flex; flex-direction: column; gap: 1.5rem; }
.info-card-blue { background: #1e3a8a; color: white; padding: 1.5rem; border-radius: 20px; }
.widget-text { font-size: 0.85rem; opacity: 0.8; margin: 10px 0 1.5rem 0; line-height: 1.5; }
.widget-action { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.widget-action:hover { background: rgba(255,255,255,0.2); }

.insurance-card-mini { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 1rem 0; }
.ins-provider { font-weight: 800; color: #1e293b; }
.ins-id { font-size: 0.8rem; color: #64748b; margin-top: 4px; }
.ins-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-top: 10px; }
.btn-text-link { background: none; border: none; color: #2563eb; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.9rem; }

/* MODAL BLOCKS */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
.modal-container { background: white; width: 100%; max-width: 480px; border-radius: 24px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s ease-out; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h3 { font-size: 1.25rem; font-weight: 800; color: #1e3a8a; }
.close-modal { background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.2rem; }
.modal-body { margin-bottom: 1.5rem; font-size: 0.95rem; color: #475569; }
.amount-summary { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 1rem; border-radius: 12px; margin: 1rem 0; border: 1px dashed #cbd5e1; }
.amount-highlight { font-size: 1.4rem; font-weight: 900; color: #2563eb; }
.payment-methods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 1rem; }
.method-option { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; font-weight: 700; cursor: pointer; color: #475569; }
.method-option.active { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
.form-group { margin-bottom: 1.2rem; }
.form-label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; }
.form-input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.9rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0; padding-top: 1rem; }
.btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }

/* UTILS */
.empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
.label-caps { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.sub-val { font-size: 0.85rem; color: #64748b; margin: 0; }
.trend-tag.success { background: #dcfce7; color: #166534; font-size: 0.7rem; padding: 2px 8px; border-radius: 6px; font-weight: 700; display: inline-block; margin-top: 8px; }
.animate-in { animation: slideUp 0.5s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.clickable { cursor: pointer; }
.clickable:active { transform: scale(0.98); }
</style>