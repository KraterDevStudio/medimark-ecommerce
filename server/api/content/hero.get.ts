import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('homepage_hero_slides')
        .select('*')
        .order('display_order', { ascending: true })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch hero slides',
            data: error
        })
    }

    return data
})
