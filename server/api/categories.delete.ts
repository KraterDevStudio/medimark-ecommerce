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
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Category ID is required' })
    }

    // Check for children
    const { count: childCount, error: checkError } = await client
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', id)

    if (childCount && childCount > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete category with subcategories. Remove or move them first.'
        })
    }

    // Check for products (optional, could just set to null, but warning is better)
    const { count: productCount } = await client
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)

    if (productCount && productCount > 0) {
        // Option: we could allow and set to null, but let's be strict for now
        // Or we just proceed because ON DELETE SET NULL is in schema
    }

    const { error } = await client
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete category',
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

    return { success: true }
})
