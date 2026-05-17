// server/api/admins.get.ts
import { prisma } from '../utils/prisma' // One level up to find utils from api root!

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string || '').toLowerCase().trim()

    // 1. Fetch matching user records from the database where role is administrative
    const admins = await prisma.user.findMany({
      where: {
        // Strict role verification: Only stream administrative tiers
        role: { in: ['ADMIN', 'HR', 'REGISTRAR'] },
        
        // If there's a search string active, match it cleanly across attributes
        ...(search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Map the structural database records to the exact keys your frontend table expects
    return admins.map((admin: any) => {
      // Safely calculate name or fallback to username string
      const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim()
      
      return {
        id: admin.id,
        username: admin.username,
        name: fullName || admin.username || 'Unknown Admin',
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        // String() wrapper stops crashes if ID is a number!
        adminId: admin.uniqueId || `#ADM-${String(admin.id).slice(0, 4).toUpperCase()}`,
        role: admin.role || 'ADMIN',
        status: 'Active',
        // Sets color themes elegantly depending on the administrative scope
        colorClass: admin.role === 'HR' ? 'teal' : 'purple',
        date: new Date(admin.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    })

  } catch (error) {
    console.error('Error loading admin roster:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to stream user records from database.'
    })
  }
})