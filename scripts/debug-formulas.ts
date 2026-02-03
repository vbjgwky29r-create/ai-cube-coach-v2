/**
 * 调试用户公式
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

// 公式2
const scramble2 = "D' B2 R2 B R L2 D F' L' F L2 D2 R' D2 L' F2 D2 R' U2"
const solution2 = "D' R2 F D2 R U R U' R' D U' B' U B U' F U2 F' U2 B' U' B B U B' R B R' U R' U' R U L' U' L U L' U L U2 L' U L U2 L' U' L U"

function filterMovesDebug(moves: string, label: string): string[] {
  const allMoves = moves.split(/\s+/).filter(m => m.length > 0)
  const filtered = allMoves.filter(m => !/^[SMEsme][2']?$/.test(m))
  const removed = allMoves.filter(m => /^[SMEsme][2']?$/.test(m))

  console.log(`${label}:`)
  console.log(`  原始动作数: ${allMoves.length}`)
  console.log(`  过滤后: ${filtered.length}`)
  if (removed.length > 0) {
    console.log(`  被过滤掉: ${removed.join(', ')}`)
  }
  return filtered
}

console.log('=== 测试公式2 ===')
console.log()

let state = createSolvedCube()

// 打乱
const scrambleMoves = filterMovesDebug(scramble2, '打乱')
for (const move of scrambleMoves) {
  state = applyMove(state, move)
}
console.log(`打乱后是否还原: ${isCubeSolved(state) ? '否' : '是'}`)
console.log()

// 复原
const solutionMoves = filterMovesDebug(solution2, '复原')

// 逐步应用复原公式，看看在哪一步出错
console.log('逐步应用复原公式:')
for (let i = 0; i < solutionMoves.length; i++) {
  state = applyMove(state, solutionMoves[i])
  const solved = isCubeSolved(state)
  if (solved) {
    console.log(`  第${i + 1}步 ${solutionMoves[i]}: ✓ 已还原!`)
    break
  }
}

const finalSolved = isCubeSolved(state)
console.log()
console.log(`最终状态: ${finalSolved ? '✓ 已还原' : '✗ 未还原'}`)
