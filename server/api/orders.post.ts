import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validate required fields
    if (!body.items || body.items.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Cart is empty' })
    }

    if (!body.customerInfo) {
        throw createError({ statusCode: 400, statusMessage: 'Customer information is required' })
    }

    const { name, email, phone, address, city, postalCode, province } = body.customerInfo

    if (!name || !email || !phone || !address || !city || !postalCode || !province) {
        throw createError({ statusCode: 400, statusMessage: 'All customer information fields are required' })
    }

    const client = serverSupabaseServiceRole(event)
    const token = getCookie(event, 'auth_token')

    // Determine if user is logged in
    let userId = null
    let isGuest = true

    if (token) {
        if (token.startsWith('valid-user-')) {
            const tokenUserId = Number(token.replace('valid-user-', ''))
            // Find user profile by legacy ID (we'll need to map this)
            const { data: userProfile } = await client
                .from('user_profiles')
                .select('id')
                .eq('id', tokenUserId)
                .single()

            if (userProfile) {
                userId = userProfile.id
                isGuest = false
            }
        }
    }

    // Create order
    const { data: order, error: orderError } = await client
        .from('orders')
        .insert({
            user_id: isGuest ? null : userId,
            guest_email: isGuest ? email : null,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            customer_address: address,
            customer_city: city,
            customer_postal_code: postalCode,
            customer_province: province,
            total: body.total,
            payment_method: body.paymentMethod || 'transferencia',
            status: 'Pending'
        })
        .select()
        .single()

    if (orderError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create order',
            data: orderError
        })
    }

    // Create order items
    const orderItems = body.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_title: item.title,
        product_price: item.price,
        product_image: item.image,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
    }))

    const { error: itemsError } = await client
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        // Rollback: delete the order if items fail
        await client.from('orders').delete().eq('id', order.id)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create order items',
            data: itemsError
        })
    }

    return { success: true, orderId: order.id }
})
