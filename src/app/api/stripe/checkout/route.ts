import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe, CREDIT_PACKS, PackId } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    // 必须登录才能购买
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '请先登录后再购买' }, { status: 401 })
    }

    const { packId } = await req.json()
    const pack = CREDIT_PACKS[packId as PackId]
    if (!pack) {
      return NextResponse.json({ error: '无效的套餐' }, { status: 400 })
    }

    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const stripe = getStripe()

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pack.currency,
            unit_amount: pack.amount,
            product_data: {
              name: `HeadcanonGen · ${pack.label}`,
              description: `${pack.credits} 次生成额度，买断不过期`,
            },
          },
        },
      ],
      // 把用户 email 和套餐信息存在 metadata，webhook 里用
      metadata: {
        email: session.user.email,
        packId,
        credits: String(pack.credits),
      },
      customer_email: session.user.email,
      success_url: `${siteUrl}/?payment=success`,
      cancel_url: `${siteUrl}/?payment=cancel`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: '创建支付失败，请稍后重试' }, { status: 500 })
  }
}
