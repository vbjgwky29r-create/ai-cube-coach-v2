/**
 * 魔方状态管理 (兼容层)
 *
 * 基于cubejs的兼容导出，为现有代码提供统一的接口
 */

import Cube from 'cubejs'

// ============================================================
// 类型定义
// ============================================================

// 扁平状态 (54字符字符串)
export type FlatCubeState = string

// 颜色类型 (面的颜色标识)
export type CubeColor = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

// 对象状态 (3x3数组格式)
export type CubeState = {
  U: CubeColor[][]
  R: CubeColor[][]
  F: CubeColor[][]
  D: CubeColor[][]
  L: CubeColor[][]
  B: CubeColor[][]
}

// ============================================================
// 基础操作
// ============================================================

/**
 * 创建已还原的魔方状态
 */
export function createSolvedCube(): FlatCubeState {
  return 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
}

/**
 * 应用打乱公式到状态
 */
export function applyScramble(state: FlatCubeState, scramble: string): FlatCubeState {
  // 创建新Cube并应用移动
  const cube = new Cube()
  cube.move(scramble)
  return cube.asString()
}

/**
 * 应用移动序列
 */
export function applyMoves(state: FlatCubeState, moves: string): FlatCubeState {
  return applyScramble(state, moves)
}

/**
 * 将扁平状态转换为对象格式（兼容旧接口）
 */
export function unflattenCubeState(state: FlatCubeState): CubeState {
  const faces = ['U', 'R', 'F', 'D', 'L', 'B'] as const
  const result: any = {}

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]
    const faceStr = state.substring(i * 9, (i + 1) * 9)
    // 转换为3x3数组
    result[face] = [
      faceStr.substring(0, 3).split('') as CubeColor[],
      faceStr.substring(3, 6).split('') as CubeColor[],
      faceStr.substring(6, 9).split('') as CubeColor[],
    ]
  }

  return result as CubeState
}

/**
 * 将对象格式转换为扁平状态（兼容旧接口）
 */
export function flattenCubeState(state: CubeState): FlatCubeState {
  const faces = ['U', 'R', 'F', 'D', 'L', 'B'] as const
  return faces.map(f => state[f].flat().join('')).join('')
}

/**
 * 检查是否已还原
 */
export function isSolved(state: FlatCubeState): boolean {
  const solved = createSolvedCube()
  return state === solved
}

// 别名导出 (兼容旧代码)
export const isCubeSolved = isSolved

/**
 * 应用单个移动
 */
export function applyMove(state: FlatCubeState, move: string): FlatCubeState {
  return applyScramble(state, move)
}

/**
 * 解析状态字符串获取各面
 */
export function parseState(state: FlatCubeState): {
  U: string[]
  R: string[]
  F: string[]
  D: string[]
  L: string[]
  B: string[]
} {
  const faces = ['U', 'R', 'F', 'D', 'L', 'B'] as const
  const result: any = {}

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]
    result[face] = state.substring(i * 9, (i + 1) * 9).split('')
  }

  return result
}
