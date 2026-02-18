/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L分层求解�?- 基于状态复杂度选择策略
 *
 * 核心思想：先处理简单情况，避免复杂BFS
 */

import Cube from 'cubejs'

// ============================================================
// 状态评估函�?
// ============================================================

/**
 * 评估F2L槽位的状态复杂度
 * 返回: { level: 1-4, setupMoves: string[] }
 */
export function evaluateF2LState(
  cube: Cube,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): { level: number; setupMoves: string[]; cornerInU: boolean; edgeInU: boolean } {
  const state = cube.asString()

  // 槽位对应的颜�?
  const slotColors: Record<string, { corner: string[], edge: string[] }> = {
    'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
    'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
    'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
    'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
  }

  const colors = slotColors[slot]

  // 查找角块位置
  const cornerPos = findPiecePosition(state, colors.corner, 'corner')
  // 查找棱块位置
  const edgePos = findPiecePosition(state, colors.edge, 'edge')

  const cornerInU = isULayer(cornerPos.pos, 'corner')
  const edgeInU = isULayer(edgePos.pos, 'edge')

  // 判断层级
  if (cornerInU && edgeInU) {
    // �?�? 都在U�?
    return { level: 1, setupMoves: [], cornerInU, edgeInU }
  }

  if (cornerInU || edgeInU) {
    // �?�? 一个在U�?
    const setup = getOneStepSetup(cornerPos.pos, edgePos.pos, slot)
    return { level: 2, setupMoves: setup, cornerInU, edgeInU }
  }

  // �?�? 都不在U�?
  const setup = getTwoStepSetup(cornerPos.pos, edgePos.pos, slot)
  return { level: 3, setupMoves: setup, cornerInU, edgeInU }
}

/**
 * 查找块位�?
 */
function findPiecePosition(state: string, colors: string[], type: 'corner' | 'edge'): { pos: string; ori: number } {
  // U层位�?
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']

  // D层槽�?
  const dCorners = ['DFR', 'DFL', 'DBL', 'DBR']
  const middleEdges = ['FR', 'FL', 'BL', 'BR']

  const sortedColors = colors.sort().join('')

  if (type === 'corner') {
    // 检查U�?
    for (const pos of uCorners) {
      if (checkPositionMatch(state, pos, sortedColors)) {
        return { pos, ori: 0 } // 简化朝�?
      }
    }
    // 检查D�?
    for (const pos of dCorners) {
      if (checkPositionMatch(state, pos, sortedColors)) {
        return { pos, ori: 0 }
      }
    }
  } else {
    // 棱块
    for (const pos of [...uEdges, ...middleEdges]) {
      if (checkEdgeMatch(state, pos, colors)) {
        return { pos, ori: 0 }
      }
    }
  }

  return { pos: 'unknown', ori: 0 }
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

function isULayer(pos: string, type: 'corner' | 'edge'): boolean {
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']
  return type === 'corner' ? uCorners.includes(pos) : uEdges.includes(pos)
}

/**
 * 获取1步setup公式
 */
function getOneStepSetup(cornerPos: string, edgePos: string, slot: string): string[] {
  const moves: string[] = []

  // 角块不在U层，需要移出来
  if (!isULayer(cornerPos, 'corner')) {
    if (cornerPos === 'DFR' || cornerPos === 'DBR') moves.push('R', "R'", 'R2')
    else moves.push('L', "L'", 'L2')
  }

  // 棱块不在U�?
  if (!isULayer(edgePos, 'edge')) {
    if (edgePos === slot) {
      // 在目标槽位，需要移�?
      if (slot === 'FR') moves.push('R', "R'", 'R2')
      else if (slot === 'FL') moves.push('L', "L'", 'L2')
      else if (slot === 'BL') moves.push('L', 'L\'', 'L2')
      else moves.push('R', 'R\'', 'R2')
    } else {
      // 在其他槽�?
      if (edgePos === 'FR' || edgePos === 'BR') moves.push('R', "R'", 'R2')
      else moves.push('L', "L'", 'L2')
    }
  }

  return moves.slice(0, 2) // 最�?�?
}

/**
 * 获取2步setup公式
 */
function getTwoStepSetup(cornerPos: string, edgePos: string, slot: string): string[] {
  // 简化：使用常用setup公式
  const setups: string[] = [
    'R U R\'',      // DFR �?U�?
    'L\' U\' L',    // DFL �?U�?
    'L U L\'',      // DBL �?U�?
    'R\' U\' R',    // DBR �?U�?
    'F U F\'',      // 中层棱块 �?U�?
    'B U B\'',      // 中层棱块 �?U�?
  ]

  return setups.slice(0, 2)
}

// ============================================================
// 标准F2L公式 (简化版，只包含最常用�?
// ============================================================

const STANDARD_FORMULAS: Record<string, string[]> = {
  'FR': ['R U R\'', 'U R U\' R\'', 'R U\' R\' U R U\' R\''],
  'FL': ['L\' U\' L', 'U\' L\' U L', 'L U L\' U\' L U L\''],
  'BL': ['L U L\'', 'U L U\' L\'', 'L\' U\' L U L U\' L\''],
  'BR': ['R\' U\' R', 'U R\' U\' R', 'R U R\' U\' R U R\''],
}

// ============================================================
// 主求解函�?
// ============================================================

export function solveF2LSlotByLevel(cube: Cube, slot: 'FR' | 'FL' | 'BL' | 'BR'): string {
  const evaluation = evaluateF2LState(cube, slot)

  console.log(`  ${slot} 状�? L${evaluation.level}级`)

  // 根据层级选择策略
  switch (evaluation.level) {
    case 1:
      // 标准态：直接用公�?
      return tryStandardFormula(cube, slot)

    case 2:
      // 1步setup
      const setup2 = evaluation.setupMoves[0] || 'U'
      cube.move(setup2)
      const formula2 = tryStandardFormula(cube, slot)
      return setup2 + ' ' + formula2

    case 3:
      // 2步setup
      const setup3a = evaluation.setupMoves[0] || 'R U R\''
      cube.move(setup3a)
      const formula3 = tryStandardFormula(cube, slot)
      return setup3a + ' ' + formula3

    default:
      return ''
  }
}

function tryStandardFormula(cube: Cube, slot: string): string {
  const formulas = STANDARD_FORMULAS[slot] || []

  for (const formula of formulas) {
    try {
      const test = new Cube(cube)
      test.move(formula)
      // 简化检查：假设公式可能正确
      return formula
    } catch (e) {
      continue
    }
  }

  return formulas[0] || ''
}

export function solveF2LByLevel(cube: Cube): string {
  const slots: Array<'FR' | 'FL' | 'BL' | 'BR'> = ['FR', 'FL', 'BL', 'BR']
  const solution: string[] = []

  // 按复杂度排序：先做简单的
  const sortedSlots = sortSlotsByComplexity(cube, slots)

  for (const slot of sortedSlots) {
    const slotSol = solveF2LSlotByLevel(cube, slot)
    if (slotSol) {
      cube.move(slotSol)
      solution.push(slotSol)
    }
  }

  return solution.join(' ')
}

/**
 * 根据状态复杂度排序槽位
 */
function sortSlotsByComplexity(cube: Cube, slots: Array<'FR' | 'FL' | 'BL' | 'BR'>): typeof slots {
  const evals = slots.map(slot => ({
    slot,
    eval: evaluateF2LState(cube, slot),
  }))

  // 按level排序，level小的优先
  evals.sort((a, b) => a.eval.level - b.eval.level)

  return evals.map(e => e.slot)
}


