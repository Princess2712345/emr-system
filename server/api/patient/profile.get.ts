import { requirePatientContext } from '../../utils/patient'

const calcAge = (birthDate: Date | null, fallback?: number | null) => {
  if (!birthDate) return fallback ?? null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age >= 0 ? age : (fallback ?? null)
}

export default defineEventHandler(async (event) => {
  try {
    const userId = getQuery(event).userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User id required.' })
    }

    const { user, patient } = await requirePatientContext(userId)

    const birthDate = patient.birthDate ? new Date(patient.birthDate) : null

    return {
      success: true,
      profile: {
        // Identity (read-only)
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        username: user.username,
        uniqueId: user.uniqueId,
        memberSince: patient.createdAt,
        avatar: patient.avatar || '',

        // Editable clinical / personal
        phone: patient.phone && patient.phone !== 'N/A' ? patient.phone : '',
        gender: patient.gender || '',
        birthDate: birthDate ? birthDate.toISOString().slice(0, 10) : '',
        age: calcAge(birthDate, user.age),
        bloodType: user.bloodType || '',
        address: patient.address || '',
        allergies: patient.allergies || '',

        // Emergency contact
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactRelation: patient.emergencyContactRelation || '',
        emergencyContactPhone: patient.emergencyContactPhone || '',

        // Insurance
        insuranceProvider: patient.insuranceProvider || '',
        insuranceNumber: patient.insuranceNumber || ''
      }
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Patient profile GET error:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to load profile.'
    })
  }
})
