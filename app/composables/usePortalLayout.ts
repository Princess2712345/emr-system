export function usePortalLayout() {
  const isMobileOpen = ref(false)

  const closeMobile = () => {
    isMobileOpen.value = false
  }

  return { isMobileOpen, closeMobile }
}
