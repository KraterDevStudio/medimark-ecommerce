import { createError } from 'h3'
import fs from 'fs'
import path from 'path'

const ordersPath = path.resolve(process.cwd(), 'server/data/orders.json')

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    let userId = null
    if (token.startsWith('valid-user-')) {
        userId = Number(token.replace('valid-user-', ''))
    } else if (token === 'valid-admin-token') {
        // Admin might want to see all orders? For now let's strict it to user or just return empty
        return []
    }

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }

    let orders = []
    try {
        orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'))
    } catch (e) { }

    // Filter orders for this user
    const userOrders = orders.filter((o: any) => o.userId === userId)

    // Sort by date desc
    userOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return userOrders
})
