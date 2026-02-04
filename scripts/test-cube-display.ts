/**
 * 测试魔方状态计算 - 验证展开图显示
 * 
 * 打乱公式: U' R' L U' B D' F' U' L F R2 L2 D' F2 R2 F2 R2 U2 B2 R2 F2
 * 
 * 魔方星球显示的 R 面应该是:
 * 白 橙 蓝
 * 白 红 绿
 * 红 蓝 白
 */

import { applyScramble, CubeState, CubeColor } from '../lib/cube/cube-state'

const scramble = "U' R' L U' B D' F' U' L F R2 L2 D' F2 R2 F2 R2 U2 B2 R2 F2"

// 颜色映射
const colorMap: Record<CubeColor, string> = {
  'U': '白',
  'R': '红',
  'F': '绿',
  'D': '黄',
  'L': '橙',
  'B': '蓝',
}

function printFace(face: CubeColor[][], name: string) {
  console.log(`\n${name} 面:`)
  for (const row of face) {
    console.log(row.map(c => colorMap[c]).join(' '))
  }
}

function printCube(state: CubeState) {
  printFace(state.U, 'U (上)')
  printFace(state.L, 'L (左)')
  printFace(state.F, 'F (前)')
  printFace(state.R, 'R (右)')
  printFace(state.B, 'B (后)')
  printFace(state.D, 'D (下)')
}

console.log('打乱公式:', scramble)
console.log('\n计算魔方状态...')

const state = applyScramble(scramble)

printCube(state)

console.log('\n\n=== 对比 ===')
console.log('魔方星球 R 面应该是:')
console.log('白 橙 蓝')
console.log('白 红 绿')
console.log('红 蓝 白')

console.log('\n我们计算的 R 面是:')
for (const row of state.R) {
  console.log(row.map(c => colorMap[c]).join(' '))
}
