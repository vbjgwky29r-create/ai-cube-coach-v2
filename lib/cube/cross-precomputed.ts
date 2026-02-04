/**
 * Cross 预计算表
 * 
 * 包含常见 Cross 情况的预存解法，加速求解速度
 */

export interface CrossCase {
  id: string
  pattern: string        // 状态模式（简化表示）
  solution: string       // 解法公式
  moves: number          // 步数
  description: string    // 描述
}

/**
 * Cross 预计算表（常见情况）
 */
export const CROSS_PRECOMPUTED: CrossCase[] = [
  // 已完成
  {
    id: 'cross_solved',
    pattern: 'solved',
    solution: '',
    moves: 0,
    description: 'Cross 已完成'
  },
  
  // 1个棱块未归位
  {
    id: 'cross_1edge_f',
    pattern: '1edge_f',
    solution: 'F2',
    moves: 1,
    description: '前面棱块需要翻转'
  },
  {
    id: 'cross_1edge_r',
    pattern: '1edge_r',
    solution: 'R2',
    moves: 1,
    description: '右面棱块需要翻转'
  },
  {
    id: 'cross_1edge_b',
    pattern: '1edge_b',
    solution: 'B2',
    moves: 1,
    description: '后面棱块需要翻转'
  },
  {
    id: 'cross_1edge_l',
    pattern: '1edge_l',
    solution: 'L2',
    moves: 1,
    description: '左面棱块需要翻转'
  },
  
  // 2个棱块未归位（相邻）
  {
    id: 'cross_2edge_fr',
    pattern: '2edge_fr',
    solution: 'F2 R2',
    moves: 2,
    description: '前右两个棱块'
  },
  {
    id: 'cross_2edge_rb',
    pattern: '2edge_rb',
    solution: 'R2 B2',
    moves: 2,
    description: '右后两个棱块'
  },
  {
    id: 'cross_2edge_bl',
    pattern: '2edge_bl',
    solution: 'B2 L2',
    moves: 2,
    description: '后左两个棱块'
  },
  {
    id: 'cross_2edge_lf',
    pattern: '2edge_lf',
    solution: 'L2 F2',
    moves: 2,
    description: '左前两个棱块'
  },
  
  // 2个棱块未归位（相对）
  {
    id: 'cross_2edge_fb',
    pattern: '2edge_fb',
    solution: 'F2 B2',
    moves: 2,
    description: '前后两个棱块'
  },
  {
    id: 'cross_2edge_rl',
    pattern: '2edge_rl',
    solution: 'R2 L2',
    moves: 2,
    description: '左右两个棱块'
  },
  
  // 3个棱块未归位
  {
    id: 'cross_3edge_frb',
    pattern: '3edge_frb',
    solution: 'F2 R2 B2',
    moves: 3,
    description: '前右后三个棱块'
  },
  {
    id: 'cross_3edge_rbl',
    pattern: '3edge_rbl',
    solution: 'R2 B2 L2',
    moves: 3,
    description: '右后左三个棱块'
  },
  {
    id: 'cross_3edge_blf',
    pattern: '3edge_blf',
    solution: 'B2 L2 F2',
    moves: 3,
    description: '后左前三个棱块'
  },
  {
    id: 'cross_3edge_lfr',
    pattern: '3edge_lfr',
    solution: 'L2 F2 R2',
    moves: 3,
    description: '左前右三个棱块'
  },
  
  // 4个棱块未归位
  {
    id: 'cross_4edge_all',
    pattern: '4edge_all',
    solution: 'F2 R2 B2 L2',
    moves: 4,
    description: '所有棱块都需要翻转'
  },
  
  // 常见的 Cross 模式
  {
    id: 'cross_line',
    pattern: 'line',
    solution: 'F R\' F\' R',
    moves: 4,
    description: 'Cross 线形'
  },
  {
    id: 'cross_l_shape',
    pattern: 'l_shape',
    solution: 'F R U R\' U\' F\'',
    moves: 6,
    description: 'Cross L形'
  },
  {
    id: 'cross_dot',
    pattern: 'dot',
    solution: 'F R U R\' U\' F\' f R U R\' U\' f\'',
    moves: 12,
    description: 'Cross 点形'
  },
  
  // 更多常见情况...
]

/**
 * 根据模式查找预计算的 Cross 解法
 */
export function findPrecomputedCross(pattern: string): CrossCase | undefined {
  return CROSS_PRECOMPUTED.find(c => c.pattern === pattern)
}

/**
 * 根据状态生成模式字符串
 */
export function generateCrossPattern(state: any): string {
  // 检查底层棱块的状态
  const dFace = state.D
  const centerColor = dFace[1][1]
  
  // 统计未归位的棱块
  const wrongEdges: string[] = []
  
  if (dFace[0][1] !== centerColor) wrongEdges.push('f')
  if (dFace[1][2] !== centerColor) wrongEdges.push('r')
  if (dFace[2][1] !== centerColor) wrongEdges.push('b')
  if (dFace[1][0] !== centerColor) wrongEdges.push('l')
  
  // 如果所有棱块都归位，返回 solved
  if (wrongEdges.length === 0) {
    return 'solved'
  }
  
  // 根据未归位的棱块数量生成模式
  if (wrongEdges.length === 1) {
    return `1edge_${wrongEdges[0]}`
  } else if (wrongEdges.length === 2) {
    // 检查是相邻还是相对
    const edges = wrongEdges.sort().join('')
    if (edges === 'fr' || edges === 'rb' || edges === 'bl' || edges === 'fl') {
      return `2edge_${wrongEdges.join('')}`
    } else {
      return `2edge_${wrongEdges.join('')}`
    }
  } else if (wrongEdges.length === 3) {
    return `3edge_${wrongEdges.join('')}`
  } else {
    return '4edge_all'
  }
}
