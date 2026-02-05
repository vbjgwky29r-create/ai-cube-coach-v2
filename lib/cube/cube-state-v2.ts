/**
 * 魔方状态追踪系统 v2 - 基于正确的魔方原理
 * 
 * 核心原理：
 * 1. 中心块永远不动，颜色固定
 * 2. 角块有3个颜色面，颜色组合固定，只有位置和朝向会变
 * 3. 棱块有2个颜色面，颜色组合固定，只有位置和朝向会变
 * 4. 通过追踪每个块的坐标和朝向，可以完整描述魔方状态
 */

// 颜色定义
export type Color = 'W' | 'Y' | 'R' | 'O' | 'B' | 'G'

// 面的定义（相对于魔方中心）
export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R'

// 3D坐标（以魔方中心为原点）
export interface Position {
  x: number  // -1, 0, 1 (L to R)
  y: number  // -1, 0, 1 (D to U)
  z: number  // -1, 0, 1 (B to F)
}

// 中心块：位置固定，颜色固定
export interface CenterPiece {
  position: Position
  color: Color
  face: Face
}

// 棱块：2个颜色面
export interface EdgePiece {
  position: Position
  colors: [Color, Color]  // 两个颜色（顺序重要，表示朝向）
  orientation: number  // 0 或 1，表示是否翻转
}

// 角块：3个颜色面
export interface CornerPiece {
  position: Position
  colors: [Color, Color, Color]  // 三个颜色（顺序重要，表示朝向）
  orientation: number  // 0, 1, 2，表示旋转状态
}

// 完整的魔方状态
export interface CubeState {
  centers: CenterPiece[]   // 6个中心块
  edges: EdgePiece[]       // 12个棱块
  corners: CornerPiece[]   // 8个角块
}

/**
 * 创建已还原的魔方状态
 * 
 * 标准配色方案：
 * - 白色(W)在上(U)，黄色(Y)在下(D)
 * - 红色(R)在前(F)，橙色(O)在后(B)
 * - 蓝色(B)在右(R)，绿色(G)在左(L)
 */
export function createSolvedCubeState(): CubeState {
  // 6个中心块（位置和颜色永远不变）
  const centers: CenterPiece[] = [
    { position: { x: 0, y: 1, z: 0 }, color: 'W', face: 'U' },  // 上-白
    { position: { x: 0, y: -1, z: 0 }, color: 'Y', face: 'D' }, // 下-黄
    { position: { x: 0, y: 0, z: 1 }, color: 'R', face: 'F' },  // 前-红
    { position: { x: 0, y: 0, z: -1 }, color: 'O', face: 'B' }, // 后-橙
    { position: { x: -1, y: 0, z: 0 }, color: 'G', face: 'L' }, // 左-绿
    { position: { x: 1, y: 0, z: 0 }, color: 'B', face: 'R' },  // 右-蓝
  ]

  // 12个棱块（已还原状态）
  // 棱块的颜色顺序：[第一个面的颜色, 第二个面的颜色]
  const edges: EdgePiece[] = [
    // 上层4个棱块
    { position: { x: 0, y: 1, z: 1 }, colors: ['W', 'R'], orientation: 0 },   // UF: 上-前
    { position: { x: 0, y: 1, z: -1 }, colors: ['W', 'O'], orientation: 0 },  // UB: 上-后
    { position: { x: -1, y: 1, z: 0 }, colors: ['W', 'G'], orientation: 0 },  // UL: 上-左
    { position: { x: 1, y: 1, z: 0 }, colors: ['W', 'B'], orientation: 0 },   // UR: 上-右
    
    // 中层4个棱块
    { position: { x: -1, y: 0, z: 1 }, colors: ['G', 'R'], orientation: 0 },  // FL: 前-左
    { position: { x: 1, y: 0, z: 1 }, colors: ['B', 'R'], orientation: 0 },   // FR: 前-右
    { position: { x: -1, y: 0, z: -1 }, colors: ['G', 'O'], orientation: 0 }, // BL: 后-左
    { position: { x: 1, y: 0, z: -1 }, colors: ['B', 'O'], orientation: 0 },  // BR: 后-右
    
    // 下层4个棱块
    { position: { x: 0, y: -1, z: 1 }, colors: ['Y', 'R'], orientation: 0 },  // DF: 下-前
    { position: { x: 0, y: -1, z: -1 }, colors: ['Y', 'O'], orientation: 0 }, // DB: 下-后
    { position: { x: -1, y: -1, z: 0 }, colors: ['Y', 'G'], orientation: 0 }, // DL: 下-左
    { position: { x: 1, y: -1, z: 0 }, colors: ['Y', 'B'], orientation: 0 },  // DR: 下-右
  ]

  // 8个角块（已还原状态）
  // 角块的颜色顺序：[上/下面, 前/后面, 左/右面]
  const corners: CornerPiece[] = [
    // 上层4个角块
    { position: { x: -1, y: 1, z: 1 }, colors: ['W', 'R', 'G'], orientation: 0 },   // UFL: 上-前-左
    { position: { x: 1, y: 1, z: 1 }, colors: ['W', 'R', 'B'], orientation: 0 },    // UFR: 上-前-右
    { position: { x: -1, y: 1, z: -1 }, colors: ['W', 'O', 'G'], orientation: 0 },  // UBL: 上-后-左
    { position: { x: 1, y: 1, z: -1 }, colors: ['W', 'O', 'B'], orientation: 0 },   // UBR: 上-后-右
    
    // 下层4个角块
    { position: { x: -1, y: -1, z: 1 }, colors: ['Y', 'R', 'G'], orientation: 0 },  // DFL: 下-前-左
    { position: { x: 1, y: -1, z: 1 }, colors: ['Y', 'R', 'B'], orientation: 0 },   // DFR: 下-前-右
    { position: { x: -1, y: -1, z: -1 }, colors: ['Y', 'O', 'G'], orientation: 0 }, // DBL: 下-后-左
    { position: { x: 1, y: -1, z: -1 }, colors: ['Y', 'O', 'B'], orientation: 0 },  // DBR: 下-后-右
  ]

  return { centers, edges, corners }
}

/**
 * 旋转3D坐标
 */
function rotatePosition(pos: Position, axis: 'x' | 'y' | 'z', clockwise: boolean): Position {
  const { x, y, z } = pos
  
  if (axis === 'y') {
    // 绕Y轴旋转（U/D面）
    if (clockwise) {
      return { x: z, y, z: -x }
    } else {
      return { x: -z, y, z: x }
    }
  } else if (axis === 'x') {
    // 绕X轴旋转（L/R面）
    if (clockwise) {
      return { x, y: -z, z: y }
    } else {
      return { x, y: z, z: -y }
    }
  } else {
    // 绕Z轴旋转（F/B面）
    if (clockwise) {
      return { x: -y, y: x, z }
    } else {
      return { x: y, y: -x, z }
    }
  }
}

/**
 * 应用单个移动到魔方状态
 */
export function applyMove(state: CubeState, move: string): CubeState {
  const newState: CubeState = {
    centers: [...state.centers],
    edges: state.edges.map(e => ({ ...e, position: { ...e.position } })),
    corners: state.corners.map(c => ({ ...c, position: { ...c.position } }))
  }

  // 解析移动
  const face = move[0] as Face
  const isPrime = move.includes("'")
  const isDouble = move.includes('2')
  
  // 确定旋转轴和方向
  let axis: 'x' | 'y' | 'z'
  let clockwise: boolean
  let layerCheck: (pos: Position) => boolean
  
  switch (face) {
    case 'U':
      axis = 'y'
      clockwise = !isPrime
      layerCheck = (pos) => pos.y === 1
      break
    case 'D':
      axis = 'y'
      clockwise = isPrime
      layerCheck = (pos) => pos.y === -1
      break
    case 'R':
      axis = 'x'
      clockwise = !isPrime
      layerCheck = (pos) => pos.x === 1
      break
    case 'L':
      axis = 'x'
      clockwise = isPrime
      layerCheck = (pos) => pos.x === -1
      break
    case 'F':
      axis = 'z'
      clockwise = !isPrime
      layerCheck = (pos) => pos.z === 1
      break
    case 'B':
      axis = 'z'
      clockwise = isPrime
      layerCheck = (pos) => pos.z === -1
      break
    default:
      return state
  }
  
  // 旋转次数
  const rotations = isDouble ? 2 : 1
  
  for (let i = 0; i < rotations; i++) {
    // 旋转棱块
    for (const edge of newState.edges) {
      if (layerCheck(edge.position)) {
        edge.position = rotatePosition(edge.position, axis, clockwise)
        // 更新棱块朝向：如果棱块在F/B面旋转，且不是双层旋转，朝向会翻转
        if (axis === 'z' && !isDouble) {
          edge.orientation = (edge.orientation + 1) % 2
        }
      }
    }
    
    // 旋转角块
    for (const corner of newState.corners) {
      if (layerCheck(corner.position)) {
        corner.position = rotatePosition(corner.position, axis, clockwise)
        // 更新角块朝向：绕Y轴旋转不改变朝向，绕X/Z轴旋转且不是双层旋转会改变朝向
        if ((axis === 'x' || axis === 'z') && !isDouble) {
          if (clockwise) {
            corner.orientation = (corner.orientation + 1) % 3
          } else {
            corner.orientation = (corner.orientation + 2) % 3
          }
        }
      }
    }
  }
  
  return newState
}

/**
 * 应用一系列移动
 */
export function applyMoves(state: CubeState, moves: string): CubeState {
  let currentState = state
  const moveList = moves.split(/\s+/).filter(m => m)
  
  for (const move of moveList) {
    currentState = applyMove(currentState, move)
  }
  
  return currentState
}

/**
 * 检查魔方是否已还原
 */
export function isSolved(state: CubeState): boolean {
  const solved = createSolvedCubeState()
  
  // 检查所有棱块位置和朝向
  for (let i = 0; i < 12; i++) {
    const edge = state.edges[i]
    const solvedEdge = solved.edges[i]
    
    if (edge.position.x !== solvedEdge.position.x ||
        edge.position.y !== solvedEdge.position.y ||
        edge.position.z !== solvedEdge.position.z ||
        edge.orientation !== solvedEdge.orientation) {
      return false
    }
  }
  
  // 检查所有角块位置和朝向
  for (let i = 0; i < 8; i++) {
    const corner = state.corners[i]
    const solvedCorner = solved.corners[i]
    
    if (corner.position.x !== solvedCorner.position.x ||
        corner.position.y !== solvedCorner.position.y ||
        corner.position.z !== solvedCorner.position.z ||
        corner.orientation !== solvedCorner.orientation) {
      return false
    }
  }
  
  return true
}

/**
 * 获取魔方某个面的所有颜色（3x3网格）
 * 返回格式：[[左上, 上, 右上], [左, 中, 右], [左下, 下, 右下]]
 */
export function getFaceColors(state: CubeState, face: Face): Color[][] {
  const colors: Color[][] = [
    ['W', 'W', 'W'],
    ['W', 'W', 'W'],
    ['W', 'W', 'W']
  ]
  
  // 根据面确定坐标和方向
  let positions: Position[]
  let getCellColor: (pos: Position, state: CubeState) => Color
  
  switch (face) {
    case 'U': // 上面（白色）
      positions = [
        { x: -1, y: 1, z: -1 }, { x: 0, y: 1, z: -1 }, { x: 1, y: 1, z: -1 }, // 后排
        { x: -1, y: 1, z: 0 },  { x: 0, y: 1, z: 0 },  { x: 1, y: 1, z: 0 },  // 中排
        { x: -1, y: 1, z: 1 },  { x: 0, y: 1, z: 1 },  { x: 1, y: 1, z: 1 },  // 前排
      ]
      getCellColor = (pos, st) => getColorAtPosition(st, pos, 'U')
      break
    case 'D': // 下面（黄色）
      positions = [
        { x: -1, y: -1, z: 1 },  { x: 0, y: -1, z: 1 },  { x: 1, y: -1, z: 1 },  // 前排
        { x: -1, y: -1, z: 0 },  { x: 0, y: -1, z: 0 },  { x: 1, y: -1, z: 0 },  // 中排
        { x: -1, y: -1, z: -1 }, { x: 0, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, // 后排
      ]
      getCellColor = (pos, st) => getColorAtPosition(st, pos, 'D')
      break
    case 'F': // 前面（红色）
      positions = [
        { x: -1, y: 1, z: 1 },  { x: 0, y: 1, z: 1 },  { x: 1, y: 1, z: 1 },  // 上排
        { x: -1, y: 0, z: 1 },  { x: 0, y: 0, z: 1 },  { x: 1, y: 0, z: 1 },  // 中排
        { x: -1, y: -1, z: 1 }, { x: 0, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, // 下排
      ]
      getCellColor = (pos, st) => getColorAtPosition(st, pos, 'F')
      break
    case 'B': // 后面（橙色）
      positions = [
        { x: 1, y: 1, z: -1 },  { x: 0, y: 1, z: -1 },  { x: -1, y: 1, z: -1 },  // 上排（从后面看）
        { x: 1, y: 0, z: -1 },  { x: 0, y: 0, z: -1 },  { x: -1, y: 0, z: -1 },  // 中排
        { x: 1, y: -1, z: -1 }, { x: 0, y: -1, z: -1 }, { x: -1, y: -1, z: -1 }, // 下排
      ]
      getCellColor = (pos, st) => getColorAtPosition(st, pos, 'B')
      break
    case 'L': // 左面（绿色）
      positions = [
        { x: -1, y: 1, z: -1 },  { x: -1, y: 1, z: 0 },  { x: -1, y: 1, z: 1 },  // 上排
        { x: -1, y: 0, z: -1 },  { x: -1, y: 0, z: 0 },  { x: -1, y: 0, z: 1 },  // 中排
        { x: -1, y: -1, z: -1 }, { x: -1, y: -1, z: 0 }, { x: -1, y: -1, z: 1 }, // 下排
      ]
      getCellColor = (pos, st) => getColorAtPosition(st, pos, 'L')
      break
    case 'R': // 右面（蓝色）
      positions = [
        { x: 1, y: 1, z: 1 },  { x: 1, y: 1, z: 0 },  { x: 1, y: 1, z: -1 },  // 上排（从右面看）
        { x: 1, y: 0, z: 1 },  { x: 1, y: 0, z: 0 },  { x: 1, y: 0, z: -1 },  // 中排
        { x: 1, y: -1, z: 1 }, { x: 1, y: -1, z: 0 }, { x: 1, y: -1, z: -1 }, // 下排
      ]
      getCellColor = (pos, st) => getColorAtPosition(st, pos, 'R')
      break
    default:
      return colors
  }
  
  // 填充颜色
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    colors[row][col] = getCellColor(positions[i], state)
  }
  
  return colors
}

/**
 * 获取指定位置和面的颜色
 */
function getColorAtPosition(state: CubeState, pos: Position, face: Face): Color {
  const { x, y, z } = pos
  
  // 检查是否是中心块
  if ((x === 0 && y === 0) || (x === 0 && z === 0) || (y === 0 && z === 0)) {
    const center = state.centers.find(c => 
      c.position.x === x && c.position.y === y && c.position.z === z
    )
    if (center) return center.color
  }
  
  // 检查是否是角块
  if (x !== 0 && y !== 0 && z !== 0) {
    const corner = state.corners.find(c => 
      c.position.x === x && c.position.y === y && c.position.z === z
    )
    if (corner) {
      // 根据面和朝向返回对应的颜色
      return getCornerColorOnFace(corner, face)
    }
  }
  
  // 检查是否是棱块
  const edge = state.edges.find(e => 
    e.position.x === x && e.position.y === y && e.position.z === z
  )
  if (edge) {
    // 根据面和朝向返回对应的颜色
    return getEdgeColorOnFace(edge, face)
  }
  
  return 'W' // 默认返回白色
}

/**
 * 获取角块在指定面上的颜色
 */
function getCornerColorOnFace(corner: CornerPiece, face: Face): Color {
  const { position, colors, orientation } = corner
  
  // 根据位置确定哪个颜色对应哪个面
  // colors[0] = U/D面的颜色
  // colors[1] = F/B面的颜色  
  // colors[2] = L/R面的颜色
  
  let colorIndex = 0
  if (face === 'U' || face === 'D') {
    colorIndex = 0
  } else if (face === 'F' || face === 'B') {
    colorIndex = 1
  } else {
    colorIndex = 2
  }
  
  // 应用朝向偏移
  colorIndex = (colorIndex + orientation) % 3
  
  return colors[colorIndex]
}

/**
 * 获取棱块在指定面上的颜色
 */
function getEdgeColorOnFace(edge: EdgePiece, face: Face): Color {
  const { position, colors, orientation } = edge
  
  // 根据位置确定哪个颜色对应哪个面
  // colors[0] = 第一个面的颜色
  // colors[1] = 第二个面的颜色
  
  let colorIndex = 0
  
  // 判断当前面是第一个面还是第二个面
  if (position.y !== 0) {
    // 上下层的棱块
    colorIndex = (face === 'U' || face === 'D') ? 0 : 1
  } else if (position.x !== 0) {
    // 左右层的棱块
    colorIndex = (face === 'L' || face === 'R') ? 1 : 0
  } else {
    // 前后层的棱块
    colorIndex = (face === 'F' || face === 'B') ? 1 : 0
  }
  
  // 应用朝向偏移
  colorIndex = (colorIndex + orientation) % 2
  
  return colors[colorIndex]
}

/**
 * 打印魔方状态（用于调试）
 */
export function printCubeState(state: CubeState): string {
  const faces: Face[] = ['U', 'L', 'F', 'R', 'B', 'D']
  let result = ''
  
  for (const face of faces) {
    result += `\n${face} 面:\n`
    const colors = getFaceColors(state, face)
    for (const row of colors) {
      result += '  ' + row.join(' ') + '\n'
    }
  }
  
  return result
}
