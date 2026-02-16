import { createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const client = serverSupabaseServiceRole(event)

    // Fetch numeric userId from user_profiles table using auth_user_id (UUID)
    const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.sub)
        .maybeSingle()

    if (profileError || !profile) {
        // If user is authenticated but has no profile, they won't have orders
        return []
    }

    const userId = profile.id
    const isAdmin = profile.role === 'admin';


    // Fetch orders with their items
    const { data: orders, error } = !isAdmin ? await client
        .from('orders')
        .select(`
      *,
      order_items (
        id,
        product_id,
        product_title,
        product_price,
        product_image,
        quantity,
        subtotal
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        : await client
            .from('orders')
            .select(`
      *,
      order_items (
        id,
        product_id,
        product_title,
        product_price,
        product_image,
        quantity,
        subtotal
      )
    `)
            .order('created_at', { ascending: false })


    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch orders',
            data: error
        })
    }

    // Transform to match old format (items array instead of order_items)
    const transformedOrders = (orders || []).map(order => ({
        id: order.id,
        userId: order.user_id,
        guestEmail: order.guest_email,
        customerInfo: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address,
            city: order.customer_city,
            postalCode: order.customer_postal_code,
            province: order.customer_province
        },
        items: order.order_items.map((item: any) => ({
            id: item.product_id,
            title: item.product_title,
            price: item.product_price,
            image: item.product_image,
            quantity: item.quantity
        })),
        total: order.total,
        paymentMethod: order.payment_method,
        date: order.created_at,
        status: order.status
    }))

    console.log(transformedOrders)
    return transformedOrders
})
