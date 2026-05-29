export function usePatientRegistry() {
  const { data: patients, refresh, pending, error } = useFetch('/api/patients', {
    key: 'patient-registry',
    default: () => []
  })

  const patientOptions = computed(() => {
    const list = Array.isArray(patients.value) ? patients.value : []
    return list.map((p: {
      id: string
      name: string
      uniqueId?: string
      patientId?: string
      email?: string
    }) => ({
      id: p.id,
      label: `${p.name}${p.uniqueId || p.patientId ? ` (${p.uniqueId || p.patientId})` : ''}`,
      name: p.name,
      uniqueId: p.uniqueId || p.patientId,
      email: p.email
    }))
  })

  return { patients, patientOptions, refresh, pending, error }
}
