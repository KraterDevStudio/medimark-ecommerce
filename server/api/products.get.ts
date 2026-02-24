import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const { category, search, hardRefresh, type } = getQuery(event)
    const storage = useStorage('cache')

    // Check if user is admin
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)
    let isAdmin = false

    // if hardRefresh is true and user is admin, delete all products from cache
    if (hardRefresh && user?.role === 'admin') {
        await storage.removeItem('products_admin_*')
    }

    if (user) {
        const { data: profile } = await client
            .from('user_profiles')
            .select('role')
            .eq('auth_user_id', user.sub)
            .maybeSingle()
        isAdmin = profile?.role === 'admin'
    }

    const cacheKey = `products_${isAdmin ? 'admin' : 'public'}_${category || 'all'}_${search || 'none'}_${type || 'all'}`

    // Try to get from cache
    const cached = await storage.getItem(cacheKey)
    if (cached) return cached

    // Base select - always fetch all categories for display
    let selectQuery = `
            *,
            categories:product_categories(
                category:categories(*)
            ),
            collection_items:collection_items!collection_id(
                product:products!product_id(id, title, price, discount_percentage, sale_start_date, sale_end_date, image)
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

    if (type === 'collection') {
        query = query.eq('is_collection', true)
    } else if (type === 'product') {
        query = query.eq('is_collection', false)
    }

    // Filter archived products for non-admins
    if (!isAdmin) {
        query = query.eq('is_archived', false)
    }

    const { data: products, error } = await query.order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch products',
            data: error
        })
    }

    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

    // Transform result to flatten categories and apply manual search filter
    let transformedProducts = products.map(product => {
        const categories = (product.categories as any[]).map((pc: any) => pc.category).filter(Boolean)
        const categoryString = categories.map((c: any) => c.name).join(', ')

        let collectionItemsObj = [];
        if (product.collection_items) {
            collectionItemsObj = (product.collection_items as any[]).map((ci: any) => ci.product).filter(Boolean)
        }

        const { filter_categories, collection_items, ...rest } = product as any

        return {
            ...rest,
            categories,
            category: categoryString,
            collection_items: collectionItemsObj
        }
    })

    if (search) {
        const normalizedSearch = normalize(search as string)
        transformedProducts = transformedProducts.filter(p =>
            normalize(p.title).includes(normalizedSearch) ||
            normalize(p.description || '').includes(normalizedSearch)
        )
    }

    // Store in cache
    await storage.setItem(cacheKey, transformedProducts)

    return transformedProducts
})
