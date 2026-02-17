/**
 * F2L 状态识别器 v2
 *
 * 通过分析魔方状态识别F2L情况并应用对应公式
 *
 * F2L = First Two Layers（前两层）
 * 目标：同时还原4个角块和4个中层棱块
 */

import {
  createSolvedCube,
  findCornerById,
  findEdgeById,
  findCornerAt,
  findEdgeAt,
  applyMoves,
  type CubeState,
} from './cube-state-v3'

import { getSlotPieces, isF2LSlotComplete as _isF2LSlotComplete } from './f2l-formulas'
import {
  findF2LCase,
  getF2LAlgorithmByCondition,
  type F2LCaseCondition,
} from './f2l-cases'

// Re-export for use in other modules
export const isF2LSlotComplete = _isF2LSlotComplete

// ============================================================
// F2L 块位置追踪
// ============================================================

/**
 * U层的4个角块位置
 */
const U_LAYER_CORNERS = ['URF', 'UFL', 'ULB', 'UBR'] as const

/**
 * U层的4个棱块位置
 */
const U_LAYER_EDGES = ['UF', 'UL', 'UB', 'UR'] as const

/**
 * 中层棱块（不在U层或D层）
 */
const MIDDLE_EDGES = ['FR', 'FL', 'BL', 'BR'] as const

// ============================================================
// F2L 块查找
// ============================================================

/**
 * 找到目标槽位的角块
 */
export function findTargetCorner(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): { corner: any; inSlot: boolean; position: string; orientation: number } | null {
  const pieces = getSlotPieces(slot)
  const corner = findCornerById(state, pieces.corner)

  if (!corner) return null

  // 检查是否在目标槽位
  const solved = createSolvedCube()
  const solvedCorner = solved.corners.find((c: any) => c.id === pieces.corner)!

  const inSlot =
    corner.position.x === solvedCorner.position.x &&
    corner.position.y === solvedCorner.position.y &&
    corner.position.z === solvedCorner.position.z

  // 确定位置名称
  let position = 'unknown'
  let inULayer = corner.position.y === 1

  if (!inSlot) {
    if (inULayer) {
      // 角块在U层，确定具体位置
      for (const uc of U_LAYER_CORNERS) {
        const sc = solved.corners.find((c: any) => c.id === uc)!
        if (corner.position.x === sc.position.x &&
            corner.position.y === sc.position.y &&
            corner.position.z === sc.position.z) {
          position = uc
          break
        }
      }
    } else {
      position = 'other_layer'
    }
  } else {
    position = slot
  }

  return { corner, inSlot, position, orientation: corner.orientation }
}

/**
 * 找到目标槽位的棱块
 */
export function findTargetEdge(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): { edge: any; inSlot: boolean; position: string; orientation: number; inULayer: boolean } | null {
  const pieces = getSlotPieces(slot)
  const edge = findEdgeById(state, pieces.edge)

  if (!edge) return null

  const solved = createSolvedCube()
  const solvedEdge = solved.edges.find((e: any) => e.id === pieces.edge)!

  const inSlot =
    edge.position.x === solvedEdge.position.x &&
    edge.position.y === solvedEdge.position.y &&
    edge.position.z === solvedEdge.position.z

  let position = 'unknown'
  let inULayer = edge.position.y === 1

  if (!inSlot) {
    if (inULayer) {
      // 棱块在U层
      for (const ue of U_LAYER_EDGES) {
        const se = solved.edges.find((e: any) => e.id === ue)!
        if (edge.position.x === se.position.x &&
            edge.position.y === se.position.y &&
            edge.position.z === se.position.z) {
          position = ue
          break
        }
      }
    } else if (edge.position.y === 0) {
      // 棱块在中层
      for (const me of MIDDLE_EDGES) {
        const se = solved.edges.find((e: any) => e.id === me)!
        if (edge.position.x === se.position.x &&
            edge.position.y === se.position.y &&
            edge.position.z === se.position.z) {
          position = me
          break
        }
      }
    }
  } else {
    position = slot
  }

  return { edge, inSlot, position, orientation: edge.orientation, inULayer }
}

// ============================================================
// F2L 情况识别
// ============================================================

export interface F2LSituation {
  slot: 'FR' | 'FL' | 'BL' | 'BR'
  corner: {
    id: string           // 块ID
    location: string     // 位置: 'slot', 'U_layer', 'other'
    orientation: number  // 0-2
    inULayer: boolean
  }
  edge: {
    id: string
    location: string
    orientation: number  // 0-1
    inULayer: boolean
  }
  caseType?: string       // F2L情况类型
}

/**
 * 分析指定槽位的F2L情况
 */
export function analyzeF2LSituation(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): F2LSituation {
  const cornerInfo = findTargetCorner(state, slot)
  const edgeInfo = findTargetEdge(state, slot)

  if (!cornerInfo || !edgeInfo) {
    // 槽位已完成的特殊情况
    const isComplete = isF2LSlotComplete(state, slot)
    if (isComplete) {
      return {
        slot,
        corner: { id: '', location: 'slot', orientation: 0, inULayer: false },
        edge: { id: '', location: 'slot', orientation: 0, inULayer: false },
        caseType: 'complete',
      }
    }
    // 如果找不到块，返回未知状态
    return {
      slot,
      corner: { id: '', location: 'unknown', orientation: 0, inULayer: false },
      edge: { id: '', location: 'unknown', orientation: 0, inULayer: false },
      caseType: 'unknown',
    }
  }

  const corner = {
    id: cornerInfo!.corner.id,
    location: cornerInfo!.inSlot ? 'slot' : cornerInfo!.position,
    orientation: cornerInfo!.orientation,
    inULayer: cornerInfo!.position.startsWith('U') || cornerInfo!.position.startsWith('D') === false,
  }

  const edge = {
    id: edgeInfo!.edge.id,
    location: edgeInfo!.inSlot ? 'slot' : edgeInfo!.position,
    orientation: edgeInfo!.orientation,
    inULayer: edgeInfo!.inULayer,
  }

  // 确定情况类型
  let caseType = 'unknown'

  if (corner.location === 'slot' && edge.location === 'slot') {
    caseType = 'both_in_slot'
  } else if (corner.location === 'slot') {
    caseType = 'corner_in_slot'
  } else if (edge.location === 'slot') {
    caseType = 'edge_in_slot'
  } else if (corner.inULayer && edge.inULayer) {
    caseType = 'both_in_U'
  } else if (corner.inULayer) {
    caseType = 'corner_U_edge_middle'
  } else {
    caseType = 'separated'
  }

  return { slot, corner, edge, caseType }
}

/**
 * 构建F2L条件用于查找公式
 */
function buildF2LCondition(situation: F2LSituation): F2LCaseCondition {
  return {
    corner: {
      inSlot: situation.corner.location === 'slot',
      inULayer: situation.corner.inULayer || situation.corner.location.startsWith('U'),
      orientation: situation.corner.orientation,
    },
    edge: {
      inSlot: situation.edge.location === 'slot',
      inULayer: situation.edge.inULayer || situation.edge.location.startsWith('U'),
      orientation: situation.edge.orientation,
    },
    paired: false,  // 简化：暂不检测配对状态
    connected: false,
  }
}

// ============================================================
// F2L 求解器
// ============================================================

/**
 * 简化的F2L求解器
 *
 * 策略：
 * 1. 识别角块和棱块位置
 * 2. 应用公式库中的对应公式
 * 3. 验证结果
 */
export function solveF2LSlot(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): string {
  // 检查槽位是否完成
  if (isF2LSlotComplete(state, slot)) {
    return ''
  }

  const situation = analyzeF2LSituation(state, slot)
  const condition = buildF2LCondition(situation)

  // 从公式库获取公式
  const algorithm = getF2LAlgorithmByCondition(condition, slot)

  return algorithm
}

/**
 * 智能F2L求解器 - 尝试多种公式直到成功
 *
 * 如果第一次尝试失败，尝试备选方案
 */
export function solveF2LSlotSmart(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR',
  maxAttempts: number = 3
): { moves: string; success: boolean } {
  // 检查槽位是否完成
  if (isF2LSlotComplete(state, slot)) {
    return { moves: '', success: true }
  }

  let currentState = state
  let allMoves = ''

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const situation = analyzeF2LSituation(currentState, slot)

    if (situation.caseType === 'complete') {
      return { moves: allMoves, success: true }
    }

    // 获取并应用公式
    const condition = buildF2LCondition(situation)
    let algorithm = getF2LAlgorithmByCondition(condition, slot)

    // 尝试U层调整
    if (attempt > 0 && situation.corner.inULayer && situation.edge.inULayer) {
      algorithm = `U ${algorithm}`
    }

    allMoves += (allMoves ? ' ' : '') + algorithm
    currentState = applyMoves(currentState, algorithm)

    // 检查是否完成
    if (isF2LSlotComplete(currentState, slot)) {
      return { moves: allMoves, success: true }
    }
  }

  return { moves: allMoves, success: false }
}

// ============================================================
// 完整F2L求解器
// ============================================================

export interface F2LSolution {
  slot: string
  moves: string
  steps: number
  successful: boolean
}

/**
 * 求解所有F2L槽位
 */
export function solveAllF2L(state: CubeState): F2LSolution[] {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  const solutions: F2LSolution[] = []

  let currentState = state

  for (const slot of slots) {
    const result = solveF2LSlotSmart(currentState, slot, 5)
    const steps = result.moves.split(' ').filter(m => m).length

    if (steps > 0) {
      currentState = applyMoves(currentState, result.moves)
    }

    solutions.push({
      slot,
      moves: result.moves,
      steps,
      successful: result.success,
    })
  }

  return solutions
}
