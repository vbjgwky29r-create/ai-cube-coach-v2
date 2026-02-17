/**
 * CFOP 求解器 v6 - 基于公式的完整求解
 *
 * 架构：
 * 1. Cross: DFS 搜索求解 ✅
 * 2. F2L: 状态识别 + 公式库
 * 3. OLL: 模式识别 + 公式库
 * 4. PLL: 排列识别 + 公式库
 *
 * 这个版本"教会"系统使用CFOP公式，就像人类玩家学习一样
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  isSolved,
  isCrossComplete,
  findEdgeById,
  findCornerById,
  type CubeState,
} from './cube-state-v3.js'

import { solveCross as solveCrossDFS } from './cfop-solver-v4.js'
import { solveF2LWithProtection } from './f2l-solver-constrained.js'
import { analyzeF2LSituation } from './f2l-recognizer.js'
import { isF2LSlotComplete } from './f2l-formulas.js'
import { solveOLLStepwise } from './oll-solver-stepwise.js'
import { solvePLLSmart } from './pll-solver.js'
import { getPLLInfo, recognizePLLPrecise } from './pll-recognizer.js'

// ============================================================
// 类型定义
// ============================================================

export interface CFOPv6Solution {
  cross: {
    moves: string
    steps: number
    verified: boolean
  }
  f2l: {
    slots: Array<{
      slot: string
      moves: string
      steps: number
      verified: boolean
    }>
    totalSteps: number
    verified: boolean
  }
  oll: {
    caseId: string
    name: string
    moves: string
    steps: number
    verified: boolean
  }
  pll: {
    caseId: string
    name: string
    moves: string
    steps: number
    verified: boolean
  }
  fullSolution: string
  totalSteps: number
  verified: boolean
}

// ============================================================
// 阶段求解器
// ============================================================

/**
 * Cross 阶段求解
 */
function solveCrossPhase(state: CubeState): { moves: string; steps: number; verified: boolean } {
  if (isCrossComplete(state)) {
    return { moves: '', steps: 0, verified: true }
  }

  const moves = solveCrossDFS(state, 8)
  const steps = moves.split(' ').filter(m => m).length

  const afterCross = applyMoves(state, moves)
  const verified = isCrossComplete(afterCross)

  return { moves, steps, verified }
}

/**
 * F2L 阶段求解 (使用带U层保护的BFS搜索)
 */
function solveF2LPhase(state: CubeState): {
  slots: Array<{ slot: string; moves: string; steps: number; verified: boolean }>
  totalSteps: number
  verified: boolean
} {
  console.log('  使用带约束的 BFS 搜索 F2L 解法...')

  const result = solveF2LWithProtection(state, 12)

  // 构建输出格式
  const slots: Array<{ slot: string; moves: string; steps: number; verified: boolean }> = []

  // 由于新求解器不返回每个槽��的详细信息，我们只返回总体信息
  for (let i = 0; i < 4; i++) {
    slots.push({
      slot: ['FR', 'FL', 'BL', 'BR'][i],
      moves: '<protected>',
      steps: result.steps / 4,
      verified: result.allComplete,
    })
  }

  return {
    slots,
    totalSteps: result.steps,
    verified: result.allComplete && result.uLayerComplete,
  }
}

/**
 * OLL 阶段求解 (使用单步搜索 + 迭代)
 */
function solveOLLPhase(state: CubeState): {
  caseId: string
  name: string
  moves: string
  steps: number
  verified: boolean
} {
  // 迭代搜索，每次尝试达到更好的状态
  let currentState = state
  const allMoves: string[] = []
  let iterations = 0
  const maxIterations = 5

  while (iterations < maxIterations) {
    iterations++
    const result = solveOLLStepwise(currentState, 10)

    if (result.verified) {
      allMoves.push(result.moves)
      return {
        caseId: 'OLL_STEPWISE',
        name: `单步搜索OLL (${iterations}次迭代)`,
        moves: allMoves.join(' '),
        steps: allMoves.join(' ').split(' ').filter(m => m).length,
        verified: true,
      }
    }

    if (result.moves && result.moves.trim()) {
      allMoves.push(result.moves)
      currentState = applyMoves(currentState, result.moves)

      // 如果评分达到7/8，尝试U层调整后再搜索
      if (result.finalScore >= 7 && !result.verified) {
        console.log(`  [OLL 迭代${iterations}] 评分${result.finalScore}/8，尝试U层调整...`)

        // 尝试 U, U', U2 调整后继续搜索
        for (const uAdjust of ['U', "U'", 'U2']) {
          const adjustedState = applyMove(currentState, uAdjust)
          const nextResult = solveOLLStepwise(adjustedState, 8)

          if (nextResult.verified) {
            allMoves.push(uAdjust, nextResult.moves)
            return {
              caseId: 'OLL_STEPWISE',
              name: `单步搜索OLL (${iterations}次迭代)`,
              moves: allMoves.join(' '),
              steps: allMoves.join(' ').split(' ').filter(m => m).length,
              verified: true,
            }
          }
        }

        console.log(`  [OLL 迭代${iterations}] U调整未成功，继续搜索...`)
      }
    } else {
      // 没有进展，尝试U调整
      if (iterations === 1) {
        for (const uAdjust of ['U', "U'", 'U2']) {
          const adjustedState = applyMove(currentState, uAdjust)
          const nextResult = solveOLLStepwise(adjustedState, 10)

          if (nextResult.verified) {
            allMoves.push(uAdjust, nextResult.moves)
            return {
              caseId: 'OLL_STEPWISE',
              name: `单步搜索OLL (${iterations}次迭代)`,
              moves: allMoves.join(' '),
              steps: allMoves.join(' ').split(' ').filter(m => m).length,
              verified: true,
            }
          }
        }
      }
      break
    }
  }

  const movesStr = allMoves.join(' ')
  const steps = movesStr ? movesStr.split(' ').filter(m => m).length : 0

  return {
    caseId: 'OLL_STEPWISE',
    name: `单步搜索OLL (${iterations}次迭代)`,
    moves: movesStr,
    steps: steps,
    verified: false,
  }
}

/**
 * PLL 阶段求解（使用智能公式迭代）
 */
function solvePLLPhase(state: CubeState): {
  caseId: string
  name: string
  moves: string
  steps: number
  verified: boolean
} {
  const result = solvePLLSmart(state)

  return {
    caseId: result.caseId,
    name: result.name,
    moves: result.moves,
    steps: result.steps,
    verified: result.verified,
  }
}

// ============================================================
// 辅助验证函数
// ============================================================

/**
 * 检查顶层是否朝向正确（用于OLL验证）
 */
function checkTopOriented(state: CubeState): boolean {
  // 检查顶层4个棱块的朝向
  const uEdges = ['UF', 'UL', 'UB', 'UR']
  let orientedCount = 0

  for (const edgeId of uEdges) {
    const edge = findEdgeById(state, edgeId)
    if (edge && edge.position.y === 1 && edge.orientation === 0) {
      orientedCount++
    }
  }

  return orientedCount === 4
}

// ============================================================
// 主求解函数
// ============================================================

/**
 * 完整 CFOP v6 求解
 * 教会系统使用CFOP公式求解魔方
 */
export function solveCFOPv6(scramble: string): CFOPv6Solution {
  console.log(`[CFOP v6] 开始求解: ${scramble}`)
  console.log('---')

  const state = createSolvedCube()
  const scrambled = applyMoves(state, scramble)
  let currentState = scrambled

  const solution: string[] = []

  // 1. Cross
  console.log('[1/4] Cross 阶段...')
  const crossResult = solveCrossPhase(currentState)
  solution.push(crossResult.moves)
  currentState = applyMoves(currentState, crossResult.moves)
  console.log(`  解法: ${crossResult.moves || '(已完成)'} (${crossResult.steps}步)`)
  console.log(`  验证: ${crossResult.verified ? '✓' : '✗'}`)

  // 2. F2L
  console.log('[2/4] F2L 阶段...')
  const f2lResult = solveF2LPhase(currentState)
  const f2lMoves = f2lResult.slots.map(s => s.moves).filter(m => m).join(' ')
  solution.push(f2lMoves)
  currentState = applyMoves(currentState, f2lMoves)
  console.log(`  总步数: ${f2lResult.totalSteps}`)
  console.log(`  验证: ${f2lResult.verified ? '✓' : '✗'}`)

  // 3. OLL
  console.log('[3/4] OLL 阶段...')
  const ollResult = solveOLLPhase(currentState)
  solution.push(ollResult.moves)
  currentState = applyMoves(currentState, ollResult.moves)
  console.log(`  情况: ${ollResult.name}`)
  console.log(`  步数: ${ollResult.steps}`)
  console.log(`  验证: ${ollResult.verified ? '✓' : '✗'}`)

  // 4. PLL
  console.log('[4/4] PLL 阶段...')
  const pllResult = solvePLLPhase(currentState)
  solution.push(pllResult.moves)
  currentState = applyMoves(currentState, pllResult.moves)
  console.log(`  情况: ${pllResult.name}`)
  console.log(`  步数: ${pllResult.steps}`)
  console.log(`  验证: ${pllResult.verified ? '✓' : '✗'}`)

  // 组合完整解法
  const fullSolution = solution.filter(s => s).join(' ')
  const totalSteps = fullSolution.split(' ').filter(s => s).length

  // 最终验证
  const testState = createSolvedCube()
  const afterScramble = applyMoves(testState, scramble)
  const afterSolution = applyMoves(afterScramble, fullSolution)
  const verified = isSolved(afterSolution)

  console.log('---')
  console.log(`[结果] 总步数: ${totalSteps}`)
  console.log(`[结果] 最终验证: ${verified ? '✓ 完全还原!' : '✗ 未完成'}`)

  return {
    cross: crossResult,
    f2l: f2lResult,
    oll: ollResult,
    pll: pllResult,
    fullSolution,
    totalSteps,
    verified,
  }
}

/**
 * 快速求解 - 仅 Cross + F2L（用于测试）
 */
export function solveCrossF2L(scramble: string): CFOPv6Solution {
  console.log(`[CFOP v6] Cross + F2L 求解: ${scramble}`)

  const state = createSolvedCube()
  const scrambled = applyMoves(state, scramble)
  let currentState = scrambled

  const solution: string[] = []

  // Cross
  const crossResult = solveCrossPhase(currentState)
  solution.push(crossResult.moves)
  currentState = applyMoves(currentState, crossResult.moves)

  // F2L
  const f2lResult = solveF2LPhase(currentState)
  const f2lMoves = f2lResult.slots.map(s => s.moves).filter(m => m).join(' ')
  solution.push(f2lMoves)
  currentState = applyMoves(currentState, f2lMoves)

  const fullSolution = solution.filter(s => s).join(' ')
  const totalSteps = fullSolution.split(' ').filter(s => s).length

  // 验证 Cross + F2L
  const testState = createSolvedCube()
  const afterScramble = applyMoves(testState, scramble)
  const afterSolution = applyMoves(afterScramble, fullSolution)

  // 检查 Cross 是否完成
  const crossVerified = isCrossComplete(afterSolution)

  return {
    cross: crossResult,
    f2l: f2lResult,
    oll: { caseId: '', name: '', moves: '', steps: 0, verified: false },
    pll: { caseId: '', name: '', moves: '', steps: 0, verified: false },
    fullSolution,
    totalSteps,
    verified: crossVerified && f2lResult.verified,
  }
}

// ============================================================
// 测试工具
// ============================================================

/**
 * 测试指定槽位的F2L情况识别
 */
export function testF2LRecognition(scramble: string, slot: 'FR' | 'FL' | 'BL' | 'BR') {
  const state = createSolvedCube()
  const scrambled = applyMoves(state, scramble)

  const situation = analyzeF2LSituation(scrambled, slot)

  console.log(`F2L Slot: ${slot}`)
  console.log(`  角块: ${situation.corner.id} @ ${situation.corner.location} (朝向${situation.corner.orientation})`)
  console.log(`  棱块: ${situation.edge.id} @ ${situation.edge.location} (朝向${situation.edge.orientation})`)
  console.log(`  情况类型: ${situation.caseType}`)

  return situation
}
