import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // Check if user is admin
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const serviceClient = serverSupabaseServiceRole(event)
    const { data: profile } = await serviceClient
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.sub)
        .single()

    if (profile?.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.price) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Title and price are required'
        })
    }

    // 1. Create Product
    const { data: product, error } = await serviceClient
        .from('products')
        .insert({
            title: body.title,
            price: Number(body.price),
            description: body.description || null,
            image: body.image || null,
            varieties: body.varieties || []
            // category column is deprecated/removed in favor of relationship
        })
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create product',
            data: error
        })
    }

    // 2. Create Category Relationships
    if (body.categoryIds && Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
        const categoryLinks = body.categoryIds.map((catId: number) => ({
            product_id: product.id,
            category_id: catId
        }))

        const { error: relError } = await serviceClient
            .from('product_categories')
            .insert(categoryLinks)

        if (relError) {
            // Log error but don't fail the whole request (product is created)
            console.error('Failed to link categories', relError)
        }
    }

    // Invalidate cache
    const storage = useStorage('cache')
    const keys = await storage.getKeys()
    const productKeys = keys.filter(k => k.startsWith('products_'))
    for (const key of productKeys) {
        await storage.removeItem(key)
    }

    return product
})
