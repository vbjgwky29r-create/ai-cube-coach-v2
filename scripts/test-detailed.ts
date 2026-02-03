/**
 * 详细测试 - 追踪每一步
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

// 测试简单序列：U R2 然后反向
console.log('=== 测试 U R2 序列 ===')
let state1 = createSolvedCube()
state1 = applyMove(state1, 'U')
state1 = applyMove(state1, 'R2')

console.log('应用 U R2 后是否还原:', isCubeSolved(state1) ? '✓' : '✗')

// 反向
state1 = applyMove(state1, 'R2')
state1 = applyMove(state1, "U'")
console.log('应用 R2 U" 后是否还原:', isCubeSolved(state1) ? '✓' : '✗')

// 测试原始打乱的简化版本
console.log('\n=== 测试简化打乱 U R2 F" R" ===')
let state2 = createSolvedCube()
state2 = applyMove(state2, 'U')
state2 = applyMove(state2, 'R2')
state2 = applyMove(state2, "F'")
state2 = applyMove(state2, "R'")

console.log('应用 U R2 F" R" 后是否还原:', isCubeSolved(state2) ? '✓' : '✗')

// 反向
state2 = applyMove(state2, 'R')
state2 = applyMove(state2, 'F')
state2 = applyMove(state2, 'R2')
state2 = applyMove(state2, "U'")
console.log('应用 R F R2 U" 后是否还原:', isCubeSolved(state2) ? '✓' : '✗')

// 测试完整打乱的简化版（前4步）
console.log('\n=== 测试完整打乱的前4步 ===')
const partialScramble = "U R2 F' R'"
let state3 = createSolvedCube()
const moves = partialScramble.split(/\s+/)
for (const move of moves) {
  state3 = applyMove(state3, move)
}

console.log('应用 U R2 F" R" 后是否还原:', isCubeSolved(state3) ? '✓' : '✗')

// 反向
const reverseMoves = ['R', 'F', 'R2', "U'"]
for (const move of reverseMoves) {
  state3 = applyMove(state3, move)
}
console.log('应用 R F R2 U" 后是否还原:', isCubeSolved(state3) ? '✓' : '✗')

if (!isCubeSolved(state3)) {
  console.log('状态未还原，说明有bug!')
}
