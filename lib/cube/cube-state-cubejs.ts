/**
 * 基于cubejs的魔方状���管理
 *
 * 使用cubejs库作为底层状态引擎
 * cubejs已验证正确，有完整的朝向计算和asString()方法
 */

import Cube from 'cubejs'

// ============================================================
// 类型定义
// ============================================================

export type CubeState = ReturnType<typeof Cube.prototype.asString>

// ============================================================
// 基础操作
// ============================================================

/**
 * 创建已还原的魔方
 */
export function createSolvedCube(): Cube {
  return new Cube()
}

/**
 * 应用单个移动
 */
export function applyMove(cube: Cube, move: string): Cube {
  const newCube = new Cube(cube)
  newCube.move(move)
  return newCube
}

/**
 * 应用一系列移动
 */
export function applyMoves(cube: Cube, moves: string): Cube {
  const newCube = new Cube(cube)
  newCube.move(moves)
  return newCube
}

/**
 * 获取魔方状态字符串
 * 返回格式: 54个字符表示6个面的颜色
 * UUUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
 */
export function getState(cube: Cube): string {
  return cube.asString()
}

/**
 * 检查魔方是否已还原
 */
export function isSolved(cube: Cube): boolean {
  return cube.isSolved()
}

// ============================================================
// 状态解析（用于调试）
// ============================================================

/**
 * 解析状态字符串，获取各面的颜色
 * 返回6个面的颜色数组
 */
export function parseState(stateStr: string): {
  U: string[]  // 9个贴纸
  D: string[]
  F: string[]
  B: string[]
  L: string[]
  R: string[]
} {
  const faces = ['U', 'R', 'F', 'D', 'L', 'B'] as const
  const result: Record<string, string[]> = {} as any

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]
    result[face] = stateStr.substring(i * 9, (i + 1) * 9).split('')
  }

  return result as any
}

// ============================================================
// 测试辅助函数
// ============================================================

/**
 * 比较两个魔方状态是否相同
 */
export function statesEqual(cube1: Cube, cube2: Cube): boolean {
  return cube1.asString() === cube2.asString()
}
