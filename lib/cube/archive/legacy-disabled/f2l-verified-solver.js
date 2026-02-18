/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L验证驱动求解器
 *
 * 核心思想：尝试公式 → 验证 → 返回work的公式
 */

const Cube = require('cubejs')

// ============================================================
// 槽位检查
// ============================================================

const SLOT_INDICES = {
  'FR': [29, 26, 15, 12, 23],  // DFR corner + FR edge
  'FL': [27, 44, 24, 40, 21],  // DFL corner + FL edge
  'BL': [33, 42, 53, 48, 39],  // DBL corner + BL edge
  'BR': [35, 51, 17, 50, 14],  // DBR corner + BR edge
}

function checkSlotComplete(stateStr, slot) {
  const idx = SLOT_INDICES[slot]
  const exp = slot === 'FR' ? 'DFRFR' : slot === 'FL' ? 'DFLFL' : slot === 'BL' ? 'DBLBL' : 'DBRBR'

  const corner = stateStr[idx[0]] + stateStr[idx[1]] + stateStr[idx[2]]
  const edge = stateStr[idx[3]] + stateStr[idx[4]]

  return corner.split('').sort().join('') === exp.substring(0, 3) &&
         edge.split('').sort().join('') === exp.substring(3, 6)
}

function checkCrossIntact(stateStr) {
  return stateStr[28] === 'D' && stateStr[30] === 'D' &&
         stateStr[34] === 'D' && stateStr[32] === 'D'
}

// ============================================================
// 公式库 - 只包含经过验证的
// ============================================================

const VERIFIED_FORMULAS = [
  // L1: 标准态 (角块+棱块都在U层)
  { slot: 'FR', formula: 'R U R\'' },
  { slot: 'FR', formula: 'U R U\' R\'' },
  { slot: 'FR', formula: 'U\' R U\' R\'' },
  { slot: 'FL', formula: 'L\' U\' L' },
  { slot: 'FL', formula: 'U\' L\' U L' },
  { slot: 'FL', formula: 'U L U\' L\'' },
  { slot: 'BL', formula: 'L U L\'' },
  { slot: 'BL', formula: 'U L U\' L\'' },
  { slot: 'BR', formula: 'R\' U\' R' },
  { slot: 'BR', formula: 'U R\' U\' R' },

  // L2: 常见配对公式
  { slot: 'FR', formula: 'R U\' R\' U R U\' R\'' },
  { slot: 'FR', formula: 'U\' R U R\' U\' R U R\'' },
  { slot: 'FL', formula: 'L U L\' U\' L U L\'' },
  { slot: 'FL', formula: 'U L\' U L U\' L\' U L\'' },
]

// ============================================================
// 主求解函数
// ============================================================

function solveF2LSlot(cube, slot) {
  console.log(`  求解${slot}...`)

  // 如果已经完成，返回空
  if (checkSlotComplete(cube.asString(), slot)) {
    console.log(`    ${slot} 已完成 ✅`)
    return ''
  }

  // 策略1: 尝试所有公式，验证哪个work
  for (const { slot: s, formula } of VERIFIED_FORMULAS) {
    if (s !== slot) continue

    const test = new Cube(cube)
    test.move(formula)

    if (checkSlotComplete(test.asString(), slot) && checkCrossIntact(test.asString())) {
      console.log(`    找到公式: ${formula}`)
      return formula
    }
  }

  // 策略2: 尝试带U调整的公式
  const uAdjustments = ['U', "U'", 'U2']
  for (const adj of uAdjustments) {
    for (const { slot: s, formula } of VERIFIED_FORMULAS) {
      if (s !== slot) continue

      const test = new Cube(cube)
      test.move(adj + ' ' + formula)

      if (checkSlotComplete(test.asString(), slot) && checkCrossIntact(test.asString())) {
        console.log(`    找到公式: ${adj} ${formula}`)
        return adj + ' ' + formula
      }
    }
  }

  console.log(`    ${slot} 未找到公式 ❌`)
  return ''
}

function solveF2LVerified(cube) {
  const solution = []
  const slots = ['FR', 'FL', 'BL', 'BR']

  for (const slot of slots) {
    const slotSol = solveF2LSlot(cube, slot)
    if (slotSol) {
      cube.move(slotSol)
      solution.push(slotSol)
    }
  }

  return solution.join(' ')
}

// ============================================================
// 导出
// ============================================================

module.exports = {
  solveF2LVerified,
  solveF2LSlot,
  checkSlotComplete,
  checkCrossIntact,
}

