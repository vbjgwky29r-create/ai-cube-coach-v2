import { NextRequest, NextResponse } from 'next/server'
import { applyScramble, flattenCubeState } from '@/lib/cube/cube-state'
import { findMatchingFormula } from '@/lib/cube/formulas'
import { parseFormula } from '@/lib/cube/parser'
import { logger, generateRequestId } from '@/lib/utils/logger'

// 简单的速率限制存储
const ipLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  maxRequests: 20,        // 每分钟最多请求数
  windowMs: 60 * 1000,    // 1分钟窗口
}

// API 密钥配置
const API_KEYS = (process.env.API_KEYS || '').split(',').filter(k => k.length > 0)
const SKIP_AUTH_FOR_DEMO = process.env.NODE_ENV !== 'production'

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipLimitMap.get(ip)

  if (!record || now > record.resetTime) {
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

function checkAuth(headers: Headers): { valid: boolean; error?: string } {
  if (SKIP_AUTH_FOR_DEMO) {
    return { valid: true }
  }

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

/**
 * GET /api/cube/optimal
 *
 * 根据打乱公式获取最优解和魔方状态
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  // 认证和速率限制检查
  const headers = req.headers
  const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'

  if (!checkRateLimit(ip)) {
    logger.warn('Rate limit exceeded', { requestId, ip, endpoint: 'optimal' })
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429 }
    )
  }

  const authResult = checkAuth(headers)
  if (!authResult.valid) {
    logger.warn('Authentication failed', { requestId, ip, endpoint: 'optimal', error: authResult.error })
    return NextResponse.json(
      { error: authResult.error || '认证失败' },
      { status: 401 }
    )
  }

  const result = await handleOptimalRequest(headers, req.url, requestId, startTime)

  // 记录API调用
  if (result.status === 200) {
    logger.api('GET', '/api/cube/optimal', 200, Date.now() - startTime, { requestId })
  }

  return result
}

/**
 * POST /api/cube/optimal
 *
 * 同 GET，但使用 POST 方法
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 认证和速率限制检查
    const headers = req.headers
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      logger.warn('Rate limit exceeded', { requestId, ip, endpoint: 'optimal' })
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const authResult = checkAuth(headers)
    if (!authResult.valid) {
      logger.warn('Authentication failed', { requestId, ip, endpoint: 'optimal', error: authResult.error })
      return NextResponse.json(
        { error: authResult.error || '认证失败' },
        { status: 401 }
      )
    }

    const { scramble } = await req.json()
    const result = await handleOptimalRequest(headers, null, requestId, startTime, scramble)

    // 记录API调用
    if (result.status === 200) {
      logger.api('POST', '/api/cube/optimal', 200, Date.now() - startTime, { requestId })
    }

    return result
  } catch (e) {
    logger.error('Optimal API error', {
      requestId,
      duration: Date.now() - startTime,
      error: e instanceof Error ? { message: e.message, stack: e.stack } : String(e)
    })
    return NextResponse.json(
      { error: '无效的请求格式' },
      { status: 400 }
    )
  }
}

async function handleOptimalRequest(
  headers: Headers | null,
  url: string | null,
  requestId: string,
  startTime: number,
  scrambleFromBody?: string
) {
  try {
    let scramble: string | null = null

    if (url) {
      const { searchParams } = new URL(url)
      scramble = searchParams.get('scramble')
    } else {
      scramble = scrambleFromBody || null
    }

    if (!scramble) {
      return NextResponse.json(
        { error: '缺少 scramble 参数' },
        { status: 400 }
      )
    }

    const trimmedScramble = scramble.trim()

    // 验证输入（允许大写、小写字母和修饰符）
    const validChars = /^[RLUDFBrludfb\s'2]+$/
    if (!validChars.test(trimmedScramble)) {
      return NextResponse.json(
        { error: '打乱公式包含非法字符，请只使用 R L U D F B（大写单层，小写两层）及修饰符 \' 和 2' },
        { status: 400 }
      )
    }

    // 获取魔方状态
    const cubeState = applyScramble(trimmedScramble)

    // 将打乱公式转换为 cube-solver 需要的格式（移除空格）
    const solverScramble = trimmedScramble.replace(/\s+/g, ' ').trim()

    // 生成最优解 (使用 cube-solver 库)
    let optimalSolution = ''
    let steps = 0

    try {
      // 动态导入 cube-solver
      const solver = require('cube-solver')
      const solution = solver.solve(solverScramble)

      if (solution && solution.length > 0) {
        optimalSolution = solution
        steps = solution.trim().split(/\s+/).length
      }
    } catch (solverError) {
      console.error('cube-solver error:', solverError)
      // 如果求解失败，使用逆序作为备选方案
      optimalSolution = generateInverseSolution(trimmedScramble)
      steps = optimalSolution.trim().split(/\s+/).length
    }

    // 解析最优解并识别公式
    let recognizedFormulas: any[] = []
    if (optimalSolution) {
      try {
        const solutionMoves = parseFormula(optimalSolution)
        recognizedFormulas = recognizeSolutionFormulas(solutionMoves)
      } catch (e) {
        console.error('Formula recognition error:', e)
      }
    }

    // 生成公式解说
    const explanations = generateFormulaExplanations(optimalSolution, steps, recognizedFormulas)

    return NextResponse.json({
      scramble: trimmedScramble,
      optimalSolution,
      steps,
      cubeState: flattenCubeState(cubeState),
      formulas: recognizedFormulas,
      explanations,
    })
  } catch (e: any) {
    console.error('Optimal solution error:', e)
    return NextResponse.json(
      { error: '生成最优解失败: ' + (e?.message || '未知错误') },
      { status: 500 }
    )
  }
}

/**
 * 生成逆序解法（备选方案）
 */
function generateInverseSolution(scramble: string): string {
  const moves = scramble.trim().split(/\s+/).filter(Boolean)
  const inverse: string[] = []

  // 逆序并反转每个动作
  for (let i = moves.length - 1; i >= 0; i--) {
    const move = moves[i]
    let inverted = ''

    if (move.endsWith("2")) {
      inverted = move.replace("2", "") + "2"
    } else if (move.endsWith("'")) {
      inverted = move.slice(0, -1)
    } else {
      inverted = move + "'"
    }

    inverse.push(inverted)
  }

  return inverse.join(' ')
}

/**
 * 识别解法中的公式
 */
function recognizeSolutionFormulas(moves: any): any[] {
  const recognized: any[] = []

  if (!moves || !moves.moves) {
    return recognized
  }

  const moveList = moves.moves || []

  // 提取子序列进行匹配 (3-10步)
  for (let len = Math.min(10, moveList.length); len >= 3; len--) {
    for (let i = 0; i <= moveList.length - len; i++) {
      try {
        const subMoves = moveList.slice(i, i + len)
        const matches = findMatchingFormula(subMoves)

        for (const match of matches) {
          if (!recognized.find((r: any) => r.id === match.id)) {
            recognized.push({
              id: match.id,
              name: match.name,
              category: match.category,
              notation: match.notation,
              start: i,
              end: i + len,
              explanation: match.explanation,
            })
          }
        }
      } catch {
        // 跳过无法匹配的子序列
      }
    }
  }

  return recognized
}

/**
 * 生成公式解说
 */
function generateFormulaExplanations(solution: string, steps: number, formulas: any[]): string[] {
  const explanations: string[] = []

  // 基础信息
  explanations.push(`最优解共 ${steps} 步`)

  // 按阶段解说
  if (steps <= 10) {
    explanations.push('这是一个较短的解法，适合初学者练习')
  } else if (steps <= 15) {
    explanations.push('解法长度适中，包含了多个技巧性动作')
  } else if (steps <= 20) {
    explanations.push('解法较长，建议分阶段记忆和练习')
  } else {
    explanations.push('这是完整打乱的还原解法，建议使用CFOP方法分阶段练习')
  }

  // 公式识别
  if (formulas.length > 0) {
    const categories = [...new Set(formulas.map((f: any) => f.category))]
    explanations.push(`包含的公式类型: ${categories.join(', ')}`)
  }

  return explanations
}
