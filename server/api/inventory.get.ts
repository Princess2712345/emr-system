// server/api/inventory.get.ts
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string || '').toLowerCase().trim()

    // Fetch database items matching textual inputs
    const items = await prisma.inventory.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    })

    // Map database properties to the frontend payload keys and dynamically resolve stock status badges
    return items.map(item => {
      let resolvedStatus = 'In-Stock'
      if (item.stock === 0) {
        resolvedStatus = 'Out-of-Stock'
      } else if (item.stock <= 50) {
        resolvedStatus = 'Low-Stock'
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        stock: item.stock,
        unit: item.unit,
        price: item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        status: resolvedStatus
      }
    })

  } catch (error) {
    console.error('Failed to get inventory records:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Database Reading Error.' })
  }
})