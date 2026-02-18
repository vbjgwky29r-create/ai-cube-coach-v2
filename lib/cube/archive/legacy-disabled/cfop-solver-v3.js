/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * CFOP求解器 v3 - 基于cubejs
 * 使用cubejs追踪魔方状态，实现真正的CFOP方法
 */

const Cube = require('cubejs')

/**
 * 解析魔方颜色字符串
 * cubejs的asString()返回54个字符，格式为：UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
 * 顺序：U面(9) + R面(9) + F面(9) + D面(9) + L面(9) + B面(9)
 */
function parseCubeState(cubeString) {
  return {
    U: cubeString.slice(0, 9).split(''),
    R: cubeString.slice(9, 18).split(''),
    F: cubeString.slice(18, 27).split(''),
    D: cubeString.slice(27, 36).split(''),
    L: cubeString.slice(36, 45).split(''),
    B: cubeString.slice(45, 54).split('')
  }
}

/**
 * 检查Cross是否完成
 * Cross完成的条件：
 * 1. D面的中心和4个棱块颜色一致（通常是黄色）
 * 2. 4个棱块的侧面颜色与对应的中心块颜色一致
 */
function isCrossComplete(cube) {
  const state = parseCubeState(cube.asString())
  const downColor = state.D[4] // D面中心块颜色
  
  // 检查D面的十字（位置1,3,5,7是棱块）
  if (state.D[1] !== downColor || state.D[3] !== downColor || 
      state.D[5] !== downColor || state.D[7] !== downColor) {
    return false
  }
  
  // 检查侧面棱块是否匹配
  // D面位置1对应F面位置7
  if (state.F[7] !== state.F[4]) return false
  // D面位置3对应L面位置7
  if (state.L[7] !== state.L[4]) return false
  // D面位置5对应R面位置7
  if (state.R[7] !== state.R[4]) return false
  // D面位置7对应B面位置7
  if (state.B[7] !== state.B[4]) return false
  
  return true
}

/**
 * 求解Cross
 * 使用简单的搜索算法找到Cross解法
 */
function solveCross(cube) {
  const maxDepth = 8 // 最多8步
  const moves = ['U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'L', "L'", 'L2', 'R', "R'", 'R2']
  
  // 如果已经完成，返回空
  if (isCrossComplete(cube)) {
    return ''
  }
  
  // BFS搜索
  const queue = [{ cube: cube.clone(), solution: '' }]
  const visited = new Set([cube.asString()])
  
  while (queue.length > 0) {
    const { cube: currentCube, solution } = queue.shift()
    
    // 检查深度
    const depth = solution.split(' ').filter(m => m).length
    if (depth >= maxDepth) continue
    
    // 尝试每个移动
    for (const move of moves) {
      const newCube = currentCube.clone()
      newCube.move(move)
      
      const newSolution = solution ? `${solution} ${move}` : move
      const stateString = newCube.asString()
      
      // 检查是否完成
      if (isCrossComplete(newCube)) {
        return newSolution
      }
      
      // 避免重复状态
      if (!visited.has(stateString)) {
        visited.add(stateString)
        queue.push({ cube: newCube, solution: newSolution })
      }
    }
  }
  
  // 如果找不到解法，返回空（实际上总能找到）
  return ''
}

/**
 * 主求解函数
 */
function solveCFOP(scramble) {
  const cube = new Cube()
  cube.move(scramble)
  
  const solutions = {
    cross: '',
    f2l: '',
    oll: '',
    pll: ''
  }
  
  // 1. 求解Cross
  console.log('求解Cross...')
  solutions.cross = solveCross(cube)
  if (solutions.cross) {
    cube.move(solutions.cross)
  }
  console.log(`Cross完成: ${solutions.cross || '(已完成)'}`)
  
  // 2. 求解F2L（暂时使用简单方法）
  console.log('求解F2L...')
  // TODO: 实现F2L求解
  solutions.f2l = ''
  
  // 3. 求解OLL（暂时使用简单方法）
  console.log('求解OLL...')
  // TODO: 实现OLL求解
  solutions.oll = ''
  
  // 4. 求解PLL（暂时使用简单方法）
  console.log('求解PLL...')
  // TODO: 实现PLL求解
  solutions.pll = ''
  
  // 组合完整解法
  const fullSolution = [solutions.cross, solutions.f2l, solutions.oll, solutions.pll]
    .filter(s => s)
    .join(' ')
  
  return {
    cross: solutions.cross,
    f2l: solutions.f2l,
    oll: solutions.oll,
    pll: solutions.pll,
    fullSolution,
    totalMoves: fullSolution.split(/\s+/).filter(m => m).length
  }
}

module.exports = {
  solveCFOP,
  isCrossComplete,
  solveCross
}

