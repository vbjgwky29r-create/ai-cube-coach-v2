/**
 * F2L 标态库求解器
 *
 * 核心思想：
 * 1. 41种F2L情况 = 41种标态
 * 2. 每种标态有对应的识别条件和公式
 * 3. L3→L2→L1是状态转换，但最终都要匹配到某个标态
 */

import Cube from 'cubejs'

// ============================================================
// 常量定义
// ============================================================

const INDICES = {
  UF: [7, 19], UR: [5, 10], UB: [1, 46], UL: [3, 37],
  FR: [12, 23], FL: [21, 41], BL: [39, 47], BR: [48, 14],
  URF: [8, 20, 9], UFL: [6, 18, 38], ULB: [0, 36, 47], UBR: [2, 45, 11],
  DFR: [29, 26, 15], DFL: [27, 44, 24], DBL: [33, 42, 53], DBR: [35, 51, 17],
} as const

type Slot = 'FR' | 'FL' | 'BL' | 'BR'

// ============================================================
// 标态定义
// ============================================================

interface F2LStandardState {
  id: string
  name: string

  // 识别条件
  match: (cornerPos: string, edgePos: string, cornerInU: boolean, edgeInU: boolean) => boolean

  // 对应公式（每个槽位）
  formulas: {
    FR: string
    FL: string
    BL: string
    BR: string
  }
}

// ============================================================
// 完整标态库（41种 × 4槽位）
// ============================================================

const STANDARD_STATES: F2LStandardState[] = [
  // ========== Case 1-10: 两个块都在U层 ==========

  {
    id: 'C01',
    name: 'Case 1: 配对在U层',
    match: (cornerPos, edgePos, cU, eU) =>
      cU && eU &&
      ((cornerPos === 'URF' && edgePos === 'UF') ||
       (cornerPos === 'UFL' && edgePos === 'UF') ||
       (cornerPos === 'ULB' && edgePos === 'UL') ||
       (cornerPos === 'UBR' && edgePos === 'UB')),
    formulas: {
      FR: 'R U R\'',
      FL: 'L\' U\' L',
      BL: 'L U L\'',
      BR: 'R\' U\' R',
    },
  },

  {
    id: 'C01_VARIANT',
    name: 'Case 1变体: 配对在U层(不同位置)',
    match: (cornerPos, edgePos, cU, eU) =>
      cU && eU &&
      ((cornerPos === 'URF' && edgePos === 'UR') ||
       (cornerPos === 'UFL' && edgePos === 'UL') ||
       (cornerPos === 'ULB' && edgePos === 'UB') ||
       (cornerPos === 'UBR' && edgePos === 'UR')),
    formulas: {
      FR: 'U R U\' R\'',
      FL: 'U\' L\' U L',
      BL: 'U L U\' L\'',
      BR: 'U\' R U R\'',
    },
  },

  {
    id: 'C02',
    name: 'Case 2: U层分离，朝向正确',
    match: (cornerPos, edgePos, cU, eU) =>
      cU && eU && cornerPos === 'URF' && edgePos === 'UF',
    formulas: {
      FR: 'U\' R U R\' U R U\' R\'',
      FL: 'U L\' U\' L U\' L\' U L',
      BL: 'U\' L U L\' U L U\' L\'',
      BR: 'U R\' U\' R U R\' U\' R',
    },
  },

  {
    id: 'C03',
    name: 'Case 3: 角块在U层，棱块在中层',
    match: (cornerPos, edgePos, cU, eU) =>
      cU && !eU &&
      (cornerPos === 'URF' || cornerPos === 'UBR' || cornerPos === 'UFL' || cornerPos === 'ULB'),
    formulas: {
      FR: 'R\' U\' R U R U R\'',
      FL: 'L U L\' U\' L\' U\' L',
      BL: 'L\' U\' L U\' L\' U L',
      BR: 'R U R\' U R U\' R\'',
    },
  },

  // 更多Case...
  // 这里简化为最重要的几种情况

  {
    id: 'C_SIMPLE',
    name: '简单U层情况',
    match: (cornerPos, edgePos, cU, eU) => cU && eU,
    formulas: {
      FR: 'R U R\' U\' R U R\'',
      FL: 'L\' U\' L U L\' U\' L',
      BL: 'L U L\' U\' L U L\'',
      BR: 'R\' U\' R U R\' U\' R',
    },
  },

  {
    id: 'C_CORNER_IN_SLOT',
    name: '角块在槽位',
    match: (cornerPos, edgePos, cU, eU) => !cU && eU,
    formulas: {
      FR: 'R U R\' U\' R U R\'',
      FL: 'L\' U\' L U L\' U\' L',
      BL: 'L U L\' U\' L U L\'',
      BR: 'R\' U\' R U R\' U\' R',
    },
  },

  {
    id: 'C_EDGE_IN_MIDDLE',
    name: '棱块在中层',
    match: (cornerPos, edgePos, cU, eU) => cU && !eU,
    formulas: {
      FR: 'R\' U\' R U R U R\'',
      FL: 'L U L\' U\' L\' U\' L',
      BL: 'L\' U\' L U\' L\' U L',
      BR: 'R U R\' U R U\' R\'',
    },
  },

  {
    id: 'C_BOTH_NOT_IN_U',
    name: '两个块都不在U层',
    match: (cornerPos, edgePos, cU, eU) => !cU && !eU,
    formulas: {
      FR: 'R U R\' U\' R U R\'',
      FL: 'L\' U\' L U L\' U\' L',
      BL: 'L U L\' U\' L U L\'',
      BR: 'R\' U\' R U R\' U\' R',
    },
  },
]

// ============================================================
// 工具函数
// ============================================================

function checkCrossIntact(state: string): boolean {
  return state[28] === 'D' && state[30] === 'D' &&
         state[34] === 'D' && state[32] === 'D'
}

function checkSlotComplete(state: string, slot: Slot): boolean {
  const slotIdx = {
    FR: { corner: INDICES.DFR, edge: INDICES.FR },
    FL: { corner: INDICES.DFL, edge: INDICES.FL },
    BL: { corner: INDICES.DBL, edge: INDICES.BL },
    BR: { corner: INDICES.DBR, edge: INDICES.BR },
  }[slot]

  const colors = {
    FR: { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
    FL: { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
    BL: { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
    BR: { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
  }[slot]

  const cornerColors = state[slotIdx.corner[0]] + state[slotIdx.corner[1]] + state[slotIdx.corner[2]]
  const edgeColors = state[slotIdx.edge[0]] + state[slotIdx.edge[1]]

  const cornerMatch = cornerColors.split('').sort().join('') === colors.corner.sort().join('')
  const edgeMatch = edgeColors.split('').sort().join('') === colors.edge.sort().join('')
  const cornerOriented = state[slotIdx.corner[0]] === 'D'

  return cornerMatch && edgeMatch && cornerOriented
}

function findPiece(state: string, colors: string[], type: 'corner' | 'edge'): string {
  const sortedColors = [...colors].sort().join('')

  if (type === 'corner') {
    const positions: Record<string, number[]> = {
      'URF': INDICES.URF, 'UFL': INDICES.UFL, 'ULB': INDICES.ULB, 'UBR': INDICES.UBR,
      'DFR': INDICES.DFR, 'DFL': INDICES.DFL, 'DBL': INDICES.DBL, 'DBR': INDICES.DBR,
    }
    for (const [name, idx] of Object.entries(positions)) {
      const actual = state[idx[0]] + state[idx[1]] + state[idx[2]]
      if (actual.split('').sort().join('') === sortedColors) return name
    }
  } else {
    const positions: Record<string, number[]> = {
      'UF': INDICES.UF, 'UR': INDICES.UR, 'UB': INDICES.UB, 'UL': INDICES.UL,
      'FR': INDICES.FR, 'FL': INDICES.FL, 'BL': INDICES.BL, 'BR': INDICES.BR,
    }
    for (const [name, idx] of Object.entries(positions)) {
      const actual = state[idx[0]] + state[idx[1]]
      if (actual.split('').sort().join('') === sortedColors) return name
    }
  }

  return 'unknown'
}

// ============================================================
// 求解函数
// ============================================================

/**
 * 使用标态库求解单个槽位
 */
function solveSlotWithStandardStates(cube: Cube, slot: Slot): string | null {
  const state = cube.asString()

  // 已完成
  if (checkSlotComplete(state, slot)) {
    return ''
  }

  const colors = {
    FR: { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
    FL: { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
    BL: { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
    BR: { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
  }[slot]

  // 查找块位置
  const cornerPos = findPiece(state, colors.corner, 'corner')
  const edgePos = findPiece(state, colors.edge, 'edge')

  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uEdges = ['UF', 'UR', 'UB', 'UL']

  const cornerInU = uCorners.includes(cornerPos)
  const edgeInU = uEdges.includes(edgePos)

  // 匹配标态
  for (const standardState of STANDARD_STATES) {
    if (standardState.match(cornerPos, edgePos, cornerInU, edgeInU)) {
      const formula = standardState.formulas[slot]

      // 尝试直接使用公式
      if (tryFormula(cube, slot, formula)) {
        return formula
      }

      // 尝试带U调整的公式
      for (const uAdj of ['U', "U'", 'U2']) {
        if (tryFormula(cube, slot, uAdj + ' ' + formula)) {
          return uAdj + ' ' + formula
        }
      }

      // 尝试提取 + 公式（针对非U层情况）
      if (!cornerInU || !edgeInU) {
        const extracts = getExtractFormulas(slot, cornerPos, edgePos, cornerInU, edgeInU)
        for (const extract of extracts) {
          if (tryFormula(cube, slot, extract + ' ' + formula)) {
            return extract + ' ' + formula
          }
          for (const uAdj of ['U', "U'", 'U2']) {
            if (tryFormula(cube, slot, extract + ' ' + uAdj + ' ' + formula)) {
              return extract + ' ' + uAdj + ' ' + formula
            }
          }
        }
      }
    }
  }

  return null
}

function getExtractFormulas(
  slot: Slot,
  cornerPos: string,
  edgePos: string,
  cornerInU: boolean,
  edgeInU: boolean
): string[] {
  const formulas: string[] = []

  // 根据槽位选择提取公式
  const slotExtracts: Record<Slot, string[]> = {
    FR: ['R U R\'', 'R\' U\' R', 'R U2 R\''],
    FL: ['L\' U\' L', 'L U L\'', 'L\' U2 L'],
    BL: ['L U L\'', 'L\' U\' L', 'L U2 L\''],
    BR: ['R\' U\' R', 'R U R\'', 'R\' U2 R'],
  }

  formulas.push(...slotExtracts[slot])

  // 根据块位置添加特定提取公式
  if (!edgeInU && ['FR', 'FL', 'BL', 'BR'].includes(edgePos)) {
    formulas.push(
      'F\' U F', 'F U\' F\'',
      'B\' U B', 'B U\' B\''
    )
  }

  return [...new Set(formulas)]
}

function tryFormula(cube: Cube, slot: Slot, formula: string): boolean {
  try {
    const test = new Cube(cube)
    test.move(formula)
    return checkSlotComplete(test.asString(), slot) && checkCrossIntact(test.asString())
  } catch {
    return false
  }
}

// ============================================================
// 完整F2L求解
// ============================================================

export interface F2LResult {
  solution: string
  steps: number
  success: boolean
}

export function solveF2L(cube: Cube): F2LResult {
  const solutionParts: string[] = []
  const slots: Slot[] = ['FR', 'FL', 'BL', 'BR']

  for (const slot of slots) {
    const formula = solveSlotWithStandardStates(cube, slot)
    if (formula && formula !== '') {
      cube.move(formula)
      solutionParts.push(formula)
    }
  }

  return {
    solution: solutionParts.join(' '),
    steps: solutionParts.join(' ').split(' ').filter(s => s).length,
    success: slots.every(s => checkSlotComplete(cube.asString(), s)),
  }
}

// ============================================================
// 导出
// ============================================================

export { checkSlotComplete, checkCrossIntact, solveSlotWithStandardStates }
export type { Slot, F2LStandardState }
