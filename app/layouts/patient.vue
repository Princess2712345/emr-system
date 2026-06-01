<template>
  <div
    class="portal-layout dashboard-layout"
    :class="{ 'mobile-open': isMobileOpen }"
  >
    <div class="portal-sidebar-overlay" @click="closeMobile" />

    <header class="portal-mobile-bar mobile-nav-bar">
      <button type="button" class="portal-mobile-menu-btn" aria-label="Open menu" @click="isMobileOpen = true">
        <Icon name="lucide:menu" />
      </button>
      <span class="logo-text" style="font-weight: 800;">MyHealth<span style="color: #93c5fd;">Portal</span></span>
      <div class="mobile-bar-actions">
        <PatientNotificationBell />
        <NuxtLink to="/patient/profile" class="avatar-circle purple-theme" title="My Profile" style="width: 32px; height: 32px; font-size: 0.7rem; text-decoration: none; overflow: hidden;">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
          <span v-else>{{ initials }}</span>
        </NuxtLink>
      </div>
    </header>

    <aside class="portal-sidebar sidebar">
      <div class="sidebar-logo">
        <Icon name="mdi:hospital-building" class="logo-icon" />
        <span class="logo-text">MyHealth<span class="text-blue-400">Portal</span></span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-item"
          @click="closeMobile"
        >
          <Icon :name="link.icon" />
          <span class="nav-text">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button type="button" class="logout-btn clickable" @click="onLogout">
          <Icon name="lucide:log-out" />
          <span class="nav-text">Logout</span>
        </button>
      </div>
    </aside>

    <div class="portal-main main-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const { isMobileOpen, closeMobile } = usePortalLayout()
const { logout, initials, avatarUrl, loadUser } = useAuth()

loadUser()

const onResize = () => {
  if (import.meta.client && window.innerWidth > 768) {
    isMobileOpen.value = false
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('resize', onResize)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', onResize)
  }
})

const navLinks = [
  { to: '/patient', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
  { to: '/patient/myappointments', icon: 'lucide:calendar-days', label: 'Appointments' },
  { to: '/patient/lab-results', icon: 'lucide:file-heart', label: 'Health Records' },
  { to: '/patient/billing', icon: 'lucide:credit-card', label: 'Billing & Payments' },
  { to: '/patient/history', icon: 'lucide:history', label: 'History' }
]

const onLogout = () => {
  if (confirm('Sign out from MyHealth Portal?')) logout()
}
</script>

<style scoped>
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 2rem;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.text-blue-400 {
  color: #93c5fd;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  overflow-y: auto;
  min-height: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  color: #bfdbfe;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  flex-shrink: 0;
}

.nav-item.router-link-active {
  background: #2563eb;
  color: white;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  width: 100%;
  margin-top: auto;
  flex-shrink: 0;
}

.logout-btn {
  background: none;
  border: none;
  color: #fca5a5;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
}

.avatar-circle {
  background: #7c3aed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
}

.purple-theme {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
}

.mobile-bar-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
</style>
