import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            🎲 AI驱动的魔方学习平台
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            不是"帮你解"
            <br />
            <span className="text-primary">而是"教你怎么解得更好"</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            输入你的魔方打乱公式和解法，AI帮你分析效率问题，
            给出优化建议，讲解新公式，建立个性化学习档案。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/analyze">开始分析</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">查看定价</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">核心功能</h2>
            <p className="text-muted-foreground">
              完整的魔方学习解决方案，从分析到复习
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  AI解法分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  输入你的解法，AI分析步数、效率、识别使用的公式，
                  给出质量评分。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  优化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  对比最优解，找出可优化的点，
                  告诉你为什么这样更好，能节省多少步。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  知识讲解
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  针对你的薄弱环节，讲解新公式，
                  解释什么时候用、怎么用更高效。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📁</span>
                  学习档案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  记录你学过的公式、练习次数、掌握程度，
                  可视化你的进步曲线。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  复习系统
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  基于遗忘曲线的智能复习提醒，
                  确保你掌握的公式不会遗忘。
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  练习模式
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  针对性练习新学的公式，
                  跟着动画演示，形成肌肉记忆。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">使用流程</h2>
            <p className="text-muted-foreground">简单三步，开始你的进阶之旅</p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">输入打乱和解法</h3>
                  <p className="text-muted-foreground">
                    输入你用的打乱公式，以及你自己的复原步骤。
                    支持标准魔方记法。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">AI分析建议</h3>
                  <p className="text-muted-foreground">
                    AI对比最优解，找出效率问题，给出优化建议，
                    讲解你可以学习的新公式。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">保存到档案</h3>
                  <p className="text-muted-foreground">
                    分析结果自动保存到你的学习档案，
                    系统会安排复习计划，确保你真正掌握。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/40 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">准备好提升你的魔方技术了吗？</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            加入我们，开始你的个性化学习之旅。每天分析，持续进步。
          </p>
          <Button size="lg" asChild>
            <Link href="/analyze">免费开始</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
