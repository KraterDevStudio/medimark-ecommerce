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
            is_archived: body.is_archived
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

    // Invalidate cache
    const storage = useStorage('cache')
    const keys = await storage.getKeys()
    const productKeys = keys.filter(k => k.startsWith('products_'))
    for (const key of productKeys) {
        await storage.removeItem(key)
    }

    return product
})
