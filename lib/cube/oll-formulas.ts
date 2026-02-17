/**
 * OLL (Orientation of Last Layer) 公式库
 *
 * 57种OLL情况，按顶面图案分类
 *
 * 分类：
 * - Dot (点): 1种
 * - Line (线): 5种
 * - L Shape (L形): 4种
 * - Small Square (小方块): 1种
 * - Big Square (大方块): 1种
 * - T Shape (T形): 4种
 * - H Shape (H形): 1种
 * - Pi (π形): 2种
 * - Arrow (箭头): 1种
 * - Fish (鱼形)/Sune: 8种
 * - Anti-Sune: 8种
 * - Lightning/Double-edges: 7种
 * - Corners: 14种
 */

export interface OLLCase {
  id: string           // 如 "OLL_1", "OLL_21_Sune"
  name: string         // 如 "Dot", "Sune", "T-Perm"
  category: string     // 分类
  edges: number        // 顶面正确棱块数 (0-4)
  corners: number      // 顶面正确角块数 (0-4)
  algorithm: string    // 公式
  description?: string // 描述
}

/**
 * OLL 一字/点类 (Dot, Line)
 */
export const OLL_DOT_AND_LINE: OLLCase[] = [
  {
    id: 'OLL_1',
    name: 'Dot',
    category: 'dot',
    edges: 0,
    corners: 0,
    algorithm: "F R U R' U' F' U2 F R U R' U' F'",
    description: '顶面全空，需要两步'
  },
  {
    id: 'OLL_2',
    name: 'Line',
    category: 'line',
    edges: 2,
    corners: 0,
    algorithm: "F R U R' U' F'",
    description: '顶面横线'
  },
  {
    id: 'OLL_3',
    name: 'Line (Vertical)',
    category: 'line',
    edges: 2,
    corners: 0,
    algorithm: "F R U R' U' R U R' U' F'",
    description: '顶面竖线（做Line后旋转）'
  },
]

/**
 * OLL L形类 (2-look OLL 第一步 - 做十字)
 */
export const OLL_L_SHAPE: OLLCase[] = [
  {
    id: 'OLL_4',
    name: 'L Shape (Top-Left)',
    category: 'l_shape',
    edges: 1,
    corners: 1,
    algorithm: "F R U R' U' R U R' U' F'",
    description: 'L形在左上'
  },
  {
    id: 'OLL_5',
    name: 'L Shape (Top-Right)',
    category: 'l_shape',
    edges: 1,
    corners: 1,
    algorithm: "R U R' U R U2 R' F R U R' U' F'",
    description: 'L形在右上'
  },
  {
    id: 'OLL_6',
    name: 'L Shape (Bottom-Left)',
    category: 'l_shape',
    edges: 1,
    corners: 1,
    algorithm: "F' L' U' L U L' U' L U F",
    description: 'L形在左下'
  },
  {
    id: 'OLL_7',
    name: 'L Shape (Bottom-Right)',
    category: 'l_shape',
    edges: 1,
    corners: 1,
    algorithm: "R U R' U' R U R' U F R U R' U' F'",
    description: 'L形在右下'
  },
]

/**
 * OLL 鱼形类 (Sune/Anti-Sune) - 最常用
 */
export const OLL_SUNE: OLLCase[] = [
  {
    id: 'OLL_21',
    name: 'Sune',
    category: 'sune',
    edges: 0,
    corners: 2,
    algorithm: "R U R' U R U2 R'",
    description: '最常用的OLL'
  },
  {
    id: 'OLL_22',
    name: 'Anti-Sune',
    category: 'anti_sune',
    edges: 2,
    corners: 2,
    algorithm: "R U2 R' U' R U' R'",
    description: 'Sune的逆'
  },
  {
    id: 'OLL_23',
    name: 'Bruno',
    category: 'sune',
    edges: 1,
    corners: 2,
    algorithm: "R' U L' U2 R U' R' U2 R L",
    description: '带插入的Sune变体'
  },
  {
    id: 'OLL_24',
    name: 'Nicklas',
    category: 'sune',
    edges: 1,
    corners: 2,
    algorithm: "R U R' U R U' R' U R U2 R'",
    description: '另一种Sune变体'
  },
  {
    id: 'OLL_26',
    name: 'Sune (Mirror)',
    category: 'sune',
    edges: 0,
    corners: 2,
    algorithm: "L' U' L U' L' U2 L",
    description: 'Sune的镜像（左手）'
  },
]

/**
 * OLL T形类 - 常用
 */
export const OLL_T_SHAPE: OLLCase[] = [
  {
    id: 'OLL_33',
    name: 'T Shape (Standard)',
    category: 't_shape',
    edges: 2,
    corners: 2,
    algorithm: "R U R' U' R' F R F'",
    description: 'T形，标准情况'
  },
  {
    id: 'OLL_34',
    name: 'T Shape (Inverted)',
    category: 't_shape',
    edges: 2,
    corners: 2,
    algorithm: "F R U R' U' F'",
    description: '倒T形'
  },
  {
    id: 'OLL_35',
    name: 'T Shape (Left)',
    category: 't_shape',
    edges: 2,
    corners: 2,
    algorithm: "L' U' L U L F' L' F",
    description: 'T形在左侧'
  },
  {
    id: 'OLL_36',
    name: 'T Shape (Right)',
    category: 't_shape',
    edges: 2,
    corners: 2,
    algorithm: "R U R' U' R' F R F'",
    description: 'T形在右侧'
  },
]

/**
 * OLL H形类
 */
export const OLL_H_SHAPE: OLLCase[] = [
  {
    id: 'OLL_51',
    name: 'H',
    category: 'h_shape',
    edges: 0,
    corners: 4,
    algorithm: "R U R' U R U' R' U R U2 R'",
    description: 'H形，四个角块朝向正确'
  },
]

/**
 * OLL Pi形类
 */
export const OLL_PI: OLLCase[] = [
  {
    id: 'OLL_52',
    name: 'Pi',
    category: 'pi',
    edges: 0,
    corners: 2,
    algorithm: "R U2 R2 U' R2 U' R2 U2 R",
    description: 'π形'
  },
  {
    id: 'OLL_53',
    name: 'Pi (Inverted)',
    category: 'pi',
    edges: 0,
    corners: 2,
    algorithm: "R' F R U' R2 F' R2 U R'",
    description: '倒π形'
  },
]

/**
 * 方块类
 */
export const OLL_SQUARE: OLLCase[] = [
  {
    id: 'OLL_55',
    name: 'Small Square',
    category: 'square',
    edges: 2,
    corners: 4,
    algorithm: "R U2 R' U' R U R' U' R U' R'",
    description: '小方块'
  },
  {
    id: 'OLL_56',
    name: 'Big Square',
    category: 'square',
    edges: 2,
    corners: 4,
    algorithm: "R' U' R U' R' U2 R",
    description: '大方块'
  },
]

/**
 * 箭头类
 */
export const OLL_ARROW: OLLCase[] = [
  {
    id: 'OLL_57',
    name: 'Arrow',
    category: 'arrow',
    edges: 1,
    corners: 3,
    algorithm: "F' U' F U R U R'",
    description: '箭头形'
  },
  {
    id: 'OLL_8',
    name: 'Arrow (Left)',
    category: 'arrow',
    edges: 1,
    corners: 3,
    algorithm: "F U F' U' L' U' L",
    description: '左箭头'
  },
  {
    id: 'OLL_9',
    name: 'Arrow (Right)',
    category: 'arrow',
    edges: 1,
    corners: 3,
    algorithm: "R U R' U' R U R' U' R U R'",
    description: '右箭头'
  },
]

/**
 * Headlights（车灯形）- 2-look OLL 常用
 */
export const OLL_HEADLIGHTS: OLLCase[] = [
  {
    id: 'OLL_25',
    name: 'Headlights',
    category: 'headlights',
    edges: 0,
    corners: 2,
    algorithm: "R U2 R' U' R U' R'",
    description: '车灯形（两个角块相邻朝上）'
  },
  {
    id: 'OLL_27',
    name: 'Headlights (Mirror)',
    category: 'headlights',
    edges: 0,
    corners: 2,
    algorithm: "L' U2 L U L' U L",
    description: '车灯形镜像'
  },
]

/**
 * Chameleon（变色龙形）- 2-look OLL 常用
 */
export const OLL_CHAMELEON: OLLCase[] = [
  {
    id: 'OLL_28',
    name: 'Chameleon',
    category: 'chameleon',
    edges: 2,
    corners: 2,
    algorithm: "r U R' U' r' F R F'",
    description: '变色龙形（宽转动）'
  },
  {
    id: 'OLL_29',
    name: 'Chameleon (Mirror)',
    category: 'chameleon',
    edges: 2,
    corners: 2,
    algorithm: "R U R' U' R U' R' F' U' F",
    description: '变色龙形镜像'
  },
]

/**
 * Bowtie（蝴蝶结形）- 2-look OLL 常用
 */
export const OLL_BOWTIE: OLLCase[] = [
  {
    id: 'OLL_30',
    name: 'Bowtie',
    category: 'bowtie',
    edges: 2,
    corners: 2,
    algorithm: "F R' F R2 U' R' U' R U R' F2",
    description: '蝴蝶结形'
  },
  {
    id: 'OLL_31',
    name: 'Bowtie (Mirror)',
    category: 'bowtie',
    edges: 2,
    corners: 2,
    algorithm: "R' U' F U R U' R' F' R",
    description: '蝴蝶结形镜像'
  },
  {
    id: 'OLL_32',
    name: 'Bowtie (Alt)',
    category: 'bowtie',
    edges: 2,
    corners: 2,
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    description: '蝴蝶结形变体'
  },
]

/**
 * P Shape (P形) - 2-look OLL
 */
export const OLL_P_SHAPE: OLLCase[] = [
  {
    id: 'OLL_10',
    name: 'P Shape (Left)',
    category: 'p_shape',
    edges: 2,
    corners: 2,
    algorithm: "F U R U' R' F'",
    description: 'P形在左'
  },
  {
    id: 'OLL_11',
    name: 'P Shape (Right)',
    category: 'p_shape',
    edges: 2,
    corners: 2,
    algorithm: "F' U' L' U L F",
    description: 'P形在右'
  },
]

/**
 * C Shape (C形) - 2-look OLL
 */
export const OLL_C_SHAPE: OLLCase[] = [
  {
    id: 'OLL_12',
    name: 'C Shape',
    category: 'c_shape',
    edges: 2,
    corners: 2,
    algorithm: "R U R2 U' R' F R U R U' F'",
    description: 'C形'
  },
  {
    id: 'OLL_13',
    name: 'C Shape (Mirror)',
    category: 'c_shape',
    edges: 2,
    corners: 2,
    algorithm: "L' U' L2 U L F' L' U' L' U F",
    description: 'C形镜像'
  },
]

/**
 * W Shape (W形)
 */
export const OLL_W_SHAPE: OLLCase[] = [
  {
    id: 'OLL_14',
    name: 'W Shape',
    category: 'w_shape',
    edges: 2,
    corners: 2,
    algorithm: "R U R' U R U' R' U R U2 R'",
    description: 'W形'
  },
  {
    id: 'OLL_15',
    name: 'W Shape (Mirror)',
    category: 'w_shape',
    edges: 2,
    corners: 2,
    algorithm: "L' U' L U' L' U L U' L' U2 L",
    description: 'W形镜像'
  },
]

/**
 * Fish Shape (鱼形) - 额外的Sune变体
 */
export const OLL_FISH: OLLCase[] = [
  {
    id: 'OLL_16',
    name: 'Fish (Standard)',
    category: 'fish',
    edges: 1,
    corners: 3,
    algorithm: "R U R' U' R' F R2 U R' U' F'",
    description: '标准鱼形'
  },
  {
    id: 'OLL_17',
    name: 'Fish (Mirror)',
    category: 'fish',
    edges: 1,
    corners: 3,
    algorithm: "L' U' L U L F' L2 U' L U F",
    description: '鱼形镜像'
  },
  {
    id: 'OLL_18',
    name: 'Fish (Alt)',
    category: 'fish',
    edges: 1,
    corners: 3,
    algorithm: "F R U' R' U' R U R' F'",
    description: '鱼形变体'
  },
]

/**
 * Knight Move (骑士移动形)
 */
export const OLL_KNIGHT: OLLCase[] = [
  {
    id: 'OLL_19',
    name: 'Knight Move (Left)',
    category: 'knight',
    edges: 2,
    corners: 2,
    algorithm: "R' F R F' R' F R F'",
    description: '骑士移动左'
  },
  {
    id: 'OLL_20',
    name: 'Knight Move (Right)',
    category: 'knight',
    edges: 2,
    corners: 2,
    algorithm: "L F' L' F L F' L' F",
    description: '骑士移动右'
  },
]

/**
 * 3个棱块朝向的情况
 *
 * 这些情况通常发生在F2L完成后但还没有标准OLL状态时
 * 需要用Sune或Anti-Sune将其���换为标准OLL状态
 */
export const OLL_THREE_EDGES: OLLCase[] = [
  {
    id: 'OLL_58',
    name: 'Three Edges - No Corners',
    category: 'sune',
    edges: 3,
    corners: 0,
    algorithm: "R U R' U R U2 R' U' R U R' U R U2 R'",  // Sune x2
    description: '3个棱块朝向，0个角块朝向 - 需要两个Sune'
  },
  {
    id: 'OLL_59',
    name: 'Three Edges - One Corner',
    category: 'sune',
    edges: 3,
    corners: 1,
    algorithm: "R U R' U R U2 R'",  // Sune
    description: '3个棱块朝向，1个角块朝向'
  },
  {
    id: 'OLL_60',
    name: 'Three Edges - Two Corners',
    category: 'sune',
    edges: 3,
    corners: 2,
    algorithm: "R U2 R' U' R U' R'",  // Anti-Sune
    description: '3个棱块朝向，2个角块朝向'
  },
]

/**
 * 十字OLL（4个棱块朝向）- 2-look OLL 第二步
 */
export const OLL_CROSS: OLLCase[] = [
  {
    id: 'OLL_45',
    name: 'Cross + Sune',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "R U R' U R U2 R'",
    description: '十字+Sune模式'
  },
  {
    id: 'OLL_46',
    name: 'Cross + Anti-Sune',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "R U2 R' U' R U' R'",
    description: '十字+Anti-Sune模式'
  },
  {
    id: 'OLL_47',
    name: 'Cross + Headlights',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "F R U R' U' R U R' U' F'",
    description: '十字+车灯形'
  },
  {
    id: 'OLL_48',
    name: 'Cross + Chameleon',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "r U R' U' r' F R F'",
    description: '十字+变色龙'
  },
  {
    id: 'OLL_49',
    name: 'Cross + Bowtie',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "R' F R' F' R2 U2' R U R' U R",
    description: '十字+蝴蝶结'
  },
  {
    id: 'OLL_61',
    name: 'Cross Only',
    category: 'cross',
    edges: 4,
    corners: 0,
    algorithm: "R U R' U R U2 R' U2 R U R' U R U2 R'",
    description: '仅十字，无角块'
  },
  {
    id: 'OLL_62',
    name: 'Cross + 1 Corner',
    category: 'cross',
    edges: 4,
    corners: 1,
    algorithm: "R U R' U R U2 R'",
    description: '十字+1个角块'
  },
  {
    id: 'OLL_63',
    name: 'Cross + 2 Corners (Adjacent)',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "R U R' U R U2 R' U' R U R' U R U2 R'",
    description: '十字+2个相邻角块'
  },
  {
    id: 'OLL_64',
    name: 'Cross + 2 Corners (Opposite)',
    category: 'cross',
    edges: 4,
    corners: 2,
    algorithm: "R U2 R' U' R U' R'",
    description: '十字+2个相对角块'
  },
  {
    id: 'OLL_65',
    name: 'Cross + 3 Corners',
    category: 'cross',
    edges: 4,
    corners: 3,
    algorithm: "R U R' U R U2 R'",
    description: '十字+3个角块'
  },
  {
    id: 'OLL_66',
    name: 'OLL Done (Solved)',
    category: 'cross',
    edges: 4,
    corners: 4,
    algorithm: '',
    description: 'OLL已完成'
  },
]

/**
 * 所有OLL公式汇总
 */
export const ALL_OLL_CASES: OLLCase[] = [
  ...OLL_DOT_AND_LINE,
  ...OLL_L_SHAPE,
  ...OLL_SUNE,
  ...OLL_T_SHAPE,
  ...OLL_H_SHAPE,
  ...OLL_PI,
  ...OLL_SQUARE,
  ...OLL_ARROW,
  ...OLL_HEADLIGHTS,     // 车灯形
  ...OLL_CHAMELEON,      // 变色龙形
  ...OLL_BOWTIE,         // 蝴蝶结形
  ...OLL_P_SHAPE,        // P形
  ...OLL_C_SHAPE,        // C形
  ...OLL_W_SHAPE,        // W形
  ...OLL_FISH,           // 鱼形
  ...OLL_KNIGHT,         // 骑士移动形
  ...OLL_THREE_EDGES,    // 3棱块情况
  ...OLL_CROSS,          // 十字OLL
]

/**
 * 通过ID查找OLL公式
 */
export function findOLLById(id: string): OLLCase | undefined {
  return ALL_OLL_CASES.find(c => c.id === id || c.id === `OLL_${id}`)
}

/**
 * 获取常用的OLL公式（学��建议）
 */
export const RECOMMENDED_OLL: OLLCase[] = [
  findOLLById('21')!,  // Sune - 必须
  findOLLById('22')!,  // Anti-Sune
  findOLLById('33')!,  // T Shape
  findOLLById('2')!,   // Line
  findOLLById('4')!,   // L Shape
  findOLLById('51')!,  // H
  findOLLById('52')!,  // Pi
].filter(Boolean)

// 辅助函数
function findOLLByIdShort(id: string): OLLCase | undefined {
  return ALL_OLL_CASES.find(c => c.id === `OLL_${id}`)
}
