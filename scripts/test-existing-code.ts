/**
 * 使用现有的cube-state.ts进行测试
 */

import { createSolvedCube, applyMove, applyScramble } from '../lib/cube/cube-state'

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

const scramble = "D F' L B' U F' B' R2 D' L2 F' U2 L2 B U2 B U2 F' U2 B"

console.log('=== 测试现有代码的打乱 ===')
console.log('打乱:', scramble)
console.log()

let state = createSolvedCube()
const moves = scramble.split(/\s+/)
for (const move of moves) {
  state = applyMove(state, move)
}

console.log('计算结果:')
console.log(stateToString(state))

console.log('\n=== 预期结果（参考图）===')
console.log('U面: 蓝黄橙，橙白红，蓝橙橙')
console.log('D面: 绿白黄，黄黄白，绿黄白')
console.log('R面: 白绿黄，红红蓝，橙蓝橙')
console.log('L面: 黄白白，蓝橙绿，黄绿白')
console.log('F面: 红绿绿，白绿蓝，红红蓝')
console.log('B面: 绿橙红，橙蓝黄，蓝红红')
