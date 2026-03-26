import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { consumeCredit, getCredits } from '@/lib/credits'

// 懒初始化：避免构建时因缺少环境变量而报错
function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
  })
}

const STYLE_MAP: Record<string, string> = {
  fluff: '温馨日常（fluff）：温柔、甜蜜、治愈，有小确幸的感觉',
  angst: '虐心难过（angst）：情绪压抑、令人揪心，有隐隐的悲伤',
  crack: '沙雕搞笑（crack）：荒诞、好笑、出乎意料，反差感强',
  slowburn: '暗生情愫（slow burn）：含蓄克制，情感在字里行间缓慢流动',
}

export async function POST(req: NextRequest) {
  try {
    const { character, fandom, style } = await req.json()

    if (!character?.trim()) {
      return NextResponse.json({ error: '请输入角色名' }, { status: 400 })
    }

    // 登录用户：检查并扣减 credits
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const email = session.user.email
      const balance = await getCredits(email)
      if (balance <= 0) {
        return NextResponse.json(
          { error: 'NO_CREDITS', message: '额度已用完，请购买额度包继续生成 ✨' },
          { status: 402 }
        )
      }
      // 先扣再生成（避免生成完了扣失败的问题）
      await consumeCredit(email)
    }
    // 未登录用户：不扣 credits，保持现有体验不变

    const styleDesc = STYLE_MAP[style] || STYLE_MAP.fluff
    const fandomLine = fandom?.trim() ? `- 作品/世界观：${fandom}` : ''

    const prompt = `你是一个擅长写同人脑补短文（headcanon）的创作者，风格贴近 AO3 同人社区。

请根据以下信息，写一段 headcanon：
- 角色：${character}
${fandomLine}
- 风格：${styleDesc}

要求：
1. 150 到 250 字之间的中文正文
2. 叙述自然，有画面感，像一个粉丝在脑补角色的日常或内心
3. 不要列点，直接写叙述性正文
4. 不要加标题，直接输出内容`

    const client = getClient()
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const result = response.choices[0]?.message?.content?.trim()
    if (!result) throw new Error('AI_EMPTY')

    return NextResponse.json({ result })
  } catch (error: unknown) {
    console.error('Generate error:', error)

    const msg = error instanceof Error ? error.message : ''
    const status = (error as { status?: number })?.status

    if (msg === 'AI_EMPTY') {
      return NextResponse.json({ error: 'AI 没有返回内容，请重试' }, { status: 500 })
    }
    if (status === 429 || msg.includes('429') || msg.includes('rate_limit')) {
      return NextResponse.json({ error: '当前请求太多，请稍后再试 🙏' }, { status: 429 })
    }
    if (status === 401 || msg.includes('401') || msg.includes('auth')) {
      return NextResponse.json({ error: 'API 配置异常，请联系管理员' }, { status: 500 })
    }
    if (msg.includes('角色名')) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json({ error: '生成失败，请稍后重试' }, { status: 500 })
  }
}
