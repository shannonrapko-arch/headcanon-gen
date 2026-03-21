import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HeadcanonGen — 你的专属脑补生成器',
  description: '输入你的角色和情绪，秒出一段粉丝向脑补小故事',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
