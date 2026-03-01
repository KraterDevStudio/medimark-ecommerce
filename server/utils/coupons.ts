export interface CouponRecord {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number | null
  current_uses: number
  valid_from: string | null
  valid_to: string | null
  is_active: boolean
}

export const normalizeCouponCode = (code: string) => code.trim().toUpperCase()

export const roundMoney = (amount: number) => Math.round(amount * 100) / 100

export const isCouponValidNow = (coupon: CouponRecord, now = new Date()) => {
  if (!coupon.is_active) return false
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) return false
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return false
  if (coupon.valid_to && new Date(coupon.valid_to) < now) return false
  return true
}

export const calculateCouponDiscount = (coupon: CouponRecord, subtotal: number) => {
  const normalizedSubtotal = Math.max(0, Number(subtotal || 0))
  if (normalizedSubtotal <= 0) return 0

  if (coupon.type === 'percentage') {
    return roundMoney(Math.min(normalizedSubtotal, normalizedSubtotal * (Number(coupon.value) / 100)))
  }

  return roundMoney(Math.min(normalizedSubtotal, Number(coupon.value)))
}
