import { readBody, createError } from 'h3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
    const index = products.findIndex((p: any) => p.id === body.id)

    if (index === -1) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Product not found'
        })
    }

    products[index] = { ...products[index], ...body, price: Number(body.price) }
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2))

    return products[index]
})
