/**
 * ZBLL (Zborowski-Bruchem Last Layer) 公式库
 * 
 * ZBLL 是一步完成顶层的高级技巧，共有 493 个公式
 * 分为 7 组：T、U、L、Pi、H、S、AS
 * 
 * 本文件先实现最常用的部分公式，其他公式可后续扩展
 */

/**
 * ZBLL 情况
 */
export interface ZBLLCase {
  id: string
  name: string
  group: 'T' | 'U' | 'L' | 'Pi' | 'H' | 'S' | 'AS'
  subgroup: string
  algorithm: string
  steps: number
}

/**
 * ZBLL T 组公式（部分常用情况）
 * 数据来源：SpeedCubeDB (https://speedcubedb.com/a/3x3/ZBLLT)
 */
export const ZBLL_T_ALGORITHMS: ZBLLCase[] = [
  // T1 子组（12个）
  { id: 'T1-1', name: 'ZBLL T1-1', group: 'T', subgroup: 'T1', algorithm: "R' U' R U' R' U' R U2 L' R' U R U' L", steps: 14 },
  { id: 'T1-2', name: 'ZBLL T1-2', group: 'T', subgroup: 'T1', algorithm: "R' U2 R2 U R' U' R' U2 F' R U2 R U2 R' F", steps: 15 },
  { id: 'T1-3', name: 'ZBLL T1-3', group: 'T', subgroup: 'T1', algorithm: "R2 F2 R U2 R U2 R' F2 R U' R' U R", steps: 13 },
  { id: 'T1-4', name: 'ZBLL T1-4', group: 'T', subgroup: 'T1', algorithm: "F R2 D R' U' R D' R2 U' R U2 R' U' F'", steps: 14 },
  { id: 'T1-5', name: 'ZBLL T1-5', group: 'T', subgroup: 'T1', algorithm: "F R U R' U' R U R' U' F' R U R' U' R' F R F'", steps: 18 },
  { id: 'T1-6', name: 'ZBLL T1-6', group: 'T', subgroup: 'T1', algorithm: "R' U' R' D' R U R' D R2", steps: 9 },
  { id: 'T1-7', name: 'ZBLL T1-7', group: 'T', subgroup: 'T1', algorithm: "R' U2 R F U' R' U R U F' R' U R", steps: 13 },
  { id: 'T1-8', name: 'ZBLL T1-8', group: 'T', subgroup: 'T1', algorithm: "R' U' R U R' U R L' U R' U' R L", steps: 12 },
  { id: 'T1-9', name: 'ZBLL T1-9', group: 'T', subgroup: 'T1', algorithm: "F U R U2 R' U R U R' F'", steps: 10 },
  { id: 'T1-10', name: 'ZBLL T1-10', group: 'T', subgroup: 'T1', algorithm: "R U R' U' R' F' R U2 R U2 R' F", steps: 12 },
  { id: 'T1-11', name: 'ZBLL T1-11', group: 'T', subgroup: 'T1', algorithm: "F U R' U' R F' R' U' R U R' U R", steps: 13 },
  { id: 'T1-12', name: 'ZBLL T1-12', group: 'T', subgroup: 'T1', algorithm: "R' U R U R' U' R' D' R U2 R' D R U R", steps: 15 },
  
  // T2 子组（12个，部分）
  { id: 'T2-1', name: 'ZBLL T2-1', group: 'T', subgroup: 'T2', algorithm: "R' U' R U D' R U' R U R U' R2 D", steps: 13 },
  { id: 'T2-2', name: 'ZBLL T2-2', group: 'T', subgroup: 'T2', algorithm: "R U R D R' U R r' U2 r D' R2", steps: 12 },
  { id: 'T2-3', name: 'ZBLL T2-3', group: 'T', subgroup: 'T2', algorithm: "F R2 D R' U R D' R2 U' R' U2 R U F'", steps: 14 },
  { id: 'T2-4', name: 'ZBLL T2-4', group: 'T', subgroup: 'T2', algorithm: "R U R' U R U2 R' U R U' R' U' R' F R F'", steps: 16 },
  { id: 'T2-5', name: 'ZBLL T2-5', group: 'T', subgroup: 'T2', algorithm: "R' U' R U' R' U2 R U' R' U R U R B' R' B", steps: 16 },
  { id: 'T2-6', name: 'ZBLL T2-6', group: 'T', subgroup: 'T2', algorithm: "R U R D R' U' R r U2 r' D' R2", steps: 12 },
  
  // T3-T6 子组（占位符，后续可扩展）
]

/**
 * 其他组的占位符（后续可扩展）
 */
export const ZBLL_U_ALGORITHMS: ZBLLCase[] = []
export const ZBLL_L_ALGORITHMS: ZBLLCase[] = []
export const ZBLL_PI_ALGORITHMS: ZBLLCase[] = []
export const ZBLL_H_ALGORITHMS: ZBLLCase[] = []
export const ZBLL_S_ALGORITHMS: ZBLLCase[] = []
export const ZBLL_AS_ALGORITHMS: ZBLLCase[] = []

/**
 * 完整的 ZBLL 公式库
 */
export const ZBLL_ALGORITHMS: ZBLLCase[] = [
  ...ZBLL_T_ALGORITHMS,
  ...ZBLL_U_ALGORITHMS,
  ...ZBLL_L_ALGORITHMS,
  ...ZBLL_PI_ALGORITHMS,
  ...ZBLL_H_ALGORITHMS,
  ...ZBLL_S_ALGORITHMS,
  ...ZBLL_AS_ALGORITHMS,
]

/**
 * 根据 ID 查找 ZBLL 情况
 */
export function findZBLLById(id: string): ZBLLCase | undefined {
  return ZBLL_ALGORITHMS.find(c => c.id === id)
}

/**
 * 根据组查找 ZBLL 情况
 */
export function findZBLLByGroup(group: string): ZBLLCase[] {
  return ZBLL_ALGORITHMS.filter(c => c.group === group)
}

/**
 * 根据子组查找 ZBLL 情况
 */
export function findZBLLBySubgroup(subgroup: string): ZBLLCase[] {
  return ZBLL_ALGORITHMS.filter(c => c.subgroup === subgroup)
}

/**
 * 获取最短的 ZBLL 公式
 */
export function getShortestZBLL(group?: string, subgroup?: string): ZBLLCase | null {
  let cases = ZBLL_ALGORITHMS
  
  if (group) {
    cases = findZBLLByGroup(group)
  }
  
  if (subgroup) {
    cases = findZBLLBySubgroup(subgroup)
  }
  
  if (cases.length === 0) {
    return null
  }
  
  return cases.reduce((shortest, current) => 
    current.steps < shortest.steps ? current : shortest
  )
}

/**
 * 统计信息
 */
export const ZBLL_STATS = {
  total: ZBLL_ALGORITHMS.length,
  implemented: ZBLL_T_ALGORITHMS.length,
  pending: 493 - ZBLL_T_ALGORITHMS.length,
  groups: {
    T: ZBLL_T_ALGORITHMS.length,
    U: ZBLL_U_ALGORITHMS.length,
    L: ZBLL_L_ALGORITHMS.length,
    Pi: ZBLL_PI_ALGORITHMS.length,
    H: ZBLL_H_ALGORITHMS.length,
    S: ZBLL_S_ALGORITHMS.length,
    AS: ZBLL_AS_ALGORITHMS.length,
  }
}
