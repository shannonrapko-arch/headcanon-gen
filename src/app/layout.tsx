import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

// 优先读环境变量，方便绑定自定义域名后无需改代码
// Vercel 后台设置：NEXT_PUBLIC_SITE_URL=https://你的域名
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://headcanon-gen.vercel.app'

export const metadata: Metadata = {
  title: 'HeadcanonGen — 你的专属脑补生成器',
  description: '输入角色名和风格，AI 秒出一段粉丝向脑补小故事。支持温馨、虐心、沙雕、暗恋四种风格，适合同人爱好者使用。',
  keywords: ['headcanon', '脑补', '同人', 'AI 生成', '粉丝', 'fanfic'],
  authors: [{ name: 'HeadcanonGen' }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'HeadcanonGen — 你的专属脑补生成器',
    description: '输入角色名和风格，AI 秒出一段粉丝向脑补小故事',
    url: siteUrl,
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
