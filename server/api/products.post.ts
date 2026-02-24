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
            discount_percentage: body.discount_percentage ? Number(body.discount_percentage) : 0,
            sale_start_date: body.sale_start_date || null,
            sale_end_date: body.sale_end_date || null,
            is_collection: body.is_collection || false
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

    // 3. Create Collection Items Relationships
    if (body.is_collection && body.collectionItemIds && Array.isArray(body.collectionItemIds) && body.collectionItemIds.length > 0) {
        const collectionLinks = body.collectionItemIds.map((itemId: string) => ({
            collection_id: product.id,
            product_id: parseInt(itemId) > 0 ? itemId : undefined // Ensure it is treated correctly although it's UUID.
        }))

        // Actually, product IDs are UUIDs. Let's just pass them directly
        const validCollectionLinks = body.collectionItemIds.map((itemId: string) => ({
            collection_id: product.id,
            product_id: itemId
        }))

        const { error: collError } = await serviceClient
            .from('collection_items')
            .insert(validCollectionLinks)

        if (collError) {
            console.error('Failed to link collection items', collError)
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
