/**
 * 扩展F2L公式库 - 预计算版本
 *
 * 策略：
 * 1. 识别当前块的位置
 * 2. 查找setup���式将块移到U层
 * 3. 应用标准41种公式之一
 */

import Cube from 'cubejs'

// 所有可能的块位置
const POSITIONS = {
  corners: ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DFL', 'DBL', 'DBR'],
  edges: ['UF', 'UR', 'UB', 'UL', 'FR', 'FL', 'BL', 'BR'],
}

// Setup公式 - 将块从某位置移到U���
const SETUP_MOVES: Record<string, string> = {
  // 角块setup (从D层移到U层)
  'DFR→URF': 'R U R\'',
  'DFR→UFL': 'U R U\' R\'',
  'DFR→ULB': 'U2 R U R\'',
  'DFR→UBR': 'U\' R U R\'',

  'DFL→URF': 'L\' U\' L',
  'DFL→UFL': 'U\' L\' U L',
  'DFL→ULB': 'U L\' U\' L',
  'DFL→UBR': 'U2 L\' U L',

  'DBL→URF': 'L U L\'',
  'DBL→UFL': 'U L U\' L\'',
  'DBL→ULB': 'U\' L U\' L\'',
  'DBL→UBR': 'U2 L U\' L\'',

  'DBR→URF': 'R\' U\' R',
  'DBR→UFL': 'U2 R\' U R',
  'DBR→ULB': 'U R\' U\' R',
  'DBR→UBR': 'U\' R\' U R',

  // 棱块setup (从中层移到U层)
  'FR→UF': 'R U R\'',
  'FR→UR': 'R\' U\' R',
  'FR→UB': 'U R U\' R\'',
  'FR→UL': 'U\' R U\' R\'',

  'FL→UF': 'L\' U\' L',
  'FL→UR': 'U\' L U\' L\'',
  'FL→UB': 'U L\' U\' L',
  'FL→UL': 'L U L\'',

  'BL→UF': 'B\' U\' B',
  'BL→UR': 'U\' B U\' B\'',
  'BL→UB': 'B U B\'',
  'BL→UL': 'U B\' U\' B',

  'BR→UF': 'B U B\'',
  'BR→UR': 'B\' U\' B',
  'BR→UB': 'U\' B\' U B',
  'BR→UL': 'U B U\' B\'',
}

export interface F2LExtendedCase {
  cornerLoc: string
  edgeLoc: string
  cornerOri: number
  edgeOri: number
  setup: string        // setup公式
  algorithm: string    // 标准公式
}

/**
 * 获取扩展F2L案例
 * @param slot 目标槽位 (FR/FL/BL/BR)
 * @param cornerLoc 角块当前位置
 * @param edgeLoc 棱块当前位置
 * @param cornerOri 角块朝向 (0/1/2)
 * @param edgeOri 棱块朝向 (0/1)
 */
export function getExtendedF2LCase(
  slot: string,
  cornerLoc: string,
  edgeLoc: string,
  cornerOri: number,
  edgeOri: number
): F2LExtendedCase | null {
  // 目标U层位置
  const uLayerCorners = ['URF', 'UFL', 'ULB', 'UBR']
  const uLayerEdges = ['UF', 'UR', 'UB', 'UL']

  // 如果已经在U层，使用标准公式
  if (uLayerCorners.includes(cornerLoc) && uLayerEdges.includes(edgeLoc)) {
    // 使用41种标准公式
    return getStandardFormula(slot, cornerLoc, edgeLoc, cornerOri, edgeOri)
  }

  // 如果不在U层，需要setup
  let setup = ''

  // 角块不在U层
  if (!uLayerCorners.includes(cornerLoc)) {
    const cornerSetup = `${cornerLoc}→URF` // 默认移到URF
    if (SETUP_MOVES[cornerSetup]) {
      setup = SETUP_MOVES[cornerSetup]
    }
  }

  // 棱块不在U层
  if (!uLayerEdges.includes(edgeLoc)) {
    const edgeSetup = `${edgeLoc}→UF` // 默认移到UF
    if (SETUP_MOVES[edgeSetup]) {
      setup = setup ? setup + ' ' + SETUP_MOVES[edgeSetup] : SETUP_MOVES[edgeSetup]
    }
  }

  if (!setup) return null

  // setup后的标准公式 (假设到URF+UF)
  const standardAlg = getStandardFormula(slot, 'URF', 'UF', cornerOri, edgeOri)

  return {
    cornerLoc,
    edgeLoc,
    cornerOri,
    edgeOri,
    setup,
    algorithm: standardAlg?.algorithm || 'R U R\'',
  }
}

function getStandardFormula(
  slot: string,
  cornerLoc: string,
  edgeLoc: string,
  cornerOri: number,
  edgeOri: number
): F2LExtendedCase | null {
  // 标准F2L公式 (简化版，从公式库获取)
  const formulas: Record<string, string> = {
    'FR_0_0': 'R U R\'',           // 标配
    'FR_0_1': 'R U\' R\' U R U\' R\'',
    'FR_1_0': 'R U\' R\' U\' R U R\'',
    'FR_1_1': 'R\' U2 R U R\' U R',
  }

  // 根据相对位置调整公式
  // 这里简化处理，实际需要从完整公式库查询
  const key = `${slot}_${cornerOri}_${edgeOri}`

  if (formulas[key]) {
    return {
      cornerLoc,
      edgeLoc,
      cornerOri,
      edgeOri,
      setup: '',
      algorithm: formulas[key],
    }
  }

  return null
}

/**
 * 尝试求解F2L槽位（使用扩展库）
 */
export function solveF2LSlotExtended(cube: Cube, slot: string): string | null {
  // 这里应该调用piece locator获取当前状态
  // 简化实现：尝试常用setup+公式组合

  const combinations = [
    'R U R\'',                    // 直接插入
    'U R U\' R\'',                 // U调整 + 插入
    'R U R\' U\' R U R\'',         // 配对插入
    'y\' U\' L\' U L y',          // 转体后用左手公式
  ]

  for (const combo of combinations) {
    const test = new Cube(cube)
    try {
      test.move(combo)
      // TODO: 检查槽位是否完成
    } catch (e) {}
  }

  return null
}
