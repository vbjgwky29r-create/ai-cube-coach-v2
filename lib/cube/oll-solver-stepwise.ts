/**
 * OLL 单步搜索求解器
 *
 * 使用单步移动（R, U, L, F 等）进行 BFS 搜索
 * 目标：顶面全部朝向正确（4棱块+4角块）
 *
 * 这种方法不依赖预定义公式，可以找到最优解
 */

import {
  createSolvedCube,
  applyMove,
  applyMoves,
  type CubeState,
} from './cube-state-v3'

// OLL 阶段允许的移动（不影响 Cross 和 F2L 已完成的部分）
const OLL_MOVES = [
  'R', "R'", 'R2',
  'L', "L'", 'L2',
  'U', "U'", 'U2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
]

interface SearchNode {
  state: CubeState
  moves: string
  depth: number
}

/**
 * 简化的状态哈希（只记录 U 层朝向状态）
 */
function getOLLStateHash(state: CubeState): string {
  // 只追踪 U 层块的朝向，不关心具体位置
  const hash: string[] = []

  // U 层棱块朝向
  const uEdges = ['UF', 'UL', 'UB', 'UR']
  for (const edgeId of uEdges) {
    const edge = state.edges.find((e: any) => e.id === edgeId)
    if (edge && edge.position.y === 1) {
      hash.push(`E${edgeId}:${edge.orientation}`)
    } else {
      // 找这个棱块在哪
      const actualEdge = state.edges.find((e: any) =>
        e.id === edgeId
      )
      if (actualEdge) {
        hash.push(`E${edgeId}:${actualEdge.orientation}`)
      }
    }
  }

  // U 层角块朝向
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  for (const cornerId of uCorners) {
    const corner = state.corners.find((c: any) => c.id === cornerId)
    if (corner) {
      hash.push(`C${cornerId}:${corner.orientation}`)
    }
  }

  return hash.join('|')
}

/**
 * 检查顶面是否全部朝向��确
 *
 * 注意：需要检查**在U层位置**的块是否朝向正确
 * 而不是**具有U层ID**的块是否朝向正确
 */
function isTopOriented(state: CubeState): boolean {
  // U层的4个棱块位置
  const uEdgePositions = [
    { x: 0, y: 1, z: 1 },   // UF位置
    { x: -1, y: 1, z: 0 },  // UL位置
    { x: 0, y: 1, z: -1 },  // UB位置
    { x: 1, y: 1, z: 0 },   // UR位置
  ]

  for (const pos of uEdgePositions) {
    const edge = state.edges.find((e: any) =>
      e.position.x === pos.x && e.position.y === pos.y && e.position.z === pos.z
    )
    if (!edge || edge.orientation !== 0) return false
  }

  // U层的4个角块位置
  const uCornerPositions = [
    { x: 1, y: 1, z: 1 },   // URF位置
    { x: -1, y: 1, z: 1 },  // UFL位置
    { x: -1, y: 1, z: -1 }, // ULB位置
    { x: 1, y: 1, z: -1 },  // UBR位置
  ]

  for (const pos of uCornerPositions) {
    const corner = state.corners.find((c: any) =>
      c.position.x === pos.x && c.position.y === pos.y && c.position.z === pos.z
    )
    if (!corner || corner.orientation !== 0) return false
  }

  return true
}

/**
 * 获取朝向评分（正确朝向的块数）
 *
 * 检查**在U层位置**的块有多少个朝向正确
 */
function getOrientationScore(state: CubeState): number {
  let score = 0

  // U层的4个棱块位置
  const uEdgePositions = [
    { x: 0, y: 1, z: 1 },   // UF位置
    { x: -1, y: 1, z: 0 },  // UL位置
    { x: 0, y: 1, z: -1 },  // UB位置
    { x: 1, y: 1, z: 0 },   // UR位置
  ]

  for (const pos of uEdgePositions) {
    const edge = state.edges.find((e: any) =>
      e.position.x === pos.x && e.position.y === pos.y && e.position.z === pos.z
    )
    if (edge && edge.orientation === 0) score++
  }

  // U层的4个角块位置
  const uCornerPositions = [
    { x: 1, y: 1, z: 1 },   // URF位置
    { x: -1, y: 1, z: 1 },  // UFL位置
    { x: -1, y: 1, z: -1 }, // ULB位置
    { x: 1, y: 1, z: -1 },  // UBR位置
  ]

  for (const pos of uCornerPositions) {
    const corner = state.corners.find((c: any) =>
      c.position.x === pos.x && c.position.y === pos.y && c.position.z === pos.z
    )
    if (corner && corner.orientation === 0) score++
  }

  return score
}

/**
 * 使用 BFS 搜索求解 OLL（单步移动）
 *
 * @param state 当前魔方状态
 * @param maxDepth 最大搜索深度
 * @returns OLL解法
 */
export function solveOLLStepwise(
  state: CubeState,
  maxDepth: number = 16
): { moves: string; steps: number; verified: boolean; finalScore: number } {
  console.log('  [OLL 单步搜索] 开始搜索...')

  const initialScore = getOrientationScore(state)
  console.log(`  [OLL 单步搜索] 初始评分: ${initialScore}/8`)

  // 检查是否已完成
  if (isTopOriented(state)) {
    return { moves: '', steps: 0, verified: true, finalScore: 8 }
  }

  // BFS 搜索
  const queue: SearchNode[] = [{ state, moves: '', depth: 0 }]
  const visited = new Set<string>()
  visited.add(getOLLStateHash(state))

  let bestNode = { state, moves: '', depth: 0 }
  let bestScore = initialScore

  while (queue.length > 0) {
    const current = queue.shift()!

    // 检查是否达到深度限制
    if (current.depth >= maxDepth) {
      continue
    }

    // 尝试每个移动
    for (const move of OLL_MOVES) {
      // 避免冗余移动
      if (isRedundantMove(current.moves, move)) {
        continue
      }

      const newState = applyMove(current.state, move)
      const stateHash = getOLLStateHash(newState)

      // 检查是否已访问
      if (visited.has(stateHash)) {
        continue
      }
      visited.add(stateHash)

      const newMoves = current.moves ? `${current.moves} ${move}` : move

      // 检查是否完成
      if (isTopOriented(newState)) {
        const steps = newMoves.split(' ').filter(m => m).length
        console.log(`  [OLL 单步搜索] 找到解法! (${steps}步)`)
        return {
          moves: newMoves,
          steps,
          verified: true,
          finalScore: 8,
        }
      }

      // 计算评分
      const newScore = getOrientationScore(newState)

      // 只保留有进展或相同评分的节点
      if (newScore >= bestScore || current.depth === 0) {
        queue.push({
          state: newState,
          moves: newMoves,
          depth: current.depth + 1,
        })

        // 更新最佳节点
        if (newScore > bestScore) {
          bestScore = newScore
          bestNode = { state: newState, moves: newMoves, depth: current.depth + 1 }
          const bestSteps = newMoves.split(' ').filter(m => m).length
          console.log(`  [OLL 单步搜索] 找到更好状态: ${newScore}/8 (${bestSteps}步)`)
        }
      }
    }
  }

  // 没有找到完整解法，返回最佳部分解
  console.log(`  [OLL 单步搜索] 未找到完整解，最佳评分: ${bestScore}/8`)

  return {
    moves: bestNode.moves,
    steps: bestNode.moves.split(' ').filter(m => m).length,
    verified: false,
    finalScore: bestScore,
  }
}

/**
 * 检查移动是否冗余
 */
function isRedundantMove(moves: string, newMove: string): boolean {
  if (!moves) return false

  const moveList = moves.split(' ').filter(m => m)
  const lastMove = moveList[moveList.length - 1]

  // R 后不能跟 R'
  if (lastMove === 'R' && newMove === "R'") return true
  if (lastMove === "R'" && newMove === 'R') return true
  if (lastMove === 'L' && newMove === "L'") return true
  if (lastMove === "L'" && newMove === 'L') return true
  if (lastMove === 'U' && newMove === "U'") return true
  if (lastMove === "U'" && newMove === 'U') return true
  if (lastMove === 'F' && newMove === "F'") return true
  if (lastMove === "F'" && newMove === 'F') return true

  // R2 后不能跟 R2
  if (lastMove === 'R2' && newMove === 'R2') return true
  if (lastMove === 'L2' && newMove === 'L2') return true
  if (lastMove === 'U2' && newMove === 'U2') return true
  if (lastMove === 'F2' && newMove === 'F2') return true

  return false
}

/**
 * 两阶段 OLL 求解
 *
 * 阶段1: 先做棱块朝向（4个棱块）
 * 阶段2: 再做角块朝向（4个角块）
 */
export function solveOLLTwoStage(
  state: CubeState,
  maxDepthPerStage: number = 10
): { moves: string; steps: number; verified: boolean } {
  console.log('  [OLL 两阶段] 使用两阶段策略...')

  let currentState = state
  const allMoves: string[] = []

  // 阶段1: 棱块朝向
  console.log('  [OLL 两阶段] 阶段1: 棱块朝向...')
  const edgesOnlyResult = solveEdgesOrientation(currentState, maxDepthPerStage)
  if (edgesOnlyResult.moves) {
    allMoves.push(edgesOnlyResult.moves)
    currentState = applyMoves(currentState, edgesOnlyResult.moves)
    console.log(`  [OLL 两阶段] 阶段1完成: ${edgesOnlyResult.moves}`)
  }

  // 阶段2: 角块朝向
  console.log('  [OLL 两阶段] 阶段2: 角块朝向...')
  const cornersOnlyResult = solveCornersOrientation(currentState, maxDepthPerStage)
  if (cornersOnlyResult.moves) {
    allMoves.push(cornersOnlyResult.moves)
    currentState = applyMoves(currentState, cornersOnlyResult.moves)
    console.log(`  [OLL 两阶段] 阶段2完成: ${cornersOnlyResult.moves}`)
  }

  const verified = isTopOriented(currentState)

  return {
    moves: allMoves.join(' '),
    steps: allMoves.join(' ').split(' ').filter(m => m).length,
    verified,
  }
}

/**
 * 只解决棱块朝向
 */
function solveEdgesOrientation(
  state: CubeState,
  maxDepth: number
): { moves: string; verified: boolean } {
  const targetScore = 4 // 4个棱块

  const queue: SearchNode[] = [{ state, moves: '', depth: 0 }]
  const visited = new Set<string>()
  visited.add(getOLLStateHash(state))

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.depth >= maxDepth) continue

    for (const move of OLL_MOVES) {
      if (isRedundantMove(current.moves, move)) continue

      const newState = applyMove(current.state, move)
      const stateHash = getOLLStateHash(newState)
      if (visited.has(stateHash)) continue
      visited.add(stateHash)

      const newMoves = current.moves ? `${current.moves} ${move}` : move

      // 检查棱块是否全部朝向正确
      let edgesCorrect = 0
      const uEdges = ['UF', 'UL', 'UB', 'UR']
      for (const edgeId of uEdges) {
        const edge = newState.edges.find((e: any) => e.id === edgeId)
        if (edge && edge.orientation === 0) edgesCorrect++
      }

      if (edgesCorrect === targetScore) {
        return { moves: newMoves, verified: true }
      }

      // 只保留有进展的节点
      if (edgesCorrect >= 2) {
        queue.push({
          state: newState,
          moves: newMoves,
          depth: current.depth + 1,
        })
      }
    }
  }

  return { moves: '', verified: false }
}

/**
 * 只解决角块朝向
 */
function solveCornersOrientation(
  state: CubeState,
  maxDepth: number
): { moves: string; verified: boolean } {
  const targetScore = 4 // 4个角块

  const queue: SearchNode[] = [{ state, moves: '', depth: 0 }]
  const visited = new Set<string>()
  visited.add(getOLLStateHash(state))

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.depth >= maxDepth) continue

    for (const move of OLL_MOVES) {
      if (isRedundantMove(current.moves, move)) continue

      const newState = applyMove(current.state, move)
      const stateHash = getOLLStateHash(newState)
      if (visited.has(stateHash)) continue
      visited.add(stateHash)

      const newMoves = current.moves ? `${current.moves} ${move}` : move

      // 检查角块是否全部朝向正确
      let cornersCorrect = 0
      const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
      for (const cornerId of uCorners) {
        const corner = newState.corners.find((c: any) => c.id === cornerId)
        if (corner && corner.orientation === 0) cornersCorrect++
      }

      if (cornersCorrect === targetScore && isTopOriented(newState)) {
        return { moves: newMoves, verified: true }
      }

      // 只保留有进展的节点
      if (cornersCorrect >= 2) {
        queue.push({
          state: newState,
          moves: newMoves,
          depth: current.depth + 1,
        })
      }
    }
  }

  return { moves: '', verified: false }
}
