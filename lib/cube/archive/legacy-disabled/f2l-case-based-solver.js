/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L 求解器 - 基于完整案例库 (41种情况)
 *
 * 使用 cubejs 内部状态 (cp/ep/co/eo) 匹配 F2L 案例
 */

const Cube = require('cubejs')

// ===== 块编号常量 =====

const CORNERS = {
  URF: 0, UFL: 1, ULB: 2, UBR: 3,
  DFR: 4, DLF: 5, DBL: 6, DRB: 7
}

const EDGES = {
  UR: 0, UF: 1, UL: 2, UB: 3,
  DR: 4, DF: 5, DL: 6, DB: 7,
  FR: 8, FL: 9, BL: 10, BR: 11
}

// 槽位定义
const SLOTS = {
  FR: { corner: CORNERS.DFR, edge: EDGES.FR, cornerPiece: CORNERS.DFR, edgePiece: EDGES.FR },
  FL: { corner: CORNERS.DLF, edge: EDGES.FL, cornerPiece: CORNERS.DLF, edgePiece: EDGES.FL },
  BL: { corner: CORNERS.DBL, edge: EDGES.BL, cornerPiece: CORNERS.DBL, edgePiece: EDGES.BL },
  BR: { corner: CORNERS.DRB, edge: EDGES.BR, cornerPiece: CORNERS.DRB, edgePiece: EDGES.BR }
}

// U层位置
const U_CORNERS = [CORNERS.URF, CORNERS.UFL, CORNERS.ULB, CORNERS.UBR]
const U_EDGES = [EDGES.UR, EDGES.UF, EDGES.UL, EDGES.UB]

// ===== F2L 案例库 =====

/**
 * 简化的 F2L 案例 - 基于 41 种标准情况
 * 每个案例包含状态检测条件和公式
 */
const F2L_CASES = [
  // ===== Case 1: 已配对在U层 =====
  {
    id: 1,
    name: '配对在U层',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inU && edgeInfo.inU &&
             isAdjacent(cornerInfo.position, edgeInfo.position) &&
             cornerInfo.orientation === 0 && edgeInfo.orientation === 0
    },
    formulas: {
      FR: "U R U' R'",
      FL: "U' L' U L",
      BL: "U L U' L'",
      BR: "U' R U R'"
    }
  },

  // ===== Case 2: U层分离，朝向正确 =====
  {
    id: 2,
    name: 'U层分离朝向正确',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inU && edgeInfo.inU &&
             cornerInfo.orientation === 0 && edgeInfo.orientation === 0 &&
             !isAdjacent(cornerInfo.position, edgeInfo.position)
    },
    formulas: {
      FR: "U' R U R' U R U' R'",
      FL: "U L' U' L U' L' U L",
      BL: "U' L U L' U L U' L'",
      BR: "U R' U' R U R' U' R"
    }
  },

  // ===== Case 3: 角块U层，棱块中层 =====
  {
    id: 3,
    name: '角块U层棱块中层',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inU && !edgeInfo.inU && !edgeInfo.inSlot &&
             cornerInfo.orientation === 0
    },
    formulas: {
      FR: "R' U' R U R U R'",
      FL: "L U L' U' L' U' L",
      BL: "L' U' L U' L' U L",
      BR: "R U R' U R U' R'"
    }
  },

  // ===== Case 4: 接近配对 =====
  {
    id: 4,
    name: '接近配对',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inU && edgeInfo.inU &&
             isAlmostPaired(cornerInfo, edgeInfo)
    },
    formulas: {
      FR: "R U R'",
      FL: "L' U' L",
      BL: "L' U L",
      BR: "R U' R'"
    }
  },

  // ===== Case 5: 角块扭曲 =====
  {
    id: 5,
    name: '角块扭曲',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inU && edgeInfo.inU &&
             cornerInfo.orientation !== 0
    },
    formulas: {
      FR: "U R U' R' U2 R U' R'",
      FL: "U' L' U L U2 L' U L",
      BL: "U L' U L' U' L U L'",
      BR: "U' R U' R' U2 R' U R"
    }
  },

  // ===== Case 6: 连接但错误 =====
  {
    id: 6,
    name: '连接但错误',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inU && edgeInfo.inU &&
             isAdjacent(cornerInfo.position, edgeInfo.position) &&
             (cornerInfo.orientation !== 0 || edgeInfo.orientation !== 0)
    },
    formulas: {
      FR: "U R U' R'",
      FL: "U' L' U L",
      BL: "U L U' L'",
      BR: "U' R U R'"
    }
  },

  // ===== Case 25: 角块在槽位 =====
  {
    id: 25,
    name: '角块在槽位',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inSlot && !edgeInfo.inSlot && edgeInfo.inU
    },
    formulas: {
      FR: "R U' R'",
      FL: "L' U L",
      BL: "L U' L'",
      BR: "R' U R"
    }
  },

  // ===== Case 26: 角块在槽位扭曲 =====
  {
    id: 26,
    name: '角块在槽位扭曲',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inSlot && cornerInfo.orientation !== 0 &&
             !edgeInfo.inSlot && edgeInfo.inU
    },
    formulas: {
      FR: "R U2 R' U' R U R'",
      FL: "L' U2 L U L' U' L",
      BL: "L U2 L' U L U' L'",
      BR: "R' U2 R U' R' U R"
    }
  },

  // ===== Case 31: 棱块在槽位 =====
  {
    id: 31,
    name: '棱块在槽位',
    match: (cornerInfo, edgeInfo) => {
      return !cornerInfo.inSlot && cornerInfo.inU &&
             edgeInfo.inSlot && edgeInfo.orientation === 0
    },
    formulas: {
      FR: "F' U' F",
      FL: "F U F'",
      BL: "B' U' B",
      BR: "B U B'"
    }
  },

  // ===== Case 32: 棱块在槽位翻转 =====
  {
    id: 32,
    name: '棱块在槽位翻转',
    match: (cornerInfo, edgeInfo) => {
      return !cornerInfo.inSlot && cornerInfo.inU &&
             edgeInfo.inSlot && edgeInfo.orientation !== 0
    },
    formulas: {
      FR: "F' U' F U R U' R'",
      FL: "F U F' U' L' U L",
      BL: "B' U' B U L U' L'",
      BR: "B U B' U' R' U R"
    }
  },

  // ===== Case 37: 两块都在槽位 =====
  {
    id: 37,
    name: '两块都在槽位',
    match: (cornerInfo, edgeInfo) => {
      return cornerInfo.inSlot && edgeInfo.inSlot
    },
    formulas: {
      FR: "R U R' U' R U R'",
      FL: "L' U' L U L' U' L",
      BL: "L U L' U' L U L'",
      BR: "R' U R U R' U R"
    }
  }
]

// ===== 辅助函数 =====

function getCornerInfo(state, cornerPiece, slot) {
  // 查找角块位置
  for (let i = 0; i < 8; i++) {
    if (state.cp[i] === cornerPiece) {
      return {
        position: i,
        orientation: state.co[i],
        inU: i < 4,
        inSlot: i === slot.corner
      }
    }
  }
  return null
}

function getEdgeInfo(state, edgePiece, slot) {
  // 查找棱块位置
  for (let i = 0; i < 12; i++) {
    if (state.ep[i] === edgePiece) {
      return {
        position: i,
        orientation: state.eo[i],
        inU: i < 4,
        inSlot: i === slot.edge
      }
    }
  }
  return null
}

function isAdjacent(cornerPos, edgePos) {
  // U层角块和棱块的相邻关系
  const adjacent = {
    0: [0, 1],   // URF 相邻 UR, UF
    1: [1, 2],   // UFL 相邻 UF, UL
    2: [2, 3],   // ULB 相邻 UL, UB
    3: [3, 0]    // UBR 相邻 UB, UR
  }
  return adjacent[cornerPos]?.includes(edgePos) || false
}

function isAlmostPaired(cornerInfo, edgeInfo) {
  // 检查是否接近配对状态
  return cornerInfo.orientation === 0 && edgeInfo.orientation === 0 &&
         Math.abs(cornerInfo.position - edgeInfo.position) <= 2
}

// ===== 求解函数 =====

/**
 * 检查槽位是否完成
 */
function isSlotDone(state, slot) {
  const slotInfo = SLOTS[slot]
  return state.cp[slotInfo.corner] === slotInfo.cornerPiece &&
         state.co[slotInfo.corner] === 0 &&
         state.ep[slotInfo.edge] === slotInfo.edgePiece &&
         state.eo[slotInfo.edge] === 0
}

/**
 * 匹配 F2L 案例
 */
function matchF2LCase(cornerInfo, edgeInfo) {
  for (const case_ of F2L_CASES) {
    if (case_.match(cornerInfo, edgeInfo)) {
      return case_
    }
  }
  return null
}

/**
 * 求解单个槽位
 */
function solveSlot(cube, slot, maxIter = 10) {
  const state = cube.toJSON()
  const slotInfo = SLOTS[slot]

  if (isSlotDone(state, slot)) {
    return { done: true, solution: '', message: '槽位已完成' }
  }

  const cornerInfo = getCornerInfo(state, slotInfo.cornerPiece, slotInfo)
  const edgeInfo = getEdgeInfo(state, slotInfo.edgePiece, slotInfo)

  if (!cornerInfo || !edgeInfo) {
    return { done: false, solution: '', message: '无法定位块' }
  }

  // 尝试匹配案例
  const f2lCase = matchF2LCase(cornerInfo, edgeInfo)

  if (f2lCase) {
    const formula = f2lCase.formulas[slot]
    return {
      done: false,
      solution: formula || '',
      case: f2lCase.id,
      caseName: f2lCase.name,
      corner: cornerInfo,
      edge: edgeInfo
    }
  }

  // 如果没有匹配的案例，使用默认提取
  let formula = ''

  // L3: 两块都不在U层
  if (!cornerInfo.inU && !edgeInfo.inU) {
    formula = getExtractionFormula(slot, cornerInfo, edgeInfo)
  }
  // L2: 一个在U层，一个不在
  else if (!cornerInfo.inU || !edgeInfo.inU) {
    formula = getBringToUFormula(slot, cornerInfo, edgeInfo)
  }
  // L1: 都在U层但未匹配
  else {
    formula = getDefaultPairingFormula(slot, cornerInfo, edgeInfo)
  }

  return {
    done: false,
    solution: formula,
    corner: cornerInfo,
    edge: edgeInfo
  }
}

/**
 * L3 提取公式
 */
function getExtractionFormula(slot, cornerInfo, edgeInfo) {
  const slotInfo = SLOTS[slot]

  // 角块在本槽位
  if (cornerInfo.position === slotInfo.corner) {
    switch (slot) {
      case 'FR': return 'R U R\''
      case 'FL': return 'L\' U\' L'
      case 'BL': return 'L U L\''
      case 'BR': return 'R\' U R'
    }
  }

  // 棱块在本槽位
  if (edgeInfo.position === slotInfo.edge) {
    switch (slot) {
      case 'FR': return 'F\' U\' F'
      case 'FL': return 'F U F\''
      case 'BL': return 'B\' U\' B'
      case 'BR': return 'B U B\''
    }
  }

  // 两块都不在本槽位 - 提取角块
  const cornerSlot = getSlotByCornerPosition(cornerInfo.position)
  if (cornerSlot) {
    return getExtractionFormula(cornerSlot, cornerInfo, { inU: true, position: -1 })
  }

  return ''
}

/**
 * 提取到U层公式
 */
function getBringToUFormula(slot, cornerInfo, edgeInfo) {
  const slotInfo = SLOTS[slot]

  // 角块在槽位
  if (!cornerInfo.inU && cornerInfo.position === slotInfo.corner) {
    switch (slot) {
      case 'FR': return 'R U\' R\''
      case 'FL': return 'L\' U L'
      case 'BL': return 'L U\' L\''
      case 'BR': return 'R\' U\' R'
    }
  }

  // 棱块在槽位
  if (!edgeInfo.inU && edgeInfo.position === slotInfo.edge) {
    switch (slot) {
      case 'FR': return 'F\' U\' F'
      case 'FL': return 'F U F\''
      case 'BL': return 'B\' U\' B'
      case 'BR': return 'B U B\''
    }
  }

  return ''
}

/**
 * 默认配对公式
 */
function getDefaultPairingFormula(slot, cornerInfo, edgeInfo) {
  // 基于位置的默认公式
  switch (slot) {
    case 'FR': return 'R U R\''
    case 'FL': return 'L\' U\' L'
    case 'BL': return 'L U L\''
    case 'BR': return 'R\' U R'
  }
}

/**
 * 根据角块位置获取槽位
 */
function getSlotByCornerPosition(cornerPos) {
  const mapping = {
    [CORNERS.DFR]: 'FR',
    [CORNERS.DLF]: 'FL',
    [CORNERS.DBL]: 'BL',
    [CORNERS.DRB]: 'BR'
  }
  return mapping[cornerPos] || null
}

/**
 * 迭代式求解单个槽位
 */
function solveSlotIterative(cube, slot, maxIter = 20) {
  const steps = []
  let solution = ''
  let iter = 0

  while (iter < maxIter) {
    const state = cube.toJSON()
    if (isSlotDone(state, slot)) {
      return { done: true, solution, steps, iterations: iter }
    }

    const result = solveSlot(cube, slot)

    if (!result.solution) {
      return { done: false, solution, steps, iterations: iter, stuck: true }
    }

    steps.push({
      iteration: iter,
      formula: result.solution,
      case: result.case || 'N/A',
      caseName: result.caseName || 'N/A'
    })

    solution += result.solution + ' '
    cube.move(result.solution)
    iter++
  }

  return { done: false, solution, steps, iterations: iter, stuck: true }
}

/**
 * 求解所有 F2L 槽位
 */
function solveF2L(cube) {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const results = {}
  let totalSolution = ''

  for (const slot of slots) {
    const result = solveSlotIterative(cube, slot, 15)
    results[slot] = result

    if (result.solution) {
      totalSolution += result.solution
    }
  }

  return {
    slots: results,
    solution: totalSolution.trim()
  }
}

/**
 * 检查 F2L 完成状态
 */
function checkF2LStatus(cube) {
  const state = cube.toJSON()
  const status = {}

  for (const [slot, slotInfo] of Object.entries(SLOTS)) {
    status[slot] = isSlotDone(state, slot)
  }

  return status
}

module.exports = {
  solveSlot,
  solveSlotIterative,
  solveF2L,
  checkF2LStatus,
  isSlotDone,
  SLOTS,
  CORNERS,
  EDGES,
  F2L_CASES
}

