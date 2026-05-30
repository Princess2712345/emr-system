<template>
  <div
    class="portal-layout dashboard-layout"
    :class="{ 'is-collapsed': isCollapsed, 'mobile-open': isMobileOpen }"
  >
    <div class="portal-sidebar-overlay sidebar-overlay" @click="closeMobile" />

    <header class="portal-mobile-bar mobile-nav-bar">
      <button
        type="button"
        class="portal-mobile-menu-btn mobile-menu-toggle"
        aria-label="Open menu"
        @click="isMobileOpen = true"
      >
        <Icon name="lucide:menu" />
      </button>
      <span class="mobile-logo-text logo-text">EMR System</span>
      <div class="mobile-bar-actions">
        <AdminNotificationBell />
        <div class="avatar-sm">{{ initials }}</div>
      </div>
    </header>

    <aside class="portal-sidebar sidebar">
      <div class="sidebar-header">
        <div v-if="!isCollapsed || isMobileOpen" class="sidebar-logo">
          <Icon name="mdi:hospital-building" class="icon-blue-light logo-icon" />
          <span class="logo-text">EMR System</span>
        </div>
        <button
          type="button"
          class="menu-toggle desktop-only"
          aria-label="Toggle sidebar"
          @click="isCollapsed = !isCollapsed"
        >
          <Icon :name="isCollapsed ? 'lucide:menu' : 'lucide:chevron-left'" />
        </button>
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
          <span v-if="!isCollapsed || isMobileOpen" class="nav-label">{{ link.label }}</span>
          <span v-if="isCollapsed && !isMobileOpen" class="sidebar-tooltip">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div v-if="!isCollapsed || isMobileOpen" class="sidebar-theme">
          <ThemeToggle />
        </div>
        <ThemeToggle v-else compact />
        <button type="button" class="logout-btn" @click="onLogout">
          <Icon name="lucide:log-out" />
          <span v-if="!isCollapsed || isMobileOpen">Logout</span>
        </button>
      </div>
    </aside>

    <div class="portal-main main-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const { navLinks } = useDashboardNav()
const { isCollapsed, isMobileOpen, closeMobile } = usePortalLayout()
const { logout, initials, loadUser } = useAuth()

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

const onLogout = () => {
  if (confirm('Are you sure you want to log out?')) {
    logout()
  }
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
  width: 100%;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  white-space: nowrap;
}
.icon-blue-light { color: #60a5fa; font-size: 1.6rem; }
.menu-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
}
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; width: 100%; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  color: #bfdbfe;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}
.nav-item.router-link-active { background: #2563eb; color: white; }
.nav-item:hover { background: rgba(255, 255, 255, 0.1); color: white; }
.sidebar-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.1); width: 100%; }
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
.mobile-bar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: white;
}

</style>
