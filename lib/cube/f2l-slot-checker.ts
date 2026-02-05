/**
 * F2L 槽位状态检查器
 * 
 * 检查每个 F2L 槽位是否完成
 */

import type { CubeState, CubeColor } from './cube-state'

/**
 * F2L 槽位定义
 * 0: FR (前右)
 * 1: FL (前左)
 * 2: BR (后右)
 * 3: BL (后左)
 */

/**
 * 检查 FR 槽位是否完成
 */
function isFRSlotComplete(state: CubeState): boolean {
  // Corner: R面右下角 + F面右下角 + D面前右角
  // Edge: R面下中 + D面右中
  
  // 检查 Corner
  const cornerR = state.R[2][2] === 'R'  // R面右下角
  const cornerF = state.F[2][2] === 'F'  // F面右下角
  const cornerD = state.D[0][2] === 'D'  // D面前右角
  
  // 检查 Edge
  const edgeR = state.R[2][1] === 'R'    // R面下中
  const edgeD = state.D[0][1] === 'D'    // D面右边中
  
  return cornerR && cornerF && cornerD && edgeR && edgeD
}

/**
 * 检查 FL 槽位是否完成
 */
function isFLSlotComplete(state: CubeState): boolean {
  // Corner: L面左下角 + F面左下角 + D面前左角
  // Edge: L面下中 + D面左中
  
  const cornerL = state.L[2][0] === 'L'
  const cornerF = state.F[2][0] === 'F'
  const cornerD = state.D[0][0] === 'D'
  
  const edgeL = state.L[2][1] === 'L'
  const edgeD = state.D[1][0] === 'D'
  
  return cornerL && cornerF && cornerD && edgeL && edgeD
}

/**
 * 检查 BR 槽位是否完成
 */
function isBRSlotComplete(state: CubeState): boolean {
  // Corner: R面左下角 + B面左下角 + D面后右角
  // Edge: R面下中 + D面右中（已在 FR 中）
  
  const cornerR = state.R[2][0] === 'R'
  const cornerB = state.B[2][2] === 'B'
  const cornerD = state.D[2][2] === 'D'
  
  const edgeR = state.R[2][1] === 'R'
  const edgeD = state.D[2][1] === 'D'
  
  return cornerR && cornerB && cornerD && edgeR && edgeD
}

/**
 * 检查 BL 槽位是否完成
 */
function isBLSlotComplete(state: CubeState): boolean {
  // Corner: L面右下角 + B面右下角 + D面后左角
  // Edge: L面下中 + D面左中（已在 FL 中）
  
  const cornerL = state.L[2][2] === 'L'
  const cornerB = state.B[2][0] === 'B'
  const cornerD = state.D[2][0] === 'D'
  
  const edgeL = state.L[2][1] === 'L'
  const edgeD = state.D[1][2] === 'D'
  
  return cornerL && cornerB && cornerD && edgeL && edgeD
}

/**
 * 检查指定槽位是否完成
 */
export function isF2LSlotComplete(state: CubeState, slotIndex: number): boolean {
  switch (slotIndex) {
    case 0: return isFRSlotComplete(state)
    case 1: return isFLSlotComplete(state)
    case 2: return isBRSlotComplete(state)
    case 3: return isBLSlotComplete(state)
    default: return false
  }
}

/**
 * 获取 F2L 完成度（0-4）
 */
export function getF2LCompleteness(state: CubeState): number {
  let count = 0
  for (let i = 0; i < 4; i++) {
    if (isF2LSlotComplete(state, i)) {
      count++
    }
  }
  return count
}

/**
 * 检查所有 F2L 是否完成
 */
export function isF2LComplete(state: CubeState): boolean {
  return getF2LCompleteness(state) === 4
}
