/**
 * 测试打乱公式和还原公式
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

// 反转动作
function invertMove(move: string): string {
  if (move.endsWith("'")) return move.slice(0, -1)
  if (move.endsWith("2")) return move
  return move + "'"
}

const scramble = "U R2 F' R' U' R2 L U B' D F2 U2 R2 F2 B2 D2 F2 D2 R D2 R"

console.log('=== 测试打乱公式 ===')
console.log('打乱:', scramble)
console.log()

let state = createSolvedCube()
const moves = scramble.split(/\s+/).filter(m => m.length > 0)

// 应用打乱
for (const move of moves) {
  // 跳过非标准动作（如果有）
  if (/^[SMEsme]$/.test(move)) continue
  state = applyMove(state, move)
}

console.log('打乱后状态:')
console.log(stateToString(state))

// 生成反向公式并应用
const reverseMoves = moves.slice().reverse().map(invertMove)
console.log('\n反向公式:', reverseMoves.join(' '))

// 应用反向公式
for (const move of reverseMoves) {
  if (/^[SMEsme]$/.test(move)) continue
  state = applyMove(state, move)
}

const solved = createSolvedCube()
const isSolved = JSON.stringify(state) === JSON.stringify(solved)

console.log('\n应用反向公式后是否还原:', isSolved ? '✓ 成功!' : '✗ 失败!')

if (!isSolved) {
  console.log('\n当前状态:')
  console.log(stateToString(state))
}

// 测试单个动作是否正确
console.log('\n=== 测试每个基本动作的逆 ===')
const basicMoves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2',
                    'D', "D'", 'D2', 'L', "L'", 'L2', 'B', "B'", 'B2']

let allPass = true
for (const move of basicMoves) {
  let s = createSolvedCube()
  s = applyMove(s, move)
  s = applyMove(s, invertMove(move))
  const pass = JSON.stringify(s) === JSON.stringify(solved)
  if (!pass) {
    console.log(`✗ ${move} + ${invertMove(move)} 未还原`)
    allPass = false
  }
}

if (allPass) {
  console.log('✓ 所有基本动作测试通过!')
} else {
  console.log('✗ 有基本动作测试失败!')
}
