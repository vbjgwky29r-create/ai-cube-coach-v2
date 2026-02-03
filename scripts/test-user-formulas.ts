/**
 * 测试用户提供的两个打乱公式和复原公式
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

// 测试1
const scramble1 = "F2 D B2 F2 D' L2 B2 U F L' F2 R2 D2 R2 B' U2 B2 R' U"
const solution1 = "D2 F R' U' F2 L2 D' F' D S' D2 B D' B D B' D' L D' L' B' L B L' D2 L' D' L D2 L B' L' B R D2 R' D' R2 U R' D' R U' R2 D"

// 测试2
const scramble2 = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"
const solution2 = "D' R2 F D2 R U R U' R' D U' B' U B U' F U2 F' U2 B' U' B B U B' R B R' U R' U' R U L' U' L U L' U L U2 L' U L U2 L' U' L U"

// 过滤非标准动作（S, S' 等中层动作）
function filterMoves(moves: string): string[] {
  return moves.split(/\s+/)
    .filter(m => m.length > 0)
    .filter(m => !/^[SMEsme][2']?$/.test(m)) // 跳过中层动作S, S', S2, M, M', M2, E, E', E2
}

function testScrambleAndSolution(name: string, scramble: string, solution: string) {
  console.log(`=== 测试 ${name} ===`)
  console.log(`打乱: ${scramble}`)
  console.log()

  let state = createSolvedCube()
  const scrambleMoves = filterMoves(scramble)

  // 应用打乱
  for (const move of scrambleMoves) {
    state = applyMove(state, move)
  }

  const scrambled = !isCubeSolved(state)
  console.log(`打乱后状态: ${scrambled ? '✓ 已打乱' : '✗ 仍是还原状态'}`)

  // 应用复原公式
  const solutionMoves = filterMoves(solution)
  for (const move of solutionMoves) {
    state = applyMove(state, move)
  }

  const solved = isCubeSolved(state)
  console.log(`复原后状态: ${solved ? '✓ 已还原' : '✗ 未还原'}`)
  console.log()

  return solved
}

// 运行测试
const result1 = testScrambleAndSolution("公式1", scramble1, solution1)
const result2 = testScrambleAndSolution("公式2", scramble2, solution2)

if (result1 && result2) {
  console.log('✅ 所有测试通过!')
} else {
  console.log('❌ 有测试失败!')
  if (!result1) console.log('- 公式1 失败')
  if (!result2) console.log('- 公式2 失败')
}
