import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="弘弈AI魔方教练" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400">
            弘弈AI魔方教练
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/analyze" className="text-sm font-medium hover:text-blue-600 transition-colors">
            分析
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-blue-600 transition-colors">
            个人中心
          </Link>
          <Link href="/review" className="text-sm font-medium hover:text-blue-600 transition-colors">
            复盘
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">登录</Link>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" asChild>
            <Link href="/signup">注册</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
