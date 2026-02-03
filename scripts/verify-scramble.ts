/**
 * 验证打乱公式的逆向
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

function invertMove(move: string): string {
  if (move.endsWith("'")) return move.slice(0, -1)
  if (move.endsWith("2")) return move
  return move + "'"
}

// 测试打乱公式2
const scramble2 = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"

console.log('=== 验证打乱公式2 ===')
console.log(`打乱: ${scramble2}`)
console.log()

let state = createSolvedCube()
const moves = scramble2.split(/\s+/)

// 应用打乱
for (const move of moves) {
  state = applyMove(state, move)
}
console.log('打乱后已打乱:', !isCubeSolved(state))

// 生成逆向公式并应用
const reverseMoves = moves.slice().reverse().map(invertMove)
console.log(`逆向公式: ${reverseMoves.join(' ')}`)

for (const move of reverseMoves) {
  state = applyMove(state, move)
}

const solved = isCubeSolved(state)
console.log(`应用逆向后是否还原: ${solved ? '✓ 是' : '✗ 否'}`)

if (!solved) {
  console.log('\n⚠️ 打乱公式的逆向无法还原，说明旋转逻辑仍有问题！')
}
