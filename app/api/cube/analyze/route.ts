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

// 简单的速率限制存储（生产环境应使用 Redis 等）
const ipLimitMap = new Map<string, { count: number; resetTime: number }>()

// 限制配置
const RATE_LIMIT = {
  maxRequests: 10,        // 每分钟最多请求数
  windowMs: 60 * 1000,    // 1分钟窗口
}
const ANALYZE_CACHE_TTL_MS = 2 * 60 * 1000
const CFOP_REF_CACHE_TTL_MS = 5 * 60 * 1000
const analyzeResponseCache = new Map<string, { expiresAt: number; payload: unknown }>()
const cfopReferenceCache = new Map<string, { expiresAt: number; payload: unknown }>()

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

function analyzeUserStages(scramble: string, userSolution: string) {
  const parsed = parseFormula(userSolution)
  const moves = parsed.moves.map((m: any) => m.notation || m.move || '').filter(Boolean)
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
  const weights: Record<StageKey, number> = { cross: 1.1, f2l: 1.6, oll: 0.9, pll: 1.2 }
  const stages: StageKey[] = ['cross', 'f2l', 'oll', 'pll']
  const scored = stages
    .map((stage) => {
      const user = params.userStages[stage] || 0
      const ref = params.cfopStages[stage] || 0
      const gap = user - ref
      const ratio = ref > 0 ? gap / ref : 0
      return {
        stage,
        user,
        ref,
        gap,
        score: gap > 0 ? gap * weights[stage] + ratio * 4 : 0,
      }
    })
    .sort((a, b) => b.score - a.score)

  let priority = 1
  if (!params.userSolved) {
    recommendations.push({
      priority: priority++,
      title: '先把完整还原成功率拉到 100%',
      area: 'Accuracy',
      currentStatus: '当前复盘检测到存在未完整还原的情况',
      targetStatus: '连续 20 次都能完整还原，再压缩步数',
      estimatedImprovement: '先消除 DNF 风险',
      effort: 'medium',
      actionItems: [
        '每次复盘先做分段验收：Cross -> F2L -> OLL -> PLL',
        '每个阶段结束都停一下做口头检查，避免错误滚入下一阶段',
        'PLL 只执行识别到的单公式，避免临场拼接多段公式',
      ],
      resourceLinks: resourcesForArea('Overall'),
      timeToSeeResults: '2-3 天',
    })
  }

  for (const item of scored.slice(0, 3)) {
    if (item.gap <= 0) continue
    if (item.stage === 'cross') {
      recommendations.push({
        priority: priority++,
        title: 'Cross 检查与预判优化',
        area: 'Cross',
        currentStatus: `${item.user} 步（参考 ${item.ref} 步）`,
        targetStatus: `稳定压到 ${item.ref + 1} 步以内`,
        estimatedImprovement: `可节省约 ${item.gap} 步`,
        effort: 'low',
        actionItems: [
          '观察阶段优先规划两条边，减少中途停顿',
          '避免无效 U 调整与同面往返动作',
          '训练“第一条边落位后第二条边不断拍”节奏',
        ],
        resourceLinks: resourcesForArea('Cross'),
        timeToSeeResults: '3-5 天',
      })
    }
    if (item.stage === 'f2l') {
      recommendations.push({
        priority: priority++,
        title: 'F2L 走“转标态 -> 入槽”',
        area: 'F2L',
        currentStatus: `${item.user} 步（参考 ${item.ref} 步）`,
        targetStatus: `先压到 ${item.ref + 3} 步，再追 ${item.ref + 1} 步`,
        estimatedImprovement: `可节省约 ${item.gap} 步（最大瓶颈）`,
        effort: 'high',
        actionItems: [
          '每次先评估四槽“转标态成本”，再决定先做哪个槽',
          '前三槽允许适度 y 转体，减少 B/B\' 硬拧',
          '一旦某槽完成，后续槽位不再破坏已完成槽',
        ],
        resourceLinks: resourcesForArea('F2L'),
        timeToSeeResults: '1-2 周',
      })
    }
    if (item.stage === 'oll') {
      recommendations.push({
        priority: priority++,
        title: 'OLL 识别与执行流畅度',
        area: 'OLL',
        currentStatus: `${item.user} 步（参考 ${item.ref} 步）`,
        targetStatus: `稳定在 ${item.ref + 1} 步以内`,
        estimatedImprovement: `可节省约 ${item.gap} 步`,
        effort: 'medium',
        actionItems: [
          '先锁定模式再出手，减少试错性 U 调整',
          '高频 OLL 单独做 20 次连发训练',
          '用同一套指法保持出手一致性',
        ],
        resourceLinks: resourcesForArea('OLL'),
        timeToSeeResults: '5-7 天',
      })
    }
    if (item.stage === 'pll') {
      recommendations.push({
        priority: priority++,
        title: 'PLL 按形态识别单公式',
        area: 'PLL',
        currentStatus: `${item.user} 步（参考 ${item.ref} 步）`,
        targetStatus: `稳定在 ${item.ref + 1} 步以内`,
        estimatedImprovement: `可节省约 ${item.gap} 步`,
        effort: 'medium',
        actionItems: [
          '先识别是三棱换/四棱换/角棱混换，再执行对应单公式',
          '避免多段 fallback 链式执行',
          '做 AUF + 单 PLL + AUF 的节奏训练',
        ],
        resourceLinks: resourcesForArea('PLL'),
        timeToSeeResults: '4-7 天',
      })
    }
  }

  const totalGap = params.userTotal - params.cfopTotal
  if (totalGap > 0 && recommendations.length < 3) {
    recommendations.push({
      priority: priority,
      title: '总体步数压缩',
      area: 'Overall',
      currentStatus: `${params.userTotal} 步（参考 ${params.cfopTotal} 步）`,
      targetStatus: `先达到 ${params.cfopTotal + 3} 步以内`,
      estimatedImprovement: `可节省约 ${totalGap} 步`,
      effort: 'medium',
      actionItems: [
        '先保证每阶段稳定，再做跨阶段提速',
        '复盘每把中“最长停顿点”并单点修复',
        '每 10 把统计一次阶段步数均值',
      ],
      resourceLinks: resourcesForArea('Overall'),
      timeToSeeResults: '1 周',
    })
  }

  return recommendations.slice(0, 5)
}

function buildWeeklyPlan(recommendations: CoachRecommendation[]) {
  const primary = recommendations[0]
  const secondary = recommendations[1] || recommendations[0]
  return [
    { day: 1, focus: primary?.area || 'F2L', durationMinutes: 30, goal: '先做低速准确率训练，确保阶段不出错' },
    { day: 2, focus: primary?.area || 'F2L', durationMinutes: 30, goal: '固定一套动作流程，减少停顿' },
    { day: 3, focus: secondary?.area || 'Cross', durationMinutes: 25, goal: '补齐第二瓶颈阶段识别与执行' },
    { day: 4, focus: primary?.area || 'F2L', durationMinutes: 30, goal: '做分段计时，压缩阶段步数' },
    { day: 5, focus: 'PLL/OLL', durationMinutes: 20, goal: '形态识别 + 单公式一把过' },
    { day: 6, focus: 'Full Solve', durationMinutes: 35, goal: '整把复盘并记录阶段步数' },
    { day: 7, focus: 'Review', durationMinutes: 20, goal: '对比本周首日，确认步数与稳定性提升' },
  ]
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // 获取IP地址 (Next.js 15+ 使用 headers 获取)
    const headers = req.headers
    const rateKey = getRateLimitKey(headers)

    // 速率限制检查
    if (!checkRateLimit(rateKey)) {
      logger.warn('Rate limit exceeded', { requestId, rateKey })
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    // API 认证检查
    const authResult = checkAuth(headers)
    if (!authResult.valid) {
      logger.warn('Authentication failed', { requestId, rateKey, error: authResult.error })
      return NextResponse.json(
        { error: authResult.error || '认证失败' },
        { status: 401 }
      )
    }

    const { scramble, solution } = await req.json()
    const trimmedScramble = String(scramble || '').trim()
    const trimmedSolution = String(solution || '').trim()
    const cacheKey = `${trimmedScramble}||${trimmedSolution}`

    const cachedResponse = getCachedValue(analyzeResponseCache, cacheKey)
    if (cachedResponse) {
      return NextResponse.json({
        ...(cachedResponse as Record<string, unknown>),
        cached: true,
      })
    }

    // 验证输入存在
    if (!trimmedScramble || !trimmedSolution) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, { requestId, error: 'Missing parameters' })
      return NextResponse.json(
        { error: '缺少必要参数: scramble 和 solution' },
        { status: 400 }
      )
    }

    // 验证输入内容
    const validation = validateInput(trimmedScramble, trimmedSolution)
    if (!validation.valid) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, { requestId, error: validation.error })
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const userStageInfo = analyzeUserStages(trimmedScramble, trimmedSolution)
    if (!userStageInfo.userSolved) {
      logger.api('POST', '/api/cube/analyze', 400, Date.now() - startTime, {
        requestId,
        error: 'user_solution_not_solved',
        totalSteps: userStageInfo.totalSteps,
      })
      return NextResponse.json(
        {
          error: '该解法无法还原到完成状态，请先检查打乱或解法后再分析。',
          code: 'USER_SOLUTION_NOT_SOLVED',
          solvedAt: userStageInfo.solvedAt,
          totalSteps: userStageInfo.totalSteps,
        },
        { status: 400 }
      )
    }

    // 先求解并验证完整 CFOP，再做分阶段对比建议
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

    // 调用分析引擎（增强版）；失败时降级，不中断整条分析链路
    let result: Awaited<ReturnType<typeof analyzeSolutionEnhanced>> & { degraded?: boolean; degradedReason?: string }
    try {
      result = await analyzeSolutionEnhanced({
        scramble: trimmedScramble,
        userSolution: trimmedSolution,
      })
    } catch (analyzeError) {
      const parsed = parseFormula(trimmedSolution)
      const userSteps = parsed.isValid ? parsed.count : trimmedSolution.split(/\s+/).filter(Boolean).length
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
          levelName: '中级',
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
    const stageComparison = cfopVerified ? buildStageComparison(userStageInfo.stages, cfopStageSteps) : []
    const fallbackCoachRecommendations = buildCoachRecommendations({
      userSolved: userStageInfo.userSolved,
      userStages: userStageInfo.stages,
      cfopStages: cfopStageSteps,
      userTotal: userStageInfo.totalSteps,
      cfopTotal: cfop.totalSteps,
    })
    const modelRecommendations: CoachRecommendation[] = Array.isArray(result.prioritizedRecommendations)
      ? result.prioritizedRecommendations.map((rec: any, idx: number) => ({
          priority: Number(rec?.priority || idx + 1),
          title: String(rec?.title || '训练建议'),
          area: String(rec?.area || 'Overall'),
          currentStatus: String(rec?.currentStatus || ''),
          targetStatus: String(rec?.targetStatus || ''),
          estimatedImprovement: String(rec?.estimatedImprovement || ''),
          effort: rec?.effort === 'high' || rec?.effort === 'medium' || rec?.effort === 'low' ? rec.effort : 'medium',
          actionItems: Array.isArray(rec?.actionItems) ? rec.actionItems.map((x: any) => String(x)) : [],
          resourceLinks: Array.isArray(rec?.resourceLinks) && rec.resourceLinks.length > 0
            ? rec.resourceLinks.map((x: any) => ({ title: String(x?.title || '学习资源'), url: String(x?.url || '') })).filter((x: { url: string }) => Boolean(x.url))
            : resourcesForArea(String(rec?.area || 'Overall')),
          timeToSeeResults: String(rec?.timeToSeeResults || '1-2 周'),
        }))
      : []
    const coachRecommendations = cfopVerified
      ? fallbackCoachRecommendations
      : (modelRecommendations.length > 0 ? modelRecommendations : fallbackCoachRecommendations)
    const weeklyPlan = buildWeeklyPlan(coachRecommendations)

    const duration = Date.now() - startTime
    const steps = 'userSteps' in result.summary ? result.summary.userSteps : (result.summary as any).steps
    logger.api('POST', '/api/cube/analyze', 200, duration, { requestId, steps })

    const payload = {
      ...result,
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
      coachPlan: {
        recommendations: coachRecommendations,
        weeklyPlan,
        learningResources: coachRecommendations
          .slice(0, 3)
          .flatMap((r) => r.resourceLinks)
          .filter((v, i, arr) => arr.findIndex((x) => x.url === v.url) === i),
        nextSolveChecklist: [
          '先确认 Cross 目标边位，避免盲转',
          'F2L 每槽先看是否能低成本转标态，再入槽',
          'OLL/PLL 先识别再执行，禁止边做边猜',
          '每把结束记录四阶段步数，持续跟踪瓶颈',
        ],
      },
      policy: {
        compareAfterFullCFOP: cfopVerified,
        note: cfopVerified
          ? 'Stage comparison is generated only after reference CFOP full verification succeeds.'
          : 'Reference CFOP is not verified for this request; stage comparison is skipped.',
      },
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
