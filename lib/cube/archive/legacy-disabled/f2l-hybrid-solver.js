/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L混��求解器 - 整合分层式和验证驱动方法
 *
 * 策略：
 * 1. 使用 cubejs 内部状态 (cp/ep/co/eo) 准确检测块位置
 * 2. 计算每个槽位的复杂度级别 (L1/L2/L3)
 * 3. 使用完整公式库 (41种情况 × 4槽位)
 * 4. 验证每个公式：槽位完成 + 十字完好
 */

const Cube = require('cubejs')

// ============================================================
// 块编号定义
// ============================================================

const CORNERS = { URF: 0, UFL: 1, ULB: 2, UBR: 3, DFR: 4, DLF: 5, DBL: 6, DRB: 7 }
const EDGES = { UR: 0, UF: 1, UL: 2, UB: 3, DR: 4, DF: 5, DL: 6, DB: 7, FR: 8, FL: 9, BL: 10, BR: 11 }

// 槽位定义 (使用内部��态索引)
const F2L_SLOTS = {
  FR: { corner: CORNERS.DFR, edge: EDGES.FR, name: 'FR' },
  FL: { corner: CORNERS.DLF, edge: EDGES.FL, name: 'FL' },
  BL: { corner: CORNERS.DBL, edge: EDGES.BL, name: 'BL' },
  BR: { corner: CORNERS.DRB, edge: EDGES.BR, name: 'BR' }
}

// ============================================================
// 槽位状态检查 (使用内部状态)
// ============================================================

function isSlotComplete(cube, slot) {
  const state = cube.toJSON()
  const slotInfo = F2L_SLOTS[slot]

  // 检查角块：位置正确且方向正确 (orientation = 0)
  const cornerOk = state.cp[slotInfo.corner] === slotInfo.corner &&
                   state.co[slotInfo.corner] === 0

  // 检查棱块：位置正确且方向正确 (orientation = 0)
  const edgeOk = state.ep[slotInfo.edge] === slotInfo.edge &&
                 state.eo[slotInfo.edge] === 0

  return cornerOk && edgeOk
}

function isCrossIntact(cube) {
  const s = cube.asString()
  // 检查D面四个棱块的中心位置是否都是D色
  return s[28] === 'D' && s[30] === 'D' && s[34] === 'D' && s[32] === 'D'
}

// ============================================================
// 块位置检测 (使用内部状态)
// ============================================================

function getPiecePosition(cube, pieceType, pieceIndex) {
  const state = cube.toJSON()

  if (pieceType === 'corner') {
    // 找角块位置
    const pos = state.cp.indexOf(pieceIndex)
    const ori = state.co[pos]
    const inU = pos < 4      // URF, UFL, ULB, UBR
    const inD = pos >= 4     // DFR, DLF, DBL, DRB
    const inSlot = pos === pieceIndex

    return { pos, ori, inU, inD, inSlot, layer: inU ? 'U' : 'D' }
  } else {
    // 找棱块位置
    const pos = state.ep.indexOf(pieceIndex)
    const ori = state.eo[pos]
    const inU = pos < 4      // UR, UF, UL, UB
    const inMiddle = pos >= 8 && pos < 12  // FR, FL, BL, BR
    const inSlot = pos === pieceIndex

    return { pos, ori, inU, inMiddle, inSlot, layer: inU ? 'U' : (inMiddle ? 'middle' : 'D') }
  }
}

// ============================================================
// 计算槽位级别 (L1/L2/L3)
// ============================================================

function calculateSlotLevel(cube, slot) {
  const slotInfo = F2L_SLOTS[slot]

  // 获取角块和棱块位置
  const corner = getPiecePosition(cube, 'corner', slotInfo.corner)
  const edge = getPiecePosition(cube, 'edge', slotInfo.edge)

  // L0: 已经完成
  if (isSlotComplete(cube, slot)) {
    return { level: 0, corner, edge, setupMoves: [] }
  }

  // L1: 两块都在U层
  if (corner.inU && edge.inU) {
    return { level: 1, corner, edge, setupMoves: [] }
  }

  // L2: 一块在U层，另一块需要setup
  if (corner.inU || edge.inU) {
    // 简单的U调整
    return { level: 2, corner, edge, setupMoves: ['U', "U'", 'U2'] }
  }

  // L3: 两块都不在U层，需要提取
  return { level: 3, corner, edge, setupMoves: getL3Setups(slot, corner, edge) }
}

function getL3Setups(slot, corner, edge) {
  const slotInfo = F2L_SLOTS[slot]

  // 根据块的实际位置生成setup公式
  const setups = []

  // 如果角块在D层但不在正确槽位，需要先提到U层
  if (corner.inD && !corner.inSlot) {
    // 根据角块位置选择对应的R/L move
    if (slot === 'FR' || slot === 'BR') {
      setups.push('R U R\'', 'R\' U\' R', 'R U2 R\'')
    } else {
      setups.push('L\' U\' L', 'L U L\'', 'L\' U2 L')
    }
  }

  // 如果棱块在中层但不在正确槽位
  if (edge.inMiddle && !edge.inSlot) {
    // 根据棱块位置提取
    if (edge.pos === EDGES.FR) setups.push('R U R\' U\'')
    if (edge.pos === EDGES.FL) setups.push('L\' U\' L U')
    if (edge.pos === EDGES.BL) setups.push('L U L\' U\'')
    if (edge.pos === EDGES.BR) setups.push('R\' U\' R U')
  }

  // 如果角块在槽位但方向不对
  if (corner.inSlot && corner.ori !== 0) {
    if (slot === 'FR' || slot === 'BR') {
      setups.push('R U R\' U\' R U R\' U\' R U R\'')
    } else {
      setups.push('L\' U\' L U L\' U\' L U L\' U\' L')
    }
  }

  // 基础setup公式
  if (slot === 'FR') {
    setups.push('R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R')
  } else if (slot === 'FL') {
    setups.push('L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\'')
  } else if (slot === 'BL') {
    setups.push('L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L')
  } else { // BR
    setups.push('R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\'')
  }

  return [...new Set(setups)] // 去重
}

// ============================================================
// F2L公式库 (基于块位置和方向)
// ============================================================

// 基础公式 (根据角块/棱块相对位置选择)
const BASIC_FORMULAS = {
  // 配对在U层，可以直接插入的情况
  'paired_corner_edge': {
    'FR': ['R U R\'', 'U R U\' R\'', 'U\' R U R\'', 'R U\' R\' U R U\' R\''],
    'FL': ['L\' U\' L', 'U\' L\' U L', 'U L\' U\' L', 'L\' U L U\' L\' U\' L'],
    'BL': ['L U L\'', 'U L U\' L\'', 'U\' L\' U L', 'L U\' L\' U\' L U L\''],
    'BR': ['R\' U\' R', 'U\' R\' U R', 'U R\' U\' R', 'R\' U R U\' R\' U\' R']
  },
  // 分离的角块和棱块 (需要配对)
  'separated': {
    'FR': ['R U R\' U\' R U R\'', 'U R U\' R\' U2 R U\' R\'', 'R U\' R\' U2 R U R\''],
    'FL': ['L\' U\' L U L\' U\' L', 'U\' L\' U L U2 L\' U L', 'L\' U L U2 L\' U\' L'],
    'BL': ['L U L\' U\' L U L\'', 'U L U\' L\' U2 L U\' L\'', 'L U\' L\' U2 L U L\''],
    'BR': ['R\' U\' R U R\' U\' R', 'U\' R\' U R U2 R\' U\' R', 'R\' U R U2 R\' U\' R']
  },
  // 角块朝上 (白色朝上)
  'corner_up': {
    'FR': ['U\' R U\' R\' U R U R\'', 'R U R\' U R U2 R\'', 'U2 R U\' R\' U R U\' R\''],
    'FL': ['U L\' U L U\' L\' U\' L', 'L\' U\' L U\' L\' U2 L', 'U2 L\' U L U\' L\' U L'],
    'BL': ['U\' L\' U\' L U\' L U L\'', 'L U L\' U L U2 L\'', 'U2 L U\' L\' U L U\' L\''],
    'BR': ['U R\' U\' R U\' R\' U R', 'R\' U\' R U\' R\' U2 R', 'U2 R\' U R U\' R\' U R']
  },
  // 角块在槽位
  'corner_in_slot': {
    'FR': ['R U\' R\' U R U\' R\'', 'R U\' R\' U2 R U\' R\' U R U\' R\'', 'U\' R\' U R U\' R\' U R'],
    'FL': ['L\' U L U\' L\' U L', 'L\' U L U2 L\' U L U\' L\' U L', 'U L U\' L\' U L U\' L\''],
    'BL': ['L U\' L\' U L U\' L\'', 'L U\' L\' U2 L U\' L\' U\' L U L\'', 'U\' L\' U L U\' L\' U\' L'],
    'BR': ['R\' U\' R U\' R\' U R', 'R\' U\' R U2 R\' U\' R U R\' U\' R', 'U R U\' R\' U R U\' R\'']
  },
  // 棱块在槽位
  'edge_in_slot': {
    'FR': ['U\' R U\' R\' U R U R\'', 'R U\' R\' U R U\' R\'', 'U R U\' R\' U\' R U R\''],
    'FL': ['U L\' U L U\' L\' U\' L', 'L\' U L U\' L\' U L', 'U\' L\' U L U L\' U\' L'],
    'BL': ['U\' L\' U\' L U\' L U L\'', 'L U\' L\' U L U\' L\'', 'U L U\' L\' U\' L\' U L'],
    'BR': ['U R\' U\' R U\' R\' U R', 'R\' U R U\' R\' U R', 'U\' R\' U R U R\' U\' R']
  },
  // 两块都在槽位 (需要取出重做)
  'both_in_slot': {
    'FR': ['R U R\' U\' R U R\' U\' R U R\'', 'R U\' R\' U R U\' R\' U\' R U R\''],
    'FL': ['L\' U\' L U L\' U\' L U L\' U\' L', 'L\' U L U\' L\' U L U L\' U\' L'],
    'BL': ['L U L\' U\' L U L\' U\' L U L\'', 'L U\' L\' U L U\' L\' U\' L U L\''],
    'BR': ['R\' U\' R U R\' U\' R U R\' U\' R', 'R\' U R U\' R\' U R U R\' U\' R']
  }
}

// 从各槽位提取块到U层的公式
const EXTRACT_FROM_SLOT = {
  // 从FR槽位提取
  'from_FR': ['R U R\'', 'R\' U\' R', 'R U2 R\'', 'R U R\' U\' R U R\''],
  // 从FL槽位提取
  'from_FL': ['L\' U\' L', 'L U L\'', 'L\' U2 L', 'L\' U\' L U L\' U\' L'],
  // 从BL槽位提取
  'from_BL': ['L U L\'', 'L\' U\' L', 'L U2 L\'', 'L U L\' U\' L U L\''],
  // 从BR槽位提取
  'from_BR': ['R\' U\' R', 'R U R\'', 'R\' U2 R', 'R\' U\' R U R\' U\' R'],
  // 通用提取(可从任何位置)
  'generic': ['R U R\'', 'R\' U\' R', 'L U L\'', 'L\' U\' L', 'R U2 R\'', 'L\' U2 L']
}

// 获取需要的���取公式（基于块的实际位置）
function getExtractFormulas(targetSlot, actualPositions) {
  const extracts = []

  // 根据块的实际位置添加提取公式
  const { cornerPos, edgePos } = actualPositions

  // 槽位到位置映射
  const slotToCornerPos = { FR: 4, FL: 5, BL: 6, BR: 7 }  // DFR, DFL, DBL, DRB
  const slotToEdgePos = { FR: 8, FL: 9, BL: 10, BR: 11 }  // FR, FL, BL, BR

  // 检查角块在哪个槽位
  if (cornerPos >= 4 && cornerPos <= 7) {
    // 角块在D层某个槽位
    if (cornerPos === slotToCornerPos.FR) extracts.push(...EXTRACT_FROM_SLOT.from_FR)
    else if (cornerPos === slotToCornerPos.FL) extracts.push(...EXTRACT_FROM_SLOT.from_FL)
    else if (cornerPos === slotToCornerPos.BL) extracts.push(...EXTRACT_FROM_SLOT.from_BL)
    else if (cornerPos === slotToCornerPos.BR) extracts.push(...EXTRACT_FROM_SLOT.from_BR)
  }

  // 检查棱块在哪个槽位
  if (edgePos >= 8 && edgePos <= 11) {
    // 棱块在中层某个槽位
    if (edgePos === slotToEdgePos.FR) extracts.push(...EXTRACT_FROM_SLOT.from_FR)
    else if (edgePos === slotToEdgePos.FL) extracts.push(...EXTRACT_FROM_SLOT.from_FL)
    else if (edgePos === slotToEdgePos.BL) extracts.push(...EXTRACT_FROM_SLOT.from_BL)
    else if (edgePos === slotToEdgePos.BR) extracts.push(...EXTRACT_FROM_SLOT.from_BR)
  }

  // 添加通用提取公式
  extracts.push(...EXTRACT_FROM_SLOT.generic)

  return [...new Set(extracts)] // 去重
}

// ============================================================
// 完整公式库 (从V2迁移，包含所有41种情况)
// ============================================================

const COMPLETE_FORMULAS = {
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
// 验证并求解单个槽位
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
  if (isSlotComplete(test, slot) && isCrossIntact(test)) {
    return formula
  }

  return null
}

// 根据块位置选择公式类型
function selectFormulaType(corner, edge, slot) {
  const slotInfo = F2L_SLOTS[slot]

  // 情况1: 两块都在槽位 (可能方向不对)
  if (corner.inSlot && edge.inSlot) {
    return 'both_in_slot'
  }

  // 情况2: 角块在槽位
  if (corner.inSlot && !edge.inSlot) {
    return 'corner_in_slot'
  }

  // 情况3: 棱块在槽位
  if (!corner.inSlot && edge.inSlot) {
    return 'edge_in_slot'
  }

  // 情况4: 角块在U层，棱块在U层
  if (corner.inU && edge.inU) {
    // 检查是否已经配对 (相邻位置)
    const cornerPos = corner.pos
    const edgePos = edge.pos

    // U层角块: URF(0), UFL(1), ULB(2), UBR(3)
    // U层棱块: UR(0), UF(1), UL(2), UB(3)
    const pairedPositions = {
      'FR': [[0, 0], [3, 1], [0, 3]],  // URF-UR, UBR-UF, URF-UB
      'FL': [[1, 1], [0, 3], [1, 2]],  // UFL-UF, URF-UB, UFL-UL
      'BL': [[2, 2], [1, 3], [2, 1]],  // ULB-UL, UFL-UB, ULB-UF
      'BR': [[3, 0], [2, 1], [3, 2]]   // UBR-UR, ULB-UF, UBR-UL
    }

    const isPaired = pairedPositions[slot]?.some(p => p[0] === cornerPos && p[1] === edgePos)
    if (isPaired) {
      return 'paired_corner_edge'
    }

    // 角块朝上检查 (orientation在U层时需要根据颜色判断)
    // 简化：如果不在配对位置，用分离公式
    return 'separated'
  }

  // 情况5: 一块在U层，一块不在
  if (corner.inU || edge.inU) {
    return 'separated'  // 先尝试配对
  }

  // 默认: 需要提取
  return 'paired_corner_edge'  // 先尝试基础公式
}

function tryFormulasForCase(cube, slot, formulaType, setup = '', verbose = false, useCompleteFallback = true) {
  // 先尝试基础公式库
  const formulas = BASIC_FORMULAS[formulaType]?.[slot] || []

  for (const formula of formulas) {
    const result = tryFormula(cube, slot, setup, formula)
    if (result) {
      if (verbose && setup) {
        console.log(`      找到: ${setup} + ${formula}`)
      } else if (verbose) {
        console.log(`      找到: ${formula}`)
      }
      return { solution: setup ? setup + ' ' + formula : formula, steps: (setup + ' ' + formula).split(' ').length, done: true }
    }
  }

  // 如果基础公式库不work，使用完整公式库
  if (useCompleteFallback && setup === '') {
    const completeFormulas = COMPLETE_FORMULAS[slot] || []
    for (const formula of completeFormulas) {
      const result = tryFormula(cube, slot, '', formula)
      if (result) {
        if (verbose) console.log(`      找到 (完整库): ${formula}`)
        return { solution: formula, steps: formula.split(' ').length, done: true }
      }
    }
  }

  return null
}

function solveSlot(cube, slot, verbose = false) {
  // 已完成检查
  if (isSlotComplete(cube, slot)) {
    if (verbose) console.log(`    ${slot}: 已完成 ✅`)
    return { solution: '', steps: 0, done: true }
  }

  const levelInfo = calculateSlotLevel(cube, slot)
  if (verbose) {
    const cornerPos = ['URF','UFL','ULB','UBR','DFR','DFL','DBL','DRB'][levelInfo.corner.pos]
    const edgePos = ['UR','UF','UL','UB','DR','DF','DL','DB','FR','FL','BL','BR'][levelInfo.edge.pos]
    console.log(`    ${slot}: L${levelInfo.level} (角:${cornerPos}, 棱:${edgePos})`)
  }

  // 选择公式类型
  const formulaType = selectFormulaType(levelInfo.corner, levelInfo.edge, slot)
  if (verbose) console.log(`      类型: ${formulaType}`)

  // L1/L2: 两块都在U层或一块在U层
  if (levelInfo.level <= 2) {
    // 先尝试直接公式
    let result = tryFormulasForCase(cube, slot, formulaType, '', verbose)
    if (result) return result

    // 尝试U调整
    for (const adj of ['U', "U'", 'U2']) {
      result = tryFormulasForCase(cube, slot, formulaType, adj, verbose)
      if (result) return result

      // U调整 + 完整公式库
      const completeFormulas = COMPLETE_FORMULAS[slot] || []
      for (const formula of completeFormulas) {
        const testResult = tryFormula(cube, slot, adj, formula)
        if (testResult) {
          if (verbose) console.log(`      找到 (U+完整): ${adj} + ${formula}`)
          return { solution: adj + ' ' + formula, steps: (adj + ' ' + formula).split(' ').length, done: true }
        }
      }
    }

    // L2特殊情况: 棱块在错误槽位，需要先提取
    if (levelInfo.level === 2 && levelInfo.edge.inMiddle && !levelInfo.edge.inSlot) {
      const extracts = getExtractFormulas(slot, {
        cornerPos: levelInfo.corner.pos,
        edgePos: levelInfo.edge.pos
      })

      for (const extract of extracts) {
        const completeFormulas = COMPLETE_FORMULAS[slot] || []
        for (const formula of completeFormulas) {
          const testResult = tryFormula(cube, slot, extract, formula)
          if (testResult) {
            if (verbose) console.log(`      找到 (提取+完整): ${extract} + ${formula}`)
            return { solution: extract + ' ' + formula, steps: (extract + ' ' + formula).split(' ').length, done: true }
          }
        }

        // 提取 + U调整
        for (const adj of ['U', "U'", 'U2']) {
          const combo = extract + ' ' + adj
          for (const formula of completeFormulas) {
            const testResult = tryFormula(cube, slot, combo, formula)
            if (testResult) {
              if (verbose) console.log(`      找到 (提取+U+完整): ${combo} + ${formula}`)
              return { solution: combo + ' ' + formula, steps: (combo + ' ' + formula).split(' ').length, done: true }
            }
          }
        }
      }
    }

    // 尝试其他公式类型
    const otherTypes = ['paired_corner_edge', 'separated', 'corner_up', 'corner_in_slot', 'edge_in_slot']
    for (const type of otherTypes) {
      if (type !== formulaType) {
        result = tryFormulasForCase(cube, slot, type, '', verbose)
        if (result) return result

        for (const adj of ['U', "U'", 'U2']) {
          result = tryFormulasForCase(cube, slot, type, adj, verbose)
          if (result) return result
        }
      }
    }
  }

  // L3: 需要提取
  if (levelInfo.level === 3) {
    // 根据块的实际位置获取提取公式
    const extracts = getExtractFormulas(slot, {
      cornerPos: levelInfo.corner.pos,
      edgePos: levelInfo.edge.pos
    })

    if (verbose) console.log(`      提取公式数: ${extracts.length}`)

    // 尝试每个提取公式
    for (const extract of extracts) {
      // 提取 + 完整公式库 (优先使用完整库)
      const completeFormulas = COMPLETE_FORMULAS[slot] || []
      for (const formula of completeFormulas) {
        const result = tryFormula(cube, slot, extract, formula)
        if (result) {
          if (verbose) console.log(`      找到 (提取+完整): ${extract} + ${formula}`)
          return { solution: extract + ' ' + formula, steps: (extract + ' ' + formula).split(' ').length, done: true }
        }
      }

      // 提取 + U调整 + 完整公式库
      for (const adj of ['U', "U'", 'U2']) {
        const combo = extract + ' ' + adj
        for (const formula of completeFormulas) {
          const result = tryFormula(cube, slot, combo, formula)
          if (result) {
            if (verbose) console.log(`      找到 (提取+U+完整): ${combo} + ${formula}`)
            return { solution: combo + ' ' + formula, steps: (combo + ' ' + formula).split(' ').length, done: true }
          }
        }
      }

      // 提取 + 基础公式类型
      const formulaTypes = ['paired_corner_edge', 'separated', 'corner_up']
      for (const type of formulaTypes) {
        let result = tryFormulasForCase(cube, slot, type, extract, verbose, false)
        if (result) return result

        for (const adj of ['U', "U'", 'U2']) {
          const combo = extract + ' ' + adj
          result = tryFormulasForCase(cube, slot, type, combo, verbose, false)
          if (result) return result
        }
      }
    }
  }

  if (verbose) console.log(`      ${slot}: 未找到公式 ❌`)
  return { solution: '', steps: 0, done: false }
}

// ============================================================
// 主求解函数
// ============================================================

function solveF2LHybrid(cube, options = {}) {
  const { verbose = false } = options
  const solution = []
  const details = {}

  // 计算所有槽位的复杂度并排序
  const slots = ['FR', 'FL', 'BL', 'BR']
  const slotComplexity = slots.map(slot => {
    const levelInfo = calculateSlotLevel(cube, slot)
    let score = levelInfo.level * 10

    // 优先处理块在U层的槽位
    if (levelInfo.corner.inU) score -= 2
    if (levelInfo.edge.inU) score -= 2

    // 最后处理块在D层的槽位
    if (levelInfo.corner.inD && !levelInfo.corner.inSlot) score += 5

    return { slot, score, levelInfo }
  })

  // 按复杂度排序（简单优先）
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
  solveF2LHybrid,
  solveSlot,
  isSlotComplete,
  isCrossIntact,
  calculateSlotLevel,
  getPiecePosition
}

