'use client'

import { useState } from 'react'

const STYLES = [
  { value: 'fluff', label: '💛 温馨', desc: '日常甜蜜' },
  { value: 'angst', label: '🌧️ 虐心', desc: '难过揪心' },
  { value: 'crack', label: '😂 沙雕', desc: '搞笑乱来' },
  { value: 'slowburn', label: '🌙 暗恋', desc: '暗生情愫' },
]

export default function Home() {
  const [character, setCharacter] = useState('')
  const [fandom, setFandom] = useState('')
  const [style, setStyle] = useState('fluff')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!character.trim()) return
    setLoading(true)
    setError('')
    setResult('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, fandom, style }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '生成失败')
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen px-4 py-12 flex flex-col items-center">
      {/* 顶部标题 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-purple-300 tracking-wide mb-2">
          ✨ HeadcanonGen
        </h1>
        <p className="text-purple-400 text-sm">
          输入角色，生成你的专属脑补故事
        </p>
      </div>

      {/* 输入卡片 */}
      <div className="w-full max-w-xl bg-[#1a1030] border border-purple-800 rounded-2xl p-6 shadow-lg shadow-purple-900/30">
        {/* 角色名 */}
        <div className="mb-4">
          <label className="block text-purple-300 text-sm mb-1">
            角色名 <span className="text-pink-400">*</span>
          </label>
          <input
            type="text"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder="如：云堇、路飞、傅红雪"
            className="w-full bg-[#0f0a1e] border border-purple-700 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-700 focus:outline-none focus:border-purple-400 transition"
          />
        </div>

        {/* 作品名 */}
        <div className="mb-5">
          <label className="block text-purple-300 text-sm mb-1">
            作品 / 世界观 <span className="text-purple-600 text-xs">（选填）</span>
          </label>
          <input
            type="text"
            value={fandom}
            onChange={(e) => setFandom(e.target.value)}
            placeholder="如：原神、海贼王、古龙小说"
            className="w-full bg-[#0f0a1e] border border-purple-700 rounded-lg px-4 py-2 text-purple-100 placeholder-purple-700 focus:outline-none focus:border-purple-400 transition"
          />
        </div>

        {/* 风格选择 */}
        <div className="mb-6">
          <label className="block text-purple-300 text-sm mb-2">风格</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition text-center ${
                  style === s.value
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-[#0f0a1e] border-purple-800 text-purple-400 hover:border-purple-500'
                }`}
              >
                <div>{s.label}</div>
                <div className="text-xs opacity-60">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generate}
          disabled={loading || !character.trim()}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-purple-800/40"
        >
          {loading ? '生成中...' : '✨ 生成 Headcanon'}
        </button>
      </div>

      {/* 输出区域 */}
      {(loading || result || error) && (
        <div className="w-full max-w-xl mt-6 bg-[#1a1030] border border-purple-800 rounded-2xl p-6 shadow-lg shadow-purple-900/30">
          {loading && (
            <div className="flex items-center justify-center gap-3 text-purple-400 py-6">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span>正在脑补中，请稍候...</span>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {result && (
            <>
              <p className="text-purple-100 leading-8 text-[15px] whitespace-pre-wrap">{result}</p>
              <div className="flex gap-3 mt-5 justify-end">
                <button
                  onClick={generate}
                  className="text-sm px-4 py-1.5 rounded-lg border border-purple-700 text-purple-300 hover:border-purple-400 transition"
                >
                  🔁 再生成
                </button>
                <button
                  onClick={copy}
                  className="text-sm px-4 py-1.5 rounded-lg border border-pink-700 text-pink-300 hover:border-pink-400 transition"
                >
                  {copied ? '✓ 已复制' : '📋 复制'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 页脚 */}
      <p className="mt-12 text-purple-800 text-xs">Made with ❤️ & AI</p>
    </main>
  )
}
