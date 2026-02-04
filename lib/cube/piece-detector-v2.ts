/**
 * 魔方块检测器 v2 - 完善版
 * 
 * 实现真正的 Corner 和 Edge 方向检测
 */

import type { CubeState } from './cube-state'

/**
 * Corner 位置定义
 */
export enum CornerLocation {
  UFR = 'UFR',
  UFL = 'UFL',
  UBR = 'UBR',
  UBL = 'UBL',
  DFR = 'DFR',
  DFL = 'DFL',
  DBR = 'DBR',
  DBL = 'DBL',
}

/**
 * Edge 位置定义
 */
export enum EdgeLocation {
  UF = 'UF',
  UR = 'UR',
  UB = 'UB',
  UL = 'UL',
  DF = 'DF',
  DR = 'DR',
  DB = 'DB',
  DL = 'DL',
  FR = 'FR',
  FL = 'FL',
  BR = 'BR',
  BL = 'BL',
}

/**
 * Corner 信息
 */
export interface CornerInfo {
  location: CornerLocation
  orientation: 0 | 1 | 2 // 0=正确, 1=顺时针120°, 2=逆时针120°
  colors: [string, string, string]
}

/**
 * Edge 信息
 */
export interface EdgeInfo {
  location: EdgeLocation
  orientation: 0 | 1 // 0=正确, 1=翻转
  colors: [string, string]
}

/**
 * 魔方块检测器
 */
export class PieceDetectorV2 {
  /**
   * 获取指定位置的 Corner
   */
  getCornerAt(state: CubeState, location: CornerLocation): CornerInfo {
    const colors = this.getCornerColors(state, location)
    const orientation = this.getCornerOrientation(state, location, colors)
    
    return {
      location,
      orientation,
      colors
    }
  }
  
  /**
   * 获取指定位置的 Edge
   */
  getEdgeAt(state: CubeState, location: EdgeLocation): EdgeInfo {
    const colors = this.getEdgeColors(state, location)
    const orientation = this.getEdgeOrientation(state, location, colors)
    
    return {
      location,
      orientation,
      colors
    }
  }
  
  /**
   * 获取 Corner 的颜色
   */
  private getCornerColors(state: CubeState, location: CornerLocation): [string, string, string] {
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
   * 
   * 方向定义：
   * - 0: 白/黄色朝上/下（正确方向）
   * - 1: 白/黄色朝前/后/左/右（顺时针旋转120°）
   * - 2: 白/黄色朝前/后/左/右（逆时针旋转120°）
   */
  private getCornerOrientation(
    state: CubeState,
    location: CornerLocation,
    colors: [string, string, string]
  ): 0 | 1 | 2 {
    // 白色和黄色是 U/D 面的颜色
    const whiteYellowColors = [state.U[1][1], state.D[1][1]]
    
    // 找到白/黄色在哪个位置
    const whiteYellowIndex = colors.findIndex(c => (whiteYellowColors as string[]).includes(c))
    
    if (whiteYellowIndex === -1) {
      // 没有白/黄色，不应该发生
      return 0
    }
    
    // 根据位置判断方向
    if (location.startsWith('U') || location.startsWith('D')) {
      // 顶层或底层的 Corner
      if (whiteYellowIndex === 0) {
        return 0 // 白/黄色在 U/D 面，正确
      } else if (whiteYellowIndex === 1) {
        return 1 // 白/黄色在第二个面，顺时针120°
      } else {
        return 2 // 白/黄色在第三个面，逆时针120°
      }
    }
    
    return 0
  }
  
  /**
   * 获取 Edge 的方向
   * 
   * 方向定义：
   * - 0: 正确方向
   * - 1: 翻转
   */
  private getEdgeOrientation(
    state: CubeState,
    location: EdgeLocation,
    colors: [string, string]
  ): 0 | 1 {
    // 对于 U/D 层的 Edge，检查白/黄色是否在 U/D 面
    if (location.startsWith('U') || location.startsWith('D')) {
      const whiteYellowColors = [state.U[1][1], state.D[1][1]]
      
      if ((whiteYellowColors as string[]).includes(colors[0])) {
        return 0 // 白/黄色在 U/D 面，正确
      } else {
        return 1 // 白/黄色在侧面，翻转
      }
    }
    
    // 对于中层的 Edge，检查 F/B 颜色是否在 F/B 面
    const frontBackColors = [state.F[1][1], state.B[1][1]]
    
    if (location === EdgeLocation.FR || location === EdgeLocation.FL) {
      if ((frontBackColors as string[]).includes(colors[0])) {
        return 0 // F/B 颜色在 F 面，正确
      } else {
        return 1 // F/B 颜色在 R/L 面，翻转
      }
    }
    
    if (location === EdgeLocation.BR || location === EdgeLocation.BL) {
      if ((frontBackColors as string[]).includes(colors[0])) {
        return 0 // F/B 颜色在 B 面，正确
      } else {
        return 1 // F/B 颜色在 R/L 面，翻转
      }
    }
    
    return 0
  }
  
  /**
   * 检查 Cross 是否完成
   */
  isCrossComplete(state: CubeState): boolean {
    // 检查底层4个棱块
    const bottomEdges = [
      EdgeLocation.DF,
      EdgeLocation.DR,
      EdgeLocation.DB,
      EdgeLocation.DL
    ]
    
    const bottomColor = state.D[1][1]
    const frontColor = state.F[1][1]
    const rightColor = state.R[1][1]
    const backColor = state.B[1][1]
    const leftColor = state.L[1][1]
    
    // 检查 DF
    if (state.D[0][1] !== bottomColor || state.F[2][1] !== frontColor) {
      return false
    }
    
    // 检查 DR
    if (state.D[1][2] !== bottomColor || state.R[2][1] !== rightColor) {
      return false
    }
    
    // 检查 DB
    if (state.D[2][1] !== bottomColor || state.B[2][1] !== backColor) {
      return false
    }
    
    // 检查 DL
    if (state.D[1][0] !== bottomColor || state.L[2][1] !== leftColor) {
      return false
    }
    
    return true
  }
}
