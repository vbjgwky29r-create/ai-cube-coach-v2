/**
 * 完整F2L公式库 - 41种标准情况
 *
 * 基于CFOP方法的标准F2L公式
 * 支持y转体简化求解
 */

import { F2LSlotName } from './f2l-pair-state'

export interface F2LCase {
  id: string
  slot: F2LSlotName
  cornerPos: string  // 角块位置
  edgePos: string    // 棱块位置
  cornerOri: number  // 角块朝向 (0=正确, 1=顺时针扭, 2=逆时针扭)
  edgeOri: number    // 棱块朝向 (0=正确, 1=翻转)
  algorithm: string  // 解法公式
  description: string
  withRotation?: boolean  // 是否需要y转体
  rotation?: string       // y/y'/y2
}

// FR槽位的41种F2L公式
// 其他槽位可以通过y转体得到
const FR_F2L_CASES: F2LCase[] = [
  // ===== 情况1-4: 块在顶层，已配对 =====
  {
    id: 'FR_01',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UF',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "R U R'",
    description: '标准插入 - 配对在前右'
  },
  {
    id: 'FR_02',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U' R U' R' U2 R U' R'",
    description: '配对在右上方'
  },
  {
    id: 'FR_03',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UB',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U2 R U R' U2 R U' R'",
    description: '配对在后上方'
  },
  {
    id: 'FR_04',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UL',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U R U2 R' U R U' R'",
    description: '配对在左上方'
  },

  // ===== 情况5-8: 块在顶层，角块白色朝上 =====
  {
    id: 'FR_05',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UF',
    cornerOri: 1,  // 白色朝上
    edgeOri: 0,
    algorithm: "U R U' R' U' R U R'",
    description: '角块白朝上，棱块在前'
  },
  {
    id: 'FR_06',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UR',
    cornerOri: 1,
    edgeOri: 0,
    algorithm: "R U' R' U2 R U' R'",
    description: '角块白朝上，棱块在右'
  },
  {
    id: 'FR_07',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UB',
    cornerOri: 1,
    edgeOri: 0,
    algorithm: "U2 R U R' U' R U R'",
    description: '角块白朝上，棱块在后'
  },
  {
    id: 'FR_08',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UL',
    cornerOri: 1,
    edgeOri: 0,
    algorithm: "R U2 R' U R U' R'",
    description: '角块白朝上，棱块在左'
  },

  // ===== 情况9-12: 角块在底层，棱块在顶层 =====
  {
    id: 'FR_09',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UF',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "R U' R' U2 R U' R'",
    description: '角块在槽位，棱块在前'
  },
  {
    id: 'FR_10',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U R U' R'",
    description: '角块在槽位，棱块在右'
  },
  {
    id: 'FR_11',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UB',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U2 R U' R' U' R U' R'",
    description: '角块在槽位，棱块在后'
  },
  {
    id: 'FR_12',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UL',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U' R U R'",
    description: '角块在槽位，棱块在左'
  },

  // ===== 情况13-16: 角块白色朝前，棱块在顶层 =====
  {
    id: 'FR_13',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UF',
    cornerOri: 2,  // 白色朝前
    edgeOri: 0,
    algorithm: "U' R U R' U R U' R'",
    description: '角块白朝前，棱块在前'
  },
  {
    id: 'FR_14',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UR',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "R U R' U' R U R'",
    description: '角块白朝前，棱块在右'
  },
  {
    id: 'FR_15',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UB',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "U2 R U' R' U R U' R'",
    description: '角块白朝前，棱块在后'
  },
  {
    id: 'FR_16',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UL',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "U R U2 R' U' R U R'",
    description: '角块白朝前，棱块在左'
  },

  // ===== 情况17-20: 角块白色朝右，棱块在顶层 =====
  {
    id: 'FR_17',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UF',
    cornerOri: 0,
    edgeOri: 1,
    algorithm: "U R U' R' U' R U2 R' U' R U' R'",
    description: '角块白朝右，棱块翻转在前'
  },
  {
    id: 'FR_18',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 1,
    algorithm: "R U' R' U R U2 R' U R U' R'",
    description: '角块白朝右，棱块翻转在右'
  },
  {
    id: 'FR_19',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UB',
    cornerOri: 0,
    edgeOri: 1,
    algorithm: "U2 R U' R' U2 R U' R'",
    description: '角块白朝右，棱块翻转在后'
  },
  {
    id: 'FR_20',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'UL',
    cornerOri: 0,
    edgeOri: 1,
    algorithm: "U' R U2 R' U2 R U' R'",
    description: '角块白朝右，棱块翻转在左'
  },

  // ===== 情况21-24: 块在中间层 =====
  {
    id: 'FR_21',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'FR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "R U' R' U R U2 R'",
    description: '角块在顶层，棱块在槽位'
  },
  {
    id: 'FR_22',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'FR',
    cornerOri: 1,
    edgeOri: 0,
    algorithm: "R U2 R' U' R U R'",
    description: '角块白朝上在槽位'
  },
  {
    id: 'FR_23',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'FR',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "U R U2 R' U R U' R'",
    description: '角块白朝前，棱块在槽位'
  },
  {
    id: 'FR_24',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'FR',
    cornerOri: 0,
    edgeOri: 1,
    algorithm: "U' R U' R' U2 R U' R'",
    description: '角块白朝右，棱块翻转在槽位'
  },

  // ===== 情况25-28: 分离情况 - 需要配对 =====
  {
    id: 'FR_25',
    slot: 'FR',
    cornerPos: 'UFL',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U' R U R' U2 R U' R'",
    description: '角在左前，棱在右'
  },
  {
    id: 'FR_26',
    slot: 'FR',
    cornerPos: 'ULB',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U2 R U' R' U R U' R'",
    description: '角在左后，棱在右'
  },
  {
    id: 'FR_27',
    slot: 'FR',
    cornerPos: 'UBR',
    edgePos: 'UF',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U R U2 R' U2 R U' R'",
    description: '角在右后，棱在前'
  },
  {
    id: 'FR_28',
    slot: 'FR',
    cornerPos: 'UFL',
    edgePos: 'UB',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U' R U' R' U R U R'",
    description: '角在左前，棱在后'
  },

  // ===== 情况29-32: 角块错误位置 =====
  {
    id: 'FR_29',
    slot: 'FR',
    cornerPos: 'DLF',
    edgePos: 'UF',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "L' U L U' R U R'",
    description: '角在左槽，棱在前'
  },
  {
    id: 'FR_30',
    slot: 'FR',
    cornerPos: 'DLF',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "L' U' L U R U' R'",
    description: '角在左槽，棱在右'
  },
  {
    id: 'FR_31',
    slot: 'FR',
    cornerPos: 'DBL',
    edgePos: 'UF',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "B U' B' U R U R'",
    description: '角在后槽，棱在前'
  },
  {
    id: 'FR_32',
    slot: 'FR',
    cornerPos: 'DBL',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "B U B' U' R U' R'",
    description: '角在后槽，棱在右'
  },

  // ===== 情况33-36: 复杂分离情况 =====
  {
    id: 'FR_33',
    slot: 'FR',
    cornerPos: 'UFL',
    edgePos: 'FR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U' R U R' U' R U2 R'",
    description: '角在左前，棱在槽位'
  },
  {
    id: 'FR_34',
    slot: 'FR',
    cornerPos: 'UBR',
    edgePos: 'FR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U R U' R' U R U2 R'",
    description: '角在右后，棱在槽位'
  },
  {
    id: 'FR_35',
    slot: 'FR',
    cornerPos: 'ULB',
    edgePos: 'FR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U2 R U' R' U2 R U2 R'",
    description: '角在左后，棱在槽位'
  },
  {
    id: 'FR_36',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UF',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "R U' R' U2 R U R'",
    description: '角白朝前在槽位，棱在前'
  },

  // ===== 情况37-41: 特殊情况 =====
  {
    id: 'FR_37',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UR',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "U R U2 R' U' R U R'",
    description: '角白朝前在槽位，棱在右'
  },
  {
    id: 'FR_38',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UB',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "U2 R U R' U' R U R'",
    description: '角白朝前在槽位，棱在后'
  },
  {
    id: 'FR_39',
    slot: 'FR',
    cornerPos: 'DFR',
    edgePos: 'UL',
    cornerOri: 2,
    edgeOri: 0,
    algorithm: "U' R U' R' U R U R'",
    description: '角白朝前在槽位，棱在左'
  },
  {
    id: 'FR_40',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'FL',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U R U' R' L' U' L",
    description: '角在前右，棱在左槽'
  },
  {
    id: 'FR_41',
    slot: 'FR',
    cornerPos: 'URF',
    edgePos: 'BR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "U' R U R' B U B'",
    description: '角在前右，棱在后槽'
  },
]

// 正确的FL槽位公式（覆盖错误生成的转体公式）
const FL_CORRECT_FORMULAS: Partial<F2LCase>[] = [
  {
    id: 'FL_25',
    slot: 'FL',
    cornerPos: 'UFL',
    edgePos: 'UR',
    cornerOri: 0,
    edgeOri: 0,
    algorithm: "L' F' L2 U2 F L",
    description: 'FL: 角在左前，棱在右（左手公式）',
  },
]

// 通过y转体生成其他槽位的公式
function rotateF2LCase(yRot: string, slot: F2LSlotName): F2LSlotName {
  // y转体映射: F->R->B->L->F
  const rotation: Record<string, Record<string, F2LSlotName>> = {
    '': { FR: 'FR', FL: 'FL', BL: 'BL', BR: 'BR' },
    'y': { FR: 'BR', FL: 'FR', BL: 'FL', BR: 'BL' },
    "y'": { FR: 'FL', FL: 'BL', BL: 'BR', BR: 'FR' },
    'y2': { FR: 'BL', FL: 'BR', BL: 'FR', BR: 'FL' },
  }
  return rotation[yRot][slot]
}

// 生成完整的41种情况×4槽位=164个公式
export const ALL_F2L_CASES: F2LCase[] = [
  ...FR_F2L_CASES,
  // 通过y'转体生成FL槽位
  ...FR_F2L_CASES.map(c => ({
    ...c,
    id: c.id.replace('FR', 'FL'),
    slot: 'FL' as F2LSlotName,
    algorithm: `y' ${c.algorithm} y`,
    withRotation: true,
    rotation: "y'",
  })),
  // 通过y2转体生成BL槽位
  ...FR_F2L_CASES.map(c => ({
    ...c,
    id: c.id.replace('FR', 'BL'),
    slot: 'BL' as F2LSlotName,
    algorithm: `y2 ${c.algorithm} y2`,
    withRotation: true,
    rotation: 'y2',
  })),
  // 通过y转体生成BR槽位
  ...FR_F2L_CASES.map(c => ({
    ...c,
    id: c.id.replace('FR', 'BR'),
    slot: 'BR' as F2LSlotName,
    algorithm: `y ${c.algorithm} y'`,
    withRotation: true,
    rotation: 'y',
  })),
]

// 用正确的公式覆盖错误的转体生成公式
function mergeCorrectFormulas(allCases: F2LCase[]): F2LCase[] {
  const result = [...allCases]

  for (const correct of FL_CORRECT_FORMULAS) {
    const index = result.findIndex(c => c.id === correct.id)
    if (index >= 0) {
      result[index] = { ...result[index], ...correct } as F2LCase
    }
  }

  return result
}

export const ALL_F2L_CASES_CORRECTED = mergeCorrectFormulas(ALL_F2L_CASES)

// 查找匹配的F2L公式
export function findF2LAlgorithm(
  cornerLoc: string,
  cornerOri: number,
  edgeLoc: string,
  edgeOri: number,
  slot: F2LSlotName
): string | null {
  // 首先在当前槽位查找
  const match = ALL_F2L_CASES.find(c =>
    c.slot === slot &&
    c.cornerPos === cornerLoc &&
    c.edgePos === edgeLoc &&
    c.cornerOri === cornerOri &&
    c.edgeOri === edgeOri
  )

  if (match) {
    // 清理转体标记，返回纯算法
    return match.algorithm.replace(/^(y|y'|y2)\s+/, '').replace(/\s+(y|y'|y2)$/, '')
  }

  return null
}

// 获取槽位的所有公式
export function getF2LAlgorithmsForSlot(slot: F2LSlotName): F2LCase[] {
  return ALL_F2L_CASES.filter(c => c.slot === slot)
}
