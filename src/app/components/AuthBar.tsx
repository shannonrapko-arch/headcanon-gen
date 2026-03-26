'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function AuthBar() {
  const { data: session, status } = useSession()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/credits')
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.credits === 'number') setCredits(d.credits)
        })
        .catch(() => {})
    } else {
      setCredits(null)
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="w-full max-w-xl mb-4 flex justify-end">
        <span className="text-purple-700 text-xs">...</span>
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="w-full max-w-xl mb-4 flex items-center justify-end gap-3">
        {/* Credits 余额 */}
        {credits !== null && (
          <span className="text-xs text-purple-500 border border-purple-900 px-2 py-0.5 rounded-lg">
            ✨ {credits} 次
          </span>
        )}
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt="avatar"
            className="w-7 h-7 rounded-full border border-purple-700"
          />
        )}
        <span className="text-purple-300 text-sm truncate max-w-[160px]">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-xs text-purple-500 hover:text-purple-300 border border-purple-800 hover:border-purple-600 px-2.5 py-1 rounded-lg transition"
        >
          退出
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mb-4 flex justify-end">
      <button
        onClick={() => signIn('google')}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-200 border border-purple-800 hover:border-purple-500 px-3 py-1.5 rounded-lg transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google 登录
      </button>
    </div>
  )
}
