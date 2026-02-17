import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const { category, search } = getQuery(event)
    const storage = useStorage('cache')
    const cacheKey = `api:products:cat:${category || 'all'}:search:${search || 'none'}`

    // Try to get from cache
    const cached = await storage.getItem(cacheKey)
    if (cached) return cached

    const client = await serverSupabaseClient(event)

    // Base select - always fetch all categories for display
    let selectQuery = `
            *,
            categories:product_categories(
                category:categories(*)
            )
        `

    // If filtering, add an inner join to filter by category slug
    // We use a separate alias 'filter_categories' so we don't restrict the 'categories' array
    if (category) {
        selectQuery += `,
            filter_categories:product_categories!inner(
                category:categories!inner(slug)
            )
        `
    }

    let query = client
        .from('products')
        .select(selectQuery)

    if (category) {
        query = query.eq('filter_categories.category.slug', category)
    }

    if (search) {
        query = query.ilike('title', `%${search}%`)
    }

    const { data: products, error } = await query.order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch products',
            data: error
        })
    }

    // Transform result to flatten categories
    const transformedProducts = products.map(product => {
        const categories = product.categories.map((pc: any) => pc.category).filter(Boolean)
        // We'll keep the full categories array, but also a string for legacy simple display
        const categoryString = categories.map((c: any) => c.name).join(', ')

        // Remove the internal filter alias if present
        const { filter_categories, ...rest } = product

        return {
            ...rest,
            categories,
            category: categoryString // Backward compatibility/convenience
        }
    })

    // Store in cache
    await storage.setItem(cacheKey, transformedProducts)

    return transformedProducts
})
