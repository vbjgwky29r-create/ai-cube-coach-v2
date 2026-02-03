/**
 * 魔方状态模拟器 - 修复版
 *
 * 使用标准配色：白顶绿前
 */

// 颜色定义
export type CubeColor = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

export const COLOR_NAMES: Record<CubeColor, string> = {
  'U': '白',  // Up - White
  'R': '红',  // Right - Red
  'F': '绿',  // Front - Green
  'D': '黄',  // Down - Yellow
  'L': '橙',  // Left - Orange
  'B': '蓝',  // Back - Blue
}

export const COLOR_CLASSES: Record<CubeColor, string> = {
  'U': 'bg-white border-slate-300',
  'R': 'bg-red-500 border-red-700',
  'F': 'bg-green-500 border-green-700',
  'D': 'bg-yellow-400 border-yellow-600',
  'L': 'bg-orange-500 border-orange-700',
  'B': 'bg-blue-500 border-blue-700',
}

// 面定义
export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

// 魔方状态
export interface CubeState {
  U: CubeColor[][]
  R: CubeColor[][]
  F: CubeColor[][]
  D: CubeColor[][]
  L: CubeColor[][]
  B: CubeColor[][]
}

/**
 * 创建还原状态的魔方
 * 标准配色：白顶绿前
 */
export function createSolvedCube(): CubeState {
  const createFace = (color: CubeColor): CubeColor[][] => [
    [color, color, color],
    [color, color, color],
    [color, color, color],
  ]

  return {
    U: createFace('U'),  // 白
    R: createFace('R'),  // 红
    F: createFace('F'),  // 绿
    D: createFace('D'),  // 黄
    L: createFace('L'),  // 橙
    B: createFace('B'),  // 蓝
  }
}

/**
 * 检查魔方是否已还原
 */
export function isCubeSolved(state: CubeState): boolean {
  const faces: Face[] = ['U', 'R', 'F', 'D', 'L', 'B']
  for (const face of faces) {
    const faceState = state[face]
    const firstColor = faceState[0][0]
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (faceState[row][col] !== firstColor) {
          return false
        }
      }
    }
  }
  return true
}

/**
 * 复制魔方状态
 */
export function cloneCube(state: CubeState): CubeState {
  return {
    U: state.U.map(row => [...row]),
    R: state.R.map(row => [...row]),
    F: state.F.map(row => [...row]),
    D: state.D.map(row => [...row]),
    L: state.L.map(row => [...row]),
    B: state.B.map(row => [...row]),
  }
}

// ==================== 面旋转函数 ====================

function rotateFaceCW(face: CubeColor[][]): CubeColor[][] {
  return [
    [face[2][0], face[1][0], face[0][0]],
    [face[2][1], face[1][1], face[0][1]],
    [face[2][2], face[1][2], face[0][2]],
  ]
}

function rotateFaceCCW(face: CubeColor[][]): CubeColor[][] {
  return [
    [face[0][2], face[1][2], face[2][2]],
    [face[0][1], face[1][1], face[2][1]],
    [face[0][0], face[1][0], face[2][0]],
  ]
}

function rotateFace180(face: CubeColor[][]): CubeColor[][] {
  return [
    [face[2][2], face[2][1], face[2][0]],
    [face[1][2], face[1][1], face[1][0]],
    [face[0][2], face[0][1], face[0][0]],
  ]
}

// ==================== 相邻面旋转函数 ====================

/*
 * 展开图结构：
 *     U
 *   L F R B
 *     D
 *
 * U 顺时针旋转（从上往下看）：F→L→B→R→F
 * D 顺时针旋转（从下往上看）：F→R→B→L→F
 * F 顺时针旋转（从前往后看）：U→R→D→L→U
 * B 顺时针旋转（从后往前看）：U→L→D→R→U
 * R 顺时针旋转（从右往左看）：U→B→D→F→U
 * L 顺时针旋转（从左往右看）：U→F→D→B→U
 */

// U 面旋转 - 从上往下看，顺时针：F→L→B→R→F
function rotateU(state: CubeState, times: number): void {
  for (let t = 0; t < times; t++) {
    const temp = [...state.F[0]]
    state.F[0] = [...state.R[0]]
    state.R[0] = [...state.B[0]]
    state.B[0] = [...state.L[0]]
    state.L[0] = temp
  }
}

// D 面旋转 - 从下往上看，顺时针：F→R→B→L→F
function rotateD(state: CubeState, times: number): void {
  for (let t = 0; t < times; t++) {
    const temp = [...state.F[2]]
    state.F[2] = [...state.L[2]]
    state.L[2] = [...state.B[2]]
    state.B[2] = [...state.R[2]]
    state.R[2] = temp
  }
}

// F 面旋转 - 从前往后看，顺时针：U→R→D→L→U
function rotateF(state: CubeState, times: number): void {
  for (let t = 0; t < times; t++) {
    // U底行 -> R左列 -> D顶行 -> L右列 -> U底行
    const tempU = [state.U[2][0], state.U[2][1], state.U[2][2]]

    // U ← L右列（倒序）
    state.U[2][0] = state.L[2][2]
    state.U[2][1] = state.L[1][2]
    state.U[2][2] = state.L[0][2]

    // L右列 ← D顶行
    state.L[0][2] = state.D[0][0]
    state.L[1][2] = state.D[0][1]
    state.L[2][2] = state.D[0][2]

    // D顶行 ← R左列（倒序）
    state.D[0][0] = state.R[2][0]
    state.D[0][1] = state.R[1][0]
    state.D[0][2] = state.R[0][0]

    // R左列 ← U底行
    state.R[0][0] = tempU[0]
    state.R[1][0] = tempU[1]
    state.R[2][0] = tempU[2]
  }
}

// B 面旋转 - 从后往前看，顺时针：U→L→D→R→U
function rotateB(state: CubeState, times: number): void {
  for (let t = 0; t < times; t++) {
    // U顶行 -> L左列 -> D底行 -> R右列 -> U顶行
    const tempU = [state.U[0][0], state.U[0][1], state.U[0][2]]

    // U ← R右列（倒序）
    state.U[0][0] = state.R[0][2]
    state.U[0][1] = state.R[1][2]
    state.U[0][2] = state.R[2][2]

    // R右列 ← D底行（倒序）
    state.R[0][2] = state.D[2][2]
    state.R[1][2] = state.D[2][1]
    state.R[2][2] = state.D[2][0]

    // D底行 ← L左列
    state.D[2][0] = state.L[0][0]
    state.D[2][1] = state.L[1][0]
    state.D[2][2] = state.L[2][0]

    // L左列 ← U顶行
    state.L[0][0] = tempU[2]
    state.L[1][0] = tempU[1]
    state.L[2][0] = tempU[0]
  }
}

// R 面旋转 - 从右往左看，顺时针：U→B→D→F→U
function rotateR(state: CubeState, times: number): void {
  for (let t = 0; t < times; t++) {
    // U右列 -> B左列（倒序）-> D右列 -> F右列 -> U右列
    const tempU = [state.U[0][2], state.U[1][2], state.U[2][2]]

    // U右列 ← F右列
    state.U[0][2] = state.F[0][2]
    state.U[1][2] = state.F[1][2]
    state.U[2][2] = state.F[2][2]

    // F右列 ← D右列
    state.F[0][2] = state.D[0][2]
    state.F[1][2] = state.D[1][2]
    state.F[2][2] = state.D[2][2]

    // D右列 ← B左列（倒序）
    state.D[0][2] = state.B[2][0]
    state.D[1][2] = state.B[1][0]
    state.D[2][2] = state.B[0][0]

    // B左列 ← U右列（倒序）
    state.B[0][0] = tempU[2]
    state.B[1][0] = tempU[1]
    state.B[2][0] = tempU[0]
  }
}

// L 面旋转 - 从左往右看，顺时针：U→F→D→B→U
function rotateL(state: CubeState, times: number): void {
  for (let t = 0; t < times; t++) {
    // U左列 -> F左列 -> D左列 -> B右列（倒序）-> U左列
    const tempU = [state.U[0][0], state.U[1][0], state.U[2][0]]

    // U左列 ← B右列（倒序）
    state.U[0][0] = state.B[2][2]
    state.U[1][0] = state.B[1][2]
    state.U[2][0] = state.B[0][2]

    // B右列 ← D左列
    state.B[0][2] = state.D[0][0]
    state.B[1][2] = state.D[1][0]
    state.B[2][2] = state.D[2][0]

    // D左列 ← F左列
    state.D[0][0] = state.F[0][0]
    state.D[1][0] = state.F[1][0]
    state.D[2][0] = state.F[2][0]

    // F左列 ← U左列
    state.F[0][0] = tempU[0]
    state.F[1][0] = tempU[1]
    state.F[2][0] = tempU[2]
  }
}

// ==================== 应用动作 ====================

/**
 * 应用单步动作到魔方状态
 */
export function applyMove(state: CubeState, move: string): CubeState {
  const newState = cloneCube(state)

  // 解析动作
  const face = move[0].toUpperCase() as Face
  const modifier = move.slice(1)

  // 判断旋转次数
  let times = 1
  if (modifier.includes('2')) {
    times = 2
  } else if (modifier.includes("'")) {
    times = 3  // 逆时针 = 顺时针3次
  }

  // 旋转面本身
  for (let t = 0; t < times; t++) {
    newState[face] = rotateFaceCW(newState[face])
  }

  // 旋转相邻边
  switch (face) {
    case 'U':
      rotateU(newState, times)
      break
    case 'D':
      rotateD(newState, times)
      break
    case 'F':
      rotateF(newState, times)
      break
    case 'B':
      rotateB(newState, times)
      break
    case 'R':
      rotateR(newState, times)
      break
    case 'L':
      rotateL(newState, times)
      break
  }

  return newState
}

/**
 * 预处理打乱公式
 */
function preprocessScramble(scramble: string): string {
  const cleaned = scramble.trim().replace(/\s+/g, '')
  const result: string[] = []

  let i = 0
  while (i < cleaned.length) {
    const char = cleaned[i]

    if (/^[RLUDFBrludfb]$/.test(char)) {
      if (i + 1 < cleaned.length && (cleaned[i + 1] === "'" || cleaned[i + 1] === "2")) {
        result.push(char + cleaned[i + 1])
        i += 2
      } else {
        result.push(char)
        i += 1
      }
    } else if (char === "'" || char === '2') {
      if (result.length > 0) {
        result[result.length - 1] += char
      }
      i += 1
    } else {
      i += 1
    }
  }

  return result.join(' ')
}

/**
 * 解析并应用打乱公式
 */
export function applyScramble(scramble: string): CubeState {
  let state = createSolvedCube()

  const processed = preprocessScramble(scramble)
  const moves = processed.split(/\s+/).filter(m => m.length > 0)

  for (const move of moves) {
    // 跳过转体动作 x y z
    if (/^[xyz]/i.test(move)) {
      continue
    }

    try {
      state = applyMove(state, move)
    } catch (e) {
      console.warn(`无法应用动作: ${move}`, e)
    }
  }

  return state
}

/**
 * 获取魔方状态的扁平数组（用于序列化）
 */
export function flattenCubeState(state: CubeState): string {
  const faces: Face[] = ['U', 'R', 'F', 'D', 'L', 'B']
  let result = ''

  for (const face of faces) {
    for (const row of state[face]) {
      result += row.join('')
    }
  }

  return result
}

/**
 * 从扁平数组重建魔方状态
 */
export function unflattenCubeState(flat: string): CubeState {
  if (flat.length !== 54) {
    throw new Error('Invalid flat cube state: must be 54 characters')
  }

  const faces: Face[] = ['U', 'R', 'F', 'D', 'L', 'B']
  const result: CubeState = {
    U: createEmptyFace(),
    R: createEmptyFace(),
    F: createEmptyFace(),
    D: createEmptyFace(),
    L: createEmptyFace(),
    B: createEmptyFace(),
  }

  let charIndex = 0
  for (const face of faces) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        result[face][row][col] = flat[charIndex++] as CubeColor
      }
    }
  }

  return result
}

function createEmptyFace(): CubeColor[][] {
  return [
    ['U', 'U', 'U'],
    ['U', 'U', 'U'],
    ['U', 'U', 'U'],
  ]
}
