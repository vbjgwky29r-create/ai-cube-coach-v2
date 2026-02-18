/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L分层求解器 - CommonJS版本
 *
 * 核心思想：先处理简单情况（标态），再处理需要setup的情况
 */

const Cube = require('cubejs')

// ============================================================
// 状态评估
// ============================================================

function evaluateF2LState(cube, slot) {
  const state = cube.asString()

  // 槽位颜色
  const slotColors = {
    'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
    'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
    'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
    'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
  }

  const colors = slotColors[slot]

  // 查找块位置
  const cornerPos = findPiecePosition(state, colors.corner, 'corner')
  const edgePos = findPiecePosition(state, colors.edge, 'edge')

  const cornerInU = isULayer(cornerPos.pos, 'corner')
  const edgeInU = isULayer(edgePos.pos, 'edge')

  // 判断层级
  if (cornerInU && edgeInU) {
    return { level: 1, setupMoves: [], cornerInU, edgeInU }
  }

  if (cornerInU || edgeInU) {
    const setup = getOneStepSetup(cornerPos.pos, edgePos.pos, slot)
    return { level: 2, setupMoves: setup, cornerInU, edgeInU }
  }

  const setup = getTwoStepSetup(cornerPos.pos, edgePos.pos, slot)
  return { level: 3, setupMoves: setup, cornerInU, edgeInU }
}

function findPiecePosition(state, colors, type) {
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']
  const dCorners = ['DFR', 'DFL', 'DBL', 'DBR']
  const middleEdges = ['FR', 'FL', 'BL', 'BR']

  const sortedColors = colors.sort().join('')

  if (type === 'corner') {
    for (const pos of [...uCorners, ...dCorners]) {
      if (checkPositionMatch(state, pos, sortedColors)) {
        return { pos, ori: 0 }
      }
    }
  } else {
    for (const pos of [...uEdges, ...middleEdges]) {
      if (checkEdgeMatch(state, pos, colors)) {
        return { pos, ori: 0 }
      }
    }
  }

  return { pos: 'unknown', ori: 0 }
}

function checkPositionMatch(state, pos, colors) {
  const idxMap = {
    'URF': [8, 20, 9], 'UFL': [6, 18, 38], 'ULB': [0, 36, 47], 'UBR': [2, 45, 11],
    'DFR': [29, 26, 15], 'DFL': [27, 44, 24], 'DBL': [33, 42, 53], 'DBR': [35, 51, 17],
  }
  const idx = idxMap[pos]
  const actual = [state[idx[0]], state[idx[1]], state[idx[2]]].sort().join('')
  return actual === colors
}

function checkEdgeMatch(state, pos, colors) {
  const idxMap = {
    'UF': [7, 19], 'UR': [5, 10], 'UB': [1, 46], 'UL': [3, 37],
    'FR': [12, 23], 'FL': [21, 40], 'BL': [39, 48], 'BR': [14, 50],
  }
  const idx = idxMap[pos]
  const c1 = state[idx[0]]
  const c2 = state[idx[1]]
  return (c1 === colors[0] && c2 === colors[1]) || (c1 === colors[1] && c2 === colors[0])
}

function isULayer(pos, type) {
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']
  return type === 'corner' ? uCorners.includes(pos) : uEdges.includes(pos)
}

function getOneStepSetup(cornerPos, edgePos, slot) {
  const moves = []

  if (!isULayer(cornerPos, 'corner')) {
    if (cornerPos === 'DFR' || cornerPos === 'DBR') moves.push('R', "R'", 'R2')
    else moves.push('L', "L'", 'L2')
  }

  if (!isULayer(edgePos, 'edge')) {
    if (edgePos === slot) {
      if (slot === 'FR') moves.push('R', "R'", 'R2')
      else if (slot === 'FL') moves.push('L', "L'", 'L2')
      else if (slot === 'BL') moves.push('L', "L'", 'L2')
      else moves.push('R', "R'", 'R2')
    } else {
      if (edgePos === 'FR' || edgePos === 'BR') moves.push('R', "R'", 'R2')
      else moves.push('L', "L'", 'L2')
    }
  }

  return moves.slice(0, 2)
}

function getTwoStepSetup(cornerPos, edgePos, slot) {
  return ['R U R\'', 'L\' U\' L', 'L U L\'', 'R\' U\' R'].slice(0, 2)
}

// ============================================================
// 标准公式
// ============================================================

const STANDARD_FORMULAS = {
  'FR': ['R U R\'', 'U R U\' R\'', 'R U\' R\' U R U\' R\''],
  'FL': ['L\' U\' L', 'U\' L\' U L', 'L U L\' U\' L U L\''],
  'BL': ['L U L\'', 'U L U\' L\'', 'L\' U\' L U L U\' L\''],
  'BR': ['R\' U\' R', 'U R\' U\' R', 'R U R\' U\' R U R\''],
}

// ============================================================
// 求解函数
// ============================================================

function solveF2LSlotByLevel(cube, slot) {
  const state = evaluateF2LState(cube, slot)

  console.log(`  ${slot} 状态: L${state.level}级`)

  switch (state.level) {
    case 1:
      return tryStandardFormula(cube, slot)
    case 2:
      const setup2 = state.setupMoves[0] || 'U'
      cube.move(setup2)
      const formula2 = tryStandardFormula(cube, slot)
      return setup2 + ' ' + formula2
    case 3:
      const setup3 = state.setupMoves.join(' ') || 'R U R\''
      cube.move(setup3)
      const formula3 = tryStandardFormula(cube, slot)
      return setup3 + ' ' + formula3
    default:
      return ''
  }
}

function tryStandardFormula(cube, slot) {
  const formulas = STANDARD_FORMULAS[slot] || []

  for (const formula of formulas) {
    try {
      const test = new Cube(cube)
      test.move(formula)
      return formula
    } catch (e) {
      continue
    }
  }

  return formulas[0] || ''
}

function solveF2LByLevel(cube) {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const solution = []

  // 按复杂度排序
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

function sortSlotsByComplexity(cube, slots) {
  const evals = slots.map(slot => ({
    slot,
    state: evaluateF2LState(cube, slot),
  }))

  evals.sort((a, b) => a.state.level - b.state.level)

  return evals.map(e => e.slot)
}

// ============================================================
// 导出
// ============================================================

module.exports = {
  evaluateF2LState,
  solveF2LByLevel,
  solveF2LSlotByLevel,
}

