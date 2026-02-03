/**
 * 测试复原公式是否能还原
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

const scramble = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"
const solution = "D' R2 F D2 R U R U' R' D U' B' U B U' F U2 F' U2 B' U' B B U B' R B R' U R' U' R U L' U' L U L' U L U2 L' U L U2 L' U' L U"

console.log('=== 测试复原公式 ===')
console.log('打乱:', scramble)
console.log('复原:', solution)
console.log()

// 应用打乱
let state = createSolvedCube()
for (const move of scramble.split(/\s+/)) {
  state = applyMove(state, move)
}

// 过滤中层动作（如果有）
const solutionMoves = solution.split(/\s+/).filter(m => !/^[SMEsme][2']?$/.test(m))

console.log('应用复原公式...')
for (const move of solutionMoves) {
  state = applyMove(state, move)
}

console.log()
const solved = isCubeSolved(state)
console.log('复原后是否还原:', solved ? '✅ 是' : '❌ 否')

if (!solved) {
  console.log()
  console.log('说明：')
  console.log('- 如果复原公式正确，说明我们的L/B/D面旋转逻辑有问题')
  console.log('- 请告诉我视频中L面、B面、D面在0秒时的颜色')
}
