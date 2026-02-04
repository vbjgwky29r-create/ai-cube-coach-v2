import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container py-24 md:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 border border-blue-500/20">
            <span className="mr-2">🤖</span>
            AI 驱动
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-white dark:via-blue-400 dark:to-white">
            不帮你解
            <br />
            教你更快
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            AI 分析你的解法，精准定位优化空间
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/analyze">立即开始</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/pricing">查看定价</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">核心能力</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              智能分析 · 精准优化 · 持续进步
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-blue-500/50 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <span>智能分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  AI 识别公式，评估效率，定位问题
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-500/50 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <span>精准优化</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  对比最优解，指出改进方向
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-500/50 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">📈</span>
                  <span>持续进步</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  学习档案，智能复习，稳步提升
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">三步开始</h2>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-6">
              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-2xl mb-2">输入解法</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    打乱公式 + 你的复原步骤
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-2xl mb-2">AI 分析</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    效率评分 + 优化建议 + 公式推荐
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-2xl mb-2">持续提升</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    学习档案 + 智能复习 + 进步可视化
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-24">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            准备好突破瓶颈了吗？
          </h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
            每次分析都是一次进步
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-shadow" asChild>
            <Link href="/analyze">免费开始</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
