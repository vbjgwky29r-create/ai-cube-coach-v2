/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * 完整F2L求解器 - 基于41种标准公式
 *
 * 特性：
 * 1. 使用完整的F2L公式库（41种情况）
 * 2. 支持y/y'/y2转体简化求解
 * 3. 优先求解最容易的槽位
 * 4. 保持Cross完整
 */

import { checkCrossIntact } from './cfop-solver-cubejs'
import { F2LSlotName, getF2LPairState } from './f2l-pair-state'
import { ALL_F2L_CASES } from './f2l-complete-library'
import { isF2LSlotSolvedByFacelets } from './f2l-slot-check'
import type { CubeState } from './cfop-solver-cubejs'

interface F2LSolution {
  success: boolean
  solution: string
  steps: number
  slots: { slot: F2LSlotName; solution: string; solved: boolean }[]
}

/**
 * 求解完整F2L
 */
export function solveF2LComplete(state: CubeState): F2LSolution {
  const slots: F2LSlotName[] = ['FR', 'FL', 'BL', 'BR']
  let currentState = state
  const results: { slot: F2LSlotName; solution: string; solved: boolean }[] = []
  const fullSolution: string[] = []

  for (const slot of slots) {
    // 检查是否已解决
    if (isF2LSlotSolvedByFacelets(currentState.asString(), slot)) {
      results.push({ slot, solution: '', solved: true })
      continue
    }

    // 尝试求解（trySolveSlot内部处理转体）
    const result = trySolveSlot(currentState, slot, '')

    if (result) {
      currentState = currentState.move(result)
      fullSolution.push(result)
      results.push({ slot, solution: result, solved: true })
    } else {
      // 标记为未解决
      results.push({ slot, solution: '', solved: false })
    }
  }

  const allSolved = results.every(r => r.solved)
  const solution = fullSolution.join(' ')

  return {
    success: allSolved,
    solution,
    steps: solution.split(' ').filter(m => m).length,
    slots: results,
  }
}

/**
 * 尝试用公式库求解单个槽位
 *
 * 策略：
 * 1. 对于FR槽位：直接使用公式库
 * 2. 对于FL/BL/BR槽位：尝试y转体后使用FR公式
 */
function trySolveSlot(state: CubeState, slot: F2LSlotName, rotation: string): string | null {
  const stateStr = state.asString()
  const pairState = getF2LPairState(stateStr, slot)

  // FR槽位：直接使用公式库
  if (slot === 'FR') {
    const match = ALL_F2L_CASES.find(c =>
      c.slot === 'FR' &&
      c.cornerPos === pairState.cornerLoc &&
      c.edgePos === pairState.edgeLoc &&
      c.cornerOri === pairState.cornerOri &&
      c.edgeOri === pairState.edgeOri
    )

    if (match) {
      const alg = match.algorithm
      const testState = state.move(alg)
      if (checkCrossIntact(testState) && isF2LSlotSolvedByFacelets(testState.asString(), 'FR')) {
        return alg
      }
    }
    return null
  }

  // FL/BL/BR槽位：尝试y转体方法
  // 将目标槽位转体到FR，使用FR公式，再转回
  const rotationMap: Partial<Record<F2LSlotName, { rot: string; inverse: string }>> = {
    'FL': { rot: "y'", inverse: 'y' },
    'BL': { rot: 'y2', inverse: 'y2' },
    'BR': { rot: 'y', inverse: "y'" },
  }

  const mapping = rotationMap[slot]
  if (!mapping) return null
  const { rot, inverse } = mapping

  // 转体后分析FR槽位
  const rotatedState = state.move(rot)
  const rotatedPairState = getF2LPairState(rotatedState.asString(), 'FR')

  // 在FR公式库中查找匹配
  const frMatch = ALL_F2L_CASES.find(c =>
    c.slot === 'FR' &&
    c.cornerPos === rotatedPairState.cornerLoc &&
    c.edgePos === rotatedPairState.edgeLoc &&
    c.cornerOri === rotatedPairState.cornerOri &&
    c.edgeOri === rotatedPairState.edgeOri
  )

  if (frMatch) {
    const frAlg = frMatch.algorithm
    // 完整算法: 转体 + FR算法 + 逆转体
    const fullAlg = `${rot} ${frAlg} ${inverse}`.trim()

    const testState = state.move(fullAlg)
    if (checkCrossIntact(testState) && isF2LSlotSolvedByFacelets(testState.asString(), slot)) {
      return fullAlg
    }
  }

  // 如果转体方法失败，尝试直接查找该槽位的公式（用于直接定义的公式）
  const directMatch = ALL_F2L_CASES.find(c =>
    c.slot === slot &&
    c.cornerPos === pairState.cornerLoc &&
    c.edgePos === pairState.edgeLoc &&
    c.cornerOri === pairState.cornerOri &&
    c.edgeOri === pairState.edgeOri
  )

  if (directMatch) {
    // 对于直接公式，不包含转体标记
    const alg = directMatch.algorithm.replace(/^(y|y'|y2)\s+/, '').replace(/\s+(y|y'|y2)$/, '')
    const testState = state.move(alg)
    if (checkCrossIntact(testState) && isF2LSlotSolvedByFacelets(testState.asString(), slot)) {
      return alg
    }
  }

  return null
}

/**
 * DFS搜索作为回退
 */
function solveSlotDFS(state: CubeState, slot: F2LSlotName, maxDepth: number = 12): string | null {
  const moves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2']

  function dfs(current: CubeState, depth: number, lastMove: string, path: string[]): string | null {
    if (isF2LSlotSolvedByFacelets(current.asString(), slot) && checkCrossIntact(current)) {
      return path.join(' ')
    }
    if (depth <= 0) return null

    for (const move of moves) {
      if (lastMove && move[0] === lastMove[0]) continue

      const newState = current.move(move)
      const result = dfs(newState, depth - 1, move, [...path, move])
      if (result) return result
    }
    return null
  }

  for (let d = 1; d <= maxDepth; d++) {
    const result = dfs(state, d, '', [])
    if (result) return result
  }

  return null
}

