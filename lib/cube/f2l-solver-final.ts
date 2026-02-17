/**
 * F2L求解器 Final - 包含所有修复
 * 
 * 功能：
 * - 正确的cubejs索引映射
 * - 正确的Cross检查
 * - L1/L2级槽位BFS求解（6步）
 * - L3级槽位提示需要手动处理
 * - 迭代求解策略
 */

import Cube from 'cubejs'

const scramble = "D L2 B2 U2 F2 R2 D R2 D2 U' B2 L B' R' B D' U2 B' U' F L"
const cross = "F L F2 U B2"

console.log('=== F2L求解器 Final ===')
console.log()

// ============================================================
// 配置常量
// ============================================================

// 正确的索引映射
const INDICES = {
  // 棱块
  UF: [7, 19], UR: [5, 10], UB: [1, 46], UL: [3, 37],
  FR: [23, 12], FL: [21, 41], BL: [39, 47], BR: [48, 14],
  DF: [28, 25], DL: [30, 43], DB: [34, 52], DR: [32, 16],
  // 角块
  URF: [8, 20, 9], UFL: [6, 18, 38], ULB: [0, 36, 47], UBR: [2, 45, 11],
  DFR: [29, 26, 15], DFL: [27, 44, 24], DBL: [33, 42, 53], DBR: [35, 51, 17],
} as const

// F2L槽位数据
const SLOTS = {
  FR: { cornerIdx: INDICES.DFR, edgeIdx: INDICES.FR, colors: { corner: ['D', 'F', 'R'], edge: ['F', 'R'] } },
  FL: { cornerIdx: INDICES.DFL, edgeIdx: INDICES.FL, colors: { corner: ['D', 'F', 'L'], edge: ['F', 'L'] } },
  BL: { cornerIdx: INDICES.DBL, edgeIdx: INDICES.BL, colors: { corner: ['D', 'B', 'L'], edge: ['B', 'L'] } },
  BR: { cornerIdx: INDICES.DBR, edgeIdx: INDICES.BR, colors: { corner: ['D', 'B', 'R'], edge: ['B', 'R'] } },
} as const

// BFS移动集合
const SLOT_MOVES = {
  FR: ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'"],
  FL: ['U', "U'", 'U2', 'L', "L'", 'L2', 'F', "F'"],
  BL: ['U', "U'", 'U2', 'L', "L'", 'L2', 'B', "B'"],
  BR: ['U', "U'", 'U2', 'R', "R'", 'R2', 'B', "B'"],
} as const

// U层位置
const U_POSITIONS = {
  corners: ['URF', 'UFL', 'ULB', 'UBR'] as const,
  edges: ['UF', 'UR', 'UB', 'UL'] as const,
}

// ============================================================
// 状态检查函数
// ============================================================

function checkCross(cube: Cube): boolean {
  const state = cube.asString()
  return state[28] === 'D' && state[25] === 'F' &&
         state[32] === 'D' && state[16] === 'R' &&
         state[30] === 'D' && state[43] === 'L' &&
         state[34] === 'D' && state[52] === 'B'
}

function checkSlotSolved(cube: Cube, slot: keyof typeof SLOTS): boolean {
  const state = cube.asString()
  const data = SLOTS[slot]
  const colors = data.colors

  const cornerColors = [...state[data.cornerIdx[0]], state[data.cornerIdx[1]], state[data.cornerIdx[2]]].sort().join('')
  const edgeColors = [state[data.edgeIdx[0]], state[data.edgeIdx[1]]].sort().join('')

  const targetCorner = [...colors.corner].sort().join('')
  const targetEdge = [...colors.edge].sort().join('')

  return cornerColors === targetCorner && edgeColors === targetEdge
}

function findPiece(state: string, colors: readonly string[], type: 'corner' | 'edge'): { pos: string } {
  if (type === 'corner') {
    const positions = [
      { name: 'URF', idx: INDICES.URF }, { name: 'UFL', idx: INDICES.UFL },
      { name: 'ULB', idx: INDICES.ULB }, { name: 'UBR', idx: INDICES.UBR },
      { name: 'DFR', idx: INDICES.DFR }, { name: 'DFL', idx: INDICES.DFL },
      { name: 'DBL', idx: INDICES.DBL }, { name: 'DBR', idx: INDICES.DBR },
    ]
    const target = [...colors].sort().join('')
    for (const pos of positions) {
      const actual = [...state[pos.idx[0]], state[pos.idx[1]], state[pos.idx[2]]].sort().join('')
      if (actual === target) return { pos: pos.name }
    }
  } else {
    const positions = [
      { name: 'UF', idx: INDICES.UF }, { name: 'UR', idx: INDICES.UR },
      { name: 'UB', idx: INDICES.UB }, { name: 'UL', idx: INDICES.UL },
      { name: 'FR', idx: INDICES.FR }, { name: 'FL', idx: INDICES.FL },
      { name: 'BL', idx: INDICES.BL }, { name: 'BR', idx: INDICES.BR },
      { name: 'DF', idx: INDICES.DF }, { name: 'DL', idx: INDICES.DL },
      { name: 'DB', idx: INDICES.DB }, { name: 'DR', idx: INDICES.DR },
    ]
    const target = [...colors].sort().join('')
    for (const pos of positions) {
      const actual = [state[pos.idx[0]], state[pos.idx[1]]].sort().join('')
      if (actual === target) return { pos: pos.name }
    }
  }
  return { pos: 'unknown' }
}

// ============================================================
// F2L状态评估
// ============================================================

function evaluateF2LState(cube: Cube, slot: keyof typeof SLOTS): {
  level: number
  cornerPos: string
  edgePos: string
  cornerInU: boolean
  edgeInU: boolean
} {
  const state = cube.asString()
  const colors = SLOTS[slot].colors

  const cornerPos = findPiece(state, colors.corner, 'corner').pos
  const edgePos = findPiece(state, colors.edge, 'edge').pos

  const cornerInU = U_POSITIONS.corners.includes(cornerPos as any)
  const edgeInU = U_POSITIONS.edges.includes(edgePos as any)

  let level = 1
  if (cornerInU && edgeInU) level = 1
  else if (cornerInU || edgeInU) level = 2
  else level = 3

  return { level, cornerPos, edgePos, cornerInU, edgeInU }
}

// ============================================================
// BFS求解
// ============================================================

function solveSlotBFS(cube: Cube, slot: keyof typeof SLOTS, maxDepth: number = 6): string | null {
  const moves = SLOT_MOVES[slot]
  let queue: string[] = ['']

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextQueue: string[] = []

    for (const formula of queue) {
      for (const move of moves) {
        // 跳过冗余移动
        if (formula.length > 0) {
          const lastMove = formula.split(' ').pop()!
          const lastBase = lastMove[0]
          const moveBase = move[0]

          if ((lastMove === 'R' && move === "R'") || (lastMove === "R'" && move === 'R') ||
              (lastMove === 'L' && move === "L'") || (lastMove === "L'" && move === 'L') ||
              (lastMove === 'F' && move === "F'") || (lastMove === "F'" && move === 'F') ||
              (lastMove === 'B' && move === "B'") || (lastMove === "B'" && move === 'B')) {
            continue
          }

          if (lastBase === moveBase) continue
        }

        const newFormula = formula ? formula + ' ' + move : move

        try {
          const testCube = new Cube(cube)
          testCube.move(newFormula)

          if (checkSlotSolved(testCube, slot) && checkCross(testCube)) {
            return newFormula
          }

          nextQueue.push(newFormula)
        } catch (e) {
          // 忽略
        }
      }
    }

    queue = nextQueue
  }

  return null
}

// ============================================================
// 主求解器
// ============================================================

function solveF2L(cube: Cube): { solution: string; steps: number; details: string[]; allSolved: boolean } {
  const details: string[] = []
  const solutionParts: string[] = []
  const slots: Array<keyof typeof SLOTS> = ['FR', 'FL', 'BL', 'BR']

  // 迭代求解：每轮重新评估状态
  for (let round = 1; round <= 10; round++) {
    // 检查已完成和未完成的槽位
    const solved = slots.filter(s => checkSlotSolved(cube, s))
    const unsolved = slots.filter(s => !checkSlotSolved(cube, s))

    if (unsolved.length === 0) {
      details.push(`第${round}轮: 所有槽位已完成`)
      break
    }

    // 评估未完成槽位
    const evals = unsolved.map(slot => ({
      slot,
      state: evaluateF2LState(cube, slot),
    }))

    // 找L1/L2级槽位
    const simpleSlots = evals.filter(e => e.state.level <= 2)

    if (simpleSlots.length > 0) {
      // 按级别排序
      simpleSlots.sort((a, b) => a.state.level - b.state.level)
      const target = simpleSlots[0]

      details.push(`第${round}轮: 求解${target.slot} (L${target.state.level}, 角:${target.state.cornerPos}, 棱:${target.state.edgePos})`)

      const formula = solveSlotBFS(cube, target.slot, 6)
      if (formula) {
        details.push(`  → ${formula}`)
        cube.move(formula)
        solutionParts.push(formula)
      } else {
        details.push(`  → ❌ 未找到公式`)
      }
    } else {
      // 只有L3级槽位
      details.push(`第${round}轮: 只剩L3级槽位，无法自动求解`)
      details.push(`  提示: ${unsolved.join(', ')} 需要手动提取或更复杂处理`)
      break
    }
  }

  const allSolved = slots.every(s => checkSlotSolved(cube, s))

  return {
    solution: solutionParts.join(' '),
    steps: solutionParts.join(' ').split(' ').filter(s => s).length,
    details,
    allSolved,
  }
}

// ============================================================
// 测试
// ============================================================

const cube = new Cube()
cube.move(scramble)
cube.move(cross)

console.log('Cross完成:', checkCross(cube))
console.log()

console.log('初始状态:')
for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
  const st = evaluateF2LState(cube, slot)
  const solved = checkSlotSolved(cube, slot)
  console.log(`  ${slot}: L${st.level} ${solved ? '✅' : ''} (角:${st.cornerPos}, 棱:${st.edgePos})`)
}
console.log()

console.log('开始求解...')
console.log()

const startTime = Date.now()
const result = solveF2L(cube)
const elapsed = Date.now() - startTime

for (const detail of result.details) {
  console.log(detail)
}

console.log()
console.log('=== 结果 ===')
console.log(`解法: ${result.solution || '(部分完成)'}`)
console.log(`步数: ${result.steps}`)
console.log(`耗时: ${elapsed}ms`)
console.log()

// 验证
console.log('最终验证:')
for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
  const solved = checkSlotSolved(cube, slot)
  console.log(`  ${slot}: ${solved ? '✅' : '❌'}`)
}
console.log(`  Cross: ${checkCross(cube) ? '✅' : '❌'}`)
console.log()
console.log(`F2L完成: ${result.allSolved ? '✅' : '⚠️ 部分 (L3级槽位需要手动处理)'}`)

// 导出配置供其他模块使用
export const CONFIG = {
  INDICES,
  SLOTS,
  SLOT_MOVES,
  U_POSITIONS,
}
