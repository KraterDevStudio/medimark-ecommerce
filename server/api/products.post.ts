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

    const { data: product, error } = await serviceClient
        .from('products')
        .insert({
            title: body.title,
            price: Number(body.price),
            description: body.description || null,
            category: body.category || null,
            image: body.image || null
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

    return product
})
