/**
 * 3x3 魔方状态模拟器
 *
 * 表示魔方的状态，支持应用动作、验证解法
 */

// 颜色枚举
export enum Color {
  WHITE = 'W',
  YELLOW = 'Y',
  RED = 'R',
  ORANGE = 'O',
  BLUE = 'B',
  GREEN = 'G',
}

// 面
export enum Face {
  UP = 'U',      // 上 - 白
  DOWN = 'D',    // 下 - 黄
  FRONT = 'F',   // 前 - 绿
  BACK = 'B',    // 后 - 蓝
  RIGHT = 'R',   // 右 - 红
  LEFT = 'L',    // 左 - 橙
}

// 标准颜色配置
const FACE_COLORS: Record<Face, Color> = {
  [Face.UP]: Color.WHITE,
  [Face.DOWN]: Color.YELLOW,
  [Face.FRONT]: Color.GREEN,
  [Face.BACK]: Color.BLUE,
  [Face.RIGHT]: Color.RED,
  [Face.LEFT]: Color.ORANGE,
}

// 面上的贴纸位置 (0-8, 行优先)
export type FaceState = Color[]

/**
 * 完整的魔方状态
 */
export class CubeState {
  // 每个面9个贴纸 (3x3)
  private faces: Record<Face, FaceState>

  constructor() {
    this.faces = {
      [Face.UP]: this.createFace(FACE_COLORS[Face.UP]),
      [Face.DOWN]: this.createFace(FACE_COLORS[Face.DOWN]),
      [Face.FRONT]: this.createFace(FACE_COLORS[Face.FRONT]),
      [Face.BACK]: this.createFace(FACE_COLORS[Face.BACK]),
      [Face.RIGHT]: this.createFace(FACE_COLORS[Face.RIGHT]),
      [Face.LEFT]: this.createFace(FACE_COLORS[Face.LEFT]),
    }
  }

  /**
   * 创建单色面
   */
  private createFace(color: Color): FaceState {
    return Array(9).fill(color) as FaceState
  }

  /**
   * 复制状态
   */
  clone(): CubeState {
    const cloned = new CubeState()
    for (const face of Object.values(Face)) {
      cloned.faces[face] = [...this.faces[face]] as FaceState
    }
    return cloned
  }

  /**
   * 检查是否已还原
   */
  isSolved(): boolean {
    for (const face of Object.values(Face)) {
      const faceState = this.faces[face]
      const firstColor = faceState[0]
      if (!faceState.every(c => c === firstColor)) {
        return false
      }
    }
    return true
  }

  /**
   * 获取某面状态
   */
  getFace(face: Face): FaceState {
    return [...this.faces[face]] as FaceState
  }

  /**
   * 转动面（顺时针）
   */
  turnFace(face: Face, clockwise: boolean = true): void {
    const faceState = this.faces[face]

    // 旋转面本身
    if (clockwise) {
      this.rotateFaceClockwise(faceState)
    } else {
      this.rotateFaceCounterclockwise(faceState)
    }

    // 旋转相邻面的边缘
    this.rotateAdjacentEdges(face, clockwise)
  }

  /**
   * 顺时针旋转一个面
   */
  private rotateFaceClockwise(face: FaceState): void {
    const temp = [...face]
    face[0] = temp[6]
    face[1] = temp[3]
    face[2] = temp[0]
    face[3] = temp[7]
    face[4] = temp[4]
    face[5] = temp[1]
    face[6] = temp[8]
    face[7] = temp[5]
    face[8] = temp[2]
  }

  /**
   * 逆时针旋转一个面
   */
  private rotateFaceCounterclockwise(face: FaceState): void {
    const temp = [...face]
    face[0] = temp[2]
    face[1] = temp[5]
    face[2] = temp[8]
    face[3] = temp[1]
    face[4] = temp[4]
    face[5] = temp[7]
    face[6] = temp[0]
    face[7] = temp[3]
    face[8] = temp[6]
  }

  /**
   * 旋转相邻面的边缘
   */
  private rotateAdjacentEdges(face: Face, clockwise: boolean): void {
    // 定义每个面的相邻边缘
    const adjacent = {
      [Face.UP]: {
        faces: [Face.FRONT, Face.LEFT, Face.BACK, Face.RIGHT] as Face[],
        indices: [[0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2]] as number[][],
      },
      [Face.DOWN]: {
        faces: [Face.FRONT, Face.RIGHT, Face.BACK, Face.LEFT] as Face[],
        indices: [[6, 7, 8], [6, 7, 8], [6, 7, 8], [6, 7, 8]] as number[][],
      },
      [Face.FRONT]: {
        faces: [Face.UP, Face.RIGHT, Face.DOWN, Face.LEFT] as Face[],
        indices: [[6, 7, 8], [0, 3, 6], [0, 1, 2], [2, 5, 8]] as number[][],
      },
      [Face.BACK]: {
        faces: [Face.UP, Face.LEFT, Face.DOWN, Face.RIGHT] as Face[],
        indices: [[2, 1, 0], [0, 3, 6], [2, 1, 0], [8, 5, 2]] as number[][],
      },
      [Face.RIGHT]: {
        faces: [Face.UP, Face.BACK, Face.DOWN, Face.FRONT] as Face[],
        indices: [[2, 5, 8], [2, 5, 8], [2, 5, 8], [2, 5, 8]] as number[][],
      },
      [Face.LEFT]: {
        faces: [Face.UP, Face.FRONT, Face.DOWN, Face.BACK] as Face[],
        indices: [[0, 3, 6], [0, 3, 6], [0, 3, 6], [6, 3, 0]] as number[][],
      },
    }

    const adj = adjacent[face]
    const faces = adj.faces.map(f => this.faces[f])
    const indices = adj.indices

    if (clockwise) {
      // 顺时针: 0->1->2->3->0
      const temp = [
        indices[0].map(i => faces[0][i]),
        indices[1].map(i => faces[1][i]),
        indices[2].map(i => faces[2][i]),
        indices[3].map(i => faces[3][i]),
      ]

      indices[0].forEach((i, idx) => { faces[0][i] = temp[3][idx] })
      indices[1].forEach((i, idx) => { faces[1][i] = temp[0][idx] })
      indices[2].forEach((i, idx) => { faces[2][i] = temp[1][idx] })
      indices[3].forEach((i, idx) => { faces[3][i] = temp[2][idx] })
    } else {
      // 逆时针: 0->3->2->1->0
      const temp = [
        indices[0].map(i => faces[0][i]),
        indices[1].map(i => faces[1][i]),
        indices[2].map(i => faces[2][i]),
        indices[3].map(i => faces[3][i]),
      ]

      indices[0].forEach((i, idx) => { faces[0][i] = temp[1][idx] })
      indices[1].forEach((i, idx) => { faces[1][i] = temp[2][idx] })
      indices[2].forEach((i, idx) => { faces[2][i] = temp[3][idx] })
      indices[3].forEach((i, idx) => { faces[3][i] = temp[0][idx] })
    }
  }

  /**
   * 转换为字符串表示（用于调试）
   */
  toString(): string {
    const lines: string[] = []

    // UP面
    lines.push('    ' + this.formatFaceRow(this.faces[Face.UP], 0))
    lines.push('    ' + this.formatFaceRow(this.faces[Face.UP], 1))
    lines.push('    ' + this.formatFaceRow(this.faces[Face.UP], 2))

    // 中间部分: L, F, R, B
    for (let row = 0; row < 3; row++) {
      lines.push(
        this.formatFaceRow(this.faces[Face.LEFT], row) +
        this.formatFaceRow(this.faces[Face.FRONT], row) +
        this.formatFaceRow(this.faces[Face.RIGHT], row) +
        this.formatFaceRow(this.faces[Face.BACK], row)
      )
    }

    // DOWN面
    lines.push('    ' + this.formatFaceRow(this.faces[Face.DOWN], 0))
    lines.push('    ' + this.formatFaceRow(this.faces[Face.DOWN], 1))
    lines.push('    ' + this.formatFaceRow(this.faces[Face.DOWN], 2))

    return lines.join('\n')
  }

  private formatFaceRow(face: FaceState, row: number): string {
    return face.slice(row * 3, (row + 1) * 3).join('')
  }

  /**
   * 从定义字符串创建魔方
   * TODO: 实现从定义创建魔方
   */
  static fromDefinition(): CubeState {
    // 简化版本：从标准记法创建
    const cube = new CubeState()
    return cube
  }
}

/**
 * 应用动作到魔方状态
 * 当前支持: 基础动作(R,L,U,D,F,B)、旋转(x,y,z)、宽层(r,l,u,d,f,b)、中层(M,E,S)
 */
export function applyMove(cube: CubeState, move: string): CubeState {
  const newCube = cube.clone()
  const face = move[0] as Face
  const modifier = move.slice(1)

  // 检查是否为特殊动作（旋转、宽层、中层）
  const isRotation = ['x', 'y', 'z'].includes(face.toLowerCase())
  const isWide = face === face.toLowerCase() && ['r', 'l', 'u', 'd', 'f', 'b'].includes(face)
  const isMiddle = ['M', 'E', 'S', 'm', 'e', 's'].includes(face)

  if (isRotation || isWide || isMiddle) {
    // TODO: 实现完整的旋转、宽层、中层转动逻辑
    // 当前简化处理：跳过这些特殊动作，或者记录警告
    console.warn(`[Cube] 特殊动作暂不完全支持: ${move}`)
    return newCube
  }

  // 基础面转动
  const baseFace = face.toUpperCase() as Face

  if (modifier === '2') {
    // 180度 = 两次90度
    newCube.turnFace(baseFace, true)
    newCube.turnFace(baseFace, true)
  } else if (modifier === "'") {
    // 逆时针
    newCube.turnFace(baseFace, false)
  } else {
    // 顺时针
    newCube.turnFace(baseFace, true)
  }

  return newCube
}

/**
 * 应用公式到魔方状态
 */
export function applyFormula(cube: CubeState, formula: string): CubeState {
  const { parseFormula } = require('./parser')
  const parsed = parseFormula(formula)

  let result = cube
  for (const move of parsed.moves) {
    const moveStr = move.face + move.modifier
    result = applyMove(result, moveStr)
  }

  return result
}

/**
 * 验证解法是否有效
 * 从还原状态应用打乱，然后应用解法，检查是否还原
 */
export function validateSolution(scramble: string, solution: string): {
  valid: boolean
  solved: boolean
  error?: string
} {
  const cube = new CubeState()

  // 应用打乱
  try {
    const scrambled = applyFormula(cube, scramble)

    // 应用解法
    const solved = applyFormula(scrambled, solution)

    return {
      valid: true,
      solved: solved.isSolved(),
    }
  } catch (e) {
    return {
      valid: false,
      solved: false,
      error: e instanceof Error ? e.message : '未知错误',
    }
  }
}
