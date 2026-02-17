/**
 * F2L 求解器 - 基于块排列（Permutation-Based）
 *
 * 使用 cubejs 的内部 ep/cp 数组来追踪块位置，而不是 asString()
 *
 * 块定义（来自 cubejs 源码）：
 * 角块: [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB] = [0, 1, 2, 3, 4, 5, 6, 7]
 * 棱块: [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
 * 面: [U, R, F, D, L, B] = [0, 1, 2, 3, 4, 5]
 */

const Cube = require('cubejs')

// ===== 常量定义 =====

// 角块位置 (从 cube.js)
const CORNERS = {
  URF: 0, UFL: 1, ULB: 2, UBR: 3,
  DFR: 4, DLF: 5, DBL: 6, DRB: 7
}

// 棱块位置 (从 cube.js)
const EDGES = {
  UR: 0, UF: 1, UL: 2, UB: 3,
  DR: 4, DF: 5, DL: 6, DB: 7,
  FR: 8, FL: 9, BL: 10, BR: 11
}

// 角块颜色 (从 cube.js: cornerColor)
const CORNER_COLORS = [
  ['U', 'R', 'F'],  // 0: URF
  ['U', 'F', 'L'],  // 1: UFL
  ['U', 'L', 'B'],  // 2: ULB
  ['U', 'B', 'R'],  // 3: UBR
  ['D', 'F', 'R'],  // 4: DFR
  ['D', 'L', 'F'],  // 5: DLF
  ['D', 'B', 'L'],  // 6: DBL
  ['D', 'R', 'B']   // 7: DRB
]

// 棱块颜色 (从 cube.js: edgeColor)
const EDGE_COLORS = [
  ['U', 'R'],  // 0: UR
  ['U', 'F'],  // 1: UF
  ['U', 'L'],  // 2: UL
  ['U', 'B'],  // 3: UB
  ['D', 'R'],  // 4: DR
  ['D', 'F'],  // 5: DF
  ['D', 'L'],  // 6: DL
  ['D', 'B'],  // 7: DB
  ['F', 'R'],  // 8: FR
  ['F', 'L'],  // 9: FL
  ['B', 'L'],  // 10: BL
  ['B', 'R']   // 11: BR
]

// F2L 槽位定义
const SLOTS = {
  FR: {
    name: 'FR',
    corner: CORNERS.DFR,  // DFR 位置 (角块 4)
    edge: EDGES.FR,       // FR 位置 (棱块 8)
    cornerPiece: CORNERS.DFR,  // 目标角块: DFR (D,F,R)
    edgePiece: EDGES.FR        // 目标棱块: FR (F,R)
  },
  FL: {
    name: 'FL',
    corner: CORNERS.DLF,  // DLF 位置 (角块 5)
    edge: EDGES.FL,       // FL 位置 (棱块 9)
    cornerPiece: CORNERS.DLF,  // 目标角块: DLF (D,L,F)
    edgePiece: EDGES.FL        // 目标棱块: FL (F,L)
  },
  BL: {
    name: 'BL',
    corner: CORNERS.DBL,  // DBL 位置 (角块 6)
    edge: EDGES.BL,       // BL 位置 (棱块 10)
    cornerPiece: CORNERS.DBL,  // 目标角块: DBL (D,B,L)
    edgePiece: EDGES.BL        // 目标棱块: BL (B,L)
  },
  BR: {
    name: 'BR',
    corner: CORNERS.DRB,  // DRB 位置 (角块 7)
    edge: EDGES.BR,       // BR 位置 (棱块 11)
    cornerPiece: CORNERS.DRB,  // 目标角块: DRB (D,R,B)
    edgePiece: EDGES.BR        // 目标棱块: BR (B,R)
  }
}

// ===== 工具函数 =====

/**
 * 检查槽位是否已完成
 */
function isSlotDone(cube, slot) {
  const state = cube.toJSON()
  const slotInfo = SLOTS[slot]

  // 角块在正确位置且方向正确
  const cornerCorrect = state.cp[slotInfo.corner] === slotInfo.cornerPiece &&
                        state.co[slotInfo.corner] === 0

  // 棱块在正确位置且方向正确
  const edgeCorrect = state.ep[slotInfo.edge] === slotInfo.edgePiece &&
                      state.eo[slotInfo.edge] === 0

  return cornerCorrect && edgeCorrect
}

/**
 * Cross 完整性检查（仅检查 4 条 D 层棱块是否归位且方向正确）
 */
function isCrossSolved(cube) {
  const state = cube.toJSON()
  const dEdges = [EDGES.DR, EDGES.DF, EDGES.DL, EDGES.DB]
  return dEdges.every(pos => state.ep[pos] === pos && state.eo[pos] === 0)
}

/**
 * 获取角块所在位置和状态
 * @param {Object} state - cube.toJSON() 的结果
 * @param {number} cornerPiece - 角块编号 (0-7)
 * @returns {Object} { position: 位置, orientation: 方向, isInU: 是否在U层 }
 */
function getCornerLocation(state, cornerPiece) {
  for (let i = 0; i < 8; i++) {
    if (state.cp[i] === cornerPiece) {
      const isInU = i < 4  // URF, UFL, ULB, UBR
      return {
        position: i,
        orientation: state.co[i],
        isInU,
        name: getCornerName(i)
      }
    }
  }
  return null
}

/**
 * 获取棱块所在位置和状态
 * @param {Object} state - cube.toJSON() 的结果
 * @param {number} edgePiece - 棱块编号 (0-11)
 * @returns {Object} { position: 位置, orientation: 方向, isInU: 是否在U层 }
 */
function getEdgeLocation(state, edgePiece) {
  for (let i = 0; i < 12; i++) {
    if (state.ep[i] === edgePiece) {
      const isInU = i < 4  // UR, UF, UL, UB
      return {
        position: i,
        orientation: state.eo[i],
        isInU,
        name: getEdgeName(i)
      }
    }
  }
  return null
}

function getCornerName(idx) {
  return Object.keys(CORNERS).find(k => CORNERS[k] === idx) || 'UNKNOWN'
}

function getEdgeName(idx) {
  return Object.keys(EDGES).find(k => EDGES[k] === idx) || 'UNKNOWN'
}

/**
 * Analyze F2L slot by layered method:
 * - STANDARD: 标态
 * - EASY_NONSTANDARD: 易转标态的非标态
 * - HARD_NONSTANDARD: 难转标态的非标态
 */
function analyzeSlot(cube, slot) {
  if (isSlotDone(cube, slot)) {
    return { level: 'DONE', stateClass: 'DONE', slot }
  }

  const state = cube.toJSON()
  const slotInfo = SLOTS[slot]
  const corner = getCornerLocation(state, slotInfo.cornerPiece)
  const edge = getEdgeLocation(state, slotInfo.edgePiece)

  if (!corner || !edge) {
    return { level: 'ERROR', stateClass: 'HARD_NONSTANDARD', corner, edge }
  }

  // Practical standard-state definition:
  // 1) immediate insert possible (no AUF setup) => STANDARD
  // 2) insert possible with short AUF setup => EXECUTABLE_STANDARD
  const immediateInsert = findDirectInsertNoAUF(cube, slot, [])
  if (immediateInsert) {
    return { level: 'L1', stateClass: 'STANDARD', corner, edge, slot, sublevel: 'immediate-insert' }
  }
  const executableInsert = findDirectInsertBySimulation(cube, slot, [])
  if (executableInsert) {
    return { level: 'L1', stateClass: 'EXECUTABLE_STANDARD', corner, edge, slot, sublevel: 'auf-insert' }
  }

  if (corner.isInU && edge.isInU) {
    return { level: 'L2', stateClass: 'EASY_NONSTANDARD', corner, edge, slot, sublevel: 'both-in-U' }
  }
  if (corner.isInU !== edge.isInU) {
    return { level: 'L3', stateClass: 'EASY_NONSTANDARD', corner, edge, slot, sublevel: 'single-in-U' }
  }
  return { level: 'L3', stateClass: 'HARD_NONSTANDARD', corner, edge, slot, sublevel: 'both-not-in-U' }
}

function areCornersAndEdgesAdjacent(cornerPos, edgePos) {
  // U层角块和棱块的相邻关系
  const adjacent = {
    // URF(0) 相邻 UR(0) 和 UF(1)
    0: [0, 1],
    // UFL(1) 相邻 UF(1) 和 UL(2)
    1: [1, 2],
    // ULB(2) 相邻 UL(2) 和 UB(3)
    2: [2, 3],
    // UBR(3) 相邻 UB(3) 和 UR(0)
    3: [3, 0]
  }
  return adjacent[cornerPos]?.includes(edgePos) || false
}

// ===== L3 提取公式 =====

/**
 * L3 提取公式 - 将块从槽位中提取到U层
 * 基于块的实际位置，而不是贴纸颜色
 *
 * 命名规则:
 * - 角块位置-棱块位置 (如 DFR-FR, DLF-U, U-FR)
 * - U 表示 U 层任意位置
 */

// 棱块所在位置对应的提取面
const EDGE_TO_FACE = {
  // FR 槽位提取
  FR: 'R', FL: 'F', BL: 'L', BR: 'R',
  // U 层棱块
  UF: 'F', UB: 'B', UL: 'L', UR: 'R',
  // D 层棱块
  DF: 'F', DB: 'B', DL: 'L', DR: 'R'
}

/**
 * 动态生成 L3 提取公式
 * @param {string} slot - 槽位名称
 * @param {Object} corner - 角块位置信息
 * @param {Object} edge - 棱块位置信息
 * @returns {string} 提取公式
 */
function generateL3Extraction(slot, corner, edge) {
  const slotInfo = SLOTS[slot]

  // 两块都在 U 层 -> 不是 L3
  if (corner.isInU && edge.isInU) {
    return ''
  }

  // ��块都不在 U 层
  if (!corner.isInU && !edge.isInU) {
    // 角块在本槽位，棱块也在本槽位
    if (corner.position === slotInfo.corner && edge.position === slotInfo.edge) {
      // 标准槽位提取
      switch (slot) {
        case 'FR': return 'R U R\''
        case 'FL': return 'L\' U\' L'
        case 'BL': return 'L U L\''
        case 'BR': return 'R\' U R'
      }
    }

    // 角块在本槽位，棱块在其他槽位
    if (corner.position === slotInfo.corner) {
      // 先提取角块到 U 层
      switch (slot) {
        case 'FR': return 'R U\' R\''
        case 'FL': return 'L\' U L'
        case 'BL': return 'L U\' L\''
        case 'BR': return 'R\' U\' R'
      }
    }

    // 棱块在本槽位，角块在其他槽位
    if (edge.position === slotInfo.edge) {
      // 先提取棱块到 U 层
      switch (slot) {
        case 'FR': return 'F\' U\' F'
        case 'FL': return 'F U F\''
        case 'BL': return 'B\' U\' B'
        case 'BR': return 'B U B\''
      }
    }

    // 两块都不在本槽位 - 提取角块
    const cornerSlot = getSlotByCorner(corner.position)
    if (cornerSlot) {
      return generateL3Extraction(cornerSlot, corner, { isInU: true, position: -1 })
    }
  }

  // 角块在槽位，棱块在 U 层
  if (!corner.isInU && edge.isInU) {
    // 角块在本槽位
    if (corner.position === slotInfo.corner) {
      switch (slot) {
        case 'FR': return 'R U\' R\''
        case 'FL': return 'L\' U L'
        case 'BL': return 'L U\' L\''
        case 'BR': return 'R\' U\' R'
      }
    }

    // 角块在其他槽位 - 先提取角块
    const cornerSlot = getSlotByCorner(corner.position)
    if (cornerSlot) {
      return generateL3Extraction(cornerSlot, corner, { isInU: true })
    }
  }

  // 棱块在槽位，角块在 U 层
  if (corner.isInU && !edge.isInU) {
    // 棱块在本槽位
    if (edge.position === slotInfo.edge) {
      switch (slot) {
        case 'FR': return 'F\' U\' F'
        case 'FL': return 'F U F\''
        case 'BL': return 'B\' U\' B'
        case 'BR': return 'B U B\''
      }
    }

    // 棱块在其他槽位 - 先提取棱块
    const edgeSlot = getSlotByEdge(edge.position)
    if (edgeSlot) {
      return generateL3Extraction(edgeSlot, { isInU: true }, edge)
    }
  }

  return ''
}

/**
 * 根据角块位置获取所属槽位
 */
function getSlotByCorner(cornerPos) {
  const mapping = {
    [CORNERS.DFR]: 'FR',
    [CORNERS.DLF]: 'FL',
    [CORNERS.DBL]: 'BL',
    [CORNERS.DRB]: 'BR'
  }
  return mapping[cornerPos] || null
}

/**
 * 根据棱块位置获取所属槽位
 */
function getSlotByEdge(edgePos) {
  const mapping = {
    [EDGES.FR]: 'FR',
    [EDGES.FL]: 'FL',
    [EDGES.BL]: 'BL',
    [EDGES.BR]: 'BR'
  }
  return mapping[edgePos] || null
}

/**
 * 生成 L3 提取公式
 */
function getL3Extraction(analysis) {
  const { level, corner, edge, slot } = analysis

  if (level !== 'L3') {
    return ''
  }

  return generateL3Extraction(slot, corner, edge)
}

// ===== L2 公式 =====

/**
 * L2 U层调整公式
 */
const L2_ADJUSTMENTS = {
  // FR 槽位
  FR: {
    'URF-UF': 'U R U\' R\'',
    'URF-UL': 'U2 R U\' R\'',
    'URF-UB': 'U\' R U\' R\'',
    'UFL-UF': 'U\' F\' U F',
    'UFL-UL': 'F\' U F',
    'UFL-UB': 'U F\' U F',
    'ULB-UF': 'U2 F\' U F',
    'ULB-UL': 'U F\' U F',
    'ULB-UB': 'F\' U F',
    'UBR-UF': 'U F\' U F',
    'UBR-UL': 'U2 F\' U F',
    'UBR-UB': 'F\' U F'
  },
  // FL 槽位
  FL: {
    'URF-UF': 'U\' F U\' F\'',
    'URF-UL': 'F U\' F\'',
    'URF-UB': 'U F U\' F\'',
    'UFL-UF': 'L U\' L\'',
    'UFL-UL': 'U\' L U\' L\'',
    'UFL-UB': 'U2 L U\' L\'',
    'ULB-UF': 'U L U\' L\'',
    'ULB-UL': 'L U\' L\'',
    'ULB-UB': 'U\' L U\' L\'',
    'UBR-UF': 'U2 L U\' L\'',
    'UBR-UL': 'U L U\' L\'',
    'UBR-UB': 'L U\' L\''
  },
  // BL 槽位
  BL: {
    'URF-UF': 'L\' U L',
    'URF-UL': 'U L\' U L',
    'URF-UB': 'U2 L\' U L',
    'UFL-UF': 'U\' L\' U L',
    'UFL-UL': 'L\' U L',
    'UFL-UB': 'U L\' U L',
    'ULB-UF': 'U2 L\' U L',
    'ULB-UL': 'U\' L\' U L',
    'ULB-UB': 'L\' U L',
    'UBR-UF': 'U L\' U L',
    'UBR-UL': 'U2 L\' U L',
    'UBR-UB': 'U\' L\' U L'
  },
  // BR 槽位
  BR: {
    'URF-UF': 'R\' U\' R',
    'URF-UL': 'U R\' U\' R',
    'URF-UB': 'U2 R\' U\' R',
    'UFL-UF': 'U2 R\' U\' R',
    'UFL-UL': 'U R\' U\' R',
    'UFL-UB': 'R\' U\' R',
    'ULB-UF': 'U R\' U\' R',
    'ULB-UL': 'U2 R\' U\' R',
    'ULB-UB': 'U\' R\' U\' R',
    'UBR-UF': 'R\' U\' R',
    'UBR-UL': 'U R\' U\' R',
    'UBR-UB': 'U2 R\' U\' R'
  }
}

/**
 * 生成 L2 调整公式
 */
function getL2Adjustment(analysis) {
  const { level, corner, edge, slot } = analysis

  if (level !== 'L2') {
    return ''
  }

  const key = `${corner.name}-${edge.name}`
  return L2_ADJUSTMENTS[slot][key] || ''
}

// ===== L1 标态公式 =====

/**
 * L1 标态公式 - 角块和棱块都在U层且相邻
 */
const L1_STANDARD_FORMULAS = {
  FR: [
    { case: 'white-up', formula: 'U R U\' R\'' },
    { case: 'white-front', formula: 'R U R\'' },
    { case: 'white-right', formula: 'U\' R U\' R\' U R U R\'' }
  ],
  FL: [
    { case: 'white-up', formula: 'U\' F\' U F' },
    { case: 'white-front', formula: 'F U\' F\'' },
    { case: 'white-left', formula: 'U F U\' F\' U\' F\' U F' }
  ],
  BL: [
    { case: 'white-up', formula: 'U L\' U L' },
    { case: 'white-left', formula: 'L\' U L' },
    { case: 'white-back', formula: 'U\' L\' U L U L\' U\' L' }
  ],
  BR: [
    { case: 'white-up', formula: 'U\' R U\' R\'' },
    { case: 'white-back', formula: 'R\' U\' R' },
    { case: 'white-right', formula: 'U R\' U\' R U\' R\' U R' }
  ]
}

/**
 * 生成 L1 标态公式
 */
function getL1Formula(analysis) {
  const { level, corner, edge, slot } = analysis

  if (level !== 'L1') {
    return ''
  }

  // 根据 D 面颜色位置判断 case
  // 0 = D面朝下, 1 = D面朝前, 2 = D面朝侧
  const caseIndex = corner.orientation
  return L1_STANDARD_FORMULAS[slot][caseIndex]?.formula || ''
}

// ===== 主求解函数 =====

/**
 * 求解单个 F2L 槽位
 * @param {Cube} cube - cubejs 实例
 * @param {string} slot - 槽位名称 ('FR', 'FL', 'BL', 'BR')
 * @returns {Object} { solution: string, analysis: Object }
 */
function solveSlot(cube, slot) {
  const analysis = analyzeSlot(cube, slot)

  if (analysis.level === 'DONE') {
    return { solution: '', analysis: { ...analysis, message: '槽位已完成' } }
  }

  let solution = ''

  switch (analysis.level) {
    case 'L3':
      solution = getL3Extraction(analysis)
      if (!solution) {
        return { solution: '', analysis: { ...analysis, message: '未找到 L3 提取公式' } }
      }
      break

    case 'L2':
      solution = getL2Adjustment(analysis)
      if (!solution) {
        return { solution: '', analysis: { ...analysis, message: '未找到 L2 调整公式' } }
      }
      break

    case 'L1':
      solution = getL1Formula(analysis)
      if (!solution) {
        return { solution: '', analysis: { ...analysis, message: '未找到 L1 公式' } }
      }
      break

    default:
      return { solution: '', analysis: { ...analysis, message: '未知状态' } }
  }

  return { solution, analysis }
}

function levelScore(level) {
  switch (level) {
    case 'DONE': return 0
    case 'L1': return 1
    case 'L2': return 2
    case 'L3': return 3
    default: return 99
  }
}

function classScore(stateClass) {
  switch (stateClass) {
    case 'DONE': return 0
    case 'STANDARD': return 1
    case 'EXECUTABLE_STANDARD': return 2
    case 'EASY_NONSTANDARD': return 3
    case 'HARD_NONSTANDARD': return 4
    default: return 99
  }
}

function cubeSignature(cube) {
  const s = cube.toJSON()
  return `${s.cp.join(',')}|${s.co.join(',')}|${s.ep.join(',')}|${s.eo.join(',')}`
}

function countMoves(sequence) {
  return (sequence || '').trim().split(/\s+/).filter(Boolean).length
}

function invertMove(move) {
  if (!move) return move
  if (move.endsWith('2')) return move
  if (move.endsWith("'")) return move.slice(0, -1)
  return `${move}'`
}

function invertAlgorithm(sequence) {
  const moves = (sequence || '').trim().split(/\s+/).filter(Boolean)
  return moves.reverse().map(invertMove).join(' ')
}

function movePower(move) {
  if (move.endsWith('2')) return 2
  if (move.endsWith("'")) return 3
  return 1
}

function buildMove(face, power) {
  const p = ((power % 4) + 4) % 4
  if (p === 0) return ''
  if (p === 1) return face
  if (p === 2) return `${face}2`
  return `${face}'`
}

function simplifyAlgorithm(sequence) {
  const moves = (sequence || '').trim().split(/\s+/).filter(Boolean)
  const out = []
  for (const m of moves) {
    const face = m[0]
    if (out.length === 0) {
      out.push(m)
      continue
    }
    const prev = out[out.length - 1]
    if (prev[0] !== face) {
      out.push(m)
      continue
    }
    const merged = buildMove(face, movePower(prev) + movePower(m))
    out.pop()
    if (merged) out.push(merged)
  }
  return out.join(' ')
}

function lockedSlotsIntact(cube, lockedSlots) {
  if (!lockedSlots || lockedSlots.length === 0) return true
  return lockedSlots.every(s => isSlotDone(cube, s))
}

function countRotationMoves(sequence) {
  return (sequence || '').trim().split(/\s+/).filter(Boolean).filter(m => m[0] === 'y').length
}

function countBFaceMoves(sequence) {
  return (sequence || '').trim().split(/\s+/).filter(Boolean).filter(m => m[0] === 'B').length
}

function buildStandardizationScore(sequence, afterClass, options = {}) {
  const {
    classWeight = 12,
    rotationPenalty = 1.5,
    bFacePenalty = 1.2,
  } = options
  const steps = countMoves(sequence)
  const rot = countRotationMoves(sequence)
  const b = countBFaceMoves(sequence)
  return classScore(afterClass) * classWeight + steps + rot * rotationPenalty + b * bFacePenalty
}

const SLOT_MOVE_SETS = {
  FR: ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'L', "L'", 'L2', 'B', "B'", 'B2'],
  FL: ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'L', "L'", 'L2', 'B', "B'", 'B2'],
  BL: ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'L', "L'", 'L2', 'B', "B'", 'B2'],
  BR: ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'L', "L'", 'L2', 'B', "B'", 'B2']
}

function getMoveSet(slot, allowRotation = false) {
  const base = SLOT_MOVE_SETS[slot] || SLOT_MOVE_SETS.FR
  if (!allowRotation) return base
  return [...base, 'y', "y'", 'y2']
}

function findBestStandardizationPlan(cube, slot, lockedSlots = [], options = {}) {
  const {
    maxDepth = 5,
    maxNodes = 120000,
    allowRotation = true,
  } = options

  const before = analyzeSlot(cube, slot)
  if (before.stateClass === 'STANDARD' || before.stateClass === 'EXECUTABLE_STANDARD' || before.stateClass === 'DONE') {
    return {
      found: true,
      sequence: '',
      steps: 0,
      rot: 0,
      b: 0,
      afterClass: before.stateClass,
      score: buildStandardizationScore('', before.stateClass, options),
      improves: false,
    }
  }

  const moves = getMoveSet(slot, allowRotation)
  let nodes = 0
  let best = null

  function consider(nodeCube, path) {
    if (!isCrossSolved(nodeCube)) return
    if (!lockedSlotsIntact(nodeCube, lockedSlots)) return
    const a = analyzeSlot(nodeCube, slot)
    if (a.stateClass !== 'STANDARD' && a.stateClass !== 'EXECUTABLE_STANDARD' && a.stateClass !== 'DONE') return
    const sequence = path.join(' ')
    const candidate = {
      found: true,
      sequence,
      steps: path.length,
      rot: countRotationMoves(sequence),
      b: countBFaceMoves(sequence),
      afterClass: a.stateClass,
      score: buildStandardizationScore(sequence, a.stateClass, options),
      improves: classScore(a.stateClass) < classScore(before.stateClass),
    }
    if (
      !best ||
      candidate.score < best.score ||
      (candidate.score === best.score && candidate.steps < best.steps)
    ) {
      best = candidate
    }
  }

  function dfs(nodeCube, depthLeft, lastFace, path, seen) {
    nodes++
    if (nodes > maxNodes) return
    consider(nodeCube, path)
    if (depthLeft === 0) return

    const sig = `${cubeSignature(nodeCube)}|${depthLeft}`
    if (seen.has(sig)) return
    seen.add(sig)

    for (const move of moves) {
      const face = move[0]
      if (lastFace && face === lastFace) continue
      const next = new Cube(nodeCube)
      try {
        next.move(move)
      } catch {
        continue
      }
      path.push(move)
      dfs(next, depthLeft - 1, face, path, seen)
      path.pop()
    }
  }

  for (let d = 1; d <= maxDepth; d++) {
    dfs(new Cube(cube), d, '', [], new Set())
  }

  if (!best) {
    return {
      found: false,
      sequence: '',
      steps: 99,
      rot: 0,
      b: 0,
      afterClass: before.stateClass,
      score: Number.POSITIVE_INFINITY,
      improves: false,
    }
  }

  return best
}

function terminalSlotCheck(cube, slot, lockedSlots) {
  if (!isSlotDone(cube, slot) || !isCrossSolved(cube)) return false
  if (!lockedSlots || lockedSlots.length === 0) return true
  return lockedSlots.every(s => isSlotDone(cube, s))
}

/**
 * Slot-level bounded search (IDDFS).
 * Rule from cube knowledge in solver form:
 * - During F2L process, intermediate states may be non-final.
 * - A slot is accepted only when slot/Cross/locked-slots are all restored.
 */
function findSlotSolutionBySearch(cube, slot, lockedSlots = [], maxDepth = 8, maxNodes = 150000, allowRotation = false, maxMs = 8000) {
  if (terminalSlotCheck(cube, slot, lockedSlots)) {
    return ''
  }

  const moves = getMoveSet(slot, allowRotation)
  let nodes = 0
  const deadline = Date.now() + Math.max(1, maxMs)

  function dfs(nodeCube, depthLeft, lastFace, path, seen) {
    if (Date.now() > deadline) return null
    nodes++
    if (nodes > maxNodes) return null

    if (terminalSlotCheck(nodeCube, slot, lockedSlots)) {
      return path.join(' ')
    }
    if (depthLeft === 0) return null

    const sig = cubeSignature(nodeCube)
    const bestSeen = seen.get(sig)
    if (bestSeen !== undefined && bestSeen >= depthLeft) return null
    seen.set(sig, depthLeft)

    for (const move of moves) {
      const face = move[0]
      if (lastFace && face === lastFace) continue

      const nextCube = new Cube(nodeCube)
      nextCube.move(move)
      path.push(move)
      const found = dfs(nextCube, depthLeft - 1, face, path, seen)
      path.pop()
      if (found !== null) return found
    }
    return null
  }

  for (let depth = 1; depth <= maxDepth; depth++) {
    const found = dfs(new Cube(cube), depth, '', [], new Map())
    if (found !== null) return found
  }

  return null
}

function buildCandidates(cube, slot, analysis) {
  const candidates = []

  // 主驱动：按层级公式推进
  if (analysis.level === 'L3') {
    const l3 = getL3Extraction(analysis)
    if (l3) candidates.push(l3)
  } else if (analysis.level === 'L2') {
    const l2 = getL2Adjustment(analysis)
    if (l2) candidates.push(l2)
  } else if (analysis.level === 'L1') {
    const l1 = getL1Formula(analysis)
    if (l1) candidates.push(l1)
  }

  // 扰动驱动：用于把非标态推向标态
  candidates.push('U', "U'", 'U2')

  // 去重并过滤空值
  return [...new Set(candidates.map(x => (x || '').trim()).filter(Boolean))]
}

function findFullF2LSolutionBySearch(cube, maxDepth = 12, maxNodes = 4000000, maxMs = 15000) {
  const moves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'D', "D'", 'D2']
  let nodes = 0
  const deadline = Date.now() + Math.max(1, maxMs)

  function goal(c) {
    const status = checkF2LStatus(c)
    return Object.values(status).every(Boolean) && isCrossSolved(c)
  }

  function dfs(nodeCube, depthLeft, lastFace, path, seen) {
    if (Date.now() > deadline) return null
    nodes++
    if (nodes > maxNodes) return null
    if (goal(nodeCube)) return path.join(' ')
    if (depthLeft === 0) return null

    const sig = `${cubeSignature(nodeCube)}|${depthLeft}`
    if (seen.has(sig)) return null
    seen.add(sig)

    for (const move of moves) {
      const face = move[0]
      if (lastFace && face === lastFace) continue

      const next = new Cube(nodeCube)
      next.move(move)
      path.push(move)
      const found = dfs(next, depthLeft - 1, face, path, seen)
      path.pop()
      if (found !== null) return found
    }
    return null
  }

  for (let depth = 1; depth <= maxDepth; depth++) {
    const found = dfs(new Cube(cube), depth, '', [], new Set())
    if (found !== null) return found
  }
  return null
}

function getDirectInsertCandidates(slot) {
  const bySlot = {
    FR: ["R U R'", "R U' R'", "F' U' F", "F' U F"],
    FL: ["L' U' L", "L' U L", "F U F'", "F U' F'"],
    BL: ["L U L'", "L U' L'", "B' U' B", "B' U B"],
    BR: ["R' U' R", "R' U R", "B U B'", "B U' B'"],
  }
  const base = bySlot[slot] || []
  const l1 = (L1_STANDARD_FORMULAS[slot] || []).map(x => x.formula).filter(Boolean)
  return [...new Set([...base, ...l1])]
}

function findDirectInsertNoAUF(cube, slot, lockedSlots = []) {
  const inserts = getDirectInsertCandidates(slot)
  let best = ''
  let bestLen = Number.POSITIVE_INFINITY

  for (const ins of inserts) {
    const seq = (ins || '').trim()
    if (!seq) continue
    const t = new Cube(cube)
    try {
      t.move(seq)
    } catch {
      continue
    }
    if (!terminalSlotCheck(t, slot, lockedSlots)) continue
    const len = countMoves(seq)
    if (len < bestLen) {
      best = seq
      bestLen = len
    }
  }
  return best
}

function findDirectInsertBySimulation(cube, slot, lockedSlots = []) {
  const pre = ['', 'U', "U'", 'U2']
  const post = ['', 'U', "U'", 'U2']
  const inserts = getDirectInsertCandidates(slot)
  let best = ''
  let bestLen = Number.POSITIVE_INFINITY

  for (const p of pre) {
    for (const ins of inserts) {
      for (const q of post) {
        const seq = [p, ins, q].filter(Boolean).join(' ').trim()
        if (!seq) continue
        const t = new Cube(cube)
        try {
          t.move(seq)
        } catch {
          continue
        }
        if (!terminalSlotCheck(t, slot, lockedSlots)) continue
        const len = countMoves(seq)
        if (len < bestLen) {
          best = seq
          bestLen = len
        }
      }
    }
  }
  return best
}

function findBestStandardToInsertPlan(cube, slot, lockedSlots = [], options = {}) {
  const {
    maxDepth = 5,
    maxNodes = 150000,
    allowRotation = true,
    classWeight = 12,
    rotationPenalty = 1.5,
    bFacePenalty = 1.2,
  } = options

  const moves = getMoveSet(slot, allowRotation)
  let nodes = 0
  let best = null
  const before = analyzeSlot(cube, slot)

  function scoreSequence(stdSeq, insertSeq, afterClass) {
    const std = stdSeq || ''
    const ins = insertSeq || ''
    const combined = [std, ins].filter(Boolean).join(' ').trim()
    const steps = countMoves(combined)
    const rot = countRotationMoves(std)
    const b = countBFaceMoves(combined)
    return {
      score: classScore(afterClass) * classWeight + steps + rot * rotationPenalty + b * bFacePenalty,
      steps,
      rot,
      b,
    }
  }

  function consider(nodeCube, path) {
    if (!isCrossSolved(nodeCube)) return
    if (!lockedSlotsIntact(nodeCube, lockedSlots)) return
    const a = analyzeSlot(nodeCube, slot)
    if (a.stateClass !== 'STANDARD' && a.stateClass !== 'EXECUTABLE_STANDARD' && a.stateClass !== 'DONE') return

    const directInsert = findDirectInsertBySimulation(nodeCube, slot, lockedSlots)
    if (!directInsert && a.stateClass !== 'DONE') return

    const stdSeq = path.join(' ').trim()
    const insertSeq = directInsert || ''
    const test = new Cube(nodeCube)
    if (insertSeq) {
      try {
        test.move(insertSeq)
      } catch {
        return
      }
    }
    if (!terminalSlotCheck(test, slot, lockedSlots)) return

    const ss = scoreSequence(stdSeq, insertSeq, a.stateClass)
    const candidate = {
      found: true,
      stdSeq,
      insertSeq,
      totalSeq: [stdSeq, insertSeq].filter(Boolean).join(' ').trim(),
      score: ss.score,
      steps: ss.steps,
      rot: ss.rot,
      b: ss.b,
      afterClass: a.stateClass,
      improves: classScore(a.stateClass) < classScore(before.stateClass),
    }

    if (!best || candidate.score < best.score || (candidate.score === best.score && candidate.steps < best.steps)) {
      best = candidate
    }
  }

  function dfs(nodeCube, depthLeft, lastFace, path, seen) {
    nodes++
    if (nodes > maxNodes) return
    consider(nodeCube, path)
    if (depthLeft === 0) return

    const sig = `${cubeSignature(nodeCube)}|${depthLeft}`
    if (seen.has(sig)) return
    seen.add(sig)

    for (const move of moves) {
      const face = move[0]
      if (lastFace && face === lastFace) continue
      const next = new Cube(nodeCube)
      try {
        next.move(move)
      } catch {
        continue
      }
      path.push(move)
      dfs(next, depthLeft - 1, face, path, seen)
      path.pop()
    }
  }

  for (let d = 0; d <= maxDepth; d++) {
    dfs(new Cube(cube), d, '', [], new Set())
  }

  return best || {
    found: false,
    stdSeq: '',
    insertSeq: '',
    totalSeq: '',
    score: Number.POSITIVE_INFINITY,
    steps: 99,
    rot: 0,
    b: 0,
    afterClass: before.stateClass,
    improves: false,
  }
}

function solveSlotStandardFlow(cube, slot, options = {}) {
  const {
    allowRotation = true,
    standardProbeDepth = 4,
    standardProbeNodes = 80000,
    classWeight = 12,
    rotationPenalty = 1.5,
    bFacePenalty = 1.2,
    maxAttempts = 6,
    miniIterFallback = true,
    maxFlowMoves = 26,
    lockedSlots = [],
  } = options

  const snapshot = new Cube(cube)
  let full = ''
  const steps = []

  for (let i = 0; i < maxAttempts; i++) {
    if (terminalSlotCheck(cube, slot, lockedSlots)) {
      if (countMoves(full) > maxFlowMoves) break
      return {
        solution: simplifyAlgorithm(full.trim()),
        steps,
        analysis: { level: 'DONE', message: 'standardize->insert flow solved' },
        success: true,
      }
    }

    const combined = findBestStandardToInsertPlan(cube, slot, lockedSlots, {
      maxDepth: Math.max(3, standardProbeDepth),
      maxNodes: Math.max(50000, standardProbeNodes),
      allowRotation,
      classWeight,
      rotationPenalty,
      bFacePenalty,
    })
    if (combined.found && combined.totalSeq) {
      cube.move(combined.totalSeq)
      const norm = simplifyAlgorithm(combined.totalSeq)
      full += `${norm} `
      steps.push({ iteration: i, level: 'STD+INS', formula: norm, analysis: { level: 'STD+INS', message: 'best standard-to-insert plan' } })
      continue
    }

    const direct = findDirectInsertBySimulation(cube, slot, lockedSlots)
    if (direct) {
      cube.move(direct)
      const norm = simplifyAlgorithm(direct)
      full += `${norm} `
      steps.push({ iteration: i, level: 'L1', formula: norm, analysis: { level: 'L1', message: 'simulated direct insert' } })
      continue
    }

    const a = analyzeSlot(cube, slot)
    if (a.stateClass === 'STANDARD') {
      let ins = getL1Formula(a)
      if (!ins) {
        for (const u of ['U', "U'", 'U2']) {
          const t = new Cube(cube)
          t.move(u)
          const ua = analyzeSlot(t, slot)
          if (ua.stateClass !== 'STANDARD') continue
          const maybe = getL1Formula(ua)
          if (!maybe) continue
          ins = `${u} ${maybe}`.trim()
          break
        }
      }
      if (ins) {
        cube.move(ins)
        const norm = simplifyAlgorithm(ins)
        full += `${norm} `
        steps.push({ iteration: i, level: 'L1', formula: norm, analysis: { level: 'L1', message: 'standard insert' } })
        continue
      }
    }

    const plan = findBestStandardizationPlan(cube, slot, [], {
      maxDepth: standardProbeDepth,
      maxNodes: standardProbeNodes,
      allowRotation,
      classWeight,
      rotationPenalty,
      bFacePenalty,
    })
    if (plan.found && plan.sequence) {
      cube.move(plan.sequence)
      const norm = simplifyAlgorithm(plan.sequence)
      full += `${norm} `
      steps.push({ iteration: i, level: 'STD', formula: norm, analysis: { level: 'STD', message: 'standardization move' } })
      continue
    }

    const one = solveSlot(cube, slot)
      if (one.solution) {
        cube.move(one.solution)
        const norm = simplifyAlgorithm(one.solution)
        full += `${norm} `
        steps.push({ iteration: i, level: one.analysis.level || 'MIX', formula: norm, analysis: one.analysis })
        if (countMoves(full) > maxFlowMoves) break
        continue
      }

    if (miniIterFallback) {
      const mini = solveSlotIterative(cube, slot, 4, lockedSlots, {
        frblDepth: 8,
        flbrDepth: 8,
        slotNodes: 300000,
        maxSlotMoves: 18,
        allowRotation,
        standardProbeDepth: Math.max(3, standardProbeDepth - 1),
        standardProbeNodes: Math.max(30000, Math.floor(standardProbeNodes / 3)),
        classWeight,
        rotationPenalty,
        bFacePenalty,
      })
      if (mini.success && terminalSlotCheck(cube, slot, lockedSlots)) {
        const norm = simplifyAlgorithm(mini.solution || '')
        if (norm) {
          full += `${norm} `
          steps.push({ iteration: i, level: 'MIX', formula: norm, analysis: { level: 'MIX', message: 'mini iterative fallback' } })
        }
        if (countMoves(full) > maxFlowMoves) break
        continue
      }
    }

    break
  }

  if (!terminalSlotCheck(cube, slot, lockedSlots)) {
    const quick = findSlotSolutionBySearch(cube, slot, lockedSlots, 6, 500000, allowRotation, 1000)
    if (quick !== null && quick) {
      const t = new Cube(cube)
      t.move(quick)
      if (terminalSlotCheck(t, slot, lockedSlots)) {
        cube.move(quick)
        const norm = simplifyAlgorithm(quick)
        if (norm) {
          full += `${norm} `
          steps.push({ iteration: maxAttempts, level: 'SEARCH', formula: norm, analysis: { level: 'SEARCH', message: '1s quick slot fallback' } })
        }
      }
    }
  }

  if (!terminalSlotCheck(cube, slot, lockedSlots) || countMoves(full) > maxFlowMoves) {
    const rollback = invertAlgorithm(full)
    if (rollback) cube.move(rollback)
    cube.init(snapshot.toJSON())
    return {
      solution: '',
      steps: [],
      analysis: { level: 'UNKNOWN', message: 'standard flow unresolved (rolled back)' },
      success: false,
      rolledBack: true,
    }
  }

  return {
    solution: simplifyAlgorithm(full.trim()),
    steps,
    analysis: { level: 'DONE', message: 'standard flow solved' },
    success: true,
  }
}

/**
 * 求解所有 F2L 槽位
 * @param {Cube} cube - cubejs 实例
 * @returns {Object} 各槽位的求解结果
 */
function solveF2L(cube, options = {}) {
  const {
    maxRounds = 8,
    hardStandardFlow = true,
    quickDepth = 7,
    quickNodes = 100000,
    slotIter = 20,
    maxSlotMoves = 26,
    frblDepth = 10,
    flbrDepth = 10,
    slotNodes = 20000000,
    globalFallbackDepth = 14,
    globalFallbackNodes = 20000000,
    deepSlotDepth = 13,
    deepSlotNodes = 20000000,
    deepSlotPasses = 2,
    finalSlotDepth = 14,
    finalSlotNodes = 30000000,
    rotationSlots = 3,
    preferredOrder = ['FL', 'FR', 'BL', 'BR'],
    strictPreferredOrder = false,
    standardProbeDepth = 5,
    standardProbeNodes = 150000,
    classWeight = 12,
    rotationPenalty = 1.5,
    bFacePenalty = 1.2,
    enableGlobalFallback = false,
    enableDeepFallback = false,
    enableFinalSlotFallback = false,
    revisitPenaltyWeight = 4,
  } = options
  const slots = ['FR', 'FL', 'BL', 'BR']
  const results = {}
  const slotHistory = []
  const roundScores = []
  const slotSolveCount = { FR: 0, FL: 0, BL: 0, BR: 0 }
  let totalSolution = ''

  for (let round = 0; round < maxRounds; round++) {
    const status = checkF2LStatus(cube)
    if (slots.every(s => status[s])) break

    const unsolved = slots.filter(s => !status[s])
    const orderIndex = Object.fromEntries(preferredOrder.map((s, i) => [s, i]))
    const ranked = unsolved
      .map(slot => {
        const analysis = analyzeSlot(cube, slot)
        // A solved slot may be disturbed during search, but must be restored when
        // accepting the current slot.
        const locks = slots.filter(s => s !== slot && status[s])
        const plan = findBestStandardToInsertPlan(cube, slot, locks, {
          maxDepth: standardProbeDepth,
          maxNodes: standardProbeNodes,
          allowRotation: true,
          classWeight,
          rotationPenalty,
          bFacePenalty,
        })
        const len = hardStandardFlow
          ? plan.steps
          : (() => {
              const quick = findSlotSolutionBySearch(cube, slot, [], quickDepth, quickNodes, true, 1200)
              return quick === null ? Number.POSITIVE_INFINITY : (quick.trim() ? quick.trim().split(/\s+/).length : 0)
            })()
        return {
          slot,
          len,
          classScore: classScore(analysis.stateClass),
          planScore: plan.score,
          planImproves: plan.improves ? 0 : 1,
          planSteps: plan.steps,
          planRot: plan.rot,
          planFound: plan.found ? 0 : 1,
          revisitPenalty: (slotSolveCount[slot] || 0) * revisitPenaltyWeight,
          orderScore: orderIndex[slot] ?? 99,
        }
      })
      .sort((a, b) => {
        if (strictPreferredOrder) {
          if (a.orderScore !== b.orderScore) return a.orderScore - b.orderScore
          if (a.classScore !== b.classScore) return a.classScore - b.classScore
          return a.len - b.len
        }
        if (a.planFound !== b.planFound) return a.planFound - b.planFound
        if (a.revisitPenalty !== b.revisitPenalty) return a.revisitPenalty - b.revisitPenalty
        if (a.planScore !== b.planScore) return a.planScore - b.planScore
        if (a.planImproves !== b.planImproves) return a.planImproves - b.planImproves
        if (a.classScore !== b.classScore) return a.classScore - b.classScore
        if (a.planSteps !== b.planSteps) return a.planSteps - b.planSteps
        if (a.orderScore !== b.orderScore) return a.orderScore - b.orderScore
        return a.len - b.len
      })

    roundScores.push({
      round,
      ranked: ranked.map(x => ({
        slot: x.slot,
        planScore: x.planScore,
        planSteps: x.planSteps,
        planRot: x.planRot,
        classScore: x.classScore,
      }))
    })

    let progressed = false

    for (let rankIdx = 0; rankIdx < ranked.length; rankIdx++) {
      const { slot } = ranked[rankIdx]
      const before = checkF2LStatus(cube)
      if (before[slot]) continue

      const snapshot = new Cube(cube)
      const allowRotation = ((rankIdx < rotationSlots) || (ranked[rankIdx].planRot > 0)) && ranked.length > 1
      const lockedSlots = slots.filter(s => s !== slot && before[s])
      let slotResult = hardStandardFlow
        ? solveSlotStandardFlow(cube, slot, {
          allowRotation,
          standardProbeDepth,
          standardProbeNodes,
          classWeight,
          rotationPenalty,
          bFacePenalty,
          maxAttempts: Math.max(4, Math.min(8, slotIter)),
          lockedSlots,
        })
        : solveSlotIterative(cube, slot, slotIter, lockedSlots, {
            maxSlotMoves,
            frblDepth,
            flbrDepth,
            slotNodes,
            allowRotation,
            standardProbeDepth,
            standardProbeNodes,
            classWeight,
            rotationPenalty,
            bFacePenalty,
          })

      if (hardStandardFlow && !slotResult.success) {
        slotResult = solveSlotIterative(cube, slot, Math.max(8, slotIter), lockedSlots, {
          maxSlotMoves: Math.min(maxSlotMoves, 22),
          frblDepth: Math.min(frblDepth, 9),
          flbrDepth: Math.min(flbrDepth, 9),
          slotNodes: Math.min(slotNodes, 2000000),
          allowRotation,
          standardProbeDepth: Math.max(4, standardProbeDepth),
          standardProbeNodes: Math.max(80000, standardProbeNodes),
          classWeight,
          rotationPenalty,
          bFacePenalty,
        })
      }
      const after = checkF2LStatus(cube)
      const solvedThisSlot = terminalSlotCheck(cube, slot, lockedSlots)

      // Guardrail: if the attempt did not actually solve this slot,
      // treat it as exploratory and rollback, so by-slot output stays truthful.
      if (!solvedThisSlot) {
        const rollback = invertAlgorithm(slotResult.solution || '')
        if (rollback) cube.move(rollback)
        if (cube.asString() !== snapshot.asString()) {
          cube.init(snapshot.toJSON())
        }
        results[slot] = {
          solution: '',
          steps: [],
          analysis: { level: 'UNKNOWN', message: 'attempt rolled back: slot not solved' },
          success: false,
          rolledBack: true,
        }
        continue
      }

      results[slot] = slotResult
      if (slotResult.solution) {
        const normalized = simplifyAlgorithm(slotResult.solution)
        totalSolution += `${normalized} `
        slotHistory.push({
          round,
          slot,
          solution: normalized,
          steps: countMoves(normalized),
        })
      }

      if (solvedThisSlot) {
        slotSolveCount[slot] = (slotSolveCount[slot] || 0) + 1
        progressed = true
      }
    }

    if (!progressed) break
  }

  const finalStatus = checkF2LStatus(cube)
  const allDone = Object.values(finalStatus).every(Boolean)
  if (enableGlobalFallback && (!allDone || !isCrossSolved(cube))) {
    const remainingCount = Object.values(finalStatus).filter(v => !v).length
    const tunedDepth = remainingCount <= 2 ? Math.max(globalFallbackDepth, 13) : globalFallbackDepth
    const tunedNodes = remainingCount <= 2 ? Math.max(globalFallbackNodes, 30000000) : globalFallbackNodes
    const global = findFullF2LSolutionBySearch(cube, tunedDepth, tunedNodes, 15000)
    if (global !== null) {
      if (global) cube.move(global)
      totalSolution += (global ? `${global} ` : '')
    }
  }

  // Tail refinement for stubborn final slots.
  for (let pass = 0; enableDeepFallback && pass < deepSlotPasses; pass++) {
    const status = checkF2LStatus(cube)
    const remaining = slots.filter(slot => !status[slot])
    if (remaining.length === 0 && isCrossSolved(cube)) break

    let progressed = false
    for (const slot of remaining) {
      const deep = findSlotSolutionBySearch(cube, slot, [], deepSlotDepth, deepSlotNodes, false, 6000)
      if (deep !== null) {
        if (deep) cube.move(deep)
        if (deep) totalSolution += `${simplifyAlgorithm(deep)} `
        progressed = true
      }
    }
    if (!progressed) break
  }

  // Aggressive single-slot fallback: when only one slot remains, spend
  // a larger bounded search budget to recover full F2L.
  if (enableFinalSlotFallback) {
    const status = checkF2LStatus(cube)
    const remaining = slots.filter(slot => !status[slot])
    if (remaining.length === 1) {
      const slot = remaining[0]
      const finalOne = findSlotSolutionBySearch(cube, slot, [], finalSlotDepth, finalSlotNodes, false, 10000)
      if (finalOne !== null) {
        if (finalOne) cube.move(finalOne)
        if (finalOne) totalSolution += `${simplifyAlgorithm(finalOne)} `
      }
    }
  }

  return {
    slots: results,
    slotHistory,
    roundScores,
    solution: simplifyAlgorithm(totalSolution.trim()),
    allDone: Object.values(checkF2LStatus(cube)).every(Boolean) && isCrossSolved(cube),
  }
}

/**
 * 迭代式求解单个槽位
 * 持续处理直到槽位完成或达到最大迭代次数
 */
function solveSlotIterative(cube, slot, maxIter = 10, lockedSlots = [], options = {}) {
  const {
    frblDepth = 10,
    flbrDepth = 9,
    slotNodes = 2000000,
    maxSlotMoves = 26,
    allowRotation = false,
    standardProbeDepth = 5,
    standardProbeNodes = 150000,
    classWeight = 12,
    rotationPenalty = 1.5,
    bFacePenalty = 1.2,
  } = options
  const searchDepth = (slot === 'FR' || slot === 'BL') ? frblDepth : flbrDepth
  const startSnapshot = new Cube(cube)
  let fullSolution = ''
  const trace = []
  let stagnant = 0

  function tryCompactReplacement() {
    const currentLen = countMoves(fullSolution)
    if (currentLen <= maxSlotMoves) return false

    const compact = findSlotSolutionBySearch(startSnapshot, slot, lockedSlots, searchDepth, slotNodes, allowRotation)
    if (compact === null) return false
    const compactLen = countMoves(compact)
    if (compactLen <= 0 || compactLen >= currentLen) return false

    const rollback = invertAlgorithm(fullSolution)
    if (rollback) cube.move(rollback)
    if (compact) cube.move(compact)
    fullSolution = compact
    trace.push({
      iteration: maxIter,
      level: 'SEARCH',
      formula: compact,
      analysis: { level: 'DONE', message: 'replaced by compact slot solution' }
    })
    return true
  }

  for (let iter = 0; iter < maxIter; iter++) {
    if (terminalSlotCheck(cube, slot, lockedSlots)) {
      tryCompactReplacement()
      return {
        solution: fullSolution.trim(),
        steps: trace,
        analysis: { level: 'DONE', message: 'slot solved by layered iteration' },
        success: true
      }
    }

    const before = analyzeSlot(cube, slot)
    const beforeScore = classScore(before.stateClass)

    // Human-style standardization first (scored plan).
    const plan = findBestStandardizationPlan(cube, slot, lockedSlots, {
      maxDepth: standardProbeDepth,
      maxNodes: standardProbeNodes,
      allowRotation,
      classWeight,
      rotationPenalty,
      bFacePenalty,
    })
    if (plan.found && plan.sequence) {
      cube.move(plan.sequence)
      const std = simplifyAlgorithm(plan.sequence)
      fullSolution += `${std} `
      trace.push({
        iteration: iter,
        level: before.level,
        formula: std,
        analysis: { level: 'STD', message: 'scored standardization plan' }
      })
      stagnant = 0
      continue
    }

    const layered = solveSlot(cube, slot)
    if (layered.solution) {
      const test = new Cube(cube)
      test.move(layered.solution)
      const after = analyzeSlot(test, slot)
      const afterScore = classScore(after.stateClass)
      if (terminalSlotCheck(test, slot, lockedSlots) || afterScore < beforeScore) {
        cube.move(layered.solution)
        fullSolution += `${layered.solution} `
        trace.push({
          iteration: iter,
          level: before.level,
          formula: layered.solution,
          analysis: layered.analysis
        })
        stagnant = 0
        continue
      }
    }

    // If layered formula cannot be produced, try a short bounded search
    // to convert non-standard state into standard flow.
    const shortSearch = findSlotSolutionBySearch(
      cube,
      slot,
      lockedSlots,
      Math.min(searchDepth, 8),
      Math.max(50000, Math.floor(slotNodes / 5)),
      allowRotation
    )
    if (shortSearch !== null) {
      if (shortSearch) cube.move(shortSearch)
      if (shortSearch) fullSolution += `${shortSearch} `
      trace.push({
        iteration: iter,
        level: before.level,
        formula: shortSearch,
        analysis: { level: 'SEARCH', message: 'short bounded-search bridge' }
      })
      stagnant = 0
      continue
    }

    // Last local nudge: rotate U to seek an adjacent standard state.
    let bestMove = ''
    let bestScore = levelScore(before.level)
    for (const mv of ['U', "U'", 'U2']) {
      const t = new Cube(cube)
      t.move(mv)
      const a = analyzeSlot(t, slot)
      const score = levelScore(a.level)
      if (score < bestScore) {
        bestScore = score
        bestMove = mv
      }
    }
    if (bestMove) {
      cube.move(bestMove)
      fullSolution += `${bestMove} `
      trace.push({
        iteration: iter,
        level: before.level,
        formula: bestMove,
        analysis: { level: 'ADJUST', message: 'U adjustment toward standard state' }
      })
      stagnant++
      if (stagnant >= 3) break
      continue
    }

    break
  }

  const searched = findSlotSolutionBySearch(cube, slot, lockedSlots, searchDepth, slotNodes, allowRotation)
  if (searched !== null) {
    if (searched) cube.move(searched)
    if (searched) fullSolution += `${searched} `
    trace.push({
      iteration: maxIter,
      level: 'SEARCH',
      formula: searched,
      analysis: { level: 'DONE', message: 'slot solved by deep bounded search' }
    })
    return {
      solution: fullSolution.trim(),
      steps: trace,
      analysis: { level: 'DONE', message: 'slot solved by mixed layered+search' },
      success: true
    }
  }

  const rollback = invertAlgorithm(fullSolution)
  if (rollback) {
    cube.move(rollback)
  }

  return {
    solution: '',
    steps: [],
    analysis: { level: 'UNKNOWN', message: 'slot unresolved after layered+search (rolled back)' },
    success: false,
    stuck: true
  }
}

/**
 * 调试函数 - 打印所有块的位置
 */
function debugPositions(cube) {
  const state = cube.toJSON()

  console.log('=== 块位置状态 ===')

  console.log('\n角块位置 (cp):')
  for (let i = 0; i < 8; i++) {
    const piece = state.cp[i]
    const ori = state.co[i]
    console.log(`  位置${i}(${getCornerName(i)}): 块${piece}(${getCornerName(piece)}) 方向${ori}`)
  }

  console.log('\n棱块位置 (ep):')
  for (let i = 0; i < 12; i++) {
    const piece = state.ep[i]
    const ori = state.eo[i]
    console.log(`  位置${i}(${getEdgeName(i)}): 块${piece}(${getEdgeName(piece)}) 方向${ori}`)
  }
}

/**
 * 检查 F2L 完成情况
 */
function checkF2LStatus(cube) {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const status = {}

  for (const slot of slots) {
    status[slot] = isSlotDone(cube, slot)
  }

  return status
}

module.exports = {
  solveSlot,
  solveSlotIterative,
  solveF2L,
  isCrossSolved,
  analyzeSlot,
  isSlotDone,
  getCornerLocation,
  getEdgeLocation,
  debugPositions,
  checkF2LStatus,
  SLOTS,
  CORNERS,
  EDGES,
  CORNER_COLORS,
  EDGE_COLORS
}

