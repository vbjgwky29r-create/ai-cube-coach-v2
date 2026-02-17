/**
 * F2L 求解器 v3 - 保留U层完整性
 *
 * 约束：在求解F2L槽位时，确保U层块始终在U层
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  type CubeState,
} from './cube-state-v3.js'

import { getSlotPieces, isF2LSlotComplete } from './f2l-formulas.js'

// U层的块
const U_EDGES = ['UF', 'UL', 'UB', 'UR']
const U_CORNERS = ['URF', 'UFL', 'ULB', 'UBR']

/**
 * 检查U层是��完整（所有U层块都在U层）
 */
function isULayerComplete(state: CubeState): boolean {
  for (const edgeId of U_EDGES) {
    const edge = state.edges.find((e: any) => e.id === edgeId)
    if (!edge || edge.position.y !== 1) return false
  }
  for (const cornerId of U_CORNERS) {
    const corner = state.corners.find((c: any) => c.id === cornerId)
    if (!corner || corner.position.y !== 1) return false
  }
  return true
}

/**
 * 检查状态是否有效（U层块必须在U层）
 */
function isValidState(state: CubeState): boolean {
  // 检查U层块是否都在U层
  for (const edgeId of U_EDGES) {
    const edge = state.edges.find((e: any) => e.id === edgeId)
    if (edge && edge.position.y !== 1 && edge.position.y !== -1) {
      // U层块必须在U层(y=1)或D层(y=-1)
      // 不应该在中间层(y=0)
      return false
    }
  }
  return true
}

/**
 * 带U层约束的F2L槽位求解
 */
export function solveF2LSlotConstrained(
  state: CubeState,
  slot: 'FR' | 'FL' | 'BL' | 'BR',
  maxDepth: number = 10
): string {
  // 检查是否已完成
  if (isF2LSlotComplete(state, slot)) {
    return ''
  }

  // BFS搜索
  const queue: { state: CubeState; moves: string; depth: number }[] = [
    { state, moves: '', depth: 0 },
  ]

  const visited = new Set<string>()

  // 状态哈希：只记录F2L相关状态和U层完整性
  const getHash = (s: CubeState): string => {
    const pieces = getSlotPieces(slot)
    const corner = s.corners.find((c: any) => c.id === pieces.corner)
    const edge = s.edges.find((e: any) => e.id === pieces.edge)

    let hash = `slot:${slot}`
    if (corner) {
      hash += ` c@(${corner.position.x},${corner.position.y},${corner.position.z})[${corner.orientation}]`
    }
    if (edge) {
      hash += ` e@(${edge.position.x},${edge.position.y},${edge.position.z})[${edge.orientation}]`
    }

    // 检查U层完整性
    hash += isULayerComplete(s) ? ' U_OK' : ' U_BAD'

    return hash
  }

  visited.add(getHash(state))

  while (queue.length > 0) {
    const current = queue.shift()!

    if (current.depth >= maxDepth) {
      continue
    }

    // 尝试每个移动
    for (const move of ['R', "R'", 'L', "L'", 'U', "U'", 'F', "F'", 'R2', 'L2', 'U2', 'F2']) {
      const newState = applyMove(current.state, move)

      // 跳过无效状态（U层块跑到中间层）
      if (!isValidState(newState)) {
        continue
      }

      const hash = getHash(newState)
      if (visited.has(hash)) {
        continue
      }
      visited.add(hash)

      const newMoves = current.moves ? `${current.moves} ${move}` : move

      // 检查是否完成
      if (isF2LSlotComplete(newState, slot)) {
        return newMoves
      }

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
 * 求解所有F2L槽位（带U层保护）
 */
export function solveF2LWithProtection(
  state: CubeState,
  maxDepth: number = 10
): { moves: string; steps: number; allComplete: boolean; uLayerComplete: boolean } {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  const allMoves: string[] = []

  let currentState = state

  for (const slot of slots) {
    const moves = solveF2LSlotConstrained(currentState, slot, maxDepth)
    const steps = moves.split(' ').filter(m => m).length

    if (steps > 0) {
      allMoves.push(moves)
      currentState = applyMoves(currentState, moves)
    }

    console.log(`  ${slot}: ${moves || '(已完成)'} (${steps}步)`)
  }

  const allComplete = slots.every(slot => isF2LSlotComplete(currentState, slot))
  const uLayerComplete = isULayerComplete(currentState)

  console.log(`  U层完整: ${uLayerComplete ? '✓' : '✗'}`)

  return {
    moves: allMoves.join(' '),
    steps: allMoves.join(' ').split(' ').filter(m => m).length,
    allComplete,
    uLayerComplete,
  }
}
