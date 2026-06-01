import { PrismaClient } from 'db-client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrisma() {
  return new PrismaClient()
}

function isStaleClient(client: PrismaClient | undefined) {
  return !client || typeof (client as PrismaClient & { patientMedication?: unknown }).patientMedication === 'undefined'
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV !== 'production') {
    if (isStaleClient(globalForPrisma.prisma)) {
      globalForPrisma.prisma = createPrisma()
    }
    return globalForPrisma.prisma!
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma()
  }
  return globalForPrisma.prisma
}

/** Always routes through getPrisma() so dev HMR cannot leave a stale client cached. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma()
    const value = client[prop as keyof PrismaClient]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
