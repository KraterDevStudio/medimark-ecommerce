import { readBody, createError } from 'h3'
import fs from 'fs'
import path from 'path'

const usersPath = path.resolve(process.cwd(), 'server/data/users.json')

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Admin check
    if (body.password === 'admin123' && (body.email === 'admin' || body.email === 'admin@medimark.com')) {
        setCookie(event, 'auth_token', 'valid-admin-token', { httpOnly: false, maxAge: 60 * 60 * 24 })
        return { success: true, user: { name: 'Administrator', role: 'admin' } }
    }

    // User check
    let users = []
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    } catch (e) { }

    const user = users.find((u: any) => u.email === body.email && u.password === body.password)

    if (user) {
        setCookie(event, 'auth_token', `valid-user-${user.id}`, { httpOnly: false, maxAge: 60 * 60 * 24 })
        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: 'customer' } }
    }

    throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
    })
})
