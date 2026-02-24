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

    if (!body.id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required'
        })
    }

    const { data: product, error } = await serviceClient
        .from('products')
        .update({
            title: body.title,
            price: Number(body.price),
            description: body.description,
            image: body.image,
            varieties: body.varieties || [],
            is_archived: body.is_archived,
            discount_percentage: body.discount_percentage !== undefined ? Number(body.discount_percentage) : undefined,
            sale_start_date: body.sale_start_date !== undefined ? body.sale_start_date : undefined,
            sale_end_date: body.sale_end_date !== undefined ? body.sale_end_date : undefined,
            is_collection: body.is_collection
        })
        .eq('id', body.id)
        .select()
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Product not found'
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update product',
            data: error
        })
    }

    // 2. Update Category Relationships
    if (body.categoryIds && Array.isArray(body.categoryIds)) {
        // First delete existing relationships
        await serviceClient
            .from('product_categories')
            .delete()
            .eq('product_id', body.id)

        // Then insert new ones
        if (body.categoryIds.length > 0) {
            const categoryLinks = body.categoryIds.map((catId: number) => ({
                product_id: body.id,
                category_id: catId
            }))

            const { error: relError } = await serviceClient
                .from('product_categories')
                .insert(categoryLinks)

            if (relError) {
                console.error('Failed to update category links', relError)
            }
        }
    }

    // 3. Update Collection Items
    if (body.is_collection && body.collectionItemIds !== undefined && Array.isArray(body.collectionItemIds)) {
        // First delete existing relationships
        await serviceClient
            .from('collection_items')
            .delete()
            .eq('collection_id', body.id)

        // Then insert new ones
        if (body.collectionItemIds.length > 0) {
            const collectionLinks = body.collectionItemIds.map((itemId: string) => ({
                collection_id: body.id,
                product_id: itemId
            }))

            const { error: collError } = await serviceClient
                .from('collection_items')
                .insert(collectionLinks)

            if (collError) {
                console.error('Failed to update collection item links', collError)
            }
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
