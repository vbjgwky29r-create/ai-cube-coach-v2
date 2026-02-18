/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * F2L 分层求解器 v2 - 修复和完善版
 *
 * 分层结构：
 * L3（非U层）→ 提取到U层 → L2
 * L2（U层非标态）→ U调整 → L1
 *   - 简单L2: 1次U调整可达L1
 *   - 复杂L2: 需要配对或更多步骤
 * L1（标态）→ 标准公式 → 完成
 *
 * 修复：
 * 1. 使用严格验证（checkSlotCompleteStrict）
 * 2. 细化L2为简单L2/复杂L2
 * 3. 优化提取公式库
 * 4. ��加配对公式库
 */

import Cube from 'cubejs'
import { SLOTS, COLORS, CUBEJS_INDICES, CROSS_EDGES, checkCrossComplete } from '../ube/constants'

// ============================================================
// 类型定义
// ============================================================

export type Slot = 'FR' | 'FL' | 'BL' | 'BR'
export type Level = 'L1' | 'L2_SIMPLE' | 'L2_COMPLEX' | 'L3' | 'DONE'

export interface LevelResult {
  level: Level
  cornerPos: string
  edgePos: string
  cornerInU: boolean
  edgeInU: boolean
  isStandard: boolean
  uAdjustmentNeeded: number  // 0=不需要, 1=U, 2=U2, 3=U'
  cornerOriented: boolean    // D面是否朝下
  edgeOriented: boolean     // 棱块是否正确朝向
  canPair: boolean         // 是否可以配对（用于L2_COMPLEX判断）
}

export interface F2LResult {
  solution: string
  steps: number
  success: boolean
  details: string[]
  slots: Array<{
    slot: Slot
    initialLevel: Level
    finalLevel: Level
    formula: string | null
    success: boolean
  }>
}

// ============================================================
// 标态定义（每个槽位的L1标准位置）
// ============================================================

const STANDARD_STATE: Record<Slot, { corner: string; edges: string[] }> = {
  FR: { corner: 'URF', edges: ['UF', 'UR'] },
  FL: { corner: 'UFL', edges: ['UF', 'UL'] },
  BL: { corner: 'ULB', edges: ['UL', 'UB'] },
  BR: { corner: 'UBR', edges: ['UB', 'UR'] },
}

// U层位置顺序（用于计算U调整）
const U_CORNERS = ['URF', 'UFL', 'ULB', 'UBR'] as const
const U_EDGES = ['UF', 'UL', 'UB', 'UR'] as const

// ============================================================
// 严格验证函数
// ============================================================

/**
 * 严格检查槽位是否完成
 * 检查每个贴纸的实际颜色
 */
function checkSlotCompleteStrict(state: string, slot: Slot): boolean {
  const slotData = SLOTS[slot]

  // 检查角块：每个贴纸必须显示正确的颜色
  const cornerCorrect =
    state[slotData.cornerIndices[0]] === slotData.cornerColors[0] &&
    state[slotData.cornerIndices[1]] === slotData.cornerColors[1] &&
    state[slotData.cornerIndices[2]] === slotData.cornerColors[2]

  // 检查棱块：每个贴纸必须显示正确的颜色
  const edgeCorrect =
    state[slotData.edgeIndices[0]] === slotData.edgeColors[0] &&
    state[slotData.edgeIndices[1]] === slotData.edgeColors[1]

  return cornerCorrect && edgeCorrect
}

function checkCrossIntact(state: string): boolean {
  return state[28] === 'D' && state[30] === 'D' &&
         state[34] === 'D' && state[32] === 'D'
}

// ============================================================
// 块位置查找
// ============================================================

function findPiece(state: string, colors: readonly string[], type: 'corner' | 'edge'): string {
  const sortedColors = [...colors].sort().join('')

  if (type === 'corner') {
    const positions: Record<string, number[]> = {
      'URF': [8, 20, 9], 'UFL': [6, 18, 38], 'ULB': [0, 36, 47], 'UBR': [2, 45, 11],
      'DFR': [29, 26, 15], 'DFL': [27, 44, 24], 'DBL': [33, 42, 53], 'DBR': [35, 51, 17],
    }
    for (const [name, idx] of Object.entries(positions)) {
      const actual = state[idx[0]] + state[idx[1]] + state[idx[2]]
      if (actual.split('').sort().join('') === sortedColors) return name
    }
  } else {
    const positions: Record<string, number[]> = {
      'UF': [7, 19], 'UR': [5, 10], 'UB': [1, 46], 'UL': [3, 37],
      'FR': [23, 12], 'FL': [21, 41], 'BL': [39, 47], 'BR': [48, 14],
    }
    for (const [name, idx] of Object.entries(positions)) {
      const c1 = state[idx[0]]
      const c2 = state[idx[1]]
      if ((c1 === colors[0] && c2 === colors[1]) || (c1 === colors[1] && c2 === colors[0])) {
        return name
      }
    }
  }

  return 'unknown'
}

// ============================================================
// 级别判断（核心）
// ============================================================

/**
 * 判断槽位当前处于哪个级别
 */
function getLevel(state: string, slot: Slot): LevelResult {
  const slotData = SLOTS[slot]
  const standard = STANDARD_STATE[slot]

  // 检查是否已完成
  if (checkSlotCompleteStrict(state, slot)) {
    return {
      level: 'DONE',
      cornerPos: 'SOLVED',
      edgePos: 'SOLVED',
      cornerInU: false,
      edgeInU: false,
      isStandard: true,
      uAdjustmentNeeded: 0,
      cornerOriented: true,
      edgeOriented: true,
      canPair: false,
    }
  }

  // 查找块位置
  const cornerPos = findPiece(state, slotData.cornerColors, 'corner')
  const edgePos = findPiece(state, slotData.edgeColors, 'edge')

  // 判断是否在U层
  const cornerInU = U_CORNERS.includes(cornerPos as any)
  const edgeInU = U_EDGES.includes(edgePos as any)

  // 判断角块朝向（D面是否朝下）
  // 对于U层角块，检查哪个面是D色
  let cornerOriented = false
  if (cornerPos === 'DFR' || cornerPos === 'DFL' || cornerPos === 'DBL' || cornerPos === 'DBR') {
    // D层角块：检查第一个位置是否是D
    const dCornerMap: Record<string, number> = { 'DFR': 29, 'DFL': 27, 'DBL': 33, 'DBR': 35 }
    cornerOriented = state[dCornerMap[cornerPos]] === COLORS.D
  } else if (cornerInU) {
    // U层角块：检查是否有D色朝上
    const uCornerMap: Record<string, number[]> = {
      'URF': [8, 20, 9], 'UFL': [6, 18, 38], 'ULB': [0, 36, 47], 'UBR': [2, 45, 11]
    }
    const idx = uCornerMap[cornerPos as keyof typeof uCornerMap]
    cornerOriented = state[idx[0]] === COLORS.D || state[idx[1]] === COLORS.D || state[idx[2]] === COLORS.D
  }

  // 判断棱块朝向
  let edgeOriented = false
  if (edgeInU) {
    // U层棱块：检查是否有F/B/L/R色朝上（正确朝向）
    const uEdgeMap: Record<string, number[]> = {
      'UF': [7, 19], 'UR': [5, 10], 'UB': [1, 46], 'UL': [3, 37]
    }
    const idx = uEdgeMap[edgePos as keyof typeof uEdgeMap]
    const topColor = state[idx[0]] // U面的颜色
    // 如果U面颜色是U色，则棱块朝向正确
    edgeOriented = topColor === COLORS.U
  }

  // 计算需要的U调整次数
  let uAdjustmentNeeded = 0
  if (cornerInU && edgeInU) {
    const currentIndex = U_CORNERS.indexOf(cornerPos as any)
    const targetIndex = U_CORNERS.indexOf(standard.corner as any)
    if (currentIndex >= 0 && targetIndex >= 0) {
      uAdjustmentNeeded = (targetIndex - currentIndex + 4) % 4
    }
  }

  // 判断是否标态
  const cornerAtStandard = cornerPos === standard.corner
  const edgeAtStandard = cornerAtStandard && standard.edges.includes(edgePos as any)
  const isStandard = cornerInU && edgeInU && cornerAtStandard && edgeAtStandard

  // 判断是否可以配对（用于L2_COMPLEX判断）
  // 条件：角块和棱块都在U层，且相邻
  let canPair = false
  if (cornerInU && edgeInU && !isStandard) {
    // 检查是否相邻
    const cornerIdx = U_CORNERS.indexOf(cornerPos as any)
    const edgeIdx = U_EDGES.indexOf(edgePos as any)

    // 相邻关系定义
    const adjacent: Record<number, number[]> = {
      0: [0, 1], // URF相邻 UF, UR
      1: [0, 2], // UFL相邻 UF, UL
      2: [2, 3], // ULB相邻 UL, UB
      3: [1, 3], // UBR相邻 UB, UR
    }

    canPair = adjacent[cornerIdx]?.includes(edgeIdx) ?? false
  }

  // 判断级别
  let level: Level
  if (isStandard) {
    level = 'L1'
  } else if (cornerInU && edgeInU) {
    // 判断简单L2还是复杂L2
    if (uAdjustmentNeeded === 1 && cornerOriented && edgeOriented) {
      level = 'L2_SIMPLE' // 只需1次U调整，且朝向正确
    } else {
      level = 'L2_COMPLEX' // 需要配对或其他处理
    }
  } else {
    level = 'L3'
  }

  return {
    level,
    cornerPos,
    edgePos,
    cornerInU,
    edgeInU,
    isStandard,
    uAdjustmentNeeded,
    cornerOriented,
    edgeOriented,
    canPair,
  }
}

// ============================================================
// 提取公式库（L3 → L2）
// ============================================================

const EXTRACT_FORMULAS = {
  // D层角块提取（按槽位）
  cornerInD: {
    FR_from_DFR: ['R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R'],
    FL_from_DFL: ['L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\''],
    BL_from_DBL: ['L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L'],
    BR_from_DBR: ['R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\''],
  },
  // 中层棱块提取
  edgeInMiddle: {
    FR: ['R U\' R\'', 'F\' U F'],
    FL: ['L\' U\' L', 'F U\' F\''],
    BL: ['L U L\'', 'B\' U B'],
    BR: ['R\' U R', 'B U\' B\''],
  },
  // 通用提取
  general: [
    'R U R\'', 'R\' U\' R', 'L U L\'', 'L\' U\' L',
    'R U2 R\'', 'R\' U2 R', 'L U2 L\'', 'L\' U2 L',
  ],
}

/**
 * 获取L3→L2的提取公式
 */
function getExtractFormulas(state: string, slot: Slot): string[] {
  const levelInfo = getLevel(state, slot)
  const formulas: string[] = []

  // 角块在D层
  if (!levelInfo.cornerInU) {
    const cornerPos = levelInfo.cornerPos

    // 角块在目标槽位
    if (cornerPos === 'DFR' && slot === 'FR') {
      formulas.push(...EXTRACT_FORMULAS.cornerInD.FR_from_DFR)
    } else if (cornerPos === 'DFL' && slot === 'FL') {
      formulas.push(...EXTRACT_FORMULAS.cornerInD.FL_from_DFL)
    } else if (cornerPos === 'DBL' && slot === 'BL') {
      formulas.push(...EXTRACT_FORMULAS.cornerInD.BL_from_DBL)
    } else if (cornerPos === 'DBR' && slot === 'BR') {
      formulas.push(...EXTRACT_FORMULAS.cornerInD.BR_from_DBR)
    } else {
      formulas.push(...EXTRACT_FORMULAS.general)
    }
  }

  // 棱块不在U层
  if (!levelInfo.edgeInU) {
    const edgePos = levelInfo.edgePos

    if (edgePos === 'FR') {
      formulas.push(...EXTRACT_FORMULAS.edgeInMiddle.FR)
    } else if (edgePos === 'FL') {
      formulas.push(...EXTRACT_FORMULAS.edgeInMiddle.FL)
    } else if (edgePos === 'BL') {
      formulas.push(...EXTRACT_FORMULAS.edgeInMiddle.BL)
    } else if (edgePos === 'BR') {
      formulas.push(...EXTRACT_FORMULAS.edgeInMiddle.BR)
    }
  }

  return [...new Set(formulas)]
}

// ============================================================
// U调整公式（L2 → L1）
// ============================================================

const U_ADJUSTMENTS = ['U', 'U\'', 'U2'] as const

// ============================================================
// 标准公式库（L1使用）
// ============================================================

const STANDARD_FORMULAS: Record<Slot, string[]> = {
  FR: [
    'R U R\'',          // 直接插入
    'U R U\' R\'',      // U调整 + 插入
    'R U\' R\' U R U\' R\'',  // 配对插入
  ],
  FL: [
    'L\' U\' L',        // 直接插入
    'U\' L\' U L',      // U调整 + 插入
    'L\' U L U\' L\' U L',    // 配对插入
  ],
  BL: [
    'L U L\'',          // 直接插入
    'U L U\' L\'',      // U调整 + 插入
    'L U\' L\' U L U\' L\'',  // 配对插入
  ],
  BR: [
    'R\' U\' R',        // 直接插入
    'U R\' U\' R',      // U调整 + 插入
    'R\' U R U\' R\' U R',    // 配对插入
  ],
}

// ============================================================
// 配对公式库（L2_COMPLEX使用）
// ============================================================

/**
 * 配对公式：当角块和棱块在U层相邻但未配对时使用
 * 这些公式先配对，然后可以使用标准插入公式
 */
const PAIR_FORMULAS: Record<Slot, { [key: string]: string }> = {
  FR: {
    // 角块URF + 棱块UF → 配对
    'URF_UF': 'R U R\'',
    // 角块URF + 棱块UR → 配对
    'URF_UR': 'R U\' R\' U R U\' R\'',
    // 通用配对
    'general': 'U R U\' R\'',
  },
  FL: {
    'UFL_UF': 'L\' U\' L',
    'UFL_UL': 'L\' U L U\' L\' U L',
    'general': 'U\' L\' U L',
  },
  BL: {
    'ULB_UL': 'L U L\'',
    'ULB_UB': 'L U\' L\' U L U\' L\'',
    'general': 'U L U\' L\'',
  },
  BR: {
    'UBR_UB': 'R\' U\' R',
    'UBR_UR': 'R\' U R U\' R\' U R',
    'general': 'U R\' U\' R',
  },
}

// ============================================================
// 验证函数
// ============================================================

function tryFormula(cube: Cube, slot: Slot, formula: string): boolean {
  try {
    const test = new Cube(cube)
    test.move(formula)
    const state = test.asString()
    return checkSlotCompleteStrict(state, slot) && checkCrossIntact(state)
  } catch {
    return false
  }
}

// ============================================================
// 分层求解函数
// ============================================================

/**
 * 求解L1级别（标态）
 */
function solveL1(cube: Cube, slot: Slot): string | null {
  const formulas = STANDARD_FORMULAS[slot]

  for (const formula of formulas) {
    if (tryFormula(cube, slot, formula)) {
      return formula
    }
  }

  return null
}

/**
 * 求解简单L2级别（只需U调整）
 */
function solveL2Simple(cube: Cube, slot: Slot): string | null {
  const levelInfo = getLevel(cube.asString(), slot)
  const uNeeded = levelInfo.uAdjustmentNeeded

  if (uNeeded === 0) {
    // 不需要U调整，尝试L1公式
    return solveL1(cube, slot)
  }

  // 计算U调整
  const uAdj = uNeeded === 1 ? 'U' : uNeeded === 2 ? 'U2' : "U'"

  // 尝试 U调整 + L1公式
  for (const formula of STANDARD_FORMULAS[slot]) {
    const full = uAdj + ' ' + formula
    if (tryFormula(cube, slot, full)) {
      return full
    }
  }

  // 尝试多个U调整的组合
  for (const u1 of U_ADJUSTMENTS) {
    for (const u2 of U_ADJUSTMENTS.slice(0, 2)) {
      for (const formula of STANDARD_FORMULAS[slot]) {
        const full = u1 + ' ' + u2 + ' ' + formula
        if (tryFormula(cube, slot, full)) {
          return full
        }
      }
    }
  }

  return null
}

/**
 * 求解复杂L2级别（需要配对）
 */
function solveL2Complex(cube: Cube, slot: Slot): string | null {
  const levelInfo = getLevel(cube.asString(), slot)

  // 如果可以配对，先尝试配对公式
  if (levelInfo.canPair) {
    const pairFormulas = PAIR_FORMULAS[slot]

    // 尝试特定配对公式
    const pairKey = `${levelInfo.cornerPos}_${levelInfo.edgePos}`
    if (pairFormulas[pairKey as keyof typeof pairFormulas]) {
      const formula = pairFormulas[pairKey as keyof typeof pairFormulas]
      if (tryFormula(cube, slot, formula)) {
        return formula
      }
    }

    // 尝试通用配对公式
    if (pairFormulas.general && tryFormula(cube, slot, pairFormulas.general)) {
      return pairFormulas.general
    }
  }

  // 尝试所有U调整 + 配对公式
  for (const uAdj of U_ADJUSTMENTS) {
    for (const formula of STANDARD_FORMULAS[slot]) {
      // 先尝试 U + 标准公式
      const full1 = uAdj + ' ' + formula
      if (tryFormula(cube, slot, full1)) {
        return full1
      }
    }

    // 尝试配对后再插入
    const pairFormulas = PAIR_FORMULAS[slot]
    if (levelInfo.canPair && pairFormulas.general) {
      const full2 = uAdj + ' ' + pairFormulas.general
      if (tryFormula(cube, slot, full2)) {
        return full2
      }
    }
  }

  // 兜底：尝试简单L2的策略
  return solveL2Simple(cube, slot)
}

/**
 * 求解L3级别（非U层）
 */
function solveL3(cube: Cube, slot: Slot): string | null {
  const extracts = getExtractFormulas(cube.asString(), slot)

  // 尝试每个提取公式
  for (const extract of extracts) {
    // 提取后应该变成L1或L2，尝试后续公式
    for (const formula of STANDARD_FORMULAS[slot]) {
      const full = extract + ' ' + formula
      if (tryFormula(cube, slot, full)) {
        return full
      }
    }

    // 提取 + U调整 + 公式
    for (const uAdj of U_ADJUSTMENTS) {
      for (const formula of STANDARD_FORMULAS[slot]) {
        const full = extract + ' ' + uAdj + ' ' + formula
        if (tryFormula(cube, slot, full)) {
          return full
        }
      }
    }

    // 提取 + 双重U调整 + 公式
    for (const u1 of U_ADJUSTMENTS.slice(0, 2)) {
      for (const u2 of U_ADJUSTMENTS.slice(0, 2)) {
        for (const formula of STANDARD_FORMULAS[slot]) {
          const full = extract + ' ' + u1 + ' ' + u2 + ' ' + formula
          if (tryFormula(cube, slot, full)) {
            return full
          }
        }
      }
    }
  }

  return null
}

/**
 * 求解单个F2L槽位
 */
function solveF2LSlot(cube: Cube, slot: Slot): string | null {
  const state = cube.asString()

  // 已完成
  if (checkSlotCompleteStrict(state, slot)) {
    return ''
  }

  const levelInfo = getLevel(state, slot)

  // 按级别求解
  switch (levelInfo.level) {
    case 'L1':
      return solveL1(cube, slot)
    case 'L2_SIMPLE':
      return solveL2Simple(cube, slot)
    case 'L2_COMPLEX':
      return solveL2Complex(cube, slot)
    case 'L3':
      return solveL3(cube, slot)
    default:
      return null
  }
}

// ============================================================
// 完整F2L求解器
// ============================================================

export function solveF2L(cube: Cube): F2LResult {
  const details: string[] = []
  const solutionParts: string[] = []
  const slotResults: F2LResult['slots'] = []

  // 分析所有槽位的级别
  const slotAnalysis: Array<{ slot: Slot; level: Level; priority: number }> = []
  const allSlots: Slot[] = ['FR', 'FL', 'BL', 'BR']

  for (const slot of allSlots) {
    const state = cube.asString()
    const levelInfo = getLevel(state, slot)

    let priority = 0
    switch (levelInfo.level) {
      case 'DONE': priority = 0; break
      case 'L1': priority = 1; break
      case 'L2_SIMPLE': priority = 2; break
      case 'L2_COMPLEX': priority = 3; break
      case 'L3': priority = 4; break
    }

    slotAnalysis.push({ slot, level: levelInfo.level, priority })
  }

  // 按优先级排序（简单的先解决）
  slotAnalysis.sort((a, b) => a.priority - b.priority)

  // 逐个求解
  for (const { slot, level } of slotAnalysis) {
    if (level === 'DONE') {
      details.push(`${slot}: ✅ 已完成`)
      slotResults.push({
        slot,
        initialLevel: level,
        finalLevel: 'DONE',
        formula: '',
        success: true
      })
      continue
    }

    const formula = solveF2LSlot(cube, slot)

    if (formula) {
      details.push(`${slot}: ${level} → ${formula}`)
      slotResults.push({
        slot,
        initialLevel: level,
        finalLevel: 'DONE',
        formula,
        success: true
      })
      cube.move(formula)
      solutionParts.push(formula)
    } else {
      details.push(`${slot}: ${level} → ❌ 未找到解`)
      slotResults.push({
        slot,
        initialLevel: level,
        finalLevel: level,
        formula: null,
        success: false
      })
    }
  }

  const finalState = cube.asString()
  const allComplete = allSlots.every(s => checkSlotCompleteStrict(finalState, s))

  return {
    solution: solutionParts.join(' '),
    steps: solutionParts.join(' ').split(' ').filter(s => s).length,
    success: allComplete,
    details,
    slots: slotResults,
  }
}

// ============================================================
// 导出
// ============================================================

export {
  getLevel,
  solveF2LSlot,
  checkSlotCompleteStrict as checkSlotComplete,
  solveF2L,
  STANDARD_STATE,
}

export type { Slot, Level, LevelResult, F2LResult }

