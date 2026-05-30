<template>
  <div class="portal-page dashboard-page">
      <header class="top-bar portal-top-bar">
        <div class="welcome-msg">
          <h1>Statement of Account</h1>
          <p>Manage patient billing, insurance claims, and payment processing.</p>
        </div>
        <div class="header-actions portal-header-actions">
          <button class="add-btn clickable" @click="openAddModal">
            <Icon name="lucide:plus" /> Create New Invoice
          </button>
        </div>
      </header>

      <section class="billing-body">
        <div class="billing-stats">
          <div class="b-stat-card blue">
            <span class="b-label">Total Outstanding</span>
            <p class="b-value">₱{{ formatCurrency(billingPayload?.stats?.outstanding || 0) }}</p>
          </div>
          <div class="b-stat-card orange">
            <span class="b-label">Pending Insurance</span>
            <p class="b-value">₱12,840.00</p>
          </div>
          <div class="b-stat-card green">
            <span class="b-label">Collected (Total)</span>
            <p class="b-value">₱{{ formatCurrency(billingPayload?.stats?.collected || 0) }}</p>
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
              <option value="Pending Approval">Pending Approval</option>
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
              <tr v-for="invoice in billingPayload?.invoices || []" :key="invoice.id">
                <td>
                  <div class="invoice-info">
                    <div class="inv-icon">
                      <Icon name="lucide:file-text" />
                    </div>
                    <div>
                      <p class="inv-id">#{{ invoice.id.substring(0,8).toUpperCase() }}</p>
                      <p class="p-name">{{ invoice.patientName }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="amt-total">₱{{ formatCurrency(invoice.amount) }}</span></td>
                <td>
                  <span class="amt-balance" :class="{ 'has-balance': invoice.balance > 0 }">
                    ₱{{ formatCurrency(invoice.balance) }}
                  </span>
                </td>
                <td>{{ formatDate(invoice.dueDate) }}</td>
                <td>
                  <span class="badge" :class="badgeClass(invoice.status)">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-btns">
                    <template v-if="invoice.status === 'Pending Approval'">
                      <button class="icon-btn clickable" title="View receipt" @click="openReview(invoice)">
                        <Icon name="lucide:receipt-text" />
                      </button>
                      <button class="approve-link clickable" @click="decideInvoice(invoice, 'approve')">
                        <Icon name="lucide:check" /> Approve
                      </button>
                      <button class="reject-link clickable" @click="decideInvoice(invoice, 'reject')">
                        Reject
                      </button>
                    </template>
                    <template v-else>
                      <button class="icon-btn clickable" title="Download PDF" @click="downloadInvoice(invoice)">
                        <Icon name="lucide:download" />
                      </button>
                      <button class="view-link clickable" @click="recordPayment(invoice)">Pay</button>
                    </template>
                  </div>
                </td>
              </tr>
              <tr v-if="!billingPayload?.invoices?.length">
                <td colspan="6" class="empty-state" style="text-align: center; padding: 2rem; color: #64748b;">
                  No invoice ledger details found matching active session targets.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

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
              <label>Patient</label>
              <select v-model="newBill.patientId" class="filter-dropdown" style="width: 100%;" required>
                <option value="">Select registered patient</option>
                <option v-for="p in patientOptions" :key="p.id" :value="p.id">
                  {{ p.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Total Invoice Base Cost (₱)</label>
              <div class="item-list">
                 <input type="number" step="0.01" v-model="newBill.amount" placeholder="150.00" required />
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

    <Transition name="fade">
      <div v-if="isReviewOpen" class="modal-overlay" @click.self="isReviewOpen = false">
        <div class="modal-content review-modal">
          <div class="modal-header">
            <h3>Review Payment</h3>
            <button class="close-modal clickable" @click="isReviewOpen = false">
              <Icon name="lucide:x" />
            </button>
          </div>

          <div v-if="reviewLoading" class="review-loading">
            <Icon name="lucide:loader-2" class="spin" /> Loading receipt…
          </div>

          <div v-else-if="reviewData" class="review-body">
            <div class="review-rows">
              <div class="review-row"><span>Patient</span><strong>{{ reviewData.patientName }}</strong></div>
              <div class="review-row"><span>Method</span><strong>{{ reviewData.method || '—' }}</strong></div>
              <div class="review-row"><span>Amount</span><strong>₱{{ formatCurrency(reviewData.amount) }}</strong></div>
              <div class="review-row"><span>Reference</span><strong>{{ reviewData.reference || '—' }}</strong></div>
            </div>

            <div v-if="reviewData.proof" class="review-proof">
              <span class="proof-label">Receipt screenshot</span>
              <img :src="reviewData.proof" alt="Payment receipt" />
            </div>
            <div v-else class="review-noproof">
              <Icon name="lucide:image-off" /> No screenshot attached (card payment).
            </div>
          </div>

          <div class="modal-actions">
            <button class="reject-link clickable" @click="decideFromReview('reject')">Reject</button>
            <button class="add-btn clickable" @click="decideFromReview('approve')">
              <Icon name="lucide:check" /> Approve payment
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

import { ref, watch, onMounted, onUnmounted } from 'vue'

let billingPoll = null

const searchQuery = ref('')
const selectedStatus = ref('All')
const isModalOpen = ref(false)

const { patientOptions } = usePatientRegistry()

const newBill = ref({
  patientId: '',
  amount: 150.00
})

// --- Fetch Pipeline ---
const { data: billingPayload, refresh: reloadInvoices } = await useFetch('/api/billing', {
  key: 'live-billing-ledger',
  query: { search: searchQuery, status: selectedStatus }
})

// Trigger reload on input state watch mutations
watch([searchQuery, selectedStatus], () => {
  reloadInvoices()
})

const openAddModal = () => {
  newBill.value = { patientId: '', amount: 150.00 }
  isModalOpen.value = true
}

const handleInvoice = async () => {
  try {
    await $fetch('/api/billing', {
      method: 'POST',
      body: newBill.value
    })
    alert('Invoice linked to patient — it will appear on their billing portal.')
    await reloadInvoices()
    isModalOpen.value = false
  } catch (err) {
    alert(err.statusMessage || 'Failed to match patient account information.')
  }
}

// Helpers
const formatCurrency = (val) => {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const downloadInvoice = (inv) => alert(`Downloading Invoice #${inv.id.substring(0,8).toUpperCase()}...`)
const recordPayment = (inv) => alert(`Opening processing window for ${inv.patientName}...`)
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'All' }

const badgeClass = (status) => (status || '').toLowerCase().replace(/\s+/g, '-')

// --- Payment review / approval ---
const isReviewOpen = ref(false)
const reviewLoading = ref(false)
const reviewData = ref(null)

const openReview = async (invoice) => {
  isReviewOpen.value = true
  reviewLoading.value = true
  reviewData.value = null
  try {
    const data = await $fetch('/api/billing/proof', { query: { invoiceId: invoice.id } })
    if (data.success) reviewData.value = data.invoice
  } catch (e) {
    alert(e.data?.statusMessage || 'Could not load receipt.')
    isReviewOpen.value = false
  } finally {
    reviewLoading.value = false
  }
}

const decideInvoice = async (invoice, decision) => {
  if (decision === 'reject' && !confirm(`Reject ${invoice.patientName}'s payment for #${invoice.id.substring(0,8).toUpperCase()}?`)) {
    return
  }
  try {
    const res = await $fetch('/api/billing/approve', {
      method: 'POST',
      body: { invoiceId: invoice.id, decision }
    })
    await reloadInvoices()
    alert(res.message || 'Done.')
  } catch (e) {
    alert(e.data?.statusMessage || 'Action failed.')
  }
}

const decideFromReview = async (decision) => {
  if (!reviewData.value) return
  await decideInvoice({ id: reviewData.value.id, patientName: reviewData.value.patientName }, decision)
  isReviewOpen.value = false
  reviewData.value = null
}

onMounted(() => {
  billingPoll = setInterval(() => reloadInvoices(), 15000)
})

onUnmounted(() => {
  if (billingPoll) clearInterval(billingPoll)
})
</script>

<style scoped>
/* --- Keep your exact scoped CSS blocks here unchanged --- */
.dashboard-layout { display: flex; min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; overflow-x: hidden; }
.sidebar { width: 260px; background: #1e3a8a; color: white; display: flex; flex-direction: column; padding: 1.5rem 1rem; height: 100vh; position: sticky; top: 0; z-index: 100; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.is-collapsed .sidebar { width: 80px; padding: 1.5rem 0.75rem; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; padding: 0 0.5rem; }
.is-collapsed .sidebar-header { justify-content: center; padding: 0; }
.sidebar-logo { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; white-space: nowrap; }
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.menu-toggle { background: rgba(255, 255, 255, 0.1); border: none; color: white; padding: 8px; border-radius: 8px; display: flex; cursor: pointer; transition: background 0.2s; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.nav-item { position: relative; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: #bfdbfe; text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s ease; white-space: nowrap; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; padding-left: 1.25rem; }
.is-collapsed .nav-item { justify-content: center; padding: 0.8rem; }
.is-collapsed .nav-item:hover { padding-left: 0.8rem; }
.router-link-active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.sidebar-tooltip { position: absolute; left: 100%; margin-left: 15px; background: #0f172a; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; opacity: 0; pointer-events: none; transition: all 0.2s ease; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); z-index: 1000; }
.nav-item:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }
.sidebar-footer { padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.logout-btn { background: none; border: none; width: 100%; text-align: left; color: #fca5a5; font-weight: 600; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; position: relative; transition: all 0.2s ease; }
.logout-btn:hover { background: rgba(252, 165, 165, 0.1); color: #f87171; transform: translateX(5px); }
.is-collapsed .logout-btn { justify-content: center; }
.is-collapsed .logout-btn:hover { transform: none; }
.logout-btn:hover .sidebar-tooltip { opacity: 1; margin-left: 10px; }
.main-content { flex: 1; display: flex; flex-direction: column; width: 100%; transition: all 0.3s; }
.top-bar { background: white; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
.top-bar h1 { font-size: 1.6rem; color: #1e3a8a; margin: 0; font-weight: 700; }
.top-bar p { color: #64748b; margin-top: 4px; font-size: 0.9rem; }
.billing-body { padding: 2.5rem 3rem; width: 100%; box-sizing: border-box; }
.billing-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.b-stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  min-width: 0;
  min-height: 120px;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.b-stat-card.blue { background: linear-gradient(135deg, #3b82f6, #1e3a8a); animation-delay: 0.1s; }
.b-stat-card.orange { background: linear-gradient(135deg, #f59e0b, #d97706); animation-delay: 0.2s; }
.b-stat-card.green { background: linear-gradient(135deg, #10b981, #059669); animation-delay: 0.3s; }

.b-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.b-label {
  display: block;
  font-size: 0.8rem;
  line-height: 1.3;
  opacity: 0.95;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
}

.b-value {
  display: block;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  word-break: break-word;
}
.table-controls { display: flex; justify-content: space-between; margin-bottom: 2rem; gap: 2rem; }
.search-wrapper { position: relative; flex: 1; max-width: 600px; display: flex; align-items: center; }
.search-wrapper input { width: 100%; padding: 0.85rem 1rem 0.85rem 3rem; border: 1px solid #e2e8f0; border-radius: 12px; outline: none; background: white; font-size: 0.95rem; }
.search-icon-svg { position: absolute; left: 15px; color: #94a3b8; font-size: 1.2rem; }
.filter-group { display: flex; gap: 12px; }
.filter-dropdown, .filter-btn { padding: 0 1.2rem; height: 48px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; color: #475569; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); overflow-x: auto; -webkit-overflow-scrolling: touch; }
.billing-table { width: 100%; border-collapse: collapse; }
.billing-table th { background-color: #f8fafc; padding: 1.2rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
.billing-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.invoice-info { display: flex; align-items: center; gap: 12px; }
.inv-icon { font-size: 1.2rem; background: #f8fafc; padding: 8px; border-radius: 8px; color: #1e3a8a; display: flex; align-items: center; justify-content: center; }
.inv-id { font-weight: 700; color: #1e3a8a; margin: 0; font-family: monospace; }
.p-name { color: #64748b; margin: 0; font-size: 0.9rem; }
.amt-total { font-weight: 600; color: #1e293b; }
.amt-balance.has-balance { color: #ef4444; font-weight: 700; }
.badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
.badge.paid { background: #dcfce7; color: #15803d; }
.badge.unpaid { background: #fee2e2; color: #b91c1c; }
.badge.partial { background: #fef3c7; color: #b45309; }
.badge.pending-approval { background: #fef3c7; color: #b45309; }

.approve-link { color: white; background: #059669; padding: 0.5rem 1rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s; }
.approve-link:hover { background: #047857; }
.reject-link { color: #b91c1c; background: #fee2e2; padding: 0.5rem 1rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
.reject-link:hover { background: #fecaca; }

/* Review modal */
.review-modal { width: 520px; max-width: 92vw; }
.review-loading { display: flex; align-items: center; gap: 10px; color: #64748b; padding: 2rem 0; justify-content: center; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.review-body { display: flex; flex-direction: column; gap: 1.25rem; }
.review-rows { display: flex; flex-direction: column; gap: 0.5rem; }
.review-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #475569; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
.review-row strong { color: #1e293b; }
.review-proof { display: flex; flex-direction: column; gap: 0.5rem; }
.proof-label { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: #64748b; }
.review-proof img { width: 100%; max-height: 360px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
.review-noproof { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 0.9rem; padding: 1rem; background: #f8fafc; border-radius: 12px; }
.action-btns { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; transition: 0.2s; color: #64748b; }
.icon-btn:hover { background: #e2e8f0; color: #1e3a8a; }
.view-link { color: white; background: #2563eb; padding: 0.5rem 1.2rem; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
.view-link:hover { background: #1e40af; }
.add-btn { background-color: #2563eb; color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.text-right { text-align: right; }
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .sidebar { position: fixed; left: 0; top: 0; bottom: 0; transform: translateX(-100%); transition: transform 0.3s ease; }
  .is-collapsed .sidebar { width: 260px; transform: translateX(0); }
  .main-content { margin-left: 0; width: 100%; }
  .top-bar { padding: 1rem 1.5rem; flex-direction: column; align-items: flex-start; gap: 1rem; }
  .header-actions { width: 100%; }
  .add-btn { width: 100%; justify-content: center; }
  .billing-body { padding: 1.5rem; }
  .table-controls { flex-direction: column; gap: 1rem; }
  .search-wrapper { max-width: 100%; }
  .filter-group { display: grid; grid-template-columns: 1fr auto; }
  .modal-content { width: 90%; margin: 10px; padding: 1.5rem; }
}
@media (max-width: 1200px) {
  .billing-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .billing-stats {
    grid-template-columns: 1fr;
  }

  .top-bar h1 {
    font-size: 1.3rem;
  }
}
</style>