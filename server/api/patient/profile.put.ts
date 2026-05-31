import { prisma } from '../../utils/prisma'
import { requirePatientContext } from '../../utils/patient'

const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

const calcAge = (birthDate: Date | null) => {
  if (!birthDate) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age >= 0 ? age : null
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body?.userId as string
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User id required.' })
    }

    const { user, patient } = await requirePatientContext(userId)

    let birthDate: Date | null = patient.birthDate ? new Date(patient.birthDate) : null
    if (typeof body.birthDate === 'string' && body.birthDate.trim()) {
      const parsed = new Date(body.birthDate)
      if (!Number.isNaN(parsed.getTime())) birthDate = parsed
    } else if (body.birthDate === '') {
      birthDate = null
    }

    let avatar: string | null | undefined
    if (typeof body.avatar === 'string') {
      avatar = body.avatar.trim() ? body.avatar : null
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        phone: clean(body.phone) || 'N/A',
        gender: clean(body.gender) || null,
        birthDate,
        ...(avatar !== undefined ? { avatar } : {}),
        address: clean(body.address) || null,
        allergies: clean(body.allergies) || null,
        emergencyContactName: clean(body.emergencyContactName) || null,
        emergencyContactRelation: clean(body.emergencyContactRelation) || null,
        emergencyContactPhone: clean(body.emergencyContactPhone) || null,
        insuranceProvider: clean(body.insuranceProvider) || null,
        insuranceNumber: clean(body.insuranceNumber) || null
      }
    })

    const bloodType = clean(body.bloodType)

    // Age: prefer an explicitly typed value, otherwise derive from birth date
    let nextAge: number | null = null
    const typedAge = Number.parseInt(String(body.age ?? ''), 10)
    if (Number.isFinite(typedAge) && typedAge >= 0 && typedAge <= 130) {
      nextAge = typedAge
    } else {
      nextAge = calcAge(birthDate)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        bloodType: bloodType || user.bloodType,
        age: nextAge ?? user.age
      }
    })

    await prisma.auditLog.create({
      data: {
        user: updatedPatient.name,
        action: 'Updated personal profile details',
        resource: `Patient-${patient.id}`,
        severity: 'Info'
      }
    }).catch(() => {})

    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    console.error('Patient profile PUT error:', error)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to save profile.'
    })
  }
})
