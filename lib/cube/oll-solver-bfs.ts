/**
 * OLL BFS 求解器
 *
 * 使用广度优先搜索找到OLL解法
 * 目标：顶面全部朝向正确（4棱块+4角块）
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  type CubeState,
} from './cube-state-v3'

import { analyzeUFaceOrientation } from './oll-recognizer'

// OLL 公式库（常用公式）
const OLL_ALGORITHMS = [
  "R U R' U R U2 R'",           // Sune
  "R U2 R' U' R U' R'",         // Anti-Sune
  "F R U R' U' F'",             // Line
  "R U R' U R U' R' U R U2 R'", // Headlights
  "r U R' U' r' F R F'",        // T-Perm for corners
  "R' F R F' R U R' U' R U R'", // Pi variant
  "F R U R' U' F' U R U R'",    // Cross variant
  "R U R' U' R' F R F'",        // Another variant
  "U R U R' U R U2 R'",         // Sune with U setup
  "U' R U2 R' U R U' R'",       // Anti-Sune with U setup
]

interface SearchNode {
  state: CubeState
  moves: string
  depth: number
  score: number  // 朝向块的数量
}

/**
 * 使用 BFS 搜索求解 OLL
 *
 * @param state 当前魔方状态
 * @param maxDepth 最大搜索深度
 * @returns OLL解法
 */
export function solveOLLBFS(
  state: CubeState,
  maxDepth: number = 12
): { moves: string; steps: number; verified: boolean } {
  console.log('  [OLL BFS] 搜索OOLL解法...')

  const initialOrientation = analyzeUFaceOrientation(state)
  const initialScore = initialOrientation.orientedEdges + initialOrientation.orientedCorners

  console.log(`  [OLL BFS] 初始状态: ${initialOrientation.orientedEdges}棱/${initialOrientation.orientedCorners}角 (总分${initialScore})`)

  // 检查是否已完成
  if (initialOrientation.orientedEdges === 4 && initialOrientation.orientedCorners === 4) {
    return { moves: '', steps: 0, verified: true }
  }

  // BFS 搜索
  const queue: SearchNode[] = [{ state, moves: '', depth: 0, score: initialScore }]
  const visited = new Set<string>()

  // 用于避免重复访问的哈希（只追踪U层朝向状态）
  const getOrientationHash = (s: CubeState): string => {
    const o = analyzeUFaceOrientation(s)
    return `${o.orientedEdges}_${o.orientedCorners}`
  }

  visited.add(getOrientationHash(state))

  let bestNode = { state, moves: '', depth: 0, score: initialScore }

  while (queue.length > 0) {
    const current = queue.shift()!

    // 检查是否达到深度限制
    if (current.depth >= maxDepth) {
      continue
    }

    // 尝试每个OLL算法
    for (const algo of OLL_ALGORITHMS) {
      // 应用完整算法
      const newState = applyMoves(current.state, algo)
      const orientation = analyzeUFaceOrientation(newState)
      const newScore = orientation.orientedEdges + orientation.orientedCorners

      // 检查是否完成
      if (orientation.orientedEdges === 4 && orientation.orientedCorners === 4) {
        const newMoves = current.moves ? `${current.moves} ${algo}` : algo
        const steps = newMoves.split(' ').filter(m => m).length
        console.log(`  [OLL BFS] 找到解法! (${steps}步)`)
        return {
          moves: newMoves,
          steps,
          verified: true,
        }
      }

      const orientationHash = `${orientation.orientedEdges}_${orientation.orientedCorners}`

      // 只保留有进展的节点
      if (newScore > current.score && !visited.has(orientationHash)) {
        visited.add(orientationHash)
        const newMoves = current.moves ? `${current.moves} ${algo}` : algo

        queue.push({
          state: newState,
          moves: newMoves,
          depth: current.depth + 1,
          score: newScore,
        })

        // 更新最佳节点
        if (newScore > bestNode.score) {
          bestNode = {
            state: newState,
            moves: newMoves,
            depth: current.depth + 1,
            score: newScore,
          }
        }
      }
    }
  }

  // 没有找到完整解法，返回最佳部分解
  const bestOrientation = analyzeUFaceOrientation(bestNode.state)
  console.log(`  [OLL BFS] 未找到完整解，最佳: ${bestOrientation.orientedEdges}棱/${bestOrientation.orientedCorners}角`)

  return {
    moves: bestNode.moves,
    steps: bestNode.moves.split(' ').filter(m => m).length,
    verified: bestOrientation.orientedEdges === 4 && bestOrientation.orientedCorners === 4,
  }
}

/**
 * 两步 OLL - 先做十字，再做角块
 */
export function solveOLLTwoStep(
  state: CubeState
): { moves: string; steps: number; verified: boolean } {
  console.log('  [OLL 两步] 使用两步OLL策略...')

  const orientation = analyzeUFaceOrientation(state)
  console.log(`  [OLL 两步] 初始: ${orientation.orientedEdges}棱/${orientation.orientedCorners}角`)

  // 步骤1: 形成十字（4个棱块朝向）
  let currentState = state
  let allMoves: string[] = []

  if (orientation.orientedEdges < 4) {
    // 尝试形成十字
    const crossResult = solveOLLBFS(state, 8)
    if (crossResult.moves) {
      allMoves.push(crossResult.moves)
      currentState = applyMoves(state, crossResult.moves)

      const afterCross = analyzeUFaceOrientation(currentState)
      console.log(`  [OLL 两步] 十字后: ${afterCross.orientedEdges}棱/${afterCross.orientedCorners}角`)
    }
  }

  // 步骤2: 朝向角块
  if (!isOLLDone(currentState)) {
    const cornerResult = solveOLLBFS(currentState, 8)
    if (cornerResult.moves) {
      allMoves.push(cornerResult.moves)
      currentState = applyMoves(currentState, cornerResult.moves)
    }
  }

  const finalOrientation = analyzeUFaceOrientation(currentState)
  const verified = isOLLDone(currentState)

  console.log(`  [OLL 两步] 最终: ${finalOrientation.orientedEdges}棱/${finalOrientation.orientedCorners}角 ${verified ? '✓' : '✗'}`)

  return {
    moves: allMoves.join(' '),
    steps: allMoves.join(' ').split(' ').filter(m => m).length,
    verified,
  }
}

/**
 * 检查OLL是否完成
 */
function isOLLDone(state: CubeState): boolean {
  const orientation = analyzeUFaceOrientation(state)
  return orientation.orientedEdges === 4 && orientation.orientedCorners === 4
}
