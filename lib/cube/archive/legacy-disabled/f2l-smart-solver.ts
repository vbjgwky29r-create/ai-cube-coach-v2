/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * 智能F2L求解器 - 算法化setup
 *
 * 核心思想：
 * 1. 分析角块和棱块的位置
 * 2. 算法计算setup公式（不用查表）
 * 3. 应用标准41种公式
 */

import Cube from 'cubejs'

// U层位置
const U_CORNERS = ['URF', 'UFL', 'ULB', 'UBR']
const U_EDGES = ['UF', 'UR', 'UB', 'UL']

// 槽位对应的颜色
const SLOT_COLORS: Record<string, { corner: string[], edge: string[] }> = {
  'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
  'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
  'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
  'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
}

// cubejs状态位置索引 (使用现有代码的定义)
const CORNER_IDX: Record<string, number[]> = {
  'URF': [8, 9, 20], 'UFL': [6, 18, 38], 'ULB': [0, 36, 47], 'UBR': [2, 45, 11],
  'DFR': [29, 26, 15], 'DFL': [27, 44, 24], 'DBL': [33, 42, 53], 'DBR': [35, 51, 17],
}

const EDGE_IDX: Record<string, number[]> = {
  'UF': [7, 19], 'UR': [5, 10], 'UB': [1, 46], 'UL': [3, 37],
  'FR': [12, 23], 'FL': [21, 40], 'BL': [39, 48], 'BR': [14, 50],
}

/**
 * 查找角块位置
 */
function findCorner(state: string, colors: string[]): { pos: string; ori: number } {
  const sortedColors = colors.sort().join('')

  for (const [pos, idx] of Object.entries(CORNER_IDX)) {
    const actualColors = [state[idx[0]], state[idx[1]], state[idx[2]]].sort().join('')
    if (actualColors === sortedColors) {
      // 计算朝向：主要颜色(U或D)是否在正确位置
      const primaryColor = colors.includes('D') ? 'D' : 'U'
      if (state[idx[0]] === primaryColor) return { pos, ori: 0 }
      if (state[idx[1]] === primaryColor) return { pos, ori: 1 }
      return { pos, ori: 2 }
    }
  }

  return { pos: 'unknown', ori: 0 }
}

/**
 * 查找棱块位置
 */
function findEdge(state: string, colors: string[]): { pos: string; ori: number } {
  for (const [pos, idx] of Object.entries(EDGE_IDX)) {
    const c1 = state[idx[0]]
    const c2 = state[idx[1]]
    if ((c1 === colors[0] && c2 === colors[1]) || (c1 === colors[1] && c2 === colors[0])) {
      return { pos, ori: c1 === colors[0] ? 0 : 1 }
    }
  }
  return { pos: 'unknown', ori: 0 }
}

/**
 * 计算setup公式：将块移到U层
 */
function computeSetup(cornerPos: string, edgePos: string, targetSlot: string): string {
  const moves: string[] = []

  // 根据块位置决定setup
  // D层角块 → 用对应面移到U层
  if (['DFR', 'DFL', 'DBL', 'DBR'].includes(cornerPos)) {
    if (cornerPos === 'DFR') moves.push('R U R\'')
    else if (cornerPos === 'DFL') moves.push('L\' U\' L')
    else if (cornerPos === 'DBL') moves.push('L U L\'')
    else if (cornerPos === 'DBR') moves.push('R\' U\' R')
  }

  // 中层棱块 → 移到U层
  if (['FR', 'FL', 'BL', 'BR'].includes(edgePos)) {
    if (edgePos === targetSlot) {
      // 棱块在目标槽位但需要移出
      if (targetSlot === 'FR') moves.push('R U R\'')
      else if (targetSlot === 'FL') moves.push('L\' U\' L')
      else if (targetSlot === 'BL') moves.push('L U L\'')
      else if (targetSlot === 'BR') moves.push('R\' U\' R')
    } else {
      // 棱块在其他槽位
      if (edgePos === 'FR') moves.push('R U R\'')
      else if (edgePos === 'FL') moves.push('L\' U\' L')
      else if (edgePos === 'BL') moves.push('B U B\'')
      else if (edgePos === 'BR') moves.push('B\' U\' B')
    }
  }

  return moves.join(' ') || 'U'
}

/**
 * 求解F2L槽位
 * 策略：setup → 尝试标准公式
 */
export function solveF2LSlotSmart(cube: Cube, slot: string): string | null {
  const colors = SLOT_COLORS[slot]
  const state = cube.asString()

  // 查找块位置
  const corner = findCorner(state, colors.corner)
  const edge = findEdge(state, colors.edge)

  console.log(`  ${slot}: 角块=${corner.pos}/${corner.ori}, 棱块=${edge.pos}/${edge.ori}`)

  // 检查是否已完成
  if (corner.pos === slot.replace('FR', 'DFR').replace('FL', 'DFL').replace('BL', 'DBL').replace('BR', 'DBR') &&
      edge.pos === slot) {
    return ''
  }

  // 检查是否都在U层
  const cornerInU = U_CORNERS.includes(corner.pos)
  const edgeInU = U_EDGES.includes(edge.pos)

  if (cornerInU && edgeInU) {
    // 直接尝试标准公式
    return tryStandardFormulas(cube, slot)
  }

  // 需要setup
  const setup = computeSetup(corner.pos, edge.pos, slot)
  console.log(`  → 需要setup: ${setup}`)

  // 应用setup
  const afterSetup = new Cube(cube)
  afterSetup.move(setup)

  // setup后尝试标准公式
  const formula = tryStandardFormulas(afterSetup, slot)
  if (formula) {
    return setup + ' ' + formula
  }

  return setup // 只返回setup
}

/**
 * 尝试标准F2L公式 - 带验证
 */
function tryStandardFormulas(cube: Cube, slot: string): string | null {
  // 检查函数
  const checkSlot = (stateStr: string) => {
    const idxMap: Record<string, number[]> = {
      'FR': [29, 26, 15, 12, 23],  // DFR corner + FR edge
      'FL': [27, 44, 24, 40, 21],  // DFL corner + FL edge
      'BL': [33, 53, 42, 48, 39],  // DBL corner + BL edge
      'BR': [35, 51, 17, 50, 14],  // DBR corner + BR edge
    }
    const idx = idxMap[slot]
    const exp = slot === 'FR' ? 'DFRFR' : slot === 'FL' ? 'DFLFL' : slot === 'BL' ? 'DBLBL' : 'DBRBR'

    const cornerColors = stateStr[idx[0]] + stateStr[idx[1]] + stateStr[idx[2]]
    const edgeColors = stateStr[idx[3]] + stateStr[idx[4]]

    return cornerColors.split('').sort().join('') === exp.substring(0, 3) &&
           edgeColors.split('').sort().join('') === exp.substring(3, 6)
  }

  // 根据槽位选择基本公式
  const slotFormulas: Record<string, string[]> = {
    'FR': ['R U R\'', 'R U\' R\' U R U\' R\'', 'U R U\' R\'', 'U\' R U\' R\''],
    'FL': ['L\' U\' L', 'L U L\' U\' L U\' L\'', 'U\' L\' U L', 'U L U\' L\''],
    'BL': ['L U L\'', 'L\' U\' L U L U\' L\'', 'U L U\' L\'', 'U\' L\' U L'],
    'BR': ['R\' U\' R', 'R U R\' U\' R U R\'', 'U R\' U\' R', 'U\' R U R'],
  }

  const formulas = slotFormulas[slot] || []

  for (const formula of formulas) {
    try {
      const test = new Cube(cube)
      test.move(formula)
      if (checkSlot(test.asString())) {
        return formula
      }
    } catch (e) {
      continue
    }
  }

  // 尝试带U调整的公式
  for (const formula of formulas) {
    for (const adj of ['U', "U'", 'U2']) {
      try {
        const test = new Cube(cube)
        test.move(adj + ' ' + formula)
        if (checkSlot(test.asString())) {
          return adj + ' ' + formula
        }
      } catch (e) {
        continue
      }
    }
  }

  return null
}

/**
 * 求解完整F2L
 */
export function solveF2LSmart(cube: Cube): string {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const solution: string[] = []

  for (const slot of slots) {
    console.log(`求解${slot}...`)
    const slotSol = solveF2LSlotSmart(cube, slot)
    if (slotSol) {
      cube.move(slotSol)
      solution.push(slotSol)
    }
  }

  return solution.join(' ')
}

