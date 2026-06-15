import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Patient123!', 10)

  const samples = [
    {
      email: 'penny.rose@patient.emr',
      username: 'pennyrose',
      uniqueId: 'MRN-1001',
      firstName: 'Penny',
      lastName: 'Rose',
      gender: 'Female',
      birthDate: new Date('1998-04-12'),
      phone: '+63 912 000 1001'
    },
    {
      email: 'juan.delacruz@patient.emr',
      username: 'juandelacruz',
      uniqueId: 'MRN-1002',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      gender: 'Male',
      birthDate: new Date('1985-11-03'),
      phone: '+63 917 000 1002'
    }
  ]

  for (const sample of samples) {
    const exists = await prisma.user.findUnique({ where: { email: sample.email } })
    if (exists) continue

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email: sample.email,
          username: sample.username,
          password,
          firstName: sample.firstName,
          lastName: sample.lastName,
          uniqueId: sample.uniqueId,
          role: 'PATIENT',
          age: 30,
          bloodType: 'O Positive',
          status: 'Active'
        }
      })

      await tx.patient.create({
        data: {
          email: sample.email,
          name: `${sample.firstName} ${sample.lastName}`,
          phone: sample.phone,
          gender: sample.gender,
          birthDate: sample.birthDate,
          status: 'Active'
        }
      })
    })

    console.log(`Seeded patient: ${sample.email}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
