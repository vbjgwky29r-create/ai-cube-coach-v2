/**
 * 逐步测试魔方状态计算 - 找出哪一步出错
 */

import { createSolvedCube, applyMove, CubeState, CubeColor } from '../lib/cube/cube-state'

const colorMap: Record<CubeColor, string> = {
  'U': '白', 'R': '红', 'F': '绿', 'D': '黄', 'L': '橙', 'B': '蓝',
}

function printR(state: CubeState, label: string) {
  console.log(`${label} - R面: [${state.R[0].map(c => colorMap[c]).join(' ')}] [${state.R[1].map(c => colorMap[c]).join(' ')}] [${state.R[2].map(c => colorMap[c]).join(' ')}]`)
}

// 打乱公式分解
const moves = ["U'", "R'", "L", "U'", "B", "D'", "F'", "U'", "L", "F", "R2", "L2", "D'", "F2", "R2", "F2", "R2", "U2", "B2", "R2", "F2"]

let state = createSolvedCube()
printR(state, '初始')

for (const move of moves) {
  state = applyMove(state, move)
  printR(state, `执行 ${move.padEnd(3)}`)
}

console.log('\n最终 R 面应该是: 白 橙 蓝 / 白 红 绿 / 红 蓝 白')
console.log('我们计算的 R 面: ' + state.R.map(row => row.map(c => colorMap[c]).join(' ')).join(' / '))
