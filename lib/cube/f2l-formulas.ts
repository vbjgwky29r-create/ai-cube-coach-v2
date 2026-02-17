/**
 * F2L 公式库
 *
 * 41种标准情况 × 4个槽位 = 164种变体
 *
 * 分类系统：
 * - Case 1-41: 标准F2L情况编号
 * - Slot: FR(右前), FL(左前), BL(左后), BR(右后)
 *
 * 每种情况包含：
 * - 条件：角块和棱块的位置/朝向
 * - 公式：标准解法
 * - 步数：公式长度
 */

import { findCornerById, findEdgeById, createSolvedCube } from './cube-state-v3'

// ============================================================
// F2L 情况定义
// ============================================================

export interface F2LCase {
  id: string              // 如 "F2L_1_FR"
  caseNumber: number     // 1-41
  slot: 'FR' | 'FL' | 'BL' | 'BR'
  name: string           // 情况名称
  condition: F2LCondition
  algorithm: string      // 公式
  steps: number          // 步数
  alternative?: string   // 替代公式
}

export interface F2LCondition {
  // 角块状态
  corner: {
    inSlot: boolean      // 是否在槽位中
    position: string     // 如果不在槽位，在哪（UF/UL/UB/UR/DF等）
    orientation: number   // 0-2
  }
  // 棱块状态
  edge: {
    inSlot: boolean      // 是否在槽位中
    position: string     // 如果不在槽位，在哪
    orientation: number   // 0-1
  }
  // 配对关系
  pair: 'connected' | 'separated' | 'paired'
}

// ============================================================
// F2L 基础情况（最常用的前10种）
// ============================================================

/**
 * 情况1: 角块在U层，棱块在U层，已配对
 * 标准 R U R' U' 公式
 */
export const F2L_CASE_1: F2LCase[] = [
  {
    id: 'F2L_1_FR',
    caseNumber: 1,
    slot: 'FR',
    name: 'Case 1 - Connected in U, Target FR',
    condition: {
      corner: { inSlot: false, position: 'U_layer', orientation: 0 },
      edge: { inSlot: false, position: 'U_layer', orientation: 0 },
      pair: 'connected',
    },
    algorithm: "U R U' R'",
    steps: 3,
    alternative: "U' R' U R",
  },
  {
    id: 'F2L_1_FL',
    caseNumber: 1,
    slot: 'FL',
    name: 'Case 1 - Connected in U, Target FL',
    condition: {
      corner: { inSlot: false, position: 'U_layer', orientation: 0 },
      edge: { inSlot: false, position: 'U_layer', orientation: 0 },
      pair: 'connected',
    },
    algorithm: "U' L' U L",
    steps: 3,
  },
  {
    id: 'F2L_1_BL',
    caseNumber: 1,
    slot: 'BL',
    name: 'Case 1 - Connected in U, Target BL',
    condition: {
      corner: { inSlot: false, position: 'U_layer', orientation: 0 },
      edge: { inSlot: false, position: 'U_layer', orientation: 0 },
      pair: 'connected',
    },
    algorithm: "U B U' B'",
    steps: 3,
  },
  {
    id: 'F2L_1_BR',
    caseNumber: 1,
    slot: 'BR',
    name: 'Case 1 - Connected in U, Target BR',
    condition: {
      corner: { inSlot: false, position: 'U_layer', orientation: 0 },
      edge: { inSlot: false, position: 'U_layer', orientation: 0 },
      pair: 'connected',
    },
    algorithm: "U B' U' B",
    steps: 3,
  },
]

/**
 * 情况2: 角块在槽位，棱块在U层
 * 需要先取出角块
 */
export const F2L_CASE_2: F2LCase[] = [
  {
    id: 'F2L_2_FR',
    caseNumber: 2,
    slot: 'FR',
    name: 'Case 2 - Corner in Slot, Edge in U',
    condition: {
      corner: { inSlot: true, position: 'FR', orientation: 0 },
      edge: { inSlot: false, position: 'U_layer', orientation: 0 },
      pair: 'separated',
    },
    algorithm: "R U R' U'",
    steps: 4,
  },
  // ... 其他槽位的 Case 2
]

/**
 * 情况3: 角块在U层，棱块在槽位
 */
export const F2L_CASE_3: F2LCase[] = [
  {
    id: 'F2L_3_FR',
    caseNumber: 3,
    slot: 'FR',
    name: 'Case 3 - Corner in U, Edge in Slot',
    condition: {
      corner: { inSlot: false, position: 'U_layer', orientation: 0 },
      edge: { inSlot: true, position: 'FR', orientation: 0 },
      pair: 'separated',
    },
    algorithm: "U' R U R' U R U' R'",
    steps: 7,
  },
  // ... 其他槽位的 Case 3
]

// ============================================================
// 通用公式（当无法精确识别时使用）
// ============================================================

export const BASIC_F2L_ALGORITHMS = {
  // R U R' U' 系列（Sexy Move变体）
  sexy_move: "R U R' U'",
  sexy_move_reverse: "U' R' U R",

  // U R U' R' 系列
  sexy_inverted: "U R U' R'",

  // 插入公式
  insert_right_front: "U R U' R'",
  insert_left_front: "U' L' U L",

  // 基础配对
  basic_pair: "R U R' U'",
} as const

// ============================================================
// F2L 公式查询
// ============================================================

export const ALL_F2L_CASES: F2LCase[] = [
  ...F2L_CASE_1,
  // ... 其他情况
]

/**
 * 根据情况编号和槽位获取公式
 */
export function getF2LAlgorithm(caseNumber: number, slot: 'FR' | 'FL' | 'BL' | 'BR'): string {
  const f2lCase = ALL_F2L_CASES.find(
    c => c.caseNumber === caseNumber && c.slot === slot
  )

  if (f2lCase) {
    return f2lCase.algorithm
  }

  // 降级：返回基础公式
  return BASIC_F2L_ALGORITHMS.sexy_move
}

/**
 * 获取槽位的角块和棱块ID
 */
export function getSlotPieces(slot: 'FR' | 'FL' | 'BL' | 'BR'): {
  corner: string
  edge: string
} {
  const slotPieces: Record<string, { corner: string; edge: string }> = {
    FR: { corner: 'DFR', edge: 'FR' },
    FL: { corner: 'DLF', edge: 'FL' },
    BL: { corner: 'DBL', edge: 'BL' },
    BR: { corner: 'DBR', edge: 'BR' },
  }

  return slotPieces[slot]
}

/**
 * 检查F2L槽位是否完成
 */
export function isF2LSlotComplete(state: any, slot: 'FR' | 'FL' | 'BL' | 'BR'): boolean {
  const pieces = getSlotPieces(slot)

  const corner = findCornerById(state, pieces.corner)
  const edge = findEdgeById(state, pieces.edge)

  if (!corner || !edge) return false

  // 检查位置正确且朝向正确
  const solved = createSolvedCube()
  const solvedCorner = solved.corners.find((c: any) => c.id === pieces.corner)
  const solvedEdge = solved.edges.find((e: any) => e.id === pieces.edge)

  if (!solvedCorner || !solvedEdge) return false

  return (
    corner.position.x === solvedCorner.position.x &&
    corner.position.y === solvedCorner.position.y &&
    corner.position.z === solvedCorner.position.z &&
    corner.orientation === 0 &&
    edge.position.x === solvedEdge.position.x &&
    edge.position.y === solvedEdge.position.y &&
    edge.position.z === solvedEdge.position.z &&
    edge.orientation === 0
  )
}
