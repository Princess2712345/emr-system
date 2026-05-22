export function usePortalLayout() {
  const isCollapsed = ref(false)
  const isMobileOpen = ref(false)

  const closeMobile = () => { isMobileOpen.value = false }

  return { isCollapsed, isMobileOpen, closeMobile }
}
