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
          <PatientNotificationBell />
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
                <div class="record-icon-box" :class="iconClass(bill.status)">
                  <Icon :name="statusIcon(bill.status)" />
                </div>
                
                <div class="record-main-info">
                  <div class="record-header">
                    <span class="record-title">{{ bill.service }}</span>
                    <span :class="['status-pill', statusClass(bill.status)]">
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
                  <span v-else-if="bill.status === 'Pending Approval'" class="pending-tag">
                    <Icon name="lucide:clock" /> Awaiting approval
                  </span>
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
    <div v-if="isPaymentModalOpen" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Secure Payment Gateway</h3>
          <button class="close-modal" @click="closePaymentModal"><Icon name="lucide:x" /></button>
        </div>
        <div class="modal-body">
          <p v-if="selectedBill">Settling <strong>{{ selectedBill.service }}</strong></p>
          <p v-else>Settling your full outstanding balance.</p>
          <div class="amount-summary">
            <span>Amount to pay:</span>
            <span class="amount-highlight">₱{{ (selectedBill ? selectedBill.amount : totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
          </div>

          <div class="payment-methods-grid">
            <button
              type="button"
              class="method-option"
              :class="{ active: paymentMethod === 'GCash' }"
              @click="paymentMethod = 'GCash'"
            >
              <Icon name="lucide:wallet" /> GCash
            </button>
            <button
              type="button"
              class="method-option"
              :class="{ active: paymentMethod === 'Card' }"
              @click="paymentMethod = 'Card'"
            >
              <Icon name="lucide:credit-card" /> Card
            </button>
          </div>

          <!-- GCash flow -->
          <div v-if="paymentMethod === 'GCash'" class="method-panel">
            <div class="gcash-instructions">
              <Icon name="lucide:smartphone" />
              <p>Send your payment to <strong>GCash 0917-555-0142 (MyHealth Clinic)</strong>, then upload the receipt screenshot below.</p>
            </div>

            <label class="upload-label">Receipt screenshot <span class="req">*</span></label>
            <label class="upload-dropzone" :class="{ filled: receiptPreview }">
              <input type="file" accept="image/*" class="upload-input" @change="onReceiptChange" />
              <template v-if="receiptPreview">
                <img :src="receiptPreview" alt="Receipt preview" class="receipt-preview" />
                <span class="upload-change">Click to change</span>
              </template>
              <template v-else>
                <Icon name="lucide:image-up" class="upload-icon" />
                <span>Tap to upload your GCash receipt</span>
                <small>PNG or JPG, up to 3MB</small>
              </template>
            </label>

            <label class="upload-label">GCash reference no. (optional)</label>
            <input v-model="paymentRef" type="text" class="form-input" placeholder="e.g. 1234567890123" />
          </div>

          <!-- Card flow -->
          <div v-else class="method-panel">
            <label class="upload-label">Cardholder name <span class="req">*</span></label>
            <input v-model="cardForm.name" type="text" class="form-input" placeholder="Name on card" />

            <label class="upload-label">Card number <span class="req">*</span></label>
            <input v-model="cardForm.number" type="text" inputmode="numeric" maxlength="19" class="form-input" placeholder="0000 0000 0000 0000" />

            <div class="card-row">
              <div class="card-col">
                <label class="upload-label">Expiry <span class="req">*</span></label>
                <input v-model="cardForm.expiry" type="text" maxlength="5" class="form-input" placeholder="MM/YY" />
              </div>
              <div class="card-col">
                <label class="upload-label">CVV <span class="req">*</span></label>
                <input v-model="cardForm.cvv" type="password" maxlength="4" class="form-input" placeholder="•••" />
              </div>
            </div>
            <p class="card-note"><Icon name="lucide:shield-check" /> Card payments are reviewed and confirmed by an administrator.</p>
          </div>

          <p v-if="paymentError" class="pay-error">{{ paymentError }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closePaymentModal">Cancel</button>
          <button class="btn-primary" :disabled="paymentSending" @click="executePayment">
            {{ paymentSending ? 'Submitting…' : 'Submit for approval' }}
          </button>
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

// Payment flow state
const paymentMethod = ref('GCash')
const paymentRef = ref('')
const receiptPreview = ref('')
const paymentError = ref('')
const paymentSending = ref(false)
const cardForm = ref({ name: '', number: '', expiry: '', cvv: '' })

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024

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

// Status helpers
const statusClass = (status) => (status || '').toLowerCase().replace(/\s+/g, '-')
const statusIcon = (status) => {
  if (status === 'Paid') return 'lucide:badge-check'
  if (status === 'Pending Approval') return 'lucide:clock'
  return 'lucide:file-warning'
}
const iconClass = (status) => {
  if (status === 'Paid') return 'paid-icon'
  if (status === 'Pending Approval') return 'pending-icon'
  return 'unpaid-icon'
}

// Handlers
const resetPaymentForm = () => {
  paymentMethod.value = 'GCash'
  paymentRef.value = ''
  receiptPreview.value = ''
  paymentError.value = ''
  cardForm.value = { name: '', number: '', expiry: '', cvv: '' }
}

const openPaymentModal = (bill) => {
  selectedBill.value = bill
  resetPaymentForm()
  isPaymentModalOpen.value = true
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
  selectedBill.value = null
  resetPaymentForm()
}

const onReceiptChange = (e) => {
  paymentError.value = ''
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    paymentError.value = 'Please choose an image file.'
    return
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    paymentError.value = 'Image is too large (max 3MB).'
    return
  }
  const reader = new FileReader()
  reader.onload = () => { receiptPreview.value = reader.result }
  reader.readAsDataURL(file)
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

  paymentError.value = ''

  // Client-side validation per method
  if (paymentMethod.value === 'GCash' && !receiptPreview.value) {
    paymentError.value = 'Please upload your GCash receipt screenshot.'
    return
  }

  let reference = paymentRef.value.trim()
  if (paymentMethod.value === 'Card') {
    const { name, number, expiry, cvv } = cardForm.value
    if (!name.trim() || !number.trim() || !expiry.trim() || !cvv.trim()) {
      paymentError.value = 'Please complete all card details.'
      return
    }
    const digits = number.replace(/\D/g, '')
    reference = `Card •••• ${digits.slice(-4) || '0000'}`
  }

  paymentSending.value = true
  try {
    const response = await $fetch('/api/patient/billing/submit-payment', {
      method: 'POST',
      body: {
        userId: user.id,
        invoiceId: selectedBill.value?.id,
        payAll: !selectedBill.value,
        method: paymentMethod.value,
        reference,
        proof: paymentMethod.value === 'GCash' ? receiptPreview.value : null
      }
    })

    await reloadBilling()
    closePaymentModal()
    alert(response.message || 'Payment submitted. An admin will confirm it shortly.')
  } catch (e) {
    console.error('Payment failed:', e)
    paymentError.value = e.data?.statusMessage || e.statusMessage || 'Payment could not be submitted.'
  } finally {
    paymentSending.value = false
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
.status-pill.pending-approval { background: #fef3c7; color: #b45309; }
.pending-icon { background: #fef3c7; color: #d97706; }
.pending-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 6px 12px;
  border-radius: 10px;
}

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

/* Payment method panels */
.method-panel { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
.gcash-instructions {
  display: flex; gap: 10px; align-items: flex-start;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;
  padding: 0.85rem; color: #1e40af; font-size: 0.82rem; line-height: 1.45; margin-bottom: 0.5rem;
}
.gcash-instructions :deep(svg) { flex-shrink: 0; font-size: 1.1rem; margin-top: 2px; }
.upload-label { font-size: 0.78rem; font-weight: 800; color: #475569; text-transform: uppercase; margin-top: 0.4rem; }
.req { color: #ef4444; }
.upload-dropzone {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; text-align: center; padding: 1.5rem 1rem; border: 2px dashed #cbd5e1; border-radius: 14px;
  background: #f8fafc; color: #64748b; cursor: pointer; transition: 0.2s; font-size: 0.85rem;
}
.upload-dropzone:hover { border-color: #2563eb; background: #eff6ff; }
.upload-dropzone.filled { padding: 0.75rem; }
.upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-icon { font-size: 1.8rem; opacity: 0.6; }
.upload-dropzone small { font-size: 0.72rem; opacity: 0.7; }
.receipt-preview { max-height: 180px; max-width: 100%; border-radius: 10px; object-fit: contain; }
.upload-change { font-size: 0.72rem; color: #2563eb; font-weight: 700; }
.card-row { display: flex; gap: 12px; }
.card-col { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.card-note { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #64748b; margin-top: 0.5rem; }
.pay-error { margin-top: 0.75rem; font-size: 0.82rem; color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; padding: 0.6rem 0.75rem; border-radius: 8px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
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