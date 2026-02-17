/**
 * CFOP 求解器 v4 - 纯坐标系统
 *
 * 完全基于 cube-state-v3 的坐标追踪
 * 不依赖外部库，确保兼容性
 *
 * 策略：
 * 1. Cross：DFS 搜索
 * 2. Corners：逐个归位
 * 3. Edges：逐个归位
 * 4. 最终验证
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  isSolved,
  isCrossComplete,
  findCornerById,
  findEdgeById,
  type CubeState,
} from './cube-state-v3.js'

// ============================================================
// 类型定义
// ============================================================

export interface CFOPSolution {
  cross: string
  f2l: string
  oll: string
  pll: string
  fullSolution: string
  totalSteps: number
  verified: boolean
}

// ============================================================
// 移动集合
// ============================================================

const ALL_MOVES = ['U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'L', "L'", 'L2', 'R', "R'", 'R2'] as const

// 不影响 Cross 的移动（用于 F2L/OLL/PLL）
const CROSS_SAFE_MOVES = ['U', "U'", 'U2'] as const

// ============================================================
// Cross 求解器
// ============================================================

const CROSS_MOVES = ['F', "F'", 'F2', 'B', "B'", 'B2', 'L', "L'", 'L2', 'R', "R'", 'R2', 'D', "D'", 'D2']

export function solveCross(state: CubeState, maxDepth: number = 8): string {
  if (isCrossComplete(state)) {
    return ''
  }

  const result = dfsCross(state, maxDepth, [])
  return result ? result.join(' ') : ''
}

function dfsCross(state: CubeState, depth: number, path: string[]): string[] | null {
  if (isCrossComplete(state)) {
    return path
  }

  if (depth === 0) {
    return null
  }

  for (const move of CROSS_MOVES) {
    // 剪枝：避免同一面连续移动
    if (path.length > 0 && path[path.length - 1][0] === move[0]) continue

    // 剪枝：避免对面连续移动
    if (path.length > 0) {
      const lastFace = path[path.length - 1][0]
      const currentFace = move[0]
      const opposites: Record<string, string> = { F: 'B', B: 'F', L: 'R', R: 'L', U: 'D', D: 'U' }
      if (opposites[lastFace] === currentFace) continue
    }

    const newState = applyMove(state, move)
    const result = dfsCross(newState, depth - 1, [...path, move])
    if (result) {
      return result
    }
  }

  return null
}

// ============================================================
// 角块归位求解器
// ============================================================

/**
 * 检查所有角块是否归位
 */
function areCornersSolved(state: CubeState): boolean {
  const solved = createSolvedCube()
  for (const solvedCorner of solved.corners) {
    const corner = findCornerById(state, solvedCorner.id)
    if (!corner) return false
    if (corner.position.x !== solvedCorner.position.x) return false
    if (corner.position.y !== solvedCorner.position.y) return false
    if (corner.position.z !== solvedCorner.position.z) return false
    if (corner.orientation !== solvedCorner.orientation) return false
  }
  return true
}

/**
 * 求解角块（简化版：逐个归位）
 */
export function solveCorners(state: CubeState, maxDepth: number = 6): string {
  if (areCornersSolved(state)) {
    return ''
  }

  // 尝试找到可以归位一个角块的移动序列
  for (const move of ALL_MOVES) {
    const newState = applyMove(state, move)
    // 检查是否有更多角块归位
    const beforeCount = countSolvedCorners(state)
    const afterCount = countSolvedCorners(newState)

    if (afterCount > beforeCount) {
      // 递归求解剩余角块
      const remaining = solveCorners(newState, maxDepth - 1)
      if (remaining !== null) {
        return move + (remaining ? ' ' + remaining : '')
      }
    }
  }

  // 如果无法改进，尝试 BFS 搜索
  return bfsSolveCorners(state, maxDepth)
}

function countSolvedCorners(state: CubeState): number {
  const solved = createSolvedCube()
  let count = 0
  for (const solvedCorner of solved.corners) {
    const corner = findCornerById(state, solvedCorner.id)
    if (corner &&
        corner.position.x === solvedCorner.position.x &&
        corner.position.y === solvedCorner.position.y &&
        corner.position.z === solvedCorner.position.z &&
        corner.orientation === solvedCorner.orientation) {
      count++
    }
  }
  return count
}

function bfsSolveCorners(state: CubeState, maxDepth: number): string {
  if (areCornersSolved(state)) return ''

  // 简化 BFS：找到第一个能增加已解决角块数量的移动
  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = bfsCornersHelper(state, depth, [])
    if (result) {
      return result.join(' ')
    }
  }

  return '' // 失败
}

function bfsCornersHelper(state: CubeState, depth: number, path: string[]): string[] | null {
  if (areCornersSolved(state)) {
    return path
  }

  if (depth === 0) {
    return null
  }

  for (const move of ALL_MOVES) {
    // 剪枝
    if (path.length > 0 && path[path.length - 1][0] === move[0]) continue

    const newState = applyMove(state, move)
    const result = bfsCornersHelper(newState, depth - 1, [...path, move])
    if (result) {
      return result
    }
  }

  return null
}

// ============================================================
// 棱块归位求解器
// ============================================================

/**
 * 检查所有棱块是否归位
 */
function areEdgesSolved(state: CubeState): boolean {
  const solved = createSolvedCube()
  for (const solvedEdge of solved.edges) {
    const edge = findEdgeById(state, solvedEdge.id)
    if (!edge) return false
    if (edge.position.x !== solvedEdge.position.x) return false
    if (edge.position.y !== solvedEdge.position.y) return false
    if (edge.position.z !== solvedEdge.position.z) return false
    if (edge.orientation !== solvedEdge.orientation) return false
  }
  return true
}

/**
 * 求解棱块
 */
export function solveEdges(state: CubeState, maxDepth: number = 6): string {
  if (areEdgesSolved(state)) {
    return ''
  }

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = bfsEdgesHelper(state, depth, [])
    if (result) {
      return result.join(' ')
    }
  }

  return ''
}

function bfsEdgesHelper(state: CubeState, depth: number, path: string[]): string[] | null {
  if (areEdgesSolved(state)) {
    return path
  }

  if (depth === 0) {
    return null
  }

  for (const move of ALL_MOVES) {
    // 剪枝
    if (path.length > 0 && path[path.length - 1][0] === move[0]) continue

    const newState = applyMove(state, move)
    const result = bfsEdgesHelper(newState, depth - 1, [...path, move])
    if (result) {
      return result
    }
  }

  return null
}

// ============================================================
// 主求解函数（简化 CFOP）
// ============================================================

/**
 * 简化 CFOP 求解
 *
 * 阶段：
 * 1. Cross - 使用 DFS
 * 2. Corners - 使用 BFS 归位角块
 * 3. Edges - 使用 BFS 归位棱块
 *
 * 注意：这不是标准 CFOP，而是一种分层求解方法
 */
export function solveSimpleCFOP(scramble: string): CFOPSolution {
  console.log(`[CFOP v4] 开始求解: ${scramble}`)

  const state = createSolvedCube()
  const scrambled = applyMoves(state, scramble)

  let currentState = scrambled
  const solution: string[] = []

  // 1. Cross
  console.log('[CFOP v4] 求解 Cross...')
  const cross = solveCross(currentState, 8)
  solution.push(cross)
  currentState = applyMoves(currentState, cross)
  console.log(`[CFOP v4] Cross: ${cross || '(已完成)'} (${isCrossComplete(currentState) ? '✓' : '✗'})`)

  // 2. Corners
  console.log('[CFOP v4] 求解角块...')
  const corners = solveCorners(currentState, 6)
  solution.push(corners)
  currentState = applyMoves(currentState, corners)
  console.log(`[CFOP v4] 角块: ${corners || '(已完成)'} (${areCornersSolved(currentState) ? '✓' : '✗'})`)

  // 3. Edges
  console.log('[CFOP v4] 求解棱块...')
  const edges = solveEdges(currentState, 6)
  solution.push(edges)
  currentState = applyMoves(currentState, edges)
  console.log(`[CFOP v4] 棱块: ${edges || '(已完成)'} (${areEdgesSolved(currentState) ? '✓' : '✗'})`)

  const fullSolution = solution.filter(s => s).join(' ')
  const totalSteps = fullSolution.split(' ').filter(s => s).length

  // 验证
  const testState = createSolvedCube()
  const afterScramble = applyMoves(testState, scramble)
  const afterSolution = applyMoves(afterScramble, fullSolution)
  const verified = isSolved(afterSolution)

  console.log(`[CFOP v4] 验证: ${verified ? '✓ 成功' : '✗ 失败'}`)

  return {
    cross,
    f2l: corners,
    oll: '',
    pll: edges,
    fullSolution,
    totalSteps,
    verified,
  }
}

/**
 * 降级求解器：逐层求解
 * 使用更大的搜索深度
 */
export function solveLayerByLayer(scramble: string, maxDepth: number = 10): CFOPSolution {
  console.log(`[Layer-by-Layer] 求解: ${scramble}`)

  const state = createSolvedCube()
  const scrambled = applyMoves(state, scramble)

  // 直接搜索完整解法
  console.log(`[Layer-by-Layer] 搜索解法 (最大深度 ${maxDepth})...`)

  for (let depth = 1; depth <= maxDepth; depth++) {
    console.log(`[Layer-by-Layer] 尝试深度 ${depth}...`)
    const result = bfsSolve(scrambled, depth, [])
    if (result) {
      const solution = result.join(' ')
      // 验证
      const testState = createSolvedCube()
      const afterScramble = applyMoves(testState, scramble)
      const afterSolution = applyMoves(afterScramble, solution)
      const verified = isSolved(afterSolution)

      console.log(`[Layer-by-Layer] 找到解法: ${solution}`)
      console.log(`[Layer-by-Layer] 验证: ${verified ? '✓' : '✗'}`)

      return {
        cross: '',
        f2l: '',
        oll: '',
        pll: '',
        fullSolution: solution,
        totalSteps: depth,
        verified,
      }
    }
  }

  console.log('[Layer-by-Layer] 未找到解法')

  return {
    cross: '',
    f2l: '',
    oll: '',
    pll: '',
    fullSolution: '',
    totalSteps: 0,
    verified: false,
  }
}

function bfsSolve(state: CubeState, depth: number, path: string[]): string[] | null {
  if (isSolved(state)) {
    return path
  }

  if (depth === 0) {
    return null
  }

  for (const move of ALL_MOVES) {
    // 剪枝
    if (path.length > 0 && path[path.length - 1][0] === move[0]) continue

    // 剪枝：避免对面连续移动
    if (path.length > 0) {
      const lastFace = path[path.length - 1][0]
      const currentFace = move[0]
      const opposites: Record<string, string> = { F: 'B', B: 'F', L: 'R', R: 'L', U: 'D', D: 'U' }
      if (opposites[lastFace] === currentFace) continue
    }

    const newState = applyMove(state, move)
    const result = bfsSolve(newState, depth - 1, [...path, move])
    if (result) {
      return result
    }
  }

  return null
}
