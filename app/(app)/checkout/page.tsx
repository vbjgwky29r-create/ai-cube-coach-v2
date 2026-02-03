'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// 禁用预渲染
export const dynamic = 'force-dynamic'

const PLANS = {
  'pro-monthly': {
    name: 'Pro 版 - 月付',
    price: 29,
    period: '月',
    features: ['无限分析', 'AI讲解', '复习系统', '进度追踪'],
  },
  'pro-yearly': {
    name: 'Pro 版 - 年付',
    price: 290,
    period: '年',
    features: ['无限分析', 'AI讲解', '复习系统', '进度追踪', '省2个月'],
    popular: true,
  },
  'lifetime': {
    name: '终身版',
    price: 499,
    period: '永久',
    features: ['所有Pro功能', '永久使用', '未来更新免费', 'API访问'],
  },
}

const PAYMENT_METHODS = {
  wechat: {
    id: 'wechat',
    name: '微信支付',
    icon: '💬',
    description: '扫码支付，即时到账',
  },
  alipay: {
    id: 'alipay',
    name: '支付宝',
    icon: '💰',
    description: '扫码支付，即时到账',
  },
  usdt: {
    id: 'usdt',
    name: 'USDT (TRC20)',
    icon: '₮',
    description: '加密货币支付，享9折',
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [planId, setPlanId] = useState(searchParams.get('plan') || 'pro-monthly')
  const [paymentMethod, setPaymentMethod] = useState('wechat')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const plan = searchParams.get('plan')
  // 初始化 planId
  if (plan && PLANS[plan as keyof typeof PLANS]) {
    // planId 已在 useState 中初始化为 'pro-monthly'
    // 这里只需确保 URL 参数有效时更新
  }

  const currentPlan = PLANS[planId as keyof typeof PLANS] || PLANS['pro-monthly']
  const finalPrice = paymentMethod === 'usdt' ? Math.floor(currentPlan.price * 0.9) : currentPlan.price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      alert('请输入邮箱地址')
      return
    }

    setLoading(true)

    // TODO: 集成真实支付
    if (paymentMethod === 'usdt') {
      // 显示USDT支付信息
      setTimeout(() => {
        setLoading(false)
        alert(`USDT支付信息:\n\n地址: TRC20钱包地址\n金额: ${finalPrice} USDT\n\n转账后请备注: ${email}\n我们会在确认后激活您的账号`)
      }, 500)
    } else {
      // 跳转到Xorpay等第三方支付
      setTimeout(() => {
        setLoading(false)
        alert('支付功能即将上线 - 需要集成Xorpay')
      }, 500)
    }
  }

  return (
    <div className="container py-12 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Order Summary */}
        <div>
          <h1 className="text-2xl font-bold mb-6">结账</h1>

          {/* Plan Selection */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">选择计划</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => (
                <div
                  key={key}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    planId === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setPlanId(key)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ¥{plan.price}/{plan.period}
                      </p>
                    </div>
                    {'popular' in plan && plan.popular && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        推荐
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">订单详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品</span>
                  <span>{currentPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">原价</span>
                  <span>¥{currentPlan.price}</span>
                </div>
                {paymentMethod === 'usdt' && (
                  <div className="flex justify-between text-green-600">
                    <span>USDT优惠 (9折)</span>
                    <span>-¥{currentPlan.price - finalPrice}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>总计</span>
                  <span className="text-xl">¥{finalPrice}</span>
                </div>
                {paymentMethod === 'usdt' && (
                  <p className="text-sm text-muted-foreground">
                    ≈ ${(finalPrice / 6.5).toFixed(2)} USD
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">支付信息</CardTitle>
              <CardDescription>
                完成支付后，你将立即获得访问权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    邮箱地址
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    收据和激活信息将发送到此邮箱
                  </p>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    支付方式
                  </label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {Object.values(PAYMENT_METHODS).map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                          paymentMethod === method.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {method.description}
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* USDT Notice */}
                {paymentMethod === 'usdt' && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold">💰 USDT支付说明:</span>
                      <br />
                      1. 选择USDT支付享受 <span className="text-green-600 font-bold">9折优惠</span>
                      <br />
                      2. 请使用 TRC20 网络转账
                      <br />
                      3. 转账后请备注你的邮箱地址
                      <br />
                      4. 我们会在收到转账后24小时内激活
                    </p>
                  </div>
                )}

                {/* Submit */}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? '处理中...' : `支付 ¥${finalPrice}`}
                </Button>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>安全支付，受SSL加密保护</span>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Guarantee */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="font-semibold">7天退款保证</p>
                  <p className="text-sm text-muted-foreground">
                    如果你对服务不满意，我们将在7天内全额退款，无需理由。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container py-12 max-w-4xl flex items-center justify-center min-h-[50vh]"><p>加载中...</p></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
