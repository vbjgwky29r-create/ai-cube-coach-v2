import { NextRequest, NextResponse } from 'next/server'
import { analyzeSolution } from '@/lib/cube/analyzer'
import { analyzeSolutionDetailed } from '@/lib/cube/analyzer-v2'
import { analyzeSolutionEnhanced } from '@/lib/cube/analyzer-v3'
import { parseFormula } from '@/lib/cube/parser'
import { logger, generateRequestId } from '@/lib/utils/logger'

// 简单的速率限制存储（生产环境应使用 Redis 等）
const ipLimitMap = new Map<string, { count: number; resetTime: number }>()

// 限制配置
const RATE_LIMIT = {
  maxRequests: 10,        // 每分钟最多请求数
  windowMs: 60 * 1000,    // 1分钟窗口
}

const INPUT_LIMITS = {
  maxScrambleLength: 500,   // 打乱公式最大长度
  maxSolutionLength: 2000,  // 解法最大长度
  maxMoveCount: 200,        // 最大动作数
}

// API 密钥配置（从环境变量读取）
const API_KEYS = (process.env.API_KEYS || '').split(',').filter(k => k.length > 0)
const SKIP_AUTH_FOR_DEMO = process.env.NODE_ENV !== 'production'

function checkAuth(headers: Headers): { valid: boolean; error?: string } {
  // 开发环境跳过认证
  if (SKIP_AUTH_FOR_DEMO) {
    return { valid: true }
  }

  // 如果配置了 API 密钥，检查请求头
  if (API_KEYS.length > 0) {
    const apiKey = headers.get('x-api-key') || headers.get('authorization')?.replace('Bearer ', '')
    if (!apiKey) {
      return { valid: false, error: '缺少 API 密钥' }
    }
    if (!API_KEYS.includes(apiKey)) {
      return { valid: false, error: '无效的 API 密钥' }
    }
  }

  return { valid: true }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // 新窗口
    ipLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    })
    return true
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  record.count++
  return true
}

function validateInput(scramble: string, solution: string): { valid: boolean; error?: string } {
  // 长度检查
  if (scramble.length > INPUT_LIMITS.maxScrambleLength) {
    return { valid: false, error: `打乱公式过长，最大 ${INPUT_LIMITS.maxScrambleLength} 字符` }
  }
  if (solution.length > INPUT_LIMITS.maxSolutionLength) {
    return { valid: false, error: `解法过长，最大 ${INPUT_LIMITS.maxSolutionLength} 字符` }
  }

  // 使用解析器计算实际步数（支持无空格公式如 RRULLBFF）
  const scrambleParsed = parseFormula(scramble)
  const solutionParsed = parseFormula(solution)

  if (!scrambleParsed.isValid) {
    return { valid: false, error: `打乱公式解析失败: ${scrambleParsed.errors[0]}` }
  }
  if (!solutionParsed.isValid) {
    return { valid: false, error: `解法解析失败: ${solutionParsed.errors[0]}` }
  }

  const scrambleMoves = scrambleParsed.count
  const solutionMoves = solutionParsed.count

  if (scrambleMoves > INPUT_LIMITS.maxMoveCount) {
    return { valid: false, error: `打乱动作过多，最大 ${INPUT_LIMITS.maxMoveCount} 步` }
  }
  if (solutionMoves > INPUT_LIMITS.maxMoveCount) {
    return { valid: false, error: `解法动作过多，最大 ${INPUT_LIMITS.maxMoveCount} 步` }
  }

  // 字符集检查
  const validChars = /^[RLUDFBrludfbxyzMESmes\s'2()0-9]+$/
  if (!validChars.test(scramble)) {
    return { valid: false, error: '打乱公式包含非法字符' }
  }
  if (!validChars.test(solution)) {
    return { valid: false, error: '解法包含非法字符' }
  }

  return { valid: true }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 获取IP地址 (Next.js 15+ 使用 headers 获取)
    const headers = req.headers
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'

    // 速率限制检查
    if (!checkRateLimit(ip)) {
      logger.warn('Rate limit exceeded', { requestId, ip })
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    // API 认证检查
    const authResult = checkAuth(headers)
    if (!authResult.valid) {
      logger.warn('Authentication failed', { requestId, ip, error: authResult.error })
      return NextResponse.json(
        { error: authResult.error || '认证失败' },
        { status: 401 }
      )
    }

    const { scramble, solution, detailed = true, enhanced = true } = await req.json()

    // 验证输入存在
    if (!scramble || !solution) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, { requestId, error: 'Missing parameters' })
      return NextResponse.json(
        { error: '缺少必要参数: scramble 和 solution' },
        { status: 400 }
      )
    }

    // 验证输入内容
    const validation = validateInput(scramble.trim(), solution.trim())
    if (!validation.valid) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, { requestId, error: validation.error })
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // 调用分析引擎
    let result: any

    if (enhanced && detailed) {
      // 使用增强版分析
      result = await analyzeSolutionEnhanced({
        scramble: scramble.trim(),
        userSolution: solution.trim(),
      })
    } else if (detailed) {
      // 使用详细分析
      result = await analyzeSolutionDetailed({
        scramble: scramble.trim(),
        userSolution: solution.trim(),
      })
    } else {
      // 使用基础分析
      result = await analyzeSolution({
        scramble: scramble.trim(),
        userSolution: solution.trim(),
      })
    }

    const duration = Date.now() - startTime
    const steps = 'userSteps' in result.summary ? result.summary.userSteps : (result.summary as any).steps
    logger.api('POST', '/api/cube/analyze', 200, duration, { requestId, steps })

    return NextResponse.json(result)
  } catch (e) {
    const duration = Date.now() - startTime
    logger.error('Analysis error', {
      requestId,
      duration,
      error: e instanceof Error ? { message: e.message, stack: e.stack } : String(e)
    })
    return NextResponse.json(
      { error: '分析失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// GET endpoint 用于测试
export async function GET() {
  return NextResponse.json({
    message: 'Cube analysis API is ready',
    version: '1.0.0',
  })
}
