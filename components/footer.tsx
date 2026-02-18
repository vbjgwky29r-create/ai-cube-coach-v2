import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="弘弈AI魔方教练" fill className="object-contain" />
              </div>
              <span className="font-bold text-lg">弘弈AI魔方教练</span>
            </div>
            <p className="text-sm text-muted-foreground">
              面向中文学员的 AI 魔方训练平台，专注 CFOP 分析与进步建议。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">功能</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/analyze" className="hover:text-blue-600 transition-colors">分析</Link></li>
              <li><Link href="/profile" className="hover:text-blue-600 transition-colors">个人中心</Link></li>
              <li><Link href="/review" className="hover:text-blue-600 transition-colors">复盘</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">开发者</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>内测阶段暂不开放文档与 API</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">支持</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">关于我们</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">隐私政策</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">服务条款</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">联系我们</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 弘弈AI魔方教练. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  )
}
