/**
 * 魔方状态模拟器 - 使用 cubejs 库
 *
 * 使用标准配色：白顶绿前
 */

// @ts-ignore
import Cube from 'cubejs'

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

/**
 * 将 cubejs 状态字符串转换为 CubeState
 * cubejs 格式：UUUUUUUUURRRRRRRRFFFFFFFFDDDDDDDDLLLLLLLLBBBBBBBB
 * 每个面 9 个字符，顺序是 U R F D L B
 */
function cubejsStringToState(stateStr: string): CubeState {
  const parseFace = (str: string): CubeColor[][] => {
    return [
      [str[0] as CubeColor, str[1] as CubeColor, str[2] as CubeColor],
      [str[3] as CubeColor, str[4] as CubeColor, str[5] as CubeColor],
      [str[6] as CubeColor, str[7] as CubeColor, str[8] as CubeColor],
    ]
  }

  return {
    U: parseFace(stateStr.slice(0, 9)),
    R: parseFace(stateStr.slice(9, 18)),
    F: parseFace(stateStr.slice(18, 27)),
    D: parseFace(stateStr.slice(27, 36)),
    L: parseFace(stateStr.slice(36, 45)),
    B: parseFace(stateStr.slice(45, 54)),
  }
}

/**
 * 预处理打乱公式，转换为 cubejs 可识别的格式
 */
function preprocessScramble(scramble: string): string {
  // 移除多余空格，标准化格式
  return scramble
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'/g, "'")  // 统一撇号
}

/**
 * 解析并应用打乱公式 - 使用 cubejs 库
 */
export function applyScramble(scramble: string): CubeState {
  try {
    // 初始化 cubejs solver（如果需要）
    if (!Cube.prototype.solve) {
      Cube.initSolver()
    }
    
    // 创建魔方并应用打乱
    const cube = new Cube()
    const processed = preprocessScramble(scramble)
    
    if (processed) {
      cube.move(processed)
    }
    
    // 获取状态字符串并转换
    const stateStr = cube.asString()
    return cubejsStringToState(stateStr)
  } catch (error) {
    console.error('applyScramble error:', error)
    // 出错时返回还原状态
    return createSolvedCube()
  }
}

/**
 * 应用单步动作到魔方状态 - 使用 cubejs 库
 */
export function applyMove(state: CubeState, move: string): CubeState {
  try {
    // 将当前状态转换为 cubejs 格式
    const stateStr = flattenCubeState(state)
    const cube = Cube.fromString(stateStr)
    
    // 应用动作
    cube.move(move)
    
    // 返回新状态
    return cubejsStringToState(cube.asString())
  } catch (error) {
    console.error('applyMove error:', error)
    return cloneCube(state)
  }
}

/**
 * 获取魔方状态的扁平数组（用于序列化）
 * 格式：UUUUUUUUURRRRRRRRFFFFFFFFDDDDDDDDLLLLLLLLBBBBBBBB
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

  return cubejsStringToState(flat)
}
