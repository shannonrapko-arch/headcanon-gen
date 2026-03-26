import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { addCredits } from '@/lib/credits'
import Stripe from 'stripe'

// App Router: 禁用默认 body 解析，读取原始 Buffer 做 Stripe 验签
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await req.arrayBuffer()
    const buf = Buffer.from(rawBody)
    event = getStripe().webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 只处理支付成功事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // 确认已付款（非 Bank Transfer 等异步支付）
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, skipped: 'not_paid' })
    }

    const email = session.metadata?.email
    const credits = Number(session.metadata?.credits)

    if (!email || !credits || credits <= 0) {
      console.error('Webhook missing metadata:', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      const newBalance = await addCredits(email, credits)
      console.log(`Credits added: ${email} +${credits} → total ${newBalance}`)
    } catch (err) {
      console.error('Failed to add credits:', err)
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
