import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: sections, error } = await client
        .from('homepage_sections')
        .select(`
            *,
            products:homepage_section_products(
                display_order,
                product:products(*)
            )
        `)
        .order('display_order', { ascending: true })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch homepage sections',
            data: error
        })
    }

    // Flatten product objects
    return sections.map(section => ({
        ...section,
        products: section.products
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((p: any) => p.product)
    }))
})
