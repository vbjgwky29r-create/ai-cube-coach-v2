import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    description: "适合初学者体验",
    popular: false,
    features: [
      "每天 3 次解法分析",
      "基础优化建议",
      "公式识别",
      "学习档案记录",
      "社区支持",
    ],
    limitations: [
      "无 AI 深度讲解",
      "无复习系统",
    ],
    cta: "开始使用",
    href: "/analyze",
  },
  {
    name: "爱好者版",
    price: "¥9",
    period: "/月",
    description: "适合偶尔练习的魔方爱好者",
    popular: false,
    features: [
      "每天 20 次解法分析",
      "AI 优化建议",
      "公式库访问",
      "学习进度追踪",
      "邮件支持",
    ],
    limitations: [],
    cta: "购买激活码",
    href: "/purchase?plan=hobby",
  },
  {
    name: "Pro 版",
    price: "¥29",
    period: "/月",
    description: "适合认真提升的速拧玩家",
    popular: true,
    features: [
      "无限解法分析",
      "AI 深度讲解",
      "公式库完整访问",
      "智能复习系统",
      "学习进度追踪",
      "优先生成速度",
      "专属客服",
    ],
    limitations: [],
    cta: "购买激活码",
    href: "/purchase?plan=pro",
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            会员订阅方案
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            选择适合��的方案，提升魔方速拧水平
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    最受欢迎
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-4 w-4 shrink-0 flex items-center justify-center text-xs">
                        ✕
                      </span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">功能对比</h2>
            <p className="text-muted-foreground">
              详细了解各方案的功能差异
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4">功能</th>
                  <th className="text-center py-4">免费版</th>
                  <th className="text-center py-4">爱好者版</th>
                  <th className="text-center py-4 bg-primary/10">Pro 版</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4">解法分析次数</td>
                  <td className="text-center py-4">每天 3 次</td>
                  <td className="text-center py-4">每天 20 次</td>
                  <td className="text-center py-4 bg-primary/10 font-semibold">无限次</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4">AI 优化建议</td>
                  <td className="text-center py-4">基础</td>
                  <td className="text-center py-4 text-primary">✓</td>
                  <td className="text-center py-4 bg-primary/10 text-primary">✓ 深度</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4">公式库</td>
                  <td className="text-center py-4">基础公式</td>
                  <td className="text-center py-4 text-primary">✓</td>
                  <td className="text-center py-4 bg-primary/10 text-primary">✓ 完整</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4">学习进度追踪</td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4 text-primary">✓</td>
                  <td className="text-center py-4 bg-primary/10 text-primary">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4">智能复习系统</td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4">-</td>
                  <td className="text-center py-4 bg-primary/10 text-primary">✓</td>
                </tr>
                <tr>
                  <td className="py-4">客服支持</td>
                  <td className="text-center py-4">社区</td>
                  <td className="text-center py-4">邮件</td>
                  <td className="text-center py-4 bg-primary/10 text-primary">专属</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">常见问题</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">如何购买会员？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  点击"购买激活码"按钮，联系客服完成付款。我们会在 10 分钟内通过邮件发送激活码给你。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">激活码如何使用？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  登录后进入个人中心，输入激活码即可解锁对应套餐的权益。
                  激活码有效期为购买后 30 天。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">可以随时取消吗？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  可以。会员按月订阅，不自动续费。每次到期后需要重新购买激活码。
                  7天内不满意可全额退款。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分析次数如何计算？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  每次点击"分析解法"按钮计为一次。免费版每天 3 次，爱好者版每天 20 次，
                  Pro 版无限次。每天 0 点重置次数。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">开始提升你的魔方水平</h2>
          <p className="text-muted-foreground mb-8">
            免费版无需付费即可开始使用
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/analyze">免费开始</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/purchase">查看套餐</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
