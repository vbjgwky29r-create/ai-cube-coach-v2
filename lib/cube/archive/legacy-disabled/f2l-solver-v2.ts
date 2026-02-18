/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L求解器 V2 - 基于配对跟踪的完整求解
 *
 * 策略：
 * 1. 对于FR槽位：直接使用FR公式库
 * 2. 对于FL/BL/BR槽位：尝试U层调整 + 直接公式
 * 3. 如果公式库不包含，使用DFS搜索
 */

import type { CubeState } from './cfop-solver-cubejs'
import { checkCrossIntact } from './cfop-solver-cubejs'
import { F2LSlotName, getF2LPairState } from './f2l-pair-state'
import { ALL_F2L_CASES_CORRECTED } from './f2l-complete-library'
import { isF2LSlotSolvedByFacelets } from './f2l-slot-check'

interface F2LSolution {
  success: boolean
  solution: string
  steps: number
  slots: { slot: F2LSlotName; solution: string; solved: boolean }[]
}

/**
 * 简单��setup公式：把块移到U层
 * 只尝试几个常用公式，不做DFS
 */
function setupToULayer(state: CubeState, slot: F2LSlotName, pairState: ReturnType<typeof getF2LPairState>, solvedSlots: F2LSlotName[] = []): string | null {
  const setupFormulas: string[] = [
    'R U R\'', 'R\' U\' R', 'R U\' R\'', 'R\' U R',
    'L U L\'', 'L\' U\' L', 'L U\' L\'', 'L\' U L',
    'F U F\'', 'F\' U\' F', 'B U B\'', 'B\' U\' B',
  ]

  for (const formula of setupFormulas) {
    const testState = state.move(formula)
    const testStateStr = testState.asString()
    const newPairState = getF2LPairState(testStateStr, slot)

    const uLayerCorners = ['URF', 'UFL', 'ULB', 'UBR']
    const uLayerEdges = ['UF', 'UR', 'UB', 'UL']

    if (uLayerCorners.includes(newPairState.cornerLoc) && uLayerEdges.includes(newPairState.edgeLoc)) {
      if (checkCrossIntact(testState) && solvedSlots.every(s => isF2LSlotSolvedByFacelets(testStateStr, s))) {
        return formula
      }
    }
  }

  return null
}

/**
 * 检查块是否都在U层
 */
function isPairInULayer(pairState: ReturnType<typeof getF2LPairState>): boolean {
  const uLayerCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uLayerEdges = ['UF', 'UR', 'UB', 'UL']
  return uLayerCorners.includes(pairState.cornerLoc) && uLayerEdges.includes(pairState.edgeLoc)
}

/**
 * 尝试直接用公式库求解（无转体）
 * @param solvedSlots 已经解决的槽位，需要保持不被破坏
 */
function tryDirectFormula(state: CubeState, slot: F2LSlotName, solvedSlots: F2LSlotName[] = []): string | null {
  const stateStr = state.asString()
  const pairState = getF2LPairState(stateStr, slot)

  // 如果块不在U层，先尝试简单公式移到U层
  if (!isPairInULayer(pairState)) {
    // 简单公式: 把块从其他位置移到U层
    const setupMoves = setupToULayer(state, slot, pairState, solvedSlots)
    if (setupMoves) {
      return setupMoves
    }
  }

  // 查找匹配的公式
  const match = ALL_F2L_CASES_CORRECTED.find(c =>
    c.slot === slot &&
    c.cornerPos === pairState.cornerLoc &&
    c.edgePos === pairState.edgeLoc &&
    c.cornerOri === pairState.cornerOri &&
    c.edgeOri === pairState.edgeOri
  )

  if (match) {
    // 使用算法（去掉转体标记）
    const alg = match.algorithm
      .replace(/^(y|y'|y2)\s+/, '')
      .replace(/\s+(y|y'|y2)$/, '')

    // 验证：Cross完整、目标槽位解决、��解决槽位不被破坏
    const testState = state.move(alg)
    const testStateStr = testState.asString()
    const crossOk = checkCrossIntact(testState)
    const targetOk = isF2LSlotSolvedByFacelets(testStateStr, slot)
    const previousOk = solvedSlots.every(s => isF2LSlotSolvedByFacelets(testStateStr, s))

    if (crossOk && targetOk && previousOk) {
      return alg
    }
  }

  return null
}

/**
 * 尝试U层调整后求解
 * @param solvedSlots 已经解决的槽位，需要保持不被破坏
 */
function tryWithUAdjustment(state: CubeState, slot: F2LSlotName, solvedSlots: F2LSlotName[] = []): string | null {
  // 尝试更多U层调整组合
  const uMoves = ['', 'U', "U'", 'U2', 'U U', "U U'", "U' U", "U' U'", 'U2 U', 'U2 U\'']

  for (const uMove of uMoves) {
    const adjustedState = state.move(uMove)

    // 尝试直接公式
    const directAlg = tryDirectFormula(adjustedState, slot, solvedSlots)

    if (directAlg) {
      // 完整算法: U调整 + 公式
      return uMove ? `${uMove} ${directAlg}`.trim() : directAlg
    }
  }

  return null
}

/**
 * DFS搜索（作为回退）
 * @param solvedSlots 已经解决的槽位，需要保持不被破坏
 */
function tryDFS(state: CubeState, slot: F2LSlotName, maxDepth: number = 10, solvedSlots: F2LSlotName[] = []): string | null {
  // 限制动作集合以提高效率
  const moves = ['U', "U'", 'U2', 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"]

  function dfs(current: CubeState, depth: number, lastMove: string, path: string[]): string | null {
    const stateStr = current.asString()

    // 检查是否解决目标槽位且Cross完整
    const targetSlotSolved = isF2LSlotSolvedByFacelets(stateStr, slot)
    const crossIntact = checkCrossIntact(current)

    // 检查已解决槽位是否仍然完整
    const previousSlotsIntact = solvedSlots.every(s => isF2LSlotSolvedByFacelets(stateStr, s))

    if (targetSlotSolved && crossIntact && previousSlotsIntact) {
      return path.join(' ')
    }

    if (depth <= 0) return null

    for (const move of moves) {
      // 跳过与上次动作同面的动作
      if (lastMove && move[0] === lastMove[0]) continue

      // 跳过无效动作序列（如 U followed by U'）
      if (lastMove) {
        const lastBase = lastMove[0]
        const lastMod = lastMove.slice(1)
        const moveBase = move[0]
        const moveMod = move.slice(1)

        if (lastBase === moveBase) {
          if ((lastMod === '' && moveMod === "'") || (lastMod === "'" && moveMod === '')) {
            continue
          }
        }
      }

      try {
        const newState = current.move(move)
        const result = dfs(newState, depth - 1, move, [...path, move])
        if (result) return result
      } catch {
        continue
      }
    }

    return null
  }

  // 从浅到深搜索
  for (let d = 1; d <= maxDepth; d++) {
    const result = dfs(state, d, '', [])
    if (result) return result
  }

  return null
}

/**
 * 求解完整F2L
 */
export function solveF2LV2(state: CubeState): F2LSolution {
  const slots: F2LSlotName[] = ['FR', 'FL', 'BL', 'BR']
  let currentState = state
  const results: { slot: F2LSlotName; solution: string; solved: boolean }[] = []
  const fullSolution: string[] = []
  const solvedSlots: F2LSlotName[] = []

  for (const slot of slots) {
    // 检查是否已解决
    if (isF2LSlotSolvedByFacelets(currentState.asString(), slot)) {
      results.push({ slot, solution: '', solved: true })
      solvedSlots.push(slot)
      continue
    }

    let solution: string | null = null

    // 策略1: 尝试直接公式
    solution = tryDirectFormula(currentState, slot, solvedSlots)

    // 策略2: 尝试U层调整
    if (!solution) {
      solution = tryWithUAdjustment(currentState, slot, solvedSlots)
    }

    // 策略3: DFS搜索（传递已解决槽位）
    if (!solution) {
      solution = tryDFS(currentState, slot, 10, solvedSlots)
    }

    if (solution) {
      currentState = currentState.move(solution)
      fullSolution.push(solution)
      results.push({ slot, solution, solved: true })
      solvedSlots.push(slot)
    } else {
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

// 重新导出为solveF2LComplete以保持兼容性
export { solveF2LV2 as solveF2LComplete }

