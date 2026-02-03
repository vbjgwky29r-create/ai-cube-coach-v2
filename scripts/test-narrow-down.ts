/**
 * 逐步测试第5-10步
 */

import { createSolvedCube, applyMove, isCubeSolved } from '../lib/cube/cube-state'

const baseMoves = ['U', 'R2', "F'", "R'", "U'"]
const additionalMoves = ['R2', 'L', 'U', "B'", 'D']

console.log('=== 逐步测试第6-10步 ===')

// 基础5步
let baseState = createSolvedCube()
for (const move of baseMoves) {
  baseState = applyMove(baseState, move)
}

// 逐个添加动作并测试
let currentState = baseState
const appliedMoves = [...baseMoves]

for (let i = 0; i < additionalMoves.length; i++) {
  const move = additionalMoves[i]
  currentState = applyMove(currentState, move)
  appliedMoves.push(move)

  // 测试当前序列的逆
  const reverseMoves = appliedMoves.slice().reverse().map(m => {
    if (m.endsWith("'")) return m.slice(0, -1)
    if (m.endsWith("2")) return m
    return m + "'"
  })

  let testState = createSolvedCube()
  for (const m of appliedMoves) {
    testState = applyMove(testState, m)
  }
  for (const m of reverseMoves) {
    testState = applyMove(testState, m)
  }

  const solved = isCubeSolved(testState)
  console.log(`添加第${i + 6}步 ${move}: ${solved ? '✓' : '✗'}`)

  if (!solved) {
    console.log('问题序列:', appliedMoves.join(' '))
    console.log('反向序列:', reverseMoves.join(' '))
    break
  }
}
