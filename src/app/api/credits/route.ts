import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCredits, grantWelcomeCredits, grantDailyCredit } from '@/lib/credits'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ credits: null }) // 未登录返回 null
  }

  const email = session.user.email

  // 发放首次登录 + 每日额度（幂等，多次调用安全）
  await grantWelcomeCredits(email)
  await grantDailyCredit(email)

  const credits = await getCredits(email)
  return NextResponse.json({ credits })
}
