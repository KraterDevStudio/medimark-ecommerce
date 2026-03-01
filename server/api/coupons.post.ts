import { createError, readBody } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { normalizeCouponCode } from '~/server/utils/coupons'

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
  const code = normalizeCouponCode(body.code || '')
  const type = body.type
  const value = Number(body.value)
  const maxUses = body.max_uses !== null && body.max_uses !== undefined && body.max_uses !== ''
    ? Number(body.max_uses)
    : null
  const validFrom = body.valid_from || null
  const validTo = body.valid_to || null

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon code is required' })
  }

  if (!['percentage', 'fixed'].includes(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon type is invalid' })
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon value must be greater than zero' })
  }

  if (type === 'percentage' && value > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Percentage coupon cannot exceed 100' })
  }

  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'max_uses must be a positive integer' })
  }

  if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
    throw createError({ statusCode: 400, statusMessage: 'valid_from cannot be later than valid_to' })
  }

  const { data, error } = await client
    .from('coupons')
    .insert({
      code,
      type,
      value,
      max_uses: maxUses,
      valid_from: validFrom,
      valid_to: validTo,
      is_active: body.is_active !== false
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create coupon',
      data: error
    })
  }

  return data
})
