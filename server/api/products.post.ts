import { readBody, createError } from 'h3'
import fs from 'fs'
import path from 'path'

const productsPath = path.resolve(process.cwd(), 'server/data/products.json')

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.title || !body.price) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title and price are required'
        })
    }

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))

    const newProduct = {
        id: Date.now(),
        ...body,
        price: Number(body.price)
    }

    products.push(newProduct)
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2))

    return newProduct
})
