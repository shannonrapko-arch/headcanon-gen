/**
 * Credits 工具层
 * 使用 Vercel KV (Redis) 存储，key = credits:{email}
 * email 作为用户唯一标识，来自 NextAuth session
 */
import { kv } from '@vercel/kv'

const key = (email: string) => `credits:${email}`

/** 读取当前余额，不存在返回 0 */
export async function getCredits(email: string): Promise<number> {
  const val = await kv.get<number>(key(email))
  return val ?? 0
}

/** 增加 credits（购买、赠送） */
export async function addCredits(email: string, amount: number): Promise<number> {
  const newVal = await kv.incrby(key(email), amount)
  return newVal
}

/** 消耗 1 个 credit，余额不足返回 false */
export async function consumeCredit(email: string): Promise<boolean> {
  const current = await getCredits(email)
  if (current <= 0) return false
  await kv.decrby(key(email), 1)
  return true
}

/** 首次登录赠送 10 次（幂等：已送过则跳过） */
export async function grantWelcomeCredits(email: string): Promise<void> {
  const welcomeKey = `welcome_granted:${email}`
  const already = await kv.get(welcomeKey)
  if (already) return
  await kv.set(welcomeKey, '1')
  await addCredits(email, 10)
}

/** 每日登录赠送 1 次（幂等：当天已送过则跳过） */
export async function grantDailyCredit(email: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const dailyKey = `daily_granted:${email}:${today}`
  const already = await kv.get(dailyKey)
  if (already) return
  await kv.set(dailyKey, '1', { ex: 60 * 60 * 25 }) // 25h TTL，跨时区兼容
  await addCredits(email, 1)
}
