/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * PLL 求解器 - 基于公式的完整求解
 *
 * 核心原理：
 * 1. PLL公式只改变U层块的位置，不改变朝向
 * 2. 可能需要U层调整（U, U', U2）才能使公式生效
 * 3. 使用迭代尝试来找到正确的解法
 *
 * 参考：CUBE_KNOWLEDGE.md - PLL的21种情况
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  isSolved,
  type CubeState,
} from './cube-state-v3'

import { ALL_PLL_CASES, type PLLCase } from './pll-formulas'
import { analyzeULayerPermutation } from './pll-recognizer'

// ============================================================
// PLL 求解器
// ============================================================

export interface PLLSolution {
  caseId: string
  name: string
  moves: string
  steps: number
  verified: boolean
  iterations: number
}

/**
 * PLL 阶段求解
 *
 * 方法：
 * 1. 尝试每个PLL公式（配合U调整）
 * 2. 验证是否还原
 * 3. 如果未还原，继续尝试下一个公式
 */
export function solvePLL(
  state: CubeState,
  maxAttempts: number = 50
): PLLSolution {
  console.log('  [PLL] 开始公式迭代搜索...')

  const U_ADJUSTMENTS = ['', 'U', "U'", 'U2']
  const attempts: { formula: string; uAdj: string; result: string }[] = []

  let bestScore = 0
  let bestSolution: PLLSolution | null = null

  // 获取当前状态的评分
  const getScore = (s: CubeState): number => {
    const perm = analyzeULayerPermutation(s)
    return perm.edgesCorrect + perm.cornersCorrect
  }

  const initialScore = getScore(state)
  console.log(`  [PLL] 初始状态: ${initialScore}/8 块正确`)

  // 尝试每个 PLL 公式
  for (const pllCase of ALL_PLL_CASES) {
    for (const uAdj of U_ADJUSTMENTS) {
      // 构建完整公式
      let fullFormula = pllCase.algorithm
      if (uAdj) {
        fullFormula = `${uAdj} ${fullFormula}`
      }

      // 应用公式
      const testState = applyMoves(state, fullFormula)
      const score = getScore(testState)
      const solved = isSolved(testState)

      // 记录尝试
      attempts.push({
        formula: pllCase.id,
        uAdj,
        result: solved ? 'SOLVED' : `${score}/8`,
      })

      // 更新最佳解
      if (solved) {
        console.log(`  [PLL] ✓ 找到解法: ${pllCase.name} ${uAdj ? `(${uAdj}调整)` : ''}`)
        return {
          caseId: pllCase.id,
          name: pllCase.name,
          moves: fullFormula,
          steps: fullFormula.split(' ').filter(m => m).length,
          verified: true,
          iterations: attempts.length,
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestSolution = {
          caseId: pllCase.id,
          name: pllCase.name,
          moves: fullFormula,
          steps: fullFormula.split(' ').filter(m => m).length,
          verified: false,
          iterations: attempts.length,
        }
      }
    }
  }

  // 如果没有找到完美解，返回最佳解
  if (bestSolution) {
    console.log(`  [PLL] 未找到完美解，返回最佳解: ${bestSolution.name} (${bestScore}/8)`)
  } else {
    console.log(`  [PLL] 未找到任何解`)
  }

  return bestSolution || {
    caseId: 'PLL_UNKNOWN',
    name: 'Unknown',
    moves: '',
    steps: 0,
    verified: false,
    iterations: 0,
  }
}

/**
 * 迭代 PLL 求解
 *
 * 当单个PLL公式无法完全还原时，使用多个PLL公式
 */
export function solvePLLIterative(
  state: CubeState,
  maxIterations: number = 5
): PLLSolution {
  console.log('  [PLL] 开始迭代求解...')

  let currentState = state
  const allMoves: string[] = []
  let iterations = 0

  while (iterations < maxIterations) {
    iterations++

    const result = solvePLL(currentState, 21 * 4) // 尝试所有21种PLL × 4种U调整

    if (result.verified) {
      allMoves.push(result.moves)
      return {
        caseId: result.caseId,
        name: `PLL迭代 (${iterations}次)`,
        moves: allMoves.join(' '),
        steps: allMoves.join(' ').split(' ').filter(m => m).length,
        verified: true,
        iterations,
      }
    }

    if (result.moves && result.steps > 0) {
      allMoves.push(result.moves)
      currentState = applyMoves(currentState, result.moves)

      const score = getScore(currentState)
      console.log(`  [PLL] 迭代${iterations}: 使用${result.name}, 当前${score}/8`)

      if (score === 8) {
        return {
          caseId: result.caseId,
          name: `PLL迭代 (${iterations}次)`,
          moves: allMoves.join(' '),
          steps: allMoves.join(' ').split(' ').filter(m => m).length,
          verified: true,
          iterations,
        }
      }
    } else {
      break
    }
  }

  const movesStr = allMoves.join(' ')
  return {
    caseId: 'PLL_ITERATIVE',
    name: `PLL迭代 (${iterations}次)`,
    moves: movesStr,
    steps: movesStr ? movesStr.split(' ').filter(m => m).length : 0,
    verified: isSolved(currentState),
    iterations,
  }
}

function getScore(state: CubeState): number {
  const perm = analyzeULayerPermutation(state)
  return perm.edgesCorrect + perm.cornersCorrect
}

/**
 * 智能PLL求解
 *
 * 先尝试单次PLL，如果失败则迭代
 */
export function solvePLLSmart(state: CubeState): PLLSolution {
  // 先尝试单次PLL
  const singleResult = solvePLL(state)

  if (singleResult.verified) {
    return singleResult
  }

  // 如果单次失败，尝试迭代
  console.log('  [PLL] 单次求解未成功，尝试迭代...')
  return solvePLLIterative(state)
}

// ============================================================
// PLL 模式分析（用于调试）
// ============================================================

export function analyzePLLState(state: CubeState): {
  edgesCorrect: number
  cornersCorrect: number
  edgesPattern: string
  cornersPattern: string
  recommendation: string
} {
  const perm = analyzeULayerPermutation(state)

  // 分析棱块模式
  let edgesPattern = ''
  if (perm.edgesCorrect === 4) {
    edgesPattern = '全部正确'
  } else if (perm.edgesCorrect === 0) {
    edgesPattern = '全部错位'
  } else {
    edgesPattern = `${perm.edgesCorrect}/4 正确`
  }

  // 分析角块模式
  let cornersPattern = ''
  if (perm.cornersCorrect === 4) {
    cornersPattern = '全部正确'
  } else if (perm.cornersCorrect === 0) {
    cornersPattern = '全部错位'
  } else {
    cornersPattern = `${perm.cornersCorrect}/4 正确`
  }

  // 推荐
  let recommendation = ''
  if (perm.edgesCorrect === 4 && perm.cornersCorrect === 4) {
    recommendation = '已还原'
  } else if (perm.edgesCorrect === 4 && perm.cornersCorrect < 4) {
    recommendation = '只换角: A-Perm 系列'
  } else if (perm.cornersCorrect === 4 && perm.edgesCorrect < 4) {
    recommendation = '只换棱: U-Perm, H-Perm, Z-Perm'
  } else {
    recommendation = '角棱都换: T-Perm, Y-Perm, J-Perm, F-Perm, R-Perm, N-Perm, V-Perm, G-Perm'
  }

  return {
    edgesCorrect: perm.edgesCorrect,
    cornersCorrect: perm.cornersCorrect,
    edgesPattern,
    cornersPattern,
    recommendation,
  }
}

