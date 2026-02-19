import { NextRequest, NextResponse } from 'next/server'
import { analyzeSolutionEnhanced } from '@/lib/cube/analyzer-v3'
import { parseFormula } from '@/lib/cube/parser'
import {
  applyScramble as applyScrambleCFOP,
  createSolvedCubeState,
  isCrossComplete,
  isF2LComplete,
  solveCFOPDetailedVerified,
} from '@/lib/cube/cfop-latest'
import { logger, generateRequestId } from '@/lib/utils/logger'

// 绠€鍗曠殑閫熺巼闄愬埗瀛樺偍锛堢敓浜х幆澧冨簲浣跨敤 Redis 绛夛級
const ipLimitMap = new Map<string, { count: number; resetTime: number }>()

// 闄愬埗閰嶇疆
const RATE_LIMIT = {
  maxRequests: 10,        // 姣忓垎閽熸渶澶氳姹傛暟
  windowMs: 60 * 1000,    // 1鍒嗛挓绐楀彛
}
const ANALYZE_CACHE_TTL_MS = 2 * 60 * 1000
const CFOP_REF_CACHE_TTL_MS = 5 * 60 * 1000
const analyzeResponseCache = new Map<string, { expiresAt: number; payload: unknown }>()
const cfopReferenceCache = new Map<string, { expiresAt: number; payload: unknown }>()

const INPUT_LIMITS = {
  maxScrambleLength: 500,   // 鎵撲贡鍏紡鏈€澶ч暱搴?
  maxSolutionLength: 2000,  // 瑙ｆ硶鏈€澶ч暱搴?
  maxMoveCount: 200,        // 鏈€澶у姩浣滄暟
}

// API 瀵嗛挜閰嶇疆锛堜粠鐜鍙橀噺璇诲彇锛?
const API_KEYS = (process.env.API_KEYS || '').split(',').filter(k => k.length > 0)
const SKIP_AUTH_FOR_DEMO = process.env.NODE_ENV !== 'production'

function checkAuth(headers: Headers): { valid: boolean; error?: string } {
  // 寮€鍙戠幆澧冭烦杩囪璇?
  if (SKIP_AUTH_FOR_DEMO) {
    return { valid: true }
  }

  // 濡傛灉閰嶇疆浜?API 瀵嗛挜锛屾鏌ヨ姹傚ご
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

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // 鏂扮獥鍙?
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

function getRateLimitKey(headers: Headers): string {
  const apiKey = headers.get('x-api-key') || headers.get('authorization') || ''
  const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown'
  const ua = (headers.get('user-agent') || '').slice(0, 120)
  return apiKey ? `key:${apiKey}` : `ip:${ip}|ua:${ua}`
}

function getCachedValue(cache: Map<string, { expiresAt: number; payload: unknown }>, key: string): unknown | null {
  const now = Date.now()
  const cached = cache.get(key)
  if (!cached) return null
  if (cached.expiresAt <= now) {
    cache.delete(key)
    return null
  }
  return cached.payload
}

function setCachedValue(
  cache: Map<string, { expiresAt: number; payload: unknown }>,
  key: string,
  payload: unknown,
  ttlMs: number,
): void {
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    payload,
  })
}

function validateInput(scramble: string, solution?: string): { valid: boolean; error?: string } {
  // 闀垮害妫€鏌?
  if (scramble.length > INPUT_LIMITS.maxScrambleLength) {
    return { valid: false, error: `鎵撲贡鍏紡杩囬暱锛屾渶澶?${INPUT_LIMITS.maxScrambleLength} 瀛楃` }
  }
  if ((solution || '').length > INPUT_LIMITS.maxSolutionLength) {
    return { valid: false, error: `瑙ｆ硶杩囬暱锛屾渶澶?${INPUT_LIMITS.maxSolutionLength} 瀛楃` }
  }

  // 浣跨敤瑙ｆ瀽鍣ㄨ绠楀疄闄呮鏁帮紙鏀寔鏃犵┖鏍煎叕寮忓 RRULLBFF锛?
  const scrambleParsed = parseFormula(scramble)
  const solutionParsed = solution ? parseFormula(solution) : null

  if (!scrambleParsed.isValid) {
    return { valid: false, error: `鎵撲贡鍏紡瑙ｆ瀽澶辫触: ${scrambleParsed.errors[0]}` }
  }
  if (solutionParsed && !solutionParsed.isValid) {
    return { valid: false, error: `瑙ｆ硶瑙ｆ瀽澶辫触: ${solutionParsed.errors[0]}` }
  }

  const scrambleMoves = scrambleParsed.count
  const solutionMoves = solutionParsed?.count || 0

  if (scrambleMoves > INPUT_LIMITS.maxMoveCount) {
    return { valid: false, error: 'Scramble move count exceeds limit' }
  }
  if (solutionParsed && solutionMoves > INPUT_LIMITS.maxMoveCount) {
    return { valid: false, error: 'Solution move count exceeds limit' }
  }

  // 瀛楃闆嗘鏌?
  const validChars = /^[RLUDFBrludfbxyzMESmes\s'2()0-9]+$/
  if (!validChars.test(scramble)) {
    return { valid: false, error: '鎵撲贡鍏紡鍖呭惈闈炴硶瀛楃' }
  }
  if (solution && !validChars.test(solution)) {
    return { valid: false, error: '瑙ｆ硶鍖呭惈闈炴硶瀛楃' }
  }

  return { valid: true }
}

function analyzeUserStages(scramble: string, userSolution: string) {
  const moves = userSolution
    .replace(/[鈥欌€榒]/g, "'")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  let state = applyScrambleCFOP(createSolvedCubeState(), scramble)

  let crossAt = -1
  let f2lAt = -1
  let ollAt = -1
  let solvedAt = -1

  for (let i = 0; i < moves.length; i++) {
    state = state.move(moves[i])

    if (crossAt < 0 && isCrossComplete(state)) {
      crossAt = i + 1
    }
    if (crossAt >= 0 && f2lAt < 0 && isF2LComplete(state)) {
      f2lAt = i + 1
    }
    if (f2lAt >= 0 && ollAt < 0) {
      const uFace = state.asString().substring(0, 9)
      if (uFace === 'UUUUUUUUU') {
        ollAt = i + 1
      }
    }
    if (solvedAt < 0 && state.isSolved()) {
      solvedAt = i + 1
      break
    }
  }

  const total = moves.length
  const crossSteps = crossAt > 0 ? crossAt : 0
  const f2lSteps = f2lAt > 0 && crossAt > 0 ? Math.max(0, f2lAt - crossAt) : 0
  const ollSteps = ollAt > 0 && f2lAt > 0 ? Math.max(0, ollAt - f2lAt) : 0
  const pllSteps = solvedAt > 0 && ollAt > 0 ? Math.max(0, solvedAt - ollAt) : 0

  return {
    userSolved: solvedAt > 0,
    solvedAt,
    totalSteps: total,
    stages: {
      cross: crossSteps,
      f2l: f2lSteps,
      oll: ollSteps,
      pll: pllSteps,
    },
  }
}

function buildStageComparison(user: { cross: number; f2l: number; oll: number; pll: number }, cfop: { cross: number; f2l: number; oll: number; pll: number }) {
  const stageOrder: Array<'cross' | 'f2l' | 'oll' | 'pll'> = ['cross', 'f2l', 'oll', 'pll']
  return stageOrder.map((stage) => {
    const userSteps = user[stage]
    const optimalSteps = cfop[stage]
    const gap = userSteps - optimalSteps
    let suggestion = 'Keep current approach and improve turning speed.'
    if (gap >= 6) suggestion = 'Large step overhead: practice canonical cases and reduce regrips/rotations.'
    else if (gap >= 3) suggestion = 'Some overhead: refine recognition and execution flow.'
    else if (gap <= -2) suggestion = 'Efficient stage; keep stability and lookahead.'

    return {
      stage: stage.toUpperCase(),
      userSteps,
      optimalSteps,
      gap,
      suggestion,
    }
  })
}

type StageKey = 'cross' | 'f2l' | 'oll' | 'pll'

type CoachRecommendation = {
  priority: number
  title: string
  area: string
  currentStatus: string
  targetStatus: string
  estimatedImprovement: string
  effort: 'low' | 'medium' | 'high'
  actionItems: string[]
  resourceLinks: Array<{ title: string; url: string }>
  timeToSeeResults: string
}

function resourcesForArea(area: string): Array<{ title: string; url: string }> {
  if (area === 'Cross') {
    return [
      { title: 'J Perm - Cross Fundamentals', url: 'https://jperm.net/3x3/cfop' },
      { title: 'CubeSkills - Cross Training', url: 'https://www.cubeskills.com/categories/the-cross' },
    ]
  }
  if (area === 'F2L') {
    return [
      { title: 'J Perm - Intuitive F2L', url: 'https://jperm.net/3x3/cfop/f2l' },
      { title: 'CubeSkills - F2L', url: 'https://www.cubeskills.com/categories/f2l' },
      { title: 'F2L Cases & Examples', url: 'https://www.speedsolving.com/wiki/index.php/F2L' },
    ]
  }
  if (area === 'OLL') {
    return [
      { title: 'J Perm - 2-Look OLL', url: 'https://jperm.net/algs/2look/oll' },
      { title: 'CubeSkills - OLL', url: 'https://www.cubeskills.com/categories/oll' },
    ]
  }
  if (area === 'PLL') {
    return [
      { title: 'J Perm - 2-Look PLL', url: 'https://jperm.net/algs/2look/pll' },
      { title: 'PLL Case Reference (CN)', url: 'http://www.mf100.org/cfop/pll.htm' },
      { title: 'CubeSkills - PLL', url: 'https://www.cubeskills.com/categories/pll' },
    ]
  }
  return [
    { title: 'CFOP Learning Path', url: 'https://jperm.net/3x3/cfop' },
    { title: 'CubeSkills', url: 'https://www.cubeskills.com/' },
  ]
}

function buildCoachRecommendations(params: {
  userSolved: boolean
  userStages: Record<StageKey, number>
  cfopStages: Record<StageKey, number>
  userTotal: number
  cfopTotal: number
}): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = []
  const stageKeys: StageKey[] = ['cross', 'f2l', 'oll', 'pll']
  const gaps: Array<{ stage: StageKey; gap: number }> = stageKeys.map((stage) => ({
    stage,
    gap: (params.userStages[stage] || 0) - (params.cfopStages[stage] || 0),
  }))
  const sorted = gaps.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap)
  if (!params.userSolved) {
    recommendations.push({
      priority: 1,
      title: 'Stabilize full solve completion',
      area: 'Accuracy',
      currentStatus: 'Provided solution does not fully solve the cube.',
      targetStatus: 'Reach 100% solved replay first, then optimize steps.',
      estimatedImprovement: 'Remove DNF risk',
      effort: 'medium',
      actionItems: [
        'Enter all moves in exact order.',
        'Include cube rotations x/y/z if used.',
        'Replay once before submitting for analysis.',
      ],
      resourceLinks: resourcesForArea('Overall'),
      timeToSeeResults: '2-3 days',
    })
  }
  let priority = recommendations.length + 1
  for (const item of sorted.slice(0, 3)) {
    const area = item.stage.toUpperCase()
    recommendations.push({
      priority: priority++,
      title: `${area} has avoidable overhead`,
      area,
      currentStatus: `${params.userStages[item.stage]} steps vs reference ${params.cfopStages[item.stage]} steps`,
      targetStatus: `Reduce to <= ${params.cfopStages[item.stage] + 1} steps`,
      estimatedImprovement: `Save about ${item.gap} steps`,
      effort: item.stage === 'f2l' ? 'high' : 'medium',
      actionItems: [
        `Drill ${area} recognition and execution.`,
        'Reduce pauses and unnecessary rotations.',
        'Use stage-specific algorithm review resources.',
      ],
      resourceLinks: resourcesForArea(area),
      timeToSeeResults: '3-7 days',
    })
  }
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 1,
      title: 'Maintain current efficiency',
      area: 'Overall',
      currentStatus: `${params.userTotal} steps vs reference ${params.cfopTotal} steps`,
      targetStatus: 'Keep consistency and improve turning quality',
      estimatedImprovement: 'Small gains via execution stability',
      effort: 'low',
      actionItems: [
        'Keep warmup and rhythm stable.',
        'Focus on lookahead continuity.',
      ],
      resourceLinks: resourcesForArea('Overall'),
      timeToSeeResults: '1 week',
    })
  }
  return recommendations.slice(0, 5)
}
function buildWeeklyPlan(recommendations: CoachRecommendation[]) {
  const primary = recommendations[0]
  const secondary = recommendations[1] || recommendations[0]
  return [
    { day: 1, focus: primary?.area || 'F2L', durationMinutes: 30, goal: 'Slow and accurate drill for key stage' },
    { day: 2, focus: primary?.area || 'F2L', durationMinutes: 30, goal: 'Case recognition + smooth execution' },
    { day: 3, focus: secondary?.area || 'Cross', durationMinutes: 25, goal: 'Target second bottleneck stage' },
    { day: 4, focus: primary?.area || 'F2L', durationMinutes: 30, goal: 'Apply improvements in full solves' },
    { day: 5, focus: 'OLL/PLL', durationMinutes: 20, goal: 'Review core last-layer cases' },
    { day: 6, focus: 'Full Solve', durationMinutes: 35, goal: 'Track step count and consistency' },
    { day: 7, focus: 'Review', durationMinutes: 20, goal: 'Summarize progress and set next targets' },
  ]
}export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 鑾峰彇IP鍦板潃 (Next.js 15+ 浣跨敤 headers 鑾峰彇)
    const headers = req.headers
    const rateKey = getRateLimitKey(headers)

    if (!checkRateLimit(rateKey)) {
      logger.warn('Rate limit exceeded', { requestId, rateKey })
      return NextResponse.json(
        { error: '璇锋眰杩囦簬棰戠箒锛岃绋嶅悗鍐嶈瘯' },
        { status: 429 }
      )
    }

    // API 璁よ瘉妫€鏌?
    const authResult = checkAuth(headers)
    if (!authResult.valid) {
      logger.warn('Authentication failed', { requestId, rateKey, error: authResult.error })
      return NextResponse.json(
        { error: authResult.error || '璁よ瘉澶辫触' },
        { status: 401 }
      )
    }

    const { scramble, solution } = await req.json()
    const trimmedScramble = String(scramble || '').trim()
    const trimmedSolution = String(solution || '').trim()
    const hasUserSolution = trimmedSolution.length > 0
    const effectiveSolutionMarker = hasUserSolution ? trimmedSolution : '__CFOP_REFERENCE__'
    const cacheKey = `${trimmedScramble}||${effectiveSolutionMarker}`

    const cachedResponse = getCachedValue(analyzeResponseCache, cacheKey)
    if (cachedResponse) {
      return NextResponse.json({
        ...(cachedResponse as Record<string, unknown>),
        cached: true,
      })
    }

    // 楠岃瘉杈撳叆瀛樺湪
    if (!trimmedScramble) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, { requestId, error: 'Missing parameters' })
      return NextResponse.json(
        { error: 'Missing required parameter: scramble' },
        { status: 400 }
      )
    }

    // 楠岃瘉杈撳叆鍐呭
    const validation = validateInput(trimmedScramble, hasUserSolution ? trimmedSolution : undefined)
    if (!validation.valid) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, { requestId, error: validation.error })
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const userStageInfo = hasUserSolution
      ? analyzeUserStages(trimmedScramble, trimmedSolution)
      : {
          userSolved: true,
          solvedAt: 0,
          totalSteps: 0,
          stages: { cross: 0, f2l: 0, oll: 0, pll: 0 },
        }
    if (hasUserSolution && !userStageInfo.userSolved) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, {
        requestId,
        error: 'user_solution_not_solved',
        totalSteps: userStageInfo.totalSteps,
      })
      return NextResponse.json(
        {
          error: 'Your solution does not solve this scramble. Check missing/extra moves, notation typos, and x/y/z rotations.',
          code: 'USER_SOLUTION_NOT_SOLVED',
          solvedAt: userStageInfo.solvedAt,
          totalSteps: userStageInfo.totalSteps,
          tip: 'Possible causes: missing moves, extra moves, wrong notation (including 2 and prime), or omitted x/y/z rotations.',
        },
        { status: 400 }
      )
    }
    // 鍏堟眰瑙ｅ苟楠岃瘉瀹屾暣 CFOP锛屽啀鍋氬垎闃舵瀵规瘮寤鸿
    const cfopCached = getCachedValue(cfopReferenceCache, trimmedScramble) as
      | {
          cfop: ReturnType<typeof solveCFOPDetailedVerified>
          stageValidation: { crossCompleteAfterCross: boolean; f2lCompleteAfterF2L: boolean; solvedAfterFull: boolean }
          cfopVerified: boolean
        }
      | null

    const cfop = cfopCached?.cfop || solveCFOPDetailedVerified(trimmedScramble)
    const replayStart = applyScrambleCFOP(createSolvedCubeState(), trimmedScramble)
    const afterCross = cfop.cross.moves ? replayStart.move(cfop.cross.moves) : replayStart
    const afterF2L = cfop.f2l.moves ? afterCross.move(cfop.f2l.moves) : afterCross
    const afterOLL = cfop.oll.moves ? afterF2L.move(cfop.oll.moves) : afterF2L
    const afterPLL = cfop.pll.moves ? afterOLL.move(cfop.pll.moves) : afterOLL
    const cfopStageValidation = cfopCached?.stageValidation || {
      crossCompleteAfterCross: isCrossComplete(afterCross),
      f2lCompleteAfterF2L: isF2LComplete(afterF2L),
      solvedAfterFull: afterPLL.isSolved(),
    }
    const cfopVerified = cfopCached?.cfopVerified ?? (cfop.verified && cfopStageValidation.solvedAfterFull)
    if (!cfopCached) {
      setCachedValue(
        cfopReferenceCache,
        trimmedScramble,
        { cfop, stageValidation: cfopStageValidation, cfopVerified },
        CFOP_REF_CACHE_TTL_MS,
      )
    }
    if (!cfopVerified) {
      logger.warn('CFOP reference verification failed, using degraded analyze response', {
        requestId,
        scramble: trimmedScramble,
        cfopStageValidation,
      })
    }

    // Analyze with fallback so the full pipeline remains available even if model analysis fails.
    let result: Awaited<ReturnType<typeof analyzeSolutionEnhanced>> & { degraded?: boolean; degradedReason?: string }
    try {
      result = await analyzeSolutionEnhanced({
        scramble: trimmedScramble,
        userSolution: hasUserSolution ? trimmedSolution : cfop.solution,
      })
    } catch (analyzeError) {
      const parsed = parseFormula(hasUserSolution ? trimmedSolution : cfop.solution)
      const userSteps = parsed.isValid
        ? parsed.count
        : (hasUserSolution ? trimmedSolution : cfop.solution).split(/\s+/).filter(Boolean).length
      result = {
        summary: {
          userSteps,
          optimalSteps: cfop.totalSteps,
          efficiency: cfop.totalSteps > 0 ? Math.max(0, Math.min(100, Math.round((cfop.totalSteps / Math.max(userSteps, 1)) * 100))) : 0,
          estimatedTime: Number((userSteps / 3.2).toFixed(2)),
          level: userSteps <= 45 ? 'advanced' : userSteps <= 60 ? 'intermediate' : 'beginner',
        },
        stepOptimizations: [],
        patterns: { inefficient: [], shortcuts: [] },
        f2lSlots: undefined,
        ollCase: undefined,
        pllCase: undefined,
        timeBreakdown: [],
        tpsAnalysis: {
          userTPS: 3.2,
          level: 'intermediate',
          levelName: '涓骇',
          targetTPS: 4,
          suggestion: 'Analyze engine degraded; focus on stable execution first.',
        },
        comparison: [],
        prioritizedRecommendations: [],
        fingerprintTips: [],
        degraded: true,
        degradedReason: analyzeError instanceof Error ? analyzeError.message : 'analyze_engine_failed',
      }
      logger.warn('Analyze engine degraded fallback', {
        requestId,
        reason: result.degradedReason,
      })
    }

    const cfopStageSteps = {
      cross: cfop.cross.steps,
      f2l: cfop.f2l.steps,
      oll: cfop.oll.steps,
      pll: cfop.pll.steps,
    }
    const stageComparison = (cfopVerified && hasUserSolution)
      ? buildStageComparison(userStageInfo.stages, cfopStageSteps)
      : []
    const fallbackCoachRecommendations = buildCoachRecommendations({
      userSolved: userStageInfo.userSolved,
      userStages: hasUserSolution ? userStageInfo.stages : cfopStageSteps,
      cfopStages: cfopStageSteps,
      userTotal: hasUserSolution ? userStageInfo.totalSteps : cfop.totalSteps,
      cfopTotal: cfop.totalSteps,
    })
    const modelRecommendations: CoachRecommendation[] = Array.isArray(result.prioritizedRecommendations)
      ? result.prioritizedRecommendations.map((rec: any, idx: number) => ({
          priority: Number(rec?.priority || idx + 1),
          title: String(rec?.title || '璁粌寤鸿'),
          area: String(rec?.area || 'Overall'),
          currentStatus: String(rec?.currentStatus || ''),
          targetStatus: String(rec?.targetStatus || ''),
          estimatedImprovement: String(rec?.estimatedImprovement || ''),
          effort: rec?.effort === 'high' || rec?.effort === 'medium' || rec?.effort === 'low' ? rec.effort : 'medium',
          actionItems: Array.isArray(rec?.actionItems) ? rec.actionItems.map((x: any) => String(x)) : [],
          resourceLinks: Array.isArray(rec?.resourceLinks) && rec.resourceLinks.length > 0
            ? rec.resourceLinks.map((x: any) => ({ title: String(x?.title || '瀛︿範璧勬簮'), url: String(x?.url || '') })).filter((x: { url: string }) => Boolean(x.url))
            : resourcesForArea(String(rec?.area || 'Overall')),
          timeToSeeResults: String(rec?.timeToSeeResults || '1-2 weeks'),
        }))
      : []
    const coachRecommendations = cfopVerified
      ? fallbackCoachRecommendations
      : (modelRecommendations.length > 0 ? modelRecommendations : fallbackCoachRecommendations)
    const weeklyPlan = buildWeeklyPlan(coachRecommendations)
    const deterministicEfficiency =
      hasUserSolution && cfop.totalSteps > 0
        ? Math.max(0, Math.min(100, Math.round((cfop.totalSteps / Math.max(userStageInfo.totalSteps, 1)) * 100)))
        : ('efficiency' in result.summary ? Number((result.summary as any).efficiency || 0) : 0)
    const normalizedSummary = {
      ...(result.summary as any),
      userSteps: hasUserSolution ? userStageInfo.totalSteps : (result.summary as any).userSteps,
      optimalSteps: cfop.totalSteps,
      efficiency: deterministicEfficiency,
    }

    const duration = Date.now() - startTime
    const steps = 'userSteps' in result.summary ? result.summary.userSteps : (result.summary as any).steps
    logger.api('POST', '/api/cube/analyze', 200, duration, { requestId, steps })

    const payload = {
      ...result,
      summary: normalizedSummary,
      cfopReference: {
        scramble: trimmedScramble,
        solution: cfop.solution,
        totalSteps: cfop.totalSteps,
        stages: cfopStageSteps,
        verified: cfopVerified,
        stageValidation: cfopStageValidation,
      },
      userStageReplay: userStageInfo,
      stageComparison,
      prioritizedRecommendations: coachRecommendations,
      problemSolutionPairs: coachRecommendations.slice(0, 3).map((rec) => ({
        problem: rec.currentStatus || rec.title,
        solution: rec.actionItems[0] || rec.targetStatus || 'Drill this stage with deliberate, slow solves.',
        area: rec.area,
        priority: rec.priority,
      })),
      coachPlan: {
        recommendations: coachRecommendations,
        weeklyPlan,
        learningResources: coachRecommendations
          .slice(0, 3)
          .flatMap((r) => r.resourceLinks)
          .filter((v, i, arr) => arr.findIndex((x) => x.url === v.url) === i),
        nextSolveChecklist: [
          'Confirm Cross target edges before turning to avoid blind moves.',
          'For each F2L slot, prioritize low-cost pair setup before insertion.',
          'Recognize OLL/PLL first, then execute in one clean burst.',
          'Record per-stage move counts after each solve and track bottlenecks weekly.',
        ],
      },
      policy: {
        compareAfterFullCFOP: cfopVerified,
        note: cfopVerified
          ? 'Stage comparison is generated only after reference CFOP full verification succeeds.'
          : 'Reference CFOP is not verified for this request; stage comparison is skipped.',
      },
      analysisMode: hasUserSolution ? 'user_solution' : 'reference_solution',
      inputSolutionUsed: hasUserSolution ? trimmedSolution : cfop.solution,
      requiresRotationInputTip: hasUserSolution
        ? 'If your source app omits rotations, manually include x/y/z in your solution.'
        : 'No user solution provided. Analysis is based on the CFOP reference solution.',
      warning: undefined,
      degraded: !!result.degraded,
      degradedReason: result.degradedReason,
      cached: false,
    }

    setCachedValue(analyzeResponseCache, cacheKey, payload, ANALYZE_CACHE_TTL_MS)
    return NextResponse.json(payload)
  } catch (e) {
    const duration = Date.now() - startTime
    logger.error('Analysis error', {
      requestId,
      duration,
      error: e instanceof Error ? { message: e.message, stack: e.stack } : String(e)
    })
    return NextResponse.json(
      { error: '鍒嗘瀽澶辫触锛岃绋嶅悗閲嶈瘯' },
      { status: 500 }
    )
  }
}

// GET endpoint 鐢ㄤ簬娴嬭瘯
export async function GET() {
  return NextResponse.json({
    message: 'Cube analysis API is ready',
    version: '1.0.0',
  })
}


