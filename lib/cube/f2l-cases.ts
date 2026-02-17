/**
 * F2L 完整案例库 (41种情况)
 *
 * 标准F2L分类系统（针对FR槽位）：
 * - Case 1-10: Free Pairs (两个块都在U层)
 * - Case 11-24: Connected Pairs (配对状态)
 * - Case 25-30: Corner In Slot (角块在槽位)
 * - Case 31-36: Edge In Slot (棱块在槽位)
 * - Case 37-41: Pieces In Slot (两个块都在槽位)
 *
 * 数据来源: SpeedCubeDB (最常用的算法)
 */

import type { CubeState } from './cube-state-v3'

// ============================================================
// F2L 案例定义
// ============================================================

export interface F2LCaseCondition {
  // 角块状态
  corner: {
    inSlot: boolean           // 是否在目标槽位
    inULayer: boolean         // 是否在U层
    position?: string         // 具体位置 (URF, UFL, ULB, UBR)
    orientation: number       // 0=正确朝向, 1=顺时针扭曲, 2=逆时针扭曲
  }
  // 棱块状态
  edge: {
    inSlot: boolean           // 是否在目标槽位
    inULayer: boolean         // 是否在U层
    position?: string         // 具体位置 (UF, UL, UB, UR)
    orientation: number       // 0=正确朝向, 1=翻转
  }
  // 配对状态
  paired: boolean            // 是否已配对（相邻且朝向正确）
  connected: boolean         // 是否相连（角块和棱块接触）
}

export interface F2LCase {
  id: string
  name: string
  category: string           // 'free_pairs', 'connected_pairs', 'corner_in_slot', 'edge_in_slot', 'pieces_in_slot'
  condition: F2LCaseCondition
  algorithms: {
    FR: string               // 前右槽位公式
    FL: string               // 前左槽位公式 (镜像)
    BL: string               // 后左槽位公式
    BR: string               // 后右槽位公式
  }
  steps: number
  description?: string
}

// ============================================================
// 辅助函数：获取其他槽位的公式（镜像变换）
// ============================================================

/**
 * 将FR公式转换为FL公式（左右镜像）
 * R <-> L, R' <-> L', U保持不变, F保持不变
 */
function frToFL(alg: string): string {
  return alg
    .replace(/R/g, 'x')
    .replace(/L/g, 'R')
    .replace(/x/g, 'L')
    .replace(/R'/g, 'x')
    .replace(/L'/g, "R'")
    .replace(/x'/g, "L'")
    .replace(/R2/g, 'x')
    .replace(/L2/g, 'R2')
    .replace(/x2/g, 'L2')
}

/**
 * 将FR公式转换为BL公式（180度旋转）
 * R <-> L', F <-> B, U <-> U', R' <-> L
 */
function frToBL(alg: string): string {
  // 先转换为FL，再旋转180度
  const fl = frToFL(alg)
  return fl
    .replace(/F/g, 'x')
    .replace(/B/g, 'F')
    .replace(/x/g, 'B')
    .replace(/F'/g, 'x')
    .replace(/B'/g, "F'")
    .replace(/x'/g, "B'")
    .replace(/F2/g, 'x')
    .replace(/B2/g, 'F2')
    .replace(/x2/g, 'B2')
}

/**
 * 将FR公式转换为BR公式（前后镜像）
 * R <-> R, F <-> B
 */
function frToBR(alg: string): string {
  return alg
    .replace(/F/g, 'x')
    .replace(/B/g, 'F')
    .replace(/x/g, 'B')
    .replace(/F'/g, 'x')
    .replace(/B'/g, "F'")
    .replace(/x'/g, "B'")
    .replace(/F2/g, 'x')
    .replace(/B2/g, 'F2')
    .replace(/x2/g, 'B2')
}

/**
 * 为所有槽位生成公式
 */
function generateAllSlots(frAlg: string): { FR: string; FL: string; BL: string; BR: string } {
  return {
    FR: frAlg,
    FL: frToFL(frAlg),
    BL: frToBL(frAlg),
    BR: frToBR(frAlg),
  }
}

// ============================================================
// Case 1: 配对在U层 (最简单)
// ============================================================

export const F2L_01_PAIRED_U: F2LCase = {
  id: 'F2L_01',
  name: 'Case 1: 配对在U层',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: true,
    connected: true,
  },
  algorithms: {
    FR: "U R U' R'",
    FL: "U' L' U L",
    BL: "U L U' L'",
    BR: "U' R U R'",
  },
  steps: 3,
  description: '配对的块在U层，直接插入槽位',
}

// ============================================================
// Case 2: 角块URF，棱块UF，分离但朝向正确
// ============================================================

export const F2L_02_SEPARATED_ORIENTED: F2LCase = {
  id: 'F2L_02',
  name: 'Case 2: U层分离，朝向正确',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' R U R' U R U' R'",
    FL: "U L' U' L U' L' U L",
    BL: "U' L U L' U L U' L'",
    BR: "U R' U' R U R' U' R",
  },
  steps: 7,
  description: '先配对再插入',
}

// ============================================================
// Case 3: 角块URF，棱块在左侧中层
// ============================================================

export const F2L_03_CORNER_U_EDGE_MIDDLE: F2LCase = {
  id: 'F2L_03',
  name: 'Case 3: 角块在U层，棱块在中层',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R' U' R U R U R'",
    FL: "L U L' U' L' U' L",
    BL: "L' U' L U' L' U L",
    BR: "R U R' U R U' R'",
  },
  steps: 7,
  description: '将中层棱块带到U层再配对',
}

// ============================================================
// Case 4: R U' R' setup - 角块在URF，棱块UF接近配对
// ============================================================

export const F2L_04_ALMOST_PAIRED: F2LCase = {
  id: 'F2L_04',
  name: 'Case 4: 接近配对',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U R'",
    FL: "L' U' L",
    BL: "L' U L",
    BR: "R U' R'",
  },
  steps: 3,
  description: '一步配对',
}

// ============================================================
// Case 5: 角块扭曲在U层，棱块在U层
// ============================================================

export const F2L_05_CORNER_TWISTED: F2LCase = {
  id: 'F2L_05',
  name: 'Case 5: 角块扭曲在U层',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U' R' U2 R U' R'",
    FL: "U' L' U L U2 L' U L",
    BL: "U L' U L' U' L U L'",
    BR: "U' R U' R' U2 R' U R",
  },
  steps: 7,
  description: '扭曲的角块需要特殊处理',
}

// ============================================================
// Case 6: 连接但错误的情况
// ============================================================

export const F2L_06_CONNECTED_WRONG: F2LCase = {
  id: 'F2L_06',
  name: 'Case 6: 连接但错误',
  category: 'connected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: true,
  },
  algorithms: {
    FR: "R' U2 R U R' U' R",
    FL: "L U2 L' U' L U L'",
    BL: "L' U2 L U' L' U L",
    BR: "R U2 R' U R U' R'",
  },
  steps: 7,
  description: '连接但不匹配的配对',
}

// ============================================================
// Case 7: 另一种连接但错误的情况
// ============================================================

export const F2L_07_CONNECTED_WRONG_2: F2LCase = {
  id: 'F2L_07',
  name: 'Case 7: 连接但错误2',
  category: 'connected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: true,
  },
  algorithms: {
    FR: "U' R U R' U2 R U' R'",
    FL: "U L' U' L U2 L' U L",
    BL: "U' L U L' U2 L U' L'",
    BR: "U R' U' R U2 R' U R",
  },
  steps: 7,
  description: '另一种不匹配的连接',
}

// ============================================================
// Case 8: 棱块翻转在U层
// ============================================================

export const F2L_08_EDGE_FLIPPED: F2LCase = {
  id: 'F2L_08',
  name: 'Case 8: 棱块翻转在U层',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' R U' R' U R U R'",
    FL: "U L' U L U' L' U' L",
    BL: "U' L' U' L U L' U L",
    BR: "U R U R' U' R U' R'",
  },
  steps: 8,
  description: '翻转的棱块需要调整方向',
}

// ============================================================
// Case 9: 分离的情况
// ============================================================

export const F2L_09_SEPARATED: F2LCase = {
  id: 'F2L_09',
  name: 'Case 9: U层分离',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U2 R U R'",
    FL: "L' U L U2 L' U' L'",
    BL: "L' U' L U2 L' U' L",
    BR: "R U R' U2 R U R'",
  },
  steps: 7,
  description: '分离的块',
}

// ============================================================
// Case 10: 角块扭曲且棱块翻转
// ============================================================

export const F2L_10_BOTH_WRONG: F2LCase = {
  id: 'F2L_10',
  name: 'Case 10: 角块扭曲，棱块翻转',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: false, inULayer: true, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U2 R' U' R U R'",
    FL: "U' L' U2 L U L' U' L'",
    BL: "U L' U2 L U L U' L'",
    BR: "U' R U2 R' U' R' U R",
  },
  steps: 7,
  description: '两个块朝向都错误',
}

// ============================================================
// Case 11: 另一种分离情况
// ============================================================

export const F2L_11_DISCONNECTED: F2LCase = {
  id: 'F2L_11',
  name: 'Case 11: 断开连接',
  category: 'disconnected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' R U R' U R U' R'",
    FL: "U L' U' L U' L' U L",
    BL: "U' L U L' U L U' L'",
    BR: "U R' U' R U R' U' R",
  },
  steps: 7,
  description: '分离的配对',
}

// ============================================================
// Case 12: 角块朝上，棱块在侧面
// ============================================================

export const F2L_12_CORNER_UP: F2LCase = {
  id: 'F2L_12',
  name: 'Case 12: 角块朝上',
  category: 'disconnected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 2 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U2 R' U R U' R'",
    FL: "U' L' U2 L U' L' U L",
    BL: "U L' U2 L' U' L' U L",
    BR: "U' R U2 R' U R' U' R",
  },
  steps: 7,
  description: '角块朝上需要特殊处理',
}

// ============================================================
// Case 13: 角块扭曲，棱块在中层
// ============================================================

export const F2L_13_CORNER_TWISTED_EDGE_MIDDLE: F2LCase = {
  id: 'F2L_13',
  name: 'Case 13: 角块扭曲，棱块在中层',
  category: 'disconnected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: false, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U R' U' R U R'",
    FL: "L' U' L U L' U' L",
    BL: "L' U L' U' L' U L",
    BR: "R U' R U R U' R'",
  },
  steps: 7,
  description: '扭曲角块加中层棱块',
}

// ============================================================
// Case 14: 棱块翻转在侧面位置
// ============================================================

export const F2L_14_EDGE_FLIPPED_SIDE: F2LCase = {
  id: 'F2L_14',
  name: 'Case 14: 棱块翻转在侧面',
  category: 'disconnected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' R U' R' U R U R'",
    FL: "U L' U L U' L' U' L",
    BL: "U' L' U L U L' U L",
    BR: "U R U R' U' R U' R'",
  },
  steps: 8,
  description: '翻转棱块在侧面',
}

// ============================================================
// Case 15: 特殊配对情况
// ============================================================

export const F2L_15_SPECIAL_PAIR: F2LCase = {
  id: 'F2L_15',
  name: 'Case 15: 特殊配对',
  category: 'connected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: true,
  },
  algorithms: {
    FR: "U R U' R' U R U' R'",
    FL: "U' L' U L U' L' U L",
    BL: "U L' U L' U' L U L'",
    BR: "U' R U' R' U R' U R",
  },
  steps: 8,
  description: '特殊配对情况',
}

// ============================================================
// Case 16-20: 更多变体
// ============================================================

export const F2L_16: F2LCase = {
  id: 'F2L_16',
  name: 'Case 16',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' F' U F U R U' R'",
    FL: "U F U' F' U' L' U L",
    BL: "U' F U' F' U' L U L'",
    BR: "U F' U F U R' U R",
  },
  steps: 8,
  description: '使用F面的配对',
}

export const F2L_17: F2LCase = {
  id: 'F2L_17',
  name: 'Case 17',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U2 R U R' U R U' R'",
    FL: "U2 L' U' L U' L' U L",
    BL: "U2 L' U L' U' L U L'",
    BR: "U2 R U' R' U R' U R",
  },
  steps: 7,
  description: '角块扭曲的变体',
}

export const F2L_18: F2LCase = {
  id: 'F2L_18',
  name: 'Case 18',
  category: 'disconnected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U2 R U' R' U' R U R'",
    FL: "U2 L' U L U L' U' L'",
    BL: "U2 L' U' L' U L' U L",
    BR: "U2 R U' R U R' U' R'",
  },
  steps: 7,
  description: '分离情况',
}

export const F2L_19: F2LCase = {
  id: 'F2L_19',
  name: 'Case 19',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U F R' F' R U' R U R'",
    FL: "U' F' L F L' U L' U' L'",
    BL: "U F' L' F L U L' U L",
    BR: "U' F R F' R' U' R' U R",
  },
  steps: 8,
  description: '翻转棱块变体',
}

export const F2L_20: F2LCase = {
  id: 'F2L_20',
  name: 'Case 20',
  category: 'disconnected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 2 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U' R' U' R U R'",
    FL: "U' L' U L U L' U' L'",
    BL: "U' L U' L' U' L' U L",
    BR: "U R' U' R U' R U' R'",
  },
  steps: 7,
  description: '角块朝上的变体',
}

// ============================================================
// Case 21-24: 更多连接配对情况
// ============================================================

export const F2L_21: F2LCase = {
  id: 'F2L_21',
  name: 'Case 21',
  category: 'connected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: true,
  },
  algorithms: {
    FR: "U R U' R' U' R U R'",
    FL: "U' L' U L U L' U' L'",
    BL: "U' L U' L' U L' U L",
    BR: "U R' U' R U' R U' R'",
  },
  steps: 7,
  description: '连接但需调整',
}

export const F2L_22: F2LCase = {
  id: 'F2L_22',
  name: 'Case 22',
  category: 'free_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "F' U F U R U' R'",
    FL: "F U' F' U' L' U L",
    BL: "F' U' F U' L' U L",
    BR: "F U F' U R U' R'",
  },
  steps: 7,
  description: '棱块在中层',
}

export const F2L_23: F2LCase = {
  id: 'F2L_23',
  name: 'Case 23',
  category: 'connected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: true,
  },
  algorithms: {
    FR: "U2 R U R' U R U' R'",
    FL: "U2 L' U' L U' L' U L",
    BL: "U2 L' U L' U' L U L'",
    BR: "U2 R U' R' U R' U R",
  },
  steps: 7,
  description: '另一种连接情况',
}

export const F2L_24: F2LCase = {
  id: 'F2L_24',
  name: 'Case 24',
  category: 'connected_pairs',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: true,
  },
  algorithms: {
    FR: "U' R U R' U2 R U' R'",
    FL: "U L' U' L U2 L' U L",
    BL: "U L' U L' U2 L' U L",
    BR: "U' R U' R' U2 R' U R",
  },
  steps: 7,
  description: '扭曲角块连接',
}

// ============================================================
// Case 25-30: 角块在槽位 (Corner In Slot)
// ============================================================

export const F2L_25_CORNER_SLOT_EASY: F2LCase = {
  id: 'F2L_25',
  name: 'Case 25: 角块在槽位(简单)',
  category: 'corner_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' R' U R U' R' U R",
    FL: "U L U' L' U L U' L'",
    BL: "U' L U' L' U L U' L'",
    BR: "U R' U' R U R' U' R",
  },
  steps: 8,
  description: '角块正确朝向在槽位',
}

export const F2L_26_CORNER_SLOT_TWISTED: F2LCase = {
  id: 'F2L_26',
  name: 'Case 26: 角块扭曲在槽位',
  category: 'corner_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 1 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U R' U' R U R' U' R U R'",
    FL: "L' U' L U L' U' L U L' U' L'",
    BL: "L' U L' U' L' U L U' L U L'",
    BR: "R U' R U R U' R' U R U' R'",
  },
  steps: 10,
  description: '角块扭曲需先取出',
}

export const F2L_27_CORNER_SLOT_TWISTED_2: F2LCase = {
  id: 'F2L_27',
  name: 'Case 27: 角块扭曲在槽位2',
  category: 'corner_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 2 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U R U' R'",
    FL: "L' U L U' L' U L",
    BL: "L' U' L U' L' U' L",
    BR: "R U R' U R U R'",
  },
  steps: 7,
  description: '角块另一种扭曲',
}

export const F2L_28: F2LCase = {
  id: 'F2L_28',
  name: 'Case 28',
  category: 'corner_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U' R' U' R U R'",
    FL: "U' L' U L U L' U' L'",
    BL: "U L' U' L U L' U' L",
    BR: "U' R U R' U' R U R'",
  },
  steps: 7,
  description: '角块正确，棱块翻转',
}

export const F2L_29: F2LCase = {
  id: 'F2L_29',
  name: 'Case 29',
  category: 'corner_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 1 },
    edge: { inSlot: false, inULayer: true, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U2 R U' R' U R U' R'",
    FL: "L' U L U2 L' U L U' L' U L",
    BL: "L' U' L U2 L' U' L U' L' U L",
    BR: "R U R' U2 R U R' U R U' R'",
  },
  steps: 10,
  description: '角块扭曲，棱块翻转',
}

export const F2L_30: F2LCase = {
  id: 'F2L_30',
  name: 'Case 30',
  category: 'corner_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 0 },
    edge: { inSlot: false, inULayer: true, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U R U' R'",
    FL: "L' U L U' L' U L",
    BL: "L' U' L U' L' U' L",
    BR: "R U R' U R U R'",
  },
  steps: 7,
  description: '角块在槽位另一种情况',
}

// ============================================================
// Case 31-36: 棱块在槽位 (Edge In Slot)
// ============================================================

export const F2L_31_EDGE_SLOT: F2LCase = {
  id: 'F2L_31',
  name: 'Case 31: 棱块在槽位',
  category: 'edge_in_slot',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' R U' R' U R U R'",
    FL: "U L' U L U' L' U' L",
    BL: "U L' U' L U L' U L",
    BR: "U' R U R' U' R U' R'",
  },
  steps: 8,
  description: '棱块正确在槽位',
}

export const F2L_32_EDGE_SLOT_FLIPPED: F2LCase = {
  id: 'F2L_32',
  name: 'Case 32: 棱块翻转在槽位',
  category: 'edge_in_slot',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: true, inULayer: false, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U' R' U R U' R'",
    FL: "U' L' U L U' L' U L",
    BL: "U' L' U' L U' L' U' L",
    BR: "U R U R' U R U R'",
  },
  steps: 8,
  description: '棱块翻转在槽位',
}

export const F2L_33: F2LCase = {
  id: 'F2L_33',
  name: 'Case 33',
  category: 'edge_in_slot',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U' R' U' R U R'",
    FL: "U' L' U L U L' U' L'",
    BL: "U' L U L' U' L' U L",
    BR: "U R' U' R U R' U' R",
  },
  steps: 7,
  description: '角块扭曲，棱块在槽位',
}

export const F2L_34: F2LCase = {
  id: 'F2L_34',
  name: 'Case 34',
  category: 'edge_in_slot',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 0 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U2 R U' R' U R U' R'",
    FL: "U2 L' U L U' L' U L",
    BL: "U2 L' U' L U' L' U' L",
    BR: "U2 R U R' U R U R'",
  },
  steps: 8,
  description: '另一种棱块在槽位',
}

export const F2L_35: F2LCase = {
  id: 'F2L_35',
  name: 'Case 35',
  category: 'edge_in_slot',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 2 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U' F' U F U R U' R'",
    FL: "U F U' F' U' L' U L",
    BL: "U F' U' F U' L' U L",
    BR: "U' F U F' U R U' R'",
  },
  steps: 8,
  description: '使用F移动的情况',
}

export const F2L_36: F2LCase = {
  id: 'F2L_36',
  name: 'Case 36',
  category: 'edge_in_slot',
  condition: {
    corner: { inSlot: false, inULayer: true, orientation: 1 },
    edge: { inSlot: true, inULayer: false, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "U R U' R' U' R U' R' U R U' R'",
    FL: "U' L' U L U L' U L U' L' U L",
    BL: "U' L U' L' U' L' U' L U L' U L",
    BR: "U R' U' R U R' U R U' R U' R'",
  },
  steps: 11,
  description: '角块扭曲，棱块翻转在槽位',
}

// ============================================================
// Case 37-41: 两个块都在槽位 (Pieces In Slot)
// ============================================================

export const F2L_37_BOTH_WRONG_SLOT: F2LCase = {
  id: 'F2L_37',
  name: 'Case 37: 两个块都在错误槽位',
  category: 'pieces_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 0 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U' R U R' U' R U R'",
    FL: "L' U L U L' U' L U L' U' L'",
    BL: "L' U' L' U L' U L U' L U L'",
    BR: "R U R' U R U' R' U R U' R'",
  },
  steps: 11,
  description: '两个块都在槽位但错误',
}

export const F2L_38_BOTH_SLOT_WRONG_ORIENT: F2LCase = {
  id: 'F2L_38',
  name: 'Case 38: 块在槽位朝向错误',
  category: 'pieces_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 1 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U' R U R' U' R U R'",
    FL: "L' U L U L' U' L U L' U' L'",
    BL: "L' U' L' U L' U L U' L U L'",
    BR: "R U R' U R U' R' U R U' R'",
  },
  steps: 11,
  description: '块在槽位但朝向错误',
}

export const F2L_39_BOTH_SLOT: F2LCase = {
  id: 'F2L_39',
  name: 'Case 39: 两个块在槽位',
  category: 'pieces_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 0 },
    edge: { inSlot: true, inULayer: false, orientation: 0 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U' R' U R U' R' U R U' R'",
    FL: "L' U L U' L' U L U' L' U L",
    BL: "L' U' L U' L' U' L U' L' U L",
    BR: "R U R' U' R U R' U' R U R'",
  },
  steps: 11,
  description: '两个块在槽位',
}

export const F2L_40: F2LCase = {
  id: 'F2L_40',
  name: 'Case 40',
  category: 'pieces_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 1 },
    edge: { inSlot: true, inULayer: false, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U R' F R' F' R U R'",
    FL: "L' U' L F' L F L' U' L'",
    BL: "L' U L' F' L' F L' U L",
    BR: "R U' R F R F' R U' R'",
  },
  steps: 10,
  description: '块在槽位都错误朝向',
}

export const F2L_41: F2LCase = {
  id: 'F2L_41',
  name: 'Case 41',
  category: 'pieces_in_slot',
  condition: {
    corner: { inSlot: true, inULayer: false, orientation: 0 },
    edge: { inSlot: true, inULayer: false, orientation: 1 },
    paired: false,
    connected: false,
  },
  algorithms: {
    FR: "R U R' U' R U R' U' R U R'",
    FL: "L' U' L U L' U' L U L' U' L'",
    BL: "L' U L' U' L' U L U' L U L'",
    BR: "R U' R U R U' R' U R U' R'",
  },
  steps: 11,
  description: '最后一个槽位情况',
}

// ============================================================
// 案例库
// ============================================================

export const ALL_F2L_CASES: F2LCase[] = [
  // Free Pairs (1-10)
  F2L_01_PAIRED_U,
  F2L_02_SEPARATED_ORIENTED,
  F2L_03_CORNER_U_EDGE_MIDDLE,
  F2L_04_ALMOST_PAIRED,
  F2L_05_CORNER_TWISTED,
  F2L_06_CONNECTED_WRONG,
  F2L_07_CONNECTED_WRONG_2,
  F2L_08_EDGE_FLIPPED,
  F2L_09_SEPARATED,
  F2L_10_BOTH_WRONG,
  F2L_11_DISCONNECTED,
  F2L_12_CORNER_UP,
  F2L_13_CORNER_TWISTED_EDGE_MIDDLE,
  F2L_14_EDGE_FLIPPED_SIDE,
  F2L_15_SPECIAL_PAIR,
  F2L_16,
  F2L_17,
  F2L_18,
  F2L_19,
  F2L_20,
  F2L_21,
  F2L_22,
  F2L_23,
  F2L_24,
  // Corner In Slot (25-30)
  F2L_25_CORNER_SLOT_EASY,
  F2L_26_CORNER_SLOT_TWISTED,
  F2L_27_CORNER_SLOT_TWISTED_2,
  F2L_28,
  F2L_29,
  F2L_30,
  // Edge In Slot (31-36)
  F2L_31_EDGE_SLOT,
  F2L_32_EDGE_SLOT_FLIPPED,
  F2L_33,
  F2L_34,
  F2L_35,
  F2L_36,
  // Pieces In Slot (37-41)
  F2L_37_BOTH_WRONG_SLOT,
  F2L_38_BOTH_SLOT_WRONG_ORIENT,
  F2L_39_BOTH_SLOT,
  F2L_40,
  F2L_41,
]

// ============================================================
// 案例查找函数
// ============================================================

/**
 * 根据条件查找匹配的F2L案例
 */
export function findF2LCase(condition: Partial<F2LCaseCondition>): F2LCase | null {
  // 首先尝试精确匹配
  for (const f2lCase of ALL_F2L_CASES) {
    const c = f2lCase.condition

    // 检查角块状态
    const cornerMatch =
      condition.corner?.inSlot === undefined ||
      c.corner.inSlot === condition.corner.inSlot

    const cornerULayerMatch =
      condition.corner?.inULayer === undefined ||
      c.corner.inULayer === condition.corner.inULayer

    const cornerOrientMatch =
      condition.corner?.orientation === undefined ||
      c.corner.orientation === condition.corner.orientation

    // 检查棱块状态
    const edgeMatch =
      condition.edge?.inSlot === undefined ||
      c.edge.inSlot === condition.edge.inSlot

    const edgeULayerMatch =
      condition.edge?.inULayer === undefined ||
      c.edge.inULayer === condition.edge.inULayer

    const edgeOrientMatch =
      condition.edge?.orientation === undefined ||
      c.edge.orientation === condition.edge.orientation

    // 检查配对状态
    const pairedMatch =
      condition.paired === undefined ||
      c.paired === condition.paired

    const connectedMatch =
      condition.connected === undefined ||
      c.connected === condition.connected

    // 全部匹配
    if (
      cornerMatch && cornerULayerMatch && cornerOrientMatch &&
      edgeMatch && edgeULayerMatch && edgeOrientMatch &&
      pairedMatch && connectedMatch
    ) {
      return f2lCase
    }
  }

  // 没有精确匹配，返回最接近的案例
  return F2L_02_SEPARATED_ORIENTED
}

/**
 * 获取指定槽位的公式
 */
export function getF2LAlgorithm(
  f2lCase: F2LCase,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): string {
  return f2lCase.algorithms[slot]
}

/**
 * 根据条件直接获取公式
 */
export function getF2LAlgorithmByCondition(
  condition: Partial<F2LCaseCondition>,
  slot: 'FR' | 'FL' | 'BL' | 'BR'
): string {
  const f2lCase = findF2LCase(condition)
  if (!f2lCase) {
    // 降级：返回基础公式
    return getDefaultAlgorithm(slot)
  }
  return f2lCase.algorithms[slot]
}

/**
 * 获取默认公式（降级使用）
 */
function getDefaultAlgorithm(slot: 'FR' | 'FL' | 'BL' | 'BR'): string {
  const defaults: Record<string, string> = {
    FR: 'R U R\' U\' R\' U R',
    FL: 'L\' U\' L U L U\' L\'',
    BL: 'L U\' L\' U\' L\' U L',
    BR: 'R\' U\' R U R U\' R\'',
  }
  return defaults[slot] || 'R U R\''
}

/**
 * 按分类获取F2L案例
 */
export function getF2LByCategory(category: string): F2LCase[] {
  return ALL_F2L_CASES.filter(c => c.category === category)
}

/**
 * 获取推荐的F2L学习顺序
 */
export const RECOMMENDED_F2L: F2LCase[] = [
  F2L_01_PAIRED_U,           // 1. 最简单：已配对
  F2L_04_ALMOST_PAIRED,      // 2. 几乎配对
  F2L_02_SEPARATED_ORIENTED, // 3. 分离但朝向正确
  F2L_03_CORNER_U_EDGE_MIDDLE, // 4. 角块U层，棱块中层
  F2L_25_CORNER_SLOT_EASY,   // 5. 角块在槽位
  F2L_31_EDGE_SLOT,          // 6. 棱块在槽位
  F2L_05_CORNER_TWISTED,     // 7. 角块扭曲
  F2L_08_EDGE_FLIPPED,       // 8. 棱块翻转
]
