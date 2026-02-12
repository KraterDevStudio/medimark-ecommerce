import { readBody, createError } from 'h3'
import fs from 'fs'
import path from 'path'

const usersPath = path.resolve(process.cwd(), 'server/data/users.json')

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.email || !body.password || !body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
    }

    let users = []
    try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    } catch (e) {
        // File might not exist or be empty
    }

    if (users.find((u: any) => u.email === body.email)) {
        throw createError({ statusCode: 409, statusMessage: 'Email already exists' })
    }

    const newUser = {
        id: Date.now(),
        name: body.name,
        email: body.email,
        password: body.password,
        role: 'customer'
    }

    users.push(newUser)
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))

    // Simulate sending email
    console.log(`[EMAIL SIMULATION] Sending registration confirmation to ${newUser.email}`)

    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: 'customer' } }
})
