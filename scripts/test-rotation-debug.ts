/**
 * 魔方旋转调试脚本
 * 验证R旋转方向是否正确
 */

// 颜色定义
type CubeColor = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'
type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

interface CubeState {
  U: CubeColor[][]
  R: CubeColor[][]
  F: CubeColor[][]
  D: CubeColor[][]
  L: CubeColor[][]
  B: CubeColor[][]
}

function createSolvedCube(): CubeState {
  const createFace = (color: CubeColor): CubeColor[][] => [
    [color, color, color],
    [color, color, color],
    [color, color, color],
  ]
  return {
    U: createFace('U'),
    R: createFace('R'),
    F: createFace('F'),
    D: createFace('D'),
    L: createFace('L'),
    B: createFace('B'),
  }
}

function cloneCube(state: CubeState): CubeState {
  return {
    U: state.U.map(row => [...row]),
    R: state.R.map(row => [...row]),
    F: state.F.map(row => [...row]),
    D: state.D.map(row => [...row]),
    L: state.L.map(row => [...row]),
    B: state.B.map(row => [...row]),
  }
}

function faceToString(face: CubeColor[][]): string {
  return face.map(row => row.join('')).join(',')
}

function stateToString(state: CubeState): string {
  return `U: ${faceToString(state.U)}
F: ${faceToString(state.F)}
R: ${faceToString(state.R)}
B: ${faceToString(state.B)}
L: ${faceToString(state.L)}
D: ${faceToString(state.D)}`
}

// 面旋���
function rotateFaceCW(face: CubeColor[][]): CubeColor[][] {
  return [
    [face[2][0], face[1][0], face[0][0]],
    [face[2][1], face[1][1], face[0][1]],
    [face[2][2], face[1][2], face[0][2]],
  ]
}

// 标准R顺时针：F → U → B → D → F
function rotateR_Correct(state: CubeState): void {
  const tempF = [state.F[0][2], state.F[1][2], state.F[2][2]]

  // F右列 ← D右列
  state.F[0][2] = state.D[0][2]
  state.F[1][2] = state.D[1][2]
  state.F[2][2] = state.D[2][2]

  // D右列 ← B左列（倒序）
  state.D[0][2] = state.B[2][0]
  state.D[1][2] = state.B[1][0]
  state.D[2][2] = state.B[0][0]

  // B左列 ← U右列（倒序）
  state.B[0][0] = state.U[2][2]
  state.B[1][0] = state.U[1][2]
  state.B[2][0] = state.U[0][2]

  // U右列 ← F右列
  state.U[0][2] = tempF[0]
  state.U[1][2] = tempF[1]
  state.U[2][2] = tempF[2]

  state.R = rotateFaceCW(state.R)
}

// 当前代码的R（可能是反的）
function rotateR_Current(state: CubeState): void {
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

  state.R = rotateFaceCW(state.R)
}

console.log('=== 测试R旋转方向 ===\n')

console.log('还原状态:')
console.log(stateToString(createSolvedCube()))

console.log('\n--- 正确的R顺时针（F → U → B → D → F）---')
let state1 = createSolvedCube()
rotateR_Correct(state1)
console.log(stateToString(state1))

console.log('\n--- 当前代码的R（F ← U ← B ← D ← F）---')
let state2 = createSolvedCube()
rotateR_Current(state2)
console.log(stateToString(state2))

console.log('\n=== 分析 ===')
console.log('R顺时针应该是：F(绿)→U, U(白)→B, B(蓝)→D, D(黄)→F')
console.log('')
console.log('正确的R后：')
console.log('  U右列应该是绿色 ✓')
console.log('  B左列应该是白色 ✓')
console.log('  D右列应该是蓝色 ✓')
console.log('  F右列应该是黄色 ✓')

// 测试 R R' 是否还原
console.log('\n=== 测试 R R" ===')
let state3 = createSolvedCube()
rotateR_Correct(state3)
// R' = R 3次
for (let i = 0; i < 3; i++) {
  rotateR_Correct(state3)
}
const solved = JSON.stringify(state3) === JSON.stringify(createSolvedCube())
console.log('R R\' 后是否还原:', solved ? '✓' : '✗')
if (!solved) {
  console.log(stateToString(state3))
}
