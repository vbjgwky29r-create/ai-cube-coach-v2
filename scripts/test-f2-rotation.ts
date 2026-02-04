/**
 * 测试 F2 旋转逻辑
 * 
 * F 面顺时针旋转时，相邻边的变化：
 * U 底行 → R 左列
 * R 左列 → D 顶行（倒序）
 * D 顶行 → L 右列
 * L 右列 → U 底行（倒序）
 */

import { createSolvedCube, applyMove, CubeState, CubeColor } from '../lib/cube/cube-state'

const colorMap: Record<CubeColor, string> = {
  'U': '白', 'R': '红', 'F': '绿', 'D': '黄', 'L': '橙', 'B': '蓝',
}

function printState(state: CubeState, label: string) {
  console.log(`\n=== ${label} ===`)
  console.log(`U 底行: [${state.U[2].map(c => colorMap[c]).join(' ')}]`)
  console.log(`R 左列: [${colorMap[state.R[0][0]]} ${colorMap[state.R[1][0]]} ${colorMap[state.R[2][0]]}]`)
  console.log(`D 顶行: [${state.D[0].map(c => colorMap[c]).join(' ')}]`)
  console.log(`L 右列: [${colorMap[state.L[0][2]]} ${colorMap[state.L[1][2]]} ${colorMap[state.L[2][2]]}]`)
}

// 从还原状态开始测试
let state = createSolvedCube()
printState(state, '初始状态')

// 执行 F
state = applyMove(state, 'F')
printState(state, '执行 F 后')

// 再执行 F
state = applyMove(state, 'F')
printState(state, '执行 F2 后 (两次 F)')

console.log('\n\n=== 验证 F2 的正确性 ===')
console.log('F2 后，R 左列应该来自 D 顶行（因为 F2 = F + F）')
console.log('初始 D 顶行是 [黄 黄 黄]')
console.log('所以 F2 后 R 左列应该是 [黄 黄 黄]')
console.log('实际 R 左列是: [' + colorMap[state.R[0][0]] + ' ' + colorMap[state.R[1][0]] + ' ' + colorMap[state.R[2][0]] + ']')
