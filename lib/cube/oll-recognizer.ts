/**
 * 精确 OLL 识别器
 *
 * 通过分析顶层（U面）的色块模式精确识别57种OLL情况
 *
 * 识别方法：
 * 1. 统计顶层棱块朝向正确数量
 * 2. 统计顶层角块朝向正确数量
 * 3. 分析色块的空间排列模式
 * 4. 根据模式匹配对应的OLL公式
 */

import {
  findCornerById,
  findEdgeById,
  type CubeState,
} from './cube-state-v3'

import { ALL_OLL_CASES } from './oll-formulas'
import type { OLLCase } from './oll-formulas'

// ============================================================
// OLL 状态分析
// ============================================================

/**
 * 顶层面块朝向状态
 */
export interface UFaceOrientation {
  // U面棱块位置及其朝向 (true=正确朝向, false=错误朝向)
  edges: {
    UF: boolean      // 前棱
    UL: boolean      // 左棱
    UB: boolean      // 后棱
    UR: boolean      // 右棱
  }
  // U面角块朝向 (0=正确, 1/2=扭转)
  corners: {
    URF: number      // 前右角 (0-2)
    UFL: number      // 前左角
    ULB: number      // 后左角
    UBR: number      // 后右角
  }
  // 统计
  orientedEdges: number    // 0-4
  orientedCorners: number  // 0-4
}

/**
 * 分析U面的朝向状态
 */
export function analyzeUFaceOrientation(state: CubeState): UFaceOrientation {
  const uEdges = ['UF', 'UL', 'UB', 'UR'] as const
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR'] as const

  const orientation: UFaceOrientation = {
    edges: { UF: false, UL: false, UB: false, UR: false },
    corners: { URF: 0, UFL: 0, ULB: 0, UBR: 0 },
    orientedEdges: 0,
    orientedCorners: 0,
  }

  // 分析棱块
  for (const edgeId of uEdges) {
    const edge = findEdgeById(state, edgeId)
    if (!edge) continue

    // 检查棱块是否在U层且朝向正确
    // 朝向正确：edge在U层且orientation=0
    const inULayer = edge.position.y === 1
    const correctlyOriented = inULayer && edge.orientation === 0

    orientation.edges[edgeId] = correctlyOriented
    if (correctlyOriented) orientation.orientedEdges++
  }

  // 分析角块
  for (const cornerId of uCorners) {
    const corner = findCornerById(state, cornerId)
    if (!corner) continue

    const inULayer = corner.position.y === 1
    const correctlyOriented = inULayer && corner.orientation === 0

    orientation.corners[cornerId] = corner.orientation
    if (correctlyOriented) orientation.orientedCorners++
  }

  return orientation
}

// ============================================================
// OLL 模式识别
// ============================================================

/**
 * OLL 识别结果
 */
export interface OLLMatch {
  case: OLLCase
  confidence: number
  reason: string
}

/**
 * 精确识别 OLL 情况
 *
 * 流程：
 * 1. 分析U面朝向状态
 * 2. 根据朝向数量和模式匹配OLL情况
 * 3. 返回最佳匹配
 */
export function recognizeOLLPrecise(state: CubeState): OLLMatch | null {
  const orientation = analyzeUFaceOrientation(state)

  // 过滤候选：朝向数量匹配
  const candidates = ALL_OLL_CASES.filter(oll =>
    oll.edges === orientation.orientedEdges &&
    oll.corners === orientation.orientedCorners
  )

  if (candidates.length === 0) {
    // 没有精确匹配，尝试模糊匹配
    return fuzzyMatchOLL(orientation)
  }

  if (candidates.length === 1) {
    return {
      case: candidates[0],
      confidence: 1.0,
      reason: '精确匹配',
    }
  }

  // 多个候选：进一步分析空间模式
  const best = resolveBySpatialPattern(orientation, candidates)
  return best
}

/**
 * 模糊匹配 OLL（当没有精确匹配时）
 */
function fuzzyMatchOLL(orientation: UFaceOrientation): OLLMatch | null {
  const { orientedEdges, orientedCorners } = orientation

  // 按接近程度排序
  const candidates = ALL_OLL_CASES.map(oll => {
    const edgeDiff = Math.abs(oll.edges - orientedEdges)
    const cornerDiff = Math.abs(oll.corners - orientedCorners)
    const totalDiff = edgeDiff + cornerDiff
    return { oll, diff: totalDiff }
  }).sort((a, b) => a.diff - b.diff)

  const best = candidates[0]
  const confidence = best.diff === 0 ? 1.0 : Math.max(0, 1 - best.diff * 0.1)

  return {
    case: best.oll,
    confidence,
    reason: `模糊匹配 (差异${best.diff})`,
  }
}

/**
 * 通过空间模式解决多个候选
 */
function resolveBySpatialPattern(
  orientation: UFaceOrientation,
  candidates: OLLCase[]
): OLLMatch {
  // 分析朝向正确的块的空间排列
  const pattern = describeSpatialPattern(orientation)

  // 根据模式优先级排序
  const sorted = candidates.sort((a, b) => {
    // 优先选择匹配 pattern 描述的
    const aMatch = matchesCategory(a.category, pattern)
    const bMatch = matchesCategory(b.category, pattern)
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })

  return {
    case: sorted[0],
    confidence: 0.8,
    reason: `空间模式匹配: ${pattern}`,
  }
}

/**
 * 描述空间模式
 */
function describeSpatialPattern(orientation: UFaceOrientation): string {
  const { edges, corners } = orientation

  // 检查线形模式
  const topEdges = edges.UF && edges.UB
  const leftEdges = edges.UL && edges.UR
  if (topEdges && !leftEdges) return 'horizontal_line'
  if (leftEdges && !topEdges) return 'vertical_line'

  // 检查 L 形
  if (edges.UF && edges.UL) return 'L_top_left'
  if (edges.UF && edges.UR) return 'L_top_right'
  if (edges.UB && edges.UL) return 'L_top_left_flipped'
  if (edges.UB && edges.UR) return 'L_top_right_flipped'

  // 检查点（全空）
  if (orientation.orientedEdges === 0 && orientation.orientedCorners === 0) {
    return 'dot'
  }

  // 检查十字
  if (orientation.orientedEdges === 4) {
    return 'cross'
  }

  return 'unknown'
}

/**
 * 检查分类是否匹配模式
 */
function matchesCategory(category: string, pattern: string): boolean {
  const patterns: Record<string, string[]> = {
    dot: ['dot'],
    line: ['line'],
    l_shape: ['l_shape'],
    sune: ['sune', 'anti_sune'],
    t_shape: ['t_shape'],
    h_shape: ['h_shape'],
    pi: ['pi'],
    square: ['square'],
    arrow: ['arrow'],
  }

  if (pattern === 'dot') return category === 'dot'
  if (pattern.includes('line')) return category === 'line'
  if (pattern.includes('L')) return category === 'l_shape'
  if (pattern === 'cross') return category === 'square' // 4个棱通常是square类

  return false
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 获取OLL解法的推荐执行公式
 */
export function getOLLAlgorithm(state: CubeState): string {
  const match = recognizeOLLPrecise(state)
  if (!match) {
    // 降级：返回Sune
    return "R U R' U R U2 R'"
  }
  return match.case.algorithm
}

/**
 * 获取OLL情况的详细信息
 */
export function getOLLInfo(state: CubeState): {
  caseId: string
  name: string
  algorithm: string
  confidence: number
} | null {
  const match = recognizeOLLPrecise(state)
  if (!match) return null

  return {
    caseId: match.case.id,
    name: match.case.name,
    algorithm: match.case.algorithm,
    confidence: match.confidence,
  }
}
