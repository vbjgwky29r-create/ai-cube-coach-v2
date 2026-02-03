/**
 * 测试反向应用复原公式
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

const scramble2 = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"
const solution2 = "D' R2 F D2 R U R U' R' D U' B' U B U' F U2 F' U2 B' U' B B U B' R B R' U R' U' R U L' U' L U L' U L U2 L' U L U2 L' U' L U"

console.log('=== 测试反向应用复原公式 ===')
console.log()

// 应用打乱
let state = createSolvedCube()
const scrambleMoves = scramble2.split(/\s+/)
for (const move of scrambleMoves) {
  state = applyMove(state, move)
}
console.log('打乱完成')

// 正向应用复原公式
let state1 = createSolvedCube()
for (const move of scrambleMoves) {
  state1 = applyMove(state1, move)
}
const solutionMoves = solution2.split(/\s+/)
for (const move of solutionMoves) {
  state1 = applyMove(state1, move)
}
console.log('正向应用复原公式:', isCubeSolved(state1) ? '✓ 还原' : '✗ 未还原')

// 反向应用复原公式（从右到左，并反转每个动作）
function invertMove(move: string): string {
  if (move.endsWith("'")) return move.slice(0, -1)
  if (move.endsWith("2")) return move
  return move + "'"
}

let state2 = createSolvedCube()
for (const move of scrambleMoves) {
  state2 = applyMove(state2, move)
}
const reverseSolutionMoves = solutionMoves.slice().reverse().map(invertMove)
for (const move of reverseSolutionMoves) {
  state2 = applyMove(state2, move)
}
console.log('反向应用复原公式:', isCubeSolved(state2) ? '✓ 还原' : '✗ 未还原')

// 尝试：只应用复原公式（不打乱先）
let state3 = createSolvedCube()
for (const move of solutionMoves) {
  state3 = applyMove(state3, move)
}
console.log('直接应用复原公式到还原状态:', isCubeSolved(state3) ? '✓ 仍是还原' : '✗ 已打乱')
