/**
 * F2L求解器 - 内部状态检测 + V2公式库
 *
 * 结合两者优势：
 * 1. 使用内部状态(cp/ep/co/eo)准确检测块位置
 * 2. 使用V2的完整公式库
 * 3. 使用V2的验证逻辑
 */

const Cube = require('cubejs')

// ============================================================
// 内部状态常量
// ============================================================

const CORNERS = { URF: 0, UFL: 1, ULB: 2, UBR: 3, DFR: 4, DLF: 5, DBL: 6, DRB: 7 }
const EDGES = { UR: 0, UF: 1, UL: 2, UB: 3, DR: 4, DF: 5, DL: 6, DB: 7, FR: 8, FL: 9, BL: 10, BR: 11 }

const F2L_SLOTS = {
  FR: { corner: CORNERS.DFR, edge: EDGES.FR },
  FL: { corner: CORNERS.DLF, edge: EDGES.FL },
  BL: { corner: CORNERS.DBL, edge: EDGES.BL },
  BR: { corner: CORNERS.DRB, edge: EDGES.BR }
}

// ============================================================
// 使用内部状态的检查函数（更准确）
// ============================================================

function isSlotCompleteInternal(cube, slot) {
  const state = cube.toJSON()
  const slotInfo = F2L_SLOTS[slot]

  const cornerOk = state.cp[slotInfo.corner] === slotInfo.corner &&
                   state.co[slotInfo.corner] === 0
  const edgeOk = state.ep[slotInfo.edge] === slotInfo.edge &&
                 state.eo[slotInfo.edge] === 0

  return cornerOk && edgeOk
}

function isCrossIntact(cube) {
  const s = cube.asString()
  return s[28] === 'D' && s[30] === 'D' && s[34] === 'D' && s[32] === 'D'
}

function checkGoalInternal(cube, slot) {
  return isSlotCompleteInternal(cube, slot) && isCrossIntact(cube)
}

// ============================================================
// 使用字符串的检查函数（兼容V2）
// ============================================================

const SLOT_INDICES = {
  'FR': [29, 26, 15, 12, 23],
  'FL': [27, 44, 24, 40, 21],
  'BL': [33, 42, 53, 48, 39],
  'BR': [35, 51, 17, 50, 14],
}

const SLOT_COLORS = {
  'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
  'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
  'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
  'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
}

function isSlotCompleteString(cube, slot) {
  const stateStr = cube.asString()
  const idx = SLOT_INDICES[slot]
  const colors = SLOT_COLORS[slot]

  const corner = stateStr[idx[0]] + stateStr[idx[1]] + stateStr[idx[2]]
  const edge = stateStr[idx[3]] + stateStr[idx[4]]

  return corner.split('').sort().join('') === colors.corner.sort().join('') &&
         edge.split('').sort().join('') === colors.edge.sort().join('') &&
         stateStr[idx[0]] === 'D'
}

function checkGoalString(cube, slot) {
  return isSlotCompleteString(cube, slot) && isCrossIntact(cube)
}

// ============================================================
// V2完整公式库
// ============================================================

const F2L_FORMULAS = {
  'FR': [
    "R U R'", "R U R' U' R' U R", "R U' R' U R U' R'", "R' U R U' R' U' R",
    "R' U' R U R U R'", "U' R U R'", "U R U' R'", "U R U' R' U' R U R'",
    "R' U' R U R U R'", "R U R'", "U R U' R' U2 R U' R'", "R' U2 R U R' U' R",
    "U' R U R' U2 R U' R'", "U' R U' R' U R U R'", "R U' R' U2 R U R'",
    "U R U2 R' U' R U R'", "U' R U R' U R U' R'", "U' F' U F U R U' R'",
    "U2 R U R' U R U' R'", "U2 R U' R' U' R U R'", "U F R' F' R U' R U R'",
    "U R U' R' U' R U R'", "U' R' U R U' R' U R", "R U R' U' R U R' U' R U R'",
    "R U' R' U R U' R'", "U R U' R' U' R U R'", "R U' R' U2 R U' R' U R U' R'",
    "R U' R' U R U' R'", "U' R U' R' U R U R'", "U R U' R' U R U' R'",
    "U R U' R' U' R U R'", "U2 R U' R' U R U' R'", "U' F' U F U R U' R'",
    "U R U' R' U' R U' R' U R U' R'", "R U' R' U' R U R' U' R U R'",
    "R U R' F R' F' R U R'", "R U R' U' R U R' U' R U R'",
    "U' R' U R U' R' U R", "R U R' U' R U R' U' R U R'", "R U' R' U R U' R'",
    "U R U' R' U' R U R'", "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'",
    "U' R' U R U' R' U R", "U R U' R' U' R U' R' U R U' R'", "R U R' U' R U R' U' R U R'",
    // 翻转棱块修正公式
    "R U R' U' R U' R' U2 R U R'", "R U' R' U2 R U' R' U' R U R'"
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
    "U F U' F' U' L' U L", "U' L' U L U L' U L U' L' U L", "L' U L U L' U' L U L' U' L'",
    "L' U' L F' L F L' U' L'", "L' U' L U L' U' L U L' U' L'",
    "U L U' L' U L U' L'", "L' U' L U L' U' L U L' U' L'", "L' U L U' L' U L",
    "U' L' U L U L' U' L'", "L' U L U2 L' U L U' L' U L", "L' U L U' L' U L",
    "U L' U L U' L' U' L", "U' L' U' L U L' U L U' L' U L", "L' U' L U L' U' L U L' U' L'",
    // 翻转棱块修正
    "L' U' L U L' U L' U2 L' U' L", "L' U L U2 L' U L U L' U' L"
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
    "U L' U' L U L' U L", "U' L' U' L U' L' U L", "U' L' U' L U' L' U L",
    "U2 L' U' L' U' L' U L", "U F' U' F U' L U L'", "U' L' U' L' U' L' U' L U L' U L",
    "L' U' L' U L' U L' U L U L'", "L' U L' F' L' F L' U L", "L' U L' U' L' U L U' L' U L'",
    "U' L' U L U' L U L'", "L' U' L' U L' U L' U L U L'", "L' U L' U' L' U L",
    "U L' U' L U L' U L", "L' U' L U2 L' U' L U' L' U L", "L' U' L U' L' U L",
    "U' L U' L' U L U' L'", "U' L' U' L' U' L' U' L U L' U L", "L' U' L' U L' U L' U L U L'",
    // 翻转棱块修正
    "L U L' U' L' U' L U2 L' U L'", "L' U2 L U' L U L' U L'"
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
    "U' F U F' U R' U' R", "U R U' R' U' R' U R' U' R U' R'", "R U R' U R U' R' U R U' R'",
    "R U' R F R F' R U' R'", "R U' R' U R U' R' U R U' R'",
    "U R' U' R U R' U' R", "R U' R U R U' R' U R U' R'", "R U' R' U R U' R'",
    "U' R U R' U' R' U R", "U R U' R' U' R' U R' U' R U' R'", "R U' R U R U' R' U R U' R'",
    "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'", "U' R U R' U' R' U' R",
    "U R' U' R U R' U' R", "U R U' R' U' R' U' R", "U2 R' U R' U R' U' R",
    "U' F U F' U R' U' R", "U R U' R' U' R' U R' U' R U' R'", "R U R' U R U' R' U R U' R'",
    // 翻转棱块修正
    "R' U' R U R' U R U2 R' U' R'", "R U' R' U R U2 R' U' R'"
  ]
}

// ============================================================
// Setup公式库（从各位置提取块）
// ============================================================

const SETUP_FORMULAS = {
  'FR': ['R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R', 'R U R\' U\' R U R\''],
  'FL': ['L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\'', 'L\' U\' L U L\' U\' L'],
  'BL': ['L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L', 'L U L\' U\' L U L\''],
  'BR': ['R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\'', 'R\' U\' R U R\' U\' R'],
  // 通用提取
  'common': ['R U R\'', 'R\' U\' R', 'L U L\'', 'L\' U\' L']
}

// ============================================================
// 根据块位置获取setup公式
// ============================================================

function getSetupFormulas(slot, cornerPos, edgePos) {
  const setups = []

  // 添加槽位的基础setup
  setups.push(...SETUP_FORMULAS[slot])

  // 如果棱块在中层但不是目标槽位，添加从该位置提取的公式
  if (edgePos >= 8 && edgePos <= 11 && edgePos !== F2L_SLOTS[slot].edge) {
    if (edgePos === EDGES.FR) setups.push('R U R\' U\'', 'R\' U\' R U')
    if (edgePos === EDGES.FL) setups.push('L\' U\' L U', 'L U L\' U\'')
    if (edgePos === EDGES.BL) setups.push('L U L\' U\'', 'L\' U\' L U')
    if (edgePos === EDGES.BR) setups.push('R\' U\' R U', 'R U R\' U\'')
  }

  // 如果角块在D层但不是目标槽位
  if (cornerPos >= 4 && cornerPos <= 7 && cornerPos !== F2L_SLOTS[slot].corner) {
    if (cornerPos === CORNERS.DFR) setups.push('R U R\' U\' R U R\'')
    if (cornerPos === CORNERS.DLF) setups.push('L\' U\' L U L\' U\' L')
    if (cornerPos === CORNERS.DBL) setups.push('L U L\' U\' L U L\'')
    if (cornerPos === CORNERS.DRB) setups.push('R\' U\' R U R\' U\' R')
  }

  return [...new Set(setups)]
}

// ============================================================
// 尝试公式
// ============================================================

function tryFormula(cube, slot, setup, formula) {
  const test = new Cube(cube)

  try {
    if (setup) test.move(setup)
    test.move(formula)
  } catch (e) {
    return null
  }

  // 使用内部状态检查（更准确）
  if (checkGoalInternal(test, slot)) {
    return formula
  }

  // 也使用字符串检查作为备用
  if (checkGoalString(test, slot)) {
    return formula
  }

  return null
}

// ============================================================
// 求解单个槽位
// ============================================================

function solveSlot(cube, slot, verbose = false) {
  const state = cube.toJSON()
  const slotInfo = F2L_SLOTS[slot]

  // 找到块位置
  const cornerPos = state.cp.indexOf(slotInfo.corner)
  const edgePos = state.ep.indexOf(slotInfo.edge)

  // 检查是否已完成
  if (checkGoalInternal(cube, slot)) {
    if (verbose) console.log(`    ${slot}: 已完成 ✅`)
    return { solution: '', steps: 0, done: true }
  }

  if (verbose) {
    const cornerNames = ['URF','UFL','ULB','UBR','DFR','DFL','DBL','DRB']
    const edgeNames = ['UR','UF','UL','UB','DR','DF','DL','DB','FR','FL','BL','BR']
    console.log(`    ${slot}: 角${cornerNames[cornerPos]} 棱${edgeNames[edgePos]}`)
  }

  // 获取setup公式
  const setups = getSetupFormulas(slot, cornerPos, edgePos)

  // 策略1: 尝试直接公式
  for (const formula of F2L_FORMULAS[slot]) {
    const result = tryFormula(cube, slot, '', formula)
    if (result) {
      if (verbose) console.log(`      ✅ ${result}`)
      return { solution: result, steps: result.split(' ').length, done: true }
    }
  }

  // 策略2: U调整 + 公式
  for (const u of ['U', "U'", 'U2']) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, u, formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${u} + ${formula}`)
        return { solution: u + ' ' + formula, steps: (u + ' ' + formula).split(' ').length, done: true }
      }
    }
  }

  // 策略3: Setup + 公式
  for (const setup of setups) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, setup, formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${setup} + ${formula}`)
        return { solution: setup + ' ' + formula, steps: (setup + ' ' + formula).split(' ').length, done: true }
      }
    }

    // Setup + U + 公式
    for (const u of ['U', "U'", 'U2']) {
      const combo = setup + ' ' + u
      for (const formula of F2L_FORMULAS[slot]) {
        const result = tryFormula(cube, slot, combo, formula)
        if (result) {
          if (verbose) console.log(`      ✅ ${combo} + ${formula}`)
          return { solution: combo + ' ' + formula, steps: (combo + ' ' + formula).split(' ').length, done: true }
        }
      }
    }
  }

  if (verbose) console.log(`      ❌ 未找到公式`)
  return { solution: '', steps: 0, done: false }
}

// ============================================================
// 主求解函数
// ============================================================

function solveF2LFinal(cube, options = {}) {
  const { verbose = false } = options
  const solution = []
  const details = {}

  const slots = ['FR', 'FL', 'BL', 'BR']

  // 计算复杂度
  const slotComplexity = slots.map(slot => {
    const state = cube.toJSON()
    const slotInfo = F2L_SLOTS[slot]
    const cornerPos = state.cp.indexOf(slotInfo.corner)
    const edgePos = state.ep.indexOf(slotInfo.edge)

    let score = 0
    if (cornerPos < 4) score -= 3  // 角块在U层
    if (edgePos < 4) score -= 3    // 棱块在U层
    if (cornerPos >= 4 && cornerPos <= 7 && cornerPos !== slotInfo.corner) score += 5  // 角块在D层但错误位置
    if (edgePos >= 8 && edgePos <= 11 && edgePos !== slotInfo.edge) score += 3  // 棱块在中层但错误位置

    return { slot, score }
  })

  slotComplexity.sort((a, b) => a.score - b.score)

  if (verbose) {
    console.log('  槽位解决顺序:', slotComplexity.map(s => s.slot).join(' -> '))
  }

  for (const { slot } of slotComplexity) {
    const result = solveSlot(cube, slot, verbose)
    details[slot] = {
      done: result.done,
      solution: result.solution
    }

    if (result.solution) {
      cube.move(result.solution)
      solution.push(result.solution)
    }
  }

  return {
    solution: solution.join(' '),
    steps: solution.join(' ').split(' ').length,
    details,
    allDone: Object.values(details).every(d => d.done)
  }
}

module.exports = {
  solveF2LFinal,
  solveSlot,
  isSlotCompleteInternal,
  isCrossIntact
}
