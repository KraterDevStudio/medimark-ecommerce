import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: categories, error } = await client
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch categories',
            data: error
        })
    }

    // Build tree structure
    const categoryMap = new Map()
    const roots: any[] = []

    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] })
    })

    categories.forEach(cat => {
        if (cat.parent_id) {
            const parent = categoryMap.get(cat.parent_id)
            if (parent) {
                parent.children.push(categoryMap.get(cat.id))
            } else {
                // Parent not found (orphan), treat as root
                roots.push(categoryMap.get(cat.id))
            }
        } else {
            roots.push(categoryMap.get(cat.id))
        }
    })

    return roots
})
