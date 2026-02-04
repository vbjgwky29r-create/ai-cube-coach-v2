/**
 * 魔方块检测器
 * 
 * 检测 Corner 和 Edge 的位置和方向
 */

import type { CubeState } from './cube-state'

/**
 * Corner 位置定义（8个角块）
 */
export enum CornerLocation {
  UFR = 'UFR', // 上-前-右
  UFL = 'UFL', // 上-前-左
  UBR = 'UBR', // 上-后-右
  UBL = 'UBL', // 上-后-左
  DFR = 'DFR', // 下-前-右
  DFL = 'DFL', // 下-前-左
  DBR = 'DBR', // 下-后-右
  DBL = 'DBL', // 下-后-左
}

/**
 * Edge 位置定义（12个棱块）
 */
export enum EdgeLocation {
  UF = 'UF', // 上-前
  UR = 'UR', // 上-右
  UB = 'UB', // 上-后
  UL = 'UL', // 上-左
  DF = 'DF', // 下-前
  DR = 'DR', // 下-右
  DB = 'DB', // 下-后
  DL = 'DL', // 下-左
  FR = 'FR', // 前-右
  FL = 'FL', // 前-左
  BR = 'BR', // 后-右
  BL = 'BL', // 后-左
}

/**
 * Corner 方向（0, 1, 2 表示旋转 0°, 120°, 240°）
 */
export type CornerOrientationValue = 0 | 1 | 2

/**
 * Edge 方向（0 = 正确, 1 = 翻转）
 */
export type EdgeOrientationValue = 0 | 1

/**
 * Corner 信息
 */
export interface CornerInfo {
  location: CornerLocation
  orientation: CornerOrientationValue
  colors: [string, string, string] // 三个面的颜色
}

/**
 * Edge 信息
 */
export interface EdgeInfo {
  location: EdgeLocation
  orientation: EdgeOrientationValue
  colors: [string, string] // 两个面的颜色
}

/**
 * 魔方块检测器
 */
export class PieceDetector {
  /**
   * 检测指定 Corner 的位置和方向
   */
  findCorner(state: CubeState, targetColors: [string, string, string]): CornerInfo | null {
    // 遍历 8 个 Corner 位置
    const corners = this.getAllCorners(state)
    
    for (const corner of corners) {
      // 检查颜色是否匹配（忽略顺序）
      if (this.colorsMatch(corner.colors, targetColors)) {
        return corner
      }
    }
    
    return null
  }
  
  /**
   * 检测指定 Edge 的位置和方向
   */
  findEdge(state: CubeState, targetColors: [string, string]): EdgeInfo | null {
    // 遍历 12 个 Edge 位置
    const edges = this.getAllEdges(state)
    
    for (const edge of edges) {
      // 检查颜色是否匹配（忽略顺序）
      if (this.colorsMatch(edge.colors, targetColors)) {
        return edge
      }
    }
    
    return null
  }
  
  /**
   * 获取所有 Corner 的信息
   */
  private getAllCorners(state: CubeState): CornerInfo[] {
    return [
      this.getCorner(state, CornerLocation.UFR),
      this.getCorner(state, CornerLocation.UFL),
      this.getCorner(state, CornerLocation.UBR),
      this.getCorner(state, CornerLocation.UBL),
      this.getCorner(state, CornerLocation.DFR),
      this.getCorner(state, CornerLocation.DFL),
      this.getCorner(state, CornerLocation.DBR),
      this.getCorner(state, CornerLocation.DBL),
    ]
  }
  
  /**
   * 获取所有 Edge 的信息
   */
  private getAllEdges(state: CubeState): EdgeInfo[] {
    return [
      this.getEdge(state, EdgeLocation.UF),
      this.getEdge(state, EdgeLocation.UR),
      this.getEdge(state, EdgeLocation.UB),
      this.getEdge(state, EdgeLocation.UL),
      this.getEdge(state, EdgeLocation.DF),
      this.getEdge(state, EdgeLocation.DR),
      this.getEdge(state, EdgeLocation.DB),
      this.getEdge(state, EdgeLocation.DL),
      this.getEdge(state, EdgeLocation.FR),
      this.getEdge(state, EdgeLocation.FL),
      this.getEdge(state, EdgeLocation.BR),
      this.getEdge(state, EdgeLocation.BL),
    ]
  }
  
  /**
   * 获取指定位置的 Corner 信息
   */
  private getCorner(state: CubeState, location: CornerLocation): CornerInfo {
    const colors = this.getCornerColors(state, location)
    const orientation = this.getCornerOrientation(state, location)
    
    return {
      location,
      orientation,
      colors,
    }
  }
  
  /**
   * 获取指定位置的 Edge 信息
   */
  private getEdge(state: CubeState, location: EdgeLocation): EdgeInfo {
    const colors = this.getEdgeColors(state, location)
    const orientation = this.getEdgeOrientation(state, location)
    
    return {
      location,
      orientation,
      colors,
    }
  }
  
  /**
   * 获取 Corner 的颜色
   */
  private getCornerColors(state: CubeState, location: CornerLocation): [string, string, string] {
    // 根据位置获取三个面的颜色
    switch (location) {
      case CornerLocation.UFR:
        return [state.U[2][2], state.F[0][2], state.R[0][0]]
      case CornerLocation.UFL:
        return [state.U[2][0], state.F[0][0], state.L[0][2]]
      case CornerLocation.UBR:
        return [state.U[0][2], state.B[0][0], state.R[0][2]]
      case CornerLocation.UBL:
        return [state.U[0][0], state.B[0][2], state.L[0][0]]
      case CornerLocation.DFR:
        return [state.D[0][2], state.F[2][2], state.R[2][0]]
      case CornerLocation.DFL:
        return [state.D[0][0], state.F[2][0], state.L[2][2]]
      case CornerLocation.DBR:
        return [state.D[2][2], state.B[2][0], state.R[2][2]]
      case CornerLocation.DBL:
        return [state.D[2][0], state.B[2][2], state.L[2][0]]
    }
  }
  
  /**
   * 获取 Edge 的颜色
   */
  private getEdgeColors(state: CubeState, location: EdgeLocation): [string, string] {
    // 根据位置获取两个面的颜色
    switch (location) {
      case EdgeLocation.UF:
        return [state.U[2][1], state.F[0][1]]
      case EdgeLocation.UR:
        return [state.U[1][2], state.R[0][1]]
      case EdgeLocation.UB:
        return [state.U[0][1], state.B[0][1]]
      case EdgeLocation.UL:
        return [state.U[1][0], state.L[0][1]]
      case EdgeLocation.DF:
        return [state.D[0][1], state.F[2][1]]
      case EdgeLocation.DR:
        return [state.D[1][2], state.R[2][1]]
      case EdgeLocation.DB:
        return [state.D[2][1], state.B[2][1]]
      case EdgeLocation.DL:
        return [state.D[1][0], state.L[2][1]]
      case EdgeLocation.FR:
        return [state.F[1][2], state.R[1][0]]
      case EdgeLocation.FL:
        return [state.F[1][0], state.L[1][2]]
      case EdgeLocation.BR:
        return [state.B[1][0], state.R[1][2]]
      case EdgeLocation.BL:
        return [state.B[1][2], state.L[1][0]]
    }
  }
  
  /**
   * 获取 Corner 的方向
   */
  private getCornerOrientation(state: CubeState, location: CornerLocation): CornerOrientationValue {
    // 简化版：返回 0（正确方向）
    // 实际实现需要根据颜色判断旋转角度
    return 0
  }
  
  /**
   * 获取 Edge 的方向
   */
  private getEdgeOrientation(state: CubeState, location: EdgeLocation): EdgeOrientationValue {
    // 简化版：返回 0（正确方向）
    // 实际实现需要根据颜色判断是否翻转
    return 0
  }
  
  /**
   * 检查颜色是否匹配（忽略顺序）
   */
  private colorsMatch(colors1: string[], colors2: string[]): boolean {
    if (colors1.length !== colors2.length) {
      return false
    }
    
    const sorted1 = [...colors1].sort()
    const sorted2 = [...colors2].sort()
    
    return sorted1.every((color, index) => color === sorted2[index])
  }
}

/**
 * 便捷函数：查找 Corner
 */
export function findCorner(state: CubeState, colors: [string, string, string]): CornerInfo | null {
  const detector = new PieceDetector()
  return detector.findCorner(state, colors)
}

/**
 * 便捷函数：查找 Edge
 */
export function findEdge(state: CubeState, colors: [string, string]): EdgeInfo | null {
  const detector = new PieceDetector()
  return detector.findEdge(state, colors)
}
