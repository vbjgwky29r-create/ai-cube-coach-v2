/**
 * 分段测试长打乱公式
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

const scramble = "U R2 F' R' U' R2 L U B' D F2 U2 R2 F2 B2 D2 F2 D2 R D2 R"
const moves = scramble.split(/\s+/)

// 测试每个段落
const segments = [
  moves.slice(0, 5).join(' '),   // U R2 F' R' U'
  moves.slice(0, 10).join(' '),  // + R2 L U B' D
  moves.slice(0, 15).join(' '),  // + F2 U2 R2 F2 B2
  moves.slice(0, 20).join(' '),  // + D2 F2 D2 R D2 R
]

console.log('=== 分段测试打乱公式 ===')

for (let i = 0; i < segments.length; i++) {
  const segment = segments[i]
  console.log(`\n段落 ${i + 1}: ${segment}`)

  // 应用段落
  let state = createSolvedCube()
  const segmentMoves = segment.split(/\s+/)
  for (const move of segmentMoves) {
    state = applyMove(state, move)
  }

  // 生成反向并应用
  const reverseMoves = segmentMoves.slice().reverse().map((m: string) => {
    if (m.endsWith("'")) return m.slice(0, -1)
    if (m.endsWith("2")) return m
    return m + "'"
  })

  for (const move of reverseMoves) {
    state = applyMove(state, move)
  }

  const solved = isCubeSolved(state)
  console.log(`应用反向后是否还原: ${solved ? '✓' : '✗'}`)

  if (!solved) {
    console.log('段落:', segment)
    console.log('反向:', reverseMoves.join(' '))
    break
  }
}

// 测试完整的打乱
console.log('\n=== 完整打乱测试 ===')
let fullState = createSolvedCube()
for (const move of moves) {
  fullState = applyMove(fullState, move)
}

const reverseMoves = moves.slice().reverse().map(m => {
  if (m.endsWith("'")) return m.slice(0, -1)
  if (m.endsWith("2")) return m
  return m + "'"
})

console.log('反向公式:', reverseMoves.join(' '))

for (const move of reverseMoves) {
  fullState = applyMove(fullState, move)
}

const fullSolved = isCubeSolved(fullState)
console.log(`完整打乱+反向是否还原: ${fullSolved ? '✓' : '✗'}`)
