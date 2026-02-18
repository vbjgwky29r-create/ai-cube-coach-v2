/**
 * CFOP 姹傝В API
 *
 * 鎺ユ敹鎵撲贡鍏紡锛岃繑鍥?CFOP 鍒嗛樁娈佃В娉?
 *
 * POST /api/cube/cfop-solve
 * Body: { scramble: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  applyScramble,
  createSolvedCubeState,
  isCrossComplete,
  isF2LComplete,
  solveCFOPDetailedVerified,
} from '@/lib/cube/cfop-latest'
import { logger, generateRequestId } from '@/lib/utils/logger'

const RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 1000,
}
const RESULT_CACHE_TTL_MS = 5 * 60 * 1000
const ipLimitMap = new Map<string, { count: number; resetTime: number }>()
const resultCache = new Map<string, { expiresAt: number; payload: unknown }>()

/**
 * 楠岃瘉榄旀柟鍏紡鏍煎紡
 */
function validateFormula(formula: string): boolean {
  if (!formula || formula.trim().length === 0) {
    return false
  }

  // 鍩烘湰妫€鏌ワ細鍙寘鍚悎娉曠殑榄旀柟璁版硶瀛楃
  const validPattern = /^[\sURFDLBEMSXYZurfdlbemsxyz'2]+$/
  return validPattern.test(formula)
}

/**
 * 瑙ｆ瀽骞舵爣鍑嗗寲鍏紡
 * 淇濈暀瀹借浆锛坮/l/u/d/f/b锛夊拰涓眰杞紙M/E/S锛夌殑澶у皬鍐欏尯鍒?
 */
function normalizeFormula(formula: string): string {
  return formula
    .trim()
    .replace(/\s+/g, ' ')
    // 鍙皢澶у啓鍩虹杞綋锛圧/L/U/D/F/B锛夋爣鍑嗗寲锛屼繚鐣欏杞拰涓眰杞殑灏忓啓
    .replace(/\b([URFDLB])\b/g, (match) => match.toUpperCase())
}

function getRateLimitKey(headers: Headers): string {
  const apiKey = headers.get('x-api-key') || headers.get('authorization') || ''
  const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
  const ua = (headers.get('user-agent') || '').slice(0, 120)
  return apiKey ? `key:${apiKey}` : `ip:${ip}|ua:${ua}`
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = ipLimitMap.get(key)
  if (!record || now > record.resetTime) {
    ipLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    })
    return true
  }
  if (record.count >= RATE_LIMIT.maxRequests) return false
  record.count++
  return true
}

function getCachedResult(key: string): unknown | null {
  const cached = resultCache.get(key)
  if (!cached) return null
  if (cached.expiresAt <= Date.now()) {
    resultCache.delete(key)
    return null
  }
  return cached.payload
}

function setCachedResult(key: string, payload: unknown): void {
  resultCache.set(key, {
    expiresAt: Date.now() + RESULT_CACHE_TTL_MS,
    payload,
  })
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  try {
    const rateKey = getRateLimitKey(request.headers)
    if (!checkRateLimit(rateKey)) {
      logger.warn('Rate limit exceeded', { requestId, rateKey, endpoint: 'cfop-solve' })
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试', success: false },
        { status: 429 }
      )
    }

    const { scramble } = await request.json()

    // 楠岃瘉杈撳叆
    if (!scramble) {
      return NextResponse.json(
        { error: '缂哄皯鎵撲贡鍏紡' },
        { status: 400 }
      )
    }

    const normalized = normalizeFormula(scramble)
    const cached = getCachedResult(normalized)
    if (cached) {
      return NextResponse.json({
        ...(cached as Record<string, unknown>),
        cached: true,
      })
    }

    if (!validateFormula(normalized)) {
      return NextResponse.json(
        { error: 'Invalid scramble notation' },
        { status: 400 }
      )
    }

    // 姹傝В - 浣跨敤楠岃瘉鐗堣缁嗘眰瑙ｅ櫒
    const solution = solveCFOPDetailedVerified(normalized)
    const scrambledState = applyScramble(createSolvedCubeState(), normalized)
    const afterCross = solution.cross.moves ? scrambledState.move(solution.cross.moves) : scrambledState
    const afterF2L = solution.f2l.moves ? afterCross.move(solution.f2l.moves) : afterCross
    const afterOLL = solution.oll.moves ? afterF2L.move(solution.oll.moves) : afterF2L
    const afterPLL = solution.pll.moves ? afterOLL.move(solution.pll.moves) : afterOLL

    const stageValidation = {
      crossCompleteAfterCross: isCrossComplete(afterCross),
      f2lCompleteAfterF2L: isF2LComplete(afterF2L),
      solvedAfterFull: afterPLL.isSolved(),
    }
    const verified = solution.verified && stageValidation.solvedAfterFull

    const payload = {
      success: true,
      scramble: normalized,
      solution: {
        cross: {
          moves: solution.cross.moves,
          steps: solution.cross.steps,
        },
        f2l: {
          moves: solution.f2l.moves,
          steps: solution.f2l.steps,
          slots: solution.f2l.slots,
          slotHistory: solution.f2l.slotHistory,
        },
        oll: {
          moves: solution.oll.moves,
          steps: solution.oll.steps,
          caseId: solution.oll.caseId,
          caseName: solution.oll.caseName,
        },
        pll: {
          moves: solution.pll.moves,
          steps: solution.pll.steps,
          caseId: solution.pll.caseId,
          caseName: solution.pll.caseName,
        },
        fullSolution: solution.solution,
        totalSteps: solution.totalSteps,
      },
      verified,
      stageValidation,
      cached: false,
    }
    setCachedResult(normalized, payload)
    logger.api('POST', '/api/cube/cfop-solve', 200, Date.now() - startTime, { requestId, verified })
    return NextResponse.json(payload)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '求解失败'
    logger.error('[CFOP Solve API] Error', { requestId, duration: Date.now() - startTime, message })

    return NextResponse.json(
      {
        error: message || '姹傝В澶辫触',
        success: false,
        retryable: true,
      },
      { status: 500 }
    )
  }
}

/**
 * GET 璇锋眰 - 杩斿洖 API 淇℃伅
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cube/cfop-solve',
    method: 'POST',
    description: 'CFOP 姹傝В鍣?- 鍩轰簬cubejs鐨勫垎闃舵姹傝В',
    parameters: {
      scramble: {
        type: 'string',
        description: '鎵撲贡鍏紡',
        example: "D L2 B2 U2 F2 R2 D R2 D2 U' B2 L B' R' B D' U2 B' U' F L",
      },
    },
    response: {
      success: 'boolean',
      solution: {
        cross: '鍗佸瓧瑙ｆ硶',
        f2l: 'F2L stage moves',
        oll: 'OLL stage moves',
        pll: 'PLL stage moves',
        fullSolution: 'full CFOP solution',
        totalSteps: 'total move count',
      },
    },
  })
}

