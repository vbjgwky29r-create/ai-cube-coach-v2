import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="container py-24 md:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 mb-8 border border-blue-500/20">
            弘弈AI魔方教练
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            用看得懂的中文分析
            <br />
            帮你稳定提升 CFOP
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            上传打乱与还原步骤，获取分阶段解析、关键问题定位和可执行训练建议。
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/analyze">开始分析</Link>
          </Button>
        </div>
      </section>

      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-24">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>分阶段诊断</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  按 Cross、F2L、OLL、PLL 展示你的执行质量与瓶颈。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>CFOP 参考解</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  提供可复盘的阶段公式，便于对照自己每一步动作。
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>训练建议</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  给出优先级明确的练习方向，帮助学员持续进步。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
