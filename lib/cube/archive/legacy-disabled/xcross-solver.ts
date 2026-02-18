/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * XCross 求解器
 * 
 * XCross = Cross + 第一组 F2L
 * 在做十字的同时完成第一组 F2L，节省 3-5 步
 */

import type { CubeState } from './cube-state'
import { applyMove } from './cube-state'
import { parseFormula } from './parser'

/**
 * XCross 解法
 */
export interface XCrossSolution {
  moves: string
  steps: number
  slotSolved: number // 完成的槽位索引（0-3）
}

/**
 * XCross 求解器
 */
export class XCrossSolver {
  /**
   * 尝试找到 XCross 解法
   */
  solve(cubeState: CubeState): XCrossSolution | null {
    // XCross 是一个高级技巧，需要大量的预计算或搜索
    // 这里提供一个简化版：尝试几个常见的 XCross 模式
    
    const commonXCrosses = this.getCommonXCrosses()
    
    for (const xcross of commonXCrosses) {
      // 测试这个 XCross 是否适用
      if (this.testXCross(cubeState, xcross)) {
        return xcross
      }
    }
    
    // 如果没有找到合适的 XCross，返回 null
    return null
  }
  
  /**
   * 获取常见的 XCross 解法
   */
  private getCommonXCrosses(): XCrossSolution[] {
    return [
      {
        moves: 'F2 D R2 U R U\' R\'',
        steps: 7,
        slotSolved: 0, // FR 槽位
      },
      {
        moves: 'F2 D\' L2 U\' L\' U L',
        steps: 7,
        slotSolved: 1, // FL 槽位
      },
      {
        moves: 'B2 D R2 U R U\' R\'',
        steps: 7,
        slotSolved: 2, // BR 槽位
      },
      {
        moves: 'B2 D\' L2 U\' L\' U L',
        steps: 7,
        slotSolved: 3, // BL 槽位
      },
      // 更多 XCross 模式...
    ]
  }
  
  /**
   * 测试 XCross 是否适用
   */
  private testXCross(state: CubeState, xcross: XCrossSolution): boolean {
    // 简化版：应用 XCross 公式，检查是否完成 Cross 和一组 F2L
    let testState = state
    
    const parsed = parseFormula(xcross.moves)
    for (const move of parsed.moves) {
      const moveStr = move.face + move.modifier
      testState = applyMove(testState, moveStr)
    }
    
    // 检查 Cross 是否完成
    const crossComplete = this.isCrossComplete(testState)
    if (!crossComplete) {
      return false
    }
    
    // 检查指定槽位是否完成
    const slotComplete = this.isSlotComplete(testState, xcross.slotSolved)
    return slotComplete
  }
  
  /**
   * 检查 Cross 是否完成
   */
  private isCrossComplete(state: CubeState): boolean {
    const dFace = state.D
    const centerColor = dFace[1][1]
    
    // 检查4个棱块颜色是否与中心相同
    if (dFace[0][1] !== centerColor || dFace[1][0] !== centerColor || 
        dFace[1][2] !== centerColor || dFace[2][1] !== centerColor) {
      return false
    }
    
    // 检查侧面的棱块是否与对应面的中心颜色匹配
    if (state.F[2][1] !== state.F[1][1]) return false
    if (state.R[2][1] !== state.R[1][1]) return false
    if (state.B[2][1] !== state.B[1][1]) return false
    if (state.L[2][1] !== state.L[1][1]) return false
    
    return true
  }
  
  /**
   * 检查槽位是否完成
   */
  private isSlotComplete(state: CubeState, slotIndex: number): boolean {
    // 简化版：检查对应位置的 corner 和 edge 是否归位
    // 实际实现需要检查具体的颜色和位置
    
    // 槽位定义：0=FR, 1=FL, 2=BR, 3=BL
    const bottomColor = state.D[1][1]
    
    switch (slotIndex) {
      case 0: // FR
        return (
          state.D[0][2] === bottomColor &&
          state.F[2][2] === state.F[1][1] &&
          state.R[2][0] === state.R[1][1] &&
          state.F[1][2] === state.F[1][1] &&
          state.R[1][0] === state.R[1][1]
        )
      case 1: // FL
        return (
          state.D[0][0] === bottomColor &&
          state.F[2][0] === state.F[1][1] &&
          state.L[2][2] === state.L[1][1] &&
          state.F[1][0] === state.F[1][1] &&
          state.L[1][2] === state.L[1][1]
        )
      case 2: // BR
        return (
          state.D[2][2] === bottomColor &&
          state.B[2][0] === state.B[1][1] &&
          state.R[2][2] === state.R[1][1] &&
          state.B[1][0] === state.B[1][1] &&
          state.R[1][2] === state.R[1][1]
        )
      case 3: // BL
        return (
          state.D[2][0] === bottomColor &&
          state.B[2][2] === state.B[1][1] &&
          state.L[2][0] === state.L[1][1] &&
          state.B[1][2] === state.B[1][1] &&
          state.L[1][0] === state.L[1][1]
        )
      default:
        return false
    }
  }
}

/**
 * 便捷函数：尝试找到 XCross 解法
 */
export function solveXCross(state: CubeState): XCrossSolution | null {
  const solver = new XCrossSolver()
  return solver.solve(state)
}

