import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * 格式化相对时间 (如: "3天前")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
