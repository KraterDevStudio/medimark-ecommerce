import { createError, readBody } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import { calculateCouponDiscount, isCouponValidNow, normalizeCouponCode, roundMoney, type CouponRecord } from '~/server/utils/coupons'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const code = normalizeCouponCode(body?.code || '')
  const subtotal = Number(body?.subtotal || 0)

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon code is required' })
  }

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Subtotal is invalid' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: coupon, error } = await client
    .from('coupons')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to validate coupon',
      data: error
    })
  }

  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'Coupon not found' })
  }

  if (!isCouponValidNow(coupon as CouponRecord)) {
    throw createError({ statusCode: 400, statusMessage: 'Coupon is not active or has expired' })
  }

  const discountAmount = calculateCouponDiscount(coupon as CouponRecord, subtotal)
  const totalAfterDiscount = roundMoney(Math.max(0, subtotal - discountAmount))

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount
    },
    subtotal: roundMoney(subtotal),
    total: totalAfterDiscount
  }
})
