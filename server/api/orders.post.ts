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

    if (!name || !email || !phone) {
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

    // Calculate effective price helper matching front-end cart logic for verification
    const getEffectivePrice = (item: any) => {
        const basePrice = Number(item.price);
        if (!item.discount_percentage || item.discount_percentage <= 0) return basePrice;

        const now = new Date();
        if (item.sale_start_date && new Date(item.sale_start_date) > now) return basePrice;
        if (item.sale_end_date && new Date(item.sale_end_date) < now) return basePrice;

        const discount = basePrice * (item.discount_percentage / 100);
        return basePrice - discount;
    }

    // Create order items
    const orderItems = body.items.map((item: any) => {
        const effectivePrice = getEffectivePrice(item);
        return {
            order_id: order.id,
            product_id: item.id,
            product_title: item.title,
            product_price: effectivePrice,
            product_image: item.image,
            quantity: item.quantity,
            subtotal: effectivePrice * item.quantity
        };
    })

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

    // Send email notification to admin
    const config = useRuntimeConfig()
    if (config.adminEmail && config.smtpHost) {
        try {
            const nodemailer = await import('nodemailer')
            // @ts-ignore
            const transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: parseInt(config.smtpPort as string) || 587,
                secure: config.smtpPort === '465',
                auth: {
                    user: config.smtpUser,
                    pass: config.smtpPass
                }
            })

            const itemsHtml = body.items.map((item: any) => {
                const ep = getEffectivePrice(item);
                return `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.title}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">$${ep.toLocaleString()}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">$${(ep * item.quantity).toLocaleString()}</td>
                </tr>
            `
            }).join('')

            const customerInfo = body.customerInfo
            const mailOptions = {
                from: `"MediMark Store" <${config.smtpUser}>`,
                to: config.adminEmail,
                subject: `Nuevo Pedido Recibido #${order.id}`,
                html: `
                    <h2>Nuevo Pedido Recibido</h2>
                    <p><strong>Nro de Pedido:</strong> #${order.id}</p>
                    <p><strong>Total:</strong> $${body.total.toLocaleString()}</p>
                    
                    <h3>Datos del Cliente</h3>
                    <p><strong>Nombre:</strong> ${customerInfo.name}</p>
                    <p><strong>Email:</strong> ${customerInfo.email}</p>
                    <p><strong>Teléfono:</strong> ${customerInfo.phone}</p>
                    
                    <h3>Productos</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Producto</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Cantidad</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Precio Unit.</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                `
            }

            // @ts-ignore
            await transporter.sendMail(mailOptions)
            console.log('Order notification email sent successfully')
        } catch (mailError) {
            console.error('Failed to send order notification email:', mailError)
            // We don't throw here to avoid failing the order if email fails
        }
    }

    return { success: true, orderId: order.id }
})
