/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * Cross求解器 v2
 * 基于棱块位置和颜色判断，使用最少步数完成Cross
 */

const Cube = require('cubejs')

/**
 * 解析魔方颜色字符串
 * 返回每个面的3x3网格
 */
function parseCubeState(cubeString) {
  const faces = {
    U: cubeString.slice(0, 9).split(''),
    R: cubeString.slice(9, 18).split(''),
    F: cubeString.slice(18, 27).split(''),
    D: cubeString.slice(27, 36).split(''),
    L: cubeString.slice(36, 45).split(''),
    B: cubeString.slice(45, 54).split('')
  }
  
  // 转换为3x3数组方便访问
  for (const face in faces) {
    const colors = faces[face]
    faces[face] = [
      [colors[0], colors[1], colors[2]],
      [colors[3], colors[4], colors[5]],
      [colors[6], colors[7], colors[8]]
    ]
  }
  
  return faces
}

/**
 * 获取D面（底面）的中心颜色
 */
function getDownColor(cube) {
  const state = parseCubeState(cube.asString())
  return state.D[1][1] // 中心块
}

/**
 * 获取4个侧面的中心颜色
 */
function getSideColors(cube) {
  const state = parseCubeState(cube.asString())
  return {
    F: state.F[1][1],
    B: state.B[1][1],
    L: state.L[1][1],
    R: state.R[1][1]
  }
}

/**
 * 找到D面的4个棱块的当前位置
 * 返回每个棱块的位置和朝向
 */
function findCrossEdges(cube) {
  const state = parseCubeState(cube.asString())
  const downColor = getDownColor(cube)
  const sideColors = getSideColors(cube)
  
  // 需要找到的4个棱块：(D-F, D-B, D-L, D-R)
  const targetEdges = [
    { colors: [downColor, sideColors.F], name: 'DF' },
    { colors: [downColor, sideColors.B], name: 'DB' },
    { colors: [downColor, sideColors.L], name: 'DL' },
    { colors: [downColor, sideColors.R], name: 'DR' }
  ]
  
  // 所有可能的棱块位置（12个）
  const edgePositions = [
    // U层的4个棱块
    { pos: 'UF', colors: [state.U[2][1], state.F[0][1]] },
    { pos: 'UB', colors: [state.U[0][1], state.B[0][1]] },
    { pos: 'UL', colors: [state.U[1][0], state.L[0][1]] },
    { pos: 'UR', colors: [state.U[1][2], state.R[0][1]] },
    
    // 中层的4个棱块
    { pos: 'FL', colors: [state.F[1][0], state.L[1][2]] },
    { pos: 'FR', colors: [state.F[1][2], state.R[1][0]] },
    { pos: 'BL', colors: [state.B[1][2], state.L[1][0]] },
    { pos: 'BR', colors: [state.B[1][0], state.R[1][2]] },
    
    // D层的4个棱块
    { pos: 'DF', colors: [state.D[0][1], state.F[2][1]] },
    { pos: 'DB', colors: [state.D[2][1], state.B[2][1]] },
    { pos: 'DL', colors: [state.D[1][0], state.L[2][1]] },
    { pos: 'DR', colors: [state.D[1][2], state.R[2][1]] }
  ]
  
  // 找到每个目标棱块的当前位置
  const result = []
  for (const target of targetEdges) {
    for (const edge of edgePositions) {
      // 检查颜色是否匹配（考虑两种朝向）
      if ((edge.colors[0] === target.colors[0] && edge.colors[1] === target.colors[1]) ||
          (edge.colors[0] === target.colors[1] && edge.colors[1] === target.colors[0])) {
        result.push({
          target: target.name,
          current: edge.pos,
          colors: edge.colors,
          flipped: edge.colors[0] !== target.colors[0] // 是否翻转
        })
        break
      }
    }
  }
  
  return result
}

/**
 * 生成将棱块移动到目标位置的公式
 */
function getEdgeSolution(edge) {
  const { target, current, flipped } = edge
  
  // 简化版：只处理一些常见情况
  // 完整实现需要处理所有12个位置到4个目标位置的移动
  
  if (current === target && !flipped) {
    return '' // 已经在正确位置且朝向正确
  }
  
  // 示例：如果DF棱块在UF位置
  if (target === 'DF' && current === 'UF') {
    return flipped ? "F2 R U R' F2" : 'F2'
  }
  
  // 如果DF棱块在UR位置
  if (target === 'DF' && current === 'UR') {
    return flipped ? "R2 F' U F R2" : "U' F2"
  }
  
  // TODO: 添加更多情况
  // 这里需要为每个棱块的每个可能位置定义移动公式
  
  return '' // 暂时返回空
}

/**
 * 求解Cross
 */
function solveCross(cube) {
  const edges = findCrossEdges(cube)
  
  console.log('Cross棱块状态:')
  for (const edge of edges) {
    console.log(`  ${edge.target}: 当前在 ${edge.current}, ${edge.flipped ? '翻转' : '正确'}`)
  }
  
  const solutions = []
  const workingCube = cube.clone()
  
  // 逐个解决每个棱块
  for (const edge of edges) {
    const solution = getEdgeSolution(edge)
    if (solution) {
      solutions.push(solution)
      workingCube.move(solution)
    }
  }
  
  return solutions.join(' ')
}

module.exports = {
  solveCross,
  findCrossEdges,
  getDownColor,
  getSideColors
}

