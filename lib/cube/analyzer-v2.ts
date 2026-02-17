/**
 * 分析器类型定义 (兼容层)
 *
 * 为 analyzer-v3.ts 提供类型兼容性
 */

import type { FormulaCategory } from './formulas'

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
    tps?: number
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
  optimalSolution?: {
    moves: string[]
    steps: number
    explanation: string
  }
}

/**
 * 分析解法 (占位函数)
 * 实际实现在 analyzer-v3.ts 中
 */
export async function analyzeSolution(_params: {
  scramble: string
  userSolution: string
}): Promise<DetailedAnalysisResult> {
  throw new Error('请使用 analyzer-v3.ts 中的 analyzeSolutionEnhanced 函数')
}

/**
 * 详细分析 (占位函数)
 * 实际实现在 analyzer-v3.ts 中
 */
export async function analyzeSolutionDetailed(_params: {
  scramble: string
  userSolution: string
}): Promise<DetailedAnalysisResult> {
  throw new Error('请使用 analyzer-v3.ts 中的 analyzeSolutionEnhanced 函数')
}
