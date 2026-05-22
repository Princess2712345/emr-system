export function useDashboardNav() {
  const navLinks = [
    { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Overview' },
    { to: '/dashboard/lab-results', icon: 'lucide:test-tube-2', label: 'Lab Results' },
    { to: '/dashboard/registration', icon: 'mdi:account-plus', label: 'Registration' },
    { to: '/dashboard/disposition', icon: 'lucide:file-output', label: 'Disposition' },
    { to: '/dashboard/inventory', icon: 'lucide:package', label: 'Inventory' },
    { to: '/dashboard/billing', icon: 'lucide:credit-card', label: 'Statement of Account' },
    { to: '/dashboard/appointments', icon: 'lucide:calendar-days', label: 'Appointments' },
    { to: '/dashboard/statistic', icon: 'lucide:bar-chart-3', label: 'Statistics' },
    { to: '/dashboard/history', icon: 'lucide:history', label: 'History' }
  ]
  return { navLinks }
}
