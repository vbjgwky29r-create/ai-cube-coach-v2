import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="弘弈AI魔方" fill className="object-contain" />
              </div>
              <span className="font-bold text-lg">弘弈AI魔方</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI 驱动 · 精准优化
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">产品</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/analyze" className="hover:text-blue-600 transition-colors">分析</Link></li>
              <li><Link href="/profile" className="hover:text-blue-600 transition-colors">档案</Link></li>
              <li><Link href="/review" className="hover:text-blue-600 transition-colors">复习</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">定价</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">开发者</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/api-docs" className="hover:text-blue-600 transition-colors">文档</Link></li>
              <li><Link href="/api-docs" className="hover:text-blue-600 transition-colors">API</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">关于</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">关于我们</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">隐私政策</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">服务条款</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">联系我们</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 弘弈AI魔方. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
