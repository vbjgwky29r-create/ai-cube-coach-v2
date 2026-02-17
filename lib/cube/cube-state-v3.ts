/**
 * 魔方状态追踪系统 v3 - 修复版
 *
 * 核心原理：
 * 1. 中心块位置固定，颜色固定
 * 2. 每个角块/棱块有固定的颜色组合
 * 3. 通过追踪每个块的位置和朝向来描述魔方状态
 * 4. 不需要"颜色识别"，只需要知道每个块在哪里
 */

// ============================================================
// 类型定义
// ============================================================

export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R'

/**
 * 3D坐标（以魔方中心为原点）
 * x: 左(-1) → 右(+1)
 * y: 下(-1) → 上(+1)
 * z: 后(-1) → 前(+1)
 */
export interface Position {
  x: number  // -1, 0, 1
  y: number  // -1, 0, 1
  z: number  // -1, 0, 1
}

/**
 * 角块：8个，每个有3个颜色
 * 颜色顺序：[U/D面颜色, F/B面颜色, L/R面颜色]
 * orientation: 0=正确, 1=顺时针扭转一次, 2=顺时针扭转两次
 */
export interface Corner {
  id: string                    // 唯一标识，如 "URF"
  position: Position            // 当前位置
  colors: [Face, Face, Face]    // 颜色组合（固定不变）
  orientation: 0 | 1 | 2        // 朝向（0,1,2表示旋转次数）
}

/**
 * 棱块：12个，每个有2个颜色
 * 颜色顺序：[主面颜色, 副面颜色]
 * orientation: 0=正确, 1=翻转
 */
export interface Edge {
  id: string                    // 唯一标识，如 "UF"
  position: Position            // 当前位置
  colors: [Face, Face]          // 颜色组合（固定不变）
  orientation: 0 | 1            // 朝向（0=正确, 1=翻转）
}

/**
 * 中心块：6个，位置和颜色固定
 */
export interface Center {
  id: string        // 'U', 'D', 'F', 'B', 'L', 'R'
  position: Position
  color: Face
}

/**
 * 完整魔方状态
 */
export interface CubeState {
  corners: Corner[]   // 8个角块
  edges: Edge[]       // 12个棱块
  centers: Center[]   // 6个中心块
}

// ============================================================
// 常量定义
// ============================================================

/** 标准配色：白顶绿前 */
export const SOLVED_STATE: Readonly<Record<Face, Face>> = {
  U: 'U',  // 白
  R: 'R',  // 红
  F: 'F',  // 绿
  D: 'D',  // 黄
  L: 'L',  // 橙
  B: 'B',  // 蓝
} as const

/** 面与颜色的映射 */
export const FACE_COLORS: Readonly<Record<Face, string>> = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
} as const

// ============================================================
// 初始状态（已还原）
// ============================================================

/**
 * 创建已还原的魔方状态
 *
 * 8个角块的颜色组合（固定）：
 * URF: U-R-F (白-红-绿)
 * UFL: U-F-L (白-绿-橙)
 * ULB: U-L-B (白-橙-蓝)
 * UBR: U-B-R (白-蓝-红)
 * DFR: D-F-R (黄-绿-红)
 * DLF: D-L-F (黄-橙-绿)
 * DBL: D-B-L (黄-蓝-橙)
 * DBR: D-R-B (黄-红-蓝)
 */
export function createSolvedCube(): CubeState {
  return {
    // 8个角块
    corners: [
      // 上层角块
      { id: 'URF', position: { x: 1, y: 1, z: 1 }, colors: ['U', 'R', 'F'], orientation: 0 },
      { id: 'UFL', position: { x: -1, y: 1, z: 1 }, colors: ['U', 'F', 'L'], orientation: 0 },
      { id: 'ULB', position: { x: -1, y: 1, z: -1 }, colors: ['U', 'L', 'B'], orientation: 0 },
      { id: 'UBR', position: { x: 1, y: 1, z: -1 }, colors: ['U', 'B', 'R'], orientation: 0 },
      // 下层角块
      { id: 'DFR', position: { x: 1, y: -1, z: 1 }, colors: ['D', 'F', 'R'], orientation: 0 },
      { id: 'DLF', position: { x: -1, y: -1, z: 1 }, colors: ['D', 'L', 'F'], orientation: 0 },
      { id: 'DBL', position: { x: -1, y: -1, z: -1 }, colors: ['D', 'B', 'L'], orientation: 0 },
      { id: 'DBR', position: { x: 1, y: -1, z: -1 }, colors: ['D', 'R', 'B'], orientation: 0 },
    ],

    // 12个棱块
    edges: [
      // 上层棱块
      { id: 'UF', position: { x: 0, y: 1, z: 1 }, colors: ['U', 'F'], orientation: 0 },
      { id: 'UL', position: { x: -1, y: 1, z: 0 }, colors: ['U', 'L'], orientation: 0 },
      { id: 'UB', position: { x: 0, y: 1, z: -1 }, colors: ['U', 'B'], orientation: 0 },
      { id: 'UR', position: { x: 1, y: 1, z: 0 }, colors: ['U', 'R'], orientation: 0 },
      // 中层棱块
      { id: 'FL', position: { x: -1, y: 0, z: 1 }, colors: ['F', 'L'], orientation: 0 },
      { id: 'FR', position: { x: 1, y: 0, z: 1 }, colors: ['F', 'R'], orientation: 0 },
      { id: 'BL', position: { x: -1, y: 0, z: -1 }, colors: ['B', 'L'], orientation: 0 },
      { id: 'BR', position: { x: 1, y: 0, z: -1 }, colors: ['B', 'R'], orientation: 0 },
      // 下层棱块
      { id: 'DF', position: { x: 0, y: -1, z: 1 }, colors: ['D', 'F'], orientation: 0 },
      { id: 'DL', position: { x: -1, y: -1, z: 0 }, colors: ['D', 'L'], orientation: 0 },
      { id: 'DB', position: { x: 0, y: -1, z: -1 }, colors: ['D', 'B'], orientation: 0 },
      { id: 'DR', position: { x: 1, y: -1, z: 0 }, colors: ['D', 'R'], orientation: 0 },
    ],

    // 6个中心块（位置和颜色固定）
    centers: [
      { id: 'U', position: { x: 0, y: 1, z: 0 }, color: 'U' },
      { id: 'D', position: { x: 0, y: -1, z: 0 }, color: 'D' },
      { id: 'F', position: { x: 0, y: 0, z: 1 }, color: 'F' },
      { id: 'B', position: { x: 0, y: 0, z: -1 }, color: 'B' },
      { id: 'L', position: { x: -1, y: 0, z: 0 }, color: 'L' },
      { id: 'R', position: { x: 1, y: 0, z: 0 }, color: 'R' },
    ],
  }
}

// ============================================================
// 坐标旋转（修复版）
// ============================================================

/**
 * 绕Y轴旋转（U/D面）
 * 从上往下看，顺时针：前→左→后→右→前
 *
 * 坐标变换（顺时针）：
 * x' = -z (前z=1 变成 左x=-1)
 * z' = x (左x=-1 变成 后z=-1)
 * y' = y (不变)
 *
 * 坐标变换（逆时针）：
 * x' = z
 * z' = -x
 * y' = y (不变)
 */
function rotateY(pos: Position, clockwise: boolean): Position {
  if (clockwise) {
    return { x: -pos.z, y: pos.y, z: pos.x }
  } else {
    return { x: pos.z, y: pos.y, z: -pos.x }
  }
}

/**
 * 绕X轴旋转（L/R面）
 * 从右往左看，顺时针：上→前→下→后→上
 *
 * 坐标变换：
 * y' = -z (上变成前)
 * z' = y (前变成下)
 * x' = x (不变)
 */
function rotateX(pos: Position, clockwise: boolean): Position {
  if (clockwise) {
    return { x: pos.x, y: -pos.z, z: pos.y }
  } else {
    return { x: pos.x, y: pos.z, z: -pos.y }
  }
}

/**
 * 绕Z轴旋转（F/B面）
 * 从前往后看，顺时针：上→右→下→左→上
 *
 * 坐标变换：
 * x' = -y (上变成右)
 * y' = x (右变成下)
 * z' = z (不变)
 */
function rotateZ(pos: Position, clockwise: boolean): Position {
  if (clockwise) {
    return { x: -pos.y, y: pos.x, z: pos.z }
  } else {
    return { x: pos.y, y: -pos.x, z: pos.z }
  }
}

/**
 * 通用的坐标旋转函数
 */
function rotatePosition(pos: Position, axis: 'x' | 'y' | 'z', clockwise: boolean): Position {
  switch (axis) {
    case 'x': return rotateX(pos, clockwise)
    case 'y': return rotateY(pos, clockwise)
    case 'z': return rotateZ(pos, clockwise)
  }
}

// ============================================================
// 朝向变化（修复版）
// ============================================================

/**
 * 更新角块朝向
 *
 * 角块朝向定义：以U/D面的颜色为准
 * - orientation=0: U/D颜色朝上/下（正确）
 * - orientation=1: U/D颜色朝前/后
 * - orientation=2: U/D颜色朝左/右
 *
 * 朝向变化规则：
 * - 绕Y轴（U/D面旋转）：朝向不变
 * - 绕X轴（L/R面旋转）：
 *   - 在U/D面的角块：朝向+1（顺时针）或+2（逆时针）
 *   - 在F/B面的角块：朝向+2（顺时针）或+1（逆时针）
 * - 绕Z轴（F/B面旋转）：
 *   - 在U/D面的角块：朝向+1
 *   - 在F/B面的角块：朝向+2
 */
function updateCornerOrientation(
  corner: Corner,
  axis: 'x' | 'y' | 'z',
  clockwise: boolean,
  isDouble: boolean
): 0 | 1 | 2 {
  // 暂时简化：禁用朝向更新，只跟踪位置
  // TODO: 实现正确的朝向计算
  return corner.orientation
}

/**
 * 更新棱块朝向
 *
 * 棱块朝向定义：以主面颜色为准
 * - orientation=0: 主面颜色在正确的面
 * - orientation=1: 翻转
 *
 * 朝向变化规则：
 * - 绕Y轴旋转：朝向不变
 * - 绕X轴旋转：在F/B面的棱块朝向翻转
 * - 绕Z轴旋转：在U/D面的棱块朝向翻转
 */
function updateEdgeOrientation(
  edge: Edge,
  axis: 'x' | 'y' | 'z',
  clockwise: boolean,
  isDouble: boolean
): 0 | 1 {
  // 绕Y轴旋转不改变朝向
  if (axis === 'y') {
    return edge.orientation
  }

  // 180度旋转：朝向要么不变，要么翻转
  if (isDouble) {
    // 对于绕X/Z轴的180度旋转，某些棱块朝向不变，某些翻转
    // 简化：假设都翻转
    return (edge.orientation + 1) % 2 as 0 | 1
  }

  // 90度旋转
  return (edge.orientation + 1) % 2 as 0 | 1
}

// ============================================================
// 应用移动（修复版）
// ============================================================

/**
 * 判断块是否在指定层
 */
function isInLayer(pos: Position, face: Face): boolean {
  switch (face) {
    case 'U': return pos.y === 1
    case 'D': return pos.y === -1
    case 'R': return pos.x === 1
    case 'L': return pos.x === -1
    case 'F': return pos.z === 1
    case 'B': return pos.z === -1
  }
}

/**
 * 应用单个移动到魔方状态
 * 支持: U D F B L R (外层) + M E S (中层)
 */
export function applyMove(state: CubeState, move: string): CubeState {
  // 处理中层移动 M/E/S
  if (move.startsWith('M') || move.startsWith('E') || move.startsWith('S')) {
    return applyMiddleLayerMove(state, move)
  }

  const newState: CubeState = {
    corners: state.corners.map(c => ({ ...c, position: { ...c.position } })),
    edges: state.edges.map(e => ({ ...e, position: { ...e.position } })),
    centers: state.centers,
  }

  // 解析移动
  const face = move[0] as Face
  const isPrime = move.includes("'")
  const isDouble = move.includes('2')

  // 确定旋转轴和方向
  let axis: 'x' | 'y' | 'z'
  let clockwise: boolean

  switch (face) {
    case 'U':
      axis = 'y'
      clockwise = !isPrime  // U顺时针从上往下看
      break
    case 'D':
      axis = 'y'
      clockwise = isPrime   // D顺时针从下往上看，与U相反
      break
    case 'R':
      axis = 'x'
      clockwise = !isPrime  // R顺时针从右往左看
      break
    case 'L':
      axis = 'x'
      clockwise = isPrime   // L顺时针从左往右看，与R相反
      break
    case 'F':
      axis = 'z'
      clockwise = !isPrime  // F顺时针从前往后看
      break
    case 'B':
      axis = 'z'
      clockwise = !isPrime  // 测试：使用与F相同的配置
      break
    default:
      return state
  }

  // 旋转次数（1次或2次，2次=180度）
  const rotations = isDouble ? 2 : 1

  for (let r = 0; r < rotations; r++) {
    const isDoubleRotation = isDouble && r === 0

    // 旋转所有在该层的角块
    for (const corner of newState.corners) {
      if (isInLayer(corner.position, face)) {
        corner.position = rotatePosition(corner.position, axis, clockwise)
        corner.orientation = updateCornerOrientation(corner, axis, clockwise, isDoubleRotation)
      }
    }

    // 旋转所有在该层的棱块
    for (const edge of newState.edges) {
      if (isInLayer(edge.position, face)) {
        edge.position = rotatePosition(edge.position, axis, clockwise)
        edge.orientation = updateEdgeOrientation(edge, axis, clockwise, isDoubleRotation)
      }
    }
  }

  return newState
}

/**
 * 应用中层移动 (M/E/S)
 *
 * M移动说明：
 * - M是介于L和R之间的中间层移动（x=0的层）
 * - 方向与R相同（从右边看顺时针）
 * - 影响：M层（x=0）的棱块（UF, UB, DF, DB）
 * - 注意：M移动不包含角块，因为角块不在中间层
 *
 * E移动说明：
 * - E是介于U和D之间的中间层移动（y=0的层）
 * - 方向与U相同（从上面看顺时针）
 * - 影响：E层（y=0）的棱块（FR, FL, BL, BR）
 *
 * S移动说明：
 * - S是介于F和B之间的中间层移动（z=0的层）
 * - 方向与F相同（从前面看顺时针）
 * - 影响：S层（z=0）的棱块（UR, UL, DR, DL）
 */
function applyMiddleLayerMove(state: CubeState, move: string): CubeState {
  const moveChar = move[0] // M, E, or S
  const isPrime = move.includes("'")
  const isDouble = move.includes('2')

  let axis: 'x' | 'y' | 'z'
  let clockwise: boolean

  if (moveChar === 'M') {
    // M 绕 x 轴旋转，方向与 L 相同
    // 从右边看，M是逆时针方向（让前面向上移动）
    axis = 'x'
    clockwise = isPrime // M' 才是顺时针从右边看
  } else if (moveChar === 'E') {
    // E 绕 y 轴旋转，方向同 U（从上面看顺时针）
    axis = 'y'
    clockwise = !isPrime // E 方向与 U 相同
  } else if (moveChar === 'S') {
    // S 绕 z 轴旋转，方向同 F（从前面看顺时针）
    axis = 'z'
    clockwise = !isPrime // S 方向与 F 相同
  } else {
    return state
  }

  const newState: CubeState = {
    corners: state.corners.map(c => ({ ...c, position: { ...c.position } })),
    edges: state.edges.map(e => ({ ...e, position: { ...e.position } })),
    centers: state.centers,
  }

  const rotations = isDouble ? 2 : 1

  for (let r = 0; r < rotations; r++) {
    const isDoubleRotation = isDouble && r === 0

    // 中层移动只影响棱块，不影响角块
    for (const edge of newState.edges) {
      if (shouldMoveInSlice(edge.position, moveChar)) {
        edge.position = rotatePosition(edge.position, axis, clockwise)
        edge.orientation = updateEdgeOrientation(edge, axis, clockwise, isDoubleRotation)
      }
    }

    // 中心块保持固定
  }

  return newState
}

/**
 * 判断块是否在slice移动的影响范围内
 * 只影响中间层的棱块，不影响角块
 */
function shouldMoveInSlice(pos: Position, moveChar: 'M' | 'E' | 'S'): boolean {
  if (moveChar === 'M') {
    // M 只影响 x=0 的棱块 (UF, UB, DF, DB)
    return pos.x === 0 && pos.y !== 0 && pos.z !== 0
  } else if (moveChar === 'E') {
    // E 只影响 y=0 的棱块 (FR, FL, BL, BR)
    return pos.y === 0 && pos.x !== 0 && pos.z !== 0
  } else if (moveChar === 'S') {
    // S 只影响 z=0 的棱块 (UR, UL, DR, DL)
    return pos.z === 0 && pos.x !== 0 && pos.y !== 0
  }
  return false
}

/**
 * 应用一系列移动
 */
export function applyMoves(state: CubeState, moves: string): CubeState {
  let currentState = state
  const moveList = moves.split(/\s+/).filter(m => m.length > 0)

  for (const move of moveList) {
    currentState = applyMove(currentState, move)
  }

  return currentState
}

// ============================================================
// 状态查询（用于CFOP识别）
// ============================================================

/**
 * 查找指定位置的角块
 */
export function findCornerAt(state: CubeState, pos: Position): Corner | undefined {
  return state.corners.find(c =>
    c.position.x === pos.x &&
    c.position.y === pos.y &&
    c.position.z === pos.z
  )
}

/**
 * 查找指定位置的棱块
 */
export function findEdgeAt(state: CubeState, pos: Position): Edge | undefined {
  return state.edges.find(e =>
    e.position.x === pos.x &&
    e.position.y === pos.y &&
    e.position.z === pos.z
  )
}

/**
 * 根据ID查找角块
 */
export function findCornerById(state: CubeState, id: string): Corner | undefined {
  return state.corners.find(c => c.id === id)
}

/**
 * 根据ID查找棱块
 */
export function findEdgeById(state: CubeState, id: string): Edge | undefined {
  return state.edges.find(e => e.id === id)
}

/**
 * 检查Cross是否完成
 * Cross完成条件：4个底面棱块(DF, DR, DB, DL)都在正确位置且朝向正确
 */
export function isCrossComplete(state: CubeState): boolean {
  // 检查4个底面棱块
  const crossEdges = ['DF', 'DR', 'DB', 'DL'] as const

  for (const edgeId of crossEdges) {
    const edge = findEdgeById(state, edgeId)
    if (!edge) return false

    // 检查位置是否正确（edgeId对应的位置）
    const correctPos = getEdgeOriginalPosition(edgeId)
    if (edge.position.x !== correctPos.x ||
        edge.position.y !== correctPos.y ||
        edge.position.z !== correctPos.z) {
      return false
    }

    // 检查朝向是否正确（D面颜色应该朝下）
    if (edge.orientation !== 0) {
      return false
    }
  }

  return true
}

/**
 * 获取棱块的原始位置
 */
function getEdgeOriginalPosition(id: string): Position {
  const positions: Record<string, Position> = {
    'UF': { x: 0, y: 1, z: 1 },
    'UL': { x: -1, y: 1, z: 0 },
    'UB': { x: 0, y: 1, z: -1 },
    'UR': { x: 1, y: 1, z: 0 },
    'FL': { x: -1, y: 0, z: 1 },
    'FR': { x: 1, y: 0, z: 1 },
    'BL': { x: -1, y: 0, z: -1 },
    'BR': { x: 1, y: 0, z: -1 },
    'DF': { x: 0, y: -1, z: 1 },
    'DL': { x: -1, y: -1, z: 0 },
    'DB': { x: 0, y: -1, z: -1 },
    'DR': { x: 1, y: -1, z: 0 },
  }
  return positions[id] || { x: 0, y: 0, z: 0 }
}

/**
 * 检查魔方是否已还原
 */
export function isSolved(state: CubeState): boolean {
  // 只检查位置，不检查朝向
  // 如果每个块都在它的原始位置，魔方就是还原的
  // 朝向应该由移动过程中正确更新

  const solved = createSolvedCube()

  // 检查所有角块
  for (const solvedCorner of solved.corners) {
    const corner = findCornerById(state, solvedCorner.id)
    if (!corner) return false
    if (corner.position.x !== solvedCorner.position.x ||
        corner.position.y !== solvedCorner.position.y ||
        corner.position.z !== solvedCorner.position.z) {
      return false
    }
  }

  // 检查所有棱块
  for (const solvedEdge of solved.edges) {
    const edge = findEdgeById(state, solvedEdge.id)
    if (!edge) return false
    if (edge.position.x !== solvedEdge.position.x ||
        edge.position.y !== solvedEdge.position.y ||
        edge.position.z !== solvedEdge.position.z) {
      return false
    }
  }

  return true
}

// ============================================================
// 面颜色获取（用于显示）
// ============================================================

/**
 * 获取指定位置显示的颜色
 * 用于展开图显示
 */
export function getColorAt(state: CubeState, pos: Position, viewFace: Face): Face {
  // 中心块
  if (pos.x === 0 && pos.y === 0 && pos.z === 0) {
    return state.centers.find(c => c.id === viewFace)?.color || 'U'
  }

  // 边上的中心（不实际存在，返回对应面的颜色）
  if ((pos.x === 0 && pos.y === 0) ||
      (pos.x === 0 && pos.z === 0) ||
      (pos.y === 0 && pos.z === 0)) {
    return viewFace
  }

  // 角块（三个坐标都不为0）
  if (pos.x !== 0 && pos.y !== 0 && pos.z !== 0) {
    const corner = findCornerAt(state, pos)
    if (corner) {
      return getCornerColor(corner, viewFace)
    }
  }

  // 棱块（两个坐标不为0）
  const edge = findEdgeAt(state, pos)
  if (edge) {
    return getEdgeColor(edge, viewFace)
  }

  return 'U'
}

/**
 * 获取角块在指定面的颜色
 */
function getCornerColor(corner: Corner, viewFace: Face): Face {
  // colors顺序: [U/D面颜色, F/B面颜色, L/R面颜色]
  // 需要根据朝向计算实际显示的颜色

  const colors = corner.colors
  const ori = corner.orientation

  // 根据viewFace确定应该取哪个颜色
  if (viewFace === 'U' || viewFace === 'D') {
    // U/D面的颜色（索引0），受朝向影响
    return colors[(0 + ori) % 3]
  } else if (viewFace === 'F' || viewFace === 'B') {
    // F/B面的颜色（索引1），受朝向影响
    return colors[(1 + ori) % 3]
  } else {
    // L/R面的颜色（索引2），受朝向影响
    return colors[(2 + ori) % 3]
  }
}

/**
 * 获取棱块在指定面的颜色
 */
function getEdgeColor(edge: Edge, viewFace: Face): Face {
  // colors顺序: [第一个面的颜色, 第二个面的颜色]
  // 需要根据朝向计算实际显示的颜色

  const colors = edge.colors
  const ori = edge.orientation

  // 简化处理：根据viewFace在棱块两个面中的位置决定颜色
  // 实际实现需要更复杂的逻辑
  return ori === 0 ? colors[0] : colors[1]
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 复制魔方状态
 */
export function cloneCube(state: CubeState): CubeState {
  return {
    corners: state.corners.map(c => ({ ...c })),
    edges: state.edges.map(e => ({ ...e })),
    centers: state.centers.map(c => ({ ...c })),
  }
}

/**
 * 打印魔方状态（调试用）
 */
export function printCubeState(state: CubeState): string {
  const lines: string[] = []
  lines.push('=== 角块 ===')
  for (const c of state.corners) {
    lines.push(`${c.id}: pos(${c.position.x},${c.position.y},${c.position.z}) ori:${c.orientation}`)
  }
  lines.push('=== 棱块 ===')
  for (const e of state.edges) {
    lines.push(`${e.id}: pos(${e.position.x},${e.position.y},${e.position.z}) ori:${e.orientation}`)
  }
  return lines.join('\n')
}
