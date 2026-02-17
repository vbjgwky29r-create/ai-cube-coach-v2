/**
 * 魔方核心常量 - 死命令，永远不可修改！
 *
 * 标准配色：白顶绿前 (White Top, Green Front)
 * - U (上): 白色
 * - D (下): 黄色
 * - F (前): 绿色
 * - B (后): 蓝色
 * - L (左): 橙色
 * - R (右): 红色
 *
 * 此文件定义了魔方的所有基础知识，任何修改都必须经过严格验证！
 */

// ============================================================
// CFOP 复原层次 - 死命令！
// ============================================================

/**
 * CFOP四个���段
 *
 * 魔方复原分为4个阶段，按顺序执行：
 *
 * | 阶段 | 名称 | 复原内容 | 说明 |
 * |------|------|----------|------|
 * | C | Cross | 底层十字 | D面4个棱块归位 |
 * | F2L | First Two Layers | 前两层 | D层4角块 + 中层4棱块 |
 * | OLL | Orientation of Last Layer | 顶层朝向 | U面颜色统一 |
 * | PLL | Permutation of Last Layer | 顶层排列 | U面归位 |
 *
 * **重要**：F2L完成 = 前两层完成！不是第三层！
 */
export const CFOP_STAGES = {
  /** 阶段C: Cross - 底层十字 */
  CROSS: {
    name: 'Cross（十字）',
    description: 'D面4个棱块归位',
    completes: '第1层的棱块',
    layer: 1,
  },
  /** 阶段F2L: 前两层 */
  F2L: {
    name: 'F2L（前两层）',
    description: 'D层4角块 + 中层4棱块',
    completes: '第1层角块 + 第2层棱块',
    layer: 2,
    /** F2L完成后 = 前2层全部完成！ */
    result: '前两层复原完成',
  },
  /** 阶段OLL: 顶层朝向 */
  OLL: {
    name: 'OLL（顶层朝向）',
    description: 'U面颜色统一（全部朝上）',
    completes: '顶层朝向',
    layer: 3,
  },
  /** 阶段PLL: 顶层排列 */
  PLL: {
    name: 'PLL（顶层排列）',
    description: 'U面角块和棱块归位',
    completes: '顶层排列',
    layer: 4,
    /** PLL完成 = 魔方全部复原！ */
    result: '魔方复原完成',
  },
} as const

/**
 * F2L的正确定义
 *
 * **死命令**：F2L = First Two Layers = 前两层！
 *
 * F2L完成的状态：
 * 1. D面（底层）：中心 + 4个棱块 + 4个角块全部正确
 * 2. 中层（E层）：4个棱块全部正确
 * 3. U面（顶层）：未完成
 *
 * **F2L槽位**：4个槽位，每个槽位包含1个D层角块 + 1个中层棱块
 * - FR槽：DFR角块 + FR棱块
 * - FL槽：DFL角块 + FL棱块
 * - BL槽：DBL角块 + BL棱块
 * - BR槽：DBR角块 + BR棱块
 *
 * **F2L完成后**：
 * - 前2层（D层+中层）100%正确
 * - U层（顶层）无关，仍然混乱
 */
export const F2L_DEFINITION = {
  /** F2L = 前两层，不是第三层！ */
  LAYERS: 'F2L = First 2 Layers (前两层)',
  /** 包含D层角块和中层棱块 */
  INCLUDES: 'D层4角块 + 中层4棱块',
  /** F2L完成后前两层100%正确 */
  COMPLETES: '前两层复原完成',
  /** U层状态无关 */
  U_LAYER_IRRELEVANT: 'F2L不关心U层状态',
} as const

// ============================================================
// 标准配色方案 - 白顶绿前
// ============================================================

/**
 * 标准颜色定义
 */
export const COLORS = {
  /** U面颜色 - 白色 */
  U: 'U',
  /** D面颜色 - 黄色 */
  D: 'D',
  /** F面颜色 - 绿色 */
  F: 'F',
  /** B面颜色 - 蓝色 */
  B: 'B',
  /** L面颜色 - 橙色 */
  L: 'L',
  /** R面颜色 - 红色 */
  R: 'R',
} as const

// ============================================================
// cubejs 索引映射
// ============================================================

/**
 * cubejs asString() 返回的 54 字符字符串的索引映射
 *
 * cubejs 格式: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
 * - U: 0-8, 中心: 4
 * - R: 9-17, 中心: 13
 * - F: 18-26, 中心: 22
 * - D: 27-35, 中心: 31
 * - L: 36-44, 中心: 40
 * - B: 45-53, 中心: 49
 */
export const CUBEJS_INDICES = {
  U: [0, 1, 2, 3, 4, 5, 6, 7, 8] as const,
  R: [9, 10, 11, 12, 13, 14, 15, 16, 17] as const,
  F: [18, 19, 20, 21, 22, 23, 24, 25, 26] as const,
  D: [27, 28, 29, 30, 31, 32, 33, 34, 35] as const,
  L: [36, 37, 38, 39, 40, 41, 42, 43, 44] as const,
  B: [45, 46, 47, 48, 49, 50, 51, 52, 53] as const,
} as const

export const CENTER_INDICES = {
  U: 4, R: 13, F: 22, D: 31, L: 40, B: 49,
} as const

export type FaceName = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

// ============================================================
// 棱块索引
// ============================================================

export const EDGE_INDICES = {
  // U层棱块
  UF: [7, 19] as const,
  UR: [5, 10] as const,
  UB: [1, 46] as const,
  UL: [3, 37] as const,
  // 中层棱块
  FR: [23, 12] as const,
  FL: [21, 41] as const,
  BL: [39, 47] as const,
  BR: [48, 14] as const,
  // D层棱块 (Cross)
  DF: [28, 25] as const,
  DL: [30, 43] as const,
  DB: [34, 52] as const,
  DR: [32, 16] as const,
} as const

export type EdgeName = keyof typeof EDGE_INDICES

// ============================================================
// 角块索引
// ============================================================

export const CORNER_INDICES = {
  // U层角块
  URF: [8, 20, 9] as const,
  UFL: [6, 18, 38] as const,
  ULB: [0, 36, 47] as const,
  UBR: [2, 45, 11] as const,
  // D层角块 (F2L槽位)
  DFR: [29, 26, 15] as const,
  DFL: [27, 44, 24] as const,
  DBL: [33, 42, 53] as const,
  DBR: [35, 51, 17] as const,
} as const

export type CornerName = keyof typeof CORNER_INDICES

// ============================================================
// F2L槽位定义
// ============================================================

export type Slot = 'FR' | 'FL' | 'BL' | 'BR'

export const SLOTS: Record<Slot, {
  corner: CornerName
  cornerIndices: readonly [number, number, number]
  edge: EdgeName
  edgeIndices: readonly [number, number]
  cornerColors: readonly [string, string, string]
  edgeColors: readonly [string, string]
}> = {
  FR: {
    corner: 'DFR',
    cornerIndices: [29, 26, 15],
    edge: 'FR',
    edgeIndices: [23, 12],
    cornerColors: [COLORS.D, COLORS.F, COLORS.R],
    edgeColors: [COLORS.F, COLORS.R],
  },
  FL: {
    corner: 'DFL',
    cornerIndices: [27, 44, 24],
    edge: 'FL',
    edgeIndices: [21, 41],
    cornerColors: [COLORS.D, COLORS.L, COLORS.F],
    edgeColors: [COLORS.F, COLORS.L],
  },
  BL: {
    corner: 'DBL',
    cornerIndices: [33, 42, 53],
    edge: 'BL',
    edgeIndices: [39, 47],
    cornerColors: [COLORS.D, COLORS.L, COLORS.B],
    edgeColors: [COLORS.L, COLORS.B],
  },
  BR: {
    corner: 'DBR',
    cornerIndices: [35, 51, 17],
    edge: 'BR',
    edgeIndices: [48, 14],
    cornerColors: [COLORS.D, COLORS.B, COLORS.R],
    edgeColors: [COLORS.B, COLORS.R],
  },
} as const

// ============================================================
// Cross 检查
// ============================================================

export const CROSS_EDGES = {
  DF: { dIndex: 28, dColor: COLORS.D, sideIndex: 25, sideColor: COLORS.F },
  DL: { dIndex: 30, dColor: COLORS.D, sideIndex: 43, sideColor: COLORS.L },
  DB: { dIndex: 34, dColor: COLORS.D, sideIndex: 52, sideColor: COLORS.B },
  DR: { dIndex: 32, dColor: COLORS.D, sideIndex: 16, sideColor: COLORS.R },
} as const

export function checkCrossComplete(state: string): boolean {
  return (
    state[CROSS_EDGES.DF.dIndex] === CROSS_EDGES.DF.dColor &&
    state[CROSS_EDGES.DF.sideIndex] === CROSS_EDGES.DF.sideColor &&
    state[CROSS_EDGES.DL.dIndex] === CROSS_EDGES.DL.dColor &&
    state[CROSS_EDGES.DL.sideIndex] === CROSS_EDGES.DL.sideColor &&
    state[CROSS_EDGES.DB.dIndex] === CROSS_EDGES.DB.dColor &&
    state[CROSS_EDGES.DB.sideIndex] === CROSS_EDGES.DB.sideColor &&
    state[CROSS_EDGES.DR.dIndex] === CROSS_EDGES.DR.dColor &&
    state[CROSS_EDGES.DR.sideIndex] === CROSS_EDGES.DR.sideColor
  )
}

// ============================================================
// F2L槽位检查
// ============================================================

/**
 * 检查单个F2L槽位是否完成
 *
 * 槽位完成的条件：
 * 1. 角块在正确位置，D面朝下
 * 2. 棱块在正确位置
 * 3. 角块和棱块颜色匹配
 *
 * @param state - cubejs asString() 状态
 * @param slot - 槽位名称
 * @returns 槽位是否完成
 */
export function checkF2LSlot(state: string, slot: Slot): boolean {
  const slotData = SLOTS[slot]

  // 检查角块
  const cornerColors =
    state[slotData.cornerIndices[0]] +
    state[slotData.cornerIndices[1]] +
    state[slotData.cornerIndices[2]]
  const cornerMatch = cornerColors.split('').sort().join('') ===
    slotData.cornerColors.slice().sort().join('')
  const cornerOriented = state[slotData.cornerIndices[0]] === COLORS.D

  // 检查棱块
  const edgeColors =
    state[slotData.edgeIndices[0]] +
    state[slotData.edgeIndices[1]]
  const edgeMatch = edgeColors.split('').sort().join('') ===
    slotData.edgeColors.slice().sort().join('')

  return cornerMatch && edgeMatch && cornerOriented
}

/**
 * 检查F2L是否完成（前两层是否完成）
 *
 * F2L完成 = 4个槽位都完成
 *
 * @param state - cubejs asString() 状态
 * @returns F2L是否完成
 */
export function checkF2LComplete(state: string): boolean {
  return (
    checkF2LSlot(state, 'FR') &&
    checkF2LSlot(state, 'FL') &&
    checkF2LSlot(state, 'BL') &&
    checkF2LSlot(state, 'BR')
  )
}

// ============================================================
// 魔方基本定理
// ============================================================

/**
 * 定理1: F2L过程定理
 *
 * **陈述**：F2L公式在执行过程中**可能暂时破坏Cross**，但完成后**必须恢复Cross**
 *
 * **原因**：
 * - F2L操作主要涉及U层和两个侧面（如R/F面）
 * - 为了配对和插入，有时需要转动D层侧面，这会暂时影响Cross
 * - 但所有标准F2L公式都是精心设计的，最终会恢复Cross
 *
 * **验证方法**：
 * - 不要在F2L过程中间检查Cross！
 * - 只在F2L公式执行完成后检查Cross完整性
 *
 * **反例警告**：
 * - 如果F2L完成后Cross被破坏，说明公式应用错误
 * - 如果在F2L过程中发现Cross被"破坏"，这是正常现象！
 */
export const F2L_THEOREM = {
  PROCESS_MAY_DESTROY: 'F2L过程中Cross可能被暂时破坏',
  FINAL_MUST_RESTORE: 'F2L完成后Cross必须完整',
  DONTCHECK_DURING: '不要在F2L执行过程中检查Cross',
} as const

/**
 * 定理2: 基础公式复原定理
 *
 * R R' = 恒等, (R U R' U')^6 = 恒等
 */
export const BASIC_FORMULA_THEOREM = {
  INVERSE_PAIRS: {
    'R': "R'", 'R\'': 'R',
    'L': "L'", 'L\'': 'L',
    'U': "U'", 'U\'': 'U',
    'D': "D'", 'D\'': 'D',
    'F': "F'", 'F\'': 'F',
    'B': "B'", 'B\'': 'B',
  } as const,
  FOUR_ROTATIONS_IDENTITY: 'R4 = L4 = U4 = D4 = F4 = B4 = 恒等',
  SIX_SEXY_MOVES: '(R U R\' U\') × 6 = 恒等',
} as const

/**
 * 定理3: F2L三步法
 *
 * **陈述**：F2L求解的三个步骤
 *
 * 1. **提取**：把角块和棱块都带到U层
 *    - 如果块在槽位，用 R U R' 或 L' U' L 等提取
 *    - 如果块在其他槽位，先提取出来再带到U层
 *
 * 2. **配对**：在U层把角块和棱块配对（相邻且颜色匹配）
 *    - 配对条件：角块和棱块在U层相邻
 *    - 如：角块URF与棱块UF相邻
 *
 * 3. **插入**：把配对好的对子一起插入槽位
 *    - 标准插入：R U R'、L' U' L等
 *    - 带setup的插入：U R U' R'等
 */
export const F2L_THREE_STEPS = {
  STEP1_EXTRACT: '提取：把块带到U层',
  STEP2_PAIR: '配对：在U层配对',
  STEP3_INSERT: '插入：插入到槽位',
} as const

/**
 * 定理4: 十字不变性定理
 *
 * **陈述**：Cross完成后，U层和D层转动不破坏Cross
 *
 * **安全操作**（不破坏Cross）：
 * - U层任何转动（U, U', U2）
 * - D层任何转动（D, D', D2）
 *
 * **危险操作**（会破坏Cross）：
 * - F, B, L, R 的单次转动
 *
 * **F2L公式的特殊性**：
 * - F2L公式虽然暂时破坏，最终会恢复Cross
 * - 这是F2L公式设计的核心原理
 */
export const CROSS_INVARIANCE = {
  SAFE_MOVES: 'U层和D层转动不破坏Cross',
  F2L_RESTORES_CROSS: 'F2L公式最终恢复Cross',
  CHECK_FINAL_ONLY: '只检查最终状态',
} as const

/**
 * 定理5: 块的身份不变定理
 *
 * 每个块的颜色组合永远不变，只改变位置
 * - UR棱 = 白+红（永远不变）
 * - UF棱 = 白+绿（永远不变）
 * - URF角 = 白+红+绿（永远不变）
 */
export const PIECE_IDENTITY = {
  COLOR_COMBINATION_FIXED: '每个块的颜色组合永远不变',
  ONLY_POSITION_CHANGES: '块只改变位置，不改变身份',
} as const

/**
 * 定理6: 块位置与朝向分离定理
 *
 * 块的状态 = 位置 + 朝向，两者独立
 * - 好朝向：可以用U2或简单调整
 * - 坏朝向：需要更多步骤
 */
export const PIECE_ORIENTATION = {
  POSITION_SEPARATE_FROM_ORIENTATION: '块状态 = 位置 + 朝向',
  ORIENTATION_AFFECTS_DIFFICULTY: '朝向影响F2L求解步骤数',
} as const

/**
 * 定理7: U层工作区定理
 *
 * U层是F2L的安全工作区
 * - U层转动不破坏Cross
 * - 任何块都可以提取到U层
 * - 在U层配对后插入槽位
 */
export const U_LAYER_WORKSPACE = {
  U_IS_SAFE: 'U层转动不破坏Cross',
  ALL_PIECES_TO_U: '任何块都可以提取到U层',
  F2L_THREE_STEPS: '提取 -> 配对 -> 插入',
} as const

// ============================================================
// 辅助函数
// ============================================================

export function getFaceColor(state: string, face: FaceName): string {
  return state[CENTER_INDICES[face]]
}

export function getFaceOrientation(state: string): {
  whiteFace: FaceName
  yellowFace: FaceName
  greenFace: FaceName
  blueFace: FaceName
  orangeFace: FaceName
  redFace: FaceName
} {
  // 返回标准朝向的映射
  return {
    whiteFace: 'U',
    yellowFace: 'D',
    greenFace: 'F',
    blueFace: 'B',
    orangeFace: 'L',
    redFace: 'R',
  }
}
