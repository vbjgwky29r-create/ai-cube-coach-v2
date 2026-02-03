import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">AI</span>
              </div>
              <span className="font-bold">弘弈魔方教练</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI驱动的魔方学习平台，<br />
              教你解得更好。
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-3">产品</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/analyze" className="hover:text-primary transition-colors">分析解法</Link></li>
              <li><Link href="/profile" className="hover:text-primary transition-colors">学习档案</Link></li>
              <li><Link href="/review" className="hover:text-primary transition-colors">复习系统</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">定价</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">资源</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-primary transition-colors">文档</Link></li>
              <li><Link href="/api" className="hover:text-primary transition-colors">API</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">博客</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3">关于</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">关于我们</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">隐私政策</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">服务条款</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">联系我们</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 弘弈AI魔方教练. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
