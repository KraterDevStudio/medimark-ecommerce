import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = serverSupabaseServiceRole(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Check if user is admin
    const { data: profile } = await client
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.sub)
        .single()

    if (!profile || profile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)

    if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Category name is required' })
    }

    // Auto-generate slug if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data: category, error } = await client
        .from('categories')
        .insert({
            name: body.name,
            slug: slug,
            parent_id: body.parent_id || null,
            image: body.image || null
        })
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create category',
            data: error
        })
    }

    // Invalidate cache
    const storage = useStorage('cache')
    await storage.removeItem('api:categories')
    const productKeys = await storage.getKeys('api:products')
    for (const key of productKeys) {
        await storage.removeItem(key)
    }

    return category
})
