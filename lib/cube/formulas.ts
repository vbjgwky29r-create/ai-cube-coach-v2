/**
 * 高阶魔方公式库 - 完整版
 *
 * 包含:
 * - PLL: 21个
 * - OLL: 57个
 * - COLL: 40个
 * - ZBLL: 493个
 * - VLS: 216个
 *
 * 参考:
 * - PLL: https://www.cubeskills.com/uploads/pdf/tutorials/pll-algorithms.pdf
 * - OLL: https://www.cubeskills.com/uploads/pdf/tutorials/oll-algorithms.pdf
 * - COLL: https://jperm.net/algs/coll
 * - ZBLL: https://cuberoot.me/wp-content/uploads/2019/10/167-ZBLL.pdf
 * - VLS: https://www.cubeskills.com/uploads/pdf/tutorials/easy-vls-algorithms.pdf
 */

import type { Move } from './parser'

export enum FormulaCategory {
  CROSS = 'CROSS',
  F2L = 'F2L',
  OLL = 'OLL',
  PLL = 'PLL',
  COLL = 'COLL',
  ZBLL = 'ZBLL',
  ZBLS = 'ZBLS',
  VLS = 'VLS',
  TRICKS = 'TRICKS',
  OTHER = 'OTHER',
}

export enum FormulaMethod {
  CFOP = 'CFOP',           // Cross → F2L → OLL → PLL
  CFOP_ROUX = 'CFOP-Roux', // CFOP + Roux hybrid
  ZZ = 'ZZ',               // ZBorowski-Bruchem
  ROUX = 'Roux',           // Roux method
  PETRUS = 'Petrus',       // Petrus method
}

export interface Formula {
  id: string
  name: string
  notation: string
  category: FormulaCategory
  method: FormulaMethod    // 属于哪个方法体系
  difficulty: number        // 1-5
  moves: number            // 步数
  explanation: string
  tips?: string
  whenToUse?: string
  recognition?: string      // 识别特征
  // 用于模糊匹配
  searchKeys: string[]
}

// ============================================
// PLL - 21个公式 (Permutation of Last Layer)
// ============================================

export const PLL_ALGORITHMS: Formula[] = [
  // T-Perm
  {
    id: 'pll_t',
    name: 'T-Perm',
    notation: "R U R' U' R' F R2 U' R' U' R U R' F'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 14,
    explanation: '交换对角的两个角块和相邻的两个棱块',
    recognition: '顶面有两对相邻相同颜色，前面一对相同',
    tips: '注意最后的F\'，常见错误是转错方向',
    searchKeys: ['t', 't-perm', 'pll', '交换'],
  },
  // U-Perm (a) - 顺时针
  {
    id: 'pll_ua',
    name: 'U-Perm (a)',
    notation: "R U' R U R U R U' R' U' R2",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: '顺时针循环三个棱块',
    recognition: '顶面已还原，侧面看有三个块需要顺时针循环',
    tips: '做一次后检查，如果方向不对就用U-Perm (b)',
    searchKeys: ['u', 'u-perm', 'ua', '顺时针', 'pll', '循环'],
  },
  // U-Perm (b) - 逆时针
  {
    id: 'pll_ub',
    name: 'U-Perm (b)',
    notation: "R2 U R U R' U' R' U' R' U R'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: '逆时针循环三个棱块',
    recognition: '顶面已还原，侧面看有三个块需要逆时针循环',
    tips: 'U-Perm (a) 的逆公式',
    searchKeys: ['u', 'u-perm', 'ub', '逆时针', 'pll', '循环'],
  },
  // H-Perm
  {
    id: 'pll_h',
    name: 'H-Perm',
    notation: "M2 U M2 U2 M2 U M2",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: '交换相对的两对棱块',
    recognition: '顶面有4个相同颜色的块呈十字形，或两对相对的相同色',
    tips: '需要掌握M层转动，M是中间层',
    searchKeys: ['h', 'h-perm', 'pll', '相对', 'm2'],
  },
  // Z-Perm
  {
    id: 'pll_z',
    name: 'Z-Perm',
    notation: "M2 U M2 U M' U2 M2 U2 M'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: '交换相邻的两对棱块',
    recognition: '顶面有两对相邻的相同颜色',
    tips: '注意M\'的方向',
    searchKeys: ['z', 'z-perm', 'pll', '相邻', 'm2'],
  },
  // J-Perm (a)
  {
    id: 'pll_ja',
    name: 'J-Perm (a)',
    notation: "R' U L' U2 R U' R' D2 R D'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: '交换两个相邻的角块和两个相邻的棱块',
    recognition: '前面有两个相同颜色的块对角分布',
    tips: '角块在前左或前右位置',
    searchKeys: ['j', 'j-perm', 'pll'],
  },
  // J-Perm (b)
  {
    id: 'pll_jb',
    name: 'J-Perm (b)',
    notation: "R U R' F' R U R' U' R' F R2 U' R'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'J-Perm的另一种形式',
    recognition: '识别后使用',
    searchKeys: ['j', 'j-perm', 'pll'],
  },
  // F-Perm
  {
    id: 'pll_f',
    name: 'F-Perm',
    notation: "R' U' R U R U' R' F' R U R' U' R' F R2 U' R' U'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 16,
    explanation: '交换两个相邻的角块和两个相邻的棱块（与J类似）',
    recognition: '前面有两个相同颜色的块对角分布',
    searchKeys: ['f', 'f-perm', 'pll'],
  },
  // R-Perm
  {
    id: 'pll_r',
    name: 'R-Perm (a)',
    notation: "R' U R' U' R U R' F' R U R' F' R' U2 R2",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: '交换两对相邻的角块和棱块',
    recognition: '右侧有一个1x2的块',
    searchKeys: ['r', 'r-perm', 'pll'],
  },
  // R-Perm (b)
  {
    id: 'pll_rb',
    name: 'R-Perm (b)',
    notation: "R2 U' R' U R' F' R U R' F' R' U2 R",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'R-Perm的另一种形式',
    searchKeys: ['r', 'r-perm', 'pll'],
  },
  // A-Perm (a)
  {
    id: 'pll_aa',
    name: 'A-Perm (a)',
    notation: "x R' U R' D' R D R U R' U2 x'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '交换对角交换两个棱块',
    recognition: '有两个1x2的条形块，且呈对角分布',
    tips: '需要整体旋转x来识别',
    searchKeys: ['a', 'a-perm', 'pll', 'x'],
  },
  // A-Perm (b)
  {
    id: 'pll_ab',
    name: 'A-Perm (b)',
    notation: "x' R' U R' D' R D R U' R' U2 x'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'A-Perm的另一种形式',
    searchKeys: ['a', 'a-perm', 'pll', 'x'],
  },
  // Ga-Perm
  {
    id: 'pll_ga',
    name: 'Ga-Perm',
    notation: "R2 D' R U R' D' R2",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: '交换两个角块和相邻的棱块',
    recognition: '前面底部有一个1x2块',
    searchKeys: ['ga', 'ga-perm', 'pll'],
  },
  // Gb-Perm
  {
    id: 'pll_gb',
    name: 'Gb-Perm',
    notation: "R2 U' R' U R2 U' R' U' R",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: '交换两个角块和相邻的棱块',
    recognition: '前面顶部有一个1x2块',
    searchKeys: ['gb', 'gb-perm', 'pll'],
  },
  // Gc-Perm
  {
    id: 'pll_gc',
    name: 'Gc-Perm',
    notation: "F' U' R U' R' F' R U R' U2 R U'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '交换两个角块和相邻的棱块',
    recognition: '前面左侧有一个1x2块',
    searchKeys: ['gc', 'gc-perm', 'pll'],
  },
  // Gd-Perm
  {
    id: 'pll_gd',
    name: 'Gd-Perm',
    notation: "F U' R U' R' F' R' U' R U2 R",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: '交换两个角块和相邻的棱块',
    recognition: '前面右侧有一个1x2块',
    searchKeys: ['gd', 'gd-perm', 'pll'],
  },
  // E-Perm
  {
    id: 'pll_e',
    name: 'E-Perm',
    notation: "x' R U R' D' R' U R' D' R2 x'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '交换两组相对的角块和棱块（相邻）',
    recognition: '所有棱块都错位，没有相同色对',
    searchKeys: ['e', 'e-perm', 'pll', '最复杂'],
  },
  // V-Perm
  {
    id: 'pll_v',
    name: 'V-Perm',
    notation: "R' U R' U' d R' U' R' d' R2",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '交换两组相对的角块和棱块（相邻）',
    recognition: '顶面有一个V字形',
    tips: 'd代表双层转动',
    searchKeys: ['v', 'v-perm', 'pll'],
  },
  // Y-Perm
  {
    id: 'pll_y',
    name: 'Y-Perm (F)',
    notation: "F R U' R' U' R' U R' F' R U R' U' R' U' R' F'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 17,
    explanation: '交换两个相邻的角块和棱块',
    recognition: '前面呈Y字形，或有一对相同色',
    tips: '标准公式较长，可以用更短的变种',
    searchKeys: ['y', 'y-perm', 'pll', 'fruf'],
  },
  // Y-Perm (mirror)
  {
    id: 'pll_y_mirror',
    name: 'Y-Perm (B)',
    notation: "F' U' L' U L' U L' U' L' F' L' U' L' U L' U L' U' L' F'",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 17,
    explanation: 'Y-Perm的镜像公式',
    recognition: '后面呈Y字形',
    searchKeys: ['y', 'y-perm', 'pll', '镜像'],
  },
  // N-Perm (a)
  {
    id: 'pll_na',
    name: 'N-Perm (a)',
    notation: "R U' R' U R U R' U' R2 U R' U' R",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: '交换相邻的角块和棱块',
    recognition: '识别：顶面左边有一对相同色',
    searchKeys: ['n', 'n-perm', 'pll'],
  },
  // N-Perm (b)
  {
    id: 'pll_nb',
    name: 'N-Perm (b)',
    notation: "R' U R' U' R' U' R U R2 U2 R' U' R",
    category: FormulaCategory.PLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'N-Perm的另一种形式',
    searchKeys: ['n', 'n-perm', 'pll'],
  },
]

// ============================================
// OLL - 57个公式 (完整版 Orientation of Last Layer)
// 数据来源: SpeedCubeDB
// ============================================

export const OLL_ALGORITHMS: Formula[] = [
  // OLL 1 - Dot Case
  {
    id: 'oll_1',
    name: 'OLL 1 - Dot',
    notation: "R U2 R' R' F R F' U2 R' F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '点情况，四边都未朝向',
    recognition: '顶面只有中心点朝上',
    tips: '标准算法，社区投票最多',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 2 - Dot Case
  {
    id: 'oll_2',
    name: 'OLL 2 - Dot',
    notation: "F R U R' U' F' f R U R' U' f'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: '点情况，使用双F转动',
    recognition: '顶面只有中心点朝上',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 3 - Dot Case
  {
    id: 'oll_3',
    name: 'OLL 3 - Dot',
    notation: "y' f R U R' U' f' U' F R U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: '点情况，f转开头',
    recognition: '顶面只有中心点朝上',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 4 - Dot Case
  {
    id: 'oll_4',
    name: 'OLL 4 - Dot',
    notation: "y' f R U R' U' f' U F R U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: '点情况，f转后接F转',
    recognition: '顶面只有中心点朝上',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 5 - Square
  {
    id: 'oll_5',
    name: 'OLL 5 - Square',
    notation: "r' U2 R U R' U r",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: '方形情况',
    recognition: '四个角块形成方形',
    tips: '常用OLL，7步完成',
    searchKeys: ['square', '方形', 'oll'],
  },
  // OLL 6 - Square
  {
    id: 'oll_6',
    name: 'OLL 6 - Square',
    notation: "r U2 R' U' R U' r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: '方形情况镜像',
    recognition: '四个角块形成方形（镜像）',
    searchKeys: ['square', '方形', 'oll'],
  },
  // OLL 7 - Lightning
  {
    id: 'oll_7',
    name: 'OLL 7 - Lightning',
    notation: "r U R' U R U2 r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: '闪电形',
    recognition: '两个角块朝上呈闪电状',
    searchKeys: ['lightning', '闪电', 'oll'],
  },
  // OLL 8 - Lightning
  {
    id: 'oll_8',
    name: 'OLL 8 - Lightning',
    notation: "y2 r' U' R U' R' U2 r",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: '闪电形镜像',
    recognition: '闪电状（镜像）',
    searchKeys: ['lightning', '闪电', 'oll'],
  },
  // OLL 9 - Fish
  {
    id: 'oll_9',
    name: 'OLL 9 - Fish',
    notation: "y R U R' U' R' F R2 U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: '鱼形',
    recognition: '一个角块朝上',
    tips: '社区首选算法',
    searchKeys: ['fish', '鱼', 'oll'],
  },
  // OLL 10 - Fish
  {
    id: 'oll_10',
    name: 'OLL 10 - Fish',
    notation: "R U R' U R' F R F' R U2 R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: '鱼形',
    recognition: '一个角块朝上',
    searchKeys: ['fish', '鱼', 'oll'],
  },
  // OLL 11 - Lightning
  {
    id: 'oll_11',
    name: 'OLL 11 - Lightning',
    notation: "M R U R' U R U2 R' U M'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'C字形情况',
    recognition: '两侧角块朝上',
    searchKeys: ['lightning', 'c', 'oll'],
  },
  // OLL 12 - Lightning
  {
    id: 'oll_12',
    name: 'OLL 12 - Lightning',
    notation: "y' M' R' U' R U' R' U2 R U' M",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'C字形镜像',
    recognition: 'C字形（镜像）',
    searchKeys: ['lightning', 'c', 'oll'],
  },
  // OLL 13 - Knight Move
  {
    id: 'oll_13',
    name: 'OLL 13 - Knight Move',
    notation: "F U R U2 R' U' R U R' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: '马步形',
    recognition: '骑士移动形状',
    tips: '社区首选',
    searchKeys: ['knight', '马步', 'oll'],
  },
  // OLL 14 - Knight Move
  {
    id: 'oll_14',
    name: 'OLL 14 - Knight Move',
    notation: "R' F R U R' F' R F U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: '马步形镜像',
    recognition: '马步（镜像）',
    searchKeys: ['knight', '马步', 'oll'],
  },
  // OLL 15 - Knight Move
  {
    id: 'oll_15',
    name: 'OLL 15 - Knight Move',
    notation: "r' U' r R' U' R U r' U r",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: '马步形',
    recognition: '骑士移动形状',
    searchKeys: ['knight', '马步', 'oll'],
  },
  // OLL 16 - Knight Move
  {
    id: 'oll_16',
    name: 'OLL 16 - Knight Move',
    notation: "r U r' R U R' U' r U' r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: '马步形',
    recognition: '马步形',
    tips: '社区最多投票',
    searchKeys: ['knight', '马步', 'oll'],
  },
  // OLL 17 - Dot
  {
    id: 'oll_17',
    name: 'OLL 17 - Dot',
    notation: "R U R' U R' F R F' U2 R' F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: '点情况',
    recognition: '只有中心朝上',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 18 - Dot
  {
    id: 'oll_18',
    name: 'OLL 18 - Dot',
    notation: "y R U2 R2 F R F' U2 M' U R U' r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: '点情况',
    recognition: '只有中心朝上',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 19 - Dot
  {
    id: 'oll_19',
    name: 'OLL 19 - Dot',
    notation: "S' R U R' S U' R' F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: '点情况',
    recognition: '只有中心朝上',
    tips: '社区首选',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 20 - Dot
  {
    id: 'oll_20',
    name: 'OLL 20 - Dot',
    notation: "r U R' U' M2 U R U' R' U' M'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '点情况',
    recognition: '只有中心朝上',
    searchKeys: ['dot', '点', 'oll'],
  },
  // OLL 21 - Sune (OCLL)
  {
    id: 'oll_21',
    name: 'OLL 21 - Sune',
    notation: "R U R' U R U' R' U R U2 R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 11,
    explanation: '鱼形情况，只角块需要朝向',
    recognition: '两个角块朝上',
    tips: '最常用的OLL之一',
    searchKeys: ['sune', '鱼', 'ocll', 'oll'],
  },
  // OLL 22 - Pi (OCLL)
  {
    id: 'oll_22',
    name: 'OLL 22 - Pi',
    notation: "R U2 R2 U' R2 U' R2 U2 R",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'π形情况',
    recognition: '两个相邻角块朝上',
    tips: '社区最多投票',
    searchKeys: ['pi', 'π', 'ocll', 'oll'],
  },
  // OLL 23 - H (OCLL)
  {
    id: 'oll_23',
    name: 'OLL 23 - H',
    notation: "R2 D R' U2 R D' R' U2 R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: '车灯/H形',
    recognition: '两个对角角块朝上',
    tips: '需要D层转动，社区最多投票',
    searchKeys: ['h', '车灯', 'headlights', 'ocll', 'oll'],
  },
  // OLL 24 - T (OCLL)
  {
    id: 'oll_24',
    name: 'OLL 24 - T',
    notation: "r U R' U' r' F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 8,
    explanation: 'T形情况',
    recognition: '一个角块朝上在前',
    tips: '常用OLL',
    searchKeys: ['t', 't字', 'ocll', 'oll'],
  },
  // OLL 25 - L (OCLL)
  {
    id: 'oll_25',
    name: 'OLL 25 - L',
    notation: "R U2 R D R' U2 R D' R2",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'L形情况',
    recognition: '一个角块朝上',
    tips: '社区最多投票',
    searchKeys: ['l', 'l字', 'ocll', 'oll'],
  },
  // OLL 26 - Anti-Sune (OCLL)
  {
    id: 'oll_26',
    name: 'OLL 26 - Anti-Sune',
    notation: "y R U2 R' U' R U' R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 7,
    explanation: '反鱼形',
    recognition: '一个角块朝上',
    tips: '常用OLL，7步',
    searchKeys: ['antisune', '反鱼', 'ocll', 'oll'],
  },
  // OLL 27 - Sune (OCLL)
  {
    id: 'oll_27',
    name: 'OLL 27 - Sune',
    notation: "R U R' U R U2 R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 1,
    moves: 7,
    explanation: '鱼形基础公式',
    recognition: '鱼形',
    tips: '最基础的OLL之一',
    searchKeys: ['sune', '鱼', 'ocll', 'oll'],
  },
  // OLL 28 - Edges Only
  {
    id: 'oll_28',
    name: 'OLL 28 - Edges Only',
    notation: "r U R' U' M U R U' R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: '只棱块需要朝向',
    recognition: '所有角块已朝上',
    tips: '社区最多投票',
    searchKeys: ['edges', '棱', 'oll'],
  },
  // OLL 29 - Awkward
  {
    id: 'oll_29',
    name: 'OLL 29 - Awkward',
    notation: "r2 D' r U r' D r2 U' r' U' r",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: '特殊形状',
    recognition: '不规则形状',
    searchKeys: ['awkward', '特殊', 'oll'],
  },
  // OLL 30 - Awkward
  {
    id: 'oll_30',
    name: 'OLL 30 - Awkward',
    notation: "y' r' D' r U' r' D r2 U' r' U r U r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: '特殊形状',
    recognition: '不规则形状',
    searchKeys: ['awkward', '特殊', 'oll'],
  },
  // OLL 31 - P Shape
  {
    id: 'oll_31',
    name: 'OLL 31 - P Shape',
    notation: "R' U' F U R U' R' F' R",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'P字形',
    recognition: 'P形图案',
    searchKeys: ['p', 'p字', 'oll'],
  },
  // OLL 32 - P Shape
  {
    id: 'oll_32',
    name: 'OLL 32 - P Shape',
    notation: "S R U R' U' R' F R f'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'P字形',
    recognition: 'P形图案',
    searchKeys: ['p', 'p字', 'oll'],
  },
  // OLL 33 - T Shape
  {
    id: 'oll_33',
    name: 'OLL 33 - T Shape',
    notation: "R U R' U' R' F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 8,
    explanation: 'T字形',
    recognition: 'T形图案',
    tips: '常用OLL',
    searchKeys: ['t', 't字', 'oll'],
  },
  // OLL 34 - C Shape
  {
    id: 'oll_34',
    name: 'OLL 34 - C Shape',
    notation: "y f R f' U' r' U' R U M'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'C字形',
    recognition: 'C形图案',
    searchKeys: ['c', 'c字', 'oll'],
  },
  // OLL 35 - Fish
  {
    id: 'oll_35',
    name: 'OLL 35 - Fish',
    notation: "R U2 R' R' F R F' R U2 R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: '鱼形',
    recognition: '鱼形图案',
    searchKeys: ['fish', '鱼', 'oll'],
  },
  // OLL 36 - W Shape
  {
    id: 'oll_36',
    name: 'OLL 36 - W Shape',
    notation: "y R U R2 F' U' F U R2 U2 R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'W字形',
    recognition: 'W形图案',
    searchKeys: ['w', 'w字', 'oll'],
  },
  // OLL 37 - Fish
  {
    id: 'oll_37',
    name: 'OLL 37 - Fish',
    notation: "F R' F' R U R U' R'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 8,
    explanation: '鱼形',
    recognition: '鱼形图案',
    tips: '简单算法',
    searchKeys: ['fish', '鱼', 'oll'],
  },
  // OLL 38 - W Shape
  {
    id: 'oll_38',
    name: 'OLL 38 - W Shape',
    notation: "R U R' U R U' R' U' R' F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 12,
    explanation: 'W字形',
    recognition: 'W形图案',
    searchKeys: ['w', 'w字', 'oll'],
  },
  // OLL 39 - Lightning
  {
    id: 'oll_39',
    name: 'OLL 39 - Lightning',
    notation: "y' f' r U r' U' r' F r S",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: '闪电形',
    recognition: '闪电图案',
    searchKeys: ['lightning', '闪电', 'oll'],
  },
  // OLL 40 - Lightning
  {
    id: 'oll_40',
    name: 'OLL 40 - Lightning',
    notation: "y R' F R U R' U' F' U R",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: '闪电形',
    recognition: '闪电图案',
    searchKeys: ['lightning', '闪电', 'oll'],
  },
  // OLL 41 - Awkward
  {
    id: 'oll_41',
    name: 'OLL 41 - Awkward',
    notation: "y2 R U R' U R U2 R' F R U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: '特殊形状',
    recognition: '不规则形状',
    searchKeys: ['awkward', '特殊', 'oll'],
  },
  // OLL 42 - Awkward
  {
    id: 'oll_42',
    name: 'OLL 42 - Awkward',
    notation: "R' U' R U' R' U2 R F R U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: '特殊形状',
    recognition: '不规则形状',
    searchKeys: ['awkward', '特殊', 'oll'],
  },
  // OLL 43 - P Shape
  {
    id: 'oll_43',
    name: 'OLL 43 - P Shape',
    notation: "y R' U' F' U F R",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 6,
    explanation: 'P字形',
    recognition: 'P形图案',
    tips: '最短的OLL之一',
    searchKeys: ['p', 'p字', 'oll'],
  },
  // OLL 44 - P Shape
  {
    id: 'oll_44',
    name: 'OLL 44 - P Shape',
    notation: "f R U R' U' f'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 6,
    explanation: 'P字形',
    recognition: 'P形图案',
    tips: '常用OLL',
    searchKeys: ['p', 'p字', 'oll'],
  },
  // OLL 45 - T Shape
  {
    id: 'oll_45',
    name: 'OLL 45 - T Shape',
    notation: "F R U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 1,
    moves: 6,
    explanation: 'T字形',
    recognition: 'T形图案',
    tips: '最常用OLL之一',
    searchKeys: ['t', 't字', 'oll'],
  },
  // OLL 46 - C Shape
  {
    id: 'oll_46',
    name: 'OLL 46 - C Shape',
    notation: "R' U' R' F R F' U R",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'C字形',
    recognition: 'C形图案',
    searchKeys: ['c', 'c字', 'oll'],
  },
  // OLL 47 - L Shape
  {
    id: 'oll_47',
    name: 'OLL 47 - L Shape',
    notation: "F' L' U' L U L' U' L U F",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: 'L字形',
    recognition: 'L形图案',
    searchKeys: ['l', 'l字', 'oll'],
  },
  // OLL 48 - L Shape
  {
    id: 'oll_48',
    name: 'OLL 48 - L Shape',
    notation: "F R U R' U' R U R' U' F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: 'L字形',
    recognition: 'L形图案',
    searchKeys: ['l', 'l字', 'oll'],
  },
  // OLL 49 - L Shape (双侧)
  {
    id: 'oll_49',
    name: 'OLL 49 - L Shape (双层)',
    notation: "y2 r U' r2 U r2 U r2 U' r",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'L字形（双层）',
    recognition: 'L形图案，需要r转',
    searchKeys: ['l', 'l字', 'oll'],
  },
  // OLL 50 - L Shape (双侧)
  {
    id: 'oll_50',
    name: 'OLL 50 - L Shape (双层)',
    notation: "r' U r2 U' r2 U' r2 U r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'L字形（双层）',
    recognition: 'L形图案，需要r转',
    searchKeys: ['l', 'l字', 'oll'],
  },
  // OLL 51 - Line Shape
  {
    id: 'oll_51',
    name: 'OLL 51 - Line Shape',
    notation: "f R U R' U' R U R' U' f'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: '线形',
    recognition: '线条形状',
    searchKeys: ['line', '线', 'oll'],
  },
  // OLL 52 - Line Shape
  {
    id: 'oll_52',
    name: 'OLL 52 - Line Shape',
    notation: "y2 R' F' U' F U' R U R' U R",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: '线形',
    recognition: '线条形状',
    searchKeys: ['line', '线', 'oll'],
  },
  // OLL 53 - L Shape
  {
    id: 'oll_53',
    name: 'OLL 53 - L Shape (双侧)',
    notation: "r' U' R U' R' U R U' R' U2 r",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'L字形（双侧）',
    recognition: 'L形，需要r转',
    searchKeys: ['l', 'l字', 'oll'],
  },
  // OLL 54 - L Shape
  {
    id: 'oll_54',
    name: 'OLL 54 - L Shape (双侧)',
    notation: "r U R' U R U' R' U R U2 r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'L字形（双侧）',
    recognition: 'L形，需要r转',
    searchKeys: ['l', 'l字', 'oll'],
  },
  // OLL 55 - Line Shape
  {
    id: 'oll_55',
    name: 'OLL 55 - Line Shape',
    notation: "R U2 R2 U' R U' R' U2 F R F'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: '线形',
    recognition: '线条形状',
    searchKeys: ['line', '线', 'oll'],
  },
  // OLL 56 - Line Shape
  {
    id: 'oll_56',
    name: 'OLL 56 - Line Shape (双侧)',
    notation: "r U r' U R U' R' U R U' R' r U' r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: '线形（双侧）',
    recognition: '线条形状，需要r转',
    searchKeys: ['line', '线', 'oll'],
  },
  // OLL 57 - Edges Only
  {
    id: 'oll_57',
    name: 'OLL 57 - Edges Only',
    notation: "R U R' U' M' U R U' r'",
    category: FormulaCategory.OLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: '只棱块需要朝向',
    recognition: '所有角块已朝上',
    tips: '社区最多投票',
    searchKeys: ['edges', '棱', 'oll'],
  },
]

// ============================================
// ============================================
// COLL - 40个公式 (完整版 Corners of Last Layer)
// 数据来源: SpeedCubeDB
// COLL 解决顶层角块的朝向和排列（前提: 边缘已朝向）
// ============================================

export const COLL_ALGORITHMS: Formula[] = [
// AS (Anti-Sune) - 6 formulas
  {
    id: 'coll_as_1',
    name: 'COLL AS 1',
    notation: "y R U2 R' U' R U' R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: 'COLL-Anti Sune 情况1',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_2',
    name: 'COLL AS 2',
    notation: "y2 R2 D R' U R D' R' U R' U' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-Anti Sune 情况2',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_3',
    name: 'COLL AS 3',
    notation: "y2 R2 D R' U2 R D' R2 U' R U' R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Anti Sune 情况3',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_4',
    name: 'COLL AS 4',
    notation: "y2 R' U' R U' R2 D' R U2 R' D R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Anti Sune 情况4',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_5',
    name: 'COLL AS 5',
    notation: "y2 r' F R F' r U R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: 'COLL-Anti Sune 情况5',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_6',
    name: 'COLL AS 6',
    notation: "R U' R' U2 R U' R' U2 R' D' R U R' D R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-Anti Sune 情况6',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  // S (Sune) - 6 formulas
  {
    id: 'coll_s_1',
    name: 'COLL S 1 - Sune',
    notation: "R U R' U R U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 7,
    explanation: 'COLL-Sune 情况1（基础公式）',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_2',
    name: 'COLL S 2',
    notation: "y2 R U R' U R2 D R' U2 R D' R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Sune 情况2',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_3',
    name: 'COLL S 3',
    notation: "L' R U R' U' L U2 R U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'COLL-Sune 情况3',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_4',
    name: 'COLL S 4',
    notation: "y' R U R' U R U' R D R' U' R D' R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-Sune 情况4',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_5',
    name: 'COLL S 5',
    notation: "R U' L' U R' U' L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: 'COLL-Sune 情况5',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_6',
    name: 'COLL S 6',
    notation: "y2 R U R' U r' F R F' r U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Sune 情况6',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  // L - 6 formulas
  {
    id: 'coll_l_1',
    name: 'COLL L 1',
    notation: "y' R U R' U R U' R' U R U' R' U R U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-L 情况1',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_2',
    name: 'COLL L 2',
    notation: "R' U2 R' D' R U2 R' D R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'COLL-L 情况2',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_3',
    name: 'COLL L 3',
    notation: "y R U2 R D R' U2 R D' R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'COLL-L 情况3',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_4',
    name: 'COLL L 4',
    notation: "y F R' F' r U R U' r'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-L 情况4',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_5',
    name: 'COLL L 5',
    notation: "y2 F' r U R' U' r' F R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-L 情况5',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_6',
    name: 'COLL L 6',
    notation: "y r U2 R2 F R F' R U2 r'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'COLL-L 情况6',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  // U - 6 formulas
  {
    id: 'coll_u_1',
    name: 'COLL U 1',
    notation: "R' U' R U' R' U2 R2 U R' U R U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-U 情况1',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_2',
    name: 'COLL U 2',
    notation: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 19,
    explanation: 'COLL-U 情况2',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_3',
    name: 'COLL U 3',
    notation: "y2 R2 D R' U2 R D' R' U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'COLL-U 情况3',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_4',
    name: 'COLL U 4',
    notation: "F R U' R' U R U R' U R U' R' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 13,
    explanation: 'COLL-U 情况4',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_5',
    name: 'COLL U 5',
    notation: "R2 D' R U2 R' D R U2 R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'COLL-U 情况5',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_6',
    name: 'COLL U 6',
    notation: "R2 D' R U R' D R U R U' R' U' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-U 情况6',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  // T - 6 formulas
  {
    id: 'coll_t_1',
    name: 'COLL T 1',
    notation: "R U2 R' U' R U' R2 U2 R U R' U R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-T 情况1',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_2',
    name: 'COLL T 2',
    notation: "R' U R U2 R' L' U R U' L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: 'COLL-T 情况2',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_3',
    name: 'COLL T 3',
    notation: "y R' F' r U R U' r' F",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-T 情况3',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_4',
    name: 'COLL T 4',
    notation: "y2 F R U R' U' R U' R' U' R U R' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-T 情况4',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_5',
    name: 'COLL T 5',
    notation: "y' r U R' U' r' F R F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-T 情况5',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_6',
    name: 'COLL T 6',
    notation: "R' U R2 D r' U2 r D' R2 U' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-T 情况6',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  // Pi - 6 formulas
  {
    id: 'coll_pi_1',
    name: 'COLL Pi 1',
    notation: "R U2 R2 U' R2 U' R2 U2 R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'COLL-Pi 情况1',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_2',
    name: 'COLL Pi 2',
    notation: "y F U R U' R' U R U' R2 F' R U R U' R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-Pi 情况2',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_3',
    name: 'COLL Pi 3',
    notation: "R' U' F' R U R' U' R' F R2 U2 R' U2 R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'COLL-Pi 情况3',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_4',
    name: 'COLL Pi 4',
    notation: "R U R' U' R' F R2 U R' U' R U R' U' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-Pi 情况4',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_5',
    name: 'COLL Pi 5',
    notation: "R U' L' U R' U L U L' U L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: 'COLL-Pi 情况5',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_6',
    name: 'COLL Pi 6',
    notation: "R' F' U' F U' R U S' R' U R S",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'COLL-Pi 情况6',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  // H - 4 formulas
  {
    id: 'coll_h_1',
    name: 'COLL H 1',
    notation: "R U R' U R U' R' U R U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: 'COLL-H 情况1（车灯）',
    recognition: '两个对角角块朝上',
    searchKeys: ['coll', 'h', 'headlights'],
  },
  {
    id: 'coll_h_2',
    name: 'COLL H 2',
    notation: "F R U' R' U R U2 R' U' R U R' U' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'COLL-H 情况2',
    recognition: '车灯情况',
    searchKeys: ['coll', 'h', 'headlights'],
  },
  {
    id: 'coll_h_3',
    name: 'COLL H 3',
    notation: "R U R' U R U L' U R' U' L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: 'COLL-H 情况3',
    recognition: '车灯情况',
    searchKeys: ['coll', 'h', 'headlights'],
  },
  {
    id: 'coll_h_4',
    name: 'COLL H 4',
    notation: "y F R U R' U' R U R' U' R U R' U' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'COLL-H 情况4',
    recognition: '车灯情况',
    searchKeys: ['coll', 'h', 'headlights'],
  },

]

// ============================================
// ZBLL - 493个公式 (完整版 Zborowski-Bruchem Last Layer)
// 数据来源: SpeedCubeDB
// ZBLL 是ZZ方法的核心，允许一步完成顶层的朝向和排列
// ============================================

export const ZBLL_ALGORITHMS: Formula[] = [
// ZBLL Algorithms from SpeedCubeDB
// Auto-generated - represents one primary algorithm per case
// ============================================

  // ZBLL T - 1
  {
    id: 'zbll_t_1',
    name: 'ZBLL T 1',
    notation: "y R' U' R U' R' U' R U2 L' R' U R U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 1情况',
    recognition: 'ZBLL-T，1情况识别',
    searchKeys: ['zbll', 't', '1', 'zz'],
  },

  // ZBLL T - 2
  {
    id: 'zbll_t_2',
    name: 'ZBLL T 2',
    notation: "y R' U2 R2 U R' U' R' U2 F' R U2 R U2 R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 2情况',
    recognition: 'ZBLL-T，2情况识别',
    searchKeys: ['zbll', 't', '2', 'zz'],
  },

  // ZBLL T - 3
  {
    id: 'zbll_t_3',
    name: 'ZBLL T 3',
    notation: "y2 R' U' R' D' R U' M' U2 r' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的T 3情况',
    recognition: 'ZBLL-T，3情况识别',
    searchKeys: ['zbll', 't', '3', 'zz'],
  },

  // ZBLL T - 4
  {
    id: 'zbll_t_4',
    name: 'ZBLL T 4',
    notation: "y2 F R2 D R' U' R D' R2 U' R U2 R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 4情况',
    recognition: 'ZBLL-T，4情况识别',
    searchKeys: ['zbll', 't', '4', 'zz'],
  },

  // ZBLL T - 5
  {
    id: 'zbll_t_5',
    name: 'ZBLL T 5',
    notation: "y F R U R' U' R U R' U' F' R U R' U' R' F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的T 5情况',
    recognition: 'ZBLL-T，5情况识别',
    searchKeys: ['zbll', 't', '5', 'zz'],
  },

  // ZBLL T - 6
  {
    id: 'zbll_t_6',
    name: 'ZBLL T 6',
    notation: "y2 R' U' R' D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的T 6情况',
    recognition: 'ZBLL-T，6情况识别',
    searchKeys: ['zbll', 't', '6', 'zz'],
  },

  // ZBLL T - 7
  {
    id: 'zbll_t_7',
    name: 'ZBLL T 7',
    notation: "R' U2 R F U' R' U R U F' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的T 7情况',
    recognition: 'ZBLL-T，7情况识别',
    searchKeys: ['zbll', 't', '7', 'zz'],
  },

  // ZBLL T - 8
  {
    id: 'zbll_t_8',
    name: 'ZBLL T 8',
    notation: "y' R' U' R U R' U R L' U R' U' R L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 8情况',
    recognition: 'ZBLL-T，8情况识别',
    searchKeys: ['zbll', 't', '8', 'zz'],
  },

  // ZBLL T - 9
  {
    id: 'zbll_t_9',
    name: 'ZBLL T 9',
    notation: "y F U R U2 R' U R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 9情况',
    recognition: 'ZBLL-T，9情况识别',
    searchKeys: ['zbll', 't', '9', 'zz'],
  },

  // ZBLL T - 10
  {
    id: 'zbll_t_10',
    name: 'ZBLL T 10',
    notation: "y R U R' U' R' F' R U2 R U2 R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的T 10情况',
    recognition: 'ZBLL-T，10情况识别',
    searchKeys: ['zbll', 't', '10', 'zz'],
  },

  // ZBLL T - 11
  {
    id: 'zbll_t_11',
    name: 'ZBLL T 11',
    notation: "y' F U R' U' R F' R' U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 11情况',
    recognition: 'ZBLL-T，11情况识别',
    searchKeys: ['zbll', 't', '11', 'zz'],
  },

  // ZBLL T - 12
  {
    id: 'zbll_t_12',
    name: 'ZBLL T 12',
    notation: "y' R' U R U R' U' R' D' R U2 R' D R U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 12情况',
    recognition: 'ZBLL-T，12情况识别',
    searchKeys: ['zbll', 't', '12', 'zz'],
  },

  // ZBLL T - 13
  {
    id: 'zbll_t_13',
    name: 'ZBLL T 13',
    notation: "y2 R' U' R U D' R U' R U R U' R2 D",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 13情况',
    recognition: 'ZBLL-T，13情况识别',
    searchKeys: ['zbll', 't', '13', 'zz'],
  },

  // ZBLL T - 14
  {
    id: 'zbll_t_14',
    name: 'ZBLL T 14',
    notation: "y' R' D' R U R' D R2 U' R' U R U R' U' R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的T 14情况',
    recognition: 'ZBLL-T，14情况识别',
    searchKeys: ['zbll', 't', '14', 'zz'],
  },

  // ZBLL T - 15
  {
    id: 'zbll_t_15',
    name: 'ZBLL T 15',
    notation: "y R U R' U R U R' U2 L R U' R' U L'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 15情况',
    recognition: 'ZBLL-T，15情况识别',
    searchKeys: ['zbll', 't', '15', 'zz'],
  },

  // ZBLL T - 16
  {
    id: 'zbll_t_16',
    name: 'ZBLL T 16',
    notation: "y2 F R U R' U' R' F' U2 R U R U' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 16情况',
    recognition: 'ZBLL-T，16情况识别',
    searchKeys: ['zbll', 't', '16', 'zz'],
  },

  // ZBLL T - 17
  {
    id: 'zbll_t_17',
    name: 'ZBLL T 17',
    notation: "y' r U R' U' r' F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的T 17情况',
    recognition: 'ZBLL-T，17情况识别',
    searchKeys: ['zbll', 't', '17', 'zz'],
  },

  // ZBLL T - 18
  {
    id: 'zbll_t_18',
    name: 'ZBLL T 18',
    notation: "R' U' R U' R2 F' R U R U' R' F U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的T 18情况',
    recognition: 'ZBLL-T，18情况识别',
    searchKeys: ['zbll', 't', '18', 'zz'],
  },

  // ZBLL T - 19
  {
    id: 'zbll_t_19',
    name: 'ZBLL T 19',
    notation: "y R2 U R' U' R' U R' U2 D R' U2 R D'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 19情况',
    recognition: 'ZBLL-T，19情况识别',
    searchKeys: ['zbll', 't', '19', 'zz'],
  },

  // ZBLL T - 20
  {
    id: 'zbll_t_20',
    name: 'ZBLL T 20',
    notation: "y' R U R' U' R U' R' L U' R U R' L'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 20情况',
    recognition: 'ZBLL-T，20情况识别',
    searchKeys: ['zbll', 't', '20', 'zz'],
  },

  // ZBLL T - 21
  {
    id: 'zbll_t_21',
    name: 'ZBLL T 21',
    notation: "y' R U2 R' U2 R' F R U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的T 21情况',
    recognition: 'ZBLL-T，21情况识别',
    searchKeys: ['zbll', 't', '21', 'zz'],
  },

  // ZBLL T - 22
  {
    id: 'zbll_t_22',
    name: 'ZBLL T 22',
    notation: "y' F' U' r' F2 r U F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 22情况',
    recognition: 'ZBLL-T，22情况识别',
    searchKeys: ['zbll', 't', '22', 'zz'],
  },

  // ZBLL T - 23
  {
    id: 'zbll_t_23',
    name: 'ZBLL T 23',
    notation: "y' R U' R' U' R U R D R' U2 R D' R' U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 23情况',
    recognition: 'ZBLL-T，23情况识别',
    searchKeys: ['zbll', 't', '23', 'zz'],
  },

  // ZBLL T - 24
  {
    id: 'zbll_t_24',
    name: 'ZBLL T 24',
    notation: "y2 R L' U R' U' L U R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 24情况',
    recognition: 'ZBLL-T，24情况识别',
    searchKeys: ['zbll', 't', '24', 'zz'],
  },

  // ZBLL T - 25
  {
    id: 'zbll_t_25',
    name: 'ZBLL T 25',
    notation: "R' U R U2 L' R' U R U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的T 25情况',
    recognition: 'ZBLL-T，25情况识别',
    searchKeys: ['zbll', 't', '25', 'zz'],
  },

  // ZBLL T - 26
  {
    id: 'zbll_t_26',
    name: 'ZBLL T 26',
    notation: "y R U R2 F R F' R U' R' F' U F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的T 26情况',
    recognition: 'ZBLL-T，26情况识别',
    searchKeys: ['zbll', 't', '26', 'zz'],
  },

  // ZBLL T - 27
  {
    id: 'zbll_t_27',
    name: 'ZBLL T 27',
    notation: "y2 R U' R' U2 L R U' R' U L'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 27情况',
    recognition: 'ZBLL-T，27情况识别',
    searchKeys: ['zbll', 't', '27', 'zz'],
  },

  // ZBLL T - 28
  {
    id: 'zbll_t_28',
    name: 'ZBLL T 28',
    notation: "y' R' U' R' D' R U R' D R U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 28情况',
    recognition: 'ZBLL-T，28情况识别',
    searchKeys: ['zbll', 't', '28', 'zz'],
  },

  // ZBLL T - 29
  {
    id: 'zbll_t_29',
    name: 'ZBLL T 29',
    notation: "F R U' R' U' R U2 R' U' F' R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的T 29情况',
    recognition: 'ZBLL-T，29情况识别',
    searchKeys: ['zbll', 't', '29', 'zz'],
  },

  // ZBLL T - 30
  {
    id: 'zbll_t_30',
    name: 'ZBLL T 30',
    notation: "R' U2 R U R' U R F U R U2 R' U R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的T 30情况',
    recognition: 'ZBLL-T，30情况识别',
    searchKeys: ['zbll', 't', '30', 'zz'],
  },

  // ZBLL T - 31
  {
    id: 'zbll_t_31',
    name: 'ZBLL T 31',
    notation: "y2 r U' r U2 R' F R U2 r2 F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 31情况',
    recognition: 'ZBLL-T，31情况识别',
    searchKeys: ['zbll', 't', '31', 'zz'],
  },

  // ZBLL T - 32
  {
    id: 'zbll_t_32',
    name: 'ZBLL T 32',
    notation: "y2 R' U' R2 U R' F' R U R' U' R' F R2 U' R' U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的T 32情况',
    recognition: 'ZBLL-T，32情况识别',
    searchKeys: ['zbll', 't', '32', 'zz'],
  },

  // ZBLL T - 33
  {
    id: 'zbll_t_33',
    name: 'ZBLL T 33',
    notation: "R U' R' U R U R' U' R U R' U' R' D' R U' R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的T 33情况',
    recognition: 'ZBLL-T，33情况识别',
    searchKeys: ['zbll', 't', '33', 'zz'],
  },

  // ZBLL T - 34
  {
    id: 'zbll_t_34',
    name: 'ZBLL T 34',
    notation: "R U R' U R U' R' U' L' U2 R U2 R' U2 L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 34情况',
    recognition: 'ZBLL-T，34情况识别',
    searchKeys: ['zbll', 't', '34', 'zz'],
  },

  // ZBLL T - 35
  {
    id: 'zbll_t_35',
    name: 'ZBLL T 35',
    notation: "y2 R' D' R U R' D R U R U' R' U R U' R' U' R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的T 35情况',
    recognition: 'ZBLL-T，35情况识别',
    searchKeys: ['zbll', 't', '35', 'zz'],
  },

  // ZBLL T - 36
  {
    id: 'zbll_t_36',
    name: 'ZBLL T 36',
    notation: "y L' U2 R U2 R' U2 L U R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 36情况',
    recognition: 'ZBLL-T，36情况识别',
    searchKeys: ['zbll', 't', '36', 'zz'],
  },

  // ZBLL T - 37
  {
    id: 'zbll_t_37',
    name: 'ZBLL T 37',
    notation: "R' D' R U R' D R2 U R' U2 R U' R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的T 37情况',
    recognition: 'ZBLL-T，37情况识别',
    searchKeys: ['zbll', 't', '37', 'zz'],
  },

  // ZBLL T - 38
  {
    id: 'zbll_t_38',
    name: 'ZBLL T 38',
    notation: "y' R U R2 D' R U2 R' D R U2 R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的T 38情况',
    recognition: 'ZBLL-T，38情况识别',
    searchKeys: ['zbll', 't', '38', 'zz'],
  },

  // ZBLL T - 39
  {
    id: 'zbll_t_39',
    name: 'ZBLL T 39',
    notation: "y R' U' R U' F U' R' U R U F' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 39情况',
    recognition: 'ZBLL-T，39情况识别',
    searchKeys: ['zbll', 't', '39', 'zz'],
  },

  // ZBLL T - 40
  {
    id: 'zbll_t_40',
    name: 'ZBLL T 40',
    notation: "R' U2 R' D' R U2 R' D R2 U' R' U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的T 40情况',
    recognition: 'ZBLL-T，40情况识别',
    searchKeys: ['zbll', 't', '40', 'zz'],
  },

  // ZBLL T - 41
  {
    id: 'zbll_t_41',
    name: 'ZBLL T 41',
    notation: "y' l' U2 R' D2 R U2 R' D2 R2 x'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 41情况',
    recognition: 'ZBLL-T，41情况识别',
    searchKeys: ['zbll', 't', '41', 'zz'],
  },

  // ZBLL T - 42
  {
    id: 'zbll_t_42',
    name: 'ZBLL T 42',
    notation: "y' l U2 R D2 R' U2 R D2 R2 x",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 42情况',
    recognition: 'ZBLL-T，42情况识别',
    searchKeys: ['zbll', 't', '42', 'zz'],
  },

  // ZBLL T - 43
  {
    id: 'zbll_t_43',
    name: 'ZBLL T 43',
    notation: "y2 F R U R' U' R U' R' U' R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 43情况',
    recognition: 'ZBLL-T，43情况识别',
    searchKeys: ['zbll', 't', '43', 'zz'],
  },

  // ZBLL T - 44
  {
    id: 'zbll_t_44',
    name: 'ZBLL T 44',
    notation: "y' R U R' U2 R U' R' U2 R U' R2 F' R U R U' R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的T 44情况',
    recognition: 'ZBLL-T，44情况识别',
    searchKeys: ['zbll', 't', '44', 'zz'],
  },

  // ZBLL T - 45
  {
    id: 'zbll_t_45',
    name: 'ZBLL T 45',
    notation: "y R' U' R' D' R U R' D R U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 45情况',
    recognition: 'ZBLL-T，45情况识别',
    searchKeys: ['zbll', 't', '45', 'zz'],
  },

  // ZBLL T - 46
  {
    id: 'zbll_t_46',
    name: 'ZBLL T 46',
    notation: "y R U R' U R' D' R U' R' D R U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 46情况',
    recognition: 'ZBLL-T，46情况识别',
    searchKeys: ['zbll', 't', '46', 'zz'],
  },

  // ZBLL T - 47
  {
    id: 'zbll_t_47',
    name: 'ZBLL T 47',
    notation: "r U R' U' r' F R F' R' U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 47情况',
    recognition: 'ZBLL-T，47情况识别',
    searchKeys: ['zbll', 't', '47', 'zz'],
  },

  // ZBLL T - 48
  {
    id: 'zbll_t_48',
    name: 'ZBLL T 48',
    notation: "y2 R U2 R' U' R U' R2 F' r U R U' r' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 48情况',
    recognition: 'ZBLL-T，48情况识别',
    searchKeys: ['zbll', 't', '48', 'zz'],
  },

  // ZBLL T - 49
  {
    id: 'zbll_t_49',
    name: 'ZBLL T 49',
    notation: "y R' U' R U R' U' R2 D R' U R D' R' U2 R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的T 49情况',
    recognition: 'ZBLL-T，49情况识别',
    searchKeys: ['zbll', 't', '49', 'zz'],
  },

  // ZBLL T - 50
  {
    id: 'zbll_t_50',
    name: 'ZBLL T 50',
    notation: "R U' R' U R U R' U' R U R' U R' D' R U R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的T 50情况',
    recognition: 'ZBLL-T，50情况识别',
    searchKeys: ['zbll', 't', '50', 'zz'],
  },

  // ZBLL T - 51
  {
    id: 'zbll_t_51',
    name: 'ZBLL T 51',
    notation: "y R U' R2 D' r U2 r' D R2 U' R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 51情况',
    recognition: 'ZBLL-T，51情况识别',
    searchKeys: ['zbll', 't', '51', 'zz'],
  },

  // ZBLL T - 52
  {
    id: 'zbll_t_52',
    name: 'ZBLL T 52',
    notation: "y2 R U R' U2 R' D' R U R' D R2 U' R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的T 52情况',
    recognition: 'ZBLL-T，52情况识别',
    searchKeys: ['zbll', 't', '52', 'zz'],
  },

  // ZBLL T - 53
  {
    id: 'zbll_t_53',
    name: 'ZBLL T 53',
    notation: "y2 r2 U R' U' r' F R F' U R' U' r' F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 53情况',
    recognition: 'ZBLL-T，53情况识别',
    searchKeys: ['zbll', 't', '53', 'zz'],
  },

  // ZBLL T - 54
  {
    id: 'zbll_t_54',
    name: 'ZBLL T 54',
    notation: "y2 R2 F R U R' U' R' F' R' U' R2 U2 R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 54情况',
    recognition: 'ZBLL-T，54情况识别',
    searchKeys: ['zbll', 't', '54', 'zz'],
  },

  // ZBLL T - 55
  {
    id: 'zbll_t_55',
    name: 'ZBLL T 55',
    notation: "y2 R U' R2 D' r U2 r' D R2 U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的T 55情况',
    recognition: 'ZBLL-T，55情况识别',
    searchKeys: ['zbll', 't', '55', 'zz'],
  },

  // ZBLL T - 56
  {
    id: 'zbll_t_56',
    name: 'ZBLL T 56',
    notation: "R' U R2 D r' U2 r D' R2 U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的T 56情况',
    recognition: 'ZBLL-T，56情况识别',
    searchKeys: ['zbll', 't', '56', 'zz'],
  },

  // ZBLL T - 57
  {
    id: 'zbll_t_57',
    name: 'ZBLL T 57',
    notation: "R' U' R U2 R D R' U' R D' R2 U R U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的T 57情况',
    recognition: 'ZBLL-T，57情况识别',
    searchKeys: ['zbll', 't', '57', 'zz'],
  },

  // ZBLL T - 58
  {
    id: 'zbll_t_58',
    name: 'ZBLL T 58',
    notation: "y R' D' R U' R' D R U' R U' R' U R U' R' U' R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的T 58情况',
    recognition: 'ZBLL-T，58情况识别',
    searchKeys: ['zbll', 't', '58', 'zz'],
  },

  // ZBLL T - 59
  {
    id: 'zbll_t_59',
    name: 'ZBLL T 59',
    notation: "y R U R' U' R U R2 D' R U' R' D R U2 R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的T 59情况',
    recognition: 'ZBLL-T，59情况识别',
    searchKeys: ['zbll', 't', '59', 'zz'],
  },

  // ZBLL T - 60
  {
    id: 'zbll_t_60',
    name: 'ZBLL T 60',
    notation: "y2 R U R' F' R U R' U' R' F R U' R' F R U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 21,
    explanation: 'ZZ方法中的T 60情况',
    recognition: 'ZBLL-T，60情况识别',
    searchKeys: ['zbll', 't', '60', 'zz'],
  },

  // ZBLL T - 61
  {
    id: 'zbll_t_61',
    name: 'ZBLL T 61',
    notation: "y2 R U' R' U2 R U R' U2 R U R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 61情况',
    recognition: 'ZBLL-T，61情况识别',
    searchKeys: ['zbll', 't', '61', 'zz'],
  },

  // ZBLL T - 62
  {
    id: 'zbll_t_62',
    name: 'ZBLL T 62',
    notation: "y' R U R' U R U2 R' U' R U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 62情况',
    recognition: 'ZBLL-T，62情况识别',
    searchKeys: ['zbll', 't', '62', 'zz'],
  },

  // ZBLL T - 63
  {
    id: 'zbll_t_63',
    name: 'ZBLL T 63',
    notation: "y' R U R' U R U' R' U R' U' R2 U' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 63情况',
    recognition: 'ZBLL-T，63情况识别',
    searchKeys: ['zbll', 't', '63', 'zz'],
  },

  // ZBLL T - 64
  {
    id: 'zbll_t_64',
    name: 'ZBLL T 64',
    notation: "R U2 R' U' R U' R' U R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的T 64情况',
    recognition: 'ZBLL-T，64情况识别',
    searchKeys: ['zbll', 't', '64', 'zz'],
  },

  // ZBLL T - 65
  {
    id: 'zbll_t_65',
    name: 'ZBLL T 65',
    notation: "y' R' U' R U' R' U R U' R U R2 U R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 65情况',
    recognition: 'ZBLL-T，65情况识别',
    searchKeys: ['zbll', 't', '65', 'zz'],
  },

  // ZBLL T - 66
  {
    id: 'zbll_t_66',
    name: 'ZBLL T 66',
    notation: "y2 R' U2 R U R' U R U' R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 66情况',
    recognition: 'ZBLL-T，66情况识别',
    searchKeys: ['zbll', 't', '66', 'zz'],
  },

  // ZBLL T - 67
  {
    id: 'zbll_t_67',
    name: 'ZBLL T 67',
    notation: "y' R' U' R2 U R2 U R2 U2 R' U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 67情况',
    recognition: 'ZBLL-T，67情况识别',
    searchKeys: ['zbll', 't', '67', 'zz'],
  },

  // ZBLL T - 68
  {
    id: 'zbll_t_68',
    name: 'ZBLL T 68',
    notation: "y' R U R2 U' R2 U' R2 U2 R U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 68情况',
    recognition: 'ZBLL-T，68情况识别',
    searchKeys: ['zbll', 't', '68', 'zz'],
  },

  // ZBLL T - 69
  {
    id: 'zbll_t_69',
    name: 'ZBLL T 69',
    notation: "R U2 R' U' R U' R2 U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的T 69情况',
    recognition: 'ZBLL-T，69情况识别',
    searchKeys: ['zbll', 't', '69', 'zz'],
  },

  // ZBLL T - 70
  {
    id: 'zbll_t_70',
    name: 'ZBLL T 70',
    notation: "y2 R' U2 R U R' U R2 U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的T 70情况',
    recognition: 'ZBLL-T，70情况识别',
    searchKeys: ['zbll', 't', '70', 'zz'],
  },

  // ZBLL T - 71
  {
    id: 'zbll_t_71',
    name: 'ZBLL T 71',
    notation: "R' U R U2 R' U' R U' R U R' U' R' U' R U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的T 71情况',
    recognition: 'ZBLL-T，71情况识别',
    searchKeys: ['zbll', 't', '71', 'zz'],
  },

  // ZBLL T - 72
  {
    id: 'zbll_t_72',
    name: 'ZBLL T 72',
    notation: "y' R U R' U R U2 R' U2 R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的T 72情况',
    recognition: 'ZBLL-T，72情况识别',
    searchKeys: ['zbll', 't', '72', 'zz'],
  },

  // ZBLL U - 1
  {
    id: 'zbll_u_1',
    name: 'ZBLL U 1',
    notation: "R U' R' U' R U2 R' U' R' D' R U2 R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的U 1情况',
    recognition: 'ZBLL-U，1情况识别',
    searchKeys: ['zbll', 'u', '1', 'zz'],
  },

  // ZBLL U - 2
  {
    id: 'zbll_u_2',
    name: 'ZBLL U 2',
    notation: "y' R U2 R D R' U2 R D' R' U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 2情况',
    recognition: 'ZBLL-U，2情况识别',
    searchKeys: ['zbll', 'u', '2', 'zz'],
  },

  // ZBLL U - 3
  {
    id: 'zbll_u_3',
    name: 'ZBLL U 3',
    notation: "y2 R2 D r' U2 r D' R' U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的U 3情况',
    recognition: 'ZBLL-U，3情况识别',
    searchKeys: ['zbll', 'u', '3', 'zz'],
  },

  // ZBLL U - 4
  {
    id: 'zbll_u_4',
    name: 'ZBLL U 4',
    notation: "y R U R2 D' R U R' D R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的U 4情况',
    recognition: 'ZBLL-U，4情况识别',
    searchKeys: ['zbll', 'u', '4', 'zz'],
  },

  // ZBLL U - 5
  {
    id: 'zbll_u_5',
    name: 'ZBLL U 5',
    notation: "y' R U2 R2 D' R U2 R' D R2 U' R' U2 R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 5情况',
    recognition: 'ZBLL-U，5情况识别',
    searchKeys: ['zbll', 'u', '5', 'zz'],
  },

  // ZBLL U - 6
  {
    id: 'zbll_u_6',
    name: 'ZBLL U 6',
    notation: "y2 R2 D R' U2 R D' R' U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的U 6情况',
    recognition: 'ZBLL-U，6情况识别',
    searchKeys: ['zbll', 'u', '6', 'zz'],
  },

  // ZBLL U - 7
  {
    id: 'zbll_u_7',
    name: 'ZBLL U 7',
    notation: "y2 R' D' r U2 r' D R U2 R U' R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 7情况',
    recognition: 'ZBLL-U，7情况识别',
    searchKeys: ['zbll', 'u', '7', 'zz'],
  },

  // ZBLL U - 8
  {
    id: 'zbll_u_8',
    name: 'ZBLL U 8',
    notation: "R' U' R U R U R' U' R' U F R U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 8情况',
    recognition: 'ZBLL-U，8情况识别',
    searchKeys: ['zbll', 'u', '8', 'zz'],
  },

  // ZBLL U - 9
  {
    id: 'zbll_u_9',
    name: 'ZBLL U 9',
    notation: "y' R U R' U R U' R' U F' R U2 R' U2 R' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 9情况',
    recognition: 'ZBLL-U，9情况识别',
    searchKeys: ['zbll', 'u', '9', 'zz'],
  },

  // ZBLL U - 10
  {
    id: 'zbll_u_10',
    name: 'ZBLL U 10',
    notation: "y' R2 D' R U' R' D R2 U R' U R U2 R' U R U2 R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的U 10情况',
    recognition: 'ZBLL-U，10情况识别',
    searchKeys: ['zbll', 'u', '10', 'zz'],
  },

  // ZBLL U - 11
  {
    id: 'zbll_u_11',
    name: 'ZBLL U 11',
    notation: "y R U R' U R U' R' U R U' R' U' L' U R U' R' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的U 11情况',
    recognition: 'ZBLL-U，11情况识别',
    searchKeys: ['zbll', 'u', '11', 'zz'],
  },

  // ZBLL U - 12
  {
    id: 'zbll_u_12',
    name: 'ZBLL U 12',
    notation: "y' R U' R' U R U R' U2 R' D' R U R' D R2 U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 12情况',
    recognition: 'ZBLL-U，12情况识别',
    searchKeys: ['zbll', 'u', '12', 'zz'],
  },

  // ZBLL U - 13
  {
    id: 'zbll_u_13',
    name: 'ZBLL U 13',
    notation: "R2 D' r U2 r' D R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的U 13情况',
    recognition: 'ZBLL-U，13情况识别',
    searchKeys: ['zbll', 'u', '13', 'zz'],
  },

  // ZBLL U - 14
  {
    id: 'zbll_u_14',
    name: 'ZBLL U 14',
    notation: "y R2 D' R U' R' D R2 U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的U 14情况',
    recognition: 'ZBLL-U，14情况识别',
    searchKeys: ['zbll', 'u', '14', 'zz'],
  },

  // ZBLL U - 15
  {
    id: 'zbll_u_15',
    name: 'ZBLL U 15',
    notation: "y2 R' U R U R' U2 R U R D R' U2 R D' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 15情况',
    recognition: 'ZBLL-U，15情况识别',
    searchKeys: ['zbll', 'u', '15', 'zz'],
  },

  // ZBLL U - 16
  {
    id: 'zbll_u_16',
    name: 'ZBLL U 16',
    notation: "y' R' U2 R' D' R U2 R' D R U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 16情况',
    recognition: 'ZBLL-U，16情况识别',
    searchKeys: ['zbll', 'u', '16', 'zz'],
  },

  // ZBLL U - 17
  {
    id: 'zbll_u_17',
    name: 'ZBLL U 17',
    notation: "R2 D' R U2 R' D R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的U 17情况',
    recognition: 'ZBLL-U，17情况识别',
    searchKeys: ['zbll', 'u', '17', 'zz'],
  },

  // ZBLL U - 18
  {
    id: 'zbll_u_18',
    name: 'ZBLL U 18',
    notation: "y' R' U2 R2 D R' U2 R D' R2 U R U2 R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 18情况',
    recognition: 'ZBLL-U，18情况识别',
    searchKeys: ['zbll', 'u', '18', 'zz'],
  },

  // ZBLL U - 19
  {
    id: 'zbll_u_19',
    name: 'ZBLL U 19',
    notation: "y' R' U R U R' U2 R y U2 R U' R' U2 R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 19情况',
    recognition: 'ZBLL-U，19情况识别',
    searchKeys: ['zbll', 'u', '19', 'zz'],
  },

  // ZBLL U - 20
  {
    id: 'zbll_u_20',
    name: 'ZBLL U 20',
    notation: "y2 F R U R' U' R2 D R' U' R D' R2 U' R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 20情况',
    recognition: 'ZBLL-U，20情况识别',
    searchKeys: ['zbll', 'u', '20', 'zz'],
  },

  // ZBLL U - 21
  {
    id: 'zbll_u_21',
    name: 'ZBLL U 21',
    notation: "R2 D' R U2 R' U' D R' U' R2 U R U R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 21情况',
    recognition: 'ZBLL-U，21情况识别',
    searchKeys: ['zbll', 'u', '21', 'zz'],
  },

  // ZBLL U - 22
  {
    id: 'zbll_u_22',
    name: 'ZBLL U 22',
    notation: "y' R2 F' R U2 R U2 R' F U' R U R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的U 22情况',
    recognition: 'ZBLL-U，22情况识别',
    searchKeys: ['zbll', 'u', '22', 'zz'],
  },

  // ZBLL U - 23
  {
    id: 'zbll_u_23',
    name: 'ZBLL U 23',
    notation: "y' R' U R U' R' U' R U2 R D R' U' R D' R2 U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 23情况',
    recognition: 'ZBLL-U，23情况识别',
    searchKeys: ['zbll', 'u', '23', 'zz'],
  },

  // ZBLL U - 24
  {
    id: 'zbll_u_24',
    name: 'ZBLL U 24',
    notation: "F U R U' R D R' U' R D' R2 U R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 24情况',
    recognition: 'ZBLL-U，24情况识别',
    searchKeys: ['zbll', 'u', '24', 'zz'],
  },

  // ZBLL U - 25
  {
    id: 'zbll_u_25',
    name: 'ZBLL U 25',
    notation: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的U 25情况',
    recognition: 'ZBLL-U，25情况识别',
    searchKeys: ['zbll', 'u', '25', 'zz'],
  },

  // ZBLL U - 26
  {
    id: 'zbll_u_26',
    name: 'ZBLL U 26',
    notation: "r2 F2 r U2 r U' L' U R' U R U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 26情况',
    recognition: 'ZBLL-U，26情况识别',
    searchKeys: ['zbll', 'u', '26', 'zz'],
  },

  // ZBLL U - 27
  {
    id: 'zbll_u_27',
    name: 'ZBLL U 27',
    notation: "y' F2 R U' R' U' R U R' F' R U R' U' R' F R F2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 27情况',
    recognition: 'ZBLL-U，27情况识别',
    searchKeys: ['zbll', 'u', '27', 'zz'],
  },

  // ZBLL U - 28
  {
    id: 'zbll_u_28',
    name: 'ZBLL U 28',
    notation: "R2 B2 R' B2 R' U R U' L U' L' U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 28情况',
    recognition: 'ZBLL-U，28情况识别',
    searchKeys: ['zbll', 'u', '28', 'zz'],
  },

  // ZBLL U - 29
  {
    id: 'zbll_u_29',
    name: 'ZBLL U 29',
    notation: "y' F U R2 D' R U' R' D R2 F' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 29情况',
    recognition: 'ZBLL-U，29情况识别',
    searchKeys: ['zbll', 'u', '29', 'zz'],
  },

  // ZBLL U - 30
  {
    id: 'zbll_u_30',
    name: 'ZBLL U 30',
    notation: "y' R' U' R F R2 D' R U R' D R2 U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 30情况',
    recognition: 'ZBLL-U，30情况识别',
    searchKeys: ['zbll', 'u', '30', 'zz'],
  },

  // ZBLL U - 31
  {
    id: 'zbll_u_31',
    name: 'ZBLL U 31',
    notation: "y R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 22,
    explanation: 'ZZ方法中的U 31情况',
    recognition: 'ZBLL-U，31情况识别',
    searchKeys: ['zbll', 'u', '31', 'zz'],
  },

  // ZBLL U - 32
  {
    id: 'zbll_u_32',
    name: 'ZBLL U 32',
    notation: "y' R2 F' R U R' U' R' F R2 U' R' U2 R2 U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 32情况',
    recognition: 'ZBLL-U，32情况识别',
    searchKeys: ['zbll', 'u', '32', 'zz'],
  },

  // ZBLL U - 33
  {
    id: 'zbll_u_33',
    name: 'ZBLL U 33',
    notation: "y F U R U2 R' U R U R2 F' r U R U' r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 33情况',
    recognition: 'ZBLL-U，33情况识别',
    searchKeys: ['zbll', 'u', '33', 'zz'],
  },

  // ZBLL U - 34
  {
    id: 'zbll_u_34',
    name: 'ZBLL U 34',
    notation: "y' R U2 R' U2 R' F R U R U2 R' U' R U2 R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 34情况',
    recognition: 'ZBLL-U，34情况识别',
    searchKeys: ['zbll', 'u', '34', 'zz'],
  },

  // ZBLL U - 35
  {
    id: 'zbll_u_35',
    name: 'ZBLL U 35',
    notation: "y' r U R' U' r' F R2 U' R' U' R U2 R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 35情况',
    recognition: 'ZBLL-U，35情况识别',
    searchKeys: ['zbll', 'u', '35', 'zz'],
  },

  // ZBLL U - 36
  {
    id: 'zbll_u_36',
    name: 'ZBLL U 36',
    notation: "R2 F R U R U' R' F' R U' R2 D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 36情况',
    recognition: 'ZBLL-U，36情况识别',
    searchKeys: ['zbll', 'u', '36', 'zz'],
  },

  // ZBLL U - 37
  {
    id: 'zbll_u_37',
    name: 'ZBLL U 37',
    notation: "y2 R U R' U R U R' U2 R U' R2 D' R U' R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 37情况',
    recognition: 'ZBLL-U，37情况识别',
    searchKeys: ['zbll', 'u', '37', 'zz'],
  },

  // ZBLL U - 38
  {
    id: 'zbll_u_38',
    name: 'ZBLL U 38',
    notation: "R U R' U R U' R' U2 R' D' R U2 R' D R2 U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 38情况',
    recognition: 'ZBLL-U，38情况识别',
    searchKeys: ['zbll', 'u', '38', 'zz'],
  },

  // ZBLL U - 39
  {
    id: 'zbll_u_39',
    name: 'ZBLL U 39',
    notation: "R' U' R U2 R' F' R U R' U' R' F R2 U2 R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 39情况',
    recognition: 'ZBLL-U，39情况识别',
    searchKeys: ['zbll', 'u', '39', 'zz'],
  },

  // ZBLL U - 40
  {
    id: 'zbll_u_40',
    name: 'ZBLL U 40',
    notation: "y R2 D' R U2 R' D R U2 R U R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 40情况',
    recognition: 'ZBLL-U，40情况识别',
    searchKeys: ['zbll', 'u', '40', 'zz'],
  },

  // ZBLL U - 41
  {
    id: 'zbll_u_41',
    name: 'ZBLL U 41',
    notation: "x' R2 D2 R' U2 R D2 R' U2 R' x",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的U 41情况',
    recognition: 'ZBLL-U，41情况识别',
    searchKeys: ['zbll', 'u', '41', 'zz'],
  },

  // ZBLL U - 42
  {
    id: 'zbll_u_42',
    name: 'ZBLL U 42',
    notation: "y2 x R2 D2 R U2 R' D2 R U2 R x'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的U 42情况',
    recognition: 'ZBLL-U，42情况识别',
    searchKeys: ['zbll', 'u', '42', 'zz'],
  },

  // ZBLL U - 43
  {
    id: 'zbll_u_43',
    name: 'ZBLL U 43',
    notation: "F R U' R' U R U R' U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 43情况',
    recognition: 'ZBLL-U，43情况识别',
    searchKeys: ['zbll', 'u', '43', 'zz'],
  },

  // ZBLL U - 44
  {
    id: 'zbll_u_44',
    name: 'ZBLL U 44',
    notation: "y2 R U' R2 F R U R U' R2 F' R U' F' U F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 44情况',
    recognition: 'ZBLL-U，44情况识别',
    searchKeys: ['zbll', 'u', '44', 'zz'],
  },

  // ZBLL U - 45
  {
    id: 'zbll_u_45',
    name: 'ZBLL U 45',
    notation: "R U R' U R' D' R U2 R' D R2 U' R' U2 R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 45情况',
    recognition: 'ZBLL-U，45情况识别',
    searchKeys: ['zbll', 'u', '45', 'zz'],
  },

  // ZBLL U - 46
  {
    id: 'zbll_u_46',
    name: 'ZBLL U 46',
    notation: "y' R U' R' U' R U' R' U R' D' R U R' D R2 U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 46情况',
    recognition: 'ZBLL-U，46情况识别',
    searchKeys: ['zbll', 'u', '46', 'zz'],
  },

  // ZBLL U - 47
  {
    id: 'zbll_u_47',
    name: 'ZBLL U 47',
    notation: "R' U2 R U R' U R' D' R U' R' D R U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的U 47情况',
    recognition: 'ZBLL-U，47情况识别',
    searchKeys: ['zbll', 'u', '47', 'zz'],
  },

  // ZBLL U - 48
  {
    id: 'zbll_u_48',
    name: 'ZBLL U 48',
    notation: "y2 R U2 R' U' R U' R D R' U R D' R' U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 48情况',
    recognition: 'ZBLL-U，48情况识别',
    searchKeys: ['zbll', 'u', '48', 'zz'],
  },

  // ZBLL U - 49
  {
    id: 'zbll_u_49',
    name: 'ZBLL U 49',
    notation: "R U' R' U' R U R D R' U R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 49情况',
    recognition: 'ZBLL-U，49情况识别',
    searchKeys: ['zbll', 'u', '49', 'zz'],
  },

  // ZBLL U - 50
  {
    id: 'zbll_u_50',
    name: 'ZBLL U 50',
    notation: "y' F R U R' U' R U R' U' F' U' R' F' U' F U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 50情况',
    recognition: 'ZBLL-U，50情况识别',
    searchKeys: ['zbll', 'u', '50', 'zz'],
  },

  // ZBLL U - 51
  {
    id: 'zbll_u_51',
    name: 'ZBLL U 51',
    notation: "R U R' L' U2 R U' R' U' R U' R' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 51情况',
    recognition: 'ZBLL-U，51情况识别',
    searchKeys: ['zbll', 'u', '51', 'zz'],
  },

  // ZBLL U - 52
  {
    id: 'zbll_u_52',
    name: 'ZBLL U 52',
    notation: "R2 D' R U R' D R U R U' R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 52情况',
    recognition: 'ZBLL-U，52情况识别',
    searchKeys: ['zbll', 'u', '52', 'zz'],
  },

  // ZBLL U - 53
  {
    id: 'zbll_u_53',
    name: 'ZBLL U 53',
    notation: "F U R U2 R' U R U R' U R U2 R' U R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的U 53情况',
    recognition: 'ZBLL-U，53情况识别',
    searchKeys: ['zbll', 'u', '53', 'zz'],
  },

  // ZBLL U - 54
  {
    id: 'zbll_u_54',
    name: 'ZBLL U 54',
    notation: "y' r U R' U' M U R U' R' F R U R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 54情况',
    recognition: 'ZBLL-U，54情况识别',
    searchKeys: ['zbll', 'u', '54', 'zz'],
  },

  // ZBLL U - 55
  {
    id: 'zbll_u_55',
    name: 'ZBLL U 55',
    notation: "y' r U2 R2 F R F' U2 r' R U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 55情况',
    recognition: 'ZBLL-U，55情况识别',
    searchKeys: ['zbll', 'u', '55', 'zz'],
  },

  // ZBLL U - 56
  {
    id: 'zbll_u_56',
    name: 'ZBLL U 56',
    notation: "y' R' U2 R F U' R' U R U R' U R U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的U 56情况',
    recognition: 'ZBLL-U，56情况识别',
    searchKeys: ['zbll', 'u', '56', 'zz'],
  },

  // ZBLL U - 57
  {
    id: 'zbll_u_57',
    name: 'ZBLL U 57',
    notation: "y' R' D' R U' R' D R2 U2 R' U R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 57情况',
    recognition: 'ZBLL-U，57情况识别',
    searchKeys: ['zbll', 'u', '57', 'zz'],
  },

  // ZBLL U - 58
  {
    id: 'zbll_u_58',
    name: 'ZBLL U 58',
    notation: "M' U R' U' F' U F R2 U R' U R U2 r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 58情况',
    recognition: 'ZBLL-U，58情况识别',
    searchKeys: ['zbll', 'u', '58', 'zz'],
  },

  // ZBLL U - 59
  {
    id: 'zbll_u_59',
    name: 'ZBLL U 59',
    notation: "y2 R' U R U R' U' R' D' R U' R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 59情况',
    recognition: 'ZBLL-U，59情况识别',
    searchKeys: ['zbll', 'u', '59', 'zz'],
  },

  // ZBLL U - 60
  {
    id: 'zbll_u_60',
    name: 'ZBLL U 60',
    notation: "y2 R' U' F' U F U' R S' R' U R S",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 60情况',
    recognition: 'ZBLL-U，60情况识别',
    searchKeys: ['zbll', 'u', '60', 'zz'],
  },

  // ZBLL U - 61
  {
    id: 'zbll_u_61',
    name: 'ZBLL U 61',
    notation: "y' R' U' R U R' U R U2 R' U R U2 R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 61情况',
    recognition: 'ZBLL-U，61情况识别',
    searchKeys: ['zbll', 'u', '61', 'zz'],
  },

  // ZBLL U - 62
  {
    id: 'zbll_u_62',
    name: 'ZBLL U 62',
    notation: "y' R U R' U' R U' R' U2 R U' R' U2 R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 62情况',
    recognition: 'ZBLL-U，62情况识别',
    searchKeys: ['zbll', 'u', '62', 'zz'],
  },

  // ZBLL U - 63
  {
    id: 'zbll_u_63',
    name: 'ZBLL U 63',
    notation: "y R U2 R' U' R U' R' U' R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 63情况',
    recognition: 'ZBLL-U，63情况识别',
    searchKeys: ['zbll', 'u', '63', 'zz'],
  },

  // ZBLL U - 64
  {
    id: 'zbll_u_64',
    name: 'ZBLL U 64',
    notation: "y R' U2 R2 U R2 U R U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 64情况',
    recognition: 'ZBLL-U，64情况识别',
    searchKeys: ['zbll', 'u', '64', 'zz'],
  },

  // ZBLL U - 65
  {
    id: 'zbll_u_65',
    name: 'ZBLL U 65',
    notation: "y R' U2 R U R' U R U R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 65情况',
    recognition: 'ZBLL-U，65情况识别',
    searchKeys: ['zbll', 'u', '65', 'zz'],
  },

  // ZBLL U - 66
  {
    id: 'zbll_u_66',
    name: 'ZBLL U 66',
    notation: "y R U2 R2 U' R2 U' R' U R' U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的U 66情况',
    recognition: 'ZBLL-U，66情况识别',
    searchKeys: ['zbll', 'u', '66', 'zz'],
  },

  // ZBLL U - 67
  {
    id: 'zbll_u_67',
    name: 'ZBLL U 67',
    notation: "y2 R U R' U R' U2 R2 U R2 U R2 U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 67情况',
    recognition: 'ZBLL-U，67情况识别',
    searchKeys: ['zbll', 'u', '67', 'zz'],
  },

  // ZBLL U - 68
  {
    id: 'zbll_u_68',
    name: 'ZBLL U 68',
    notation: "R' U' R U' R U2 R2 U' R2 U' R2 U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 68情况',
    recognition: 'ZBLL-U，68情况识别',
    searchKeys: ['zbll', 'u', '68', 'zz'],
  },

  // ZBLL U - 69
  {
    id: 'zbll_u_69',
    name: 'ZBLL U 69',
    notation: "R' U' R U' R' U2 R2 U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的U 69情况',
    recognition: 'ZBLL-U，69情况识别',
    searchKeys: ['zbll', 'u', '69', 'zz'],
  },

  // ZBLL U - 70
  {
    id: 'zbll_u_70',
    name: 'ZBLL U 70',
    notation: "y2 R U R' U R U2 R2 U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的U 70情况',
    recognition: 'ZBLL-U，70情况识别',
    searchKeys: ['zbll', 'u', '70', 'zz'],
  },

  // ZBLL U - 71
  {
    id: 'zbll_u_71',
    name: 'ZBLL U 71',
    notation: "R U R' U' R U' R U2 R2 U' R U R' U' R2 U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的U 71情况',
    recognition: 'ZBLL-U，71情况识别',
    searchKeys: ['zbll', 'u', '71', 'zz'],
  },

  // ZBLL U - 72
  {
    id: 'zbll_u_72',
    name: 'ZBLL U 72',
    notation: "y R U2 R' U' R U' R' L' U2 L U L' U L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的U 72情况',
    recognition: 'ZBLL-U，72情况识别',
    searchKeys: ['zbll', 'u', '72', 'zz'],
  },

  // ZBLL L - 1
  {
    id: 'zbll_l_1',
    name: 'ZBLL L 1',
    notation: "y' R' U' R U' R' U2 R' D' R U2 R' D R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 1情况',
    recognition: 'ZBLL-L，1情况识别',
    searchKeys: ['zbll', 'l', '1', 'zz'],
  },

  // ZBLL L - 2
  {
    id: 'zbll_l_2',
    name: 'ZBLL L 2',
    notation: "y R D R' U2 R D' R' U' R' U2 R U' R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 2情况',
    recognition: 'ZBLL-L，2情况识别',
    searchKeys: ['zbll', 'l', '2', 'zz'],
  },

  // ZBLL L - 3
  {
    id: 'zbll_l_3',
    name: 'ZBLL L 3',
    notation: "y' R' U2 R U R2 D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的L 3情况',
    recognition: 'ZBLL-L，3情况识别',
    searchKeys: ['zbll', 'l', '3', 'zz'],
  },

  // ZBLL L - 4
  {
    id: 'zbll_l_4',
    name: 'ZBLL L 4',
    notation: "R' U2 R' D' r U2 r' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的L 4情况',
    recognition: 'ZBLL-L，4情况识别',
    searchKeys: ['zbll', 'l', '4', 'zz'],
  },

  // ZBLL L - 5
  {
    id: 'zbll_l_5',
    name: 'ZBLL L 5',
    notation: "R' U2 R U2 R' U' R2 D R' U2 R D' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 5情况',
    recognition: 'ZBLL-L，5情况识别',
    searchKeys: ['zbll', 'l', '5', 'zz'],
  },

  // ZBLL L - 6
  {
    id: 'zbll_l_6',
    name: 'ZBLL L 6',
    notation: "R' U2 R' D' R U2 R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的L 6情况',
    recognition: 'ZBLL-L，6情况识别',
    searchKeys: ['zbll', 'l', '6', 'zz'],
  },

  // ZBLL L - 7
  {
    id: 'zbll_l_7',
    name: 'ZBLL L 7',
    notation: "y' R' U' R U' R' U' R U2 R D r' U2 r D' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 7情况',
    recognition: 'ZBLL-L，7情况识别',
    searchKeys: ['zbll', 'l', '7', 'zz'],
  },

  // ZBLL L - 8
  {
    id: 'zbll_l_8',
    name: 'ZBLL L 8',
    notation: "y' F R U' R' U R U R2 D' R U R' D R2 U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的L 8情况',
    recognition: 'ZBLL-L，8情况识别',
    searchKeys: ['zbll', 'l', '8', 'zz'],
  },

  // ZBLL L - 9
  {
    id: 'zbll_l_9',
    name: 'ZBLL L 9',
    notation: "y' R' U' R2 D r' U2 r D' R2 U R U R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 9情况',
    recognition: 'ZBLL-L，9情况识别',
    searchKeys: ['zbll', 'l', '9', 'zz'],
  },

  // ZBLL L - 10
  {
    id: 'zbll_l_10',
    name: 'ZBLL L 10',
    notation: "R' U R U' R' U F' R U2 R' U2 R' F R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的L 10情况',
    recognition: 'ZBLL-L，10情况识别',
    searchKeys: ['zbll', 'l', '10', 'zz'],
  },

  // ZBLL L - 11
  {
    id: 'zbll_l_11',
    name: 'ZBLL L 11',
    notation: "R' U R2 D R' U R D' R' U2 R' U R U R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 11情况',
    recognition: 'ZBLL-L，11情况识别',
    searchKeys: ['zbll', 'l', '11', 'zz'],
  },

  // ZBLL L - 12
  {
    id: 'zbll_l_12',
    name: 'ZBLL L 12',
    notation: "y' F R U' R' U' R2 D R' U R D' R' U R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 12情况',
    recognition: 'ZBLL-L，12情况识别',
    searchKeys: ['zbll', 'l', '12', 'zz'],
  },

  // ZBLL L - 13
  {
    id: 'zbll_l_13',
    name: 'ZBLL L 13',
    notation: "R2 D' R U2 R' D R2 U R2 F' R U R U' R' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 13情况',
    recognition: 'ZBLL-L，13情况识别',
    searchKeys: ['zbll', 'l', '13', 'zz'],
  },

  // ZBLL L - 14
  {
    id: 'zbll_l_14',
    name: 'ZBLL L 14',
    notation: "y R U' R' U R U' R' U' R U R2 D' R U' R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的L 14情况',
    recognition: 'ZBLL-L，14情况识别',
    searchKeys: ['zbll', 'l', '14', 'zz'],
  },

  // ZBLL L - 15
  {
    id: 'zbll_l_15',
    name: 'ZBLL L 15',
    notation: "L U' R U R' L' U2 R U' R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的L 15情况',
    recognition: 'ZBLL-L，15情况识别',
    searchKeys: ['zbll', 'l', '15', 'zz'],
  },

  // ZBLL L - 16
  {
    id: 'zbll_l_16',
    name: 'ZBLL L 16',
    notation: "R' U2 R2 U R' U' R' U2 F R U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 16情况',
    recognition: 'ZBLL-L，16情况识别',
    searchKeys: ['zbll', 'l', '16', 'zz'],
  },

  // ZBLL L - 17
  {
    id: 'zbll_l_17',
    name: 'ZBLL L 17',
    notation: "R' U' R U' R' U R U' R' U R U' R2 D' R U2 R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的L 17情况',
    recognition: 'ZBLL-L，17情况识别',
    searchKeys: ['zbll', 'l', '17', 'zz'],
  },

  // ZBLL L - 18
  {
    id: 'zbll_l_18',
    name: 'ZBLL L 18',
    notation: "y F R' F' r U R U' r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的L 18情况',
    recognition: 'ZBLL-L，18情况识别',
    searchKeys: ['zbll', 'l', '18', 'zz'],
  },

  // ZBLL L - 19
  {
    id: 'zbll_l_19',
    name: 'ZBLL L 19',
    notation: "y' R' U2 R U2 D' R U' R U R U' R2 D",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的L 19情况',
    recognition: 'ZBLL-L，19情况识别',
    searchKeys: ['zbll', 'l', '19', 'zz'],
  },

  // ZBLL L - 20
  {
    id: 'zbll_l_20',
    name: 'ZBLL L 20',
    notation: "L R U' R' U L' R U R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 20情况',
    recognition: 'ZBLL-L，20情况识别',
    searchKeys: ['zbll', 'l', '20', 'zz'],
  },

  // ZBLL L - 21
  {
    id: 'zbll_l_21',
    name: 'ZBLL L 21',
    notation: "y R U R D R' U2 R D' R' U' R' U R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 21情况',
    recognition: 'ZBLL-L，21情况识别',
    searchKeys: ['zbll', 'l', '21', 'zz'],
  },

  // ZBLL L - 22
  {
    id: 'zbll_l_22',
    name: 'ZBLL L 22',
    notation: "R U R' U R U' R' U' L' U R U' R' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的L 22情况',
    recognition: 'ZBLL-L，22情况识别',
    searchKeys: ['zbll', 'l', '22', 'zz'],
  },

  // ZBLL L - 23
  {
    id: 'zbll_l_23',
    name: 'ZBLL L 23',
    notation: "y F R U R' U' R' F' R U2 R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 23情况',
    recognition: 'ZBLL-L，23情况识别',
    searchKeys: ['zbll', 'l', '23', 'zz'],
  },

  // ZBLL L - 24
  {
    id: 'zbll_l_24',
    name: 'ZBLL L 24',
    notation: "y' R' F' R U R' U' R' F R U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 24情况',
    recognition: 'ZBLL-L，24情况识别',
    searchKeys: ['zbll', 'l', '24', 'zz'],
  },

  // ZBLL L - 25
  {
    id: 'zbll_l_25',
    name: 'ZBLL L 25',
    notation: "y' R2 D' r U2 r' R U R' D R U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 25情况',
    recognition: 'ZBLL-L，25情况识别',
    searchKeys: ['zbll', 'l', '25', 'zz'],
  },

  // ZBLL L - 26
  {
    id: 'zbll_l_26',
    name: 'ZBLL L 26',
    notation: "y' R' U R U2 R' L' U R U L U r' F r",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 26情况',
    recognition: 'ZBLL-L，26情况识别',
    searchKeys: ['zbll', 'l', '26', 'zz'],
  },

  // ZBLL L - 27
  {
    id: 'zbll_l_27',
    name: 'ZBLL L 27',
    notation: "R' D R' U R D' R' U R2 U' R2 U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 27情况',
    recognition: 'ZBLL-L，27情况识别',
    searchKeys: ['zbll', 'l', '27', 'zz'],
  },

  // ZBLL L - 28
  {
    id: 'zbll_l_28',
    name: 'ZBLL L 28',
    notation: "y2 F' R U2 R' U2 R' F U2 R U R U' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 28情况',
    recognition: 'ZBLL-L，28情况识别',
    searchKeys: ['zbll', 'l', '28', 'zz'],
  },

  // ZBLL L - 29
  {
    id: 'zbll_l_29',
    name: 'ZBLL L 29',
    notation: "y2 F' r U R' U' r' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的L 29情况',
    recognition: 'ZBLL-L，29情况识别',
    searchKeys: ['zbll', 'l', '29', 'zz'],
  },

  // ZBLL L - 30
  {
    id: 'zbll_l_30',
    name: 'ZBLL L 30',
    notation: "y R U R' U R U' R' U R U' R' U R2 D R' U2 R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的L 30情况',
    recognition: 'ZBLL-L，30情况识别',
    searchKeys: ['zbll', 'l', '30', 'zz'],
  },

  // ZBLL L - 31
  {
    id: 'zbll_l_31',
    name: 'ZBLL L 31',
    notation: "y' R' F R U R U' R' F' U R U R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 31情况',
    recognition: 'ZBLL-L，31情况识别',
    searchKeys: ['zbll', 'l', '31', 'zz'],
  },

  // ZBLL L - 32
  {
    id: 'zbll_l_32',
    name: 'ZBLL L 32',
    notation: "y R' U' R U2 R' F' R U R' U' R' F R2 U R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的L 32情况',
    recognition: 'ZBLL-L，32情况识别',
    searchKeys: ['zbll', 'l', '32', 'zz'],
  },

  // ZBLL L - 33
  {
    id: 'zbll_l_33',
    name: 'ZBLL L 33',
    notation: "y2 F' R U2 R' U2 R' F R U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 33情况',
    recognition: 'ZBLL-L，33情况识别',
    searchKeys: ['zbll', 'l', '33', 'zz'],
  },

  // ZBLL L - 34
  {
    id: 'zbll_l_34',
    name: 'ZBLL L 34',
    notation: "y R U R' U R' D' R U2 R' D R2 U' R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的L 34情况',
    recognition: 'ZBLL-L，34情况识别',
    searchKeys: ['zbll', 'l', '34', 'zz'],
  },

  // ZBLL L - 35
  {
    id: 'zbll_l_35',
    name: 'ZBLL L 35',
    notation: "R' U' R' D' R U2 R' D R U R U' R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 35情况',
    recognition: 'ZBLL-L，35情况识别',
    searchKeys: ['zbll', 'l', '35', 'zz'],
  },

  // ZBLL L - 36
  {
    id: 'zbll_l_36',
    name: 'ZBLL L 36',
    notation: "y' F R U' R' U' R U2 R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的L 36情况',
    recognition: 'ZBLL-L，36情况识别',
    searchKeys: ['zbll', 'l', '36', 'zz'],
  },

  // ZBLL L - 37
  {
    id: 'zbll_l_37',
    name: 'ZBLL L 37',
    notation: "y2 R U R' U R U2 R D R' U2 R D' R' U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 37情况',
    recognition: 'ZBLL-L，37情况识别',
    searchKeys: ['zbll', 'l', '37', 'zz'],
  },

  // ZBLL L - 38
  {
    id: 'zbll_l_38',
    name: 'ZBLL L 38',
    notation: "y2 R U2 R' U' R2 D R' U' R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的L 38情况',
    recognition: 'ZBLL-L，38情况识别',
    searchKeys: ['zbll', 'l', '38', 'zz'],
  },

  // ZBLL L - 39
  {
    id: 'zbll_l_39',
    name: 'ZBLL L 39',
    notation: "R' D' R U2 R' D R U R U2 R' U R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 39情况',
    recognition: 'ZBLL-L，39情况识别',
    searchKeys: ['zbll', 'l', '39', 'zz'],
  },

  // ZBLL L - 40
  {
    id: 'zbll_l_40',
    name: 'ZBLL L 40',
    notation: "R' F' R U R' U' R' F R2 U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 40情况',
    recognition: 'ZBLL-L，40情况识别',
    searchKeys: ['zbll', 'l', '40', 'zz'],
  },

  // ZBLL L - 41
  {
    id: 'zbll_l_41',
    name: 'ZBLL L 41',
    notation: "y R U2 R D R' U2 R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的L 41情况',
    recognition: 'ZBLL-L，41情况识别',
    searchKeys: ['zbll', 'l', '41', 'zz'],
  },

  // ZBLL L - 42
  {
    id: 'zbll_l_42',
    name: 'ZBLL L 42',
    notation: "y R U2 R' U2 R U R2 D' R U2 R' D R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 42情况',
    recognition: 'ZBLL-L，42情况识别',
    searchKeys: ['zbll', 'l', '42', 'zz'],
  },

  // ZBLL L - 43
  {
    id: 'zbll_l_43',
    name: 'ZBLL L 43',
    notation: "y2 F R U R' U' R' F' U' R U R U' R' U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的L 43情况',
    recognition: 'ZBLL-L，43情况识别',
    searchKeys: ['zbll', 'l', '43', 'zz'],
  },

  // ZBLL L - 44
  {
    id: 'zbll_l_44',
    name: 'ZBLL L 44',
    notation: "y2 R U R' U R U R' U2 R' D' r U2 r' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 44情况',
    recognition: 'ZBLL-L，44情况识别',
    searchKeys: ['zbll', 'l', '44', 'zz'],
  },

  // ZBLL L - 45
  {
    id: 'zbll_l_45',
    name: 'ZBLL L 45',
    notation: "y R U' R2 D' R U' R' D R U2 R U' R' U' R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的L 45情况',
    recognition: 'ZBLL-L，45情况识别',
    searchKeys: ['zbll', 'l', '45', 'zz'],
  },

  // ZBLL L - 46
  {
    id: 'zbll_l_46',
    name: 'ZBLL L 46',
    notation: "y2 R' F' R U2 R U2 R' F U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 46情况',
    recognition: 'ZBLL-L，46情况识别',
    searchKeys: ['zbll', 'l', '46', 'zz'],
  },

  // ZBLL L - 47
  {
    id: 'zbll_l_47',
    name: 'ZBLL L 47',
    notation: "y R' U R U2 R' U' R U2 R' U' R U' R2 D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的L 47情况',
    recognition: 'ZBLL-L，47情况识别',
    searchKeys: ['zbll', 'l', '47', 'zz'],
  },

  // ZBLL L - 48
  {
    id: 'zbll_l_48',
    name: 'ZBLL L 48',
    notation: "y' R' F' R U R' U' R' F D' R U' R' D R2 U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的L 48情况',
    recognition: 'ZBLL-L，48情况识别',
    searchKeys: ['zbll', 'l', '48', 'zz'],
  },

  // ZBLL L - 49
  {
    id: 'zbll_l_49',
    name: 'ZBLL L 49',
    notation: "y r U2 r2 F R F' r2 R' U2 r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的L 49情况',
    recognition: 'ZBLL-L，49情况识别',
    searchKeys: ['zbll', 'l', '49', 'zz'],
  },

  // ZBLL L - 50
  {
    id: 'zbll_l_50',
    name: 'ZBLL L 50',
    notation: "y R U' R' U R U' R' U' R U R' U2 R' D' R U R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的L 50情况',
    recognition: 'ZBLL-L，50情况识别',
    searchKeys: ['zbll', 'l', '50', 'zz'],
  },

  // ZBLL L - 51
  {
    id: 'zbll_l_51',
    name: 'ZBLL L 51',
    notation: "R' U R U' R' U R U R' U' R U2 R D R' U' R D' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的L 51情况',
    recognition: 'ZBLL-L，51情况识别',
    searchKeys: ['zbll', 'l', '51', 'zz'],
  },

  // ZBLL L - 52
  {
    id: 'zbll_l_52',
    name: 'ZBLL L 52',
    notation: "r U2 R r2 F R' F' r2 U2 r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的L 52情况',
    recognition: 'ZBLL-L，52情况识别',
    searchKeys: ['zbll', 'l', '52', 'zz'],
  },

  // ZBLL L - 53
  {
    id: 'zbll_l_53',
    name: 'ZBLL L 53',
    notation: "y2 F' r U R' U R' D R U' R' D' R U' r' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 53情况',
    recognition: 'ZBLL-L，53情况识别',
    searchKeys: ['zbll', 'l', '53', 'zz'],
  },

  // ZBLL L - 54
  {
    id: 'zbll_l_54',
    name: 'ZBLL L 54',
    notation: "r U R2 D' R U2 R' D R U r' F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的L 54情况',
    recognition: 'ZBLL-L，54情况识别',
    searchKeys: ['zbll', 'l', '54', 'zz'],
  },

  // ZBLL L - 55
  {
    id: 'zbll_l_55',
    name: 'ZBLL L 55',
    notation: "y2 x' r2 U' r U2 R' F R U2 r2 F L'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的L 55情况',
    recognition: 'ZBLL-L，55情况识别',
    searchKeys: ['zbll', 'l', '55', 'zz'],
  },

  // ZBLL L - 56
  {
    id: 'zbll_l_56',
    name: 'ZBLL L 56',
    notation: "y2 B' R U R' U' R' F R2 U' R' U' R U R' S z'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 56情况',
    recognition: 'ZBLL-L，56情况识别',
    searchKeys: ['zbll', 'l', '56', 'zz'],
  },

  // ZBLL L - 57
  {
    id: 'zbll_l_57',
    name: 'ZBLL L 57',
    notation: "y' R' U' R U R' F' R U R' U' R' F R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的L 57情况',
    recognition: 'ZBLL-L，57情况识别',
    searchKeys: ['zbll', 'l', '57', 'zz'],
  },

  // ZBLL L - 58
  {
    id: 'zbll_l_58',
    name: 'ZBLL L 58',
    notation: "y F R U R2 F R F' R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的L 58情况',
    recognition: 'ZBLL-L，58情况识别',
    searchKeys: ['zbll', 'l', '58', 'zz'],
  },

  // ZBLL L - 59
  {
    id: 'zbll_l_59',
    name: 'ZBLL L 59',
    notation: "y' L' U2 R U' R' U2 L R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的L 59情况',
    recognition: 'ZBLL-L，59情况识别',
    searchKeys: ['zbll', 'l', '59', 'zz'],
  },

  // ZBLL L - 60
  {
    id: 'zbll_l_60',
    name: 'ZBLL L 60',
    notation: "y2 R U R' U F' R U2 R' U' R' U' R' F R U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的L 60情况',
    recognition: 'ZBLL-L，60情况识别',
    searchKeys: ['zbll', 'l', '60', 'zz'],
  },

  // ZBLL L - 61
  {
    id: 'zbll_l_61',
    name: 'ZBLL L 61',
    notation: "y' R2 U R' U R' U' R U' R' U' R U R U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 61情况',
    recognition: 'ZBLL-L，61情况识别',
    searchKeys: ['zbll', 'l', '61', 'zz'],
  },

  // ZBLL L - 62
  {
    id: 'zbll_l_62',
    name: 'ZBLL L 62',
    notation: "y R U2 R' U' R U' R' U R' U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 62情况',
    recognition: 'ZBLL-L，62情况识别',
    searchKeys: ['zbll', 'l', '62', 'zz'],
  },

  // ZBLL L - 63
  {
    id: 'zbll_l_63',
    name: 'ZBLL L 63',
    notation: "y R U R' U R U2 R' U R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 63情况',
    recognition: 'ZBLL-L，63情况识别',
    searchKeys: ['zbll', 'l', '63', 'zz'],
  },

  // ZBLL L - 64
  {
    id: 'zbll_l_64',
    name: 'ZBLL L 64',
    notation: "y R2 U' R U R U' R' U' R U' R' U R' U R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 64情况',
    recognition: 'ZBLL-L，64情况识别',
    searchKeys: ['zbll', 'l', '64', 'zz'],
  },

  // ZBLL L - 65
  {
    id: 'zbll_l_65',
    name: 'ZBLL L 65',
    notation: "R' U2 R U R' U R U' R U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 65情况',
    recognition: 'ZBLL-L，65情况识别',
    searchKeys: ['zbll', 'l', '65', 'zz'],
  },

  // ZBLL L - 66
  {
    id: 'zbll_l_66',
    name: 'ZBLL L 66',
    notation: "y2 R2 U' R U' R U R' U R U R' U' R' U R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 66情况',
    recognition: 'ZBLL-L，66情况识别',
    searchKeys: ['zbll', 'l', '66', 'zz'],
  },

  // ZBLL L - 67
  {
    id: 'zbll_l_67',
    name: 'ZBLL L 67',
    notation: "R' U' R U' R' U2 R U' R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 67情况',
    recognition: 'ZBLL-L，67情况识别',
    searchKeys: ['zbll', 'l', '67', 'zz'],
  },

  // ZBLL L - 68
  {
    id: 'zbll_l_68',
    name: 'ZBLL L 68',
    notation: "R2 U R' U' R' U R U R' U R U' R U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的L 68情况',
    recognition: 'ZBLL-L，68情况识别',
    searchKeys: ['zbll', 'l', '68', 'zz'],
  },

  // ZBLL L - 69
  {
    id: 'zbll_l_69',
    name: 'ZBLL L 69',
    notation: "y R U2 R' U' R U' R' U2 R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 69情况',
    recognition: 'ZBLL-L，69情况识别',
    searchKeys: ['zbll', 'l', '69', 'zz'],
  },

  // ZBLL L - 70
  {
    id: 'zbll_l_70',
    name: 'ZBLL L 70',
    notation: "y R U R' U R U2 R' U2 R U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 70情况',
    recognition: 'ZBLL-L，70情况识别',
    searchKeys: ['zbll', 'l', '70', 'zz'],
  },

  // ZBLL L - 71
  {
    id: 'zbll_l_71',
    name: 'ZBLL L 71',
    notation: "y' R U R' U R U' R' U R U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的L 71情况',
    recognition: 'ZBLL-L，71情况识别',
    searchKeys: ['zbll', 'l', '71', 'zz'],
  },

  // ZBLL L - 72
  {
    id: 'zbll_l_72',
    name: 'ZBLL L 72',
    notation: "R U R' U R U' R' U R U2 R' U' R U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的L 72情况',
    recognition: 'ZBLL-L，72情况识别',
    searchKeys: ['zbll', 'l', '72', 'zz'],
  },

  // ZBLL Pi - 1
  {
    id: 'zbll_pi_1',
    name: 'ZBLL Pi 1',
    notation: "y' R U R' U R U2 R2 F' r U R U' r' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 1情况',
    recognition: 'ZBLL-Pi，1情况识别',
    searchKeys: ['zbll', 'pi', '1', 'zz'],
  },

  // ZBLL Pi - 2
  {
    id: 'zbll_pi_2',
    name: 'ZBLL Pi 2',
    notation: "y' r' F' r U' r' F2 r2 U R' U' r' F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 2情况',
    recognition: 'ZBLL-Pi，2情况识别',
    searchKeys: ['zbll', 'pi', '2', 'zz'],
  },

  // ZBLL Pi - 3
  {
    id: 'zbll_pi_3',
    name: 'ZBLL Pi 3',
    notation: "F R U' R' U R U R2 F' R U2 R U' R' U R U2 R' U'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的Pi 3情况',
    recognition: 'ZBLL-Pi，3情况识别',
    searchKeys: ['zbll', 'pi', '3', 'zz'],
  },

  // ZBLL Pi - 4
  {
    id: 'zbll_pi_4',
    name: 'ZBLL Pi 4',
    notation: "y2 R U R D R' U' R D' R U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 4情况',
    recognition: 'ZBLL-Pi，4情况识别',
    searchKeys: ['zbll', 'pi', '4', 'zz'],
  },

  // ZBLL Pi - 5
  {
    id: 'zbll_pi_5',
    name: 'ZBLL Pi 5',
    notation: "F R' F' R U2 R U2 R' U' r U R' U R U2 r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 5情况',
    recognition: 'ZBLL-Pi，5情况识别',
    searchKeys: ['zbll', 'pi', '5', 'zz'],
  },

  // ZBLL Pi - 6
  {
    id: 'zbll_pi_6',
    name: 'ZBLL Pi 6',
    notation: "F R U R' U' R' F' R U2 R' U' R2 U' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 6情况',
    recognition: 'ZBLL-Pi，6情况识别',
    searchKeys: ['zbll', 'pi', '6', 'zz'],
  },

  // ZBLL Pi - 7
  {
    id: 'zbll_pi_7',
    name: 'ZBLL Pi 7',
    notation: "R2 F R U R U' R' F' R U' R' U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 7情况',
    recognition: 'ZBLL-Pi，7情况识别',
    searchKeys: ['zbll', 'pi', '7', 'zz'],
  },

  // ZBLL Pi - 8
  {
    id: 'zbll_pi_8',
    name: 'ZBLL Pi 8',
    notation: "y F U R U' R' U R U2 R' U' R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 8情况',
    recognition: 'ZBLL-Pi，8情况识别',
    searchKeys: ['zbll', 'pi', '8', 'zz'],
  },

  // ZBLL Pi - 9
  {
    id: 'zbll_pi_9',
    name: 'ZBLL Pi 9',
    notation: "y' R U R' U R U' R' U' R' F' R U2 R U2 R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 9情况',
    recognition: 'ZBLL-Pi，9情况识别',
    searchKeys: ['zbll', 'pi', '9', 'zz'],
  },

  // ZBLL Pi - 10
  {
    id: 'zbll_pi_10',
    name: 'ZBLL Pi 10',
    notation: "y' F U' R U' R' U R U R' U2 R U2 R' U F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 10情况',
    recognition: 'ZBLL-Pi，10情况识别',
    searchKeys: ['zbll', 'pi', '10', 'zz'],
  },

  // ZBLL Pi - 11
  {
    id: 'zbll_pi_11',
    name: 'ZBLL Pi 11',
    notation: "y' R F U R2 U2 R2 U R2 U R2 F' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的Pi 11情况',
    recognition: 'ZBLL-Pi，11情况识别',
    searchKeys: ['zbll', 'pi', '11', 'zz'],
  },

  // ZBLL Pi - 12
  {
    id: 'zbll_pi_12',
    name: 'ZBLL Pi 12',
    notation: "R' U' F' R U R' U' R' F R2 U2 R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 12情况',
    recognition: 'ZBLL-Pi，12情况识别',
    searchKeys: ['zbll', 'pi', '12', 'zz'],
  },

  // ZBLL Pi - 13
  {
    id: 'zbll_pi_13',
    name: 'ZBLL Pi 13',
    notation: "y R2 D' R U2 R' D R2 U R2 D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 13情况',
    recognition: 'ZBLL-Pi，13情况识别',
    searchKeys: ['zbll', 'pi', '13', 'zz'],
  },

  // ZBLL Pi - 14
  {
    id: 'zbll_pi_14',
    name: 'ZBLL Pi 14',
    notation: "y' R2 D R' U2 R D' R2 U' R2 D R' U' R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 14情况',
    recognition: 'ZBLL-Pi，14情况识别',
    searchKeys: ['zbll', 'pi', '14', 'zz'],
  },

  // ZBLL Pi - 15
  {
    id: 'zbll_pi_15',
    name: 'ZBLL Pi 15',
    notation: "R' U' R U' R2 D' R U R' D R2 U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 15情况',
    recognition: 'ZBLL-Pi，15情况识别',
    searchKeys: ['zbll', 'pi', '15', 'zz'],
  },

  // ZBLL Pi - 16
  {
    id: 'zbll_pi_16',
    name: 'ZBLL Pi 16',
    notation: "R U R' U R2 D R' U' R D' R2 U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 16情况',
    recognition: 'ZBLL-Pi，16情况识别',
    searchKeys: ['zbll', 'pi', '16', 'zz'],
  },

  // ZBLL Pi - 17
  {
    id: 'zbll_pi_17',
    name: 'ZBLL Pi 17',
    notation: "R' U' R U R2 F' R U R U' R' F U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 17情况',
    recognition: 'ZBLL-Pi，17情况识别',
    searchKeys: ['zbll', 'pi', '17', 'zz'],
  },

  // ZBLL Pi - 18
  {
    id: 'zbll_pi_18',
    name: 'ZBLL Pi 18',
    notation: "y R U2 R' U' R U2 R' U2 R U' R2 D' R U' R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 18情况',
    recognition: 'ZBLL-Pi，18情况识别',
    searchKeys: ['zbll', 'pi', '18', 'zz'],
  },

  // ZBLL Pi - 19
  {
    id: 'zbll_pi_19',
    name: 'ZBLL Pi 19',
    notation: "y' F U R U2 R' U R U R' F' R U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 19情况',
    recognition: 'ZBLL-Pi，19情况识别',
    searchKeys: ['zbll', 'pi', '19', 'zz'],
  },

  // ZBLL Pi - 20
  {
    id: 'zbll_pi_20',
    name: 'ZBLL Pi 20',
    notation: "y2 R U2 R' U' R U' R' U' F U R U2 R' U R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的Pi 20情况',
    recognition: 'ZBLL-Pi，20情况识别',
    searchKeys: ['zbll', 'pi', '20', 'zz'],
  },

  // ZBLL Pi - 21
  {
    id: 'zbll_pi_21',
    name: 'ZBLL Pi 21',
    notation: "y2 L' U R U' L U' R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的Pi 21情况',
    recognition: 'ZBLL-Pi，21情况识别',
    searchKeys: ['zbll', 'pi', '21', 'zz'],
  },

  // ZBLL Pi - 22
  {
    id: 'zbll_pi_22',
    name: 'ZBLL Pi 22',
    notation: "r' U r U r' U' r U R2 F R F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的Pi 22情况',
    recognition: 'ZBLL-Pi，22情况识别',
    searchKeys: ['zbll', 'pi', '22', 'zz'],
  },

  // ZBLL Pi - 23
  {
    id: 'zbll_pi_23',
    name: 'ZBLL Pi 23',
    notation: "r U' r' U' r U r' U' R2 B' R' B R' U",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 23情况',
    recognition: 'ZBLL-Pi，23情况识别',
    searchKeys: ['zbll', 'pi', '23', 'zz'],
  },

  // ZBLL Pi - 24
  {
    id: 'zbll_pi_24',
    name: 'ZBLL Pi 24',
    notation: "y' R U R' U F' R U2 R' U2 R' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的Pi 24情况',
    recognition: 'ZBLL-Pi，24情况识别',
    searchKeys: ['zbll', 'pi', '24', 'zz'],
  },

  // ZBLL Pi - 25
  {
    id: 'zbll_pi_25',
    name: 'ZBLL Pi 25',
    notation: "R' U' R' D' R U' R' D R2 U R' U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 25情况',
    recognition: 'ZBLL-Pi，25情况识别',
    searchKeys: ['zbll', 'pi', '25', 'zz'],
  },

  // ZBLL Pi - 26
  {
    id: 'zbll_pi_26',
    name: 'ZBLL Pi 26',
    notation: "R U' R' U' R U' R' U R U R' U R' F' R U R U' R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的Pi 26情况',
    recognition: 'ZBLL-Pi，26情况识别',
    searchKeys: ['zbll', 'pi', '26', 'zz'],
  },

  // ZBLL Pi - 27
  {
    id: 'zbll_pi_27',
    name: 'ZBLL Pi 27',
    notation: "y R U R' U R U' R' U R2 D R' U' R D' R' U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 27情况',
    recognition: 'ZBLL-Pi，27情况识别',
    searchKeys: ['zbll', 'pi', '27', 'zz'],
  },

  // ZBLL Pi - 28
  {
    id: 'zbll_pi_28',
    name: 'ZBLL Pi 28',
    notation: "y2 R' U2 R U R' U' R U R2 F R U R U' R' F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 28情况',
    recognition: 'ZBLL-Pi，28情况识别',
    searchKeys: ['zbll', 'pi', '28', 'zz'],
  },

  // ZBLL Pi - 29
  {
    id: 'zbll_pi_29',
    name: 'ZBLL Pi 29',
    notation: "R U' L' U R' U' L U' R U' L' U R' U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 29情况',
    recognition: 'ZBLL-Pi，29情况识别',
    searchKeys: ['zbll', 'pi', '29', 'zz'],
  },

  // ZBLL Pi - 30
  {
    id: 'zbll_pi_30',
    name: 'ZBLL Pi 30',
    notation: "y F U R U' R' U R U' R2 F' R U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 30情况',
    recognition: 'ZBLL-Pi，30情况识别',
    searchKeys: ['zbll', 'pi', '30', 'zz'],
  },

  // ZBLL Pi - 31
  {
    id: 'zbll_pi_31',
    name: 'ZBLL Pi 31',
    notation: "F U R U' R2 F' R2 U R' F' U' F U2 R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 31情况',
    recognition: 'ZBLL-Pi，31情况识别',
    searchKeys: ['zbll', 'pi', '31', 'zz'],
  },

  // ZBLL Pi - 32
  {
    id: 'zbll_pi_32',
    name: 'ZBLL Pi 32',
    notation: "y' R U R' U R U' R2 F R F' R U' R' F' U F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 32情况',
    recognition: 'ZBLL-Pi，32情况识别',
    searchKeys: ['zbll', 'pi', '32', 'zz'],
  },

  // ZBLL Pi - 33
  {
    id: 'zbll_pi_33',
    name: 'ZBLL Pi 33',
    notation: "y R' U' R U' B2 R' U2 R U2 l U2 l'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的Pi 33情况',
    recognition: 'ZBLL-Pi，33情况识别',
    searchKeys: ['zbll', 'pi', '33', 'zz'],
  },

  // ZBLL Pi - 34
  {
    id: 'zbll_pi_34',
    name: 'ZBLL Pi 34',
    notation: "y' R' U' R U' R' U R U' R' U R' D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 34情况',
    recognition: 'ZBLL-Pi，34情况识别',
    searchKeys: ['zbll', 'pi', '34', 'zz'],
  },

  // ZBLL Pi - 35
  {
    id: 'zbll_pi_35',
    name: 'ZBLL Pi 35',
    notation: "y2 R2 D R' U R D' R' U R' U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 35情况',
    recognition: 'ZBLL-Pi，35情况识别',
    searchKeys: ['zbll', 'pi', '35', 'zz'],
  },

  // ZBLL Pi - 36
  {
    id: 'zbll_pi_36',
    name: 'ZBLL Pi 36',
    notation: "R' U' R U' R' U2 R U' L' U R U' L U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 36情况',
    recognition: 'ZBLL-Pi，36情况识别',
    searchKeys: ['zbll', 'pi', '36', 'zz'],
  },

  // ZBLL Pi - 37
  {
    id: 'zbll_pi_37',
    name: 'ZBLL Pi 37',
    notation: "R' F R U R' U' R' F' R2 U' R' U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 37情况',
    recognition: 'ZBLL-Pi，37情况识别',
    searchKeys: ['zbll', 'pi', '37', 'zz'],
  },

  // ZBLL Pi - 38
  {
    id: 'zbll_pi_38',
    name: 'ZBLL Pi 38',
    notation: "R U R D R' U R D' R2 U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 38情况',
    recognition: 'ZBLL-Pi，38情况识别',
    searchKeys: ['zbll', 'pi', '38', 'zz'],
  },

  // ZBLL Pi - 39
  {
    id: 'zbll_pi_39',
    name: 'ZBLL Pi 39',
    notation: "y' R2 F2 R2 U' R U R' U R2 F2 R' U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 39情况',
    recognition: 'ZBLL-Pi，39情况识别',
    searchKeys: ['zbll', 'pi', '39', 'zz'],
  },

  // ZBLL Pi - 40
  {
    id: 'zbll_pi_40',
    name: 'ZBLL Pi 40',
    notation: "y' R' U' R U' R' U R U' R2 D' R U R' D R U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 40情况',
    recognition: 'ZBLL-Pi，40情况识别',
    searchKeys: ['zbll', 'pi', '40', 'zz'],
  },

  // ZBLL Pi - 41
  {
    id: 'zbll_pi_41',
    name: 'ZBLL Pi 41',
    notation: "R U R' U' R' F R2 U R' U' R U R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 41情况',
    recognition: 'ZBLL-Pi，41情况识别',
    searchKeys: ['zbll', 'pi', '41', 'zz'],
  },

  // ZBLL Pi - 42
  {
    id: 'zbll_pi_42',
    name: 'ZBLL Pi 42',
    notation: "y2 R U2 R' U2 R' F R2 U' R' U2 R U2 R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 42情况',
    recognition: 'ZBLL-Pi，42情况识别',
    searchKeys: ['zbll', 'pi', '42', 'zz'],
  },

  // ZBLL Pi - 43
  {
    id: 'zbll_pi_43',
    name: 'ZBLL Pi 43',
    notation: "y R U2 R' U' R U R' U' R' D' R U' R' D R2 U' R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 22,
    explanation: 'ZZ方法中的Pi 43情况',
    recognition: 'ZBLL-Pi，43情况识别',
    searchKeys: ['zbll', 'pi', '43', 'zz'],
  },

  // ZBLL Pi - 44
  {
    id: 'zbll_pi_44',
    name: 'ZBLL Pi 44',
    notation: "r' F' r U r U2 r' F2 U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 44情况',
    recognition: 'ZBLL-Pi，44情况识别',
    searchKeys: ['zbll', 'pi', '44', 'zz'],
  },

  // ZBLL Pi - 45
  {
    id: 'zbll_pi_45',
    name: 'ZBLL Pi 45',
    notation: "R U R' U R U2 R' U' R U' L' U R' U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 45情况',
    recognition: 'ZBLL-Pi，45情况识别',
    searchKeys: ['zbll', 'pi', '45', 'zz'],
  },

  // ZBLL Pi - 46
  {
    id: 'zbll_pi_46',
    name: 'ZBLL Pi 46',
    notation: "y' R' U2 R U R' U R2 U' r' F R' F' r",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 46情况',
    recognition: 'ZBLL-Pi，46情况识别',
    searchKeys: ['zbll', 'pi', '46', 'zz'],
  },

  // ZBLL Pi - 47
  {
    id: 'zbll_pi_47',
    name: 'ZBLL Pi 47',
    notation: "y R U R' U R U' R' U R U' R D R' U' R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 47情况',
    recognition: 'ZBLL-Pi，47情况识别',
    searchKeys: ['zbll', 'pi', '47', 'zz'],
  },

  // ZBLL Pi - 48
  {
    id: 'zbll_pi_48',
    name: 'ZBLL Pi 48',
    notation: "y' R U R' U F2 R U2 R' U2 R' F2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的Pi 48情况',
    recognition: 'ZBLL-Pi，48情况识别',
    searchKeys: ['zbll', 'pi', '48', 'zz'],
  },

  // ZBLL Pi - 49
  {
    id: 'zbll_pi_49',
    name: 'ZBLL Pi 49',
    notation: "y R U2 R' U2 R' U' F U R2 U' R' U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 49情况',
    recognition: 'ZBLL-Pi，49情况识别',
    searchKeys: ['zbll', 'pi', '49', 'zz'],
  },

  // ZBLL Pi - 50
  {
    id: 'zbll_pi_50',
    name: 'ZBLL Pi 50',
    notation: "R' F' U' F U' R U S' R' U R S",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的Pi 50情况',
    recognition: 'ZBLL-Pi，50情况识别',
    searchKeys: ['zbll', 'pi', '50', 'zz'],
  },

  // ZBLL Pi - 51
  {
    id: 'zbll_pi_51',
    name: 'ZBLL Pi 51',
    notation: "y2 R F U' R2 U2 R U R' U R2 U F' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 51情况',
    recognition: 'ZBLL-Pi，51情况识别',
    searchKeys: ['zbll', 'pi', '51', 'zz'],
  },

  // ZBLL Pi - 52
  {
    id: 'zbll_pi_52',
    name: 'ZBLL Pi 52',
    notation: "y R U R' U' R U R2 D' R U' R' D R U' R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 52情况',
    recognition: 'ZBLL-Pi，52情况识别',
    searchKeys: ['zbll', 'pi', '52', 'zz'],
  },

  // ZBLL Pi - 53
  {
    id: 'zbll_pi_53',
    name: 'ZBLL Pi 53',
    notation: "F U R' U' R2 U' R2 U2 R U2 R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 53情况',
    recognition: 'ZBLL-Pi，53情况识别',
    searchKeys: ['zbll', 'pi', '53', 'zz'],
  },

  // ZBLL Pi - 54
  {
    id: 'zbll_pi_54',
    name: 'ZBLL Pi 54',
    notation: "R U2 R2 F R F' R' F R F' R' F R F' R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 54情况',
    recognition: 'ZBLL-Pi，54情况识别',
    searchKeys: ['zbll', 'pi', '54', 'zz'],
  },

  // ZBLL Pi - 55
  {
    id: 'zbll_pi_55',
    name: 'ZBLL Pi 55',
    notation: "R2 D R' U' R D' R' U' R' U R U' R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 55情况',
    recognition: 'ZBLL-Pi，55情况识别',
    searchKeys: ['zbll', 'pi', '55', 'zz'],
  },

  // ZBLL Pi - 56
  {
    id: 'zbll_pi_56',
    name: 'ZBLL Pi 56',
    notation: "R2 D' R U R' D R U R U' R' U R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 56情况',
    recognition: 'ZBLL-Pi，56情况识别',
    searchKeys: ['zbll', 'pi', '56', 'zz'],
  },

  // ZBLL Pi - 57
  {
    id: 'zbll_pi_57',
    name: 'ZBLL Pi 57',
    notation: "y2 R U2 R' U R' D' R U R' D R2 U' R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的Pi 57情况',
    recognition: 'ZBLL-Pi，57情况识别',
    searchKeys: ['zbll', 'pi', '57', 'zz'],
  },

  // ZBLL Pi - 58
  {
    id: 'zbll_pi_58',
    name: 'ZBLL Pi 58',
    notation: "R2 D R' U2 R D' R2 U' R U R D R' U2 R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 58情况',
    recognition: 'ZBLL-Pi，58情况识别',
    searchKeys: ['zbll', 'pi', '58', 'zz'],
  },

  // ZBLL Pi - 59
  {
    id: 'zbll_pi_59',
    name: 'ZBLL Pi 59',
    notation: "y' r U R' U R' F R F' R U' R' U R U2 r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 59情况',
    recognition: 'ZBLL-Pi，59情况识别',
    searchKeys: ['zbll', 'pi', '59', 'zz'],
  },

  // ZBLL Pi - 60
  {
    id: 'zbll_pi_60',
    name: 'ZBLL Pi 60',
    notation: "y R U2 R' U' F' R U2 R' U' R U' R' F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的Pi 60情况',
    recognition: 'ZBLL-Pi，60情况识别',
    searchKeys: ['zbll', 'pi', '60', 'zz'],
  },

  // ZBLL Pi - 61
  {
    id: 'zbll_pi_61',
    name: 'ZBLL Pi 61',
    notation: "R U2 R2 U' R2 U' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的Pi 61情况',
    recognition: 'ZBLL-Pi，61情况识别',
    searchKeys: ['zbll', 'pi', '61', 'zz'],
  },

  // ZBLL Pi - 62
  {
    id: 'zbll_pi_62',
    name: 'ZBLL Pi 62',
    notation: "y' R' U2 R U R' U R2 U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 62情况',
    recognition: 'ZBLL-Pi，62情况识别',
    searchKeys: ['zbll', 'pi', '62', 'zz'],
  },

  // ZBLL Pi - 63
  {
    id: 'zbll_pi_63',
    name: 'ZBLL Pi 63',
    notation: "y' R U2 R' U2 R U' R' U2 R U' R' U2 R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 63情况',
    recognition: 'ZBLL-Pi，63情况识别',
    searchKeys: ['zbll', 'pi', '63', 'zz'],
  },

  // ZBLL Pi - 64
  {
    id: 'zbll_pi_64',
    name: 'ZBLL Pi 64',
    notation: "y R' U2 R U2 R' U R U2 R' U R U2 R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 64情况',
    recognition: 'ZBLL-Pi，64情况识别',
    searchKeys: ['zbll', 'pi', '64', 'zz'],
  },

  // ZBLL Pi - 65
  {
    id: 'zbll_pi_65',
    name: 'ZBLL Pi 65',
    notation: "y2 R' U R U' R2 U2 R U R' U R2 U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 65情况',
    recognition: 'ZBLL-Pi，65情况识别',
    searchKeys: ['zbll', 'pi', '65', 'zz'],
  },

  // ZBLL Pi - 66
  {
    id: 'zbll_pi_66',
    name: 'ZBLL Pi 66',
    notation: "y2 R U' R' U R2 U2 R' U' R U' R2 U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 66情况',
    recognition: 'ZBLL-Pi，66情况识别',
    searchKeys: ['zbll', 'pi', '66', 'zz'],
  },

  // ZBLL Pi - 67
  {
    id: 'zbll_pi_67',
    name: 'ZBLL Pi 67',
    notation: "y R U2 R' U' R U' R2 U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的Pi 67情况',
    recognition: 'ZBLL-Pi，67情况识别',
    searchKeys: ['zbll', 'pi', '67', 'zz'],
  },

  // ZBLL Pi - 68
  {
    id: 'zbll_pi_68',
    name: 'ZBLL Pi 68',
    notation: "R' U2 R2 U R2 U R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 9,
    explanation: 'ZZ方法中的Pi 68情况',
    recognition: 'ZBLL-Pi，68情况识别',
    searchKeys: ['zbll', 'pi', '68', 'zz'],
  },

  // ZBLL Pi - 69
  {
    id: 'zbll_pi_69',
    name: 'ZBLL Pi 69',
    notation: "R U R' U R U2 R' U' R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 69情况',
    recognition: 'ZBLL-Pi，69情况识别',
    searchKeys: ['zbll', 'pi', '69', 'zz'],
  },

  // ZBLL Pi - 70
  {
    id: 'zbll_pi_70',
    name: 'ZBLL Pi 70',
    notation: "R' U' R U' R' U2 R U R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的Pi 70情况',
    recognition: 'ZBLL-Pi，70情况识别',
    searchKeys: ['zbll', 'pi', '70', 'zz'],
  },

  // ZBLL Pi - 71
  {
    id: 'zbll_pi_71',
    name: 'ZBLL Pi 71',
    notation: "y R U R' U R U2 R' U R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的Pi 71情况',
    recognition: 'ZBLL-Pi，71情况识别',
    searchKeys: ['zbll', 'pi', '71', 'zz'],
  },

  // ZBLL Pi - 72
  {
    id: 'zbll_pi_72',
    name: 'ZBLL Pi 72',
    notation: "F R U R' U' R U R' U' F' R U R' U' M' U R U' r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的Pi 72情况',
    recognition: 'ZBLL-Pi，72情况识别',
    searchKeys: ['zbll', 'pi', '72', 'zz'],
  },

  // ZBLL H - 1
  {
    id: 'zbll_h_1',
    name: 'ZBLL H 1',
    notation: "y F' r U R' U' r' F R2 U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 1情况',
    recognition: 'ZBLL-H，1情况识别',
    searchKeys: ['zbll', 'h', '1', 'zz'],
  },

  // ZBLL H - 2
  {
    id: 'zbll_h_2',
    name: 'ZBLL H 2',
    notation: "y' F R' F' r U R U' r2 F2 r U L' U L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 2情况',
    recognition: 'ZBLL-H，2情况识别',
    searchKeys: ['zbll', 'h', '2', 'zz'],
  },

  // ZBLL H - 3
  {
    id: 'zbll_h_3',
    name: 'ZBLL H 3',
    notation: "y' R U2 R' U' R U R' U2 R' F R2 U' R' U' R U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的H 3情况',
    recognition: 'ZBLL-H，3情况识别',
    searchKeys: ['zbll', 'h', '3', 'zz'],
  },

  // ZBLL H - 4
  {
    id: 'zbll_h_4',
    name: 'ZBLL H 4',
    notation: "y F' R U2 R' U2 R' F U' R U R U' R' U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的H 4情况',
    recognition: 'ZBLL-H，4情况识别',
    searchKeys: ['zbll', 'h', '4', 'zz'],
  },

  // ZBLL H - 5
  {
    id: 'zbll_h_5',
    name: 'ZBLL H 5',
    notation: "y2 R' U2 R2 U R2 U R U2 R' F R U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的H 5情况',
    recognition: 'ZBLL-H，5情况识别',
    searchKeys: ['zbll', 'h', '5', 'zz'],
  },

  // ZBLL H - 6
  {
    id: 'zbll_h_6',
    name: 'ZBLL H 6',
    notation: "y' R U2 R' U' R U R' U' F' R U R' U' R' F R2 U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的H 6情况',
    recognition: 'ZBLL-H，6情况识别',
    searchKeys: ['zbll', 'h', '6', 'zz'],
  },

  // ZBLL H - 7
  {
    id: 'zbll_h_7',
    name: 'ZBLL H 7',
    notation: "R U R' U R U' R2 F' R U2 R U2 R' F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的H 7情况',
    recognition: 'ZBLL-H，7情况识别',
    searchKeys: ['zbll', 'h', '7', 'zz'],
  },

  // ZBLL H - 8
  {
    id: 'zbll_h_8',
    name: 'ZBLL H 8',
    notation: "y2 F R U' R' U R U2 R' U' R U R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 8情况',
    recognition: 'ZBLL-H，8情况识别',
    searchKeys: ['zbll', 'h', '8', 'zz'],
  },

  // ZBLL H - 9
  {
    id: 'zbll_h_9',
    name: 'ZBLL H 9',
    notation: "y2 F R' F' R2 U2 R' U R U2 R' U R U' R2 F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的H 9情况',
    recognition: 'ZBLL-H，9情况识别',
    searchKeys: ['zbll', 'h', '9', 'zz'],
  },

  // ZBLL H - 10
  {
    id: 'zbll_h_10',
    name: 'ZBLL H 10',
    notation: "y' R' U2 R U2 R2 F' R U R U' R' F U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 10情况',
    recognition: 'ZBLL-H，10情况识别',
    searchKeys: ['zbll', 'h', '10', 'zz'],
  },

  // ZBLL H - 11
  {
    id: 'zbll_h_11',
    name: 'ZBLL H 11',
    notation: "y F' R U2 R' U2 R' F R U R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的H 11情况',
    recognition: 'ZBLL-H，11情况识别',
    searchKeys: ['zbll', 'h', '11', 'zz'],
  },

  // ZBLL H - 12
  {
    id: 'zbll_h_12',
    name: 'ZBLL H 12',
    notation: "F U' R U2 R' U2 R U' R' U' R U R' U F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 12情况',
    recognition: 'ZBLL-H，12情况识别',
    searchKeys: ['zbll', 'h', '12', 'zz'],
  },

  // ZBLL H - 13
  {
    id: 'zbll_h_13',
    name: 'ZBLL H 13',
    notation: "y' R' U2 R U R' U' F' R U R' U' R' F R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的H 13情况',
    recognition: 'ZBLL-H，13情况识别',
    searchKeys: ['zbll', 'h', '13', 'zz'],
  },

  // ZBLL H - 14
  {
    id: 'zbll_h_14',
    name: 'ZBLL H 14',
    notation: "y' R U2 R' U' R2 D R' U R D' R2 U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 14情况',
    recognition: 'ZBLL-H，14情况识别',
    searchKeys: ['zbll', 'h', '14', 'zz'],
  },

  // ZBLL H - 15
  {
    id: 'zbll_h_15',
    name: 'ZBLL H 15',
    notation: "y2 R2 D' R U' R' D R2 U' R2 D' R U2 R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 15情况',
    recognition: 'ZBLL-H，15情况识别',
    searchKeys: ['zbll', 'h', '15', 'zz'],
  },

  // ZBLL H - 16
  {
    id: 'zbll_h_16',
    name: 'ZBLL H 16',
    notation: "y R' U2 R U R2 D' R U' R' D R2 U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 16情况',
    recognition: 'ZBLL-H，16情况识别',
    searchKeys: ['zbll', 'h', '16', 'zz'],
  },

  // ZBLL H - 17
  {
    id: 'zbll_h_17',
    name: 'ZBLL H 17',
    notation: "F R' F' R U2 R U2 R' U' R' F2 r U r' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 17情况',
    recognition: 'ZBLL-H，17情况识别',
    searchKeys: ['zbll', 'h', '17', 'zz'],
  },

  // ZBLL H - 18
  {
    id: 'zbll_h_18',
    name: 'ZBLL H 18',
    notation: "y2 R' U' R U' R' U F' R U R' U' R' F R2 U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的H 18情况',
    recognition: 'ZBLL-H，18情况识别',
    searchKeys: ['zbll', 'h', '18', 'zz'],
  },

  // ZBLL H - 19
  {
    id: 'zbll_h_19',
    name: 'ZBLL H 19',
    notation: "y' F R U' R' U' R U2 R' U' F' U R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的H 19情况',
    recognition: 'ZBLL-H，19情况识别',
    searchKeys: ['zbll', 'h', '19', 'zz'],
  },

  // ZBLL H - 20
  {
    id: 'zbll_h_20',
    name: 'ZBLL H 20',
    notation: "y R U R' U R U2 R' F R U' R' U' R U2 R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的H 20情况',
    recognition: 'ZBLL-H，20情况识别',
    searchKeys: ['zbll', 'h', '20', 'zz'],
  },

  // ZBLL H - 21
  {
    id: 'zbll_h_21',
    name: 'ZBLL H 21',
    notation: "R' F' R U2 R U2 R' F U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的H 21情况',
    recognition: 'ZBLL-H，21情况识别',
    searchKeys: ['zbll', 'h', '21', 'zz'],
  },

  // ZBLL H - 22
  {
    id: 'zbll_h_22',
    name: 'ZBLL H 22',
    notation: "R U R' U R U r' F R' F' r",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的H 22情况',
    recognition: 'ZBLL-H，22情况识别',
    searchKeys: ['zbll', 'h', '22', 'zz'],
  },

  // ZBLL H - 23
  {
    id: 'zbll_h_23',
    name: 'ZBLL H 23',
    notation: "y R' F R' F' R2 U' r' U r U' r' U' r",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的H 23情况',
    recognition: 'ZBLL-H，23情况识别',
    searchKeys: ['zbll', 'h', '23', 'zz'],
  },

  // ZBLL H - 24
  {
    id: 'zbll_h_24',
    name: 'ZBLL H 24',
    notation: "y' R U R2 F R F' r U' r' U r U r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的H 24情况',
    recognition: 'ZBLL-H，24情况识别',
    searchKeys: ['zbll', 'h', '24', 'zz'],
  },

  // ZBLL H - 25
  {
    id: 'zbll_h_25',
    name: 'ZBLL H 25',
    notation: "y' R' U' R y U' R U' R' U R l U' R' U l'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 25情况',
    recognition: 'ZBLL-H，25情况识别',
    searchKeys: ['zbll', 'h', '25', 'zz'],
  },

  // ZBLL H - 26
  {
    id: 'zbll_h_26',
    name: 'ZBLL H 26',
    notation: "y R U' R2 U' F2 U' R2 U R2 U F2 R2 U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 26情况',
    recognition: 'ZBLL-H，26情况识别',
    searchKeys: ['zbll', 'h', '26', 'zz'],
  },

  // ZBLL H - 27
  {
    id: 'zbll_h_27',
    name: 'ZBLL H 27',
    notation: "y F R U R' U' R U R' U' R U R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 27情况',
    recognition: 'ZBLL-H，27情况识别',
    searchKeys: ['zbll', 'h', '27', 'zz'],
  },

  // ZBLL H - 28
  {
    id: 'zbll_h_28',
    name: 'ZBLL H 28',
    notation: "x' U' R U' R' U R' F2 R U' R U R' U x",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 28情况',
    recognition: 'ZBLL-H，28情况识别',
    searchKeys: ['zbll', 'h', '28', 'zz'],
  },

  // ZBLL H - 29
  {
    id: 'zbll_h_29',
    name: 'ZBLL H 29',
    notation: "R' U2 R U R' U R U R' U' R U R' F' R U R' U' R' F R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 21,
    explanation: 'ZZ方法中的H 29情况',
    recognition: 'ZBLL-H，29情况识别',
    searchKeys: ['zbll', 'h', '29', 'zz'],
  },

  // ZBLL H - 30
  {
    id: 'zbll_h_30',
    name: 'ZBLL H 30',
    notation: "R' U' R U' R' U2 R2 U2 L' U R' U' L U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的H 30情况',
    recognition: 'ZBLL-H，30情况识别',
    searchKeys: ['zbll', 'h', '30', 'zz'],
  },

  // ZBLL H - 31
  {
    id: 'zbll_h_31',
    name: 'ZBLL H 31',
    notation: "R' U' F' U F R U' F U R U' R' U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的H 31情况',
    recognition: 'ZBLL-H，31情况识别',
    searchKeys: ['zbll', 'h', '31', 'zz'],
  },

  // ZBLL H - 32
  {
    id: 'zbll_h_32',
    name: 'ZBLL H 32',
    notation: "y' R U R' U y' R' U R U' R2 F R F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 32情况',
    recognition: 'ZBLL-H，32情况识别',
    searchKeys: ['zbll', 'h', '32', 'zz'],
  },

  // ZBLL H - 33
  {
    id: 'zbll_h_33',
    name: 'ZBLL H 33',
    notation: "R U R' U R U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的H 33情况',
    recognition: 'ZBLL-H，33情况识别',
    searchKeys: ['zbll', 'h', '33', 'zz'],
  },

  // ZBLL H - 34
  {
    id: 'zbll_h_34',
    name: 'ZBLL H 34',
    notation: "R' U' R U' R' U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的H 34情况',
    recognition: 'ZBLL-H，34情况识别',
    searchKeys: ['zbll', 'h', '34', 'zz'],
  },

  // ZBLL H - 35
  {
    id: 'zbll_h_35',
    name: 'ZBLL H 35',
    notation: "y' R' U2 R U R' U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的H 35情况',
    recognition: 'ZBLL-H，35情况识别',
    searchKeys: ['zbll', 'h', '35', 'zz'],
  },

  // ZBLL H - 36
  {
    id: 'zbll_h_36',
    name: 'ZBLL H 36',
    notation: "y' R U2 R' U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的H 36情况',
    recognition: 'ZBLL-H，36情况识别',
    searchKeys: ['zbll', 'h', '36', 'zz'],
  },

  // ZBLL H - 37
  {
    id: 'zbll_h_37',
    name: 'ZBLL H 37',
    notation: "y' R' U2 R U R' U R U R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 37情况',
    recognition: 'ZBLL-H，37情况识别',
    searchKeys: ['zbll', 'h', '37', 'zz'],
  },

  // ZBLL H - 38
  {
    id: 'zbll_h_38',
    name: 'ZBLL H 38',
    notation: "y R U2 R' U' R U' R' U' R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的H 38情况',
    recognition: 'ZBLL-H，38情况识别',
    searchKeys: ['zbll', 'h', '38', 'zz'],
  },

  // ZBLL H - 39
  {
    id: 'zbll_h_39',
    name: 'ZBLL H 39',
    notation: "R U R' U R U2 R' U' R' U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的H 39情况',
    recognition: 'ZBLL-H，39情况识别',
    searchKeys: ['zbll', 'h', '39', 'zz'],
  },

  // ZBLL H - 40
  {
    id: 'zbll_h_40',
    name: 'ZBLL H 40',
    notation: "R U R' U R U' R' U R U' R' U R' U' R2 U' R' U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 21,
    explanation: 'ZZ方法中的H 40情况',
    recognition: 'ZBLL-H，40情况识别',
    searchKeys: ['zbll', 'h', '40', 'zz'],
  },

  // ZBLL S - 1
  {
    id: 'zbll_s_1',
    name: 'ZBLL S 1',
    notation: "y2 R' U2 R U F R' U R U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的S 1情况',
    recognition: 'ZBLL-S，1情况识别',
    searchKeys: ['zbll', 's', '1', 'zz'],
  },

  // ZBLL S - 2
  {
    id: 'zbll_s_2',
    name: 'ZBLL S 2',
    notation: "R U R' U R U' R2 F' R U R U' R' F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 2情况',
    recognition: 'ZBLL-S，2情况识别',
    searchKeys: ['zbll', 's', '2', 'zz'],
  },

  // ZBLL S - 3
  {
    id: 'zbll_s_3',
    name: 'ZBLL S 3',
    notation: "R' U R U2 R' U R2 D R' U R D' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 3情况',
    recognition: 'ZBLL-S，3情况识别',
    searchKeys: ['zbll', 's', '3', 'zz'],
  },

  // ZBLL S - 4
  {
    id: 'zbll_s_4',
    name: 'ZBLL S 4',
    notation: "y2 S' U2 L' U2 L U2 L F' L' f",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的S 4情况',
    recognition: 'ZBLL-S，4情况识别',
    searchKeys: ['zbll', 's', '4', 'zz'],
  },

  // ZBLL S - 5
  {
    id: 'zbll_s_5',
    name: 'ZBLL S 5',
    notation: "y R' F R U R' U' R' F' D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 5情况',
    recognition: 'ZBLL-S，5情况识别',
    searchKeys: ['zbll', 's', '5', 'zz'],
  },

  // ZBLL S - 6
  {
    id: 'zbll_s_6',
    name: 'ZBLL S 6',
    notation: "F' R U R' U R U2 R' F U R U' R' U2 R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 6情况',
    recognition: 'ZBLL-S，6情况识别',
    searchKeys: ['zbll', 's', '6', 'zz'],
  },

  // ZBLL S - 7
  {
    id: 'zbll_s_7',
    name: 'ZBLL S 7',
    notation: "y' R' U' R U R2 U' R' U' R U D' R U R' D R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 7情况',
    recognition: 'ZBLL-S，7情况识别',
    searchKeys: ['zbll', 's', '7', 'zz'],
  },

  // ZBLL S - 8
  {
    id: 'zbll_s_8',
    name: 'ZBLL S 8',
    notation: "y2 R U R' U R2 D r' U2 r D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的S 8情况',
    recognition: 'ZBLL-S，8情况识别',
    searchKeys: ['zbll', 's', '8', 'zz'],
  },

  // ZBLL S - 9
  {
    id: 'zbll_s_9',
    name: 'ZBLL S 9',
    notation: "y R U R' U' R U R2 D' R U R' D R U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的S 9情况',
    recognition: 'ZBLL-S，9情况识别',
    searchKeys: ['zbll', 's', '9', 'zz'],
  },

  // ZBLL S - 10
  {
    id: 'zbll_s_10',
    name: 'ZBLL S 10',
    notation: "y2 R U R' U R2 D R' U2 R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的S 10情况',
    recognition: 'ZBLL-S，10情况识别',
    searchKeys: ['zbll', 's', '10', 'zz'],
  },

  // ZBLL S - 11
  {
    id: 'zbll_s_11',
    name: 'ZBLL S 11',
    notation: "y' R' D' R U2 R' D R U' R U R' U2 R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 11情况',
    recognition: 'ZBLL-S，11情况识别',
    searchKeys: ['zbll', 's', '11', 'zz'],
  },

  // ZBLL S - 12
  {
    id: 'zbll_s_12',
    name: 'ZBLL S 12',
    notation: "R U2 R D R' U2 R D' R' U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 12情况',
    recognition: 'ZBLL-S，12情况识别',
    searchKeys: ['zbll', 's', '12', 'zz'],
  },

  // ZBLL S - 13
  {
    id: 'zbll_s_13',
    name: 'ZBLL S 13',
    notation: "R U R' U' R2 U' L' U R2 U' L U' R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 13情况',
    recognition: 'ZBLL-S，13情况识别',
    searchKeys: ['zbll', 's', '13', 'zz'],
  },

  // ZBLL S - 14
  {
    id: 'zbll_s_14',
    name: 'ZBLL S 14',
    notation: "R U R' U R' F R F' R U' R' F' U F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 14情况',
    recognition: 'ZBLL-S，14情况识别',
    searchKeys: ['zbll', 's', '14', 'zz'],
  },

  // ZBLL S - 15
  {
    id: 'zbll_s_15',
    name: 'ZBLL S 15',
    notation: "y R' U' F2 U' R2 U R2 U F2 R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 15情况',
    recognition: 'ZBLL-S，15情况识别',
    searchKeys: ['zbll', 's', '15', 'zz'],
  },

  // ZBLL S - 16
  {
    id: 'zbll_s_16',
    name: 'ZBLL S 16',
    notation: "y2 R U2 R' U' R U R' U' R U R D R' U2 R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的S 16情况',
    recognition: 'ZBLL-S，16情况识别',
    searchKeys: ['zbll', 's', '16', 'zz'],
  },

  // ZBLL S - 17
  {
    id: 'zbll_s_17',
    name: 'ZBLL S 17',
    notation: "y' F R' U R U F' R' U F U F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 17情况',
    recognition: 'ZBLL-S，17情况识别',
    searchKeys: ['zbll', 's', '17', 'zz'],
  },

  // ZBLL S - 18
  {
    id: 'zbll_s_18',
    name: 'ZBLL S 18',
    notation: "y' F R' U2 R F' R' F U2 F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的S 18情况',
    recognition: 'ZBLL-S，18情况识别',
    searchKeys: ['zbll', 's', '18', 'zz'],
  },

  // ZBLL S - 19
  {
    id: 'zbll_s_19',
    name: 'ZBLL S 19',
    notation: "y' R U R' U R U' R D R' U R r' U2 r D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 19情况',
    recognition: 'ZBLL-S，19情况识别',
    searchKeys: ['zbll', 's', '19', 'zz'],
  },

  // ZBLL S - 20
  {
    id: 'zbll_s_20',
    name: 'ZBLL S 20',
    notation: "R U' R' U' R U R D R' U2 R D' R2 U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 20情况',
    recognition: 'ZBLL-S，20情况识别',
    searchKeys: ['zbll', 's', '20', 'zz'],
  },

  // ZBLL S - 21
  {
    id: 'zbll_s_21',
    name: 'ZBLL S 21',
    notation: "y' R' U2 R' D' R U R' D R U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 21情况',
    recognition: 'ZBLL-S，21情况识别',
    searchKeys: ['zbll', 's', '21', 'zz'],
  },

  // ZBLL S - 22
  {
    id: 'zbll_s_22',
    name: 'ZBLL S 22',
    notation: "y2 R U R' U R U' R D R' U R D' R' U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 22情况',
    recognition: 'ZBLL-S，22情况识别',
    searchKeys: ['zbll', 's', '22', 'zz'],
  },

  // ZBLL S - 23
  {
    id: 'zbll_s_23',
    name: 'ZBLL S 23',
    notation: "y' R U R' U R U' R D R' U' R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 23情况',
    recognition: 'ZBLL-S，23情况识别',
    searchKeys: ['zbll', 's', '23', 'zz'],
  },

  // ZBLL S - 24
  {
    id: 'zbll_s_24',
    name: 'ZBLL S 24',
    notation: "y2 R2 D' R U' R' D R U' R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 24情况',
    recognition: 'ZBLL-S，24情况识别',
    searchKeys: ['zbll', 's', '24', 'zz'],
  },

  // ZBLL S - 25
  {
    id: 'zbll_s_25',
    name: 'ZBLL S 25',
    notation: "R2 D R' U2 R D' R' U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 25情况',
    recognition: 'ZBLL-S，25情况识别',
    searchKeys: ['zbll', 's', '25', 'zz'],
  },

  // ZBLL S - 26
  {
    id: 'zbll_s_26',
    name: 'ZBLL S 26',
    notation: "y' R' U2 F' R U R' U' R' F R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 26情况',
    recognition: 'ZBLL-S，26情况识别',
    searchKeys: ['zbll', 's', '26', 'zz'],
  },

  // ZBLL S - 27
  {
    id: 'zbll_s_27',
    name: 'ZBLL S 27',
    notation: "y R' U2 R U R' U' R' D' R U2 R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 27情况',
    recognition: 'ZBLL-S，27情况识别',
    searchKeys: ['zbll', 's', '27', 'zz'],
  },

  // ZBLL S - 28
  {
    id: 'zbll_s_28',
    name: 'ZBLL S 28',
    notation: "y R U R' U R U' R2 D' R U R' D R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 28情况',
    recognition: 'ZBLL-S，28情况识别',
    searchKeys: ['zbll', 's', '28', 'zz'],
  },

  // ZBLL S - 29
  {
    id: 'zbll_s_29',
    name: 'ZBLL S 29',
    notation: "R U' L' U R' U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 7,
    explanation: 'ZZ方法中的S 29情况',
    recognition: 'ZBLL-S，29情况识别',
    searchKeys: ['zbll', 's', '29', 'zz'],
  },

  // ZBLL S - 30
  {
    id: 'zbll_s_30',
    name: 'ZBLL S 30',
    notation: "y' R' U2 R2 U R D' R U R' D R2 U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 30情况',
    recognition: 'ZBLL-S，30情况识别',
    searchKeys: ['zbll', 's', '30', 'zz'],
  },

  // ZBLL S - 31
  {
    id: 'zbll_s_31',
    name: 'ZBLL S 31',
    notation: "y' R U R' U R U2 R2 U R U2 L' R' U R U' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 31情况',
    recognition: 'ZBLL-S，31情况识别',
    searchKeys: ['zbll', 's', '31', 'zz'],
  },

  // ZBLL S - 32
  {
    id: 'zbll_s_32',
    name: 'ZBLL S 32',
    notation: "y2 R U R' F' R U R' U R U' R' U' R' F R2 U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的S 32情况',
    recognition: 'ZBLL-S，32情况识别',
    searchKeys: ['zbll', 's', '32', 'zz'],
  },

  // ZBLL S - 33
  {
    id: 'zbll_s_33',
    name: 'ZBLL S 33',
    notation: "y R' U' R' U R2 D' U2 R U R' U' D R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 33情况',
    recognition: 'ZBLL-S，33情况识别',
    searchKeys: ['zbll', 's', '33', 'zz'],
  },

  // ZBLL S - 34
  {
    id: 'zbll_s_34',
    name: 'ZBLL S 34',
    notation: "y2 L U' R' U L' R' U' R' U' R' U R U R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 34情况',
    recognition: 'ZBLL-S，34情况识别',
    searchKeys: ['zbll', 's', '34', 'zz'],
  },

  // ZBLL S - 35
  {
    id: 'zbll_s_35',
    name: 'ZBLL S 35',
    notation: "R2 D r' U2 r D' R' U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 35情况',
    recognition: 'ZBLL-S，35情况识别',
    searchKeys: ['zbll', 's', '35', 'zz'],
  },

  // ZBLL S - 36
  {
    id: 'zbll_s_36',
    name: 'ZBLL S 36',
    notation: "y' R' U' D R' U R D' U2 R2 U R' U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 36情况',
    recognition: 'ZBLL-S，36情况识别',
    searchKeys: ['zbll', 's', '36', 'zz'],
  },

  // ZBLL S - 37
  {
    id: 'zbll_s_37',
    name: 'ZBLL S 37',
    notation: "L' R U R' U' L U2 R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的S 37情况',
    recognition: 'ZBLL-S，37情况识别',
    searchKeys: ['zbll', 's', '37', 'zz'],
  },

  // ZBLL S - 38
  {
    id: 'zbll_s_38',
    name: 'ZBLL S 38',
    notation: "y R' D' R U R' D R2 U R' U2 R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 38情况',
    recognition: 'ZBLL-S，38情况识别',
    searchKeys: ['zbll', 's', '38', 'zz'],
  },

  // ZBLL S - 39
  {
    id: 'zbll_s_39',
    name: 'ZBLL S 39',
    notation: "y R' U2 R U R2 D' R U' R' D R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 39情况',
    recognition: 'ZBLL-S，39情况识别',
    searchKeys: ['zbll', 's', '39', 'zz'],
  },

  // ZBLL S - 40
  {
    id: 'zbll_s_40',
    name: 'ZBLL S 40',
    notation: "f R' F' R U2 R U2 R' U2 S'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的S 40情况',
    recognition: 'ZBLL-S，40情况识别',
    searchKeys: ['zbll', 's', '40', 'zz'],
  },

  // ZBLL S - 41
  {
    id: 'zbll_s_41',
    name: 'ZBLL S 41',
    notation: "y' L' R U R' U' L U R2 D R' U' R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 41情况',
    recognition: 'ZBLL-S，41情况识别',
    searchKeys: ['zbll', 's', '41', 'zz'],
  },

  // ZBLL S - 42
  {
    id: 'zbll_s_42',
    name: 'ZBLL S 42',
    notation: "R' F' R U R U R' U' R U' R' F R U R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的S 42情况',
    recognition: 'ZBLL-S，42情况识别',
    searchKeys: ['zbll', 's', '42', 'zz'],
  },

  // ZBLL S - 43
  {
    id: 'zbll_s_43',
    name: 'ZBLL S 43',
    notation: "y2 R2 D' r U2 r' D R2 U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的S 43情况',
    recognition: 'ZBLL-S，43情况识别',
    searchKeys: ['zbll', 's', '43', 'zz'],
  },

  // ZBLL S - 44
  {
    id: 'zbll_s_44',
    name: 'ZBLL S 44',
    notation: "F U R U' R' S R' F' R U R U' R' S'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 44情况',
    recognition: 'ZBLL-S，44情况识别',
    searchKeys: ['zbll', 's', '44', 'zz'],
  },

  // ZBLL S - 45
  {
    id: 'zbll_s_45',
    name: 'ZBLL S 45',
    notation: "F R U R' U' R' F' R U2 R U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 45情况',
    recognition: 'ZBLL-S，45情况识别',
    searchKeys: ['zbll', 's', '45', 'zz'],
  },

  // ZBLL S - 46
  {
    id: 'zbll_s_46',
    name: 'ZBLL S 46',
    notation: "R' U2 R U R' U R' D' R U2 R' D R U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 46情况',
    recognition: 'ZBLL-S，46情况识别',
    searchKeys: ['zbll', 's', '46', 'zz'],
  },

  // ZBLL S - 47
  {
    id: 'zbll_s_47',
    name: 'ZBLL S 47',
    notation: "R2 F R U R U' R' F' R U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 47情况',
    recognition: 'ZBLL-S，47情况识别',
    searchKeys: ['zbll', 's', '47', 'zz'],
  },

  // ZBLL S - 48
  {
    id: 'zbll_s_48',
    name: 'ZBLL S 48',
    notation: "y2 R2 D' R U2 R' D R2 U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的S 48情况',
    recognition: 'ZBLL-S，48情况识别',
    searchKeys: ['zbll', 's', '48', 'zz'],
  },

  // ZBLL S - 49
  {
    id: 'zbll_s_49',
    name: 'ZBLL S 49',
    notation: "y R2 U R2 F' R U2 R' U' R U' R' F R2 U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 49情况',
    recognition: 'ZBLL-S，49情况识别',
    searchKeys: ['zbll', 's', '49', 'zz'],
  },

  // ZBLL S - 50
  {
    id: 'zbll_s_50',
    name: 'ZBLL S 50',
    notation: "y F U R' F R F' R U' R' U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 50情况',
    recognition: 'ZBLL-S，50情况识别',
    searchKeys: ['zbll', 's', '50', 'zz'],
  },

  // ZBLL S - 51
  {
    id: 'zbll_s_51',
    name: 'ZBLL S 51',
    notation: "y' R U' R2 U2 D' R U R' U D R2 U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 51情况',
    recognition: 'ZBLL-S，51情况识别',
    searchKeys: ['zbll', 's', '51', 'zz'],
  },

  // ZBLL S - 52
  {
    id: 'zbll_s_52',
    name: 'ZBLL S 52',
    notation: "y F' R U R' D R U R' U' D' R U' R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 52情况',
    recognition: 'ZBLL-S，52情况识别',
    searchKeys: ['zbll', 's', '52', 'zz'],
  },

  // ZBLL S - 53
  {
    id: 'zbll_s_53',
    name: 'ZBLL S 53',
    notation: "y' R' U2 R2 U R' F' R U R' U' R' F R2 U' R2 U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的S 53情况',
    recognition: 'ZBLL-S，53情况识别',
    searchKeys: ['zbll', 's', '53', 'zz'],
  },

  // ZBLL S - 54
  {
    id: 'zbll_s_54',
    name: 'ZBLL S 54',
    notation: "F R U R' U R U2 R U2 R2 U' R2 U' R2 F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 54情况',
    recognition: 'ZBLL-S，54情况识别',
    searchKeys: ['zbll', 's', '54', 'zz'],
  },

  // ZBLL S - 55
  {
    id: 'zbll_s_55',
    name: 'ZBLL S 55',
    notation: "R' U2 R U R' U' R F U' R' U' R U F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 55情况',
    recognition: 'ZBLL-S，55情况识别',
    searchKeys: ['zbll', 's', '55', 'zz'],
  },

  // ZBLL S - 56
  {
    id: 'zbll_s_56',
    name: 'ZBLL S 56',
    notation: "L' U2 R U' R' U2 L U R U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 56情况',
    recognition: 'ZBLL-S，56情况识别',
    searchKeys: ['zbll', 's', '56', 'zz'],
  },

  // ZBLL S - 57
  {
    id: 'zbll_s_57',
    name: 'ZBLL S 57',
    notation: "y2 R U R' U L' U R U' L U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的S 57情况',
    recognition: 'ZBLL-S，57情况识别',
    searchKeys: ['zbll', 's', '57', 'zz'],
  },

  // ZBLL S - 58
  {
    id: 'zbll_s_58',
    name: 'ZBLL S 58',
    notation: "F U' R' U R U F' R U R2 U R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的S 58情况',
    recognition: 'ZBLL-S，58情况识别',
    searchKeys: ['zbll', 's', '58', 'zz'],
  },

  // ZBLL S - 59
  {
    id: 'zbll_s_59',
    name: 'ZBLL S 59',
    notation: "R' U2 L U' R U L' U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的S 59情况',
    recognition: 'ZBLL-S，59情况识别',
    searchKeys: ['zbll', 's', '59', 'zz'],
  },

  // ZBLL S - 60
  {
    id: 'zbll_s_60',
    name: 'ZBLL S 60',
    notation: "F R U' R2 U2 R U R' U R2 U R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的S 60情况',
    recognition: 'ZBLL-S，60情况识别',
    searchKeys: ['zbll', 's', '60', 'zz'],
  },

  // ZBLL S - 61
  {
    id: 'zbll_s_61',
    name: 'ZBLL S 61',
    notation: "y' R U R' U' R' U2 R U R' U R U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 61情况',
    recognition: 'ZBLL-S，61情况识别',
    searchKeys: ['zbll', 's', '61', 'zz'],
  },

  // ZBLL S - 62
  {
    id: 'zbll_s_62',
    name: 'ZBLL S 62',
    notation: "R U R' U R U' R' U R' U' R2 U' R' U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的S 62情况',
    recognition: 'ZBLL-S，62情况识别',
    searchKeys: ['zbll', 's', '62', 'zz'],
  },

  // ZBLL S - 63
  {
    id: 'zbll_s_63',
    name: 'ZBLL S 63',
    notation: "R U R2 U' R2 U' R2 U2 R2 U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的S 63情况',
    recognition: 'ZBLL-S，63情况识别',
    searchKeys: ['zbll', 's', '63', 'zz'],
  },

  // ZBLL S - 64
  {
    id: 'zbll_s_64',
    name: 'ZBLL S 64',
    notation: "y' R' U2 R U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 8,
    explanation: 'ZZ方法中的S 64情况',
    recognition: 'ZBLL-S，64情况识别',
    searchKeys: ['zbll', 's', '64', 'zz'],
  },

  // ZBLL S - 65
  {
    id: 'zbll_s_65',
    name: 'ZBLL S 65',
    notation: "R U R' U R U R U R U R U' R' U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 65情况',
    recognition: 'ZBLL-S，65情况识别',
    searchKeys: ['zbll', 's', '65', 'zz'],
  },

  // ZBLL S - 66
  {
    id: 'zbll_s_66',
    name: 'ZBLL S 66',
    notation: "R U R2 F' R U2 R U' R' U' R' F R2 U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的S 66情况',
    recognition: 'ZBLL-S，66情况识别',
    searchKeys: ['zbll', 's', '66', 'zz'],
  },

  // ZBLL S - 67
  {
    id: 'zbll_s_67',
    name: 'ZBLL S 67',
    notation: "R U R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 7,
    explanation: 'ZZ方法中的S 67情况',
    recognition: 'ZBLL-S，67情况识别',
    searchKeys: ['zbll', 's', '67', 'zz'],
  },

  // ZBLL S - 68
  {
    id: 'zbll_s_68',
    name: 'ZBLL S 68',
    notation: "R' U2 R2 U2 R2 U' R2 U' R2 U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的S 68情况',
    recognition: 'ZBLL-S，68情况识别',
    searchKeys: ['zbll', 's', '68', 'zz'],
  },

  // ZBLL S - 69
  {
    id: 'zbll_s_69',
    name: 'ZBLL S 69',
    notation: "y' R U R' U' R' U2 R U R U' R' U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 69情况',
    recognition: 'ZBLL-S，69情况识别',
    searchKeys: ['zbll', 's', '69', 'zz'],
  },

  // ZBLL S - 70
  {
    id: 'zbll_s_70',
    name: 'ZBLL S 70',
    notation: "y' R' U' R U R U R' U' R' U R U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的S 70情况',
    recognition: 'ZBLL-S，70情况识别',
    searchKeys: ['zbll', 's', '70', 'zz'],
  },

  // ZBLL S - 71
  {
    id: 'zbll_s_71',
    name: 'ZBLL S 71',
    notation: "y' R' U2 R2 U R2 U R U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的S 71情况',
    recognition: 'ZBLL-S，71情况识别',
    searchKeys: ['zbll', 's', '71', 'zz'],
  },

  // ZBLL S - 72
  {
    id: 'zbll_s_72',
    name: 'ZBLL S 72',
    notation: "R U R' U' R U R' U R U R U2 R' U' R U' R' U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的S 72情况',
    recognition: 'ZBLL-S，72情况识别',
    searchKeys: ['zbll', 's', '72', 'zz'],
  },

  // ZBLL AS - 1
  {
    id: 'zbll_as_1',
    name: 'ZBLL AS 1',
    notation: "y' R2 D R' U2 R D' R' U' R' U R U' R' U R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 1情况',
    recognition: 'ZBLL-AS，1情况识别',
    searchKeys: ['zbll', 'as', '1', 'zz'],
  },

  // ZBLL AS - 2
  {
    id: 'zbll_as_2',
    name: 'ZBLL AS 2',
    notation: "y2 R' U2 F' R U R' U' R' F R2 U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 2情况',
    recognition: 'ZBLL-AS，2情况识别',
    searchKeys: ['zbll', 'as', '2', 'zz'],
  },

  // ZBLL AS - 3
  {
    id: 'zbll_as_3',
    name: 'ZBLL AS 3',
    notation: "y2 R' U R U R' U R U2 R' U' R2 D R' U2 R D' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 3情况',
    recognition: 'ZBLL-AS，3情况识别',
    searchKeys: ['zbll', 'as', '3', 'zz'],
  },

  // ZBLL AS - 4
  {
    id: 'zbll_as_4',
    name: 'ZBLL AS 4',
    notation: "y' R' D' R U2 R' D R2 U' R' U2 R U R' U R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 4情况',
    recognition: 'ZBLL-AS，4情况识别',
    searchKeys: ['zbll', 'as', '4', 'zz'],
  },

  // ZBLL AS - 5
  {
    id: 'zbll_as_5',
    name: 'ZBLL AS 5',
    notation: "y2 R' F U2 F' R F R' U2 R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的AS 5情况',
    recognition: 'ZBLL-AS，5情况识别',
    searchKeys: ['zbll', 'as', '5', 'zz'],
  },

  // ZBLL AS - 6
  {
    id: 'zbll_as_6',
    name: 'ZBLL AS 6',
    notation: "y2 R' F U' F' U' R F U' R' U' R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的AS 6情况',
    recognition: 'ZBLL-AS，6情况识别',
    searchKeys: ['zbll', 'as', '6', 'zz'],
  },

  // ZBLL AS - 7
  {
    id: 'zbll_as_7',
    name: 'ZBLL AS 7',
    notation: "y2 R2 D r' U2 r R' U' R D' R' U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的AS 7情况',
    recognition: 'ZBLL-AS，7情况识别',
    searchKeys: ['zbll', 'as', '7', 'zz'],
  },

  // ZBLL AS - 8
  {
    id: 'zbll_as_8',
    name: 'ZBLL AS 8',
    notation: "y' R U2 R' U' R2 D R' U2 R D' R' U' R' U R U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 8情况',
    recognition: 'ZBLL-AS，8情况识别',
    searchKeys: ['zbll', 'as', '8', 'zz'],
  },

  // ZBLL AS - 9
  {
    id: 'zbll_as_9',
    name: 'ZBLL AS 9',
    notation: "y2 R' U' R U' R D R' U' R D' R' U R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 9情况',
    recognition: 'ZBLL-AS，9情况识别',
    searchKeys: ['zbll', 'as', '9', 'zz'],
  },

  // ZBLL AS - 10
  {
    id: 'zbll_as_10',
    name: 'ZBLL AS 10',
    notation: "y R U2 R D R' U' R D' R' U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 10情况',
    recognition: 'ZBLL-AS，10情况识别',
    searchKeys: ['zbll', 'as', '10', 'zz'],
  },

  // ZBLL AS - 11
  {
    id: 'zbll_as_11',
    name: 'ZBLL AS 11',
    notation: "y2 R2 D R' U R D' R' U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 11情况',
    recognition: 'ZBLL-AS，11情况识别',
    searchKeys: ['zbll', 'as', '11', 'zz'],
  },

  // ZBLL AS - 12
  {
    id: 'zbll_as_12',
    name: 'ZBLL AS 12',
    notation: "y R' U' R U' R' U R' D' R U R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 12情况',
    recognition: 'ZBLL-AS，12情况识别',
    searchKeys: ['zbll', 'as', '12', 'zz'],
  },

  // ZBLL AS - 13
  {
    id: 'zbll_as_13',
    name: 'ZBLL AS 13',
    notation: "R U' R' U2 R U' R2 D' R U' R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的AS 13情况',
    recognition: 'ZBLL-AS，13情况识别',
    searchKeys: ['zbll', 'as', '13', 'zz'],
  },

  // ZBLL AS - 14
  {
    id: 'zbll_as_14',
    name: 'ZBLL AS 14',
    notation: "S U2 R U2 R' U2 R' F R f'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 10,
    explanation: 'ZZ方法中的AS 14情况',
    recognition: 'ZBLL-AS，14情况识别',
    searchKeys: ['zbll', 'as', '14', 'zz'],
  },

  // ZBLL AS - 15
  {
    id: 'zbll_as_15',
    name: 'ZBLL AS 15',
    notation: "y2 R U2 R' U2 L' U R U' R' L",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的AS 15情况',
    recognition: 'ZBLL-AS，15情况识别',
    searchKeys: ['zbll', 'as', '15', 'zz'],
  },

  // ZBLL AS - 16
  {
    id: 'zbll_as_16',
    name: 'ZBLL AS 16',
    notation: "y' R' U2 R' D' R U R' D R2 U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 16情况',
    recognition: 'ZBLL-AS，16情况识别',
    searchKeys: ['zbll', 'as', '16', 'zz'],
  },

  // ZBLL AS - 17
  {
    id: 'zbll_as_17',
    name: 'ZBLL AS 17',
    notation: "y R U R' U' R U' R' F' R U R' U R U' R' U' R' F R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的AS 17情况',
    recognition: 'ZBLL-AS，17情况识别',
    searchKeys: ['zbll', 'as', '17', 'zz'],
  },

  // ZBLL AS - 18
  {
    id: 'zbll_as_18',
    name: 'ZBLL AS 18',
    notation: "y R2 D R' U R D' R2 U' r' F R F' M'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 18情况',
    recognition: 'ZBLL-AS，18情况识别',
    searchKeys: ['zbll', 'as', '18', 'zz'],
  },

  // ZBLL AS - 19
  {
    id: 'zbll_as_19',
    name: 'ZBLL AS 19',
    notation: "y2 S R U R' U' R' F R S' R U R' U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 19情况',
    recognition: 'ZBLL-AS，19情况识别',
    searchKeys: ['zbll', 'as', '19', 'zz'],
  },

  // ZBLL AS - 20
  {
    id: 'zbll_as_20',
    name: 'ZBLL AS 20',
    notation: "y2 R' U' R U' R2 D' r U2 r' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的AS 20情况',
    recognition: 'ZBLL-AS，20情况识别',
    searchKeys: ['zbll', 'as', '20', 'zz'],
  },

  // ZBLL AS - 21
  {
    id: 'zbll_as_21',
    name: 'ZBLL AS 21',
    notation: "y2 R' U' R U' R2 D' R U2 R' D R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的AS 21情况',
    recognition: 'ZBLL-AS，21情况识别',
    searchKeys: ['zbll', 'as', '21', 'zz'],
  },

  // ZBLL AS - 22
  {
    id: 'zbll_as_22',
    name: 'ZBLL AS 22',
    notation: "y2 R U2 R' U' R U R' U2 R' F R U R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的AS 22情况',
    recognition: 'ZBLL-AS，22情况识别',
    searchKeys: ['zbll', 'as', '22', 'zz'],
  },

  // ZBLL AS - 23
  {
    id: 'zbll_as_23',
    name: 'ZBLL AS 23',
    notation: "R' U2 R' D' R U2 R' D R U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 23情况',
    recognition: 'ZBLL-AS，23情况识别',
    searchKeys: ['zbll', 'as', '23', 'zz'],
  },

  // ZBLL AS - 24
  {
    id: 'zbll_as_24',
    name: 'ZBLL AS 24',
    notation: "R' U' R U R' F R U R' U' R' F' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的AS 24情况',
    recognition: 'ZBLL-AS，24情况识别',
    searchKeys: ['zbll', 'as', '24', 'zz'],
  },

  // ZBLL AS - 25
  {
    id: 'zbll_as_25',
    name: 'ZBLL AS 25',
    notation: "y' R U2 R' U' R U R D R' U2 R D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 25情况',
    recognition: 'ZBLL-AS，25情况识别',
    searchKeys: ['zbll', 'as', '25', 'zz'],
  },

  // ZBLL AS - 26
  {
    id: 'zbll_as_26',
    name: 'ZBLL AS 26',
    notation: "y2 R' U2 R' F' R U R U' R' F U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的AS 26情况',
    recognition: 'ZBLL-AS，26情况识别',
    searchKeys: ['zbll', 'as', '26', 'zz'],
  },

  // ZBLL AS - 27
  {
    id: 'zbll_as_27',
    name: 'ZBLL AS 27',
    notation: "R2 D' R U2 R' D R U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的AS 27情况',
    recognition: 'ZBLL-AS，27情况识别',
    searchKeys: ['zbll', 'as', '27', 'zz'],
  },

  // ZBLL AS - 28
  {
    id: 'zbll_as_28',
    name: 'ZBLL AS 28',
    notation: "y2 F U R U' R' U R U' R2 F' R U2 R U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 28情况',
    recognition: 'ZBLL-AS，28情况识别',
    searchKeys: ['zbll', 'as', '28', 'zz'],
  },

  // ZBLL AS - 29
  {
    id: 'zbll_as_29',
    name: 'ZBLL AS 29',
    notation: "y F U R U' R' U R U' R' U R2 D R' U' R D' R2 F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的AS 29情况',
    recognition: 'ZBLL-AS，29情况识别',
    searchKeys: ['zbll', 'as', '29', 'zz'],
  },

  // ZBLL AS - 30
  {
    id: 'zbll_as_30',
    name: 'ZBLL AS 30',
    notation: "y2 L' U R U' L U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 8,
    explanation: 'ZZ方法中的AS 30情况',
    recognition: 'ZBLL-AS，30情况识别',
    searchKeys: ['zbll', 'as', '30', 'zz'],
  },

  // ZBLL AS - 31
  {
    id: 'zbll_as_31',
    name: 'ZBLL AS 31',
    notation: "y2 R' U R U R' U' R' D' R U R' D R U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 20,
    explanation: 'ZZ方法中的AS 31情况',
    recognition: 'ZBLL-AS，31情况识别',
    searchKeys: ['zbll', 'as', '31', 'zz'],
  },

  // ZBLL AS - 32
  {
    id: 'zbll_as_32',
    name: 'ZBLL AS 32',
    notation: "y R U R2 F' R U R U R' U' R U' R' F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 32情况',
    recognition: 'ZBLL-AS，32情况识别',
    searchKeys: ['zbll', 'as', '32', 'zz'],
  },

  // ZBLL AS - 33
  {
    id: 'zbll_as_33',
    name: 'ZBLL AS 33',
    notation: "y' R U2 R' U' R U R D r' U2 r D' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 33情况',
    recognition: 'ZBLL-AS，33情况识别',
    searchKeys: ['zbll', 'as', '33', 'zz'],
  },

  // ZBLL AS - 34
  {
    id: 'zbll_as_34',
    name: 'ZBLL AS 34',
    notation: "y' R U R U' R2 D U2 R' U' R U D' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 34情况',
    recognition: 'ZBLL-AS，34情况识别',
    searchKeys: ['zbll', 'as', '34', 'zz'],
  },

  // ZBLL AS - 35
  {
    id: 'zbll_as_35',
    name: 'ZBLL AS 35',
    notation: "y R D' U R U' R' U2 D R2 U' R U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 35情况',
    recognition: 'ZBLL-AS，35情况识别',
    searchKeys: ['zbll', 'as', '35', 'zz'],
  },

  // ZBLL AS - 36
  {
    id: 'zbll_as_36',
    name: 'ZBLL AS 36',
    notation: "R2 D' r U2 r' D R U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 13,
    explanation: 'ZZ方法中的AS 36情况',
    recognition: 'ZBLL-AS，36情况识别',
    searchKeys: ['zbll', 'as', '36', 'zz'],
  },

  // ZBLL AS - 37
  {
    id: 'zbll_as_37',
    name: 'ZBLL AS 37',
    notation: "R U R' F' R U R' U' R' F R2 U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的AS 37情况',
    recognition: 'ZBLL-AS，37情况识别',
    searchKeys: ['zbll', 'as', '37', 'zz'],
  },

  // ZBLL AS - 38
  {
    id: 'zbll_as_38',
    name: 'ZBLL AS 38',
    notation: "y2 f' L F L' U2 L' U2 L U2 S",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的AS 38情况',
    recognition: 'ZBLL-AS，38情况识别',
    searchKeys: ['zbll', 'as', '38', 'zz'],
  },

  // ZBLL AS - 39
  {
    id: 'zbll_as_39',
    name: 'ZBLL AS 39',
    notation: "y' F U R' U' R F' U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的AS 39情况',
    recognition: 'ZBLL-AS，39情况识别',
    searchKeys: ['zbll', 'as', '39', 'zz'],
  },

  // ZBLL AS - 40
  {
    id: 'zbll_as_40',
    name: 'ZBLL AS 40',
    notation: "R' U' F' R U R' U' R' F R2 U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 40情况',
    recognition: 'ZBLL-AS，40情况识别',
    searchKeys: ['zbll', 'as', '40', 'zz'],
  },

  // ZBLL AS - 41
  {
    id: 'zbll_as_41',
    name: 'ZBLL AS 41',
    notation: "y R U R' U2 R U R' U' F' R U2 R' U' R U' R' F",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 41情况',
    recognition: 'ZBLL-AS，41情况识别',
    searchKeys: ['zbll', 'as', '41', 'zz'],
  },

  // ZBLL AS - 42
  {
    id: 'zbll_as_42',
    name: 'ZBLL AS 42',
    notation: "R2 D' R U' R' D F R U R U' R' F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 42情况',
    recognition: 'ZBLL-AS，42情况识别',
    searchKeys: ['zbll', 'as', '42', 'zz'],
  },

  // ZBLL AS - 43
  {
    id: 'zbll_as_43',
    name: 'ZBLL AS 43',
    notation: "y2 R2 D r' U2 r D' R2 U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的AS 43情况',
    recognition: 'ZBLL-AS，43情况识别',
    searchKeys: ['zbll', 'as', '43', 'zz'],
  },

  // ZBLL AS - 44
  {
    id: 'zbll_as_44',
    name: 'ZBLL AS 44',
    notation: "y R U R' U R U' R2 F R F' r U' r' U r U r'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 44情况',
    recognition: 'ZBLL-AS，44情况识别',
    searchKeys: ['zbll', 'as', '44', 'zz'],
  },

  // ZBLL AS - 45
  {
    id: 'zbll_as_45',
    name: 'ZBLL AS 45',
    notation: "R U2 R' U' R U' R D R' U2 R D' R' U2 R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 45情况',
    recognition: 'ZBLL-AS，45情况识别',
    searchKeys: ['zbll', 'as', '45', 'zz'],
  },

  // ZBLL AS - 46
  {
    id: 'zbll_as_46',
    name: 'ZBLL AS 46',
    notation: "R U2 R' U' R' D' R U' R' D R2 U' R' U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的AS 46情况',
    recognition: 'ZBLL-AS，46情况识别',
    searchKeys: ['zbll', 'as', '46', 'zz'],
  },

  // ZBLL AS - 47
  {
    id: 'zbll_as_47',
    name: 'ZBLL AS 47',
    notation: "y2 R2 D R' U2 R D' R2 U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的AS 47情况',
    recognition: 'ZBLL-AS，47情况识别',
    searchKeys: ['zbll', 'as', '47', 'zz'],
  },

  // ZBLL AS - 48
  {
    id: 'zbll_as_48',
    name: 'ZBLL AS 48',
    notation: "R U' R' U2 R U' R' U R' D' R U2 R' D R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 48情况',
    recognition: 'ZBLL-AS，48情况识别',
    searchKeys: ['zbll', 'as', '48', 'zz'],
  },

  // ZBLL AS - 49
  {
    id: 'zbll_as_49',
    name: 'ZBLL AS 49',
    notation: "y R U' R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 49情况',
    recognition: 'ZBLL-AS，49情况识别',
    searchKeys: ['zbll', 'as', '49', 'zz'],
  },

  // ZBLL AS - 50
  {
    id: 'zbll_as_50',
    name: 'ZBLL AS 50',
    notation: "y' R U2 R2 U' R2 U' R' F U' R' U' R U F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 50情况',
    recognition: 'ZBLL-AS，50情况识别',
    searchKeys: ['zbll', 'as', '50', 'zz'],
  },

  // ZBLL AS - 51
  {
    id: 'zbll_as_51',
    name: 'ZBLL AS 51',
    notation: "R U R' F' R U2 R' U' R U' R' F R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 51情况',
    recognition: 'ZBLL-AS，51情况识别',
    searchKeys: ['zbll', 'as', '51', 'zz'],
  },

  // ZBLL AS - 52
  {
    id: 'zbll_as_52',
    name: 'ZBLL AS 52',
    notation: "y2 R' U' R U' L U' R' U L' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的AS 52情况',
    recognition: 'ZBLL-AS，52情况识别',
    searchKeys: ['zbll', 'as', '52', 'zz'],
  },

  // ZBLL AS - 53
  {
    id: 'zbll_as_53',
    name: 'ZBLL AS 53',
    notation: "y2 F R' F' R U R U' R2 F R U R' U' F' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的AS 53情况',
    recognition: 'ZBLL-AS，53情况识别',
    searchKeys: ['zbll', 'as', '53', 'zz'],
  },

  // ZBLL AS - 54
  {
    id: 'zbll_as_54',
    name: 'ZBLL AS 54',
    notation: "y2 F R2 U R2 U R2 U2 R' U2 R' U' R U' R' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 54情况',
    recognition: 'ZBLL-AS，54情况识别',
    searchKeys: ['zbll', 'as', '54', 'zz'],
  },

  // ZBLL AS - 55
  {
    id: 'zbll_as_55',
    name: 'ZBLL AS 55',
    notation: "y' F U' R' U R U F' R' U R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 55情况',
    recognition: 'ZBLL-AS，55情况识别',
    searchKeys: ['zbll', 'as', '55', 'zz'],
  },

  // ZBLL AS - 56
  {
    id: 'zbll_as_56',
    name: 'ZBLL AS 56',
    notation: "y' F R U' R' U R U2 R' U' F' R U R' U' R' F R F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 19,
    explanation: 'ZZ方法中的AS 56情况',
    recognition: 'ZBLL-AS，56情况识别',
    searchKeys: ['zbll', 'as', '56', 'zz'],
  },

  // ZBLL AS - 57
  {
    id: 'zbll_as_57',
    name: 'ZBLL AS 57',
    notation: "y' R2 U R2 F' R U R' U R U2 R' F R2 U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 57情况',
    recognition: 'ZBLL-AS，57情况识别',
    searchKeys: ['zbll', 'as', '57', 'zz'],
  },

  // ZBLL AS - 58
  {
    id: 'zbll_as_58',
    name: 'ZBLL AS 58',
    notation: "y' F R U R' U' R U R' F R' F' R U' F'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 15,
    explanation: 'ZZ方法中的AS 58情况',
    recognition: 'ZBLL-AS，58情况识别',
    searchKeys: ['zbll', 'as', '58', 'zz'],
  },

  // ZBLL AS - 59
  {
    id: 'zbll_as_59',
    name: 'ZBLL AS 59',
    notation: "y2 R' U F' R U R' U' R' F R U2 R U2 R' U' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 17,
    explanation: 'ZZ方法中的AS 59情况',
    recognition: 'ZBLL-AS，59情况识别',
    searchKeys: ['zbll', 'as', '59', 'zz'],
  },

  // ZBLL AS - 60
  {
    id: 'zbll_as_60',
    name: 'ZBLL AS 60',
    notation: "y' R U' R2 D' U' R U' R' U2 D R2 U R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 60情况',
    recognition: 'ZBLL-AS，60情况识别',
    searchKeys: ['zbll', 'as', '60', 'zz'],
  },

  // ZBLL AS - 61
  {
    id: 'zbll_as_61',
    name: 'ZBLL AS 61',
    notation: "y R2 U R2 U R' U2 R' U R U R' U' R2",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 14,
    explanation: 'ZZ方法中的AS 61情况',
    recognition: 'ZBLL-AS，61情况识别',
    searchKeys: ['zbll', 'as', '61', 'zz'],
  },

  // ZBLL AS - 62
  {
    id: 'zbll_as_62',
    name: 'ZBLL AS 62',
    notation: "y R' U' R U R U2 R' U' R U' R' U R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 62情况',
    recognition: 'ZBLL-AS，62情况识别',
    searchKeys: ['zbll', 'as', '62', 'zz'],
  },

  // ZBLL AS - 63
  {
    id: 'zbll_as_63',
    name: 'ZBLL AS 63',
    notation: "y2 R U R' U R' U' R U' R' U2 R U R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 63情况',
    recognition: 'ZBLL-AS，63情况识别',
    searchKeys: ['zbll', 'as', '63', 'zz'],
  },

  // ZBLL AS - 64
  {
    id: 'zbll_as_64',
    name: 'ZBLL AS 64',
    notation: "y' R' U' R U' R U R2 U R U' R U R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 64情况',
    recognition: 'ZBLL-AS，64情况识别',
    searchKeys: ['zbll', 'as', '64', 'zz'],
  },

  // ZBLL AS - 65
  {
    id: 'zbll_as_65',
    name: 'ZBLL AS 65',
    notation: "R' U' R2 U R2 U R2 U2 R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的AS 65情况',
    recognition: 'ZBLL-AS，65情况识别',
    searchKeys: ['zbll', 'as', '65', 'zz'],
  },

  // ZBLL AS - 66
  {
    id: 'zbll_as_66',
    name: 'ZBLL AS 66',
    notation: "y R U2 R' U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 8,
    explanation: 'ZZ方法中的AS 66情况',
    recognition: 'ZBLL-AS，66情况识别',
    searchKeys: ['zbll', 'as', '66', 'zz'],
  },

  // ZBLL AS - 67
  {
    id: 'zbll_as_67',
    name: 'ZBLL AS 67',
    notation: "R U2 R2 U2 R2 U R2 U R2 U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 11,
    explanation: 'ZZ方法中的AS 67情况',
    recognition: 'ZBLL-AS，67情况识别',
    searchKeys: ['zbll', 'as', '67', 'zz'],
  },

  // ZBLL AS - 68
  {
    id: 'zbll_as_68',
    name: 'ZBLL AS 68',
    notation: "R' U' R U' R' U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 7,
    explanation: 'ZZ方法中的AS 68情况',
    recognition: 'ZBLL-AS，68情况识别',
    searchKeys: ['zbll', 'as', '68', 'zz'],
  },

  // ZBLL AS - 69
  {
    id: 'zbll_as_69',
    name: 'ZBLL AS 69',
    notation: "y R U R' U' R' U' R U R U' R' U' R' U R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 69情况',
    recognition: 'ZBLL-AS，69情况识别',
    searchKeys: ['zbll', 'as', '69', 'zz'],
  },

  // ZBLL AS - 70
  {
    id: 'zbll_as_70',
    name: 'ZBLL AS 70',
    notation: "y R' U' R U R U2 R' U' R' U R U' R U' R'",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 16,
    explanation: 'ZZ方法中的AS 70情况',
    recognition: 'ZBLL-AS，70情况识别',
    searchKeys: ['zbll', 'as', '70', 'zz'],
  },

  // ZBLL AS - 71
  {
    id: 'zbll_as_71',
    name: 'ZBLL AS 71',
    notation: "y2 R U R' U R' U' R2 U' R2 U2 R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 12,
    explanation: 'ZZ方法中的AS 71情况',
    recognition: 'ZBLL-AS，71情况识别',
    searchKeys: ['zbll', 'as', '71', 'zz'],
  },

  // ZBLL AS - 72
  {
    id: 'zbll_as_72',
    name: 'ZBLL AS 72',
    notation: "y' R2 D' R U2 R' D R U R' F R U R U' R' F' R",
    category: FormulaCategory.ZBLL,
    method: FormulaMethod.ZZ,
    difficulty: 4,
    moves: 18,
    explanation: 'ZZ方法中的AS 72情况',
    recognition: 'ZBLL-AS，72情况识别',
    searchKeys: ['zbll', 'as', '72', 'zz'],
  },

]

// ============================================
// VLS - Valk Last Slot - 216个公式
// ============================================
// VLS 解决最后一对F2L的同时朝向顶层
// 可以跳过OLL步骤

export const VLS_ALGORITHMS: Formula[] = [
// VLS Algorithms from SpeedCubeDB
// Auto-generated - represents one primary algorithm per case
// ============================================

  // VLS UB - VLS 29
  {
    id: 'vls_ub_29',
    name: 'VLS UB VLS 29',
    notation: "U2 M' U' L' U2 R U R' U2 l",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UB VLS 29情况',
    recognition: 'VLS-UB，VLS 29情况识别',
    searchKeys: ['vls', 'ub', '29', 'f2l', 'oll'],
  },

  // VLS UB - VLS 30
  {
    id: 'vls_ub_30',
    name: 'VLS UB VLS 30',
    notation: "R' U2 r U R U' r' R' U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UB VLS 30情况',
    recognition: 'VLS-UB，VLS 30情况识别',
    searchKeys: ['vls', 'ub', '30', 'f2l', 'oll'],
  },

  // VLS UB - VLS 31
  {
    id: 'vls_ub_31',
    name: 'VLS UB VLS 31',
    notation: "U F' U F R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UB VLS 31情况',
    recognition: 'VLS-UB，VLS 31情况识别',
    searchKeys: ['vls', 'ub', '31', 'f2l', 'oll'],
  },

  // VLS UB - VLS 32
  {
    id: 'vls_ub_32',
    name: 'VLS UB VLS 32',
    notation: "U R U R2 U' F' U F R2 U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UB VLS 32情况',
    recognition: 'VLS-UB，VLS 32情况识别',
    searchKeys: ['vls', 'ub', '32', 'f2l', 'oll'],
  },

  // VLS UB - VLS 33
  {
    id: 'vls_ub_33',
    name: 'VLS UB VLS 33',
    notation: "U2 F2 r U r' F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 6,
    explanation: 'VLS方法中的UB VLS 33情况',
    recognition: 'VLS-UB，VLS 33情况识别',
    searchKeys: ['vls', 'ub', '33', 'f2l', 'oll'],
  },

  // VLS UB - VLS 34
  {
    id: 'vls_ub_34',
    name: 'VLS UB VLS 34',
    notation: "R U' R' U2 r U' R' U2 R U r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UB VLS 34情况',
    recognition: 'VLS-UB，VLS 34情况识别',
    searchKeys: ['vls', 'ub', '34', 'f2l', 'oll'],
  },

  // VLS UB - VLS 35
  {
    id: 'vls_ub_35',
    name: 'VLS UB VLS 35',
    notation: "U' F' U' F R' U' R2 U' R2 U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UB VLS 35情况',
    recognition: 'VLS-UB，VLS 35情况识别',
    searchKeys: ['vls', 'ub', '35', 'f2l', 'oll'],
  },

  // VLS UB - VLS 36
  {
    id: 'vls_ub_36',
    name: 'VLS UB VLS 36',
    notation: "U2 r U' R' U R U2 R' U' R r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UB VLS 36情况',
    recognition: 'VLS-UB，VLS 36情况识别',
    searchKeys: ['vls', 'ub', '36', 'f2l', 'oll'],
  },

  // VLS UB - VLS 37
  {
    id: 'vls_ub_37',
    name: 'VLS UB VLS 37',
    notation: "U2 R' F R F' R U' R' U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 37情况',
    recognition: 'VLS-UB，VLS 37情况识别',
    searchKeys: ['vls', 'ub', '37', 'f2l', 'oll'],
  },

  // VLS UB - VLS 38
  {
    id: 'vls_ub_38',
    name: 'VLS UB VLS 38',
    notation: "U2 R U' R' U F' U F U' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 38情况',
    recognition: 'VLS-UB，VLS 38情况识别',
    searchKeys: ['vls', 'ub', '38', 'f2l', 'oll'],
  },

  // VLS UB - VLS 39
  {
    id: 'vls_ub_39',
    name: 'VLS UB VLS 39',
    notation: "U2 R U' R2 F R F' U F R' F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 39情况',
    recognition: 'VLS-UB，VLS 39情况识别',
    searchKeys: ['vls', 'ub', '39', 'f2l', 'oll'],
  },

  // VLS UB - VLS 40
  {
    id: 'vls_ub_40',
    name: 'VLS UB VLS 40',
    notation: "U' F' U' F U' R U R' U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 40情况',
    recognition: 'VLS-UB，VLS 40情况识别',
    searchKeys: ['vls', 'ub', '40', 'f2l', 'oll'],
  },

  // VLS UB - VLS 41
  {
    id: 'vls_ub_41',
    name: 'VLS UB VLS 41',
    notation: "U2 F R' F' r U' R U' R' U R r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 41情况',
    recognition: 'VLS-UB，VLS 41情况识别',
    searchKeys: ['vls', 'ub', '41', 'f2l', 'oll'],
  },

  // VLS UB - VLS 42
  {
    id: 'vls_ub_42',
    name: 'VLS UB VLS 42',
    notation: "U2 R' F R F' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UB VLS 42情况',
    recognition: 'VLS-UB，VLS 42情况识别',
    searchKeys: ['vls', 'ub', '42', 'f2l', 'oll'],
  },

  // VLS UB - VLS 43
  {
    id: 'vls_ub_43',
    name: 'VLS UB VLS 43',
    notation: "R' U2 F U R U' F' R' U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UB VLS 43情况',
    recognition: 'VLS-UB，VLS 43情况识别',
    searchKeys: ['vls', 'ub', '43', 'f2l', 'oll'],
  },

  // VLS UB - VLS 44
  {
    id: 'vls_ub_44',
    name: 'VLS UB VLS 44',
    notation: "U F' U F R U' R D R' U2 R D' R' U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'VLS方法中的UB VLS 44情况',
    recognition: 'VLS-UB，VLS 44情况识别',
    searchKeys: ['vls', 'ub', '44', 'f2l', 'oll'],
  },

  // VLS UB - VLS 45
  {
    id: 'vls_ub_45',
    name: 'VLS UB VLS 45',
    notation: "U F' L' U2 L U F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UB VLS 45情况',
    recognition: 'VLS-UB，VLS 45情况识别',
    searchKeys: ['vls', 'ub', '45', 'f2l', 'oll'],
  },

  // VLS UB - VLS 46
  {
    id: 'vls_ub_46',
    name: 'VLS UB VLS 46',
    notation: "U2 F2 r U2 R' U' r' F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UB VLS 46情况',
    recognition: 'VLS-UB，VLS 46情况识别',
    searchKeys: ['vls', 'ub', '46', 'f2l', 'oll'],
  },

  // VLS UB - VLS 47
  {
    id: 'vls_ub_47',
    name: 'VLS UB VLS 47',
    notation: "U R B U' B' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 6,
    explanation: 'VLS方法中的UB VLS 47情况',
    recognition: 'VLS-UB，VLS 47情况识别',
    searchKeys: ['vls', 'ub', '47', 'f2l', 'oll'],
  },

  // VLS UB - VLS 48
  {
    id: 'vls_ub_48',
    name: 'VLS UB VLS 48',
    notation: "U R' F' U' F R2 U' R2 U F' U F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UB VLS 48情况',
    recognition: 'VLS-UB，VLS 48情况识别',
    searchKeys: ['vls', 'ub', '48', 'f2l', 'oll'],
  },

  // VLS UB - VLS 49
  {
    id: 'vls_ub_49',
    name: 'VLS UB VLS 49',
    notation: "U F' U F U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UB VLS 49情况',
    recognition: 'VLS-UB，VLS 49情况识别',
    searchKeys: ['vls', 'ub', '49', 'f2l', 'oll'],
  },

  // VLS UB - VLS 50
  {
    id: 'vls_ub_50',
    name: 'VLS UB VLS 50',
    notation: "U' F' U' F U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UB VLS 50情况',
    recognition: 'VLS-UB，VLS 50情况识别',
    searchKeys: ['vls', 'ub', '50', 'f2l', 'oll'],
  },

  // VLS UB - VLS 51
  {
    id: 'vls_ub_51',
    name: 'VLS UB VLS 51',
    notation: "U2 R U' R' F' L' U' L F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UB VLS 51情况',
    recognition: 'VLS-UB，VLS 51情况识别',
    searchKeys: ['vls', 'ub', '51', 'f2l', 'oll'],
  },

  // VLS UB - VLS 52
  {
    id: 'vls_ub_52',
    name: 'VLS UB VLS 52',
    notation: "U R' F R y' R2 U' R U R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 52情况',
    recognition: 'VLS-UB，VLS 52情况识别',
    searchKeys: ['vls', 'ub', '52', 'f2l', 'oll'],
  },

  // VLS UB - VLS 53
  {
    id: 'vls_ub_53',
    name: 'VLS UB VLS 53',
    notation: "U R B U' B' R D' R U2 R' D R U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UB VLS 53情况',
    recognition: 'VLS-UB，VLS 53情况识别',
    searchKeys: ['vls', 'ub', '53', 'f2l', 'oll'],
  },

  // VLS UB - VLS 54
  {
    id: 'vls_ub_54',
    name: 'VLS UB VLS 54',
    notation: "U R U R' F R' F' R U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UB VLS 54情况',
    recognition: 'VLS-UB，VLS 54情况识别',
    searchKeys: ['vls', 'ub', '54', 'f2l', 'oll'],
  },

  // VLS UB - VLS 55
  {
    id: 'vls_ub_55',
    name: 'VLS UB VLS 55',
    notation: "U R B U' B' U R D R' U' R D' R2",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UB VLS 55情况',
    recognition: 'VLS-UB，VLS 55情况识别',
    searchKeys: ['vls', 'ub', '55', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 56
  {
    id: 'vls_ubul_56',
    name: 'VLS UBUL VLS 56',
    notation: "y' U R D r' U' r D' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UBUL VLS 56情况',
    recognition: 'VLS-UBUL，VLS 56情况识别',
    searchKeys: ['vls', 'ubul', '56', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 57
  {
    id: 'vls_ubul_57',
    name: 'VLS UBUL VLS 57',
    notation: "U S' R U' R' S",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 6,
    explanation: 'VLS方法中的UBUL VLS 57情况',
    recognition: 'VLS-UBUL，VLS 57情况识别',
    searchKeys: ['vls', 'ubul', '57', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 58
  {
    id: 'vls_ubul_58',
    name: 'VLS UBUL VLS 58',
    notation: "U x' U' R U x U' R' U' R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UBUL VLS 58情况',
    recognition: 'VLS-UBUL，VLS 58情况识别',
    searchKeys: ['vls', 'ubul', '58', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 59
  {
    id: 'vls_ubul_59',
    name: 'VLS UBUL VLS 59',
    notation: "y' U S R U R' U' R' S'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UBUL VLS 59情况',
    recognition: 'VLS-UBUL，VLS 59情况识别',
    searchKeys: ['vls', 'ubul', '59', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 60
  {
    id: 'vls_ubul_60',
    name: 'VLS UBUL VLS 60',
    notation: "U2 R U' R' y R' F R U' R' F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UBUL VLS 60情况',
    recognition: 'VLS-UBUL，VLS 60情况识别',
    searchKeys: ['vls', 'ubul', '60', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 61
  {
    id: 'vls_ubul_61',
    name: 'VLS UBUL VLS 61',
    notation: "U R U R' U' F' L' U' L F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UBUL VLS 61情况',
    recognition: 'VLS-UBUL，VLS 61情况识别',
    searchKeys: ['vls', 'ubul', '61', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 62
  {
    id: 'vls_ubul_62',
    name: 'VLS UBUL VLS 62',
    notation: "U R U' R2 U' y' R' U2 R U R' U' R B",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UBUL VLS 62情况',
    recognition: 'VLS-UBUL，VLS 62情况识别',
    searchKeys: ['vls', 'ubul', '62', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 63
  {
    id: 'vls_ubul_63',
    name: 'VLS UBUL VLS 63',
    notation: "U R U R2 U' R U' R' U2 F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UBUL VLS 63情况',
    recognition: 'VLS-UBUL，VLS 63情况识别',
    searchKeys: ['vls', 'ubul', '63', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 64
  {
    id: 'vls_ubul_64',
    name: 'VLS UBUL VLS 64',
    notation: "U R U R' U2 R' U' F U R U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UBUL VLS 64情况',
    recognition: 'VLS-UBUL，VLS 64情况识别',
    searchKeys: ['vls', 'ubul', '64', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 65
  {
    id: 'vls_ubul_65',
    name: 'VLS UBUL VLS 65',
    notation: "U R U' R2 F' U' F U' R U R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UBUL VLS 65情况',
    recognition: 'VLS-UBUL，VLS 65情况识别',
    searchKeys: ['vls', 'ubul', '65', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 66
  {
    id: 'vls_ubul_66',
    name: 'VLS UBUL VLS 66',
    notation: "U R U R' U' R U R' U' F' U F R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'VLS方法中的UBUL VLS 66情况',
    recognition: 'VLS-UBUL，VLS 66情况识别',
    searchKeys: ['vls', 'ubul', '66', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 67
  {
    id: 'vls_ubul_67',
    name: 'VLS UBUL VLS 67',
    notation: "U R U' R' U R U R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UBUL VLS 67情况',
    recognition: 'VLS-UBUL，VLS 67情况识别',
    searchKeys: ['vls', 'ubul', '67', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 68
  {
    id: 'vls_ubul_68',
    name: 'VLS UBUL VLS 68',
    notation: "U2 F R' F' R U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UBUL VLS 68情况',
    recognition: 'VLS-UBUL，VLS 68情况识别',
    searchKeys: ['vls', 'ubul', '68', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 69
  {
    id: 'vls_ubul_69',
    name: 'VLS UBUL VLS 69',
    notation: "U2 F' r U2 R' U r' F2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UBUL VLS 69情况',
    recognition: 'VLS-UBUL，VLS 69情况识别',
    searchKeys: ['vls', 'ubul', '69', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 70
  {
    id: 'vls_ubul_70',
    name: 'VLS UBUL VLS 70',
    notation: "U2 R U2 r2 F' r U' L' U2 L U' M'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UBUL VLS 70情况',
    recognition: 'VLS-UBUL，VLS 70情况识别',
    searchKeys: ['vls', 'ubul', '70', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 71
  {
    id: 'vls_ubul_71',
    name: 'VLS UBUL VLS 71',
    notation: "U2 F R' F' R2 U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UBUL VLS 71情况',
    recognition: 'VLS-UBUL，VLS 71情况识别',
    searchKeys: ['vls', 'ubul', '71', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 72
  {
    id: 'vls_ubul_72',
    name: 'VLS UBUL VLS 72',
    notation: "U2 r U R' U' M U R U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UBUL VLS 72情况',
    recognition: 'VLS-UBUL，VLS 72情况识别',
    searchKeys: ['vls', 'ubul', '72', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 73
  {
    id: 'vls_ubul_73',
    name: 'VLS UBUL VLS 73',
    notation: "U f' U f U' R' U2 R' U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UBUL VLS 73情况',
    recognition: 'VLS-UBUL，VLS 73情况识别',
    searchKeys: ['vls', 'ubul', '73', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 74
  {
    id: 'vls_ubul_74',
    name: 'VLS UBUL VLS 74',
    notation: "U R U' R2 F' U' F U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UBUL VLS 74情况',
    recognition: 'VLS-UBUL，VLS 74情况识别',
    searchKeys: ['vls', 'ubul', '74', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 75
  {
    id: 'vls_ubul_75',
    name: 'VLS UBUL VLS 75',
    notation: "U2 R U2 R' U R' U' F' U F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UBUL VLS 75情况',
    recognition: 'VLS-UBUL，VLS 75情况识别',
    searchKeys: ['vls', 'ubul', '75', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 76
  {
    id: 'vls_ubul_76',
    name: 'VLS UBUL VLS 76',
    notation: "R U R' F' U2 F R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UBUL VLS 76情况',
    recognition: 'VLS-UBUL，VLS 76情况识别',
    searchKeys: ['vls', 'ubul', '76', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 77
  {
    id: 'vls_ubul_77',
    name: 'VLS UBUL VLS 77',
    notation: "U2 R U' R' d R2 F R F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UBUL VLS 77情况',
    recognition: 'VLS-UBUL，VLS 77情况识别',
    searchKeys: ['vls', 'ubul', '77', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 78
  {
    id: 'vls_ubul_78',
    name: 'VLS UBUL VLS 78',
    notation: "U2 R d' R U' R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UBUL VLS 78情况',
    recognition: 'VLS-UBUL，VLS 78情况识别',
    searchKeys: ['vls', 'ubul', '78', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 79
  {
    id: 'vls_ubul_79',
    name: 'VLS UBUL VLS 79',
    notation: "U2 R' U' R2 y R U' R2 F' R2 U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UBUL VLS 79情况',
    recognition: 'VLS-UBUL，VLS 79情况识别',
    searchKeys: ['vls', 'ubul', '79', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 80
  {
    id: 'vls_ubul_80',
    name: 'VLS UBUL VLS 80',
    notation: "U2 F R' F' R2 U' R' U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UBUL VLS 80情况',
    recognition: 'VLS-UBUL，VLS 80情况识别',
    searchKeys: ['vls', 'ubul', '80', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 81
  {
    id: 'vls_ubul_81',
    name: 'VLS UBUL VLS 81',
    notation: "U2 R U2 R' U l' U l2 U' l2 U' l2 U l'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UBUL VLS 81情况',
    recognition: 'VLS-UBUL，VLS 81情况识别',
    searchKeys: ['vls', 'ubul', '81', 'f2l', 'oll'],
  },

  // VLS UBUL - VLS 82
  {
    id: 'vls_ubul_82',
    name: 'VLS UBUL VLS 82',
    notation: "U2 R' U' F' U F R U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UBUL VLS 82情况',
    recognition: 'VLS-UBUL，VLS 82情况识别',
    searchKeys: ['vls', 'ubul', '82', 'f2l', 'oll'],
  },

  // VLS UF - VLS 83
  {
    id: 'vls_uf_83',
    name: 'VLS UF VLS 83',
    notation: "U F' U' F U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UF VLS 83情况',
    recognition: 'VLS-UF，VLS 83情况识别',
    searchKeys: ['vls', 'uf', '83', 'f2l', 'oll'],
  },

  // VLS UF - VLS 84
  {
    id: 'vls_uf_84',
    name: 'VLS UF VLS 84',
    notation: "M' U R U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 5,
    explanation: 'VLS方法中的UF VLS 84情况',
    recognition: 'VLS-UF，VLS 84情况识别',
    searchKeys: ['vls', 'uf', '84', 'f2l', 'oll'],
  },

  // VLS UF - VLS 85
  {
    id: 'vls_uf_85',
    name: 'VLS UF VLS 85',
    notation: "F2 r U r' F U' R U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UF VLS 85情况',
    recognition: 'VLS-UF，VLS 85情况识别',
    searchKeys: ['vls', 'uf', '85', 'f2l', 'oll'],
  },

  // VLS UF - VLS 86
  {
    id: 'vls_uf_86',
    name: 'VLS UF VLS 86',
    notation: "U R' U' R' F R U R U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 86情况',
    recognition: 'VLS-UF，VLS 86情况识别',
    searchKeys: ['vls', 'uf', '86', 'f2l', 'oll'],
  },

  // VLS UF - VLS 87
  {
    id: 'vls_uf_87',
    name: 'VLS UF VLS 87',
    notation: "M' U l F' U2 L' U' L U' L'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 87情况',
    recognition: 'VLS-UF，VLS 87情况识别',
    searchKeys: ['vls', 'uf', '87', 'f2l', 'oll'],
  },

  // VLS UF - VLS 88
  {
    id: 'vls_uf_88',
    name: 'VLS UF VLS 88',
    notation: "U R U' R' F R U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 88情况',
    recognition: 'VLS-UF，VLS 88情况识别',
    searchKeys: ['vls', 'uf', '88', 'f2l', 'oll'],
  },

  // VLS UF - VLS 89
  {
    id: 'vls_uf_89',
    name: 'VLS UF VLS 89',
    notation: "R' F R2 B' R' F' R B R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UF VLS 89情况',
    recognition: 'VLS-UF，VLS 89情况识别',
    searchKeys: ['vls', 'uf', '89', 'f2l', 'oll'],
  },

  // VLS UF - VLS 90
  {
    id: 'vls_uf_90',
    name: 'VLS UF VLS 90',
    notation: "M' U' r' F2 R F' U L' U L",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 90情况',
    recognition: 'VLS-UF，VLS 90情况识别',
    searchKeys: ['vls', 'uf', '90', 'f2l', 'oll'],
  },

  // VLS UF - VLS 91
  {
    id: 'vls_uf_91',
    name: 'VLS UF VLS 91',
    notation: "y' R' U' R U' R' U R' F' U' F U R2",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UF VLS 91情况',
    recognition: 'VLS-UF，VLS 91情况识别',
    searchKeys: ['vls', 'uf', '91', 'f2l', 'oll'],
  },

  // VLS UF - VLS 92
  {
    id: 'vls_uf_92',
    name: 'VLS UF VLS 92',
    notation: "U R U R' U2 R' F R2 U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UF VLS 92情况',
    recognition: 'VLS-UF，VLS 92情况识别',
    searchKeys: ['vls', 'uf', '92', 'f2l', 'oll'],
  },

  // VLS UF - VLS 93
  {
    id: 'vls_uf_93',
    name: 'VLS UF VLS 93',
    notation: "U2 r' U' R2 U' R2 U2 r",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UF VLS 93情况',
    recognition: 'VLS-UF，VLS 93情况识别',
    searchKeys: ['vls', 'uf', '93', 'f2l', 'oll'],
  },

  // VLS UF - VLS 94
  {
    id: 'vls_uf_94',
    name: 'VLS UF VLS 94',
    notation: "U F' U' F d S R2 F R F' R S'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UF VLS 94情况',
    recognition: 'VLS-UF，VLS 94情况识别',
    searchKeys: ['vls', 'uf', '94', 'f2l', 'oll'],
  },

  // VLS UF - VLS 95
  {
    id: 'vls_uf_95',
    name: 'VLS UF VLS 95',
    notation: "U F' R' U' R F R' U R2 U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UF VLS 95情况',
    recognition: 'VLS-UF，VLS 95情况识别',
    searchKeys: ['vls', 'uf', '95', 'f2l', 'oll'],
  },

  // VLS UF - VLS 96
  {
    id: 'vls_uf_96',
    name: 'VLS UF VLS 96',
    notation: "R' F R F' U R' U' R' D' R U R' D R2",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UF VLS 96情况',
    recognition: 'VLS-UF，VLS 96情况识别',
    searchKeys: ['vls', 'uf', '96', 'f2l', 'oll'],
  },

  // VLS UF - VLS 97
  {
    id: 'vls_uf_97',
    name: 'VLS UF VLS 97',
    notation: "R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 4,
    explanation: 'VLS方法中的UF VLS 97情况',
    recognition: 'VLS-UF，VLS 97情况识别',
    searchKeys: ['vls', 'uf', '97', 'f2l', 'oll'],
  },

  // VLS UF - VLS 98
  {
    id: 'vls_uf_98',
    name: 'VLS UF VLS 98',
    notation: "U R U' R' U' R' F' U' F U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UF VLS 98情况',
    recognition: 'VLS-UF，VLS 98情况识别',
    searchKeys: ['vls', 'uf', '98', 'f2l', 'oll'],
  },

  // VLS UF - VLS 99
  {
    id: 'vls_uf_99',
    name: 'VLS UF VLS 99',
    notation: "R' F R F' R U R' U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UF VLS 99情况',
    recognition: 'VLS-UF，VLS 99情况识别',
    searchKeys: ['vls', 'uf', '99', 'f2l', 'oll'],
  },

  // VLS UF - VLS 100
  {
    id: 'vls_uf_100',
    name: 'VLS UF VLS 100',
    notation: "U R U' R' U2 R U R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UF VLS 100情况',
    recognition: 'VLS-UF，VLS 100情况识别',
    searchKeys: ['vls', 'uf', '100', 'f2l', 'oll'],
  },

  // VLS UF - VLS 101
  {
    id: 'vls_uf_101',
    name: 'VLS UF VLS 101',
    notation: "U R' U' R' F R2 F' R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 101情况',
    recognition: 'VLS-UF，VLS 101情况识别',
    searchKeys: ['vls', 'uf', '101', 'f2l', 'oll'],
  },

  // VLS UF - VLS 102
  {
    id: 'vls_uf_102',
    name: 'VLS UF VLS 102',
    notation: "U F' L' U2 L U L' U' L U F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UF VLS 102情况',
    recognition: 'VLS-UF，VLS 102情况识别',
    searchKeys: ['vls', 'uf', '102', 'f2l', 'oll'],
  },

  // VLS UF - VLS 103
  {
    id: 'vls_uf_103',
    name: 'VLS UF VLS 103',
    notation: "R' F R F' R2 D' R U2 R' D R U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UF VLS 103情况',
    recognition: 'VLS-UF，VLS 103情况识别',
    searchKeys: ['vls', 'uf', '103', 'f2l', 'oll'],
  },

  // VLS UF - VLS 104
  {
    id: 'vls_uf_104',
    name: 'VLS UF VLS 104',
    notation: "R' F R2 F' r U R' U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UF VLS 104情况',
    recognition: 'VLS-UF，VLS 104情况识别',
    searchKeys: ['vls', 'uf', '104', 'f2l', 'oll'],
  },

  // VLS UF - VLS 105
  {
    id: 'vls_uf_105',
    name: 'VLS UF VLS 105',
    notation: "F' U' F R' F R F' R U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 105情况',
    recognition: 'VLS-UF，VLS 105情况识别',
    searchKeys: ['vls', 'uf', '105', 'f2l', 'oll'],
  },

  // VLS UF - VLS 106
  {
    id: 'vls_uf_106',
    name: 'VLS UF VLS 106',
    notation: "R' F R U2 y' R' U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UF VLS 106情况',
    recognition: 'VLS-UF，VLS 106情况识别',
    searchKeys: ['vls', 'uf', '106', 'f2l', 'oll'],
  },

  // VLS UF - VLS 107
  {
    id: 'vls_uf_107',
    name: 'VLS UF VLS 107',
    notation: "R' F R F' U R' U' R U' R' U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UF VLS 107情况',
    recognition: 'VLS-UF，VLS 107情况识别',
    searchKeys: ['vls', 'uf', '107', 'f2l', 'oll'],
  },

  // VLS UF - VLS 108
  {
    id: 'vls_uf_108',
    name: 'VLS UF VLS 108',
    notation: "U' F' U' F U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UF VLS 108情况',
    recognition: 'VLS-UF，VLS 108情况识别',
    searchKeys: ['vls', 'uf', '108', 'f2l', 'oll'],
  },

  // VLS UF - VLS 109
  {
    id: 'vls_uf_109',
    name: 'VLS UF VLS 109',
    notation: "R' F R F2 r U R' U' r' F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UF VLS 109情况',
    recognition: 'VLS-UF，VLS 109情况识别',
    searchKeys: ['vls', 'uf', '109', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 110
  {
    id: 'vls_ufub_110',
    name: 'VLS UFUB VLS 110',
    notation: "U R' F' U' F U R2 U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUB VLS 110情况',
    recognition: 'VLS-UFUB，VLS 110情况识别',
    searchKeys: ['vls', 'ufub', '110', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 111
  {
    id: 'vls_ufub_111',
    name: 'VLS UFUB VLS 111',
    notation: "U R U' M' U R' U' M U R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUB VLS 111情况',
    recognition: 'VLS-UFUB，VLS 111情况识别',
    searchKeys: ['vls', 'ufub', '111', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 112
  {
    id: 'vls_ufub_112',
    name: 'VLS UFUB VLS 112',
    notation: "U2 R U' R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUB VLS 112情况',
    recognition: 'VLS-UFUB，VLS 112情况识别',
    searchKeys: ['vls', 'ufub', '112', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 113
  {
    id: 'vls_ufub_113',
    name: 'VLS UFUB VLS 113',
    notation: "U2 R U' R' F' U' F U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UFUB VLS 113情况',
    recognition: 'VLS-UFUB，VLS 113情况识别',
    searchKeys: ['vls', 'ufub', '113', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 114
  {
    id: 'vls_ufub_114',
    name: 'VLS UFUB VLS 114',
    notation: "U R' D' R U R' D R2 U' R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'VLS方法中的UFUB VLS 114情况',
    recognition: 'VLS-UFUB，VLS 114情况识别',
    searchKeys: ['vls', 'ufub', '114', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 115
  {
    id: 'vls_ufub_115',
    name: 'VLS UFUB VLS 115',
    notation: "M' U R U' r' F R U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UFUB VLS 115情况',
    recognition: 'VLS-UFUB，VLS 115情况识别',
    searchKeys: ['vls', 'ufub', '115', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 116
  {
    id: 'vls_ufub_116',
    name: 'VLS UFUB VLS 116',
    notation: "M' U M R U R' U' r U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 116情况',
    recognition: 'VLS-UFUB，VLS 116情况识别',
    searchKeys: ['vls', 'ufub', '116', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 117
  {
    id: 'vls_ufub_117',
    name: 'VLS UFUB VLS 117',
    notation: "R' F R2 U R' U y' R' U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUB VLS 117情况',
    recognition: 'VLS-UFUB，VLS 117情况识别',
    searchKeys: ['vls', 'ufub', '117', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 118
  {
    id: 'vls_ufub_118',
    name: 'VLS UFUB VLS 118',
    notation: "R' F R2 U R2 U' R F' R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UFUB VLS 118情况',
    recognition: 'VLS-UFUB，VLS 118情况识别',
    searchKeys: ['vls', 'ufub', '118', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 119
  {
    id: 'vls_ufub_119',
    name: 'VLS UFUB VLS 119',
    notation: "U R U R' U' R U R' U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUB VLS 119情况',
    recognition: 'VLS-UFUB，VLS 119情况识别',
    searchKeys: ['vls', 'ufub', '119', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 120
  {
    id: 'vls_ufub_120',
    name: 'VLS UFUB VLS 120',
    notation: "R' F R2 U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UFUB VLS 120情况',
    recognition: 'VLS-UFUB，VLS 120情况识别',
    searchKeys: ['vls', 'ufub', '120', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 121
  {
    id: 'vls_ufub_121',
    name: 'VLS UFUB VLS 121',
    notation: "U R U' R' U R' U' F U R U' R' F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UFUB VLS 121情况',
    recognition: 'VLS-UFUB，VLS 121情况识别',
    searchKeys: ['vls', 'ufub', '121', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 122
  {
    id: 'vls_ufub_122',
    name: 'VLS UFUB VLS 122',
    notation: "U R U' R2 U' F' U F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUB VLS 122情况',
    recognition: 'VLS-UFUB，VLS 122情况识别',
    searchKeys: ['vls', 'ufub', '122', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 123
  {
    id: 'vls_ufub_123',
    name: 'VLS UFUB VLS 123',
    notation: "R' F R F' U2 R U R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUB VLS 123情况',
    recognition: 'VLS-UFUB，VLS 123情况识别',
    searchKeys: ['vls', 'ufub', '123', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 124
  {
    id: 'vls_ufub_124',
    name: 'VLS UFUB VLS 124',
    notation: "R U' R' F' U' F R U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUB VLS 124情况',
    recognition: 'VLS-UFUB，VLS 124情况识别',
    searchKeys: ['vls', 'ufub', '124', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 125
  {
    id: 'vls_ufub_125',
    name: 'VLS UFUB VLS 125',
    notation: "U R U' R' F U R U' R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 125情况',
    recognition: 'VLS-UFUB，VLS 125情况识别',
    searchKeys: ['vls', 'ufub', '125', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 126
  {
    id: 'vls_ufub_126',
    name: 'VLS UFUB VLS 126',
    notation: "U2 R U' R' U' M' U R U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 126情况',
    recognition: 'VLS-UFUB，VLS 126情况识别',
    searchKeys: ['vls', 'ufub', '126', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 127
  {
    id: 'vls_ufub_127',
    name: 'VLS UFUB VLS 127',
    notation: "U' R' F' U' F U R2 U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUB VLS 127情况',
    recognition: 'VLS-UFUB，VLS 127情况识别',
    searchKeys: ['vls', 'ufub', '127', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 128
  {
    id: 'vls_ufub_128',
    name: 'VLS UFUB VLS 128',
    notation: "U2 R U2 R' F R U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 128情况',
    recognition: 'VLS-UFUB，VLS 128情况识别',
    searchKeys: ['vls', 'ufub', '128', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 129
  {
    id: 'vls_ufub_129',
    name: 'VLS UFUB VLS 129',
    notation: "U R U' R2 F2 r U r' F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 129情况',
    recognition: 'VLS-UFUB，VLS 129情况识别',
    searchKeys: ['vls', 'ufub', '129', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 130
  {
    id: 'vls_ufub_130',
    name: 'VLS UFUB VLS 130',
    notation: "U R' F' U' F R2 U' R2 U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 130情况',
    recognition: 'VLS-UFUB，VLS 130情况识别',
    searchKeys: ['vls', 'ufub', '130', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 131
  {
    id: 'vls_ufub_131',
    name: 'VLS UFUB VLS 131',
    notation: "R' F R2 U' R' U R U R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 131情况',
    recognition: 'VLS-UFUB，VLS 131情况识别',
    searchKeys: ['vls', 'ufub', '131', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 132
  {
    id: 'vls_ufub_132',
    name: 'VLS UFUB VLS 132',
    notation: "U2 R U' R2 U' R' F R2 F' R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUB VLS 132情况',
    recognition: 'VLS-UFUB，VLS 132情况识别',
    searchKeys: ['vls', 'ufub', '132', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 133
  {
    id: 'vls_ufub_133',
    name: 'VLS UFUB VLS 133',
    notation: "U R U' R' U2 R U2 R2 F R F' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UFUB VLS 133情况',
    recognition: 'VLS-UFUB，VLS 133情况识别',
    searchKeys: ['vls', 'ufub', '133', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 134
  {
    id: 'vls_ufub_134',
    name: 'VLS UFUB VLS 134',
    notation: "R U R' F' U' F U' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUB VLS 134情况',
    recognition: 'VLS-UFUB，VLS 134情况识别',
    searchKeys: ['vls', 'ufub', '134', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 135
  {
    id: 'vls_ufub_135',
    name: 'VLS UFUB VLS 135',
    notation: "U R U' R' U r U2 R' U' R U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUB VLS 135情况',
    recognition: 'VLS-UFUB，VLS 135情况识别',
    searchKeys: ['vls', 'ufub', '135', 'f2l', 'oll'],
  },

  // VLS UFUB - VLS 136
  {
    id: 'vls_ufub_136',
    name: 'VLS UFUB VLS 136',
    notation: "U R U' M' U2 R' U' R U R' U' R U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UFUB VLS 136情况',
    recognition: 'VLS-UFUB，VLS 136情况识别',
    searchKeys: ['vls', 'ufub', '136', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 137
  {
    id: 'vls_uful_137',
    name: 'VLS UFUL VLS 137',
    notation: "U2 F R' F' R U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 137情况',
    recognition: 'VLS-UFUL，VLS 137情况识别',
    searchKeys: ['vls', 'uful', '137', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 138
  {
    id: 'vls_uful_138',
    name: 'VLS UFUL VLS 138',
    notation: "U' F R' F' R2 U' R' U2 R U' R' U R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'VLS方法中的UFUL VLS 138情况',
    recognition: 'VLS-UFUL，VLS 138情况识别',
    searchKeys: ['vls', 'uful', '138', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 139
  {
    id: 'vls_uful_139',
    name: 'VLS UFUL VLS 139',
    notation: "U2 R U' R' U' R U' R' F' U' F R U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UFUL VLS 139情况',
    recognition: 'VLS-UFUL，VLS 139情况识别',
    searchKeys: ['vls', 'uful', '139', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 140
  {
    id: 'vls_uful_140',
    name: 'VLS UFUL VLS 140',
    notation: "U2 R U' R2 F' U' F U R2 U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UFUL VLS 140情况',
    recognition: 'VLS-UFUL，VLS 140情况识别',
    searchKeys: ['vls', 'uful', '140', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 141
  {
    id: 'vls_uful_141',
    name: 'VLS UFUL VLS 141',
    notation: "U L' U2 R U R' L U F R U R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUL VLS 141情况',
    recognition: 'VLS-UFUL，VLS 141情况识别',
    searchKeys: ['vls', 'uful', '141', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 142
  {
    id: 'vls_uful_142',
    name: 'VLS UFUL VLS 142',
    notation: "y' U R2 D' r U' r' D R2",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUL VLS 142情况',
    recognition: 'VLS-UFUL，VLS 142情况识别',
    searchKeys: ['vls', 'uful', '142', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 143
  {
    id: 'vls_uful_143',
    name: 'VLS UFUL VLS 143',
    notation: "R' U' F U R2 U' R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UFUL VLS 143情况',
    recognition: 'VLS-UFUL，VLS 143情况识别',
    searchKeys: ['vls', 'uful', '143', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 144
  {
    id: 'vls_uful_144',
    name: 'VLS UFUL VLS 144',
    notation: "M' U2 R U' R' U R U2 r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUL VLS 144情况',
    recognition: 'VLS-UFUL，VLS 144情况识别',
    searchKeys: ['vls', 'uful', '144', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 145
  {
    id: 'vls_uful_145',
    name: 'VLS UFUL VLS 145',
    notation: "U R U R' U' R U' R' F R U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UFUL VLS 145情况',
    recognition: 'VLS-UFUL，VLS 145情况识别',
    searchKeys: ['vls', 'uful', '145', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 146
  {
    id: 'vls_uful_146',
    name: 'VLS UFUL VLS 146',
    notation: "R' U' F U' R2 U R2 U R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 146情况',
    recognition: 'VLS-UFUL，VLS 146情况识别',
    searchKeys: ['vls', 'uful', '146', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 147
  {
    id: 'vls_uful_147',
    name: 'VLS UFUL VLS 147',
    notation: "U R U R' U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUL VLS 147情况',
    recognition: 'VLS-UFUL，VLS 147情况识别',
    searchKeys: ['vls', 'uful', '147', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 148
  {
    id: 'vls_uful_148',
    name: 'VLS UFUL VLS 148',
    notation: "U2 R U2 R2 F R2 B' R2 F' R2 B R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUL VLS 148情况',
    recognition: 'VLS-UFUL，VLS 148情况识别',
    searchKeys: ['vls', 'uful', '148', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 149
  {
    id: 'vls_uful_149',
    name: 'VLS UFUL VLS 149',
    notation: "R' F R2 U' R' U2 R U R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 149情况',
    recognition: 'VLS-UFUL，VLS 149情况识别',
    searchKeys: ['vls', 'uful', '149', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 150
  {
    id: 'vls_uful_150',
    name: 'VLS UFUL VLS 150',
    notation: "U F2 u' r U r' D R U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 150情况',
    recognition: 'VLS-UFUL，VLS 150情况识别',
    searchKeys: ['vls', 'uful', '150', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 151
  {
    id: 'vls_uful_151',
    name: 'VLS UFUL VLS 151',
    notation: "U2 R U' R' U' R' F R2 U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUL VLS 151情况',
    recognition: 'VLS-UFUL，VLS 151情况识别',
    searchKeys: ['vls', 'uful', '151', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 152
  {
    id: 'vls_uful_152',
    name: 'VLS UFUL VLS 152',
    notation: "U2 R U' R' U R U' R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUL VLS 152情况',
    recognition: 'VLS-UFUL，VLS 152情况识别',
    searchKeys: ['vls', 'uful', '152', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 153
  {
    id: 'vls_uful_153',
    name: 'VLS UFUL VLS 153',
    notation: "M2 U2 R' F R2 U2 r2 F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UFUL VLS 153情况',
    recognition: 'VLS-UFUL，VLS 153情况识别',
    searchKeys: ['vls', 'uful', '153', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 154
  {
    id: 'vls_uful_154',
    name: 'VLS UFUL VLS 154',
    notation: "U R' F' r U' r' F2 R U F R' F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUL VLS 154情况',
    recognition: 'VLS-UFUL，VLS 154情况识别',
    searchKeys: ['vls', 'uful', '154', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 155
  {
    id: 'vls_uful_155',
    name: 'VLS UFUL VLS 155',
    notation: "R2 U2 R2 U2 R' F R2 F' U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 155情况',
    recognition: 'VLS-UFUL，VLS 155情况识别',
    searchKeys: ['vls', 'uful', '155', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 156
  {
    id: 'vls_uful_156',
    name: 'VLS UFUL VLS 156',
    notation: "U2 R U2 R' F U R U' R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 156情况',
    recognition: 'VLS-UFUL，VLS 156情况识别',
    searchKeys: ['vls', 'uful', '156', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 157
  {
    id: 'vls_uful_157',
    name: 'VLS UFUL VLS 157',
    notation: "U2 R' U' R U' R' U2 F R2 U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUL VLS 157情况',
    recognition: 'VLS-UFUL，VLS 157情况识别',
    searchKeys: ['vls', 'uful', '157', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 158
  {
    id: 'vls_uful_158',
    name: 'VLS UFUL VLS 158',
    notation: "U R' U' R2 U' R2 U2 R U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UFUL VLS 158情况',
    recognition: 'VLS-UFUL，VLS 158情况识别',
    searchKeys: ['vls', 'uful', '158', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 159
  {
    id: 'vls_uful_159',
    name: 'VLS UFUL VLS 159',
    notation: "U2 R U' R' U R U2 R' F R U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的UFUL VLS 159情况',
    recognition: 'VLS-UFUL，VLS 159情况识别',
    searchKeys: ['vls', 'uful', '159', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 160
  {
    id: 'vls_uful_160',
    name: 'VLS UFUL VLS 160',
    notation: "R' F R F' R U2 R' U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UFUL VLS 160情况',
    recognition: 'VLS-UFUL，VLS 160情况识别',
    searchKeys: ['vls', 'uful', '160', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 161
  {
    id: 'vls_uful_161',
    name: 'VLS UFUL VLS 161',
    notation: "U' F' U F R U' R2 F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UFUL VLS 161情况',
    recognition: 'VLS-UFUL，VLS 161情况识别',
    searchKeys: ['vls', 'uful', '161', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 162
  {
    id: 'vls_uful_162',
    name: 'VLS UFUL VLS 162',
    notation: "R' F R2 U' R' U R U2 R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UFUL VLS 162情况',
    recognition: 'VLS-UFUL，VLS 162情况识别',
    searchKeys: ['vls', 'uful', '162', 'f2l', 'oll'],
  },

  // VLS UFUL - VLS 163
  {
    id: 'vls_uful_163',
    name: 'VLS UFUL VLS 163',
    notation: "U R U' M' U2 R' U' R U R' U2 M U R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 16,
    explanation: 'VLS方法中的UFUL VLS 163情况',
    recognition: 'VLS-UFUL，VLS 163情况识别',
    searchKeys: ['vls', 'uful', '163', 'f2l', 'oll'],
  },

  // VLS UL - VLS 164
  {
    id: 'vls_ul_164',
    name: 'VLS UL VLS 164',
    notation: "U2 F' U F U2 R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UL VLS 164情况',
    recognition: 'VLS-UL，VLS 164情况识别',
    searchKeys: ['vls', 'ul', '164', 'f2l', 'oll'],
  },

  // VLS UL - VLS 165
  {
    id: 'vls_ul_165',
    name: 'VLS UL VLS 165',
    notation: "U R U R' U' F' L' U2 L U F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UL VLS 165情况',
    recognition: 'VLS-UL，VLS 165情况识别',
    searchKeys: ['vls', 'ul', '165', 'f2l', 'oll'],
  },

  // VLS UL - VLS 166
  {
    id: 'vls_ul_166',
    name: 'VLS UL VLS 166',
    notation: "R' U' F R F' U' R' U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UL VLS 166情况',
    recognition: 'VLS-UL，VLS 166情况识别',
    searchKeys: ['vls', 'ul', '166', 'f2l', 'oll'],
  },

  // VLS UL - VLS 167
  {
    id: 'vls_ul_167',
    name: 'VLS UL VLS 167',
    notation: "R' U' F R F' R' U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UL VLS 167情况',
    recognition: 'VLS-UL，VLS 167情况识别',
    searchKeys: ['vls', 'ul', '167', 'f2l', 'oll'],
  },

  // VLS UL - VLS 168
  {
    id: 'vls_ul_168',
    name: 'VLS UL VLS 168',
    notation: "U R U R' U F' U' F U' R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UL VLS 168情况',
    recognition: 'VLS-UL，VLS 168情况识别',
    searchKeys: ['vls', 'ul', '168', 'f2l', 'oll'],
  },

  // VLS UL - VLS 169
  {
    id: 'vls_ul_169',
    name: 'VLS UL VLS 169',
    notation: "R' U' F U R U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UL VLS 169情况',
    recognition: 'VLS-UL，VLS 169情况识别',
    searchKeys: ['vls', 'ul', '169', 'f2l', 'oll'],
  },

  // VLS UL - VLS 170
  {
    id: 'vls_ul_170',
    name: 'VLS UL VLS 170',
    notation: "R' F R F' U R U R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UL VLS 170情况',
    recognition: 'VLS-UL，VLS 170情况识别',
    searchKeys: ['vls', 'ul', '170', 'f2l', 'oll'],
  },

  // VLS UL - VLS 171
  {
    id: 'vls_ul_171',
    name: 'VLS UL VLS 171',
    notation: "y R U R' F R U' R' F2 U2 F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UL VLS 171情况',
    recognition: 'VLS-UL，VLS 171情况识别',
    searchKeys: ['vls', 'ul', '171', 'f2l', 'oll'],
  },

  // VLS UL - VLS 172
  {
    id: 'vls_ul_172',
    name: 'VLS UL VLS 172',
    notation: "R' U' F U R F' U F U2 F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UL VLS 172情况',
    recognition: 'VLS-UL，VLS 172情况识别',
    searchKeys: ['vls', 'ul', '172', 'f2l', 'oll'],
  },

  // VLS UL - VLS 173
  {
    id: 'vls_ul_173',
    name: 'VLS UL VLS 173',
    notation: "U R' F R F' U F R' F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UL VLS 173情况',
    recognition: 'VLS-UL，VLS 173情况识别',
    searchKeys: ['vls', 'ul', '173', 'f2l', 'oll'],
  },

  // VLS UL - VLS 174
  {
    id: 'vls_ul_174',
    name: 'VLS UL VLS 174',
    notation: "R2 U' R F R' U R2 U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UL VLS 174情况',
    recognition: 'VLS-UL，VLS 174情况识别',
    searchKeys: ['vls', 'ul', '174', 'f2l', 'oll'],
  },

  // VLS UL - VLS 175
  {
    id: 'vls_ul_175',
    name: 'VLS UL VLS 175',
    notation: "U2 R U' R' U R U' B U' B' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UL VLS 175情况',
    recognition: 'VLS-UL，VLS 175情况识别',
    searchKeys: ['vls', 'ul', '175', 'f2l', 'oll'],
  },

  // VLS UL - VLS 176
  {
    id: 'vls_ul_176',
    name: 'VLS UL VLS 176',
    notation: "R' F R F' U F R U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UL VLS 176情况',
    recognition: 'VLS-UL，VLS 176情况识别',
    searchKeys: ['vls', 'ul', '176', 'f2l', 'oll'],
  },

  // VLS UL - VLS 177
  {
    id: 'vls_ul_177',
    name: 'VLS UL VLS 177',
    notation: "U R U R' F2 r U r' F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UL VLS 177情况',
    recognition: 'VLS-UL，VLS 177情况识别',
    searchKeys: ['vls', 'ul', '177', 'f2l', 'oll'],
  },

  // VLS UL - VLS 178
  {
    id: 'vls_ul_178',
    name: 'VLS UL VLS 178',
    notation: "U R B' U' R' U R B R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UL VLS 178情况',
    recognition: 'VLS-UL，VLS 178情况识别',
    searchKeys: ['vls', 'ul', '178', 'f2l', 'oll'],
  },

  // VLS UL - VLS 179
  {
    id: 'vls_ul_179',
    name: 'VLS UL VLS 179',
    notation: "y' R' U' R U' F R2 U R2 U' R2 F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的UL VLS 179情况',
    recognition: 'VLS-UL，VLS 179情况识别',
    searchKeys: ['vls', 'ul', '179', 'f2l', 'oll'],
  },

  // VLS UL - VLS 180
  {
    id: 'vls_ul_180',
    name: 'VLS UL VLS 180',
    notation: "U2 R U' R' S' R U' R' S",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UL VLS 180情况',
    recognition: 'VLS-UL，VLS 180情况识别',
    searchKeys: ['vls', 'ul', '180', 'f2l', 'oll'],
  },

  // VLS UL - VLS 181
  {
    id: 'vls_ul_181',
    name: 'VLS UL VLS 181',
    notation: "U2 R U2 R' U R U R' U' R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UL VLS 181情况',
    recognition: 'VLS-UL，VLS 181情况识别',
    searchKeys: ['vls', 'ul', '181', 'f2l', 'oll'],
  },

  // VLS UL - VLS 182
  {
    id: 'vls_ul_182',
    name: 'VLS UL VLS 182',
    notation: "U F' U2 F R U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 7,
    explanation: 'VLS方法中的UL VLS 182情况',
    recognition: 'VLS-UL，VLS 182情况识别',
    searchKeys: ['vls', 'ul', '182', 'f2l', 'oll'],
  },

  // VLS UL - VLS 183
  {
    id: 'vls_ul_183',
    name: 'VLS UL VLS 183',
    notation: "U2 F' U F U' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UL VLS 183情况',
    recognition: 'VLS-UL，VLS 183情况识别',
    searchKeys: ['vls', 'ul', '183', 'f2l', 'oll'],
  },

  // VLS UL - VLS 184
  {
    id: 'vls_ul_184',
    name: 'VLS UL VLS 184',
    notation: "U F' U r' F2 r U F",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的UL VLS 184情况',
    recognition: 'VLS-UL，VLS 184情况识别',
    searchKeys: ['vls', 'ul', '184', 'f2l', 'oll'],
  },

  // VLS UL - VLS 185
  {
    id: 'vls_ul_185',
    name: 'VLS UL VLS 185',
    notation: "U R U R2 F R F' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UL VLS 185情况',
    recognition: 'VLS-UL，VLS 185情况识别',
    searchKeys: ['vls', 'ul', '185', 'f2l', 'oll'],
  },

  // VLS UL - VLS 186
  {
    id: 'vls_ul_186',
    name: 'VLS UL VLS 186',
    notation: "U2 R U2 R2 F' U' F U R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的UL VLS 186情况',
    recognition: 'VLS-UL，VLS 186情况识别',
    searchKeys: ['vls', 'ul', '186', 'f2l', 'oll'],
  },

  // VLS UL - VLS 187
  {
    id: 'vls_ul_187',
    name: 'VLS UL VLS 187',
    notation: "U2 R' U' R U' R' U2 F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的UL VLS 187情况',
    recognition: 'VLS-UL，VLS 187情况识别',
    searchKeys: ['vls', 'ul', '187', 'f2l', 'oll'],
  },

  // VLS UL - VLS 188
  {
    id: 'vls_ul_188',
    name: 'VLS UL VLS 188',
    notation: "U2 R U' R' U R' U' F' U F R2 U' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UL VLS 188情况',
    recognition: 'VLS-UL，VLS 188情况识别',
    searchKeys: ['vls', 'ul', '188', 'f2l', 'oll'],
  },

  // VLS UL - VLS 189
  {
    id: 'vls_ul_189',
    name: 'VLS UL VLS 189',
    notation: "U2 x' R F' R U' R' U l' U R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的UL VLS 189情况',
    recognition: 'VLS-UL，VLS 189情况识别',
    searchKeys: ['vls', 'ul', '189', 'f2l', 'oll'],
  },

  // VLS UL - VLS 190
  {
    id: 'vls_ul_190',
    name: 'VLS UL VLS 190',
    notation: "y' U R' U R U R2 F R F' R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的UL VLS 190情况',
    recognition: 'VLS-UL，VLS 190情况识别',
    searchKeys: ['vls', 'ul', '190', 'f2l', 'oll'],
  },

  // VLS NE - VLS 1
  {
    id: 'vls_ne_1',
    name: 'VLS NE VLS 1',
    notation: "U S R S' R U' R2 F' U' F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的NE VLS 1情况',
    recognition: 'VLS-NE，VLS 1情况识别',
    searchKeys: ['vls', 'ne', '1', 'f2l', 'oll'],
  },

  // VLS NE - VLS 2
  {
    id: 'vls_ne_2',
    name: 'VLS NE VLS 2',
    notation: "R' F R F' R U2 R2 F R F' R U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的NE VLS 2情况',
    recognition: 'VLS-NE，VLS 2情况识别',
    searchKeys: ['vls', 'ne', '2', 'f2l', 'oll'],
  },

  // VLS NE - VLS 3
  {
    id: 'vls_ne_3',
    name: 'VLS NE VLS 3',
    notation: "y' U R' U' M' F' U' F R2 r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的NE VLS 3情况',
    recognition: 'VLS-NE，VLS 3情况识别',
    searchKeys: ['vls', 'ne', '3', 'f2l', 'oll'],
  },

  // VLS NE - VLS 4
  {
    id: 'vls_ne_4',
    name: 'VLS NE VLS 4',
    notation: "y R' F' R U2 M' U' M",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 8,
    explanation: 'VLS方法中的NE VLS 4情况',
    recognition: 'VLS-NE，VLS 4情况识别',
    searchKeys: ['vls', 'ne', '4', 'f2l', 'oll'],
  },

  // VLS NE - VLS 5
  {
    id: 'vls_ne_5',
    name: 'VLS NE VLS 5',
    notation: "U' F' U F R U' R2 U' F U R U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的NE VLS 5情况',
    recognition: 'VLS-NE，VLS 5情况识别',
    searchKeys: ['vls', 'ne', '5', 'f2l', 'oll'],
  },

  // VLS NE - VLS 6
  {
    id: 'vls_ne_6',
    name: 'VLS NE VLS 6',
    notation: "U' r U' r' F U R' F R U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的NE VLS 6情况',
    recognition: 'VLS-NE，VLS 6情况识别',
    searchKeys: ['vls', 'ne', '6', 'f2l', 'oll'],
  },

  // VLS NE - VLS 7
  {
    id: 'vls_ne_7',
    name: 'VLS NE VLS 7',
    notation: "U2 R U R2 D' r U' r' D R2 U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 7情况',
    recognition: 'VLS-NE，VLS 7情况识别',
    searchKeys: ['vls', 'ne', '7', 'f2l', 'oll'],
  },

  // VLS NE - VLS 8
  {
    id: 'vls_ne_8',
    name: 'VLS NE VLS 8',
    notation: "U R U R2 F R F' U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 8情况',
    recognition: 'VLS-NE，VLS 8情况识别',
    searchKeys: ['vls', 'ne', '8', 'f2l', 'oll'],
  },

  // VLS NE - VLS 9
  {
    id: 'vls_ne_9',
    name: 'VLS NE VLS 9',
    notation: "U R U2 R2 D' r U r' D R2 U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 9情况',
    recognition: 'VLS-NE，VLS 9情况识别',
    searchKeys: ['vls', 'ne', '9', 'f2l', 'oll'],
  },

  // VLS NE - VLS 10
  {
    id: 'vls_ne_10',
    name: 'VLS NE VLS 10',
    notation: "y' U2 R' U R2 D r' U r D' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的NE VLS 10情况',
    recognition: 'VLS-NE，VLS 10情况识别',
    searchKeys: ['vls', 'ne', '10', 'f2l', 'oll'],
  },

  // VLS NE - VLS 11
  {
    id: 'vls_ne_11',
    name: 'VLS NE VLS 11',
    notation: "R' F R S R U R' U' f'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'VLS方法中的NE VLS 11情况',
    recognition: 'VLS-NE，VLS 11情况识别',
    searchKeys: ['vls', 'ne', '11', 'f2l', 'oll'],
  },

  // VLS NE - VLS 12
  {
    id: 'vls_ne_12',
    name: 'VLS NE VLS 12',
    notation: "U R U' r' U R U R' U' r R2 F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的NE VLS 12情况',
    recognition: 'VLS-NE，VLS 12情况识别',
    searchKeys: ['vls', 'ne', '12', 'f2l', 'oll'],
  },

  // VLS NE - VLS 13
  {
    id: 'vls_ne_13',
    name: 'VLS NE VLS 13',
    notation: "y' U R' F' L' U' L U L' U' L F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'VLS方法中的NE VLS 13情况',
    recognition: 'VLS-NE，VLS 13情况识别',
    searchKeys: ['vls', 'ne', '13', 'f2l', 'oll'],
  },

  // VLS NE - VLS 14
  {
    id: 'vls_ne_14',
    name: 'VLS NE VLS 14',
    notation: "y' U r' U' r R' U2 R U' r' U' r",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 14情况',
    recognition: 'VLS-NE，VLS 14情况识别',
    searchKeys: ['vls', 'ne', '14', 'f2l', 'oll'],
  },

  // VLS NE - VLS 15
  {
    id: 'vls_ne_15',
    name: 'VLS NE VLS 15',
    notation: "U' F U R U' R' F2 U' F R U R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 15情况',
    recognition: 'VLS-NE，VLS 15情况识别',
    searchKeys: ['vls', 'ne', '15', 'f2l', 'oll'],
  },

  // VLS NE - VLS 16
  {
    id: 'vls_ne_16',
    name: 'VLS NE VLS 16',
    notation: "U F' U2 F U' R' F R2 U R' U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 16情况',
    recognition: 'VLS-NE，VLS 16情况识别',
    searchKeys: ['vls', 'ne', '16', 'f2l', 'oll'],
  },

  // VLS NE - VLS 17
  {
    id: 'vls_ne_17',
    name: 'VLS NE VLS 17',
    notation: "y' U R' U R2 D r' U' r D' R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的NE VLS 17情况',
    recognition: 'VLS-NE，VLS 17情况识别',
    searchKeys: ['vls', 'ne', '17', 'f2l', 'oll'],
  },

  // VLS NE - VLS 18
  {
    id: 'vls_ne_18',
    name: 'VLS NE VLS 18',
    notation: "U2 R2 F R F' U2 R' F R2 F' U2 R' U2 R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的NE VLS 18情况',
    recognition: 'VLS-NE，VLS 18情况识别',
    searchKeys: ['vls', 'ne', '18', 'f2l', 'oll'],
  },

  // VLS NE - VLS 19
  {
    id: 'vls_ne_19',
    name: 'VLS NE VLS 19',
    notation: "U2 R' F R F' U2 M' U R U' r'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的NE VLS 19情况',
    recognition: 'VLS-NE，VLS 19情况识别',
    searchKeys: ['vls', 'ne', '19', 'f2l', 'oll'],
  },

  // VLS NE - VLS 20
  {
    id: 'vls_ne_20',
    name: 'VLS NE VLS 20',
    notation: "U x' R2 U' R' U x U' R2 U' F' U F R",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的NE VLS 20情况',
    recognition: 'VLS-NE，VLS 20情况识别',
    searchKeys: ['vls', 'ne', '20', 'f2l', 'oll'],
  },

  // VLS NE - VLS 21
  {
    id: 'vls_ne_21',
    name: 'VLS NE VLS 21',
    notation: "y' U R' U' R' D' r U' r' D R2",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'VLS方法中的NE VLS 21情况',
    recognition: 'VLS-NE，VLS 21情况识别',
    searchKeys: ['vls', 'ne', '21', 'f2l', 'oll'],
  },

  // VLS NE - VLS 22
  {
    id: 'vls_ne_22',
    name: 'VLS NE VLS 22',
    notation: "R' F R U' M' U R U' r' U R U R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的NE VLS 22情况',
    recognition: 'VLS-NE，VLS 22情况识别',
    searchKeys: ['vls', 'ne', '22', 'f2l', 'oll'],
  },

  // VLS NE - VLS 23
  {
    id: 'vls_ne_23',
    name: 'VLS NE VLS 23',
    notation: "U2 F' U2 F R U' R2 F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的NE VLS 23情况',
    recognition: 'VLS-NE，VLS 23情况识别',
    searchKeys: ['vls', 'ne', '23', 'f2l', 'oll'],
  },

  // VLS NE - VLS 25
  {
    id: 'vls_ne_25',
    name: 'VLS NE VLS 25',
    notation: "U2 R' F R F' U2 R' F R F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'VLS方法中的NE VLS 25情况',
    recognition: 'VLS-NE，VLS 25情况识别',
    searchKeys: ['vls', 'ne', '25', 'f2l', 'oll'],
  },

  // VLS NE - VLS 26
  {
    id: 'vls_ne_26',
    name: 'VLS NE VLS 26',
    notation: "y U F r' R2 U' R' U r U' R' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'VLS方法中的NE VLS 26情况',
    recognition: 'VLS-NE，VLS 26情况识别',
    searchKeys: ['vls', 'ne', '26', 'f2l', 'oll'],
  },

  // VLS NE - VLS 27
  {
    id: 'vls_ne_27',
    name: 'VLS NE VLS 27',
    notation: "U2 R U' R' F' U F U F R' F' R2 U2 R'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'VLS方法中的NE VLS 27情况',
    recognition: 'VLS-NE，VLS 27情况识别',
    searchKeys: ['vls', 'ne', '27', 'f2l', 'oll'],
  },

  // VLS NE - VLS 28
  {
    id: 'vls_ne_28',
    name: 'VLS NE VLS 28',
    notation: "U2 R' F R F' U' R' U' R' F R U R U' F'",
    category: FormulaCategory.VLS,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'VLS方法中的NE VLS 28情况',
    recognition: 'VLS-NE，VLS 28情况识别',
    searchKeys: ['vls', 'ne', '28', 'f2l', 'oll'],
  },

]

// ============================================
// 完整公式库合并
// ============================================

export const FULL_FORMULA_LIBRARY: Formula[] = [
  // 技巧
  {
    id: 'trick_sexy',
    name: 'Sexy Move',
    notation: "R U R' U'",
    category: FormulaCategory.TRICKS,
    method: FormulaMethod.CFOP,
    difficulty: 1,
    moves: 4,
    explanation: '最基础的魔方动作组合，大量公式的基础',
    tips: '练习到肌肉记忆，这非常重要',
    searchKeys: ['sexy', '基础', 'rur', '肌肉记忆'],
  },
  {
    id: 'trick_sledge',
    name: 'Sledgehammer',
    notation: "R' F R F'",
    category: FormulaCategory.TRICKS,
    method: FormulaMethod.CFOP,
    difficulty: 2,
    moves: 4,
    explanation: '另一个重要的基础动作组合',
    tips: '与SexyMove同样重要',
    searchKeys: ['sledgehammer', 'rfrf', '基础'],
  },
  // Cross
  {
    id: 'cross_basic',
    name: 'Cross - 底层十字',
    notation: '根据情况自由发挥',
    category: FormulaCategory.CROSS,
    method: FormulaMethod.CFOP,
    difficulty: 1,
    moves: 0,
    explanation: '底层十字没有固定公式，需要根据打乱情况灵活处理',
    tips: '尽量用8步以内完成，注意相对位置',
    searchKeys: ['cross', '十字', '底层', '入门'],
  },
  // ... 添加 PLL
  ...PLL_ALGORITHMS,
  // ... 添加 OLL (简化版，实际需要57个)
  ...OLL_ALGORITHMS,
  // ... 添加 COLL
  ...COLL_ALGORITHMS,
  // ... 添加 ZBLL (部分)
  ...ZBLL_ALGORITHMS,
  // ... 添加 VLS
  ...VLS_ALGORITHMS,
]

/**
 * 从完整库中获取公式
 */
export function getFormulaById(id: string): Formula | undefined {
  return FULL_FORMULA_LIBRARY.find(f => f.id === id)
}

/**
 * 根据方法获取公式
 */
export function getFormulasByMethod(method: FormulaMethod): Formula[] {
  return FULL_FORMULA_LIBRARY.filter(f => f.method === method)
}

/**
 * 根据分类获取公式
 */
export function getFormulasByCategory(category: FormulaCategory): Formula[] {
  return FULL_FORMULA_LIBRARY.filter(f => f.category === category)
}

/**
 * 搜索公式
 */
export function searchFormulas(query: string): Formula[] {
  const q = query.toLowerCase()

  return FULL_FORMULA_LIBRARY.filter(f => {
    return (
      f.name.toLowerCase().includes(q) ||
      f.notation.toLowerCase().includes(q) ||
      f.explanation.toLowerCase().includes(q) ||
      f.searchKeys.some(k => k.toLowerCase().includes(q))
    )
  })
}

/**
 * 获取公式统计
 */
export function getFormulaStats() {
  return {
    total: FULL_FORMULA_LIBRARY.length,
    byCategory: {
      pll: PLL_ALGORITHMS.length,
      oll: OLL_ALGORITHMS.length,
      coll: COLL_ALGORITHMS.length,
      zbll: ZBLL_ALGORITHMS.length,
      vls: VLS_ALGORITHMS.length,
      tricks: 2,
      cross: 1,
    },
    byMethod: {
      cfop: FULL_FORMULA_LIBRARY.filter(f => f.method === FormulaMethod.CFOP).length,
      zz: FULL_FORMULA_LIBRARY.filter(f => f.method === FormulaMethod.ZZ).length,
      roux: FULL_FORMULA_LIBRARY.filter(f => f.method === FormulaMethod.ROUX).length,
    },
  }
}

/**
 * 将Move数组转换为标准记号字符串
 */
function movesToNotation(moves: Move[]): string {
  return moves.map(m => {
    let s = m.face  // 保持原始大小写
    if (m.modifier) s += m.modifier
    return s
  }).join(' ')
}

/**
 * 标准化公式记号（处理各种变体）
 * 处理旋转、等价公式、宽层动作、中层动作等
 */
function normalizeNotation(notation: string): string[] {
  const variations: string[] = []

  // 标准化空格
  const normalized = notation.replace(/\s+/g, ' ').trim()

  // 1. 原始记号
  variations.push(normalized)

  // 2. 移除所有空格（用于匹配不带空格的输入）
  variations.push(normalized.replace(/\s/g, ''))

  // 3. 移除前导旋转 (y, y', y2) 用于比较核心公式
  const withoutLeadingRot = normalized.replace(/^(y[2']?\s+|y\s+)/i, '')
  if (withoutLeadingRot !== normalized) {
    variations.push(withoutLeadingRot)
    variations.push(withoutLeadingRot.replace(/\s/g, ''))
  }

  // 4. 带y旋转的变体（常见于公式开始）
  const rotations = ['y', "y'", 'y2']
  for (const rot of rotations) {
    // 原始记号前加旋转
    variations.push(`${rot} ${normalized}`)

    // 去掉原始记号前导旋转后再加
    if (normalized.startsWith('y') || normalized.startsWith("y'") || normalized.startsWith('y2')) {
      const stripped = normalized.replace(/^(y[2']?\s+|y\s+)/i, '')
      variations.push(`${rot} ${stripped}`)
    }
  }

  return [...new Set(variations)]
}

/**
 * 根据动作序列查找匹配的公式
 * @param moves - 动作序列
 * @returns 匹配的公式列表
 */
export function findMatchingFormula(moves: Move[]): Formula[] {
  if (!moves || moves.length === 0) return []

  const inputNotation = movesToNotation(moves)
  const inputVariations = normalizeNotation(inputNotation)

  const matches: Formula[] = []

  for (const formula of FULL_FORMULA_LIBRARY) {
    const formulaVariations = normalizeNotation(formula.notation)

    // 检查是否有匹配的变体
    for (const inputVar of inputVariations) {
      for (const formulaVar of formulaVariations) {
        // 直接匹配
        if (inputVar === formulaVar) {
          matches.push(formula)
          break
        }

        // 部分匹配（检查是否包含核心模式）
        // 处理公式开头有旋转的情况
        const cleanInput = inputVar.replace(/^y[2']?\s*/i, '').replace(/^y\s*/i, '')
        const cleanFormula = formulaVar.replace(/^y[2']?\s*/i, '').replace(/^y\s*/i, '')

        if (cleanInput === cleanFormula || cleanInput === formulaVar.toLowerCase()) {
          if (!matches.find(m => m.id === formula.id)) {
            matches.push(formula)
          }
          break
        }
      }
    }
  }

  return matches
}

/**
 * 根据公式记号字符串查找匹配的公式
 * @param notation - 公式记号字符串
 * @returns 匹配的公式列表
 */
export function findFormulaByNotation(notation: string): Formula[] {
  // 简单解析记号字符串为Move数组
  const tokens = notation.trim().split(/\s+/)
  const moves: Move[] = []

  for (const token of tokens) {
    const match = token.match(/^([RLUDFB]|[rludfb]|Rw|Lw|Uw|Dw|Fw|Bw|x|y|z|M|E|S|m|e|s)([2']?)$/i)
    if (match) {
      const rawFace = match[1]
      const modifier: '' | "'" | '2' = (match[2] || '') as '' | "'" | '2'
      const isWide = /[rludfb]/i.test(rawFace) || /w/i.test(token)
      const isMiddle = /^[MESmes]$/i.test(rawFace)

      // Preserve original case for wide and middle moves
      const face = isMiddle ? rawFace : (isWide ? rawFace : rawFace.toUpperCase())

      moves.push({ face, modifier, isWide, isMiddle })
    }
  }

  return findMatchingFormula(moves)
}

