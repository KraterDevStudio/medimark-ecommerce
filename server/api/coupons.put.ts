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
  const id = body.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon id is required' })
  }

  const { data: existingCoupon, error: existingCouponError } = await client
    .from('coupons')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (existingCouponError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch coupon',
      data: existingCouponError
    })
  }

  if (!existingCoupon) {
    throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  }

  const updates: Record<string, any> = {}

  if (body.code !== undefined) {
    const code = normalizeCouponCode(body.code || '')
    if (!code) {
      throw createError({ statusCode: 400, statusMessage: 'Coupon code cannot be empty' })
    }
    updates.code = code
  }

  if (body.type !== undefined) {
    if (!['percentage', 'fixed'].includes(body.type)) {
      throw createError({ statusCode: 400, statusMessage: 'Coupon type is invalid' })
    }
    updates.type = body.type
  }

  if (body.value !== undefined) {
    const value = Number(body.value)
    if (!Number.isFinite(value) || value <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Coupon value must be greater than zero' })
    }
    updates.value = value
  }

  if (body.max_uses !== undefined) {
    if (body.max_uses === null || body.max_uses === '') {
      updates.max_uses = null
    } else {
      const maxUses = Number(body.max_uses)
      if (!Number.isInteger(maxUses) || maxUses <= 0) {
        throw createError({ statusCode: 400, statusMessage: 'max_uses must be a positive integer' })
      }
      updates.max_uses = maxUses
    }
  }

  if (body.current_uses !== undefined) {
    const currentUses = Number(body.current_uses)
    if (!Number.isInteger(currentUses) || currentUses < 0) {
      throw createError({ statusCode: 400, statusMessage: 'current_uses must be a non-negative integer' })
    }
    updates.current_uses = currentUses
  }

  if (body.valid_from !== undefined) {
    updates.valid_from = body.valid_from || null
  }

  if (body.valid_to !== undefined) {
    updates.valid_to = body.valid_to || null
  }

  if (body.is_active !== undefined) {
    updates.is_active = Boolean(body.is_active)
  }

  const nextType = updates.type ?? existingCoupon.type
  const nextValue = updates.value ?? existingCoupon.value

  if (nextType === 'percentage' && Number(nextValue) > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Percentage coupon cannot exceed 100' })
  }

  const nextValidFrom = updates.valid_from ?? existingCoupon.valid_from
  const nextValidTo = updates.valid_to ?? existingCoupon.valid_to

  if (nextValidFrom && nextValidTo && new Date(nextValidFrom) > new Date(nextValidTo)) {
    throw createError({ statusCode: 400, statusMessage: 'valid_from cannot be later than valid_to' })
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const { data, error } = await client
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update coupon',
      data: error
    })
  }

  return data
})
