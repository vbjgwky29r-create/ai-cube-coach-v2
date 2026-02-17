/**
 * 迭代 OLL 求解器
 *
 * 当标准OLL公式无法直接还原时，使用迭代方法：
 * 1. 识别当前OLL情况
 * 2. 应用对应公式
 * 3. 重新评估
 * 4. 重复直到完成或达到最大迭代次数
 */

import {
  createSolvedCube,
  applyMoves,
  type CubeState,
} from './cube-state-v3'

import { analyzeUFaceOrientation, getOLLInfo } from './oll-recognizer'

export interface OLLSolution {
  moves: string
  steps: number
  iterations: number
  verified: boolean
  finalEdges: number
  finalCorners: number
}

/**
 * 迭代式 OLL 求解
 *
 * @param state 当前魔方状态
 * @param maxIterations 最大迭代次数
 * @returns OLL解法
 */
export function solveOLLIterative(
  state: CubeState,
  maxIterations: number = 6
): OLLSolution {
  let currentState = state
  const allMoves: string[] = []
  let iterations = 0

  console.log('  [OLL] 迭代求解开始...')

  for (let i = 0; i < maxIterations; i++) {
    iterations++

    // 分析当前状态
    const orientation = analyzeUFaceOrientation(currentState)
    console.log(`  [OLL] 迭代${i + 1}: ${orientation.orientedEdges}棱/${orientation.orientedCorners}角朝向正确`)

    // 检查是否完成
    if (orientation.orientedEdges === 4 && orientation.orientedCorners === 4) {
      console.log(`  [OLL] 完成!`)

      return {
        moves: allMoves.join(' '),
        steps: allMoves.join(' ').split(' ').filter(m => m).length,
        iterations,
        verified: true,
        finalEdges: 4,
        finalCorners: 4,
      }
    }

    // 获取推荐公式
    const ollInfo = getOLLInfo(currentState)
    if (!ollInfo) {
      console.log(`  [OLL] 无法识别情况，使用默认Sune`)
      allMoves.push("R U R' U R U2 R'")
      currentState = applyMoves(currentState, "R U R' U R U2 R'")
      continue
    }

    console.log(`  [OLL] 应用: ${ollInfo.name} (${ollInfo.algorithm})`)
    allMoves.push(ollInfo.algorithm)
    currentState = applyMoves(currentState, ollInfo.algorithm)

    // 检查是否有进展
    const newOrientation = analyzeUFaceOrientation(currentState)
    if (newOrientation.orientedEdges + newOrientation.orientedCorners <=
        orientation.orientedEdges + orientation.orientedCorners) {
      // 没有进展，尝试U调整
      console.log(`  [OLL] 无进展，尝试U层调整`)
      allMoves.push('U')
      currentState = applyMoves(currentState, 'U')
    }
  }

  // 达到最大迭代次数
  const finalOrientation = analyzeUFaceOrientation(currentState)
  console.log(`  [OLL] 达到最大迭代次数，最终状态: ${finalOrientation.orientedEdges}棱/${finalOrientation.orientedCorners}角`)

  return {
    moves: allMoves.join(' '),
    steps: allMoves.join(' ').split(' ').filter(m => m).length,
    iterations,
    verified: finalOrientation.orientedEdges === 4 && finalOrientation.orientedCorners === 4,
    finalEdges: finalOrientation.orientedEdges,
    finalCorners: finalOrientation.orientedCorners,
  }
}

/**
 * 智能OLL求解 - 尝试多种公式组合
 */
export function solveOLLSmart(state: CubeState): OLLSolution {
  // 常用OLL公式库（按优先级）
  const commonAlgorithms = [
    "R U R' U R U2 R'",           // Sune
    "R U2 R' U' R U' R'",         // Anti-Sune
    "F R U R' U' F'",             // Line
    "R U R' U R U' R' U R U2 R'", // Headlights
    "r U R' U' r' F R F'",        // T-Perm (for corner orientation)
    "R' F R F' R U R' U' R U R'", // Pi variant
  ]

  console.log('  [OLL] 智能求解尝试...')

  let currentState = state
  const initialOrientation = analyzeUFaceOrientation(currentState)
  console.log(`  [OLL] 初始: ${initialOrientation.orientedEdges}棱/${initialOrientation.orientedCorners}角`)

  // 先尝试标准OLL识别
  const ollInfo = getOLLInfo(currentState)
  if (ollInfo) {
    console.log(`  [OLL] 识别: ${ollInfo.name}`)
    const result = solveOLLIterative(state, 4)
    if (result.verified) {
      return result
    }
  }

  // 标准方法失败，尝试两步OLL策略
  console.log(`  [OLL] 尝试两步OLL策略...`)

  // 步骤1: 用Sune将棱块调整为2或4个
  let bestState = state
  let bestScore = initialOrientation.orientedEdges + initialOrientation.orientedCorners
  let bestAlgorithm = ""

  for (const algo of commonAlgorithms) {
    const testState = applyMoves(state, algo)
    const testOrientation = analyzeUFaceOrientation(testState)
    const testScore = testOrientation.orientedEdges + testOrientation.orientedCorners

    if (testScore > bestScore) {
      bestScore = testScore
      bestState = testState
      bestAlgorithm = algo
    }

    // 检查是否完成
    if (testOrientation.orientedEdges === 4 && testOrientation.orientedCorners === 4) {
      return {
        moves: algo,
        steps: algo.split(' ').filter(m => m).length,
        iterations: 1,
        verified: true,
        finalEdges: 4,
        finalCorners: 4,
      }
    }
  }

  if (bestAlgorithm) {
    console.log(`  [OLL] 最佳第一步: ${bestAlgorithm} (${bestScore}分)`)
    const afterFirst = applyMoves(state, bestAlgorithm)

    // 步骤2: 对新状态再次尝试
    const firstOrientation = analyzeUFaceOrientation(afterFirst)
    const ollInfo2 = getOLLInfo(afterFirst)

    if (ollInfo2) {
      const secondResult = solveOLLIterative(afterFirst, 3)
      return {
        moves: `${bestAlgorithm} ${secondResult.moves}`.trim(),
        steps: bestAlgorithm.split(' ').filter(m => m).length + secondResult.steps,
        iterations: 1 + secondResult.iterations,
        verified: secondResult.verified,
        finalEdges: secondResult.finalEdges,
        finalCorners: secondResult.finalCorners,
      }
    }
  }

  // 降级：返回迭代结果
  return solveOLLIterative(state, 8)
}
