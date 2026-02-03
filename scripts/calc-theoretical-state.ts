/**
 * 计算打乱公式后的理论状态
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
L: ${faceToStr(state.L)}
F: ${faceToStr(state.F)}
R: ${faceToStr(state.R)}
B: ${faceToStr(state.B)}
D: ${faceToStr(state.D)}`
}

// 打乱公式
const scramble = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"

console.log('=== 打乱公式 ===')
console.log(scramble)
console.log()

let state = createSolvedCube()
const moves = scramble.split(/\s+/)

for (const move of moves) {
  state = applyMove(state, move)
}

console.log('=== 打乱后的理论状态 ===')
console.log(stateToString(state))
