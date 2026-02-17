/**
 * F2L 启发式求解器
 *
 * 基于简化策略的F2L求解：
 * 1. 找到未完成的槽位
 * 2. 尝试基本插入公式
 * 3. 如果失败，尝试带U调整的插入
 */

import { CubeState, analyzeF2LSlot, isF2LComplete } from './cfop-solver-cubejs'

const F2L_BASIC_INSERTS: Record<string, string[]> = {
  'FR': [
    "R U R'",
    "R U' R'",
    "R U2 R'",
    "U R U' R'",
    "U' R U R'",
    "U2 R U2 R'",
  ],
  'FL': [
    "L' U' L",
    "L' U L",
    "L' U2 L",
    "U' L' U L",
    "U L' U' L",
    "U2 L' U2 L",
  ],
  'BL': [
    "L U L'",
    "L U' L'",
    "L U2 L'",
    "U' L U L'",
    "U L U' L'",
  ],
  'BR': [
    "R' U' R",
    "R' U R",
    "R' U2 R",
    "U R' U' R",
    "U' R' U R",
  ],
}

const U_MOVES = ['', 'U', "U'", 'U2']

function isSlotSolved(state: CubeState, slot: 'FR' | 'FL' | 'BL' | 'BR'): boolean {
  const analysis = analyzeF2LSlot(state, slot)
  return analysis.solved
}

function checkCrossIntact(state: CubeState): boolean {
  const s = state.asString()
  // Check D face center edges AND side face colors
  // DF: D[1]=28, F[7]=25 should be D,F
  // DL: D[3]=30, L[7]=43 should be D,L
  // DB: D[7]=34, B[7]=52 should be D,B
  // DR: D[5]=32, R[7]=16 should be D,R
  return s[28] === 'D' && s[25] === 'F' &&  // DF
         s[30] === 'D' && s[43] === 'L' &&  // DL
         s[34] === 'D' && s[52] === 'B' &&  // DB
         s[32] === 'D' && s[16] === 'R'      // DR
}

export function solveF2LHeuristic(state: CubeState): {
  success: boolean
  solution: string
  steps: number
  slots: { slot: string; solution: string; solved: boolean }[]
} {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  let currentState = state
  const results: { slot: string; solution: string; solved: boolean }[] = []
  const fullSolution: string[] = []

  for (const slot of slots) {
    // Check if already solved
    if (isSlotSolved(currentState, slot)) {
      results.push({ slot, solution: '', solved: true })
      continue
    }

    // Try basic inserts with U adjustments
    let found = false
    const inserts = F2L_BASIC_INSERTS[slot]

    for (const uMove of U_MOVES) {
      if (found) break

      const testState = uMove ? currentState.move(uMove) : currentState

      for (const insert of inserts) {
        const afterInsert = testState.move(insert)

        if (!checkCrossIntact(afterInsert)) continue
        if (!isSlotSolved(afterInsert, slot)) continue

        // Found working insert
        const fullMove = uMove ? `${uMove} ${insert}`.trim() : insert
        fullSolution.push(fullMove)
        currentState = afterInsert
        results.push({ slot, solution: fullMove, solved: true })
        found = true
        break
      }
    }

    if (!found) {
      // Try simple pair up and insert
      const simpleMoves = trySimplePairUp(currentState, slot)
      if (simpleMoves) {
        currentState = currentState.move(simpleMoves)
        fullSolution.push(simpleMoves)
        results.push({ slot, solution: simpleMoves, solved: isSlotSolved(currentState, slot) })
        found = true
      }
    }

    if (!found) {
      results.push({ slot, solution: '', solved: false })
    }
  }

  const allSolved = results.every(r => r.solved)
  const solution = fullSolution.join(' ')
  const steps = solution.split(' ').filter(m => m).length

  return {
    success: allSolved,
    solution,
    steps,
    slots: results,
  }
}

/**
 * 尝试简单的配对+插入序列
 */
function trySimplePairUp(state: CubeState, slot: string): string | null {
  // Common F2L pair up sequences
  const sequences: string[] = [
    "U R U' R'",
    "U' R U R'",
    "y U L' U' L",
    "y U' L' U L",
    "R U R' U'",
    "R U' R' U",
  ]

  for (const seq of sequences) {
    const after = state.move(seq)
    if (isSlotSolved(after, slot as any) && checkCrossIntact(after)) {
      return seq
    }
  }

  return null
}
