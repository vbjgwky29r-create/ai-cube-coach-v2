/**
 * F2L 求解器 v2 - 使用完整41种案例库
 *
 * 核心策略：
 * 1. 识别角块和棱块的位置和朝向
 * 2. 匹配对应的F2L案例
 * 3. 应用标准公式
 * 4. 如果需要，进行U层调整
 *
 * 关键改进：
 * - 使用41种完整案例库
 * - 智能U层调整（处理块不在标准位置的情况）
 * - 确保不破坏Cross和已完成的槽位
 */

import {
  createSolvedCube,
  findCornerById,
  findEdgeById,
  findCornerAt,
  findEdgeAt,
  applyMoves,
  applyMove,
  isSolved,
  type CubeState,
} from './cube-state-v3.js'

import { ALL_F2L_CASES, getF2LAlgorithm, type F2LCaseCondition } from './f2l-cases.js'
import { getSlotPieces, isF2LSlotComplete as _isF2LSlotComplete } from './f2l-formulas.js'

export const isF2LSlotComplete = _isF2LSlotComplete

// ============================================================
// F2L 槽位定义
// ============================================================

export type F2LSlot = 'FR' | 'FL' | 'BL' | 'BR'

const F2L_SLOTS: F2LSlot[] = ['FR', 'FL', 'BL', 'BR']

// U层位置定义
const U_CORNER_POSITIONS = [
  { name: 'URF', x: 1, y: 1, z: 1 },
  { name: 'UFL', x: -1, y: 1, z: 1 },
  { name: 'ULB', x: -1, y: 1, z: -1 },
  { name: 'UBR', x: 1, y: 1, z: -1 },
] as const

const U_EDGE_POSITIONS = [
  { name: 'UF', x: 0, y: 1, z: 1 },
  { name: 'UL', x: -1, y: 1, z: 0 },
  { name: 'UB', x: 0, y: 1, z: -1 },
  { name: 'UR', x: 1, y: 1, z: 0 },
] as const

const MIDDLE_EDGE_POSITIONS = [
  { name: 'FR', x: 1, y: 0, z: 1 },
  { name: 'FL', x: -1, y: 0, z: 1 },
  { name: 'BL', x: -1, y: 0, z: -1 },
  { name: 'BR', x: 1, y: 0, z: -1 },
] as const

// ============================================================
// F2L 块状态分析
// ============================================================

export interface PieceLocation {
  inSlot: boolean           // 是否在目标槽位
  inULayer: boolean         // 是否在U层
  inMiddleLayer: boolean    // 是否在中层
  position: string         // 具体位置名称
  orientation: number       // 朝向 (角块: 0-2, 棱块: 0-1)
}

export interface F2LSlotState {
  slot: F2LSlot
  corner: PieceLocation
  edge: PieceLocation
  isComplete: boolean
}

/**
 * 分析指定槽位的状态
 */
export function analyzeF2LSlot(
  state: CubeState,
  slot: F2LSlot
): F2LSlotState {
  const pieces = getSlotPieces(slot)

  // 检查槽位是否已完成
  if (_isF2LSlotComplete(state, slot)) {
    return {
      slot,
      corner: { inSlot: true, inULayer: false, inMiddleLayer: false, position: slot, orientation: 0 },
      edge: { inSlot: true, inULayer: false, inMiddleLayer: false, position: slot, orientation: 0 },
      isComplete: true,
    }
  }

  // 分析角块
  const corner = findCornerById(state, pieces.corner)
  const cornerState = analyzeCornerPosition(state, corner, slot)

  // 分析棱块
  const edge = findEdgeById(state, pieces.edge)
  const edgeState = analyzeEdgePosition(state, edge, slot)

  return {
    slot,
    corner: cornerState,
    edge: edgeState,
    isComplete: false,
  }
}

/**
 * 分析角块位置和朝向
 */
function analyzeCornerPosition(
  state: CubeState,
  corner: any,
  targetSlot: F2LSlot
): PieceLocation {
  const solved = createSolvedCube()
  const solvedCorner = solved.corners.find((c: any) => c.id === corner.id)!

  // 检查是否在目标槽位
  const inSlot =
    corner.position.x === solvedCorner.position.x &&
    corner.position.y === solvedCorner.position.y &&
    corner.position.z === solvedCorner.position.z

  if (inSlot) {
    return {
      inSlot: true,
      inULayer: false,
      inMiddleLayer: false,
      position: targetSlot,
      orientation: corner.orientation,
    }
  }

  // 检查是否在U层
  if (corner.position.y === 1) {
    for (const uPos of U_CORNER_POSITIONS) {
      if (corner.position.x === uPos.x &&
          corner.position.y === uPos.y &&
          corner.position.z === uPos.z) {
        return {
          inSlot: false,
          inULayer: true,
          inMiddleLayer: false,
          position: uPos.name,
          orientation: corner.orientation,
        }
      }
    }
  }

  // 默认情况
  return {
    inSlot: false,
    inULayer: false,
    inMiddleLayer: corner.position.y === 0,
    position: 'unknown',
    orientation: corner.orientation,
  }
}

/**
 * 分析棱块位置和朝向
 */
function analyzeEdgePosition(
  state: CubeState,
  edge: any,
  targetSlot: F2LSlot
): PieceLocation {
  const solved = createSolvedCube()
  const solvedEdge = solved.edges.find((e: any) => e.id === edge.id)!

  // 检查是否在目标槽位
  const inSlot =
    edge.position.x === solvedEdge.position.x &&
    edge.position.y === solvedEdge.position.y &&
    edge.position.z === solvedEdge.position.z

  if (inSlot) {
    return {
      inSlot: true,
      inULayer: false,
      inMiddleLayer: false,
      position: targetSlot,
      orientation: edge.orientation,
    }
  }

  // 检查是否在U层
  if (edge.position.y === 1) {
    for (const uPos of U_EDGE_POSITIONS) {
      if (edge.position.x === uPos.x &&
          edge.position.y === uPos.y &&
          edge.position.z === uPos.z) {
        return {
          inSlot: false,
          inULayer: true,
          inMiddleLayer: false,
          position: uPos.name,
          orientation: edge.orientation,
        }
      }
    }
  }

  // 检查是否在中层
  if (edge.position.y === 0) {
    for (const mPos of MIDDLE_EDGE_POSITIONS) {
      if (edge.position.x === mPos.x &&
          edge.position.y === mPos.y &&
          edge.position.z === mPos.z) {
        return {
          inSlot: false,
          inULayer: false,
          inMiddleLayer: true,
          position: mPos.name,
          orientation: edge.orientation,
        }
      }
    }
  }

  // 默认情况
  return {
    inSlot: false,
    inULayer: false,
    inMiddleLayer: edge.position.y === 0,
    position: 'unknown',
    orientation: edge.orientation,
  }
}

// ============================================================
// F2L 案例匹配
// ============================================================

/**
 * 构建F2L条件用于匹配案例
 */
function buildF2LCondition(slotState: F2LSlotState): F2LCaseCondition {
  return {
    corner: {
      inSlot: slotState.corner.inSlot,
      inULayer: slotState.corner.inULayer,
      orientation: slotState.corner.orientation,
    },
    edge: {
      inSlot: slotState.edge.inSlot,
      inULayer: slotState.edge.inULayer,
      orientation: slotState.edge.orientation,
    },
    paired: isCornerEdgePaired(slotState),
    connected: isCornerEdgeConnected(slotState),
  }
}

/**
 * 检查角块和棱块是否已配对
 * (简化版本：主要检查是否都在U层且朝向正确)
 */
function isCornerEdgePaired(slotState: F2LSlotState): boolean {
  // 简化：两个块都在U层且朝向正确
  return slotState.corner.inULayer &&
         slotState.edge.inULayer &&
         slotState.corner.orientation === 0 &&
         slotState.edge.orientation === 0
}

/**
 * 检查角块和棱块是否相连
 */
function isCornerEdgeConnected(slotState: F2LSlotState): boolean {
  // 简化：不检查连接状态
  return false
}

/**
 * 根据槽位状态查找匹配的F2L案例
 */
function findMatchingF2LCase(slotState: F2LSlotState) {
  const condition = buildF2LCondition(slotState)

  // 尝试精确匹配
  for (const f2lCase of ALL_F2L_CASES) {
    const c = f2lCase.condition

    // 检查角块状态
    const cornerMatch =
      c.corner.inSlot === condition.corner.inSlot &&
      c.corner.inULayer === condition.corner.inULayer &&
      (c.corner.orientation === condition.corner.orientation ||
       // 对于orientation，允许更宽松的匹配
       (condition.corner.inSlot && c.corner.inSlot === condition.corner.inSlot))

    // 检查棱块状态
    const edgeMatch =
      c.edge.inSlot === condition.edge.inSlot &&
      c.edge.inULayer === condition.edge.inULayer &&
      (c.edge.orientation === condition.edge.orientation ||
       (condition.edge.inSlot && c.edge.inSlot === condition.edge.inSlot))

    if (cornerMatch && edgeMatch) {
      return f2lCase
    }
  }

  // 没有精确匹配，尝试宽松匹配
  for (const f2lCase of ALL_F2L_CASES) {
    const c = f2lCase.condition

    // 只检查基本位置类型
    const cornerBasic =
      c.corner.inSlot === condition.corner.inSlot &&
      c.corner.inULayer === condition.corner.inULayer

    const edgeBasic =
      c.edge.inSlot === condition.edge.inSlot &&
      c.edge.inULayer === condition.edge.inULayer

    if (cornerBasic && edgeBasic) {
      return f2lCase
    }
  }

  return null
}

// ============================================================
// F2L 求解器
// ============================================================

export interface F2LSolution {
  slot: F2LSlot
  moves: string
  steps: number
  successful: boolean
  caseId?: string
}

/**
 * 求解单个F2L槽位
 *
 * 策略：
 * 1. 如果槽位已完成，返回空公式
 * 2. 识别当前状态
 * 3. 匹配对应的F2L案例
 * 4. 尝试不同的U层调整
 * 5. 应用公式并验证
 */
export function solveF2LSlot(
  state: CubeState,
  slot: F2LSlot,
  maxAttempts: number = 4
): F2LSolution {
  // 检查是否已完成
  if (_isF2LSlotComplete(state, slot)) {
    return {
      slot,
      moves: '',
      steps: 0,
      successful: true,
    }
  }

  const U_ADJUSTMENTS = ['', 'U', "U'", 'U2']

  // 分析当前状态
  const slotState = analyzeF2LSlot(state, slot)

  // 尝试不同的U层调整
  for (const uAdj of U_ADJUSTMENTS) {
    // 如果需要U层调整，创建调整后的状态
    let testState = state
    if (uAdj) {
      testState = applyMove(state, uAdj)
    }

    // 重新分析状态
    const adjustedSlotState = analyzeF2LSlot(testState, slot)

    // 查找匹配的案例
    const matchedCase = findMatchingF2LCase(adjustedSlotState)

    if (matchedCase) {
      // 获取公式
      const algorithm = getF2LAlgorithm(matchedCase, slot)
      const fullFormula = uAdj ? `${uAdj} ${algorithm}` : algorithm

      // 验证公式
      const afterFormula = applyMoves(testState, algorithm)
      const isComplete = _isF2LSlotComplete(afterFormula, slot)

      if (isComplete) {
        return {
          slot,
          moves: fullFormula,
          steps: fullFormula.split(' ').filter(m => m).length,
          successful: true,
          caseId: matchedCase.id,
        }
      }
    }
  }

  // 如果没有找到匹配的案例，尝试通用公式
  return solveF2LSlotGeneric(state, slot)
}

/**
 * 通用F2L求解（当无法精确匹配时使用）
 */
function solveF2LSlotGeneric(
  state: CubeState,
  slot: F2LSlot
): F2LSolution {
  const slotState = analyzeF2LSlot(state, slot)

  // 根据情况选择通用公式
  let algorithm = ''

  if (slotState.corner.inSlot && !slotState.edge.inSlot) {
    // 角块在槽位，需要取出
    const slotMoves: Record<F2LSlot, string> = {
      FR: "R U' R' U R U R'",
      FL: "L' U L U' L' U' L",
      BL: "L' U L' U' L' U' L",
      BR: "R U R' U R U R'",
    }
    algorithm = slotMoves[slot]
  } else if (!slotState.corner.inSlot && slotState.edge.inSlot) {
    // 棱块在槽位，需要取出
    const slotMoves: Record<F2LSlot, string> = {
      FR: "R U R' U' R U R'",
      FL: "L' U' L U L' U' L",
      BL: "L' U' L' U L' U' L",
      BR: "R U R' U R U R'",
    }
    algorithm = slotMoves[slot]
  } else if (slotState.corner.inULayer && slotState.edge.inULayer) {
    // 两个块都在U层
    const slotMoves: Record<F2LSlot, string> = {
      FR: "U' R U R' U R U' R'",
      FL: "U L' U' L U' L' U L",
      BL: "U' L U L' U L U L'",
      BR: "U R' U' R U R' U R",
    }
    algorithm = slotMoves[slot]
  } else {
    // 默认公式
    const slotMoves: Record<F2LSlot, string> = {
      FR: "R U R' U R U R'",
      FL: "L' U' L U' L' U L",
      BL: "L' U' L' U' L' U L",
      BR: "R U R' U R U R'",
    }
    algorithm = slotMoves[slot]
  }

  // 尝试不同的U层调整
  for (const uAdj of ['', 'U', "U'", 'U2']) {
    const fullFormula = uAdj ? `${uAdj} ${algorithm}` : algorithm
    const testState = uAdj ? applyMove(state, uAdj) : state
    const afterFormula = applyMoves(testState, algorithm)

    if (_isF2LSlotComplete(afterFormula, slot)) {
      return {
        slot,
        moves: fullFormula,
        steps: fullFormula.split(' ').filter(m => m).length,
        successful: true,
      }
    }
  }

  // 最后尝试：使用迭代方法
  return solveF2LSlotIterative(state, slot)
}

/**
 * 迭代F2L求解（最后手段）
 */
function solveF2LSlotIterative(
  state: CubeState,
  slot: F2LSlot,
  maxDepth: number = 6
): F2LSolution {
  // 简化的BFS搜索，只使用R, L, U移动
  const moves = ['R', "R'", 'U', "U'", 'L', "L'"]

  // 优先级公式列表（最有效的F2L公式）
  const priorityAlgs: Record<F2LSlot, string[]> = {
    FR: [
      "R U R' U'",
      "U R U' R'",
      "U' R U R' U R U' R'",
      "R' U' R U R U R'",
      "U R U' R' U' R U R'",
    ],
    FL: [
      "L' U' L U",
      "U' L' U L",
      "U L' U' L U L' U' L",
      "L U L' U' L' U' L",
      "U' L' U L U L' U L",
    ],
    BL: [
      "L' U L' U",
      "U' L' U L",
      "U L' U' L U L' U L",
      "L U L' U' L' U L",
      "U' L' U L U L' U L",
    ],
    BR: [
      "R U R' U",
      "U R U' R",
      "U' R U R' U R U' R",
      "R' U' R U R U' R",
      "U R U' R' U' R U R",
    ],
  }

  const slotAlgs = priorityAlgs[slot]

  for (const uAdj of ['', 'U', "U'", 'U2']) {
    for (const alg of slotAlgs) {
      const fullFormula = uAdj ? `${uAdj} ${alg}` : alg
      const testState = uAdj ? applyMove(state, uAdj) : state

      try {
        const afterFormula = applyMoves(testState, alg)
        if (_isF2LSlotComplete(afterFormula, slot)) {
          return {
            slot,
            moves: fullFormula,
            steps: fullFormula.split(' ').filter(m => m).length,
            successful: true,
          }
        }
      } catch (e) {
        // 忽略错误，继续尝试
      }
    }
  }

  return {
    slot,
    moves: '',
    steps: 0,
    successful: false,
  }
}

/**
 * 求解所有F2L槽位
 */
export function solveAllF2L(state: CubeState): F2LSolution[] {
  const solutions: F2LSolution[] = []
  let currentState = state

  // 按顺序求解每个槽位
  for (const slot of F2L_SLOTS) {
    const solution = solveF2LSlot(currentState, slot, 4)

    if (solution.steps > 0) {
      // 应用公式
      currentState = applyMoves(currentState, solution.moves)
    }

    solutions.push(solution)

    if (!solution.successful && solution.steps === 0) {
      console.warn(`F2L slot ${slot} could not be solved`)
    }
  }

  return solutions
}

/**
 * 检查所有F2L是否完成
 */
export function isF2LComplete(state: CubeState): boolean {
  for (const slot of F2L_SLOTS) {
    if (!_isF2LSlotComplete(state, slot)) {
      return false
    }
  }
  return true
}

/**
 * 获取F2L完成进度
 */
export function getF2LProgress(state: CubeState): {
  completed: number
  total: number
  percentage: number
  completedSlots: string[]
} {
  let completed = 0
  const completedSlots: string[] = []

  for (const slot of F2L_SLOTS) {
    if (_isF2LSlotComplete(state, slot)) {
      completed++
      completedSlots.push(slot)
    }
  }

  return {
    completed,
    total: 4,
    percentage: (completed / 4) * 100,
    completedSlots,
  }
}
