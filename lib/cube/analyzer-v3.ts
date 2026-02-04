/**
 * 增强版解法分析引擎 V3
 *
 * 新增功能：
 * 1. 具体步骤定位分析
 * 2. 优先级建议
 * 3. 时间分解
 * 4. OLL/PLL精确识别
 * 5. F2L槽位详细分析
 * 6. 动作模式检测
 * 7. 与高级玩家对比
 * 8. 手指技巧建议
 */

import { parseFormula, type Move } from './parser'
import { findMatchingFormula, getFormulaById, FormulaCategory } from './formulas'
import { applyScramble, isCubeSolved, applyMove } from './cube-state'

// ============================================================
// 新增类型定义
// ============================================================

/**
 * 步骤优化定位
 */
export interface StepOptimization {
  stepRange: [number, number]       // 第N步到第M步 (1-indexed)
  originalMoves: string             // 原始动作序列
  optimizedMoves: string            // 优化后动作
  savings: number                   // 节省步数
  timeSavings: number               // 节省时间(秒)
  problemType: string               // 问题类型
  reason: string                    // 原因说明
  priority: 'high' | 'medium' | 'low'
}

/**
 * 动作模式检测结果
 */
export interface PatternMatch {
  name: string                      // 模式名称
  range: [number, number]           // 出现位置
  pattern: string                   // 模式内容
  count: number                     // 出现次数
  inefficiency: string              // 低效说明
  alternative?: string              // 替代方案
}

/**
 * F2L槽位分析
 */
export interface SlotAnalysis {
  slotNumber: 1 | 2 | 3 | 4
  steps: number
  efficiency: 'excellent' | 'good' | 'fair' | 'poor'
  usedFormula?: string
  pairingMethod: string
  rotationNeeded: boolean
  observationCount: number          // 观察次数
  suggestion?: string
}

/**
 * 时间分解
 */
export interface TimeBreakdown {
  stage: string
  steps: number
  estimatedTime: number              // 预估秒数
  percentage: number                 // 时间占比
  bottleneck: boolean
}

/**
 * TPS分析
 */
export interface TPSAnalysis {
  userTPS: number
  level: string
  levelName: string
  targetTPS: number
  suggestion: string
}

/**
 * OLL情况识别
 */
export interface OLLRecognition {
  caseNumber: number                 // 1-57
  caseName: string
  pattern: string                    // 顶面图案描述
  edgesOriented: boolean
  cornersOriented: boolean
  userSteps: number
  optimalSteps: number
  recommended?: {
    notation: string
    name: string
    steps: number
  }
}

/**
 * PLL情况识别
 */
export interface PLLRecognition {
  caseNumber: number                 // 1-21
  caseName: string
  pattern: string                    // 排列描述
  permutation: string
  userSteps: number
  optimalSteps: number
  recommended?: {
    notation: string
    name: string
    steps: number
  }
}

/**
 * 与高级玩家对比
 */
export interface ComparisonData {
  stage: string
  userSteps: number
  userTime: number
  advancedSteps: number
  advancedTime: number
  improvementPotential: number       // 提升空间百分比
}

/**
 * 优先级建议
 */
export interface PriorityRecommendation {
  priority: number                   // 1-5
  title: string
  area: string
  currentStatus: string
  targetStatus: string
  estimatedImprovement: string
  effort: 'low' | 'medium' | 'high'
  actionItems: string[]
  timeToSeeResults: string
}

/**
 * 手指技巧建议
 */
export interface FingerprintingTip {
  moveSequence: string
  technique: 'fingertricks' | 'wristturn' | 'doubleturn' | 'rotation'
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  practiceAdvice: string[]
}

/**
 * 增强分析结果
 */
export interface EnhancedAnalysisResult {
  // 保留原有字段
  summary: {
    userSteps: number
    optimalSteps: number
    efficiency: number
    estimatedTime: number
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }

  // 新增字段
  stepOptimizations: StepOptimization[]
  patterns: {
    inefficient: PatternMatch[]
    shortcuts: PatternMatch[]
  }
  f2lSlots?: {
    slots: SlotAnalysis[]
    orderSuggestion?: string
  }
  ollCase?: OLLRecognition
  pllCase?: PLLRecognition
  timeBreakdown: TimeBreakdown[]
  tpsAnalysis: TPSAnalysis
  comparison: ComparisonData[]
  prioritizedRecommendations: PriorityRecommendation[]
  fingerprintTips: FingerprintingTip[]
}

// ============================================================
// 常量定义
// ============================================================

// 高级玩家标准数据
const ADVANCED_METRICS = {
  cross: { steps: 6, time: 2.5 },
  f2l: { steps: 28, time: 7 },
  oll: { steps: 10, time: 3 },
  pll: { steps: 12, time: 3.5 },
}

// TPS标准
const TPS_STANDARDS = {
  beginner: { tps: 2, name: '初学者' },
  intermediate: { tps: 4, name: '中级' },
  advanced: { tps: 6, name: '高级' },
  worldClass: { tps: 10, name: '世界级' },
}

// 常见低效模式
const INEFFICIENT_PATTERNS = [
  {
    name: '重复Sexy Move',
    pattern: 'R U R\' U\'',
    threshold: 2,                   // 连续出现2次以上
    description: '连续使用Sexy Move效率低',
    alternative: '检查是否可以用更短的公式',
  },
  {
    name: '往返动作',
    pattern: 'R L',
    description: 'R和L相对运动可以抵消',
    alternative: '检查是否是必要的动作',
  },
  {
    name: '重复Sledgehammer',
    pattern: 'R\' F R F\'',
    threshold: 2,
    description: '重复Sledgehammer可能不是最优',
    alternative: '考虑使用其他公式',
  },
]

// 手指技巧难度评估
const FINGERTRICK_DIFFICULTY: Record<string, { difficulty: string; tips: string[] }> = {
  'R U R\' U\'': {
    difficulty: 'easy',
    tips: ['食指做U', '无名指/中指做R\'', '最基础的组合'],
  },
  'R\' F R F\'': {
    difficulty: 'medium',
    tips: ['无名指做R\'', '食指做F', '需要练习连贯性'],
  },
  'R U R\' U\' R U2 R\'': {
    difficulty: 'medium',
    tips: ['Sune公式', 'U2用食指快速拨两次', '注意R2后接U\'的时机'],
  },
  'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'': {
    difficulty: 'hard',
    tips: ['T-Perm', '分两段练习', '注意最后的F\'方向'],
  },
  'M2 U M2': {
    difficulty: 'hard',
    tips: ['M用中指和无名指', '需要大量练习', '初学者可用R L\'替代'],
  },
}

// ============================================================
// 1. 步骤定位分析
// ============================================================

/**
 * 检测可优化的步骤序列
 */
function detectStepOptimizations(
  userMoves: Move[],
  stages: any[]
): StepOptimization[] {
  const optimizations: StepOptimization[] = []

  // 1. 检测连续同面动作可合并
  for (let i = 0; i < userMoves.length - 1; i++) {
    const current = userMoves[i]
    const next = userMoves[i + 1]

    if (current.face === next.face) {
      const mod1 = current.modifier
      const mod2 = next.modifier

      if (mod1 === '' && mod2 === '') {
        optimizations.push({
          stepRange: [i + 1, i + 2],
          originalMoves: `${current.face} ${current.face}`,
          optimizedMoves: `${current.face}2`,
          savings: 1,
          timeSavings: 0.35,
          problemType: '可合并动作',
          reason: '连续两个相同面顺时针动作可合并为双转',
          priority: 'low',
        })
      } else if (mod1 === '\'' && mod2 === '\'') {
        optimizations.push({
          stepRange: [i + 1, i + 2],
          originalMoves: `${current.face}' ${current.face}'`,
          optimizedMoves: `${current.face}2`,
          savings: 1,
          timeSavings: 0.35,
          problemType: '可合并动作',
          reason: '连续两个相同面逆时针动作可合并为双转',
          priority: 'low',
        })
      }
    }
  }

  // 2. 检测可抵消的相对动作
  for (let i = 0; i < userMoves.length - 1; i++) {
    const current = userMoves[i]
    const next = userMoves[i + 1]

    if (current.face === next.face) {
      const mod1 = current.modifier
      const mod2 = next.modifier

      if ((mod1 === '' && mod2 === '\'') || (mod1 === '\'' && mod2 === '')) {
        optimizations.push({
          stepRange: [i + 1, i + 2],
          originalMoves: `${current.face}${mod1} ${next.face}${mod2}`,
          optimizedMoves: '(删除)',
          savings: 2,
          timeSavings: 0.7,
          problemType: '冗余动作',
          reason: '相对动作互相抵消，可以删除',
          priority: 'high',
        })
      }
    }

    // 检测R L类型抵消
    if ((current.face === 'R' && next.face === 'L' && current.modifier === next.modifier) ||
        (current.face === 'L' && next.face === 'R' && current.modifier === next.modifier) ||
        (current.face === 'U' && next.face === 'D' && current.modifier === next.modifier) ||
        (current.face === 'D' && next.face === 'U' && current.modifier === next.modifier) ||
        (current.face === 'F' && next.face === 'B' && current.modifier === next.modifier) ||
        (current.face === 'B' && next.face === 'F' && current.modifier === next.modifier)) {
      optimizations.push({
        stepRange: [i + 1, i + 2],
        originalMoves: `${current.face}${current.modifier} ${next.face}${next.modifier}`,
        optimizedMoves: '(删除)',
        savings: 2,
        timeSavings: 0.7,
        problemType: '冗余动作',
        reason: '相对面的同向动作可能可以抵消',
        priority: 'medium',
      })
    }
  }

  // 3. 检测重复的Sexy Move
  const sexyMoves = ['R U R\' U\'', 'R\' U\' R U', 'L\' U\' L U', 'L U L\' U\'',
                    'R U\' R\' U', 'R\' U R U\'', 'L\' U L\' U\'', 'L U\' L U']

  for (const pattern of sexyMoves) {
    const patternMoves = parseFormula(pattern).moves
    let count = 0
    let startPos = -1

    for (let i = 0; i <= userMoves.length - patternMoves.length; i++) {
      let match = true
      for (let j = 0; j < patternMoves.length; j++) {
        const userMove = userMoves[i + j]
        const patternMove = patternMoves[j]
        if (userMove.face !== patternMove.face || userMove.modifier !== patternMove.modifier) {
          match = false
          break
        }
      }
      if (match) {
        count++
        if (startPos === -1) startPos = i
      }
    }

    if (count >= 2) {
      optimizations.push({
        stepRange: [startPos + 1, startPos + patternMoves.length * count],
        originalMoves: `${pattern} × ${count}`,
        optimizedMoves: '检查是否可以用更短公式',
        savings: count * 2,
        timeSavings: count * 0.7,
        problemType: '重复模式',
        reason: `连续${count}次${pattern}，可能存在更优解法`,
        priority: 'medium',
      })
    }
  }

  // 按优先级和节省步数排序
  optimizations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return b.savings - a.savings
  })

  return optimizations.slice(0, 10) // 最多返回10条
}

// ============================================================
// 2. 动作模式检测
// ============================================================

/**
 * 检测低效动作模式
 */
function detectInefficientPatterns(userMoves: Move[]): {
  inefficient: PatternMatch[]
  shortcuts: PatternMatch[]
} {
  const inefficient: PatternMatch[] = []
  const shortcuts: PatternMatch[] = []

  // 检测常见低效模式
  for (const patternDef of INEFFICIENT_PATTERNS) {
    const patternMoves = parseFormula(patternDef.pattern).moves
    if (patternMoves.length === 0) continue

    let count = 0
    const positions: [number, number][] = []

    for (let i = 0; i <= userMoves.length - patternMoves.length; i++) {
      let match = true
      for (let j = 0; j < patternMoves.length; j++) {
        const userMove = userMoves[i + j]
        const patternMove = patternMoves[j]
        if (!userMove || userMove.face !== patternMove.face || userMove.modifier !== patternMove.modifier) {
          match = false
          break
        }
      }
      if (match) {
        count++
        positions.push([i + 1, i + patternMoves.length])
        i += patternMoves.length - 1 // 跳过已匹配的部分
      }
    }

    if (count > 0) {
      inefficient.push({
        name: patternDef.name,
        range: positions[0],
        pattern: patternDef.pattern,
        count,
        inefficiency: patternDef.description,
        alternative: patternDef.alternative,
      })
    }
  }

  return { inefficient, shortcuts }
}

// ============================================================
// 3. 时间分解分析
// ============================================================

/**
 * 分析各阶段时间分解
 */
function analyzeTimeBreakdown(
  stages: any[],
  totalTime: number
): TimeBreakdown[] {
  const breakdown: TimeBreakdown[] = []
  const totalSteps = stages.reduce((sum: number, s: any) => sum + s.steps, 0)

  for (const stage of stages) {
    const stageTime = stage.steps * 0.35  // 假设每步0.35秒
    const percentage = (stageTime / totalTime) * 100
    const isBottleneck = percentage > 40 && stage.efficiency !== 'excellent'

    breakdown.push({
      stage: stage.stage.toUpperCase(),
      steps: stage.steps,
      estimatedTime: Math.round(stageTime * 10) / 10,
      percentage: Math.round(percentage * 10) / 10,
      bottleneck: isBottleneck,
    })
  }

  return breakdown
}

/**
 * 分析TPS
 */
function analyzeTPS(userSteps: number, estimatedTime: number): TPSAnalysis {
  const userTPS = Math.round((userSteps / estimatedTime) * 10) / 10

  let level = 'beginner'
  let levelName = TPS_STANDARDS.beginner.name
  let targetTPS = TPS_STANDARDS.intermediate.tps

  if (userTPS >= TPS_STANDARDS.worldClass.tps) {
    level = 'expert'
    levelName = TPS_STANDARDS.worldClass.name
    targetTPS = TPS_STANDARDS.worldClass.tps
  } else if (userTPS >= TPS_STANDARDS.advanced.tps) {
    level = 'advanced'
    levelName = TPS_STANDARDS.advanced.name
    targetTPS = TPS_STANDARDS.worldClass.tps
  } else if (userTPS >= TPS_STANDARDS.intermediate.tps) {
    level = 'intermediate'
    levelName = TPS_STANDARDS.intermediate.name
    targetTPS = TPS_STANDARDS.advanced.tps
  }

  let suggestion = '继续练习提高连贯性'
  if (userTPS < 2) {
    suggestion = '重点练习公式熟练度，减少思考时间'
  } else if (userTPS < 4) {
    suggestion = '学习手指技巧，提高动作流畅度'
  } else if (userTPS < 6) {
    suggestion = '练习 lookahead，减少停顿'
  }

  return {
    userTPS,
    level,
    levelName,
    targetTPS,
    suggestion,
  }
}

// ============================================================
// 4. F2L槽位分析
// ============================================================

/**
 * 分析F2L槽位
 */
function analyzeF2LSlots(userMoves: Move[], f2lStage: any): {
  slots: SlotAnalysis[]
  orderSuggestion?: string
} {
  // F2L通常4组槽位，每组约7-10步
  // 我们按步数粗略估算槽位分割
  const f2lMoves = userMoves.slice(f2lStage.startStep - 1, f2lStage.endStep)
  const avgStepsPerSlot = f2lMoves.length / 4

  const slots: SlotAnalysis[] = []
  const efficiencies: ('excellent' | 'good' | 'fair' | 'poor')[] = ['excellent', 'good', 'fair', 'poor']

  for (let i = 0; i < 4; i++) {
    const startPos = Math.floor(i * avgStepsPerSlot)
    const endPos = Math.min(Math.floor((i + 1) * avgStepsPerSlot), f2lMoves.length)
    const slotMoves = f2lMoves.slice(startPos, endPos)
    const steps = slotMoves.length

    // 检查是否使用了旋转
    const hasRotation = slotMoves.some(m => ['x', 'y', 'z'].includes(m.face.toLowerCase()))

    // 检查是否使用了公式
    const formulaMatches = findMatchingFormula(slotMoves)
    const f2lFormulas = formulaMatches.filter(f => f.category === 'F2L')

    // 估算效率
    let efficiency: ('excellent' | 'good' | 'fair' | 'poor') = 'fair'
    if (steps <= 7) efficiency = 'excellent'
    else if (steps <= 9) efficiency = 'good'
    else if (steps <= 11) efficiency = 'fair'
    else efficiency = 'poor'

    let suggestion: string | undefined
    if (efficiency === 'poor') {
      suggestion = '步数偏多，考虑学习标准公式'
    } else if (hasRotation) {
      suggestion = '建议练习从背面直接做，减少旋转'
    }

    slots.push({
      slotNumber: (i + 1) as 1 | 2 | 3 | 4,
      steps,
      efficiency,
      usedFormula: f2lFormulas.length > 0 ? f2lFormulas[0].name : undefined,
      pairingMethod: f2lFormulas.length > 0 ? '标准公式' : '基础拼接',
      rotationNeeded: hasRotation,
      observationCount: hasRotation ? 2 : 1,  // 需旋转的需要更多观察
      suggestion,
    })
  }

  // 分析槽位顺序建议
  let orderSuggestion: string | undefined
  const slotsWithRotation = slots.filter(s => s.rotationNeeded)
  if (slotsWithRotation.length > 0 && slotsWithRotation[0].slotNumber !== 4) {
    orderSuggestion = `建议将需要旋转的${slotsWithRotation[0].slotNumber}号槽放到最后做，减少中间旋转`
  }

  return { slots, orderSuggestion }
}

// ============================================================
// 5. OLL/PLL识别
// ============================================================

/**
 * 识别OLL情况（简化版）
 */
function recognizeOLLCase(ollMoves: Move[]): OLLRecognition | undefined {
  if (ollMoves.length === 0) return undefined

  const movesStr = ollMoves.map(m => m.face + m.modifier).join(' ')
  const steps = ollMoves.length

  // 简化识别：根据步数和特征判断
  // 完整实现需要根据魔方状态来识别具体的OLL情况

  // 检查是否匹配已知OLL公式
  const matches = findMatchingFormula(ollMoves).filter(f => f.category === 'OLL')

  if (matches.length > 0) {
    const match = matches[0]
    return {
      caseNumber: parseInt(match.id.replace('oll_', '')) || 0,
      caseName: match.name,
      pattern: match.explanation || match.name,
      edgesOriented: match.name.includes('Cross') || match.name.includes('2-look'),
      cornersOriented: match.name.includes('All') || match.name.includes('Sune'),
      userSteps: steps,
      optimalSteps: match.moves,
      recommended: {
        notation: match.notation,
        name: match.name,
        steps: match.moves,
      },
    }
  }

  // 默认情况
  // 标准 OLL 公式平均 9 步，但用户可能使用 COLL/Winter Variation 等高级技巧
  const standardOLLSteps = 9
  const isAdvancedTechnique = steps < 6 // 少于 6 步可能是 COLL 或跳过了 OLL
  
  return {
    caseNumber: 0,
    caseName: isAdvancedTechnique ? '高级技巧 (可能是COLL/WV)' : '自定义OLL',
    pattern: isAdvancedTechnique ? '使用了高级公式，跳过或合并了标准OLL步骤' : '2-look OLL或层先法',
    edgesOriented: steps < 15,
    cornersOriented: steps < 20,
    userSteps: steps,
    optimalSteps: isAdvancedTechnique ? steps : standardOLLSteps, // 高级技巧时不显示更高的"最优"
    recommended: isAdvancedTechnique ? undefined : {
      notation: 'R U R\' U R U2 R\'', // Sune作为默认推荐
      name: 'Sune (鱼形公式)',
      steps: 7,
    },
  }
}

/**
 * 识别PLL情况（简化版）
 */
function recognizePLLCase(pllMoves: Move[]): PLLRecognition | undefined {
  if (pllMoves.length === 0) return undefined

  const steps = pllMoves.length

  // 检查是否匹配已知PLL公式
  const matches = findMatchingFormula(pllMoves).filter(f => f.category === 'PLL')

  if (matches.length > 0) {
    const match = matches[0]
    return {
      caseNumber: parseInt(match.id.replace('pll_', '')) || 0,
      caseName: match.name,
      pattern: match.explanation || match.name,
      permutation: match.explanation || '角块/棱块排列',
      userSteps: steps,
      optimalSteps: match.moves,
      recommended: {
        notation: match.notation,
        name: match.name,
        steps: match.moves,
      },
    }
  }

  // 默认情况
  // 标准 PLL 公式平均 12 步，但用户可能使用 ZBLL 等高级技巧
  const standardPLLSteps = 12
  const isAdvancedTechnique = steps < 7 // 少于 7 步可能是 ZBLL 或跳过了部分步骤
  
  return {
    caseNumber: 0,
    caseName: isAdvancedTechnique ? '高级技巧 (可能是ZBLL)' : '自定义PLL',
    pattern: isAdvancedTechnique ? '使用了高级公式，跳过或合并了标准PLL步骤' : '可能使用2-look PLL',
    permutation: '未知',
    userSteps: steps,
    optimalSteps: isAdvancedTechnique ? steps : standardPLLSteps, // 高级技巧时不显示更高的"最优"
    recommended: isAdvancedTechnique ? undefined : {
      notation: 'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'', // T-Perm作为默认推荐
      name: 'T-Perm',
      steps: 14,
    },
  }
}

// ============================================================
// 6. 与高级玩家对比
// ============================================================

/**
 * 与高级玩家对比
 */
function compareToAdvanced(
  userMoves: Move[],
  stages: any[]
): ComparisonData[] {
  const comparisons: ComparisonData[] = []

  for (const stage of stages) {
    const stageKey = stage.stage.toLowerCase()
    const advanced = ADVANCED_METRICS[stageKey as keyof typeof ADVANCED_METRICS]

    if (!advanced) continue

    const userSteps = stage.steps
    const userTime = userSteps * 0.35
    const improvementPotential = Math.max(0, Math.round(((userSteps - advanced.steps) / advanced.steps) * 100))

    comparisons.push({
      stage: stage.stage.toUpperCase(),
      userSteps,
      userTime: Math.round(userTime * 10) / 10,
      advancedSteps: advanced.steps,
      advancedTime: advanced.time,
      improvementPotential,
    })
  }

  return comparisons
}

// ============================================================
// 7. 优先级建议生成
// ============================================================

/**
 * 生成优先级建议
 */
function generatePriorityRecommendations(
  optimizations: StepOptimization[],
  timeBreakdown: TimeBreakdown[],
  comparison: ComparisonData[],
  f2lSlots?: { slots: SlotAnalysis[] }
): PriorityRecommendation[] {
  const recommendations: PriorityRecommendation[] = []
  let priority = 1

  // P1: 解决高优先级的冗余动作
  const highPriorityOptimizations = optimizations.filter(o => o.priority === 'high')
  if (highPriorityOptimizations.length > 0) {
    const totalSavings = highPriorityOptimizations.reduce((sum, o) => sum + o.savings, 0)
    const timeSavings = highPriorityOptimizations.reduce((sum, o) => sum + o.timeSavings, 0)

    recommendations.push({
      priority,
      title: '去除冗余动作',
      area: '动作效率',
      currentStatus: `存在${highPriorityOptimizations.length}处冗余`,
      targetStatus: '优化动作序列',
      estimatedImprovement: `-${totalSavings}步 (-${Math.round(timeSavings * 10) / 10}秒)`,
      effort: 'low',
      actionItems: [
        '注意检查连续的相对动作 (如 R R\')',
        '检查相对面的同时动作 (如 R L)',
        '输入前先预想整个动作序列',
      ],
      timeToSeeResults: '立即见效',
    })
    priority++
  }

  // P2: F2L优化（如果有明显提升空间）
  const f2lComparison = comparison.find(c => c.stage === 'F2L')
  if (f2lComparison && f2lComparison.improvementPotential > 20) {
    recommendations.push({
      priority,
      title: '优化F2L效率',
      area: 'F2L',
      currentStatus: `${f2lComparison.userSteps}步`,
      targetStatus: `${f2lComparison.advancedSteps}步`,
      estimatedImprovement: `-${f2lComparison.userSteps - f2lComparison.advancedSteps}步`,
      effort: 'medium',
      actionItems: [
        '学习更多F2L标准公式',
        '练习快速识别配对情况',
        '减少观察次数，提高流畅度',
      ],
      timeToSeeResults: '1-2周',
    })
    priority++
  }

  // P3: 时间瓶颈优化
  const bottleneck = timeBreakdown.find(t => t.bottleneck)
  if (bottleneck) {
    recommendations.push({
      priority,
      title: `优化${bottleneck.stage}阶段`,
      area: '时间瓶颈',
      currentStatus: `占据${bottleneck.percentage}%的时间`,
      targetStatus: '降低到30%以下',
      estimatedImprovement: '减少2-5秒',
      effort: 'medium',
      actionItems: [
        `${bottleneck.stage}是你最大的时间消耗`,
        '学习该阶段的更多公式',
        '提高识别速度，减少观察时间',
      ],
      timeToSeeResults: '2-4周',
    })
    priority++
  }

  // P4: 学习新公式
  const mediumPriorityOpts = optimizations.filter(o => o.priority === 'medium')
  if (mediumPriorityOpts.length >= 2) {
    recommendations.push({
      priority,
      title: '学习更多高级公式',
      area: '公式库',
      currentStatus: '部分使用基础拼接',
      targetStatus: '全面使用CFOP公式',
      estimatedImprovement: '-5-10步',
      effort: 'high',
      actionItems: [
        '本周：学习3个新F2L公式',
        '下周：学习1个新OLL公式',
        '逐步替换基础拼接为公式',
      ],
      timeToSeeResults: '4-8周',
    })
    priority++
  }

  // P5: TPS提升
  recommendations.push({
    priority,
    title: '提高手速',
    area: 'TPS',
    currentStatus: '需要更多练习',
    targetStatus: '提高TPS 1-2档',
    estimatedImprovement: '-3-5秒',
    effort: 'high',
    actionItems: [
      '每天计时练习已学公式',
      '专注动作连贯性，减少停顿',
      '练习lookahead技巧',
    ],
    timeToSeeResults: '持续进行',
  })

  return recommendations
}

// ============================================================
// 8. 手指技巧分析
// ============================================================

/**
 * 分析手指技巧
 */
function analyzeFingerprinting(userMoves: Move[]): FingerprintingTip[] {
  const tips: FingerprintingTip[] = []
  const analyzedSequences = new Set<string>()

  // 检查3-7步的��列
  for (let len = 3; len <= Math.min(7, userMoves.length); len++) {
    for (let i = 0; i <= userMoves.length - len; i++) {
      const sequence = userMoves.slice(i, i + len)
      const sequenceStr = sequence.map(m => m.face + m.modifier).join(' ')

      if (analyzedSequences.has(sequenceStr)) continue
      analyzedSequences.add(sequenceStr)

      // 查找是否有已知的手指技巧说明
      for (const [pattern, info] of Object.entries(FINGERTRICK_DIFFICULTY)) {
        if (sequenceStr.includes(pattern) && sequenceStr.length <= pattern.length + 4) {
          tips.push({
            moveSequence: sequenceStr,
            technique: 'fingertricks',
            description: `包含${pattern}模式`,
            difficulty: info.difficulty as any,
            practiceAdvice: info.tips,
          })
          break
        }
      }
    }
  }

  // 检查特殊动作
  const hasWideMoves = userMoves.some(m => ['r', 'l', 'u', 'd', 'f', 'b'].includes(m.face))
  const hasRotation = userMoves.some(m => ['x', 'y', 'z'].includes(m.face.toLowerCase()))
  const hasDoubleTurns = userMoves.filter(m => m.modifier === '2').length

  if (hasWideMoves) {
    tips.push({
      moveSequence: '宽层动作 (r/l/u/d/f/b)',
      technique: 'fingertricks',
      description: '使用了宽层动作',
      difficulty: 'medium',
      practiceAdvice: [
        '宽层动作需要特殊手指技巧',
        '初学者可以用R L\'等替代',
        '熟练后可以提高效率',
      ],
    })
  }

  if (hasRotation && tips.length < 10) {
    tips.push({
      moveSequence: '整体旋转 (x/y/z)',
      technique: 'rotation',
      description: '使用了整体旋转',
      difficulty: 'easy',
      practiceAdvice: [
        '尽量减少整体旋转',
        '练习从不同角度识别公式',
        '学习背面公式避免旋转',
      ],
    })
  }

  if (hasDoubleTurns > userMoves.length * 0.3 && tips.length < 10) {
    tips.push({
      moveSequence: '双转动作 (R2等)',
      technique: 'doubleturn',
      description: '使用了较多双转动作',
      difficulty: 'medium',
      practiceAdvice: [
        '双转可以用手腕完成',
        '练习用无名指+中指配合',
        '保持手腕放松可以提高速度',
      ],
    })
  }

  return tips.slice(0, 8) // 最多返回8条
}

// ============================================================
// 主分析函数
// ============================================================

/**
 * 增强版解法分析
 */
export async function analyzeSolutionEnhanced(params: {
  scramble: string
  userSolution: string
  userId?: string
}): Promise<EnhancedAnalysisResult> {

  // 1. 解析用户解法
  const parsed = parseFormula(params.userSolution)
  if (!parsed.isValid) {
    throw new Error('解法公式格式错误')
  }

  const userMoves = parsed.moves
  const userSteps = parsed.count

  // 2. 计算最优解（简化版）
  const optimalSteps = Math.max(20, Math.floor(userSteps * 0.8))

  // 3. 计算效率
  const efficiency = userSteps <= optimalSteps ? 10 : Math.max(1, 10 - Math.floor((userSteps - optimalSteps) / 3))
  const estimatedTime = Math.round(userSteps * 0.35 * 10) / 10

  // 4. 判定水平
  let level: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner'
  if (userSteps <= 50 && efficiency >= 8) level = 'advanced'
  else if (userSteps <= 60 && efficiency >= 6) level = 'intermediate'
  else if (userSteps <= 40 && efficiency >= 9) level = 'expert'

  // 5. 步骤优化分析
  const stepOptimizations = detectStepOptimizations(userMoves, [])

  // 6. 模式检测
  const patterns = detectInefficientPatterns(userMoves)

  // 7. 阶段分析（简化版）
  const crossEnd = Math.min(10, Math.floor(userMoves.length * 0.2))
  const f2lEnd = Math.min(crossEnd + 30, Math.floor(userMoves.length * 0.7))
  const ollEnd = userMoves.length - 10

  const stages = [
    { stage: 'cross', startStep: 1, endStep: crossEnd, steps: crossEnd, efficiency: 'good' },
    { stage: 'f2l', startStep: crossEnd + 1, endStep: f2lEnd, steps: f2lEnd - crossEnd, efficiency: 'fair' },
    { stage: 'oll', startStep: f2lEnd + 1, endStep: ollEnd, steps: ollEnd - f2lEnd, efficiency: 'good' },
    { stage: 'pll', startStep: ollEnd + 1, endStep: userMoves.length, steps: userMoves.length - ollEnd, efficiency: 'good' },
  ]

  // 8. F2L槽位分析
  const f2lStage = stages.find(s => s.stage === 'f2l')!
  const f2lAnalysis = analyzeF2LSlots(userMoves, f2lStage)

  // 9. OLL/PLL识别
  const ollStage = stages.find(s => s.stage === 'oll')!
  const pllStage = stages.find(s => s.stage === 'pll')!
  const ollMoves = userMoves.slice(ollStage.startStep - 1, ollStage.endStep)
  const pllMoves = userMoves.slice(pllStage.startStep - 1)

  const ollCase = ollMoves.length > 0 ? recognizeOLLCase(ollMoves) : undefined
  const pllCase = pllMoves.length > 0 ? recognizePLLCase(pllMoves) : undefined

  // 10. 时间分解
  const timeBreakdown = analyzeTimeBreakdown(stages, estimatedTime)
  const tpsAnalysis = analyzeTPS(userSteps, estimatedTime)

  // 11. 与高级玩家对比
  const comparison = compareToAdvanced(userMoves, stages)

  // 12. 优先级建议
  const prioritizedRecommendations = generatePriorityRecommendations(
    stepOptimizations,
    timeBreakdown,
    comparison,
    f2lAnalysis
  )

  // 13. 手指技巧分析
  const fingerprintTips = analyzeFingerprinting(userMoves)

  return {
    summary: {
      userSteps,
      optimalSteps,
      efficiency,
      estimatedTime,
      level,
    },
    stepOptimizations,
    patterns,
    f2lSlots: f2lAnalysis,
    ollCase,
    pllCase,
    timeBreakdown,
    tpsAnalysis,
    comparison,
    prioritizedRecommendations,
    fingerprintTips,
  }
}

// 重新导出原有接口以保持兼容性
export type {
  StageAnalysis,
  OptimizationSuggestion,
  LearningRecommendation,
  ProblemDiagnosis,
  DetailedAnalysisResult,
} from './analyzer-v2'
