/**
 * F2L求解器 v3 - 修复版
 *
 * 关键修复：
 * 1. 使用正确的 cubejs 索引（来自 constants.ts）
 * 2. checkSlotComplete 检查每个贴纸的实际颜色，而不仅仅是排序匹配
 * 3. F2L完成 = 前2层100%正确
 */

import Cube from 'cubejs'
import {
  SLOTS,
  COLORS,
  checkCrossComplete,
  type Slot,
} from '../ube/constants'

// ============================================================
// 正确的F2L槽位验证
// ============================================================

/**
 * 检查单个F2L槽位是否**真正**完成
 *
 * 槽位完成的严格条件：
 * 1. 角块的3个贴纸分别显示正确的颜色
 * 2. 棱块的2个贴纸分别显示正确的颜色
 * 3. 角块D面朝下（state[cornerIndices[0]] === 'D'）
 *
 * 注意：这里检查的是**贴纸的实际颜色**，不是排序后的颜色！
 * 排序检查会误判：例如 [F, R, D] 排序后和 [D, F, R] 相同，但朝向完全不同！
 */
export function checkSlotComplete(state: string, slot: Slot): boolean {
  const slotData = SLOTS[slot]

  // 检查角块：每个贴纸必须显示正确的颜色
  // cornerIndices: [D面索引, F面索引, R面索引] (以FR为例)
  const cornerCorrect =
    state[slotData.cornerIndices[0]] === slotData.cornerColors[0] &&  // D面贴纸 = D颜色
    state[slotData.cornerIndices[1]] === slotData.cornerColors[1] &&  // F面贴纸 = F颜色
    state[slotData.cornerIndices[2]] === slotData.cornerColors[2]     // R面贴纸 = R颜色

  // 检查棱块：每个贴纸必须显示正确的颜色
  // edgeIndices: [F面索引, R面索引] (以FR为例)
  const edgeCorrect =
    state[slotData.edgeIndices[0]] === slotData.edgeColors[0] &&  // F面贴纸 = F颜色
    state[slotData.edgeIndices[1]] === slotData.edgeColors[1]     // R面贴纸 = R颜色

  return cornerCorrect && edgeCorrect
}

/**
 * 检查F2L是否完成（前两层是否完成）
 *
 * F2L完成 = 4个槽位都完成 + Cross完整
 */
export function checkF2LComplete(state: string): boolean {
  return (
    checkCrossComplete(state) &&
    checkSlotComplete(state, 'FR') &&
    checkSlotComplete(state, 'FL') &&
    checkSlotComplete(state, 'BL') &&
    checkSlotComplete(state, 'BR')
  )
}

/**
 * 检查中层是否完成
 *
 * 中层完成 = F/R/B/L面的中间行显示正确的颜色
 * F面中间行: 19, 22, 25 应该都是 F
 * R面中间行: 10, 13, 16 应该都是 R
 * B面中间行: 46, 49, 52 应该都是 B
 * L面中间行: 37, 40, 43 应该都是 L
 */
export function checkMiddleLayerComplete(state: string): boolean {
  // F面中间行 (19, 22, 25)
  const fMiddle = state[19] === COLORS.F && state[22] === COLORS.F && state[25] === COLORS.F
  // R面中间行 (10, 13, 16)
  const rMiddle = state[10] === COLORS.R && state[13] === COLORS.R && state[16] === COLORS.R
  // B面中间行 (46, 49, 52)
  const bMiddle = state[46] === COLORS.B && state[49] === COLORS.B && state[52] === COLORS.B
  // L面中间行 (37, 40, 43)
  const lMiddle = state[37] === COLORS.L && state[40] === COLORS.L && state[43] === COLORS.L

  return fMiddle && rMiddle && bMiddle && lMiddle
}

// ============================================================
// 块位置检测 (使用正确的索引)
// ============================================================

interface PiecePosition {
  pos: string
  layer: string
  inSlot?: boolean
}

const U_CORNERS = ['URF', 'UFL', 'ULB', 'UBR'] as const
const D_CORNERS = ['DFR', 'DFL', 'DBL', 'DBR'] as const
const U_EDGES = ['UF', 'UR', 'UB', 'UL'] as const
const MIDDLE_EDGES = ['FR', 'FL', 'BL', 'BR'] as const

// 正确的角块索引 (来自 constants.ts)
const CORNER_INDICES = {
  URF: [8, 20, 9],   UFL: [6, 18, 38],  ULB: [0, 36, 47],  UBR: [2, 45, 11],
  DFR: [29, 26, 15], DFL: [27, 44, 24], DBL: [33, 42, 53], DBR: [35, 51, 17],
} as const

// 正确的棱块索引 (来自 constants.ts)
const EDGE_INDICES = {
  UF: [7, 19],   UR: [5, 10],   UB: [1, 46],   UL: [3, 37],
  FR: [23, 12],  FL: [21, 41],  BL: [39, 47],  BR: [48, 14],
} as const

function findPiecePosition(state: string, colors: string[], type: 'corner' | 'edge'): PiecePosition {
  const sortedColors = colors.slice().sort().join('')

  if (type === 'corner') {
    // 检查U层角块
    for (const pos of U_CORNERS) {
      if (checkCornerMatch(state, pos, sortedColors)) {
        return { pos, layer: 'U', inSlot: false }
      }
    }
    // 检查D层角块
    for (const pos of D_CORNERS) {
      if (checkCornerMatch(state, pos, sortedColors)) {
        return { pos, layer: 'D', inSlot: true }
      }
    }
  } else {
    // 检查U层棱块
    for (const pos of U_EDGES) {
      if (checkEdgeMatch(state, pos, colors)) {
        return { pos, layer: 'U', inSlot: false }
      }
    }
    // 检查中层棱块
    for (const pos of MIDDLE_EDGES) {
      if (checkEdgeMatch(state, pos, colors)) {
        return { pos, layer: 'middle', inSlot: true }
      }
    }
  }

  return { pos: 'unknown', layer: 'unknown', inSlot: false }
}

function checkCornerMatch(state: string, pos: string, colors: string): boolean {
  const idx = CORNER_INDICES[pos as keyof typeof CORNER_INDICES]
  const actual = [state[idx[0]], state[idx[1]], state[idx[2]]].sort().join('')
  return actual === colors
}

function checkEdgeMatch(state: string, pos: string, colors: string[]): boolean {
  const idx = EDGE_INDICES[pos as keyof typeof EDGE_INDICES]
  const c1 = state[idx[0]]
  const c2 = state[idx[1]]
  return (c1 === colors[0] && c2 === colors[1]) || (c1 === colors[1] && c2 === colors[0])
}

// ============================================================
// F2L公式库 (41种情况 × 4槽位)
// ============================================================

const F2L_FORMULAS: Record<Slot, string[]> = {
  'FR': [
    "R U R'", "R U R' U' R' U R", "R U' R' U R U' R'", "R' U R U' R' U' R",
    "R' U' R U R U R'", "U' R U R'", "U R U' R'",
    "U R U' R' U' R U R'", "R' U' R U R U R'", "R U R'",
    "U R U' R' U2 R U' R'", "R' U2 R U R' U' R", "U' R U R' U2 R U' R'",
    "U' R U' R' U R U R'", "R U' R' U2 R U R'", "U R U2 R' U' R U R'",
    "U' R U R' U R U' R'", "U R U2 R' U R U' R'", "U R U' R' U R U' R'",
    "U' F' U F U R U' R'", "U2 R U R' U R U' R'", "U2 R U' R' U' R U R'",
    "U F R' F' R U' R U R'", "U R U' R' U' R U R'",
    "U' R' U R U' R' U R", "R U R' U' R U R' U' R U R'", "R U' R' U R U' R'",
    "U R U' R' U' R U R'", "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'",
    "U' R U' R' U R U R'", "U R U' R' U R U' R'", "U R U' R' U' R U R'",
    "U2 R U' R' U R U' R'", "U' F' U F U R U' R'", "U R U' R' U' R U' R' U R U' R'",
    "R U' R' U' R U R' U' R U R'", "R U R' F R' F' R U R'", "R U R' U' R U R' U' R U R'",
  ],
  'FL': [
    "L' U' L", "U L' U' L", "U' L' U L", "U L' U L U' L' U L",
    "L U L' U' L' U' L", "L' U' L", "U' L' U L U2 L' U L", "L U2 L' U' L U L'",
    "U L' U' L U2 L' U L", "U L' U L U' L' U' L", "L' U L U2 L' U' L'",
    "U' L' U2 L U L' U' L'", "U L' U' L U' L' U L", "U' L' U2 L U' L' U L",
    "L' U' L U L' U' L", "U2 L' U L U L' U' L'", "U' L' U L U' L' U L",
    "U F U' F' U' L' U L", "U2 L' U' L U' L' U L", "U2 L' U L U L' U' L'",
    "U' F' L F L' U L' U' L'", "U' L' U L U L' U' L'", "U L U' L' U L U' L'",
    "L' U' L U L' U' L U L' U' L'", "L' U L U' L' U L", "U' L' U L U L' U' L'",
    "L' U L U2 L' U L U' L' U L", "L' U L U' L' U L", "U L' U L U' L' U' L",
    "U' L' U L U' L' U L", "U' L' U L U L' U' L'", "U2 L' U L U' L' U L",
    "U F U' F' U' L' U L", "U' L' U L U L' U L U' L' U L",
    "L' U L U L' U' L U L' U' L'", "L' U' L F' L F L' U' L'", "L' U' L U L' U' L U L' U' L'",
  ],
  'BL': [
    "L U L'", "U' L U' L'", "U L U' L'", "U' L U' L' U L U L'",
    "L' U' L U L U L", "L U L'", "U L' U L' U' L U L'", "L' U2 L U' L' U L",
    "U' L U' L' U2 L U' L'", "U' L' U L U L' U L", "L' U' L U2 L' U' L",
    "U L' U2 L' U L' U L", "U' L U' L' U L U' L'", "U L' U2 L' U' L' U L",
    "L' U L' U' L' U L", "U2 L' U' L U L' U L", "U L' U L' U' L U L'",
    "U' F U' F' U' L U L'", "U2 L' U L' U' L U L'", "U2 L' U' L' U L' U L",
    "U F' L' F L U L' U L", "U' L U' L' U' L' U L", "U' L U L' U' L U L'",
    "L' U L' U' L' U L U' L U L'", "L' U' L U' L' U L", "U L' U' L U L' U L",
    "L' U' L U2 L' U' L U' L' U L", "L' U' L U' L' U L", "U L' U' L U L' U L",
    "U' L' U' L U' L' U L", "U' L' U' L U' L' U L", "U2 L' U' L' U' L' U L",
    "U F' U' F U' L U L'", "U' L' U' L' U' L' U' L U L' U L",
    "L' U' L' U L' U L' U L U L'", "L' U L' F' L' F L' U L", "L' U L' U' L' U L U' L' U L",
  ],
  'BR': [
    "R' U' R", "U R' U' R", "U' R' U R", "U R' U' R U' R U' R'",
    "R' U R U' R' U R", "R' U' R", "U' R U' R' U2 R' U R", "R U2 R' U' R U R'",
    "U R' U' R U2 R' U R", "U R U R' U' R' U' R", "R' U R U2 R' U R",
    "U' R U2 R' U R' U' R", "U R' U' R U R' U' R", "U' R U2 R' U R' U' R",
    "R' U R U' R' U R", "U2 R' U R U' R' U' R", "U' R U' R' U R' U' R",
    "U' F U F' U R' U' R", "U2 R' U' R U R' U' R", "U2 R' U R U R' U' R'",
    "U' F R F' R' U' R' U R", "U R' U' R U' R' U' R", "U R' U' R U R' U' R",
    "R U' R U R U' R' U R U' R'", "R U' R' U R U' R'", "U' R U R' U' R' U R",
    "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'", "U' R U R' U' R' U' R",
    "U R U' R' U R' U' R", "U R U' R' U' R' U' R", "U2 R' U R' U R' U' R",
    "U' F U F' U R' U' R", "U R U' R' U' R' U R' U' R U' R'",
    "R U R' U R U' R' U R U' R'", "R U' R F R F' R U' R'", "R U' R' U R U' R' U R U' R'",
  ],
}

// Setup moves
const SETUP_MOVES: Record<Slot, string[]> = {
  'FR': ['R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R', 'U', 'U\'', 'U2'],
  'FL': ['L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\'', 'U', 'U\'', 'U2'],
  'BL': ['L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L', 'U', 'U\'', 'U2'],
  'BR': ['R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\'', 'U', 'U\'', 'U2'],
}

function tryFormulas(cube: Cube, slot: Slot, setup: string): string {
  const formulas = F2L_FORMULAS[slot] || []

  for (const formula of formulas) {
    const test = new Cube(cube)

    // 应用setup
    if (setup) {
      try {
        test.move(setup)
      } catch {
        continue
      }
    }

    // 应用公式
    try {
      test.move(formula)
    } catch {
      continue
    }

    // 验证：槽位完成且十字完好
    if (checkSlotComplete(test.asString(), slot) && checkCrossComplete(test.asString())) {
      return formula
    }
  }

  return ''
}

// ============================================================
// 求解函数
// ============================================================

export interface F2LResult {
  solution: string
  steps: number
  success: boolean
  f2lComplete: boolean
  middleLayerComplete: boolean
}

function solveF2LSlot(cube: Cube, slot: Slot): string {
  // 如果已经完成，返回空
  if (checkSlotComplete(cube.asString(), slot)) {
    return ''
  }

  // 策略1: 直接尝试公式
  let formula = tryFormulas(cube, slot, '')
  if (formula) return formula

  // 策略2: 尝试setup moves
  for (const setup of SETUP_MOVES[slot]) {
    formula = tryFormulas(cube, slot, setup)
    if (formula) return setup + ' ' + formula
  }

  // 策略3: 尝试U调整 + setup + 公式
  for (const setup of SETUP_MOVES[slot].slice(0, 4)) {
    for (const u of ['U', 'U\'', 'U2']) {
      formula = tryFormulas(cube, slot, setup + ' ' + u)
      if (formula) return setup + ' ' + u + ' ' + formula
    }
  }

  return ''
}

export function solveF2L(cube: Cube): F2LResult {
  const solution: string[] = []

  // 分析所有槽位，按复杂度排序（块在U层的先解决）
  const slots: Slot[] = ['FR', 'FL', 'BL', 'BR']
  const slotComplexity = slots.map(slot => {
    const state = cube.asString()
    const colors = SLOTS[slot]
    const cornerPos = findPiecePosition(state, colors.cornerColors.slice(), 'corner')
    const edgePos = findPiecePosition(state, colors.edgeColors.slice(), 'edge')

    let score = 0
    if (cornerPos.layer === 'U') score += 1
    if (edgePos.layer === 'U') score += 1
    if (cornerPos.layer === 'D') score += 3
    if (edgePos.layer === 'middle' && edgePos.pos === slot) score += 2

    return { slot, score }
  })

  slotComplexity.sort((a, b) => a.score - b.score)

  for (const { slot } of slotComplexity) {
    const slotSol = solveF2LSlot(cube, slot)
    if (slotSol) {
      cube.move(slotSol)
      solution.push(slotSol)
    }
  }

  const finalState = cube.asString()

  return {
    solution: solution.join(' '),
    steps: solution.join(' ').split(' ').filter(s => s).length,
    success: checkF2LComplete(finalState),
    f2lComplete: checkF2LComplete(finalState),
    middleLayerComplete: checkMiddleLayerComplete(finalState),
  }
}

// ============================================================
// 导出辅助函数
// ============================================================

export { checkSlotComplete as checkSlotCompleteStrict }
export { findPiecePosition }
export { solveF2LSlot }
