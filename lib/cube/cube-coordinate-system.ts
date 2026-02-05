/**
 * 魔方坐标系统
 * 
 * 使用三维坐标精确表示魔方的每个块（角块、棱块、中心块）
 * 坐标系以魔方中心为原点：
 * - X 轴：左(-1) → 右(+1)
 * - Y 轴：下(-1) → 上(+1)  
 * - Z 轴：后(-1) → 前(+1)
 */

export type Color = 'W' | 'Y' | 'R' | 'O' | 'G' | 'B'  // 白黄红橙绿蓝
export type Coordinate = [number, number, number]  // [x, y, z]

/**
 * 角块（Corner）- 8个
 * 每个角块有3个面，用3个颜色表示
 */
export interface CornerPiece {
  position: Coordinate
  colors: [Color, Color, Color]  // 按 x, y, z 轴方向的颜色
  orientation: number  // 0-2，表示旋转状态
}

/**
 * 棱块（Edge）- 12个
 * 每个棱块有2个面，用2个颜色表示
 */
export interface EdgePiece {
  position: Coordinate
  colors: [Color, Color]  // 按主要轴方向的颜色
  orientation: number  // 0-1，表示是否翻转
}

/**
 * 中心块（Center）- 6个
 * 中心块固定不动，只有1个颜色
 */
export interface CenterPiece {
  position: Coordinate
  color: Color
}

/**
 * 魔方状态（基于坐标系）
 */
export interface CubeCoordinateState {
  corners: CornerPiece[]  // 8个角块
  edges: EdgePiece[]      // 12个棱块
  centers: CenterPiece[]  // 6个中心块
}

/**
 * 角块的初始位置和颜色（已还原状态）
 */
export const SOLVED_CORNERS: CornerPiece[] = [
  // 顶层4个
  { position: [-1, 1, 1], colors: ['O', 'W', 'G'], orientation: 0 },   // UFL
  { position: [1, 1, 1], colors: ['R', 'W', 'G'], orientation: 0 },    // UFR
  { position: [1, 1, -1], colors: ['R', 'W', 'B'], orientation: 0 },   // UBR
  { position: [-1, 1, -1], colors: ['O', 'W', 'B'], orientation: 0 },  // UBL
  // 底层4个
  { position: [-1, -1, 1], colors: ['O', 'Y', 'G'], orientation: 0 },  // DFL
  { position: [1, -1, 1], colors: ['R', 'Y', 'G'], orientation: 0 },   // DFR
  { position: [1, -1, -1], colors: ['R', 'Y', 'B'], orientation: 0 },  // DBR
  { position: [-1, -1, -1], colors: ['O', 'Y', 'B'], orientation: 0 }, // DBL
]

/**
 * 棱块的初始位置和颜色（已还原状态）
 */
export const SOLVED_EDGES: EdgePiece[] = [
  // 顶层4个
  { position: [0, 1, 1], colors: ['W', 'G'], orientation: 0 },    // UF
  { position: [1, 1, 0], colors: ['W', 'R'], orientation: 0 },    // UR
  { position: [0, 1, -1], colors: ['W', 'B'], orientation: 0 },   // UB
  { position: [-1, 1, 0], colors: ['W', 'O'], orientation: 0 },   // UL
  // 中层4个
  { position: [-1, 0, 1], colors: ['O', 'G'], orientation: 0 },   // FL
  { position: [1, 0, 1], colors: ['R', 'G'], orientation: 0 },    // FR
  { position: [1, 0, -1], colors: ['R', 'B'], orientation: 0 },   // BR
  { position: [-1, 0, -1], colors: ['O', 'B'], orientation: 0 },  // BL
  // 底层4个
  { position: [0, -1, 1], colors: ['Y', 'G'], orientation: 0 },   // DF
  { position: [1, -1, 0], colors: ['Y', 'R'], orientation: 0 },   // DR
  { position: [0, -1, -1], colors: ['Y', 'B'], orientation: 0 },  // DB
  { position: [-1, -1, 0], colors: ['Y', 'O'], orientation: 0 },  // DL
]

/**
 * 中心块的位置和颜色（固定不动）
 */
export const CENTERS: CenterPiece[] = [
  { position: [0, 1, 0], color: 'W' },   // U (上/白)
  { position: [0, -1, 0], color: 'Y' },  // D (下/黄)
  { position: [1, 0, 0], color: 'R' },   // R (右/红)
  { position: [-1, 0, 0], color: 'O' },  // L (左/橙)
  { position: [0, 0, 1], color: 'G' },   // F (前/绿)
  { position: [0, 0, -1], color: 'B' },  // B (后/蓝)
]

/**
 * 创建已还原的魔方状态
 */
export function createSolvedCube(): CubeCoordinateState {
  return {
    corners: JSON.parse(JSON.stringify(SOLVED_CORNERS)),
    edges: JSON.parse(JSON.stringify(SOLVED_EDGES)),
    centers: JSON.parse(JSON.stringify(CENTERS)),
  }
}

/**
 * 查找指定颜色组合的角块
 */
export function findCornerByColors(
  state: CubeCoordinateState,
  colors: [Color, Color, Color]
): CornerPiece | null {
  for (const corner of state.corners) {
    // 检查所有可能的旋转
    for (let ori = 0; ori < 3; ori++) {
      const rotated: [Color, Color, Color] = [
        corner.colors[ori],
        corner.colors[(ori + 1) % 3],
        corner.colors[(ori + 2) % 3]
      ]
      if (rotated[0] === colors[0] && rotated[1] === colors[1] && rotated[2] === colors[2]) {
        return corner
      }
    }
  }
  return null
}

/**
 * 查找指定颜色组合的棱块
 */
export function findEdgeByColors(
  state: CubeCoordinateState,
  colors: [Color, Color]
): EdgePiece | null {
  for (const edge of state.edges) {
    if (edge.colors[0] === colors[0] && edge.colors[1] === colors[1]) {
      return edge
    }
    if (edge.colors[0] === colors[1] && edge.colors[1] === colors[0]) {
      return { ...edge, orientation: 1 - edge.orientation }
    }
  }
  return null
}

/**
 * 应用单个动作到魔方状态
 */
export function applyMoveToCoordinateState(
  state: CubeCoordinateState,
  move: string
): CubeCoordinateState {
  const newState = JSON.parse(JSON.stringify(state)) as CubeCoordinateState
  
  // 解析动作
  const face = move[0]
  const modifier = move.slice(1)  // '', '\'', '2'
  const times = modifier === '2' ? 2 : 1
  const clockwise = modifier !== '\''
  
  // 应用旋转
  for (let i = 0; i < times; i++) {
    rotateFace(newState, face, clockwise)
  }
  
  return newState
}

/**
 * 旋转指定面
 */
function rotateFace(state: CubeCoordinateState, face: string, clockwise: boolean) {
  // 根据面确定旋转轴和方向
  let axis: 'x' | 'y' | 'z'
  let direction: number
  
  switch (face) {
    case 'R': axis = 'x'; direction = clockwise ? 1 : -1; break
    case 'L': axis = 'x'; direction = clockwise ? -1 : 1; break
    case 'U': axis = 'y'; direction = clockwise ? 1 : -1; break
    case 'D': axis = 'y'; direction = clockwise ? -1 : 1; break
    case 'F': axis = 'z'; direction = clockwise ? 1 : -1; break
    case 'B': axis = 'z'; direction = clockwise ? -1 : 1; break
    default: return
  }
  
  // 旋转所有在该面上的块
  for (const corner of state.corners) {
    if (isOnFace(corner.position, face)) {
      rotatePosition(corner.position, axis, direction)
      corner.orientation = (corner.orientation + 1) % 3
    }
  }
  
  for (const edge of state.edges) {
    if (isOnFace(edge.position, face)) {
      rotatePosition(edge.position, axis, direction)
      edge.orientation = (edge.orientation + 1) % 2
    }
  }
}

/**
 * 判断位置是否在指定面上
 */
function isOnFace(pos: Coordinate, face: string): boolean {
  const [x, y, z] = pos
  switch (face) {
    case 'R': return x === 1
    case 'L': return x === -1
    case 'U': return y === 1
    case 'D': return y === -1
    case 'F': return z === 1
    case 'B': return z === -1
    default: return false
  }
}

/**
 * 旋转坐标位置
 */
function rotatePosition(pos: Coordinate, axis: 'x' | 'y' | 'z', direction: number) {
  const [x, y, z] = pos
  
  if (axis === 'x') {
    // 绕 X 轴旋转
    const newY = direction > 0 ? -z : z
    const newZ = direction > 0 ? y : -y
    pos[1] = newY
    pos[2] = newZ
  } else if (axis === 'y') {
    // 绕 Y 轴旋转
    const newX = direction > 0 ? -z : z
    const newZ = direction > 0 ? x : -x
    pos[0] = newX
    pos[2] = newZ
  } else if (axis === 'z') {
    // 绕 Z 轴旋转
    const newX = direction > 0 ? -y : y
    const newY = direction > 0 ? x : -x
    pos[0] = newX
    pos[1] = newY
  }
}

/**
 * 检查魔方是否已还原
 */
export function isCubeSolved(state: CubeCoordinateState): boolean {
  // 检查所有角块是否归位且方向正确
  for (let i = 0; i < 8; i++) {
    const corner = state.corners[i]
    const solved = SOLVED_CORNERS[i]
    
    if (corner.position[0] !== solved.position[0] ||
        corner.position[1] !== solved.position[1] ||
        corner.position[2] !== solved.position[2]) {
      return false
    }
    
    if (corner.orientation !== 0) {
      return false
    }
  }
  
  // 检查所有棱块是否归位且方向正确
  for (let i = 0; i < 12; i++) {
    const edge = state.edges[i]
    const solved = SOLVED_EDGES[i]
    
    if (edge.position[0] !== solved.position[0] ||
        edge.position[1] !== solved.position[1] ||
        edge.position[2] !== solved.position[2]) {
      return false
    }
    
    if (edge.orientation !== 0) {
      return false
    }
  }
  
  return true
}
