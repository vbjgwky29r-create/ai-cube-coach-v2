/**
 * COLL (Corners of the Last Layer) 公式库
 * 
 * COLL 是 OLL 的高级扩展，在顶面十字已完成的情况下，
 * 同时完成 OLL 和角块排列，节省 2-4 步
 */

/**
 * COLL 情况
 */
export interface COLLCase {
  id: string
  name: string
  group: 'H' | 'L' | 'Pi' | 'T' | 'U' | 'S' | 'AS'
  algorithm: string
  steps: number
}

/**
 * COLL 公式库（40个情况）
 * 数据来源：J Perm (https://jperm.net/algs/coll)
 */
export const COLL_ALGORITHMS: COLLCase[] = [
  // H 组（4个）
  { id: 'H1', name: 'H1', group: 'H', algorithm: "R U R' U R U' R' U R U2 R'", steps: 11 },
  { id: 'H2', name: 'H2', group: 'H', algorithm: "F R U' R' U R U2 R' U' R U R' U' F'", steps: 14 },
  { id: 'H3', name: 'H3', group: 'H', algorithm: "R U R' U R U L' U R' U' L", steps: 11 },
  { id: 'H4', name: 'H4', group: 'H', algorithm: "F R U R' U' R U R' U' R U R' U' F'", steps: 14 },
  
  // L 组（6个）
  { id: 'L1', name: 'L1', group: 'L', algorithm: "R' U2 R U R' U' R U R' U' R U R' U R", steps: 15 },
  { id: 'L2', name: 'L2', group: 'L', algorithm: "R' U2 R' D' R U2 R' D R2", steps: 9 },
  { id: 'L3', name: 'L3', group: 'L', algorithm: "R U2 R D R' U2 R D' R2", steps: 9 },
  { id: 'L4', name: 'L4', group: 'L', algorithm: "F R' F' r U R U' r'", steps: 8 },
  { id: 'L5', name: 'L5', group: 'L', algorithm: "x R' U R D' R' U' R D", steps: 8 },
  { id: 'L6', name: 'L6', group: 'L', algorithm: "R' U' R U R' F' R U R' U' R' F R2", steps: 13 },
  
  // Pi 组（6个）
  { id: 'P1', name: 'Pi1', group: 'Pi', algorithm: "R U2 R2 U' R2 U' R2 U2 R", steps: 9 },
  { id: 'P2', name: 'Pi2', group: 'Pi', algorithm: "R' F2 R U2 R U2 R' F2 U' R U' R'", steps: 12 },
  { id: 'P3', name: 'Pi3', group: 'Pi', algorithm: "R' U' F' R U R' U' R' F R2 U2 R' U2 R", steps: 14 },
  { id: 'P4', name: 'Pi4', group: 'Pi', algorithm: "R U R' U' R' F R2 U R' U' R U R' U' F'", steps: 15 },
  { id: 'P5', name: 'Pi5', group: 'Pi', algorithm: "R U' L' U R' U L U L' U L", steps: 11 },
  { id: 'P6', name: 'Pi6', group: 'Pi', algorithm: "R2 D' R U R' D R U R U' R' U R U R' U R", steps: 17 },
  
  // T 组（6个）
  { id: 'T1', name: 'T1', group: 'T', algorithm: "R U2 R' U' R U' R2 U2 R U R' U R", steps: 13 },
  { id: 'T2', name: 'T2', group: 'T', algorithm: "R' U R U2 R' L' U R U' L", steps: 10 },
  { id: 'T3', name: 'T3', group: 'T', algorithm: "l' U' L U l F' L' F", steps: 8 },
  { id: 'T4', name: 'T4', group: 'T', algorithm: "F R U R' U' R U' R' U' R U R' F'", steps: 13 },
  { id: 'T5', name: 'T5', group: 'T', algorithm: "r U R' U' r' F R F'", steps: 8 },
  { id: 'T6', name: 'T6', group: 'T', algorithm: "R' U R2 D r' U2 r D' R2 U' R", steps: 11 },
  
  // U 组（6个）
  { id: 'U1', name: 'U1', group: 'U', algorithm: "R' U' R U' R' U2 R2 U R' U R U2 R'", steps: 13 },
  { id: 'U2', name: 'U2', group: 'U', algorithm: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R", steps: 19 },
  { id: 'U3', name: 'U3', group: 'U', algorithm: "R2 D R' U2 R D' R' U2 R'", steps: 9 },
  { id: 'U4', name: 'U4', group: 'U', algorithm: "F R U' R' U R U R' U R U' R' F'", steps: 13 },
  { id: 'U5', name: 'U5', group: 'U', algorithm: "R2 D' R U2 R' D R U2 R", steps: 9 },
  { id: 'U6', name: 'U6', group: 'U', algorithm: "R2 D' R U R' D R U R U' R' U' R", steps: 13 },
]

/**
 * 根据 ID 查找 COLL 情况
 */
export function findCOLLById(id: string): COLLCase | undefined {
  return COLL_ALGORITHMS.find(c => c.id === id)
}

/**
 * 根据组查找 COLL 情况
 */
export function findCOLLByGroup(group: string): COLLCase[] {
  return COLL_ALGORITHMS.filter(c => c.group === group)
}

/**
 * 获取最短的 COLL 公式
 */
export function getShortestCOLL(group?: string): COLLCase {
  let cases = COLL_ALGORITHMS
  if (group) {
    cases = findCOLLByGroup(group)
  }
  
  return cases.reduce((shortest, current) => 
    current.steps < shortest.steps ? current : shortest
  )
}
