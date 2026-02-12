import { readBody, createError } from 'h3'
import fs from 'fs'
import path from 'path'

const ordersPath = path.resolve(process.cwd(), 'server/data/orders.json')

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    let userId = null
    if (token.startsWith('valid-user-')) {
        userId = Number(token.replace('valid-user-', ''))
    } else {
        // Admin or invalid
        throw createError({ statusCode: 403, statusMessage: 'Only customers can checkout' })
    }

    if (!body.items || body.items.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Cart is empty' })
    }

    let orders = []
    try {
        orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'))
    } catch (e) { }

    const newOrder = {
        id: Date.now(),
        userId,
        items: body.items,
        total: body.total,
        date: new Date().toISOString(),
        status: 'Pending'
    }

    orders.push(newOrder)
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2))

    return { success: true, orderId: newOrder.id }
})
