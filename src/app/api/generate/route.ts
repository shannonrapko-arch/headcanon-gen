import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.9,
    })

    const result = response.choices[0]?.message?.content?.trim()
    if (!result) throw new Error('AI 未返回内容')

    return NextResponse.json({ result })
  } catch (error: unknown) {
    console.error('Generate error:', error)
    const message = error instanceof Error ? error.message : '生成失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
