import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { capturePayPalOrder, PAYPAL_PACKS, PackId } from '@/lib/paypal'
import { addCredits } from '@/lib/credits'

export async function POST(req: NextRequest) {
  try {
    // 必须登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '请先登录后再购买' }, { status: 401 })
    }

    const { orderID, packId } = await req.json()

    if (!orderID || typeof orderID !== 'string') {
      return NextResponse.json({ error: '缺少 orderID' }, { status: 400 })
    }

    const pack = PAYPAL_PACKS[packId as PackId]
    if (!pack) {
      return NextResponse.json({ error: '无效的套餐' }, { status: 400 })
    }

    // 服务端 capture
    const result = await capturePayPalOrder(orderID)

    if (result.status !== 'COMPLETED') {
      console.error('PayPal capture not completed:', result)
      return NextResponse.json({ error: `支付状态异常: ${result.status}` }, { status: 400 })
    }

    // 发放 credits
    const email = session.user.email
    const newBalance = await addCredits(email, pack.credits)
    console.log(`PayPal credits added: ${email} +${pack.credits} → total ${newBalance}`)

    return NextResponse.json({ success: true, credits: pack.credits, newBalance })
  } catch (err) {
    console.error('PayPal capture error:', err)
    return NextResponse.json({ error: '支付处理失败，请稍后重试' }, { status: 500 })
  }
}
