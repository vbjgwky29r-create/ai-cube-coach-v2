import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

const scramble = "R2 B2 D' B2 R2 B2 R2 U' F2 L' D B F2 D' B D2 U B R F'"
const solution = "L' F L B2 L2 D B' R' D R L B2 L2 B2 U F2 B2 U L2 B2"

console.log('=== 验证复原公式 ===')
console.log('打乱:', scramble)
console.log('复原:', solution)
console.log('复原步数:', solution.split(/\s+/).length)
console.log()

// 应用打乱
let state = createSolvedCube()
for (const move of scramble.split(/\s+/)) {
  state = applyMove(state, move)
}

console.log('打乱完成')

// 应用复原
for (const move of solution.split(/\s+/)) {
  state = applyMove(state, move)
}

const solved = isCubeSolved(state)
console.log('复原后是否还原:', solved ? '✅ 是' : '❌ 否')

if (!solved) {
  console.log('\n❌ 复原公式无法还原魔方')
}
