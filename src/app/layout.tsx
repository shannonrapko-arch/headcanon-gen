import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HeadcanonGen — 你的专属脑补生成器',
  description: '输入角色名和风格，AI 秒出一段粉丝向脑补小故事。支持温馨、虐心、沙雕、暗恋四种风格，适合同人爱好者使用。',
  keywords: ['headcanon', '脑补', '同人', 'AI 生成', '粉丝', 'fanfic'],
  authors: [{ name: 'HeadcanonGen' }],
  openGraph: {
    title: 'HeadcanonGen — 你的专属脑补生成器',
    description: '输入角色名和风格，AI 秒出一段粉丝向脑补小故事',
    url: 'https://headcanon-gen.vercel.app',
    siteName: 'HeadcanonGen',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'HeadcanonGen — 你的专属脑补生成器',
    description: '输入角色名和风格，AI 秒出一段粉丝向脑补小故事',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
