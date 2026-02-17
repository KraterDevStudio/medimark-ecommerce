import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = serverSupabaseServiceRole(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { data: profile } = await client
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.sub)
        .single()

    if (!profile || profile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)
    const { id, ...updates } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Category ID is required' })
    }

    if (updates.name && !updates.slug) {
        updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const { data: category, error } = await client
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update category',
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
