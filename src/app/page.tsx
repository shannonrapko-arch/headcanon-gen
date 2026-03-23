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
  const [charError, setCharError] = useState(false)

  const generate = async () => {
    if (!character.trim()) {
      setCharError(true)
      return
    }
    setCharError(false)
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
      const msg = e instanceof Error ? e.message : ''
      // 对普通用户显示友好提示，不暴露底层错误
      if (msg.includes('角色名')) {
        setError('请输入角色名后再生成')
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setError('网络异常，请检查网络连接后重试')
      } else if (msg.includes('429') || msg.includes('rate')) {
        setError('当前请求太多，请稍后再试 🙏')
      } else if (msg.includes('500') || msg.includes('Internal')) {
        setError('服务器开小差了，请稍后重试 🔧')
      } else if (msg) {
        setError('生成失败，请稍后重试')
      } else {
        setError('生成失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 兜底：选中文本
      const el = document.querySelector('[data-result-text]') as HTMLElement
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      generate()
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16 flex flex-col items-center">
      {/* 顶部标题 */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-300 tracking-wide mb-2">
          ✨ HeadcanonGen
        </h1>
        <p className="text-purple-400 text-sm">
          输入角色名，生成你的专属脑补故事
        </p>
      </div>

      {/* 输入卡片 */}
      <div className="w-full max-w-xl bg-[#1a1030] border border-purple-800 rounded-2xl p-5 sm:p-6 shadow-lg shadow-purple-900/30">
        {/* 角色名 */}
        <div className="mb-4">
          <label className="block text-purple-300 text-sm mb-1.5">
            角色名 <span className="text-pink-400">*</span>
          </label>
          <input
            type="text"
            value={character}
            onChange={(e) => {
              setCharacter(e.target.value)
              if (e.target.value.trim()) setCharError(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder="如：云堇、路飞、傅红雪"
            className={`w-full bg-[#0f0a1e] border rounded-lg px-4 py-3 text-purple-100 placeholder-purple-700 focus:outline-none transition text-base ${
              charError
                ? 'border-pink-500 focus:border-pink-400'
                : 'border-purple-700 focus:border-purple-400'
            }`}
          />
          {charError && (
            <p className="text-pink-400 text-xs mt-1.5">请输入角色名，这是必填项 ✦</p>
          )}
        </div>

        {/* 作品名 */}
        <div className="mb-5">
          <label className="block text-purple-300 text-sm mb-1.5">
            作品 / 世界观{' '}
            <span className="text-purple-600 text-xs">（选填）</span>
          </label>
          <input
            type="text"
            value={fandom}
            onChange={(e) => setFandom(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="如：原神、海贼王、古龙小说"
            className="w-full bg-[#0f0a1e] border border-purple-700 rounded-lg px-4 py-3 text-purple-100 placeholder-purple-700 focus:outline-none focus:border-purple-400 transition text-base"
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
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition text-center ${
                  style === s.value
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-[#0f0a1e] border-purple-800 text-purple-400 hover:border-purple-500 active:bg-purple-900'
                }`}
              >
                <div className="text-base sm:text-sm">{s.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-800/40 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              生成中...
            </span>
          ) : (
            '✨ 生成 Headcanon'
          )}
        </button>
      </div>

      {/* 输出区域 */}
      {(loading || result || error) && (
        <div className="w-full max-w-xl mt-5 bg-[#1a1030] border border-purple-800 rounded-2xl p-5 sm:p-6 shadow-lg shadow-purple-900/30">
          {loading && (
            <div className="flex items-center justify-center gap-3 text-purple-400 py-8">
              <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">正在脑补中，请稍候...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {result && !loading && (
            <>
              <p
                data-result-text
                className="text-purple-100 leading-8 text-[15px] sm:text-base whitespace-pre-wrap break-words"
              >
                {result}
              </p>
              <div className="flex gap-2.5 mt-5 justify-end flex-wrap">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="text-sm px-4 py-2 rounded-lg border border-purple-700 text-purple-300 hover:border-purple-400 active:bg-purple-900/30 transition disabled:opacity-40"
                >
                  🔁 再生成
                </button>
                <button
                  onClick={copy}
                  className="text-sm px-4 py-2 rounded-lg border border-pink-700 text-pink-300 hover:border-pink-400 active:bg-pink-900/30 transition"
                >
                  {copied ? '✓ 已复制' : '📋 复制'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 页脚 */}
      <p className="mt-12 text-purple-800 text-xs">Made with ❤️ &amp; AI</p>
    </main>
  )
}
