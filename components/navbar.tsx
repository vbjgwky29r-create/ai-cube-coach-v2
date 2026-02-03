import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/icon.png" alt="弘弈AI魔方" className="h-8 w-8" />
          <span className="font-bold text-xl hidden sm:inline">弘弈AI魔方</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/analyze" className="text-sm font-medium hover:text-primary transition-colors">
            分析解法
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
            学习档案
          </Link>
          <Link href="/review" className="text-sm font-medium hover:text-primary transition-colors">
            复习
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            定价
          </Link>
          <Link href="/api-docs" className="text-sm font-medium hover:text-primary transition-colors">
            API
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">登录</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">注册</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
