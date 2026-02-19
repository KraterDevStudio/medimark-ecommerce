import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = serverSupabaseServiceRole(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.sub)
        .single()

    if (profileError || !profile || profile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)
    const { id, status } = body

    if (!id || !status) {
        throw createError({ statusCode: 400, statusMessage: 'Order ID and status are required' })
    }

    const validStatuses = ['Pendiente', 'Paga', 'Completada', 'Cancelada']
    if (!validStatuses.includes(status)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    }

    const { error: updateError } = await client
        .from('orders')
        .update({ status })
        .eq('id', id)

    if (updateError) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update order status',
            data: updateError
        })
    }

    return { success: true }
})
