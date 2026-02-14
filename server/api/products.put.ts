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
        .eq('auth_user_id', user.id)
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
            category: body.category,
            image: body.image
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

    return product
})
