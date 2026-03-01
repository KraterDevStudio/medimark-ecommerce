import { createError } from 'h3'
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

  const { data, error } = await client
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch coupons',
      data: error
    })
  }

  return data || []
})
