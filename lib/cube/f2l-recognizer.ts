/**
 * F2L 状态识别器
 * 
 * 识别 Corner 和 Edge 的位置和方向，选择最优的 F2L 公式
 */

import type { CubeState } from './cube-state'
import { F2L_ALGORITHMS, type F2LCase } from './f2l-cases'
import { PieceDetectorV2, CornerLocation, EdgeLocation } from './piece-detector-v2'
import { isF2LSlotComplete } from './f2l-slot-checker'

/**
 * Corner 位置
 */
export enum CornerPosition {
  TOP_LAYER = 'top_layer',      // 在顶层
  IN_SLOT = 'in_slot',           // 在槽位中
  SOLVED = 'solved',             // 已归位
}

/**
 * Edge 位置
 */
export enum EdgePosition {
  TOP_LAYER = 'top_layer',       // 在顶层
  IN_SLOT = 'in_slot',           // 在槽位中
  SOLVED = 'solved',             // 已归位
}

/**
 * Corner 方向
 */
export enum CornerOrientation {
  UP = 'up',                     // 朝上
  FRONT = 'front',               // 朝前
  RIGHT = 'right',               // 朝右
}

/**
 * Edge 方向
 */
export enum EdgeOrientation {
  UP = 'up',                     // 朝上
  SIDE = 'side',                 // 朝侧面
}

/**
 * F2L 槽位状态
 */
export interface F2LSlotState {
  slotIndex: number
  cornerPosition: CornerPosition
  edgePosition: EdgePosition
  cornerOrientation?: CornerOrientation
  edgeOrientation?: EdgeOrientation
  isSolved: boolean
}

/**
 * F2L 状态识别器
 */
export class F2LRecognizer {
  /**
   * 识别槽位状态
   */
  recognizeSlot(state: CubeState, slotIndex: number): F2LSlotState {
    // 简化版：检查槽位是否已完成
    const isSolved = this.isSlotSolved(state, slotIndex)
    
    if (isSolved) {
      return {
        slotIndex,
        cornerPosition: CornerPosition.SOLVED,
        edgePosition: EdgePosition.SOLVED,
        isSolved: true,
      }
    }
    
    // 检查 Corner 和 Edge 的位置
    const cornerPosition = this.findCornerPosition(state, slotIndex)
    const edgePosition = this.findEdgePosition(state, slotIndex)
    
    // 检查方向
    const cornerOrientation = this.getCornerOrientation(state, slotIndex, cornerPosition)
    const edgeOrientation = this.getEdgeOrientation(state, slotIndex, edgePosition)
    
    return {
      slotIndex,
      cornerPosition,
      edgePosition,
      cornerOrientation,
      edgeOrientation,
      isSolved: false,
    }
  }
  
  /**
   * 根据槽位状态选择最优公式
   */
  selectBestAlgorithm(slotState: F2LSlotState): F2LCase {
    // 如果已完成，返回空公式
    if (slotState.isSolved) {
      return {
        id: 'f2l_solved',
        name: 'Solved',
        algorithm: '',
        moves: 0,
        description: '槽位已完成'
      }
    }
    
    // 根据状态选择公式
    const candidates = this.filterCandidates(slotState)
    
    // 选择步数最少的公式
    candidates.sort((a, b) => a.moves - b.moves)
    
    return candidates[0] || F2L_ALGORITHMS[0]
  }
  
  /**
   * 筛选候选公式
   */
  private filterCandidates(slotState: F2LSlotState): F2LCase[] {
    const { cornerPosition, edgePosition, cornerOrientation, edgeOrientation } = slotState
    
    // 简化版：根据位置筛选
    if (cornerPosition === CornerPosition.TOP_LAYER && edgePosition === EdgePosition.TOP_LAYER) {
      // Corner 和 Edge 都在顶层：使用 Case 1-16
      return F2L_ALGORITHMS.slice(0, 16)
    } else if (cornerPosition === CornerPosition.IN_SLOT) {
      // Corner 在槽位中：使用 Case 17-20
      return F2L_ALGORITHMS.slice(16, 20)
    } else if (edgePosition === EdgePosition.IN_SLOT) {
      // Edge 在槽位中：使用 Case 21-24
      return F2L_ALGORITHMS.slice(20, 24)
    } else {
      // 其他情况：使用 Case 25-41
      return F2L_ALGORITHMS.slice(24)
    }
  }
  
  /**
   * 检查槽位是否已完成
   */
  private isSlotSolved(state: CubeState, slotIndex: number): boolean {
    return isF2LSlotComplete(state, slotIndex)
  }
  
  /**
   * 查找 Corner 位置
   */
  private findCornerPosition(state: CubeState, slotIndex: number): CornerPosition {
    const detector = new PieceDetectorV2()
    const targetColors = this.getSlotCornerColors(state, slotIndex)
    // 简化版：直接返回顶层
    // TODO: 实现真正的 Corner 查找
    return CornerPosition.TOP_LAYER
  }
  
  /**
   * 查找 Edge 位置
   */
  private findEdgePosition(state: CubeState, slotIndex: number): EdgePosition {
    const detector = new PieceDetectorV2()
    const targetColors = this.getSlotEdgeColors(state, slotIndex)
    // 简化版：直接返回顶层
    // TODO: 实现真正的 Edge 查找
    return EdgePosition.TOP_LAYER
  }
  
  /**
   * 获取 Corner 方向
   */
  private getCornerOrientation(
    state: CubeState,
    slotIndex: number,
    position: CornerPosition
  ): CornerOrientation | undefined {
    if (position !== CornerPosition.TOP_LAYER) {
      return undefined
    }
    
    // 简化版：假设朝上
    // 实际实现需要检查 corner 的颜色方向
    return CornerOrientation.UP
  }
  
  /**
   * 获取 Edge 方向
   */
  private getEdgeOrientation(
    state: CubeState,
    slotIndex: number,
    position: EdgePosition
  ): EdgeOrientation | undefined {
    if (position !== EdgePosition.TOP_LAYER) {
      return undefined
    }
    
    // 简化版：假设朝上
    // 实际实现需要检查 edge 的颜色方向
    return EdgeOrientation.UP
  }
  
  /**
   * 获取槽位对应的 Corner 颜色
   */
  private getSlotCornerColors(state: CubeState, slotIndex: number): [string, string, string] {
    // 槽位定义：0=FR, 1=FL, 2=BR, 3=BL
    // 获取底层中心和对应侧面中心的颜色
    const bottomColor = state.D[1][1]
    
    switch (slotIndex) {
      case 0: // FR
        return [bottomColor, state.F[1][1], state.R[1][1]]
      case 1: // FL
        return [bottomColor, state.F[1][1], state.L[1][1]]
      case 2: // BR
        return [bottomColor, state.B[1][1], state.R[1][1]]
      case 3: // BL
        return [bottomColor, state.B[1][1], state.L[1][1]]
      default:
        return [bottomColor, state.F[1][1], state.R[1][1]]
    }
  }
  
  /**
   * 获取槽位对应的 Edge 颜色
   */
  private getSlotEdgeColors(state: CubeState, slotIndex: number): [string, string] {
    // 槽位定义：0=FR, 1=FL, 2=BR, 3=BL
    switch (slotIndex) {
      case 0: // FR
        return [state.F[1][1], state.R[1][1]]
      case 1: // FL
        return [state.F[1][1], state.L[1][1]]
      case 2: // BR
        return [state.B[1][1], state.R[1][1]]
      case 3: // BL
        return [state.B[1][1], state.L[1][1]]
      default:
        return [state.F[1][1], state.R[1][1]]
    }
  }
  
  /**
   * 检查 Corner 是否在指定槽位
   */
  private isCornerInSlot(location: CornerLocation, slotIndex: number): boolean {
    const slotCorners = [
      CornerLocation.DFR, // 槽位 0 (FR)
      CornerLocation.DFL, // 槽位 1 (FL)
      CornerLocation.DBR, // 槽位 2 (BR)
      CornerLocation.DBL, // 槽位 3 (BL)
    ]
    
    return location === slotCorners[slotIndex]
  }
  
  /**
   * 检查 Edge 是否在指定槽位
   */
  private isEdgeInSlot(location: EdgeLocation, slotIndex: number): boolean {
    const slotEdges = [
      EdgeLocation.FR, // 槽位 0 (FR)
      EdgeLocation.FL, // 槽位 1 (FL)
      EdgeLocation.BR, // 槽位 2 (BR)
      EdgeLocation.BL, // 槽位 3 (BL)
    ]
    
    return location === slotEdges[slotIndex]
  }
}

/**
 * 便捷函数：识别槽位并选择最优公式
 */
export function recognizeAndSelectF2L(state: CubeState, slotIndex: number): F2LCase {
  const recognizer = new F2LRecognizer()
  const slotState = recognizer.recognizeSlot(state, slotIndex)
  return recognizer.selectBestAlgorithm(slotState)
}
