/**
 * PLL (Permutation of Last Layer) 公式库
 *
 * 21种PLL情况，按角块/棱块排列模式分类
 *
 * 分类：
 * - Edges Only (只换棱): 4种 (Ua, Ub, H, Z)
 * - Corners Only (只换角): 2种 (Aa, Ab - 其实还有更多变体)
 * - Both (角棱都换): 15种 (T, Y, F, R, J, Nb, V, Ga/Gb/Gc/Gd)
 */

export interface PLLCase {
  id: string           // 如 "PLL_T", "PLL_Ua"
  name: string         // 如 "T-Perm", "U-Perm"
  category: string     // 分类: edges, corners, both, special
  algorithm: string    // 主公式
  algorithmAlt?: string // 替代公式
  description?: string // 描述
}

/**
 * PLL - T类
 */
export const PLL_T: PLLCase = {
  id: 'PLL_T',
  name: 'T-Perm',
  category: 'both',
  algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
  description: 'T形交换，最常用的PLL之一'
}

/**
 * PLL - Y类
 */
export const PLL_Y: PLLCase = {
  id: 'PLL_Y',
  name: 'Y-Perm',
  category: 'both',
  algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  description: 'Y形交换'
}

/**
 * PLL - U类 (只换棱)
 */
export const PLL_Ua: PLLCase = {
  id: 'PLL_Ua',
  name: 'U-Perm (a)',
  category: 'edges',
  algorithm: "R U' R U R U R U' R' U' R2",
  description: 'U形顺时针换棱'
}

export const PLL_Ub: PLLCase = {
  id: 'PLL_Ub',
  name: 'U-Perm (b)',
  category: 'edges',
  algorithm: "R2 U R U R' U' R' U' R' U R'",
  description: 'U形逆时针换棱'
}

/**
 * PLL - H类 (只换棱)
 */
export const PLL_H: PLLCase = {
  id: 'PLL_H',
  name: 'H-Perm',
  category: 'edges',
  algorithm: "M2 U M2 U2 M2 U M2",
  description: 'H形换棱，相对棱块交换'
}

/**
 * PLL - Z类 (只换棱)
 */
export const PLL_Z: PLLCase = {
  id: 'PLL_Z',
  name: 'Z-Perm',
  category: 'edges',
  algorithm: "M2 U M2 U M' U2 M2 U2 M'",
  description: 'Z形换棱，相邻棱块交换'
}

/**
 * PLL - J类
 */
export const PLL_Ja: PLLCase = {
  id: 'PLL_Ja',
  name: 'J-Perm (a)',
  category: 'both',
  algorithm: "R' U L' U2 R U' R' U2 R L",
  description: 'J形交换a'
}

export const PLL_Jb: PLLCase = {
  id: 'PLL_Jb',
  name: 'J-Perm (b)',
  category: 'both',
  algorithm: "L U' R U2 L' U L' U2 L R'",
  description: 'J形交换b'
}

/**
 * PLL - F类
 */
export const PLL_F: PLLCase = {
  id: 'PLL_F',
  name: 'F-Perm',
  category: 'both',
  algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
  description: 'F形交换，需要旋转判断'
}

/**
 * PLL - R类
 */
export const PLL_Ra: PLLCase = {
  id: 'PLL_Ra',
  name: 'R-Perm (a)',
  category: 'both',
  algorithm: "R U' R U R U R U' R' U' R2",
  description: 'R形交换a'
}

export const PLL_Rb: PLLCase = {
  id: 'PLL_Rb',
  name: 'R-Perm (b)',
  category: 'both',
  algorithm: "R2 U R U R' U' R' U' R' U R' U R2",
  description: 'R形交换b'
}

/**
 * PLL - V类
 */
export const PLL_V: PLLCase = {
  id: 'PLL_V',
  name: 'V-Perm',
  category: 'both',
  algorithm: "R' U R' U' R' U' R' U R U R2",
  description: 'V形交换'
}

/**
 * PLL - N类
 */
export const PLL_Na: PLLCase = {
  id: 'PLL_Na',
  name: 'N-Perm (a)',
  category: 'both',
  algorithm: "R U R' U R U R' U' R' U R U R2 U' R' U'",
  description: 'N形交换a'
}

export const PLL_Nb: PLLCase = {
  id: 'PLL_Nb',
  name: 'N-Perm (b)',
  category: 'both',
  algorithm: "R' U R U' R U' R' U R U R' U' R U' R2",
  description: 'N形交换b'
}

/**
 * PLL - A类 (只换角)
 */
export const PLL_Aa: PLLCase = {
  id: 'PLL_Aa',
  name: 'A-Perm (a)',
  category: 'corners',
  algorithm: "R' U R' D2 R U' R' D2 R2",
  description: 'A形交换a（左侧）'
}

export const PLL_Ab: PLLCase = {
  id: 'PLL_Ab',
  name: 'A-Perm (b)',
  category: 'corners',
  algorithm: "R2 D2 R U R' D2 R U' R",
  description: 'A形交换b（右侧）'
}

/**
 * PLL - G类
 */
export const PLL_Ga: PLLCase = {
  id: 'PLL_Ga',
  name: 'G-Perm (a)',
  category: 'both',
  algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'",
  description: 'G形交换a'
}

export const PLL_Gb: PLLCase = {
  id: 'PLL_Gb',
  name: 'G-Perm (b)',
  category: 'both',
  algorithm: "R' U' R U' R U R U' R' U' D' R U R' U D",
  description: 'G形交换b'
}

export const PLL_Gc: PLLCase = {
  id: 'PLL_Gc',
  name: 'G-Perm (c)',
  category: 'both',
  algorithm: "R2 U R' U R' U' R U' R2 D' R U R' U' D",
  description: 'G形交换c'
}

export const PLL_Gd: PLLCase = {
  id: 'PLL_Gd',
  name: 'G-Perm (d)',
  category: 'both',
  algorithm: "R' U' R U' R U R U' R' D R U R' U' R' D'",
  description: 'G形交换d'
}

/**
 * PLL - E类 (特殊)
 */
export const PLL_E: PLLCase = {
  id: 'PLL_E',
  name: 'E-Perm',
  category: 'special',
  algorithm: "R' U' R U' R' U' R' U R U R2",
  description: 'E形交换，所有角块旋转'
}

/**
 * 所有PLL公式汇总
 */
export const ALL_PLL_CASES: PLLCase[] = [
  PLL_T,
  PLL_Y,
  PLL_Ua,
  PLL_Ub,
  PLL_H,
  PLL_Z,
  PLL_Ja,
  PLL_Jb,
  PLL_F,
  PLL_Ra,
  PLL_Rb,
  PLL_V,
  PLL_Na,
  PLL_Nb,
  PLL_Aa,
  PLL_Ab,
  PLL_Ga,
  PLL_Gb,
  PLL_Gc,
  PLL_Gd,
  PLL_E,
]

/**
 * 通过ID查找PLL公式
 */
export function findPLLById(id: string): PLLCase | undefined {
  return ALL_PLL_CASES.find(c => c.id === id || c.id === `PLL_${id}`)
}

/**
 * 获取常用的PLL公式（学习建议 - 按优先级）
 */
export const RECOMMENDED_PLL: PLLCase[] = [
  PLL_Ua,        // 1. U-Perm - 只换棱，简单
  PLL_Ub,        // 2. U-Perm 逆
  PLL_T,         // 3. T-Perm - 最常用
  PLL_Ja,        // 4. J-Perm
  PLL_H,         // 5. H-Perm
  PLL_Y,         // 6. Y-Perm
  PLL_Aa,        // 7. A-Perm - 只换角
  PLL_Ab,        // 8. A-Perm 逆
]

/**
 * 按分类获取PLL公式
 */
export function getPLLByCategory(category: string): PLLCase[] {
  return ALL_PLL_CASES.filter(c => c.category === category)
}
