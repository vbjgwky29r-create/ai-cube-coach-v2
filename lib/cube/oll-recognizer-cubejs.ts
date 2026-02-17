/**
 * OLL 识别器 - 基于 cubejs
 *
 * 通过分析顶层（U面）的色块模式识别OLL情况
 *
 * cubejs asString 格式: U(0-8) R(9-17) F(18-26) D(27-35) L(36-44) B(45-53)
 */

import { ALL_OLL_CASES } from './oll-formulas'
import type { OLLCase } from './oll-formulas'

// ============================================================
// 类型定义
// ============================================================

export interface OLLMatch {
  case: OLLCase
  name: string
  confidence: number  // 0-1
}

export interface UFaceOrientation {
  // U面棱块朝向 (true=朝上/U颜色)
  edges: {
    UF: boolean  // 前棱 (U[7], F[1])
    UL: boolean  // 左棱 (U[3], L[1])
    UB: boolean  // 后棱 (U[1], B[1])
    UR: boolean  // 右棱 (U[5], R[1])
  }
  // U面角块朝向 (0=正确/U颜色, 1/2=扭转)
  corners: {
    URF: number  // 前右角 (U[8], R[2], F[2])
    UFL: number  // 前左角 (U[6], F[0], L[2])
    ULB: number  // 后左角 (U[0], L[0], B[2])
    UBR: number  // 后右角 (U[2], B[0], R[0])
  }
  orientedEdges: number    // 0-4
  orientedCorners: number  // 0-4
}

// ============================================================
// U面分析函数
// ============================================================

/**
 * 分析U面的朝向状态
 */
export function analyzeUFaceOrientationCubeJS(stateStr: string): UFaceOrientation {
  const orientation: UFaceOrientation = {
    edges: { UF: false, UL: false, UB: false, UR: false },
    corners: { URF: 0, UFL: 0, ULB: 0, UBR: 0 },
    orientedEdges: 0,
    orientedCorners: 0,
  }

  // U面索引（cubejs格式）
  // U: 0 1 2
  //    3 4 5
  //    6 7 8

  // 检查棱块朝向
  // UF: U[7] + F[1] - 应该是U + F
  // UL: U[3] + L[1] - 应该是U + L
  // UB: U[1] + B[1] - 应该是U + B
  // UR: U[5] + R[1] - 应该是U + R

  // 检查UF棱 (U[7]应该有U颜色)
  orientation.edges.UF = stateStr[7] === 'U'
  // 检查UL棱 (U[3]应该有U颜色)
  orientation.edges.UL = stateStr[3] === 'U'
  // 检查UB棱 (U[1]应该有U颜色)
  orientation.edges.UB = stateStr[1] === 'U'
  // 检查UR棱 (U[5]应该有U颜色)
  orientation.edges.UR = stateStr[5] === 'U'

  orientation.orientedEdges = Object.values(orientation.edges).filter(v => v).length

  // 检查角块朝向
  // URF角: U[8], R[2], F[2] - 应该是U, R, F
  orientation.corners.URF = stateStr[8] === 'U' ? 0 : (stateStr[11] === 'U' ? 1 : 2)
  orientation.corners.UFL = stateStr[6] === 'U' ? 0 : (stateStr[18] === 'U' ? 1 : 2)
  orientation.corners.ULB = stateStr[0] === 'U' ? 0 : (stateStr[36] === 'U' ? 1 : 2)
  // UBR角: U[2], B[2], R[2] (索引: U[2]=2, B[2]=47, R[2]=11)
  orientation.corners.UBR = stateStr[2] === 'U' ? 0 : (stateStr[11] === 'U' ? 1 : 2)

  orientation.orientedCorners = Object.values(orientation.corners).filter(v => v === 0).length

  return orientation
}

/**
 * 精确识别OLL情况
 */
export function recognizeOLLPreciseCubeJS(stateStr: string): OLLMatch | null {
  // 检查是否已经是OLL完成状态
  const uFace = stateStr.substring(0, 9)
  if (uFace === 'UUUUUUUUU') {
    return { case: { id: 'DONE', name: 'Complete', category: 'done', edges: 4, corners: 4, algorithm: '' }, name: 'Complete', confidence: 1 }
  }

  const orientation = analyzeUFaceOrientationCubeJS(stateStr)

  // 根据棱块和角块模式识别OLL情况
  const orientedEdges = orientation.orientedEdges
  const orientedCorners = orientation.orientedCorners

  // === 分类1: Dot (点) - 0棱0角 ===
  if (orientedEdges === 0 && orientedCorners === 0) {
    return findOLLByPattern('dot')
  }

  // === 分类2: Line (线) - 2棱0角 ===
  if (orientedEdges === 2 && orientedCorners === 0) {
    // 检查是直线还是L形
    // 直线: UF(7)+UB(1) 或 UL(3)+UR(5)
    if ((stateStr[7] === 'U' && stateStr[1] === 'U') ||
        (stateStr[3] === 'U' && stateStr[5] === 'U')) {
      return findOLLByPattern('line')
    }
    // L形
    return findOLLByPattern('l_shape')
  }

  // === 分类3: Cross (十字) - 4棱0角 ===
  if (orientedEdges === 4 && orientedCorners === 0) {
    return findOLLByPattern('cross')
  }

  // === 分类4: 4种情况
  // ... 其他情况需要更复杂的模式匹配

  // 简化策略：根据朝向数量匹配
  return findOLLByCounts(orientedEdges, orientedCorners)
}

function findOLLByPattern(category: string): OLLMatch | null {
  const cases = ALL_OLL_CASES.filter(c => c.category === category)
  if (cases.length > 0) {
    return { case: cases[0], name: cases[0].name, confidence: 0.8 }
  }
  return null
}

function findOLLByCounts(edges: number, corners: number): OLLMatch | null {
  // 首先精确匹配棱块和角块数量
  let candidates = ALL_OLL_CASES.filter(c => c.edges === edges && c.corners === corners)

  // 如果没有精确匹配，尝试匹配棱块数量（忽略角块）
  if (candidates.length === 0) {
    candidates = ALL_OLL_CASES.filter(c => c.edges === edges)
  }

  // 优先选择推荐公式
  const recommended = candidates.filter(c =>
    RECOMMENDED_OLL_IDS.includes(c.id.replace('OLL_', ''))
  )

  if (recommended.length > 0) {
    return { case: recommended[0], name: recommended[0].name, confidence: 0.9 }
  }

  if (candidates.length > 0) {
    return { case: candidates[0], name: candidates[0].name, confidence: 0.7 }
  }

  return null
}

// 推荐的OLL公式ID
const RECOMMENDED_OLL_IDS = ['21', '22', '33', '2', '4', '51', '52', '57']

/**
 * 获取OLL解法（简化版）
 */
export function getOLLAlgorithmCubeJS(stateStr: string): string {
  const match = recognizeOLLPreciseCubeJS(stateStr)
  if (match && match.case.algorithm) {
    return match.case.algorithm
  }

  // 默认使用两步法
  const orientation = analyzeUFaceOrientationCubeJS(stateStr)

  // 步骤1: 十字
  let solution = ''
  if (orientation.orientedEdges < 4) {
    solution = "F R U R' U' F' "
  }

  // 步骤2: 角块
  if (orientation.orientedCorners < 4) {
    solution += "R U R' U R U2 R' "
  }

  return solution.trim()
}
