import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required'
        })
    }

    const client = serverSupabaseServiceRole(event)

    const { error } = await client
        .from('products')
        .delete()
        .eq('id', body.id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete product',
            data: error
        })
    }

    // Invalidate cache
    const storage = useStorage('cache')
    const productKeys = await storage.getKeys('api:products')
    for (const key of productKeys) {
        await storage.removeItem(key)
    }

    return { success: true, message: 'Product deleted successfully' }
})
