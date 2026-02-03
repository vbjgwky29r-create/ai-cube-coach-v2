/**
 * 测试修正后的复原公式
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

const scramble = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"

// 修正后的复原公式（去掉了多余的B）
const solution = "D' R2 F D2 R U R U' R' D U' B' U B U' F U2 F' U2 B' U' B U B' R B R' U R' U' R U L' U' L U L' U L U2 L' U L U2 L' U' L U"

console.log('=== 测试修正后的复原公式 ===')
console.log('打乱:', scramble)
console.log('复原:', solution)
console.log()

// 应用打乱
let state = createSolvedCube()
for (const move of scramble.split(/\s+/)) {
  state = applyMove(state, move)
}

// 应用复原
for (const move of solution.split(/\s+/)) {
  state = applyMove(state, move)
}

const solved = isCubeSolved(state)
console.log('复原后是否还原:', solved ? '✅ 是' : '❌ 否')

if (!solved) {
  console.log('\n仍有问题，请提供0秒时L、B、D面的颜色数据。')
}
