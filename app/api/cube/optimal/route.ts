import { NextRequest, NextResponse } from 'next/server'
import { applyScramble, createSolvedCube, unflattenCubeState } from '@/lib/cube/cube-state'
import { findMatchingFormula } from '@/lib/cube/formulas'
import { parseFormula } from '@/lib/cube/parser'
import { solveCFOPDetailedVerified } from '@/lib/cube/cfop-latest'
import { logger, generateRequestId } from '@/lib/utils/logger'

// 绠€鍗曠殑閫熺巼闄愬埗瀛樺偍
const ipLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  maxRequests: 20,        // 姣忓垎閽熸渶澶氳姹傛暟
  windowMs: 60 * 1000,    // 1鍒嗛挓绐楀彛
}

// API 瀵嗛挜閰嶇疆
const API_KEYS = (process.env.API_KEYS || '').split(',').filter(k => k.length > 0)
const SKIP_AUTH_FOR_DEMO = process.env.NODE_ENV !== 'production'

function normalizeScrambleForSolver(input: string): { normalized: string; invalidTokens: string[] } {
  const cleaned = input
    .replace(/[’‘`´]/g, "'")
    .replace(/[\u00A0\u3000]/g, ' ')
    .trim()
  const tokens = cleaned.split(/\s+/).filter(Boolean)
  const invalidTokens: string[] = []
  const normalizedTokens: string[] = []

  for (const token of tokens) {
    const m = token.match(/^([RLUDFBrludfb])(2|'|2'|'2)?$/)
    if (!m) {
      invalidTokens.push(token)
      continue
    }
    const face = m[1].toUpperCase()
    const suffixRaw = m[2] || ''
    const suffix = suffixRaw.includes('2') ? '2' : suffixRaw.includes("'") ? "'" : ''
    normalizedTokens.push(`${face}${suffix}`)
  }

  return { normalized: normalizedTokens.join(' '), invalidTokens }
}

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
      return { valid: false, error: '缂哄皯 API 瀵嗛挜' }
    }
    if (!API_KEYS.includes(apiKey)) {
      return { valid: false, error: '鏃犳晥鐨?API 瀵嗛挜' }
    }
  }

  return { valid: true }
}

/**
 * GET /api/cube/optimal
 *
 * 鏍规嵁鎵撲贡鍏紡鑾峰彇鏈€浼樿В鍜岄瓟鏂圭姸鎬?
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  // 璁よ瘉鍜岄€熺巼闄愬埗妫€鏌?
  const headers = req.headers
  const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'

  if (!checkRateLimit(ip)) {
    logger.warn('Rate limit exceeded', { requestId, ip, endpoint: 'optimal' })
    return NextResponse.json(
      { error: '璇锋眰杩囦簬棰戠箒锛岃绋嶅悗鍐嶈瘯' },
      { status: 429 }
    )
  }

  const authResult = checkAuth(headers)
  if (!authResult.valid) {
    logger.warn('Authentication failed', { requestId, ip, endpoint: 'optimal', error: authResult.error })
    return NextResponse.json(
      { error: authResult.error || '璁よ瘉澶辫触' },
      { status: 401 }
    )
  }

  const result = await handleOptimalRequest(headers, req.url, requestId, startTime)

  // 璁板綍API璋冪敤
  if (result.status === 200) {
    logger.api('GET', '/api/cube/optimal', 200, Date.now() - startTime, { requestId })
  }

  return result
}

/**
 * POST /api/cube/optimal
 *
 * 鍚?GET锛屼絾浣跨敤 POST 鏂规硶
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 璁よ瘉鍜岄€熺巼闄愬埗妫€鏌?
    const headers = req.headers
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      logger.warn('Rate limit exceeded', { requestId, ip, endpoint: 'optimal' })
      return NextResponse.json(
        { error: '璇锋眰杩囦簬棰戠箒锛岃绋嶅悗鍐嶈瘯' },
        { status: 429 }
      )
    }

    const authResult = checkAuth(headers)
    if (!authResult.valid) {
      logger.warn('Authentication failed', { requestId, ip, endpoint: 'optimal', error: authResult.error })
      return NextResponse.json(
        { error: authResult.error || '璁よ瘉澶辫触' },
        { status: 401 }
      )
    }

    const { scramble } = await req.json()
    const result = await handleOptimalRequest(headers, null, requestId, startTime, scramble)

    // 璁板綍API璋冪敤
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
      { error: 'Invalid request body' },
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
        { error: '缂哄皯 scramble 鍙傛暟' },
        { status: 400 }
      )
    }

    const trimmedScramble = scramble.trim()
    const { normalized: normalizedScramble, invalidTokens } = normalizeScrambleForSolver(trimmedScramble)

    if (invalidTokens.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid move token(s): ${invalidTokens.join(', ')}`,
          hint: "Allowed tokens are R L U D F B with optional ' or 2",
        },
        { status: 400 }
      )
    }

    // 楠岃瘉杈撳叆锛堝厑璁稿ぇ鍐欍€佸皬鍐欏瓧姣嶅拰淇グ绗︼級
    const validChars = /^[RLUDFB\s'2]+$/
    if (!normalizedScramble || !validChars.test(normalizedScramble)) {
      return NextResponse.json(
        { error: '鎵撲贡鍏紡鍖呭惈闈炴硶瀛楃锛岃鍙娇鐢?R L U D F B锛堝ぇ鍐欏崟灞傦紝灏忓啓涓ゅ眰锛夊強淇グ绗?\' 鍜?2' },
        { status: 400 }
      )
    }

    // 鑾峰彇榄旀柟鐘舵€?
    const cubeState = applyScramble(createSolvedCube(), normalizedScramble)

    // 鐢熸垚 CFOP 鍙傝€冭В锛堜笉浣跨敤閫嗘墦涔卞瀷鏈€鐭В锛?
    const cfop = solveCFOPDetailedVerified(normalizedScramble)
    const optimalSolution = cfop.solution
    const steps = cfop.totalSteps

    if (!cfop.verified || !optimalSolution) {
      return NextResponse.json(
        {
          error: 'Solver failed to produce a verified CFOP solution for this scramble. Please check OCR result and retry.',
          scramble: normalizedScramble,
          strategy: 'CFOP',
          cfop: {
            verified: false,
            cross: cfop.cross,
            f2l: cfop.f2l,
            oll: cfop.oll,
            pll: cfop.pll,
          },
        },
        { status: 422 }
      )
    }

    // 瑙ｆ瀽鏈€浼樿В骞惰瘑鍒叕寮?
    let recognizedFormulas: any[] = []
    if (optimalSolution) {
      try {
        const solutionMoves = parseFormula(optimalSolution)
        recognizedFormulas = recognizeSolutionFormulas(solutionMoves)
      } catch (e) {
        console.error('Formula recognition error:', e)
      }
    }

    // 鐢熸垚鍏紡瑙ｈ
    const explanations = generateFormulaExplanations(optimalSolution, steps, recognizedFormulas)

    return NextResponse.json({
      scramble: normalizedScramble,
      optimalSolution,
      steps,
      cubeState: unflattenCubeState(cubeState),
      formulas: recognizedFormulas,
      explanations,
      strategy: 'CFOP',
      cfop: {
        cross: cfop.cross,
        f2l: cfop.f2l,
        oll: cfop.oll,
        pll: cfop.pll,
        verified: cfop.verified,
      },
    })
  } catch (e: any) {
    console.error('Optimal solution error:', e)
    return NextResponse.json(
      { error: '鐢熸垚鏈€浼樿В澶辫触: ' + (e?.message || '鏈煡閿欒') },
      { status: 500 }
    )
  }
}

/**
 * 璇嗗埆瑙ｆ硶涓殑鍏紡
 */
function recognizeSolutionFormulas(moves: any): any[] {
  const recognized: any[] = []

  if (!moves || !moves.moves) {
    return recognized
  }

  const moveList = moves.moves || []

  // 鎻愬彇瀛愬簭鍒楄繘琛屽尮閰?(3-10姝?
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
        // 璺宠繃鏃犳硶鍖归厤鐨勫瓙搴忓垪
      }
    }
  }

  return recognized
}

/**
 * 鐢熸垚鍏紡瑙ｈ
 */
function generateFormulaExplanations(solution: string, steps: number, formulas: any[]): string[] {
  const explanations: string[] = []

  // 鍩虹淇℃伅
  explanations.push('Solution length: ' + steps + ' moves')

  // 鎸夐樁娈佃В璇?
  if (steps <= 10) {
    explanations.push('Excellent solution length.')
  } else if (steps <= 15) {
    explanations.push('Good solution length.')
  } else if (steps <= 20) {
    explanations.push('Very efficient solve for this scramble.')
  } else {
    explanations.push('Long solution; consider CFOP recognition to shorten it.')
  }

  // 鍏紡璇嗗埆
  if (formulas.length > 0) {
    const categories = [...new Set(formulas.map((f: any) => f.category))]
    explanations.push('Recognized categories: ' + categories.join(', '))
  }

  return explanations
}

