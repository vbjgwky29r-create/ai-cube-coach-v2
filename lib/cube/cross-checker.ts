/**
 * Cross 完成检查器
 * 
 * 检查底层十字是否完成：
 * 1. 底层4个棱块颜色正确
 * 2. 棱块侧面颜色匹配对应的中心块
 */

import type { CubeState, CubeColor } from './cube-state'

/**
 * 检查 Cross 是否完成
 * 
 * Cross 完成的条件：
 * - D 面的 4 个棱块（上下左右）颜色都是 D（黄色）
 * - 这 4 个棱块的侧面颜色要匹配对应面的中心块颜色
 */
export function isCrossComplete(state: CubeState): boolean {
  // 1. 检查 D 面的 4 个棱块位置
  const D = state.D
  
  // D 面的棱块位置：[0][1], [1][0], [1][2], [2][1]
  if (D[0][1] !== 'D' || D[1][0] !== 'D' || D[1][2] !== 'D' || D[2][1] !== 'D') {
    return false
  }
  
  // 2. 检查棱块侧面颜色是否匹配中心块
  // D[0][1] 对应 F 面的 [2][1]，应该是 F（绿色）
  if (state.F[2][1] !== 'F') {
    return false
  }
  
  // D[1][2] 对应 R 面的 [2][1]，应该是 R（红色）
  if (state.R[2][1] !== 'R') {
    return false
  }
  
  // D[2][1] 对应 B 面的 [2][1]，应该是 B（蓝色）
  if (state.B[2][1] !== 'B') {
    return false
  }
  
  // D[1][0] 对应 L 面的 [2][1]，应该是 L（橙色）
  if (state.L[2][1] !== 'L') {
    return false
  }
  
  return true
}

/**
 * 获取 Cross 完成度（0-4）
 */
export function getCrossCompleteness(state: CubeState): number {
  let count = 0
  const D = state.D
  
  // 检查每个棱块
  if (D[0][1] === 'D' && state.F[2][1] === 'F') count++
  if (D[1][2] === 'D' && state.R[2][1] === 'R') count++
  if (D[2][1] === 'D' && state.B[2][1] === 'B') count++
  if (D[1][0] === 'D' && state.L[2][1] === 'L') count++
  
  return count
}

/**
 * 获取 Cross 状态描述
 */
export function getCrossStatus(state: CubeState): string {
  const completeness = getCrossCompleteness(state)
  
  if (completeness === 4) {
    return 'Cross 已完成'
  } else if (completeness === 0) {
    return 'Cross 未开始'
  } else {
    return `Cross 完成 ${completeness}/4`
  }
}
