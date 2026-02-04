import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="弘弈AI魔方" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400">
            弘弈AI魔方
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/analyze" className="text-sm font-medium hover:text-blue-600 transition-colors">
            分析
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:text-blue-600 transition-colors">
            档案
          </Link>
          <Link href="/review" className="text-sm font-medium hover:text-blue-600 transition-colors">
            复习
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
            定价
          </Link>
          <Link href="/api-docs" className="text-sm font-medium hover:text-blue-600 transition-colors">
            API
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">登录</Link>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
            <Link href="/signup">注册</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
