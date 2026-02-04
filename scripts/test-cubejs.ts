/**
 * 使用 cubejs 库验证魔方状态
 */

// @ts-ignore
import Cube from 'cubejs'

const scramble = "U' R' L U' B D' F' U' L F R2 L2 D' F2 R2 F2 R2 U2 B2 R2 F2"

// 初始化 cubejs
Cube.initSolver()

// 创建魔方并应用打乱
const cube = new Cube()
cube.move(scramble)

// 获取魔方状态字符串
const stateStr = cube.asString()
console.log('cubejs 状态字符串:', stateStr)
console.log('长度:', stateStr.length)

// cubejs 的状态字符串格式：UUUUUUUUURRRRRRRRFFFFFFFFDDDDDDDDLLLLLLLLBBBBBBBB
// 每个面 9 个字符，顺序是 U R F D L B

// 解析状态
const faces = {
  U: stateStr.slice(0, 9),
  R: stateStr.slice(9, 18),
  F: stateStr.slice(18, 27),
  D: stateStr.slice(27, 36),
  L: stateStr.slice(36, 45),
  B: stateStr.slice(45, 54),
}

console.log('\n=== cubejs 计算的各面状态 ===')
for (const [face, state] of Object.entries(faces)) {
  console.log(`${face} 面: ${state.slice(0,3)} ${state.slice(3,6)} ${state.slice(6,9)}`)
}

// 颜色映射
const colorMap: Record<string, string> = {
  'U': '白', 'R': '红', 'F': '绿', 'D': '黄', 'L': '橙', 'B': '蓝',
}

console.log('\n=== R 面详细 ===')
const rFace = faces.R
console.log('cubejs R 面:')
console.log(`  ${colorMap[rFace[0]]} ${colorMap[rFace[1]]} ${colorMap[rFace[2]]}`)
console.log(`  ${colorMap[rFace[3]]} ${colorMap[rFace[4]]} ${colorMap[rFace[5]]}`)
console.log(`  ${colorMap[rFace[6]]} ${colorMap[rFace[7]]} ${colorMap[rFace[8]]}`)

console.log('\n魔方星球 R 面应该是:')
console.log('  白 橙 蓝')
console.log('  白 红 绿')
console.log('  红 蓝 白')
