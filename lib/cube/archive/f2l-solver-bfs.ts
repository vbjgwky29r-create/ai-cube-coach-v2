/**
 * F2L BFS 求解器
 *
 * 使用广度优先搜索找到F2L槽位的解法
 * 类似于 Cross 的求解方式，但目标是同时还原角块和棱块
 *
 * 优势：
 * - 不需要预定义大量公式
 * - 可以找到最优解或接近最优解
 * - 可靠性高
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  type CubeState,
} from './cube-state-v3.js'

import { getSlotPieces, isF2LSlotComplete } from './f2l-formulas.js'

// ============================================================
// BFS 求解器
// ============================================================

const BASIC_MOVES = ['R', "R'", 'U', "U'", 'F', "F'", 'L', "L'", 'D', "D'", 'B', "B'",
                     'R2', 'U2', 'F2', 'L2', 'D2', 'B2']

// 用于F2L的移动集合（优先使用不影响U层的移动，然后是U层调整）
const F2L_MOVES = ['R', "R'", 'L', "L'", 'F', "F'",
                   'R2', 'L2', 'F2',
                   'U', "U'", 'U2']  // U层移动放在最后

interface SearchNode {
  state: CubeState
  moves: string
  depth: number
}

/**
 * 使用 BFS 搜索求解单个 F2L 槽位
 *
 * @param state 当前魔方状态
 * @param slot 目标槽位 (FR, FL, BL, BR)
 * @param maxDepth 最大搜索深度
 * @returns 解法字符串，如果找不到返回空字符串
 */
export function solveF2LSlotBFS(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR',
  maxDepth: number = 8
): string {
  // 检查是否已完成
  if (isF2LSlotComplete(state, slot)) {
    return ''
  }

  // BFS 搜索
  const queue: SearchNode[] = [{ state, moves: '', depth: 0 }]
  const visited = new Set<string>()
  visited.add(getStateHash(state))

  while (queue.length > 0) {
    const current = queue.shift()!

    // 检查是否达到深度限制
    if (current.depth >= maxDepth) {
      continue
    }

    // 尝试每个移动
    for (const move of F2L_MOVES) {
      // 避免冗余移动（如 R R'）
      if (isRedundantMove(current.moves, move)) {
        continue
      }

      const newState = applyMove(current.state, move)
      const stateHash = getStateHash(newState)

      // 检查是否已访问
      if (visited.has(stateHash)) {
        continue
      }
      visited.add(stateHash)

      const newMoves = current.moves ? `${current.moves} ${move}` : move

      // 检查是否完成目标槽位
      if (isF2LSlotComplete(newState, slot)) {
        return newMoves
      }

      // 检查是否破坏了 Cross（可选，如果需要的话）
      // if (!isCrossComplete(newState)) {
      //   continue
      // }

      queue.push({
        state: newState,
        moves: newMoves,
        depth: current.depth + 1,
      })
    }
  }

  return '' // 未找到解
}

/**
 * 检查移动是否冗余（避免反向移动）
 */
function isRedundantMove(moves: string, newMove: string): boolean {
  if (!moves) return false

  const moveList = moves.split(' ').filter(m => m)
  const lastMove = moveList[moveList.length - 1]

  // 检查是否是反向移动
  if (lastMove.length === 2 && lastMove[1] === '2') {
    // R2 后不能跟 R2
    return lastMove === newMove
  }

  if (lastMove.length === 1) {
    // R 后不能跟 R'
    if (newMove === lastMove + "'") return true
  }

  if (lastMove.length === 2 && lastMove[1] === "'") {
    // R' 后不能跟 R
    if (newMove === lastMove[0]) return true
  }

  return false
}

/**
 * 获取状态哈希（用于访问检测）
 * 简化版本：只追踪F2L相关的块位置
 */
function getStateHash(state: CubeState): string {
  // 只追踪角块和棱块的位置
  const cornerPositions = state.corners.map(c =>
    `${c.id}@(${c.position.x},${c.position.y},${c.position.z})[${c.orientation}]`
  ).join('|')

  const edgePositions = state.edges.map(e =>
    `${e.id}@(${e.position.x},${e.position.y},${e.position.z})[${e.orientation}]`
  ).join('|')

  return cornerPositions + ':' + edgePositions
}

// ============================================================
// 完整 F2L 求解器
// ============================================================

export interface F2LSolution {
  slot: string
  moves: string
  steps: number
  successful: boolean
}

/**
 * 检查U层是否完整（所有U层块都在U层）
 */
function checkULayerIntegrity(state: CubeState): boolean {
  const uEdges = ['UF', 'UL', 'UB', 'UR']
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']

  // 检查U层棱块是否都在U层
  for (const edgeId of uEdges) {
    const edge = state.edges.find((e: any) => e.id === edgeId)
    if (!edge || edge.position.y !== 1) return false
  }

  // 检查U层角块是否都在U层
  for (const cornerId of uCorners) {
    const corner = state.corners.find((c: any) => c.id === cornerId)
    if (!corner || corner.position.y !== 1) return false
  }

  return true
}

/**
 * 修复U层 - 将U层块带回U层
 */
function fixULayer(state: CubeState): { moves: string; fixedState: CubeState } {
  console.log('  [F2L] 检测到U层不完整，尝试修复...')

  // 简单策略：使用一些标准公式来恢复U层
  const fixAlgorithms = [
    "U", "U2", "U'",
    "R U R' U'",  // Sexy move variant
    "L' U' L U",
  ]

  for (const algo of fixAlgorithms) {
    const testState = applyMoves(state, algo)
    if (checkULayerIntegrity(testState)) {
      console.log(`  [F2L] 修复成功: ${algo}`)
      return { moves: algo, fixedState: testState }
    }
  }

  console.log('  [F2L] 无法简单修复，使用U层对齐')
  // 默认返回U调整
  return { moves: 'U', fixedState: applyMove(state, 'U') }
}

/**
 * 求解所有 F2L 槽位
 */
export function solveAllF2L(state: CubeState, maxDepth: number = 8): F2LSolution[] {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  const solutions: F2LSolution[] = []

  let currentState = state

  for (const slot of slots) {
    const moves = solveF2LSlotBFS(currentState, slot, maxDepth)
    const steps = moves.split(' ').filter(m => m).length

    if (steps > 0) {
      currentState = applyMoves(currentState, moves)
    }

    const successful = isF2LSlotComplete(currentState, slot)

    solutions.push({
      slot,
      moves,
      steps,
      successful,
    })

    console.log(`  ${slot}: ${moves || '(已完成)'} (${steps}步) ${successful ? '✓' : '✗'}`)
  }

  return solutions
}

/**
 * 增量求解 - 逐个槽位求解，返回完整解法
 */
export function solveF2LIncremental(
  state: CubeState,
  maxDepth: number = 8
): { moves: string; solutions: F2LSolution[]; totalSteps: number; allComplete: boolean } {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  const solutions: F2LSolution[] = []
  const allMoves: string[] = []

  let currentState = state

  for (const slot of slots) {
    const moves = solveF2LSlotBFS(currentState, slot, maxDepth)
    const steps = moves.split(' ').filter(m => m).length

    if (steps > 0) {
      allMoves.push(moves)
      currentState = applyMoves(currentState, moves)
    }

    const successful = isF2LSlotComplete(currentState, slot)

    solutions.push({
      slot,
      moves,
      steps,
      successful,
    })
  }

  const totalSteps = allMoves.join(' ').split(' ').filter(m => m).length
  const allComplete = solutions.every(s => s.successful)

  // 检查U层完整性，如果不完整则修复
  if (allComplete && !checkULayerIntegrity(currentState)) {
    const fixResult = fixULayer(currentState)
    allMoves.push(fixResult.moves)
    currentState = fixResult.fixedState
  }

  return {
    moves: allMoves.join(' '),
    solutions,
    totalSteps: allMoves.join(' ').split(' ').filter(m => m).length,
    allComplete,
  }
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 检查是否所有 F2L 槽位都已完成
 */
export function isAllF2LComplete(state: CubeState): boolean {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  return slots.every(slot => isF2LSlotComplete(state, slot))
}

/**
 * 获取已完成的 F2L 槽位数
 */
export function getCompletedF2LCount(state: CubeState): number {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  return slots.filter(slot => isF2LSlotComplete(state, slot)).length
}
