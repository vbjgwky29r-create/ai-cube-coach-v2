/**
 * Prisma 客户端配置
 *
 * 开发环境: 使用全局实例避免热重载创建多个连接
 * 生产环境: 每次请求创建新实例
 */

import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// 类型辅助
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    analyses: true
    mastered: true
    reviews: true
  }
}>

export type AnalysisWithUser = Prisma.SolutionAnalysisGetPayload<{
  include: {
    user: true
  }
}>
