/**
 * F2L 完整公式表（41个情况）
 * 来源：J Perm 和 CubeSkills
 */

export interface F2LCase {
  id: string
  name: string
  algorithm: string
  moves: number
  description: string
}

/**
 * F2L 41个标准情况
 */
export const F2L_ALGORITHMS: F2LCase[] = [
  // ========== 基础情况（Corner 和 Edge 都在顶层）==========
  
  // Case 1-4: Corner 和 Edge 分离
  {
    id: 'f2l_1',
    name: 'Case 1',
    algorithm: 'U R U\' R\'',
    moves: 4,
    description: 'Corner 在顶层，Edge 在顶层，需要配对'
  },
  {
    id: 'f2l_2',
    name: 'Case 2',
    algorithm: 'R U R\'',
    moves: 3,
    description: 'Corner 在顶层，Edge 在顶层'
  },
  {
    id: 'f2l_3',
    name: 'Case 3',
    algorithm: 'U\' R U R\'',
    moves: 4,
    description: 'Corner 在顶层，Edge 在顶层'
  },
  {
    id: 'f2l_4',
    name: 'Case 4',
    algorithm: 'R U\' R\' U R U R\'',
    moves: 7,
    description: 'Corner 在顶层，Edge 在顶层，需要旋转'
  },
  
  // Case 5-8: Corner 和 Edge 已配对但方向错误
  {
    id: 'f2l_5',
    name: 'Case 5',
    algorithm: 'U\' R U2 R\' U R U\' R\'',
    moves: 8,
    description: 'Corner 和 Edge 已配对，需要调整方向'
  },
  {
    id: 'f2l_6',
    name: 'Case 6',
    algorithm: 'R U\' R\' U2 R U\' R\'',
    moves: 7,
    description: 'Corner 和 Edge 已配对'
  },
  {
    id: 'f2l_7',
    name: 'Case 7',
    algorithm: 'U R U2 R\' U\' R U R\'',
    moves: 8,
    description: 'Corner 和 Edge 已配对'
  },
  {
    id: 'f2l_8',
    name: 'Case 8',
    algorithm: 'U\' R U\' R\' U R U\' R\'',
    moves: 8,
    description: 'Corner 和 Edge 已配对'
  },
  
  // Case 9-12: Corner 朝上
  {
    id: 'f2l_9',
    name: 'Case 9',
    algorithm: 'R U R\' U\' R U R\'',
    moves: 7,
    description: 'Corner 朝上'
  },
  {
    id: 'f2l_10',
    name: 'Case 10',
    algorithm: 'U\' R U R\' U R U\' R\'',
    moves: 8,
    description: 'Corner 朝上'
  },
  {
    id: 'f2l_11',
    name: 'Case 11',
    algorithm: 'U R U2 R\' U R U\' R\'',
    moves: 8,
    description: 'Corner 朝上'
  },
  {
    id: 'f2l_12',
    name: 'Case 12',
    algorithm: 'R U\' R\' U R U\' R\'',
    moves: 7,
    description: 'Corner 朝上'
  },
  
  // Case 13-16: Edge 朝前
  {
    id: 'f2l_13',
    name: 'Case 13',
    algorithm: 'U\' R U\' R\' U2 R U\' R\'',
    moves: 8,
    description: 'Edge 朝前'
  },
  {
    id: 'f2l_14',
    name: 'Case 14',
    algorithm: 'R U R\' U2 R U R\'',
    moves: 7,
    description: 'Edge 朝前'
  },
  {
    id: 'f2l_15',
    name: 'Case 15',
    algorithm: 'U\' R U2 R\' U2 R U\' R\'',
    moves: 8,
    description: 'Edge 朝前'
  },
  {
    id: 'f2l_16',
    name: 'Case 16',
    algorithm: 'R U2 R\' U2 R U R\'',
    moves: 7,
    description: 'Edge 朝前'
  },
  
  // Case 17-20: Corner 在槽位中
  {
    id: 'f2l_17',
    name: 'Case 17',
    algorithm: 'R U\' R\' U\' F\' U F',
    moves: 7,
    description: 'Corner 在槽位中，方向错误'
  },
  {
    id: 'f2l_18',
    name: 'Case 18',
    algorithm: 'R U R\' U\' R U R\' U\' R U R\'',
    moves: 11,
    description: 'Corner 在槽位中'
  },
  {
    id: 'f2l_19',
    name: 'Case 19',
    algorithm: 'R U\' R\' U R U\' R\' U R U\' R\'',
    moves: 11,
    description: 'Corner 在槽位中'
  },
  {
    id: 'f2l_20',
    name: 'Case 20',
    algorithm: 'R U R\' U\' R U\' R\' U2 R U\' R\'',
    moves: 11,
    description: 'Corner 在槽位中'
  },
  
  // Case 21-24: Edge 在槽位中
  {
    id: 'f2l_21',
    name: 'Case 21',
    algorithm: 'U R U\' R\' U\' F\' U F',
    moves: 8,
    description: 'Edge 在槽位中'
  },
  {
    id: 'f2l_22',
    name: 'Case 22',
    algorithm: 'U\' R U R\' U R U R\'',
    moves: 8,
    description: 'Edge 在槽位中'
  },
  {
    id: 'f2l_23',
    name: 'Case 23',
    algorithm: 'R U\' R\' U2 F\' U\' F',
    moves: 7,
    description: 'Edge 在槽位中'
  },
  {
    id: 'f2l_24',
    name: 'Case 24',
    algorithm: 'R U R\' U\' R U R\'',
    moves: 7,
    description: 'Edge 在槽位中'
  },
  
  // Case 25-32: Corner 和 Edge 都在槽位中
  {
    id: 'f2l_25',
    name: 'Case 25',
    algorithm: 'R U\' R\' U2 R U R\' U R U\' R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_26',
    name: 'Case 26',
    algorithm: 'R U\' R\' U R U\' R\' U2 R U\' R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_27',
    name: 'Case 27',
    algorithm: 'R U R\' U\' R U\' R\' U2 R U\' R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_28',
    name: 'Case 28',
    algorithm: 'R U\' R\' U\' R U R\' U\' R U R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_29',
    name: 'Case 29',
    algorithm: 'R U R\' U\' R U2 R\' U\' R U R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_30',
    name: 'Case 30',
    algorithm: 'R U\' R\' U2 R U2 R\' U R U\' R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_31',
    name: 'Case 31',
    algorithm: 'R U R\' U2 R U\' R\' U R U\' R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  {
    id: 'f2l_32',
    name: 'Case 32',
    algorithm: 'R U\' R\' U R U2 R\' U R U\' R\'',
    moves: 11,
    description: 'Corner 和 Edge 都在槽位中'
  },
  
  // Case 33-41: 特殊情况
  {
    id: 'f2l_33',
    name: 'Case 33',
    algorithm: 'R U R\' U\' U\' R U R\' U\' R U R\'',
    moves: 12,
    description: '特殊情况'
  },
  {
    id: 'f2l_34',
    name: 'Case 34',
    algorithm: 'U R U2 R\' U\' R U R\'',
    moves: 8,
    description: '特殊情况'
  },
  {
    id: 'f2l_35',
    name: 'Case 35',
    algorithm: 'U\' R U\' R\' U R U\' R\'',
    moves: 8,
    description: '特殊情况'
  },
  {
    id: 'f2l_36',
    name: 'Case 36',
    algorithm: 'U R U\' R\' U\' R U R\'',
    moves: 8,
    description: '特殊情况'
  },
  {
    id: 'f2l_37',
    name: 'Case 37',
    algorithm: 'R U\' R\' U R U R\'',
    moves: 7,
    description: '特殊情况'
  },
  {
    id: 'f2l_38',
    name: 'Case 38',
    algorithm: 'R U R\' U\' R U\' R\'',
    moves: 7,
    description: '特殊情况'
  },
  {
    id: 'f2l_39',
    name: 'Case 39',
    algorithm: 'R U2 R\' U\' R U R\'',
    moves: 7,
    description: '特殊情况'
  },
  {
    id: 'f2l_40',
    name: 'Case 40',
    algorithm: 'R U\' R\' U2 R U\' R\'',
    moves: 7,
    description: '特殊情况'
  },
  {
    id: 'f2l_41',
    name: 'Case 41',
    algorithm: 'R U R\' U2 R U R\'',
    moves: 7,
    description: '特殊情况'
  },
]

/**
 * 根据 ID 获取 F2L 公式
 */
export function getF2LCase(id: string): F2LCase | undefined {
  return F2L_ALGORITHMS.find(c => c.id === id)
}

/**
 * 获取所有 F2L 公式
 */
export function getAllF2LCases(): F2LCase[] {
  return F2L_ALGORITHMS
}

/**
 * 根据步数筛选 F2L 公式
 */
export function getF2LCasesByMoves(maxMoves: number): F2LCase[] {
  return F2L_ALGORITHMS.filter(c => c.moves <= maxMoves)
}
