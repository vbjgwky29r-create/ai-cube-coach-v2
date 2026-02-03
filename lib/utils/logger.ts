/**
 * 结构化日志工具
 * 用于 API 错误追踪���性能监控
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  requestId?: string
  userId?: string
}

// 生成请求ID
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 简单的日志缓冲区（开发环境）
const logBuffer: LogEntry[] = []
const MAX_BUFFER_SIZE = 100

function shouldLog(level: LogLevel): boolean {
  // 生产环境只记录 warn 和 error
  if (process.env.NODE_ENV === 'production') {
    return level === 'warn' || level === 'error'
  }
  return true
}

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  }

  // 开发环境打印到控制台
  if (process.env.NODE_ENV !== 'production') {
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    logFn(`[${level.toUpperCase()}]`, message, context || '')
  }

  // 添加到缓冲区
  logBuffer.push(entry)
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift()
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),

  // 性能监控
  perf: (metric: string, duration: number, context?: Record<string, unknown>) => {
    log('info', `[PERF] ${metric}`, { duration, ...context })
  },

  // API 请求日志
  api: (method: string, path: string, status: number, duration: number, context?: Record<string, unknown>) => {
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    log(level, `[API] ${method} ${path} ${status}`, { duration, ...context })
  },
}

// 获取缓冲的日志（用于调试）
export function getLogs(): LogEntry[] {
  return [...logBuffer]
}

// 清空日志缓冲区
export function clearLogs(): void {
  logBuffer.length = 0
}
