/**
 * 测试R2和其他180度旋转
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

console.log('=== 测试180度旋转 ===')

// 测试 R2 R2
let state1 = createSolvedCube()
state1 = applyMove(state1, 'R2')
state1 = applyMove(state1, 'R2')
console.log('R2 R2 是否还原:', isCubeSolved(state1) ? '✓' : '✗')

// 测试 U2 U2
let state2 = createSolvedCube()
state2 = applyMove(state2, 'U2')
state2 = applyMove(state2, 'U2')
console.log('U2 U2 是否还原:', isCubeSolved(state2) ? '✓' : '✗')

// 测试 F2 F2
let state3 = createSolvedCube()
state3 = applyMove(state3, 'F2')
state3 = applyMove(state3, 'F2')
console.log('F2 F2 是否还原:', isCubeSolved(state3) ? '✓' : '✗')

// 测试 D2 D2
let state4 = createSolvedCube()
state4 = applyMove(state4, 'D2')
state4 = applyMove(state4, 'D2')
console.log('D2 D2 是否还原:', isCubeSolved(state4) ? '✓' : '✗')

// 测试 B2 B2
let state5 = createSolvedCube()
state5 = applyMove(state5, 'B2')
state5 = applyMove(state5, 'B2')
console.log('B2 B2 是否还原:', isCubeSolved(state5) ? '✓' : '✗')

// 测试 L2 L2
let state6 = createSolvedCube()
state6 = applyMove(state6, 'L2')
state6 = applyMove(state6, 'L2')
console.log('L2 L2 是否还原:', isCubeSolved(state6) ? '✓' : '✗')

// 测试 R2 的逆应该是 R2
let state7 = createSolvedCube()
state7 = applyMove(state7, 'R2')
// R2的逆就是R2本身
state7 = applyMove(state7, 'R2')
console.log('R2 (R2的逆) 是否还原:', isCubeSolved(state7) ? '✓' : '✗')
