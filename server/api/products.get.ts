import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: products, error } = await client
        .from('products')
        .select(`
            *,
            categories:product_categories(
                category:categories(*)
            )
        `)
        .order('created_at', { ascending: false })

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

        return {
            ...product,
            categories,
            category: categoryString // Backward compatibility/convenience
        }
    })

    return transformedProducts
})
