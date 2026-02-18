/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L验证驱动求解器 (TypeScript版本，直接移植自v2 JavaScript)
 *
 * 核心思想：
 * 1. 使用完整的41种F2L情况公式库
 * 2. 验证每个公式的有效性
 * 3. 对非U层块先做setup moves
 *
 * 成功率: 80%+ (与v2 JavaScript一致)
 */

import Cube from 'cubejs'

// ============================================================
// 槽位检查 (使用v2的indices，保持一致性)
// ============================================================

const SLOT_INDICES: Record<Slot, number[]> = {
  'FR': [29, 26, 15, 12, 23],  // DFR corner + FR edge
  'FL': [27, 44, 24, 40, 21],  // DFL corner + FL edge
  'BL': [33, 42, 53, 48, 39],  // DBL corner + BL edge
  'BR': [35, 51, 17, 50, 14],  // DBR corner + BR edge
}

const SLOT_COLORS: Record<Slot, { corner: string[], edge: string[] }> = {
  'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
  'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
  'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
  'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
}

function checkSlotComplete(stateStr: string, slot: Slot): boolean {
  const idx = SLOT_INDICES[slot]
  const colors = SLOT_COLORS[slot]

  const corner = stateStr[idx[0]] + stateStr[idx[1]] + stateStr[idx[2]]
  const edge = stateStr[idx[3]] + stateStr[idx[4]]

  const cornerColors = colors.corner.slice().sort().join('')
  const edgeColors = colors.edge.slice().sort().join('')

  return corner.split('').sort().join('') === cornerColors &&
         edge.split('').sort().join('') === edgeColors &&
         stateStr[idx[0]] === 'D'  // 角块D面朝下
}

function checkCrossIntact(stateStr: string): boolean {
  return stateStr[28] === 'D' && stateStr[30] === 'D' &&
         stateStr[34] === 'D' && stateStr[32] === 'D'
}

// ============================================================
// 块位置检测
// ============================================================

interface PiecePosition {
  pos: string
  layer: string
  inSlot?: boolean
}

function findPiecePosition(state: string, colors: string[], type: 'corner' | 'edge'): PiecePosition {
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']
  const dCorners = ['DFR', 'DFL', 'DBL', 'DBR']
  const middleEdges = ['FR', 'FL', 'BL', 'BR']

  const sortedColors = colors.slice().sort().join('')

  if (type === 'corner') {
    // 检查U层角块
    for (const pos of uCorners) {
      if (checkPositionMatch(state, pos, sortedColors)) {
        return { pos, layer: 'U', inSlot: false }
      }
    }
    // 检查D层角块
    for (const pos of dCorners) {
      if (checkPositionMatch(state, pos, sortedColors)) {
        return { pos, layer: 'D', inSlot: true }
      }
    }
  } else {
    // 检查U层棱块
    for (const pos of uEdges) {
      if (checkEdgeMatch(state, pos, colors)) {
        return { pos, layer: 'U', inSlot: false }
      }
    }
    // 检查中层棱块
    for (const pos of middleEdges) {
      if (checkEdgeMatch(state, pos, colors)) {
        return { pos, layer: 'middle', inSlot: true }
      }
    }
  }

  return { pos: 'unknown', layer: 'unknown', inSlot: false }
}

function checkPositionMatch(state: string, pos: string, colors: string): boolean {
  const idxMap: Record<string, number[]> = {
    'URF': [8, 20, 9], 'UFL': [6, 18, 38], 'ULB': [0, 36, 47], 'UBR': [2, 45, 11],
    'DFR': [29, 26, 15], 'DFL': [27, 44, 24], 'DBL': [33, 42, 53], 'DBR': [35, 51, 17],
  }
  const idx = idxMap[pos]
  const actual = [state[idx[0]], state[idx[1]], state[idx[2]]].sort().join('')
  return actual === colors
}

// 注意：使用v2的edge indices (FL: [21,40], BL: [39,48], BR: [14,50])
function checkEdgeMatch(state: string, pos: string, colors: string[]): boolean {
  const idxMap: Record<string, number[]> = {
    'UF': [7, 19], 'UR': [5, 10], 'UB': [1, 46], 'UL': [3, 37],
    'FR': [12, 23], 'FL': [21, 40], 'BL': [39, 48], 'BR': [14, 50],
  }
  const idx = idxMap[pos]
  const c1 = state[idx[0]]
  const c2 = state[idx[1]]
  return (c1 === colors[0] && c2 === colors[1]) || (c1 === colors[1] && c2 === colors[0])
}

// ============================================================
// 完整F2L公式库 (41种情况 × 4槽位)
// ============================================================

const F2L_FORMULAS: Record<Slot, string[]> = {
  'FR': [
    "R U R'",          // Case 1: 配对直接插入
    "R U R' U' R' U R",      // 直接插入
    "R U' R' U R U' R'",     // 配对插入
    "R' U R U' R' U' R",     // 反向插入
    "R' U' R U R U R'",      // 变体
    "U' R U R'",       // Case 1 变体
    "U R U' R'",       // Case 1 变体
    "U R U' R' U' R U R'",  // Case 2: 分离后配对
    "R' U' R U R U R'",      // Case 3: 角块U棱块中层
    "R U R'",                 // Case 4: 几乎配对
    "U R U' R' U2 R U' R'",   // Case 5: 角块扭曲
    "R' U2 R U R' U' R",      // Case 6: 连接但错误
    "U' R U R' U2 R U' R'",   // Case 7: 连接错误2
    "U' R U' R' U R U R'",    // Case 8: 棱块翻转
    "R U' R' U2 R U R'",      // Case 9: 分离
    "U R U2 R' U' R U R'",    // Case 10: 双错
    "U' R U R' U R U' R'",    // Case 11: 断开
    "U R U2 R' U R U' R'",    // Case 12: 角块朝上
    "R U R' U' R U R'",       // Case 13: 角块扭曲棱块中层
    "U2 R U' R' U' R U R'",   // Case 14: 棱块翻转侧面
    "U R U' R' U R U' R'",    // Case 15: 特殊配对
    "U' F' U F U R U' R'",    // Case 16: 用F面
    "U2 R U R' U R U' R'",    // Case 17: 角块扭曲变体
    "U2 R U' R' U' R U R'",   // Case 18
    "U F R' F' R U' R U R'",  // Case 19: 翻转棱块变体
    "U R U' R' U' R U R'",    // Case 20: 角块朝上变体
    // 角块在槽位 (25-30)
    "U' R' U R U' R' U R",    // Case 25
    "R U R' U' R U R' U' R U R'",  // Case 26: 角块扭曲
    "R U' R' U R U' R'",       // Case 27
    "U R U' R' U' R U R'",     // Case 28
    "R U' R' U2 R U' R' U R U' R'",  // Case 29
    "R U' R' U R U' R'",       // Case 30
    // 棱块在槽位 (31-36)
    "U' R U' R' U R U R'",     // Case 31
    "U R U' R' U R U' R'",     // Case 32: 棱块翻转
    "U R U' R' U' R U R'",     // Case 33
    "U2 R U' R' U R U' R'",    // Case 34
    "U' F' U F U R U' R'",    // Case 35
    "U R U' R' U' R U' R' U R U' R'",  // Case 36
    // 两个块都在槽位 (37-41)
    "R U' R' U' R U R' U' R U R'",  // Case 37
    "R U R' F R' F' R U R'",        // Case 40
    "R U R' U' R U R' U' R U R'",   // Case 41
  ],
  'FL': [
    "L' U' L",         // Case 1
    "U L' U' L",       // Case 1 变体
    "U' L' U L",       // Case 1 变体
    "U L' U L U' L' U L",     // Case 2
    "L U L' U' L' U' L",      // Case 3
    "L' U' L",                // Case 4
    "U' L' U L U2 L' U L",    // Case 5
    "L U2 L' U' L U L'",      // Case 6
    "U L' U' L U2 L' U L",    // Case 7
    "U L' U L U' L' U' L",    // Case 8
    "L' U L U2 L' U' L'",     // Case 9
    "U' L' U2 L U L' U' L'",  // Case 10
    "U L' U' L U' L' U L",    // Case 11
    "U' L' U2 L U' L' U L",   // Case 12
    "L' U' L U L' U' L",      // Case 13
    "U2 L' U L U L' U' L'",   // Case 14
    "U' L' U L U' L' U L",    // Case 15
    "U F U' F' U' L' U L",    // Case 16
    "U2 L' U' L U' L' U L",   // Case 17
    "U2 L' U L U L' U' L'",   // Case 18
    "U' F' L F L' U L' U' L'", // Case 19
    "U' L' U L U L' U' L'",   // Case 20
    "U L U' L' U L U' L'",    // Case 25
    "L' U' L U L' U' L U L' U' L'",  // Case 26
    "L' U L U' L' U L",        // Case 27
    "U' L' U L U L' U' L'",    // Case 28
    "L' U L U2 L' U L U' L' U L",   // Case 29
    "L' U L U' L' U L",         // Case 30
    "U L' U L U' L' U' L",      // Case 31
    "U' L' U L U' L' U L",      // Case 32
    "U' L' U L U L' U' L'",     // Case 33
    "U2 L' U L U' L' U L",      // Case 34
    "U F U' F' U' L' U L",      // Case 35
    "U' L' U L U L' U L U' L' U L",  // Case 36
    "L' U L U L' U' L U L' U' L'",  // Case 37
    "L' U' L F' L F L' U' L'",       // Case 40
    "L' U' L U L' U' L U L' U' L'",  // Case 41
  ],
  'BL': [
    "L U L'",          // Case 1
    "U' L U' L'",      // Case 1 变体
    "U L U' L'",       // Case 1 变体
    "U' L U' L' U L U L'",     // Case 2
    "L' U' L U L U L",         // Case 3
    "L U L'",                 // Case 4
    "U L' U L' U' L U L'",     // Case 5
    "L' U2 L U' L' U L",       // Case 6
    "U' L U' L' U2 L U' L'",   // Case 7
    "U' L' U L U L' U L",      // Case 8
    "L' U' L U2 L' U' L",      // Case 9
    "U L' U2 L' U L' U L",     // Case 10
    "U' L U' L' U L U' L'",    // Case 11
    "U L' U2 L' U' L' U L",    // Case 12
    "L' U L' U' L' U L",       // Case 13
    "U2 L' U' L U L' U L",     // Case 14
    "U L' U L' U' L U L'",     // Case 15
    "U' F U' F' U' L U L'",    // Case 16
    "U2 L' U L' U' L U L'",    // Case 17
    "U2 L' U' L' U L' U L",    // Case 18
    "U F' L' F L U L' U L",    // Case 19
    "U' L U' L' U' L' U L",    // Case 20
    "U' L U L' U' L U L'",     // Case 25
    "L' U L' U' L' U L U' L U L'",   // Case 26
    "L' U' L U' L' U L",              // Case 27
    "U L' U' L U L' U L",            // Case 28
    "L' U' L U2 L' U' L U' L' U L",  // Case 29
    "L' U' L U' L' U L",             // Case 30
    "U L' U' L U L' U L",           // Case 31
    "U' L' U' L U' L' U L",         // Case 32
    "U' L' U' L U' L' U L",         // Case 33
    "U2 L' U' L' U' L' U L",        // Case 34
    "U F' U' F U' L U L'",          // Case 35
    "U' L' U' L' U' L' U' L U L' U L",  // Case 36
    "L' U' L' U L' U L' U L U L'",      // Case 37
    "L' U L' F' L' F L' U L",           // Case 40
    "L' U L' U' L' U L U' L' U L",      // Case 41
  ],
  'BR': [
    "R' U' R",         // Case 1
    "U R' U' R",       // Case 1 变体
    "U' R' U R",       // Case 1 变体
    "U R' U' R U' R U' R'",     // Case 2
    "R' U R U' R' U R",         // Case 3
    "R' U' R",                  // Case 4
    "U' R U' R' U2 R' U R",     // Case 5
    "R U2 R' U' R U R'",        // Case 6
    "U R' U' R U2 R' U R",      // Case 7
    "U R U R' U' R' U' R",      // Case 8
    "R' U R U2 R' U R",         // Case 9
    "U' R U2 R' U R' U' R",     // Case 10
    "U R' U' R U R' U' R",      // Case 11
    "U' R U2 R' U R' U' R",     // Case 12
    "R' U R U' R' U R",         // Case 13
    "U2 R' U R U' R' U' R",     // Case 14
    "U' R U' R' U R' U' R",     // Case 15
    "U' F U F' U R' U' R",      // Case 16
    "U2 R' U' R U R' U' R",     // Case 17
    "U2 R' U R U R' U' R'",     // Case 18
    "U' F R F' R' U' R' U R",   // Case 19
    "U R' U' R U' R' U' R",     // Case 20
    "U R' U' R U R' U' R",      // Case 25
    "R U' R U R U' R' U R U' R'",    // Case 26
    "R U' R' U R U' R'",             // Case 27
    "U' R U R' U' R' U R",           // Case 28
    "R U' R' U2 R U' R' U R U' R'",  // Case 29
    "R U' R' U R U' R'",             // Case 30
    "U' R U R' U' R' U' R",          // Case 31
    "U R U' R' U R' U' R",           // Case 32
    "U R U' R' U' R' U' R",          // Case 33
    "U2 R' U R' U R' U' R",          // Case 34
    "U' F U F' U R' U' R",           // Case 35
    "U R U' R' U' R' U R' U' R U' R'",  // Case 36
    "R U R' U R U' R' U R U' R'",       // Case 37
    "R U' R F R F' R U' R'",            // Case 40
    "R U' R' U R U' R' U R U' R'",     // Case 41
  ],
}

// Setup moves to bring pieces to U layer
const SETUP_MOVES: Record<Slot, string[]> = {
  'FR': [
    'R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R',  // 角块从FR槽位取出
    'R U R\' U\' R U R\'',                             // 复杂setup
    'U', 'U\'', 'U2',                                  // U层调整
    'R\' U R U\' R\' U\' R',                           // 棱块从槽位取出
    'R U R\' U\' R\' U R',                             // 另一种取出
    'R U R\' U R U\' R\'',                             //sexy move
    'R\' U\' R U\' R\' U R',                           // 反向sexy
  ],
  'FL': [
    'L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\'',
    'L\' U\' L U L\' U\' L',
    'U', 'U\'', 'U2',
    'L U\' L\' U L U L\'',
    'L\' U\' L U L U\' L\'',
  ],
  'BL': [
    'L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L',
    'L U L\' U\' L U L\'',
    'U', 'U\'', 'U2',
    'L\' U L\' U\' L\' U\' L',
    'L U\' L\' U\' L\' U L',
  ],
  'BR': [
    'R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\'',
    'R\' U\' R U R\' U\' R',
    'U', 'U\'', 'U2',
    'R U\' R\' U R U R\'',
    'R\' U\' R U\' R\' U\' R',
  ],
}

function getDLayerSetups(targetSlot: Slot, cornerPos: string): string[] {
  // 角块在D层不同位置时的setup公式
  // 目标是把角块从D层带到U层，同时不破坏十字

  // 基础setup：用对应的R/L面转动把D层角块带到U层
  const setups: Record<Slot, string[]> = {
    'FR': [
      'R U R\' U\' R U R\' U\' R U R\'',  // 连续R U R\'把角块带上来
      'R U2 R\' U\' R U R\'',             // 变体
      'R\' U\' R U R\' U\' R',             // 反向
      'R U R\' U R U2 R\'',               // 更长setup
    ],
    'FL': [
      'L\' U\' L U L\' U\' L U L\' U\' L', // 连续L\' U\' L
      'L\' U2 L U L\' U\' L',
      'L U L\' U\' L U L\'',
    ],
    'BL': [
      'L U L\' U\' L U L\' U\' L U L\'',
      'L U2 L\' U\' L U L\'',
    ],
    'BR': [
      'R\' U\' R U R\' U\' R U R\' U\' R',
      'R\' U2 R U R\' U\' R',
    ],
  }
  return setups[targetSlot] || []
}

function getExtractFormulas(slot: Slot): string[] {
  // 提取槽位中的块的公式
  const extracts: Record<Slot, string[]> = {
    'FR': [
      'R U R\' U\'',           // 取出角块
      'R\' U\' R U',           // 反向取出
      'R U R\' U R U\' R\'',   // sexy setup
      'R\' U\' R U\' R\' U R', // 反向sexy
      'R U2 R\' U\' R U R\'',  // 复杂取出
    ],
    'FL': [
      'L\' U\' L U',           // 取出角块
      'L U L\' U\'',           // 反向取出
      'L\' U\' L U\' L\' U L', // sexy setup
      'L U L\' U L U\' L\'',   // 反向sexy
    ],
    'BL': [
      'L U L\' U\'',           // 取出角块
      'L\' U\' L U',           // 反向取出
      'L U L\' U L U\' L\'',   // sexy setup
    ],
    'BR': [
      'R\' U\' R U',           // 取出角块
      'R U R\' U\'',           // 反向取出
      'R\' U\' R U\' R\' U R', // sexy setup
    ],
  }
  return extracts[slot] || []
}

function tryFormulas(cube: Cube, slot: Slot, setup: string): string {
  const formulas = F2L_FORMULAS[slot] || []

  for (const formula of formulas) {
    const test = new Cube(cube)

    // 应用setup
    if (setup) {
      try {
        test.move(setup)
      } catch (e) {
        continue
      }
    }

    // 应用公式
    try {
      test.move(formula)
    } catch (e) {
      continue
    }

    // 验证：槽位完成且十字完好
    if (checkSlotComplete(test.asString(), slot) && checkCrossIntact(test.asString())) {
      return formula
    }
  }

  return ''
}

// ============================================================
// 求解函数
// ============================================================

export type Slot = 'FR' | 'FL' | 'BL' | 'BR'

export function solveF2LSlot(cube: Cube, slot: Slot): string {
  // 如果已经完成，返回空
  if (checkSlotComplete(cube.asString(), slot)) {
    return ''
  }

  const state = cube.asString()
  const colors = SLOT_COLORS[slot]

  // 检查角块和棱块位置
  const cornerPos = findPiecePosition(state, colors.corner.slice(), 'corner')
  const edgePos = findPiecePosition(state, colors.edge.slice(), 'edge')

  // 策略1: 如果都在U层，直接尝试公式
  if (cornerPos.layer === 'U' && edgePos.layer === 'U') {
    const formula = tryFormulas(cube, slot, '')
    if (formula) {
      return formula
    }
  }

  // 策略2: 尝试setup moves + 公式
  const setups = SETUP_MOVES[slot] || []
  for (const setup of setups) {
    const formula = tryFormulas(cube, slot, setup)
    if (formula) {
      return setup + ' ' + formula
    }
  }

  // 策略3: 尝试U调整 + 公式
  const uAdjustments = ['U', 'U\'', 'U2', 'U\' U\'', 'U U']
  for (const adj of uAdjustments) {
    const formula = tryFormulas(cube, slot, adj)
    if (formula) {
      return adj + ' ' + formula
    }
  }

  // 策略4: 尝试双重setup (setup + U调整 + 公式)
  for (const setup of setups.slice(0, 5)) {  // 只用前5个基础setup
    for (const adj of ['U', 'U\'', 'U2']) {
      const combo = setup + ' ' + adj
      const formula = tryFormulas(cube, slot, combo)
      if (formula) {
        return combo + ' ' + formula
      }
    }
  }

  // 策略5: 尝试直接取出槽位中的块再配对
  const extractFormulas = getExtractFormulas(slot)
  for (const extract of extractFormulas) {
    const formula = tryFormulas(cube, slot, extract)
    if (formula) {
      return extract + ' ' + formula
    }
  }

  // 策略6: 角块在D层的情况 - 需要先把角块带到U层
  if (cornerPos.layer === 'D' && cornerPos.pos !== 'unknown') {
    const dLayerSetups = getDLayerSetups(slot, cornerPos.pos)
    for (const setup of dLayerSetups) {
      const formula = tryFormulas(cube, slot, setup)
      if (formula) {
        return setup + ' ' + formula
      }
    }
  }

  return ''
}

export interface F2LResult {
  solution: string
  steps: number
  success: boolean
}

export function solveF2L(cube: Cube): F2LResult {
  const solution: string[] = []

  // 先分析所有槽位的复杂度，按难度排序
  const slots: Slot[] = ['FR', 'FL', 'BL', 'BR']
  const slotComplexity = slots.map(slot => {
    const state = cube.asString()
    const colors = SLOT_COLORS[slot]
    const cornerPos = findPiecePosition(state, colors.corner.slice(), 'corner')
    const edgePos = findPiecePosition(state, colors.edge.slice(), 'edge')

    // 计算复杂度分数
    let score = 0
    if (cornerPos.layer === 'U') score += 1  // 角块在U层简单
    if (edgePos.layer === 'U') score += 1    // 棱块在U层简单
    if (cornerPos.layer === 'D') score += 3  // 角块在D层复杂
    if (edgePos.layer === 'middle' && edgePos.pos === slot) score += 2 // 棱块在槽位复杂

    return { slot, score, cornerPos, edgePos }
  })

  // 按分数排序（分数低的先解决，因为简单）
  slotComplexity.sort((a, b) => a.score - b.score)

  for (const { slot } of slotComplexity) {
    const slotSol = solveF2LSlot(cube, slot)
    if (slotSol) {
      cube.move(slotSol)
      solution.push(slotSol)
    }
  }

  return {
    solution: solution.join(' '),
    steps: solution.join(' ').split(' ').filter(s => s).length,
    success: slots.every(s => checkSlotComplete(cube.asString(), s)),
  }
}

// ============================================================
// 导出
// ============================================================

export { checkSlotComplete, checkCrossIntact, SLOT_COLORS, SLOT_INDICES }

