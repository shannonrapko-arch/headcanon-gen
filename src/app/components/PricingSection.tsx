'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

const PLANS = [
  {
    packId: 'pack_30',
    label: '小包',
    count: '30 次',
    price: '$0.99',
    note: '约 $0.033 / 次',
    amount: '0.99',
    highlight: false,
  },
  {
    packId: 'pack_100',
    label: '中包',
    count: '100 次',
    price: '$2.99',
    note: '最划算 🔥',
    amount: '2.99',
    highlight: true,
  },
  {
    packId: 'pack_300',
    label: '大包',
    count: '300 次',
    price: '$6.99',
    note: '约 $0.023 / 次',
    amount: '6.99',
    highlight: false,
  },
]

const FAQS = [
  {
    q: '额度会每个月清零吗？',
    a: '不会，买到的额度会保留在账号里，永不清零。',
  },
  {
    q: '不登录能用吗？',
    a: '可以先体验，但免费额度和购买额度需要登录后绑定到你的账号。',
  },
  {
    q: '付费后多久到账？',
    a: '正常情况下会很快到账，刷新一下页面就能看到。',
  },
  {
    q: '如果额度没到账怎么办？',
    a: '如果遇到异常扣费或到账问题，可以联系我们处理。',
  },
  {
    q: '以后会出订阅吗？',
    a: '当前阶段我们主打「用多少买多少」，后续如果功能更多，再考虑其他方案。',
  },
]

// 单个套餐的 PayPal 按钮
function PlanPayPalButton({
  plan,
  onSuccess,
  onError,
}: {
  plan: (typeof PLANS)[number]
  onSuccess: (packId: string, credits: number) => void
  onError: (msg: string) => void
}) {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn('google')}
        className="mt-2.5 w-full py-1.5 rounded-lg text-xs font-medium border transition bg-purple-800/40 border-purple-700 text-purple-300 hover:border-purple-500 hover:text-white"
      >
        登录购买
      </button>
    )
  }

  return (
    <div className="mt-2.5 paypal-btn-wrap">
      <PayPalButtons
        style={{ layout: 'horizontal', height: 30, tagline: false, label: 'buynow' }}
        fundingSource="paypal"
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: plan.amount,
                },
                description: `HeadcanonGen · ${plan.label} ${plan.count}`,
              },
            ],
          })
        }}
        onApprove={async (_data, _actions) => {
          try {
            // onApprove 触发时用户已在 PayPal 弹窗完成授权
            // 由服务端 capture
            const res = await fetch('/api/paypal/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: _data.orderID, packId: plan.packId }),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || '支付处理失败')
            onSuccess(plan.packId, result.credits)
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '支付处理失败，请重试'
            onError(msg)
          }
        }}
        onError={(err) => {
          console.error('PayPal error:', err)
          onError('PayPal 支付出现错误，请重试')
        }}
        onCancel={() => {
          onError('支付已取消')
        }}
      />
    </div>
  )
}

function PricingSectionInner() {
  const searchParams = useSearchParams()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [paymentNotice, setPaymentNotice] = useState<{
    type: 'success' | 'cancel'
    msg: string
  } | null>(null)

  // 支付回调提示（保留 URL 参数兼容，以防其他跳转）
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      setPaymentNotice({ type: 'success', msg: '🎉 支付成功！额度已到账，刷新页面可查看余额。' })
      window.history.replaceState({}, '', '/')
    } else if (payment === 'cancel') {
      setPaymentNotice({ type: 'cancel', msg: '支付已取消，如有疑问请联系我们。' })
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  const handleSuccess = (packId: string, credits: number) => {
    console.log(`Payment success: ${packId}, +${credits} credits`)
    setPaymentNotice({
      type: 'success',
      msg: `🎉 支付成功！已到账 ${credits} 次，刷新页面可查看余额。`,
    })
  }

  const handleError = (msg: string) => {
    setPaymentNotice({ type: 'cancel', msg })
  }

  return (
    <section className="w-full max-w-xl mt-16">
      {/* 分割线 */}
      <div className="border-t border-purple-900 mb-10" />

      {/* 支付结果提示 */}
      {paymentNotice && (
        <div
          className={`mb-5 flex items-start gap-2 text-sm rounded-xl px-4 py-3 border ${
            paymentNotice.type === 'success'
              ? 'bg-green-950/30 border-green-800/50 text-green-300'
              : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}
        >
          <span className="shrink-0 mt-0.5">{paymentNotice.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{paymentNotice.msg}</span>
          <button
            onClick={() => setPaymentNotice(null)}
            className="ml-auto shrink-0 opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* 标题 */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-purple-200 mb-2">
          ✨ 解锁更多脑补次数
        </h2>
        <p className="text-purple-500 text-sm">
          先免费玩，喜欢再买次数，不订阅，不绑月费。
        </p>
      </div>

      {/* 免费版说明 */}
      <div className="bg-[#1a1030] border border-purple-800 rounded-2xl p-5 mb-4 shadow-lg shadow-purple-900/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎁</span>
          <span className="text-purple-200 font-semibold">免费额度</span>
        </div>
        <ul className="text-purple-400 text-sm space-y-1.5">
          <li>· 首次登录：赠送 10 次生成</li>
          <li>· 每天登录：再送 1 次</li>
          <li>· 先玩玩看，喜欢再充</li>
          <li>· 不满意不用付钱，没有月费压力</li>
        </ul>
      </div>

      {/* 积分包 */}
      <div className="bg-[#1a1030] border border-purple-800 rounded-2xl p-5 mb-4 shadow-lg shadow-purple-900/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💰</span>
          <span className="text-purple-200 font-semibold">额度包</span>
          <span className="text-purple-600 text-xs ml-1">一次买断，不按月扣</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.packId}
              className={`relative rounded-xl border p-3 text-center transition ${
                plan.highlight
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-purple-800 bg-[#0f0a1e]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                  最划算
                </div>
              )}
              <div className="text-purple-300 text-xs mb-1">{plan.label}</div>
              <div className="text-purple-100 font-bold text-base">{plan.count}</div>
              <div className="text-pink-400 font-bold text-lg mt-0.5">{plan.price}</div>
              <div className="text-purple-600 text-[11px] mt-1">
                {!plan.highlight ? plan.note : ''}
              </div>
              <PlanPayPalButton
                plan={plan}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          ))}
        </div>

        <p className="text-purple-700 text-xs mt-4 text-center">
          买到的额度会保留在账号里，不会每月自动清空。
        </p>
      </div>

      {/* 额度不够提示 */}
      <div className="text-center mb-6">
        <p className="text-purple-600 text-xs">额度不够了？补一点继续玩 👆</p>
      </div>

      {/* FAQ */}
      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="bg-[#1a1030] border border-purple-900 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-purple-300 text-sm hover:text-purple-100 transition"
            >
              <span>{faq.q}</span>
              <span
                className="text-purple-600 ml-2 shrink-0 transition-transform duration-200"
                style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▾
              </span>
            </button>
            {openFaq === i && (
              <div className="px-4 pb-3 text-purple-500 text-sm leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function PricingSection() {
  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <Suspense>
        <PricingSectionInner />
      </Suspense>
    </PayPalScriptProvider>
  )
}
