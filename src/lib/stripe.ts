import Stripe from 'stripe'

// 懒初始化，避免构建时因缺少环境变量报错
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

/** 套餐定义，price 单位：分（CNY）*/
export const CREDIT_PACKS = {
  pack_30: { credits: 30, amount: 600, label: '小包 30 次', currency: 'cny' },
  pack_100: { credits: 100, amount: 1500, label: '中包 100 次', currency: 'cny' },
  pack_300: { credits: 300, amount: 3500, label: '大包 300 次', currency: 'cny' },
} as const

export type PackId = keyof typeof CREDIT_PACKS
