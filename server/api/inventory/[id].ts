// server/api/inventory/[id].ts
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const id = getRouterParam(event, 'id')

  // --- POST/PUT HANDLE: CREATE OR UPDATE AN ITEM ---
  if (method === 'POST' || method === 'PUT') {
    try {
      const body = await readBody(event)
      const { name, category, stock, price, unit } = body

      if (!name || !category || stock === undefined || price === undefined) {
        throw createError({ statusCode: 400, statusMessage: 'Required data fields are missing.' })
      }

      const payload = {
        name: name.trim(),
        category,
        stock: parseInt(stock) || 0,
        price: parseFloat(price) || 0.00,
        unit: unit || 'pcs'
      }

      if (id === 'new') {
        // Create new item entry block
        const newItem = await prisma.inventory.create({ data: payload })
        return { success: true, data: newItem }
      } else {
        // Update explicit item block matching router id
        const updatedItem = await prisma.inventory.update({
          where: { id },
          data: payload
        })
        return { success: true, data: updatedItem }
      }
    } catch (error: any) {
      console.error('Database write error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to process inventory adjustments.' })
    }
  }

  // --- DELETE HANDLE: REMOVE AN ITEM ---
  if (method === 'DELETE') {
    try {
      if (!id || id === 'new') throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id.' })

      await prisma.inventory.delete({ where: { id } })
      return { success: true, message: 'Item evicted from catalog registry.' }
    } catch (error) {
      console.error('Database delete error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to execute item cleanup action.' })
    }
  }
})