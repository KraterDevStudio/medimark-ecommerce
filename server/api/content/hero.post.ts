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
    const { slides } = body

    if (!Array.isArray(slides)) {
        throw createError({ statusCode: 400, statusMessage: 'Slides must be an array' })
    }

    // This is a sync endpoint: delete all current and insert new ones
    // We use a transaction-like approach (though simple delete/insert here)

    // 1. Delete all existing slides
    await client.from('homepage_hero_slides').delete().neq('id', 0) // Delete all

    // 2. Insert new ones if any
    if (slides.length > 0) {
        const insertData = slides.map((slide, index) => ({
            image_url: slide.image_url,
            link_url: slide.link_url || null,
            display_order: index
        }))

        const { error: insertError } = await client
            .from('homepage_hero_slides')
            .insert(insertData)

        if (insertError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to update hero slides',
                data: insertError
            })
        }
    }

    // Invalidate homepage cache if needed (assuming we'll cache the home page data)
    const storage = useStorage('cache')
    await storage.removeItem('api:content:hero')

    return { success: true }
})
