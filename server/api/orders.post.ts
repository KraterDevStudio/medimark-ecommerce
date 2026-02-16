import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

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
    const user = await serverSupabaseUser(event)

    // Determine if user is logged in
    let userId = null
    let isGuest = true

    if (user) {
        // Find user profile by Supabase UUID to get numeric ID
        const { data: profile, error: profileError } = await client
            .from('user_profiles')
            .select('id')
            .eq('auth_user_id', user.sub)
            .maybeSingle()

        console.log('User UUID:', user.sub);
        if (profileError) {
            console.error('Error fetching user profile:', profileError)
        } else if (profile) {
            userId = profile.id
            isGuest = false
        } else {
            // Fallback: Create profile if it doesn't exist (DB trigger might have failed)
            console.log('User profile missing, creating fallback profile for:', user.sub)
            const { data: newProfile, error: createError } = await client
                .from('user_profiles')
                .insert({
                    auth_user_id: user.sub,
                    email: user.email,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
                    phone: phone || '', // Use phone from order as fallback
                    address: address || '',
                    city: city || '',
                    postal_code: postalCode || '',
                    province: province || ''
                })
                .select('id')
                .single()

            if (createError) {
                console.error('Failed to create fallback profile:', createError)
            } else if (newProfile) {
                userId = newProfile.id
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
            status: 'Pendiente'
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
