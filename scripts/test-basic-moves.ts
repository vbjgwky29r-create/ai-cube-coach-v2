/**
 * 测试基本旋转 - 验证R R'返回还原状态
 */

import { createSolvedCube, applyMove } from '../lib/cube/cube-state'

const colorMap: Record<string, string> = {
  'U': '白', 'R': '红', 'F': '绿', 'D': '黄', 'L': '橙', 'B': '蓝'
}

function stateToString(state: any): string {
  const toColor = (c: string) => colorMap[c] || c
  const faceToStr = (face: string[][]) =>
    face.map((row: string[]) => row.map(toColor).join('')).join(',')

  return `U: ${faceToStr(state.U)}
F: ${faceToStr(state.F)}
R: ${faceToStr(state.R)}
B: ${faceToStr(state.B)}
L: ${faceToStr(state.L)}
D: ${faceToStr(state.D)}`
}

// 测试 R R' 是否还原
console.log('=== 测试 R R" ===')
let state1 = createSolvedCube()
state1 = applyMove(state1, 'R')
state1 = applyMove(state1, "R'")
const rSolved = JSON.stringify(state1) === JSON.stringify(createSolvedCube())
console.log('R R" 后是否还原:', rSolved ? '✓' : '✗')

// 测试 F F' 是否还原
console.log('\n=== 测试 F F" ===')
let state2 = createSolvedCube()
state2 = applyMove(state2, 'F')
state2 = applyMove(state2, "F'")
const fSolved = JSON.stringify(state2) === JSON.stringify(createSolvedCube())
console.log('F F" 后是否还原:', fSolved ? '✓' : '✗')

// 测试 B B' 是否还原
console.log('\n=== 测试 B B" ===')
let state3 = createSolvedCube()
state3 = applyMove(state3, 'B')
state3 = applyMove(state3, "B'")
const bSolved = JSON.stringify(state3) === JSON.stringify(createSolvedCube())
console.log('B B" 后是否还原:', bSolved ? '✓' : '✗')

// 测试 U U' 是否还原
console.log('\n=== 测试 U U" ===')
let state4 = createSolvedCube()
state4 = applyMove(state4, 'U')
state4 = applyMove(state4, "U'")
const uSolved = JSON.stringify(state4) === JSON.stringify(createSolvedCube())
console.log('U U" 后是否还原:', uSolved ? '✓' : '✗')

// 测试 D D' 是否还原
console.log('\n=== 测试 D D" ===')
let state5 = createSolvedCube()
state5 = applyMove(state5, 'D')
state5 = applyMove(state5, "D'")
const dSolved = JSON.stringify(state5) === JSON.stringify(createSolvedCube())
console.log('D D" 后是否还原:', dSolved ? '✓' : '✗')

// 测试 L L' 是否还原
console.log('\n=== 测试 L L" ===')
let state6 = createSolvedCube()
state6 = applyMove(state6, 'L')
state6 = applyMove(state6, "L'")
const lSolved = JSON.stringify(state6) === JSON.stringify(createSolvedCube())
console.log('L L" 后是否还原:', lSolved ? '✓' : '✗')

if (rSolved && fSolved && bSolved && uSolved && dSolved && lSolved) {
  console.log('\n✓ 所有基本旋转测试通过!')
} else {
  console.log('\n✗ 有基本旋转测试失败!')
}
