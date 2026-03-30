/**
 * PayPal 工具层
 * 套餐定义 + 服务端 API 调用（OAuth + Orders）
 */

/** 套餐定义，amount 单位：USD */
export const PAYPAL_PACKS = {
  pack_30: { credits: 30, amount: '0.99', label: '30 Credits', currency: 'USD' },
  pack_100: { credits: 100, amount: '2.99', label: '100 Credits', currency: 'USD' },
  pack_300: { credits: 300, amount: '6.99', label: '300 Credits', currency: 'USD' },
} as const

export type PackId = keyof typeof PAYPAL_PACKS

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

/** 获取 PayPal Access Token（Client Credentials） */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal token error: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.access_token as string
}

/** Capture 一个已 approved 的 PayPal Order */
export async function capturePayPalOrder(orderId: string): Promise<{
  status: string
  email?: string
}> {
  const accessToken = await getPayPalAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal capture error: ${res.status} ${text}`)
  }

  const data = await res.json()
  // 提取付款方 email（可选）
  const email =
    data.payment_source?.paypal?.email_address ||
    data.payer?.email_address ||
    undefined

  return { status: data.status, email }
}
