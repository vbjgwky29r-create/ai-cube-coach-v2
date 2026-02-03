/**
 * AI 解法分析引擎
 *
 * 整合解析器、求解器、公式库
 * 生成完整的分析报告
 */

import { parseFormula, type Move } from './parser'
import { solveCube } from './solver'
import { findMatchingFormula, getFormulaById, FormulaCategory } from './formulas'
import { applyScramble, isCubeSolved, createSolvedCube } from './cube-state'

/**
 * 优化建议
 */
export interface Optimization {
  from: string           // 原始步骤
  to: string             // 优化建议
  reason: string         // 为什么更好
  savings: number        // 节省步数
  formulaId?: string     // 关联的公式ID
}

/**
 * 学习内容
 */
export interface Learning {
  formulaId: string
  formulaName: string
  notation: string
  explanation: string
  category: string
  method: string         // 所属方法 (CFOP, ZZ, Roux, etc.)
  isNew: boolean         // 是否是用户第一次接触
  tips?: string
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  // 基本信息
  summary: {
    steps: number              // 用户步数
    optimalSteps: number       // 最优步数
    optimalSolution: string    // 最优解法
    efficiency: number         // 效率评分 0-10
    estimatedTime: number      // 预估用时(秒)
  }

  // 识别的公式
  formulas: {
    id: string
    name: string
    category: string
    method: string          // 所属方法 (CFOP, ZZ, Roux, etc.)
    difficulty: number
  }[]

  // 优化建议
  optimizations: Optimization[]

  // 学习内容
  learnings: Learning[]

  // 验证结果
  validation: {
    isValid: boolean           // 解法是否有效
    isSolved: boolean          // 是否还原
    error?: string
  }
}

/**
 * 分析用户解法
 */
export async function analyzeSolution(params: {
  scramble: string
  userSolution: string
  userId?: string
  knownFormulas?: string[]     // 用户已知的公式ID列表
}): Promise<AnalysisResult> {

  // 1. 解析用户解法
  const parsed = parseFormula(params.userSolution)

  // 2. 计算最优解
  const optimalResult = solveCube(params.scramble)

  // 3. 计算效率评分
  const userSteps = parsed.count
  const optimalSteps = optimalResult.length
  const efficiency = calculateEfficiency(userSteps, optimalSteps)

  // 4. 识别用户使用的公式
  const recognizedFormulas = recognizeFormulas(parsed.moves)

  // 5. 生成优化建议
  const optimizations = generateOptimizations(
    parsed.moves,
    optimalResult.solution,
    recognizedFormulas
  )

  // 6. 提取学习内容
  const knownSet = new Set(params.knownFormulas || [])
  const learnings: Learning[] = []
  for (const opt of optimizations) {
    if (!opt.formulaId || knownSet.has(opt.formulaId)) continue
    const formula = getFormulaById(opt.formulaId)
    if (!formula) continue

    learnings.push({
      formulaId: formula.id,
      formulaName: formula.name,
      notation: formula.notation,
      explanation: formula.explanation,
      category: formula.category,
      method: formula.method,          // 添加方法信息
      isNew: true,
      tips: formula.tips,
    })
  }

  // 7. 预估用时
  const estimatedTime = estimateTime(parsed.count)

  // 8. 验证用户解法是否正确还原魔方
  // 从还原状态开始，应用打乱，再应用用户解法，检查是否还原
  let isUserSolutionCorrect = false
  let validationError: string | undefined

  if (parsed.isValid) {
    try {
      // 应用打乱到还原的魔方
      const scrambledState = applyScramble(params.scramble)
      // 应用用户解法
      const { applyMove } = require('./cube-state')
      let testState = scrambledState
      for (const move of parsed.moves) {
        const moveStr = move.face + move.modifier
        testState = applyMove(testState, moveStr)
      }
      isUserSolutionCorrect = isCubeSolved(testState)
    } catch (e) {
      validationError = e instanceof Error ? e.message : '验证失败'
    }
  }

  return {
    summary: {
      steps: parsed.count,
      optimalSteps: optimalResult.length,
      optimalSolution: optimalResult.solution,
      efficiency,
      estimatedTime,
    },
    formulas: recognizedFormulas,
    optimizations,
    learnings,
    validation: {
      isValid: parsed.isValid,
      isSolved: isUserSolutionCorrect,
      error: validationError,
    },
  }
}

/**
 * 识别用户使用的公式
 * 优化版本：直接使用 Move 数组，避免重复解析
 */
function recognizeFormulas(moves: Move[]): Array<{
  id: string
  name: string
  category: string
  method: string          // 所属方法
  difficulty: number
}> {
  const recognized: Array<{
    id: string
    name: string
    category: string
    method: string
    difficulty: number
  }> = []

  const recognizedIds = new Set<string>()

  // 优化：使用滑动窗口直接在 Move 数组上操作
  // 限制最大检查数量，避免长公式性能问题
  const maxChecks = Math.min(moves.length * 7, 200) // 最多检查200个子序列
  let checks = 0

  // 常见公式长度范围
  const commonLengths = [3, 4, 5, 6, 7, 8]

  for (const len of commonLengths) {
    if (len > moves.length) break

    for (let start = 0; start <= moves.length - len; start++) {
      if (checks >= maxChecks) break

      // 直接使用 Move 数组的切片，无需重新解析
      const subMoves = moves.slice(start, start + len)

      // 匹配公式
      const matches = findMatchingFormula(subMoves)

      for (const match of matches) {
        if (!recognizedIds.has(match.id)) {
          recognizedIds.add(match.id)
          recognized.push({
            id: match.id,
            name: match.name,
            category: match.category,
            method: match.method,
            difficulty: match.difficulty,
          })
        }
      }

      checks++
    }

    if (checks >= maxChecks) break
  }

  return recognized
}

/**
 * 生成优化建议
 */
function generateOptimizations(
  userMoves: Move[],
  optimalSolution: string,
  recognizedFormulas: Array<{ id: string; name: string; difficulty?: number }>
): Optimization[] {
  const optimizations: Optimization[] = []

  const userStr = movesToString(userMoves).toLowerCase()
  const optimalStr = optimalSolution.toLowerCase()

  // 简单策略：寻找可以替换的片段
  // 这是一个基础实现，实际可以用更复杂的算法

  // 策略1: 检查是否有重复的 Sexy Move 可以合并
  const sexyMoveCount = (userStr.match(/r u r' u'/gi) || []).length
  if (sexyMoveCount > 0) {
    optimizations.push({
      from: 'R U R\' U\' (多次)',
      to: '考虑使用更直接的公式',
      reason: '重复的基础动作可以优化为更高效的公式',
      savings: sexyMoveCount,
    })
  }

  // 策略2: 对比最优解，找出不同的部分
  if (optimalStr && userStr !== optimalStr) {
    const userParts = userStr.split(' ')
    const optimalParts = optimalStr.split(' ')

    if (optimalParts.length < userParts.length) {
      optimizations.push({
        from: userParts.slice(0, 5).join(' ') + '...',
        to: optimalParts.slice(0, 5).join(' ') + '...',
        reason: `最优解只需要${optimalParts.length}步，而你用了${userParts.length}步`,
        savings: userParts.length - optimalParts.length,
      })
    }
  }

  // 策略3: 根据识别的公式给出建议
  for (const formula of recognizedFormulas) {
    if (formula.difficulty && formula.difficulty >= 3) {
      optimizations.push({
        from: '多步基础动作',
        to: formula.name,
        reason: `可以用${formula.name}公式一步完成`,
        savings: 2,
        formulaId: formula.id,
      })
    }
  }

  return optimizations.slice(0, 5) // 最多返回5条建议
}

/**
 * 计算效率评分 (0-10分)
 */
function calculateEfficiency(userSteps: number, optimalSteps: number): number {
  if (optimalSteps === 0) return 0
  const ratio = userSteps / optimalSteps

  if (ratio <= 1) return 10          // 等于或优于��优
  if (ratio <= 1.1) return 9         // 10%以内
  if (ratio <= 1.2) return 8         // 20%以内
  if (ratio <= 1.3) return 7
  if (ratio <= 1.5) return 6
  if (ratio <= 1.7) return 5
  if (ratio <= 2.0) return 4
  if (ratio <= 2.5) return 3
  if (ratio <= 3.0) return 2
  return 1                          // 超过3倍
}

/**
 * 估算解法用时
 */
function estimateTime(moves: number): number {
  // 假设每步0.5秒（新手）到0.2秒（高手）
  // 这里取平均值0.35秒
  return Math.round(moves * 0.35 * 10) / 10
}

/**
 * 将动作数组转为字符串
 */
function movesToString(moves: Move[]): string {
  return moves.map(m => m.face + m.modifier).join(' ')
}

/**
 * 生成每日练习建议
 */
export interface DailyPractice {
  formulaId: string
  formulaName: string
  notation: string
  reason: string
  targetCount: number    // 建议练习次数
}

export function generateDailyPractice(params: {
  userId?: string
  weakCategories?: FormulaCategory[]
  recentAnalyses?: number
}): DailyPractice[] {
  const practices: DailyPractice[] = []

  // 基于薄弱环节推荐
  if (params.weakCategories && params.weakCategories.length > 0) {
    // 这里可以从数据库中获取用户最需要练习的公式
    // 简化版本：返回基础练习
    practices.push({
      formulaId: 'pract_sune',
      formulaName: 'Sune (鱼形)',
      notation: 'R U R\' U R U2 R\'',
      reason: '这是最常用的OLL公式之一',
      targetCount: 10,
    })
  }

  return practices.slice(0, 3) // 最多3个练习
}

/**
 * 计算用户的魔方水平
 */
export function calculateUserLevel(params: {
  avgSteps: number           // 平均步数
  avgTime: number           // 平均用时
  knownFormulas: number     // 已掌握公式数
}): {
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  progress: number          // 0-100
  nextGoal: string
} {
  let score = 0

  // 步数评分 (30分)
  if (params.avgSteps <= 60) score += 30
  else if (params.avgSteps <= 70) score += 20
  else if (params.avgSteps <= 80) score += 10

  // 用时评分 (30分)
  if (params.avgTime <= 30) score += 30
  else if (params.avgTime <= 45) score += 20
  else if (params.avgTime <= 60) score += 10

  // 公式数量评分 (40分)
  if (params.knownFormulas >= 50) score += 40
  else if (params.knownFormulas >= 20) score += 25
  else if (params.knownFormulas >= 10) score += 15
  else if (params.knownFormulas >= 5) score += 5

  // 判定等级
  let level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  let nextGoal: string

  if (score >= 80) {
    level = 'ADVANCED'
    nextGoal = '继续优化细节，冲击20秒以内'
  } else if (score >= 40) {
    level = 'INTERMEDIATE'
    nextGoal = '学习完整OLL和PLL，减少步数'
  } else {
    level = 'BEGINNER'
    nextGoal = '先熟练掌握CFOP的基础公式'
  }

  return {
    level,
    progress: Math.min(100, score),
    nextGoal,
  }
}

/**
 * 获取方法的友好名称（中文）
 */
function getMethodDisplayName(method: string): string {
  const methodNames: Record<string, string> = {
    'CFOP': 'CFOP方法',
    'CFOP-Roux': 'CFOP-Roux混合',
    'ZZ': 'ZZ方法',
    'Roux': 'Roux方法',
    'Petrus': 'Petrus方法',
  }
  return methodNames[method] || method
}

/**
 * 获取分类的友好名称（中文）
 */
function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'PLL': 'PLL (顶层排列)',
    'OLL': 'OLL (顶层朝向)',
    'COLL': 'COLL (顶层角块)',
    'ZBLL': 'ZBLL (一步顶层)',
    'VLS': 'VLS (最后槽)',
    'F2L': 'F2L (前两层)',
    'CROSS': '底层十字',
  }
  return categoryNames[category] || category
}

/**
 * 生成用户友好的公式描述
 * 例如: "你使用了CFOP方法中的T-Perm公式"
 */
export function describeFormula(formula: {
  name: string
  category: string
  method: string
}): string {
  const methodDisplay = getMethodDisplayName(formula.method)
  return `你使用了${methodDisplay}中的${formula.name}公式`
}

/**
 * 生成学习建议的描述
 * 例如: "建议学习CFOP方法中的OLL 21 - Cross (十字)公式"
 */
export function describeLearning(learning: {
  formulaName: string
  category: string
  method: string
}): string {
  const categoryDisplay = getCategoryDisplayName(learning.category)
  const methodDisplay = getMethodDisplayName(learning.method)
  return `建议学习${methodDisplay}中的${learning.formulaName}公式 (${categoryDisplay})`
}

/**
 * 生成公式识别的结果描述
 */
export function describeRecognizedFormulas(formulas: Array<{
  name: string
  category: string
  method: string
}>): string[] {
  if (formulas.length === 0) {
    return ['未识别到已知的高级公式']
  }

  // 按方法分组
  const byMethod = new Map<string, string[]>()
  for (const f of formulas) {
    const method = getMethodDisplayName(f.method)
    if (!byMethod.has(method)) byMethod.set(method, [])
    byMethod.get(method)!.push(f.name)
  }

  const descriptions: string[] = []
  for (const [method, formulaNames] of byMethod) {
    descriptions.push(`使用了${method}中的: ${formulaNames.slice(0, 3).join(', ')}${formulaNames.length > 3 ? ' 等' + formulaNames.length + '个公式' : ''}`)
  }

  return descriptions
}
