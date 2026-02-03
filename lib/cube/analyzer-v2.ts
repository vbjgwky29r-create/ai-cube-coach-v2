/**
 * 增强版解法分析引擎
 *
 * 提供详细的阶段分析、问题诊断、公式推荐
 */

import { parseFormula, type Move } from './parser'
import { solveCube } from './solver'
import { findMatchingFormula, getFormulaById, FormulaCategory } from './formulas'
import { applyScramble, isCubeSolved, createSolvedCube, applyMove } from './cube-state'

// ============================================================
// 类型定义
// ============================================================

/**
 * 阶段分析结果
 */
export interface StageAnalysis {
  stage: 'cross' | 'f2l' | 'oll' | 'pll'
  startStep: number
  endStep: number
  steps: number
  moves: string[]
  efficiency: 'excellent' | 'good' | 'fair' | 'poor'
  problems: string[]
  suggestions: string[]
  usedFormulas: FormulaReference[]
  optimalSteps?: number
}

/**
 * 公式引用
 */
export interface FormulaReference {
  id: string
  name: string
  category: string
  notation: string
  explanation: string
  difficulty: number
  tips?: string
  method: string
}

/**
 * 问题诊断
 */
export interface ProblemDiagnosis {
  type: 'redundant_moves' | 'missed_formula' | 'inefficient_cross' | 'slow_f2l' | 'unknown'
  severity: 'low' | 'medium' | 'high'
  location: { start: number; end: number }
  description: string
  impact: string
  solution: string
  formulaId?: string
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  title: string
  description: string
  original: string
  optimized: string
  savings: number
  reason: string
  formula?: FormulaReference
  priority: 'high' | 'medium' | 'low'
}

/**
 * 学习建议
 */
export interface LearningRecommendation {
  formula: FormulaReference
  reason: string
  priority: number
  practiceTips: string[]
}

/**
 * 完整分析结果
 */
export interface DetailedAnalysisResult {
  // 基本信息
  summary: {
    userSteps: number
    optimalSteps: number
    efficiency: number
    estimatedTime: number
    tps?: number  // Turns Per Second
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }

  // 阶段分析
  stages: StageAnalysis[]

  // 问题诊断
  problems: ProblemDiagnosis[]

  // 优化建议
  optimizations: OptimizationSuggestion[]

  // 学习推荐
  learnings: LearningRecommendation[]

  // 识别的公式
  recognizedFormulas: FormulaReference[]

  // 验证
  validation: {
    isValid: boolean
    isSolved: boolean
    error?: string
  }

  // 最优解
  optimalSolution: string

  // 详细解说（文字版）
  narrative: string[]
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 将 Move 数组转为字符串
 */
function movesToString(moves: Move[]): string {
  return moves.map(m => m.face + m.modifier).join(' ')
}

/**
 * 计算子序列的起始位置
 */
function findSubsequence(main: Move[], sub: Move[]): number {
  if (sub.length === 0) return -1
  if (sub.length > main.length) return -1

  for (let i = 0; i <= main.length - sub.length; i++) {
    let match = true
    for (let j = 0; j < sub.length; j++) {
      if (main[i + j].face !== sub[j].face ||
          main[i + j].modifier !== sub[j].modifier) {
        match = false
        break
      }
    }
    if (match) return i
  }
  return -1
}

/**
 * 检测可抵消的动作
 */
function detectCancellableMoves(moves: Move[]): { start: number; end: number; cancelled: string }[] {
  const cancellations: { start: number; end: number; cancelled: string }[] = []

  for (let i = 0; i < moves.length - 1; i++) {
    const current = moves[i]
    const next = moves[i + 1]

    // 检测同一面的连续动作
    if (current.face === next.face) {
      const mod1 = current.modifier
      const mod2 = next.modifier

      // R + R' = 抵消
      if ((mod1 === '' && mod2 === "'") || (mod1 === "'" && mod2 === '')) {
        cancellations.push({
          start: i,
          end: i + 1,
          cancelled: `${current.face}${mod1} ${next.face}${mod2} → 可以抵消`
        })
      }
      // R + R = R2
      else if (mod1 === '' && mod2 === '') {
        cancellations.push({
          start: i,
          end: i + 1,
          cancelled: `${current.face}${mod1} ${next.face}${mod2} → 可以合并为 ${current.face}2`
        })
      }
      // R2 + R2 = 抵消
      else if (mod1 === '2' && mod2 === '2') {
        cancellations.push({
          start: i,
          end: i + 1,
          cancelled: `${current.face}2 ${next.face}2 → 可以抵消`
        })
      }
    }
  }

  return cancellations
}

/**
 * 检测冗余旋转
 */
function detectRedundantRotations(moves: Move[]): { start: number; rotation: string; replaceable?: string }[] {
  const rotations: { start: number; rotation: string; replaceable?: string }[] = []

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    // 检测 x, y, z 旋转
    if (['x', 'y', 'z'].includes(move.face.toLowerCase())) {
      rotations.push({
        start: i,
        rotation: move.face + move.modifier
      })
    }
  }

  return rotations
}

/**
 * 计算效率评分
 */
function calculateEfficiency(userSteps: number, optimalSteps: number): number {
  if (optimalSteps === 0) return 0
  const ratio = userSteps / optimalSteps

  if (ratio <= 1) return 10
  if (ratio <= 1.1) return 9
  if (ratio <= 1.2) return 8
  if (ratio <= 1.3) return 7
  if (ratio <= 1.5) return 6
  if (ratio <= 1.7) return 5
  if (ratio <= 2.0) return 4
  if (ratio <= 2.5) return 3
  if (ratio <= 3.0) return 2
  return 1
}

/**
 * 估算用时
 */
function estimateTime(moves: number): number {
  return Math.round(moves * 0.35 * 10) / 10
}

/**
 * 判定用户水平
 */
function determineLevel(
  steps: number,
  efficiency: number,
  formulaCount: number
): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const score = efficiency * 10 + Math.min(formulaCount * 2, 30)

  if (steps <= 25 && efficiency >= 9) return 'expert'
  if (steps <= 40 && efficiency >= 7) return 'advanced'
  if (steps <= 60 && efficiency >= 5) return 'intermediate'
  return 'beginner'
}

// ============================================================
// 阶段分析
// ============================================================

/**
 * 分析 Cross 阶段
 * Cross 通常在打乱后的前 8-10 步完成
 */
function analyzeCrossStage(
  userMoves: Move[],
  scramble: string
): StageAnalysis {
  // Cross 通常在前 10 步左右
  const crossEndStep = Math.min(10, Math.floor(userMoves.length * 0.2))
  const crossMoves = userMoves.slice(0, crossEndStep)

  const problems: string[] = []
  const suggestions: string[] = []
  const usedFormulas: FormulaReference[] = []

  // 检查是否有十字公式
  const formulaMatches = findMatchingFormula(crossMoves)
  for (const match of formulaMatches) {
    if (match.category === 'CROSS') {
      usedFormulas.push({
        id: match.id,
        name: match.name,
        category: match.category,
        notation: match.notation,
        explanation: match.explanation,
        difficulty: match.difficulty,
        tips: match.tips,
        method: match.method
      })
    }
  }

  // 检查效率
  const idealCrossSteps = 8
  let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'
  if (crossMoves.length <= idealCrossSteps) efficiency = 'excellent'
  else if (crossMoves.length <= idealCrossSteps + 2) efficiency = 'good'
  else if (crossMoves.length <= idealCrossSteps + 4) efficiency = 'fair'
  else efficiency = 'poor'

  // 生成建议
  if (efficiency === 'poor') {
    problems.push('Cross 步数过多，建议优化十字还原顺序')
    suggestions.push('尝试先观察打乱状态，规划一个更高效的十字还原路径')
  }

  if (usedFormulas.length === 0 && crossMoves.length > 6) {
    suggestions.push('考虑学习一些常见 Cross 公式来提高效率')
  }

  return {
    stage: 'cross',
    startStep: 1,
    endStep: crossEndStep,
    steps: crossMoves.length,
    moves: crossMoves.map(m => m.face + m.modifier),
    efficiency,
    problems,
    suggestions,
    usedFormulas,
    optimalSteps: idealCrossSteps
  }
}

/**
 * 分析 F2L 阶段
 * F2L 通常在 Cross 后的 20-30 步
 */
function analyzeF2LStage(
  userMoves: Move[],
  crossEndStep: number
): StageAnalysis {
  const f2lEndStep = Math.min(crossEndStep + 30, Math.floor(userMoves.length * 0.7))
  const f2lMoves = userMoves.slice(crossEndStep, f2lEndStep)

  const problems: string[] = []
  const suggestions: string[] = []
  const usedFormulas: FormulaReference[] = []

  // 检查 F2L 公式
  const formulaMatches = findMatchingFormula(f2lMoves)
  for (const match of formulaMatches) {
    if (match.category === 'F2L' || match.category === 'VLS') {
      usedFormulas.push({
        id: match.id,
        name: match.name,
        category: match.category,
        notation: match.notation,
        explanation: match.explanation,
        difficulty: match.difficulty,
        tips: match.tips,
        method: match.method
      })
    }
  }

  // 检查效率
  const idealF2LSteps = 28  // 4 组槽位，每组约 7 步
  let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'
  if (f2lMoves.length <= idealF2LSteps) efficiency = 'excellent'
  else if (f2lMoves.length <= idealF2LSteps + 5) efficiency = 'good'
  else if (f2lMoves.length <= idealF2LSteps + 10) efficiency = 'fair'
  else efficiency = 'poor'

  if (efficiency === 'poor') {
    problems.push('F2L 步数偏多，可能存在冗余动作')
    suggestions.push('练习识别角块-棱块配对，减少还原步骤')
  }

  if (usedFormulas.length < 2) {
    suggestions.push('学习更多 F2L 标准公式，减少基础动作拼接')
  }

  return {
    stage: 'f2l',
    startStep: crossEndStep + 1,
    endStep: f2lEndStep,
    steps: f2lMoves.length,
    moves: f2lMoves.map(m => m.face + m.modifier),
    efficiency,
    problems,
    suggestions,
    usedFormulas,
    optimalSteps: idealF2LSteps
  }
}

/**
 * 分析 OLL 阶段
 */
function analyzeOLLStage(
  userMoves: Move[],
  f2lEndStep: number
): StageAnalysis {
  const ollEndStep = Math.min(f2lEndStep + 15, userMoves.length - 5)
  const ollMoves = userMoves.slice(f2lEndStep, ollEndStep)

  const problems: string[] = []
  const suggestions: string[] = []
  const usedFormulas: FormulaReference[] = []

  // 检查 OLL 公式
  const formulaMatches = findMatchingFormula(ollMoves)
  for (const match of formulaMatches) {
    if (match.category === 'OLL' || match.category === 'ZBLL' || match.category === 'COLL') {
      usedFormulas.push({
        id: match.id,
        name: match.name,
        category: match.category,
        notation: match.notation,
        explanation: match.explanation,
        difficulty: match.difficulty,
        tips: match.tips,
        method: match.method
      })
    }
  }

  const idealOLLSteps = 10  // 标准 OLL 公式约 10 步
  let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'

  if (ollMoves.length <= idealOLLSteps) efficiency = 'excellent'
  else if (ollMoves.length <= idealOLLSteps + 3) efficiency = 'good'
  else if (ollMoves.length <= idealOLLSteps + 6) efficiency = 'fair'
  else efficiency = 'poor'

  if (usedFormulas.length === 0) {
    problems.push('未使用 OLL 公式，采用层先法效率较低')
    suggestions.push('学习完整的 57 个 OLL 公式可以大幅提升效率')
  } else if (usedFormulas.length === 1 && ollMoves.length > 15) {
    problems.push('可能使用了两步 OLL（先做十字再做角块朝向）')
    suggestions.push('考虑学习一步 OLL 公式，节省时间')
  }

  return {
    stage: 'oll',
    startStep: f2lEndStep + 1,
    endStep: ollEndStep,
    steps: ollMoves.length,
    moves: ollMoves.map(m => m.face + m.modifier),
    efficiency,
    problems,
    suggestions,
    usedFormulas,
    optimalSteps: idealOLLSteps
  }
}

/**
 * 分析 PLL 阶段
 */
function analyzePLLStage(
  userMoves: Move[],
  ollEndStep: number
): StageAnalysis {
  const pllMoves = userMoves.slice(ollEndStep)

  const problems: string[] = []
  const suggestions: string[] = []
  const usedFormulas: FormulaReference[] = []

  // 检查 PLL 公式
  const formulaMatches = findMatchingFormula(pllMoves)
  for (const match of formulaMatches) {
    if (match.category === 'PLL') {
      usedFormulas.push({
        id: match.id,
        name: match.name,
        category: match.category,
        notation: match.notation,
        explanation: match.explanation,
        difficulty: match.difficulty,
        tips: match.tips,
        method: match.method
      })
    }
  }

  const idealPLLSteps = 12  // 标准 PLL 公式约 12 步
  let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'

  if (pllMoves.length <= idealPLLSteps) efficiency = 'excellent'
  else if (pllMoves.length <= idealPLLSteps + 3) efficiency = 'good'
  else if (pllMoves.length <= idealPLLSteps + 6) efficiency = 'fair'
  else efficiency = 'poor'

  if (usedFormulas.length === 0) {
    problems.push('未使用 PLL 公式，效率较低')
    suggestions.push('学习 21 个 PLL 公式是提高速度的关键')
  } else if (pllMoves.length > 20 && usedFormulas.length === 1) {
    problems.push('PLL 步数过多，可能使用了 T-perm + U-perm 等组合')
    suggestions.push('检查是否有更直接的 PLL 公式可以使用')
  }

  return {
    stage: 'pll',
    startStep: ollEndStep + 1,
    endStep: userMoves.length,
    steps: pllMoves.length,
    moves: pllMoves.map(m => m.face + m.modifier),
    efficiency,
    problems,
    suggestions,
    usedFormulas,
    optimalSteps: idealPLLSteps
  }
}

// ============================================================
// 问题诊断
// ============================================================

/**
 * 诊断解法中的问题
 */
function diagnoseProblems(
  userMoves: Move[],
  stages: StageAnalysis[]
): ProblemDiagnosis[] {
  const problems: ProblemDiagnosis[] = []

  // 1. 检测可抵消的动作
  const cancellations = detectCancellableMoves(userMoves)
  for (const cancel of cancellations) {
    problems.push({
      type: 'redundant_moves',
      severity: 'medium',
      location: { start: cancel.start, end: cancel.end },
      description: `检测到可以抵消的动作: ${cancel.cancelled}`,
      impact: '浪费了 1-2 步',
      solution: '去掉这些冗余动作'
    })
  }

  // 2. 检测冗余旋转
  const rotations = detectRedundantRotations(userMoves)
  if (rotations.length > 3) {
    problems.push({
      type: 'redundant_moves',
      severity: 'low',
      location: { start: 0, end: userMoves.length },
      description: `使用了 ${rotations.length} 次整体旋转 (x/y/z)`,
      impact: '虽然不影响步数统计，但会增加实际用时',
      solution: '练习从不同角度识别公式，减少整体旋转'
    })
  }

  // 3. 检查各阶段效率
  for (const stage of stages) {
    if (stage.efficiency === 'poor') {
      if (stage.stage === 'cross') {
        problems.push({
          type: 'inefficient_cross',
          severity: 'high',
          location: { start: stage.startStep - 1, end: stage.endStep - 1 },
          description: `Cross 阶段使用了 ${stage.steps} 步，超出理想步数 ${stage.optimalSteps || 8}`,
          impact: 'Cross 效率低会影响整体节奏',
          solution: '观察打乱状态，规划更高效的十字还原路径'
        })
      } else if (stage.stage === 'f2l') {
        problems.push({
          type: 'slow_f2l',
          severity: 'medium',
          location: { start: stage.startStep - 1, end: stage.endStep - 1 },
          description: `F2L 阶段使用了 ${stage.steps} 步`,
          impact: 'F2L 占据了大部分解法时间',
          solution: '练习角块-棱块配对识别，学习更多 F2L 公式'
        })
      }
    }
  }

  // 4. 检查是否使用了高级公式
  const hasOLL = stages.some(s => s.stage === 'oll' && s.usedFormulas.length > 0)
  const hasPLL = stages.some(s => s.stage === 'pll' && s.usedFormulas.length > 0)

  if (!hasOLL && !hasPLL) {
    problems.push({
      type: 'missed_formula',
      severity: 'high',
      location: { start: userMoves.length - 20, end: userMoves.length },
      description: '顶层未使用 OLL/PLL 公式',
      impact: '层先法效率远低于 CFOP',
      solution: '学习 CFOP 方法：先学 2-look OLL 和 PLL'
    })
  }

  return problems
}

// ============================================================
// 优化建议生成
// ============================================================

/**
 * 生成优化建议
 */
function generateOptimizations(
  userMoves: Move[],
  optimalSolution: string,
  stages: StageAnalysis[],
  problems: ProblemDiagnosis[]
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []

  // 1. 基于问题诊断生成建议
  for (const problem of problems) {
    if (problem.type === 'redundant_moves') {
      suggestions.push({
        title: '去掉冗余动作',
        description: problem.description,
        original: `第 ${problem.location.start + 1}-${problem.location.end + 1} 步`,
        optimized: '删除这些步',
        savings: problem.location.end - problem.location.start,
        reason: problem.impact,
        priority: 'medium'
      })
    }
  }

  // 2. 基于阶段分析生成建议
  for (const stage of stages) {
    if (stage.efficiency === 'poor' && stage.optimalSteps) {
      const savings = stage.steps - stage.optimalSteps
      suggestions.push({
        title: `${stage.stage.toUpperCase()} 阶段优化`,
        description: stage.problems[0] || '效率偏低',
        original: stage.moves.slice(0, 5).join(' ') + '...',
        optimized: `目标: ${stage.optimalSteps} 步`,
        savings,
        reason: stage.suggestions[0] || '优化公式选择',
        priority: stage.stage === 'cross' ? 'high' : 'medium'
      })
    }
  }

  // 3. 基于最优解对比
  const userStr = movesToString(userMoves).toLowerCase()
  const optimalStr = optimalSolution.toLowerCase()

  if (userStr !== optimalStr) {
    const userParts = userStr.split(' ')
    const optimalParts = optimalStr.split(' ')

    if (optimalParts.length < userParts.length) {
      suggestions.push({
        title: '整体优化',
        description: `最优解比你的解法少 ${userParts.length - optimalParts.length} 步`,
        original: `${userParts.length} 步`,
        optimized: `${optimalParts.length} 步`,
        savings: userParts.length - optimalParts.length,
        reason: '采用更高效的还原路径',
        priority: 'low'
      })
    }
  }

  // 按优先级和节省步数排序
  suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return b.savings - a.savings
  })

  return suggestions.slice(0, 6) // 最多返回 6 条建议
}

// ============================================================
// 学习推荐生成
// ============================================================

/**
 * 生成学习推荐
 */
function generateLearningRecommendations(
  stages: StageAnalysis[],
  problems: ProblemDiagnosis[]
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []
  const recommendedIds = new Set<string>()

  // 1. 基于 OLL/PLL 使用情况推荐
  const ollStage = stages.find(s => s.stage === 'oll')
  const pllStage = stages.find(s => s.stage === 'pll')

  if (ollStage && ollStage.usedFormulas.length === 0) {
    // 推荐 2-look OLL
    recommendations.push({
      formula: {
        id: 'oll_2look_sune',
        name: 'Sune (鱼形公式)',
        category: 'OLL',
        notation: 'R U R\' U R U2 R\'',
        explanation: '最常见的 OLL 公式之一，用于解决顶面只有一个小角朝向不同的情况',
        difficulty: 1,
        tips: '注意 U2 的动作要准确',
        method: 'CFOP'
      },
      reason: '你的解法未使用 OLL 公式，建议从 Sune 开始学习',
      priority: 1,
      practiceTips: [
        '先慢速练习，确保手指位置准确',
        '重复练习直到形成肌肉记忆',
        '尝试闭上眼睛也能完成'
      ]
    })

    recommendations.push({
      formula: {
        id: 'oll_2look_antisune',
        name: 'Anti-Sune',
        category: 'OLL',
        notation: 'R U2 R\' U\' R U\' R\'',
        explanation: 'Sune 的镜像版本，同样非常重要',
        difficulty: 1,
        tips: '与 Sune 对称学习',
        method: 'CFOP'
      },
      reason: '与 Sune 配合使用是 2-look OLL 的基础',
      priority: 2,
      practiceTips: ['与 Sune 一起练习', '注意镜像对称']
    })
  }

  if (pllStage && pllStage.usedFormulas.length === 0) {
    // 推荐 T-Perm
    recommendations.push({
      formula: {
        id: 'pll_t',
        name: 'T-Perm',
        category: 'PLL',
        notation: 'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'',
        explanation: '最常用的 PLL 公式之一，用于交换两个角块和两个棱块',
        difficulty: 3,
        tips: '注意 R2 后面的 U\' 动作',
        method: 'CFOP'
      },
      reason: 'T-Perm 是 PLL 的基础公式，必学内容',
      priority: 3,
      practiceTips: [
        '分段练习：先练 R U R\' U\' R\' F R2',
        '再练后面的部分',
        '最后连贯起来'
      ]
    })
  }

  // 2. 基于 F2L 效率推荐
  const f2lStage = stages.find(s => s.stage === 'f2l')
  if (f2lStage && f2lStage.efficiency === 'poor') {
    recommendations.push({
      formula: {
        id: 'f2l_basic_1',
        name: 'F2L 基础配对 - 情况1',
        category: 'F2L',
        notation: 'U R U\' R\'',
        explanation: '最基本的角块-棱块配对公式',
        difficulty: 1,
        tips: '确保先正确识别配对情况',
        method: 'CFOP'
      },
      reason: '你的 F2L 效率偏低，建议从基础配对开始',
      priority: 4,
      practiceTips: ['学会快速识别配对情况', '练习无预观的还原']
    })
  }

  // 3. 去重
  const uniqueRecommendations = recommendations.filter(r => !recommendedIds.has(r.formula.id))

  return uniqueRecommendations.slice(0, 5)
}

// ============================================================
// 识别使用的公式
// ============================================================

/**
 * 识别用户使用的所有公式
 */
function recognizeAllFormulas(moves: Move[]): FormulaReference[] {
  const recognized: FormulaReference[] = []
  const recognizedIds = new Set<string>()

  // 滑动窗口检测
  const lengths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  for (const len of lengths) {
    if (len > moves.length) break

    for (let start = 0; start <= moves.length - len; start++) {
      const subMoves = moves.slice(start, start + len)
      const matches = findMatchingFormula(subMoves)

      for (const match of matches) {
        if (!recognizedIds.has(match.id)) {
          recognizedIds.add(match.id)
          recognized.push({
            id: match.id,
            name: match.name,
            category: match.category,
            notation: match.notation,
            explanation: match.explanation,
            difficulty: match.difficulty,
            tips: match.tips,
            method: match.method
          })
        }
      }
    }
  }

  return recognized
}

// ============================================================
// 生成详细解说
// ============================================================

/**
 * 生成文字版解说
 */
function generateNarrative(
  stages: StageAnalysis[],
  problems: ProblemDiagnosis[],
  optimizations: OptimizationSuggestion[]
): string[] {
  const narrative: string[] = []

  // 1. 总体评价
  narrative.push('## 解法分析报告')

  const totalSteps = stages.reduce((sum, s) => sum + s.steps, 0)
  const poorStages = stages.filter(s => s.efficiency === 'poor')
  const goodStages = stages.filter(s => s.efficiency === 'excellent' || s.efficiency === 'good')

  if (poorStages.length === 0) {
    narrative.push(`✅ 整体表现优秀！${totalSteps} 步完成还原，各阶段效率都很高。`)
  } else if (poorStages.length === 1) {
    narrative.push(`📊 还原使用了 ${totalSteps} 步。${poorStages[0].stage.toUpperCase()} 阶段有优化空间。`)
  } else {
    narrative.push(`📊 还原使用了 ${totalSteps} 步。多个阶段有改进空间，详见下方分析。`)
  }

  // 2. 阶段点评
  narrative.push('\n## 阶段分析')

  for (const stage of stages) {
    const emoji = stage.efficiency === 'excellent' ? '✅' :
                  stage.efficiency === 'good' ? '👍' :
                  stage.efficiency === 'fair' ? '📊' : '⚠️'

    narrative.push(`${emoji} **${stage.stage.toUpperCase()} 阶段** (${stage.steps} 步)`)

    if (stage.usedFormulas.length > 0) {
      const formulaNames = stage.usedFormulas.map(f => f.name).join(', ')
      narrative.push(`   - 使用公式: ${formulaNames}`)
    }

    if (stage.problems.length > 0) {
      for (const problem of stage.problems) {
        narrative.push(`   - ⚠️ ${problem}`)
      }
    }

    if (stage.suggestions.length > 0) {
      for (const suggestion of stage.suggestions) {
        narrative.push(`   - 💡 ${suggestion}`)
      }
    }
  }

  // 3. 重点问题
  if (problems.length > 0) {
    narrative.push('\n## 重点问题')

    const highSeverity = problems.filter(p => p.severity === 'high').slice(0, 2)
    for (const problem of highSeverity) {
      narrative.push(`⚠️ **${problem.description}**`)
      narrative.push(`   影响: ${problem.impact}`)
      narrative.push(`   解决方案: ${problem.solution}`)
    }
  }

  // 4. 优化建议
  if (optimizations.length > 0) {
    narrative.push('\n## 优化建议')

    for (let i = 0; i < Math.min(3, optimizations.length); i++) {
      const opt = optimizations[i]
      narrative.push(`${i + 1}. ${opt.title}`)
      narrative.push(`   ${opt.description}`)
      if (opt.savings > 0) {
        narrative.push(`   可节省: ${opt.savings} 步`)
      }
    }
  }

  return narrative
}

// ============================================================
// 主分析函数
// ============================================================

/**
 * 详细分析用户解法
 */
export async function analyzeSolutionDetailed(params: {
  scramble: string
  userSolution: string
  userId?: string
  knownFormulas?: string[]
}): Promise<DetailedAnalysisResult> {

  // 1. 解析用户解法
  const parsed = parseFormula(params.userSolution)
  if (!parsed.isValid) {
    return {
      summary: {
        userSteps: 0,
        optimalSteps: 0,
        efficiency: 0,
        estimatedTime: 0,
        level: 'beginner'
      },
      stages: [],
      problems: [{
        type: 'unknown',
        severity: 'high',
        location: { start: 0, end: 0 },
        description: '解法公式格式错误',
        impact: '无法分析',
        solution: '请检查公式格式'
      }],
      optimizations: [],
      learnings: [],
      recognizedFormulas: [],
      validation: {
        isValid: false,
        isSolved: false,
        error: '公式格式错误'
      },
      optimalSolution: '',
      narrative: ['解法公式格式错误，请检查输入']
    }
  }

  const userMoves = parsed.moves
  const userSteps = parsed.count

  // 2. 计算最优解
  const optimalResult = solveCube(params.scramble)
  const optimalSteps = optimalResult.length

  // 3. 计算效率评分
  const efficiency = calculateEfficiency(userSteps, optimalSteps)

  // 4. 识别使用的公式
  const recognizedFormulas = recognizeAllFormulas(userMoves)

  // 5. 阶段分析
  const crossStage = analyzeCrossStage(userMoves, params.scramble)
  const f2lStage = analyzeF2LStage(userMoves, crossStage.endStep)
  const ollStage = analyzeOLLStage(userMoves, f2lStage.endStep)
  const pllStage = analyzePLLStage(userMoves, ollStage.endStep)

  const stages = [crossStage, f2lStage, ollStage, pllStage].filter(s => s.steps > 0)

  // 6. 问题诊断
  const problems = diagnoseProblems(userMoves, stages)

  // 7. 生成优化建议
  const optimizations = generateOptimizations(
    userMoves,
    optimalResult.solution,
    stages,
    problems
  )

  // 8. 生成学习推荐
  const learnings = generateLearningRecommendations(stages, problems)

  // 9. 生成文字解说
  const narrative = generateNarrative(stages, problems, optimizations)

  // 10. 验证解法
  let isSolved = false
  let validationError: string | undefined

  try {
    const scrambledState = applyScramble(params.scramble)
    let testState = scrambledState
    for (const move of userMoves) {
      const moveStr = move.face + move.modifier
      testState = applyMove(testState, moveStr)
    }
    isSolved = isCubeSolved(testState)
  } catch (e) {
    validationError = e instanceof Error ? e.message : '验证失败'
  }

  // 11. 判定用户水平
  const level = determineLevel(userSteps, efficiency, recognizedFormulas.length)

  return {
    summary: {
      userSteps,
      optimalSteps,
      efficiency,
      estimatedTime: estimateTime(userSteps),
      level
    },
    stages,
    problems,
    optimizations,
    learnings,
    recognizedFormulas,
    validation: {
      isValid: parsed.isValid,
      isSolved,
      error: validationError
    },
    optimalSolution: optimalResult.solution,
    narrative
  }
}
