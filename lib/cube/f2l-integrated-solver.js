/**
 * F2L���合求解器 - 分层方法 + 验证驱动
 *
 * 整合两个求解器的优势：
 * 1. 使用内部状态(cp/ep/co/eo)准确检测块位置（来自分层方法）
 * 2. 使用完整公式库和验证逻辑（来自V2验证驱动）
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
// 状态检查函数（使用内部状态）
// ============================================================

function isSlotComplete(cube, slot) {
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

function checkGoal(cube, slot) {
  return isSlotComplete(cube, slot) && isCrossIntact(cube)
}

// ============================================================
// 计算槽位级别（分层方法）
// ============================================================

function calculateSlotLevel(cube, slot) {
  const state = cube.toJSON()
  const slotInfo = F2L_SLOTS[slot]

  // 找到角块和棱块的位置
  const cornerPos = state.cp.indexOf(slotInfo.corner)
  const cornerOri = state.co[cornerPos]
  const edgePos = state.ep.indexOf(slotInfo.edge)
  const edgeOri = state.eo[edgePos]

  const cornerInU = cornerPos < 4
  const edgeInU = edgePos < 4
  const cornerInSlot = cornerPos === slotInfo.corner && cornerOri === 0
  const edgeInSlot = edgePos === slotInfo.edge && edgeOri === 0

  // L0: 已完成
  if (cornerInSlot && edgeInSlot) {
    return { level: 0, cornerPos, cornerOri, edgePos, edgeOri }
  }

  // L1: 两块都在U层
  if (cornerInU && edgeInU) {
    return { level: 1, cornerPos, cornerOri, edgePos, edgeOri }
  }

  // L2: 一块在U层
  if (cornerInU || edgeInU) {
    return { level: 2, cornerPos, cornerOri, edgePos, edgeOri }
  }

  // L3: 都不在U层
  return { level: 3, cornerPos, cornerOri, edgePos, edgeOri }
}

// ============================================================
// 完整F2L公式库（来自V2）
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
    "U' R' U R U' R' U R", "U R U' R' U' R U' R' U R U' R'", "R U R' U' R U R' U' R U R'"
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
    "U L' U L U' L' U' L", "U' L' U' L U L' U L U' L' U L", "L' U' L U L' U' L U L' U' L'"
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
    "U' L U' L' U L U' L'", "U' L' U' L' U' L' U' L U L' U L", "L' U' L' U L' U L' U L U L'"
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
    "U' F U F' U R' U' R", "U R U' R' U' R' U R' U' R U' R'", "R U R' U R U' R' U R U' R'"
  ]
}

// ============================================================
// 验证公式是否有效
// ============================================================

function tryFormula(cube, slot, setup, formula) {
  const test = new Cube(cube)

  // 应用setup
  if (setup) {
    try { test.move(setup) } catch (e) { return null }
  }

  // 应用公式
  try { test.move(formula) } catch (e) { return null }

  // 验证：槽位完成且十字完好
  if (checkGoal(test, slot)) {
    return formula
  }

  return null
}

// ============================================================
// 求解单个槽位（整合方法）
// ============================================================

function solveSlot(cube, slot, verbose = false) {
  // L0: 已完成
  if (checkGoal(cube, slot)) {
    if (verbose) console.log(`    ${slot}: 已完成 ✅`)
    return { solution: '', steps: 0, done: true }
  }

  const levelInfo = calculateSlotLevel(cube, slot)
  if (verbose) {
    const cornerNames = ['URF','UFL','ULB','UBR','DFR','DFL','DBL','DRB']
    const edgeNames = ['UR','UF','UL','UB','DR','DF','DL','DB','FR','FL','BL','BR']
    console.log(`    ${slot}: L${levelInfo.level} (角:${cornerNames[levelInfo.cornerPos]}, 棱:${edgeNames[levelInfo.edgePos]})`)
  }

  // 策略1: 直接尝试所有公式（L1情况）
  if (levelInfo.level === 1) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, '', formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${result}`)
        return { solution: result, steps: result.split(' ').length, done: true }
      }
    }
  }

  // 策略2: U调整 + 公式（L1/L2情况）
  const uMoves = ['U', "U'", 'U2']
  for (const u of uMoves) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, u, formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${u} + ${formula}`)
        return { solution: u + ' ' + formula, steps: (u + ' ' + formula).split(' ').length, done: true }
      }
    }
  }

  // 策略3: Setup + 公式（L2/L3情况）
  // 根据块的实际位置选择setup
  const setups = getSetupsForSlot(slot, levelInfo)
  for (const setup of setups) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, setup, formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${setup} + ${formula}`)
        return { solution: setup + ' ' + formula, steps: (setup + ' ' + formula).split(' ').length, done: true }
      }
    }

    // Setup + U + 公式
    for (const u of uMoves) {
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

// 根据块位置获取setup公式
function getSetupsForSlot(slot, levelInfo) {
  const { cornerPos, edgePos } = levelInfo
  const setups = []

  // 基础setup公式
  const baseSetups = {
    FR: ['R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R'],
    FL: ['L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\''],
    BL: ['L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L'],
    BR: ['R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\'']
  }

  // 添加基础setup
  setups.push(...baseSetups[slot])

  // 如果棱块在错误的中层槽位，添加提取公式
  if (edgePos >= 8 && edgePos <= 11) {
    if (edgePos === EDGES.FR) setups.push('R U R\' U\'')
    if (edgePos === EDGES.FL) setups.push('L\' U\' L U')
    if (edgePos === EDGES.BL) setups.push('L U L\' U\'')
    if (edgePos === EDGES.BR) setups.push('R\' U\' R U')
  }

  // 如果角块在D层但不是目标槽位
  if (cornerPos >= 4 && cornerPos <= 7 && cornerPos !== F2L_SLOTS[slot].corner) {
    if (slot === 'FR' || slot === 'BR') {
      setups.push('R U R\' U\' R U R\' U\' R U R\'')
    } else {
      setups.push('L\' U\' L U L\' U\' L U L\' U\' L')
    }
  }

  return [...new Set(setups)]
}

// ============================================================
// 主求解函数
// ============================================================

function solveF2LIntegrated(cube, options = {}) {
  const { verbose = false } = options
  const solution = []
  const details = {}

  // 计算所有槽位复杂度并排序
  const slots = ['FR', 'FL', 'BL', 'BR']
  const slotComplexity = slots.map(slot => {
    const levelInfo = calculateSlotLevel(cube, slot)
    let score = levelInfo.level * 10
    if (levelInfo.level === 1) score -= 5  // L1优先
    return { slot, score, levelInfo }
  })

  slotComplexity.sort((a, b) => a.score - b.score)

  if (verbose) {
    console.log('  槽位解决顺序:', slotComplexity.map(s => s.slot).join(' -> '))
  }

  // 逐个求解槽位
  for (const { slot } of slotComplexity) {
    const result = solveSlot(cube, slot, verbose)
    details[slot] = {
      level: calculateSlotLevel(cube, slot).level,
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

// ============================================================
// 导出
// ============================================================

module.exports = {
  solveF2LIntegrated,
  solveSlot,
  isSlotComplete,
  isCrossIntact,
  calculateSlotLevel
}
