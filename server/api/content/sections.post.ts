import { readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = serverSupabaseServiceRole(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { data: profile } = await client
        .from('user_profiles')
        .select('role')
        .eq('auth_user_id', user.sub)
        .single()

    if (!profile || profile.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const body = await readBody(event)
    const { id, title, description, display_order, productIds } = body

    if (!title) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    }

    let sectionId = id

    // 1. Create or Update Section
    if (id) {
        const { error: updateError } = await client
            .from('homepage_sections')
            .update({ title, description, display_order })
            .eq('id', id)

        if (updateError) throw updateError
    } else {
        const { data: newSection, error: insertError } = await client
            .from('homepage_sections')
            .insert({ title, description, display_order })
            .select()
            .single()

        if (insertError) throw insertError
        sectionId = newSection.id
    }

    // 2. Update Products if provided
    if (Array.isArray(productIds)) {
        // Delete existing relations
        await client.from('homepage_section_products').delete().eq('section_id', sectionId)

        // Insert new ones
        if (productIds.length > 0) {
            const relations = productIds.map((pid, index) => ({
                section_id: sectionId,
                product_id: pid,
                display_order: index
            }))

            const { error: relError } = await client
                .from('homepage_section_products')
                .insert(relations)

            if (relError) throw relError
        }
    }

    return { success: true, id: sectionId }
})
