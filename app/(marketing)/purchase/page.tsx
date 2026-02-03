'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, MessageCircle, Mail } from "lucide-react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

const plans = {
  hobby: {
    name: "爱好者版",
    price: "¥9",
    period: "/月",
    quota: "每天 20 次分析",
    features: [
      "每天 20 次解法分析",
      "AI 优化建议",
      "公式库访问",
      "学习进度追踪",
      "邮件支持",
    ],
  },
  pro: {
    name: "Pro 版",
    price: "¥29",
    period: "/月",
    quota: "无限次分析",
    features: [
      "无限解法分析",
      "AI 深度讲解",
      "公式库完整访问",
      "智能复习系统",
      "学习进度追踪",
      "专属客服",
    ],
  },
}

function PurchaseContent() {
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get("plan") as keyof typeof plans || "pro"

  const plan = plans[selectedPlan]

  const copyWechat = () => {
    navigator.clipboard.writeText("cube-coach")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">购买会员激活码</h1>
        <p className="text-muted-foreground">
          选择适合您的套餐，联系客服完��购买
        </p>
      </div>

      {/* 套餐选择 */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {Object.entries(plans).map(([key, p]) => (
          <Card
            key={key}
            className={`relative cursor-pointer transition-all ${
              key === selectedPlan
                ? "border-primary shadow-lg ring-2 ring-primary/20"
                : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => {
              window.location.href = `/purchase?plan=${key}`
            }}
          >
            {key === "pro" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  推荐
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-primary">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                {p.quota}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {p.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 购买步骤 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>购买流程</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">联系客服</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  通过微信或邮件联系我们，告知您需要的套餐：<span className="font-medium text-primary">{plan.name}</span>
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={copyWechat}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {copied ? "已复制微信号" : "复制微信号: cube-coach"}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:api@cubecoach.com?subject=购买{plan.name}激活码">
                      <Mail className="h-4 w-4 mr-2" />
                      发送邮件
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">付款</h3>
                <p className="text-sm text-muted-foreground">
                  客服会发送微信/支付宝收款码，完成付款后截图发给客服作为凭证
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">接收激活码</h3>
                <p className="text-sm text-muted-foreground">
                  客服会在 10 分钟内通过邮件发送您的专属激活码和使用说明
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">激活会员</h3>
                <p className="text-sm text-muted-foreground">
                  登录网站后，在个人中心输入激活码即可解锁会员权益
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注意事项 */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">注意事项</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-orange-700 space-y-2">
          <p>• 付款后请保留截图，作为购买凭证</p>
          <p>• 激活码有效期为购买后 30 天，请及时激活</p>
          <p>• 会员按月订阅，不自动续费，到期后需重新购买</p>
          <p>• 7天内不满意可全额退款</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<div className="container max-w-4xl py-12">加载中...</div>}>
      <PurchaseContent />
    </Suspense>
  )
}
