import { createError, getQuery } from 'h3'
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

  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon id is required' })
  }

  const { error } = await client
    .from('coupons')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete coupon',
      data: error
    })
  }

  return { success: true }
})
