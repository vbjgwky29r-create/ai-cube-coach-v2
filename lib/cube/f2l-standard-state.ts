/**
 * 基于标态的F2L求解器
 * 
 * 标态原理：
 * 1. 角块和棱块都在U层
 * 2. 角块和棱块相邻（共用一条边）
 * 3. 可以直接用标准公式配对插入
 */

import Cube from 'cubejs'

const scramble = "D L2 B2 U2 F2 R2 D R2 D2 U' B2 L B' R' B D' U2 B' U' F L"
const cross = "F L F2 U B2"

console.log('=== 基于标态的F2L求解器 ===')
console.log()

// ============================================================
// 常量定义
// ============================================================

const INDICES = {
  UF: [7, 19], UR: [5, 10], UB: [1, 46], UL: [3, 37],
  FR: [23, 12], FL: [21, 41], BL: [39, 47], BR: [48, 14],
  DF: [28, 25], DL: [30, 43], DB: [34, 52], DR: [32, 16],
  URF: [8, 20, 9], UFL: [6, 18, 38], ULB: [0, 36, 47], UBR: [2, 45, 11],
  DFR: [29, 26, 15], DFL: [27, 44, 24], DBL: [33, 42, 53], DBR: [35, 51, 17],
} as const

// 标态位置定义：每个槽位的标态角块位置和可选的棱块位置
const STANDARD_POSITIONS = {
  FR: { corner: 'URF', edges: ['UF', 'UR'] },
  FL: { corner: 'UFL', edges: ['UF', 'UL'] },
  BL: { corner: 'ULB', edges: ['UL', 'UB'] },
  BR: { corner: 'UBR', edges: ['UB', 'UR'] },
} as const

// U层相邻关系（判断是否标态）
const U_ADJACENCY: Record<string, string[]> = {
  'URF': ['UF', 'UR'],  // URF角块与UF、UR棱块相邻
  'UFL': ['UF', 'UL'],
  'ULB': ['UL', 'UB'],
  'UBR': ['UB', 'UR'],
}

// 槽位数据
const SLOTS = {
  FR: { cornerIdx: INDICES.DFR, edgeIdx: INDICES.FR, colors: { corner: ['D', 'F', 'R'], edge: ['F', 'R'] } },
  FL: { cornerIdx: INDICES.DFL, edgeIdx: INDICES.FL, colors: { corner: ['D', 'F', 'L'], edge: ['F', 'L'] } },
  BL: { cornerIdx: INDICES.DBL, edgeIdx: INDICES.BL, colors: { corner: ['D', 'B', 'L'], edge: ['B', 'L'] } },
  BR: { cornerIdx: INDICES.DBR, edgeIdx: INDICES.BR, colors: { corner: ['D', 'B', 'R'], edge: ['B', 'R'] } },
} as const

// ============================================================
// 工具函数
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
// 标态检查函数
// ============================================================

/**
 * 检查槽位是否处于标态
 * @returns 是否标态 + 详细信息
 */
function checkStandardState(cube: Cube, slot: keyof typeof SLOTS): {
  isStandard: boolean
  cornerInU: boolean
  edgeInU: boolean
  cornerPos: string
  edgePos: string
  cornerAtStandard: boolean  // 角块是否在标态角块位置
  edgeAtStandard: boolean   // 棱块是否在标态棱块位置（与角块相邻）
  needUAdjustment: string | null  // 需要的U调整
} {
  const state = cube.asString()
  const colors = SLOTS[slot].colors
  const standardPos = STANDARD_POSITIONS[slot]

  const cornerPos = findPiece(state, colors.corner, 'corner').pos
  const edgePos = findPiece(state, colors.edge, 'edge').pos

  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']

  const cornerInU = uCorners.includes(cornerPos)
  const edgeInU = uEdges.includes(edgePos)

  // 检查角块是否在标态角块位置
  const cornerAtStandard = cornerPos === standardPos.corner

  // 检查棱块是否在标态棱块位置（与角块相邻）
  let edgeAtStandard = false
  let needUAdjustment: string | null = null

  if (cornerAtStandard && edgeInU) {
    // 角块在标态位置，检查棱块是否在相邻位置
    const adjacentEdges = U_ADJACENCY[cornerPos]
    edgeAtStandard = adjacentEdges.includes(edgePos)
  }

  // 如果块都在U层但不在标态，计算需要的U调整
  if (cornerInU && edgeInU && !cornerAtStandard) {
    // 需要U调整把角块移到标态位置
    const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
    const currentIndex = uCorners.indexOf(cornerPos as any)
    const targetIndex = uCorners.indexOf(standardPos.corner)
    
    if (currentIndex >= 0 && targetIndex >= 0) {
      const diff = (targetIndex - currentIndex + 4) % 4
      if (diff === 1) needUAdjustment = 'U'
      else if (diff === 2) needUAdjustment = 'U2'
      else if (diff === 3) needUAdjustment = "U'"
    }
  }

  // 标态定义：都在U层 + 角块在标态位置 + 棱块在相邻位置
  const isStandard = cornerInU && edgeInU && cornerAtStandard && edgeAtStandard

  return {
    isStandard,
    cornerInU,
    edgeInU,
    cornerPos,
    edgePos,
    cornerAtStandard,
    edgeAtStandard,
    needUAdjustment,
  }
}

// ============================================================
// 标准F2L公式库
// ============================================================

// 标态插入公式（角块和棱块已配对）
const STANDARD_INSERT_FORMULAS: Record<string, string[]> = {
  FR: ['R U R\'', 'U R U\' R\'', 'R U\' R\' U R U\' R\''],
  FL: ['L\' U\' L', 'U\' L\' U L', 'L\' U L U\' L\' U L'],
  BL: ['L U L\'', 'U L U\' L\'', 'L U\' L\' U L U\' L\''],
  BR: ['R\' U\' R', 'U R\' U\' R', 'R\' U R U\' R\' U R'],
}

// ============================================================
// 求解函数
// ============================================================

/**
 * 求解单个F2L槽位（基于标态）
 */
function solveF2LSlotWithStandard(cube: Cube, slot: keyof typeof SLOTS): string | null {
  // 检查是否已解决
  if (checkSlotSolved(cube, slot)) {
    return ''
  }

  const state = checkStandardState(cube, slot)
  console.log(`  ${slot} 标态检查: ${JSON.stringify(state)}`)

  // 情况1: 已经是标态
  if (state.isStandard) {
    // 尝试标准插入公式
    const formulas = STANDARD_INSERT_FORMULAS[slot]
    for (const formula of formulas) {
      const testCube = new Cube(cube)
      testCube.move(formula)
      if (checkSlotSolved(testCube, slot) && checkCross(testCube)) {
        console.log(`  ${slot} 标态 -> 使用公式: ${formula}`)
        return formula
      }
    }
  }

  // 情况2: 都在U层，但不在标态位置
  if (state.cornerInU && state.edgeInU) {
    // 需要U调整
    if (state.needUAdjustment) {
      console.log(`  ${slot} 需要U调整: ${state.needUAdjustment}`)
      const testCube = new Cube(cube)
      testCube.move(state.needUAdjustment)
      
      // 调整后重新检查是否标态
      const afterAdjust = checkStandardState(testCube, slot)
      if (afterAdjust.isStandard) {
        // 尝试标准插入
        const formulas = STANDARD_INSERT_FORMULAS[slot]
        for (const formula of formulas) {
          const innerCube = new Cube(testCube)
          innerCube.move(formula)
          if (checkSlotSolved(innerCube, slot) && checkCross(innerCube)) {
            const fullFormula = state.needUAdjustment + ' ' + formula
            console.log(`  ${slot} U调整后使用公式: ${fullFormula}`)
            return fullFormula
          }
        }
      }
    }
  }

  // 情况3: 不都在U层，需要提取或使用BFS
  console.log(`  ${slot} 需要BFS搜索...`)
  return solveBFS(cube, slot, 6)
}

function solveBFS(cube: Cube, slot: keyof typeof SLOTS, maxDepth: number = 6): string | null {
  const slotMoves: Record<string, string[]> = {
    FR: ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'"],
    FL: ['U', "U'", 'U2', 'L', "L'", 'L2', 'F', "F'"],
    BL: ['U', "U'", 'U2', 'L', "L'", 'L2', 'B', "B'"],
    BR: ['U', "U'", 'U2', 'R', "R'", 'R2', 'B', "B'"],
  }

  const moves = slotMoves[slot]
  let queue: string[] = ['']

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextQueue: string[] = []

    for (const formula of queue) {
      for (const move of moves) {
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
            console.log(`  ${slot} BFS找到解: ${newFormula}`)
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

function solveF2L(cube: Cube): { solution: string; steps: number; details: string[] } {
  const details: string[] = []
  const solutionParts: string[] = []
  const slots: Array<keyof typeof SLOTS> = ['FR', 'FL', 'BL', 'BR']

  // 按复杂度排序：先检查标态，再检查非标态
  const evals = slots.map(slot => {
    const state = checkStandardState(cube, slot)
    return {
      slot,
      solved: checkSlotSolved(cube, slot),
      state,
      priority: state.isStandard ? 0 : (state.cornerInU && state.edgeInU ? 1 : 2),
    }
  })

  evals.sort((a, b) => {
    if (a.solved && !b.solved) return -1
    if (!a.solved && b.solved) return 1
    return a.priority - b.priority
  })

  for (const { slot, state } of evals) {
    if (checkSlotSolved(cube, slot)) {
      details.push(`${slot}: ✅ 已完成`)
      continue
    }

    const stateDesc = state.isStandard ? '标态' : 
                      (state.cornerInU && state.edgeInU ? 'U层非标态' : '非U层')
    details.push(`${slot}: ${stateDesc} (角:${state.cornerPos}, 棱:${state.edgePos})`)

    const formula = solveF2LSlotWithStandard(cube, slot)
    if (formula) {
      details.push(`  → ${formula}`)
      cube.move(formula)
      solutionParts.push(formula)
    } else {
      details.push(`  → ❌ 未找到公式`)
    }
  }

  return {
    solution: solutionParts.join(' '),
    steps: solutionParts.join(' ').split(' ').filter(s => s).length,
    details
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

console.log('=== 标态分析 ===')
for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
  const state = checkStandardState(cube, slot)
  const status = state.isStandard ? '✅ 标态' : 
                (state.cornerInU && state.edgeInU ? '⚠️ U层非标态' : '❌ 非U层')
  console.log(`${slot}: ${status}`)
  console.log(`  角块: ${state.cornerPos} (标态位: ${STANDARD_POSITIONS[slot].corner}) ${state.cornerAtStandard ? '✅' : '❌'}`)
  console.log(`  棱块: ${state.edgePos} (标态位: ${STANDARD_POSITIONS[slot].edges.join('/')}) ${state.edgeAtStandard ? '✅' : '❌'}`)
  console.log(`  相邻: ${state.cornerAtStandard && state.edgeAtStandard ? '✅' : '❌'}`)
  if (state.needUAdjustment) {
    console.log(`  需要调整: ${state.needUAdjustment}`)
  }
  console.log()
}

console.log('=== 开始求解 ===')
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

// 验证
console.log()
console.log('最终验证:')
for (const slot of ['FR', 'FL', 'BL', 'BR'] as const) {
  const solved = checkSlotSolved(cube, slot)
  console.log(`  ${slot}: ${solved ? '✅' : '❌'}`)
}
console.log(`  Cross: ${checkCross(cube) ? '✅' : '❌'}`)
