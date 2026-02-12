import { readBody, createError } from 'h3'
import fs from 'fs'
import path from 'path'

const productsPath = path.resolve(process.cwd(), 'server/data/products.json')

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required'
        })
    }

    let products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))
    const initialLength = products.length
    products = products.filter((p: any) => p.id !== body.id)

    if (products.length === initialLength) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Product not found'
        })
    }

    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2))

    return { success: true }
})
