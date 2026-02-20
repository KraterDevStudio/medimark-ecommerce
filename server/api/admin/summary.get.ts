import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Check if user is admin
    const { data: profile } = await client
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.id) // Nuxt Supabase user object usually has id
        .maybeSingle()

    // Fallback to sub if id is missing (depends on version)
    const userId = user.id || (user as any).sub

    if (!profile || profile.role !== 'admin') {
        // Try with sub if id didn't work handled by userId logic above, but let's be safe
        const { data: profileRetry } = await client
            .from('user_profiles')
            .select('role')
            .eq('auth_user_id', userId)
            .maybeSingle()

        if (profileRetry?.role !== 'admin') {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
        }
    }

    // Parallel stats fetching
    const [
        { count: productsCount },
        { count: categoriesCount },
        { count: pendingOrdersCount },
        { data: revenueData }
    ] = await Promise.all([
        client.from('products').select('*', { count: 'exact', head: true }),
        client.from('categories').select('*', { count: 'exact', head: true }),
        client.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente'),
        client.from('orders').select('total').in('status', ['Paga', 'Completada'])
    ])

    const totalRevenue = revenueData?.reduce((acc, order) => acc + Number(order.total), 0) || 0

    return {
        totalProducts: productsCount || 0,
        totalCategories: categoriesCount || 0,
        pendingOrders: pendingOrdersCount || 0,
        totalRevenue
    }
})
