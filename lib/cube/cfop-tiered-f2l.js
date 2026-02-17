/**
 * 完整 CFOP 求解器 - 集成分层 F2L
 */

const Cube = require('cubejs')

// ===== Cross 求解器 =====

function solveCross(cube, maxDepth = 7) {
  function checkComplete(c) {
    const s = c.asString()
    return s[28] === 'D' && s[25] === 'F' &&
           s[30] === 'D' && s[43] === 'L' &&
           s[34] === 'D' && s[52] === 'B' &&
           s[32] === 'D' && s[16] === 'R'
  }

  if (checkComplete(cube)) return { solution: '', steps: 0 }

  const moves = ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'D', "D'", 'D2']

  function bfs(c, depth, lastFace, path) {
    if (checkComplete(c)) return { solution: path.join(' '), steps: path.length }
    if (depth <= 0) return null

    for (const move of moves) {
      const face = move[0]
      if (lastFace && face === lastFace) continue

      const newCube = new Cube(c)
      newCube.move(move)
      const result = bfs(newCube, depth - 1, face, [...path, move])
      if (result) return result
    }
    return null
  }

  for (let d = 1; d <= maxDepth; d++) {
    const result = bfs(cube, d, '', [])
    if (result) return result
  }

  return { solution: '', steps: 0, failed: true }
}

// ===== 分层 F2L 求解器 =====

const STANDARD_FORMULAS = {
  'FR': ['R U R\'', 'U R U\' R\'', 'R U\' R\' U R U\' R\'', 'F\' U F', 'U\' F\' U F'],
  'FL': ['L\' U\' L', 'U\' L\' U L', 'L U L\' U\' L U L\'', 'F U\' F\'', 'U F U\' F\''],
  'BL': ['L U L\'', 'U L U\' L\'', 'L\' U\' L U L U\' L\'', 'B\' U B', 'U\' B\' U B'],
  'BR': ['R\' U\' R', 'U R\' U\' R', 'R U R\' U\' R U R\'', 'B U\' B\'', 'U B U\' B\'']
}

function evaluateF2LState(cube, slot) {
  const state = cube.asString()

  const slotColors = {
    'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
    'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
    'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
    'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
  }

  const colors = slotColors[slot]

  // 简化检查 - 使用位置索引
  const slotIndices = {
    'FR': { corner: [29, 26, 15], edge: [23, 12] },
    'FL': { corner: [27, 44, 24], edge: [21, 41] },
    'BL': { corner: [33, 42, 53], edge: [39, 47] },
    'BR': { corner: [35, 51, 17], edge: [48, 14] },
  }

  const idx = slotIndices[slot]

  // 检查角块
  const cornerColors = [state[idx.corner[0]], state[idx.corner[1]], state[idx.corner[2]]].sort().join('')
  const cornerMatch = cornerColors === colors.corner.sort().join('')

  // 检查棱块
  const edgeColors = [state[idx.edge[0]], state[idx.edge[1]]]
  const edgeMatch = (edgeColors[0] === colors.edge[0] && edgeColors[1] === colors.edge[1]) ||
                   (edgeColors[0] === colors.edge[1] && edgeColors[1] === colors.edge[0])

  const slotComplete = cornerMatch && edgeMatch

  if (slotComplete) {
    return { level: 0, setupMoves: [], cornerInU: false, edgeInU: false }
  }

  // U层判断
  const uCorners = [8, 6, 0, 2]  // URF, UFL, ULB, UBR 在 asString() 的起始索引
  const uEdges = [7, 5, 1, 3]    // UF, UR, UB, UL

  // 简化的 U 层检查
  const cornerInU = idx.corner.some(i => i < 9)
  const edgeInU = idx.edge.some(i => i < 9)

  if (cornerInU && edgeInU) {
    return { level: 1, setupMoves: [], cornerInU: true, edgeInU: true }
  }

  if (cornerInU || edgeInU) {
    return { level: 2, setupMoves: ['U'], cornerInU, edgeInU }
  }

  return { level: 3, setupMoves: ['R U R\'', 'L\' U\' L'], cornerInU: false, edgeInU: false }
}

function tryStandardFormula(cube, slot) {
  const formulas = STANDARD_FORMULAS[slot] || []

  for (const formula of formulas) {
    try {
      const testCube = new Cube(cube)
      testCube.move(formula)

      // 检查是否完成或更接近完成
      const afterState = evaluateF2LState(testCube, slot)
      if (afterState.level === 0) {
        return formula
      }
    } catch (e) {
      // 忽略错误
    }
  }

  return ''
}

function solveF2LSlot(cube, slot) {
  const state = evaluateF2LState(cube, slot)

  if (state.level === 0) {
    return { solution: '', steps: 0, done: true }
  }

  let solution = ''

  switch (state.level) {
    case 1:
      solution = tryStandardFormula(cube, slot)
      break
    case 2:
      const setup2 = state.setupMoves[0] || 'U'
      cube.move(setup2)
      const formula2 = tryStandardFormula(cube, slot)
      solution = setup2 + ' ' + formula2
      break
    case 3:
      // 先尝试 setup
      for (const setup of state.setupMoves) {
        cube.move(setup)
        const result = tryStandardFormula(cube, slot)
        if (result) {
          solution = setup + ' ' + result
          break
        }
      }
      break
  }

  return { solution: solution || '', steps: solution ? solution.split(' ').length : 0, done: state.level === 0 }
}

function solveF2L(cube) {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const solution = []
  const details = {}

  for (const slot of slots) {
    const result = solveF2LSlot(cube, slot)
    details[slot] = {
      level: evaluateF2LState(cube, slot).level,
      solution: result.solution,
      done: result.done
    }

    if (result.solution) {
      cube.move(result.solution)
      solution.push(result.solution)
    }
  }

  return {
    solution: solution.join(' '),
    steps: solution.join(' ').split(' ').length,
    details
  }
}

// ===== OLL 求解器 =====

const OLL_FORMULAS = [
  'F R U R\' U\' F\'',
  'R U R\' U R U2 R\'',
  'R\' F R U R\' U\' F\'',
  'F R U R\' U\' R\' F R F\'',
  'L\' U\' L U L\' U\' L',
  'R U R\' U\' R\' F R F\'',
  'R U R\' U R U2 R\' U R U R\' U\' R U2 R\'',
  'r U R\' U\' r\' F R F\'',
  'R U R\' F\' R U R\' U\' R\' F R2 U\' R\'',
  'F R U R\' U\' F\''
]

function isOLLComplete(cube) {
  const s = cube.asString()
  return s.substring(0, 9).split('').every(c => c === 'U')
}

function solveOLL(cube) {
  if (isOLLComplete(cube)) {
    return { solution: '', steps: 0, done: true }
  }

  for (const formula of OLL_FORMULAS) {
    try {
      const testCube = new Cube(cube)
      testCube.move(formula)
      if (isOLLComplete(testCube)) {
        return { solution: formula, steps: formula.split(' ').length, done: true }
      }
    } catch (e) {
      // 继续
    }
  }

  return { solution: '', steps: 0, done: false, failed: true }
}

// ===== PLL 求解器 =====

const PLL_FORMULAS = [
  'R U R\' F\' R U R\' U\' R\' F R2 U\' R\'',
  'R\' U L\' U2 R U\' R\' U2 R L',
  'M2 U M2 U2 M2 U M2',
  'R U\' R U R U R U\' R\' U\' R2',
  'R\' U R\' U\' R\' U\' R\' U R U R2'
]

function solvePLL(cube) {
  if (cube.isSolved()) {
    return { solution: '', steps: 0, done: true }
  }

  for (const formula of PLL_FORMULAS) {
    try {
      const testCube = new Cube(cube)
      testCube.move(formula)
      if (testCube.isSolved()) {
        return { solution: formula, steps: formula.split(' ').length, done: true }
      }
    } catch (e) {
      // 继续
    }
  }

  // 尝试 AUF + PLL
  const auf = ['U', "U'", 'U2']
  for (const u of auf) {
    const testCube = new Cube(cube)
    testCube.move(u)

    for (const formula of PLL_FORMULAS) {
      try {
        const verifyCube = new Cube(testCube)
        verifyCube.move(formula)
        if (verifyCube.isSolved()) {
          return { solution: u + ' ' + formula, steps: (u + ' ' + formula).split(' ').length, done: true }
        }
      } catch (e) {
        // 继续
      }
    }
  }

  return { solution: '', steps: 0, done: false, failed: true }
}

// ===== 完整 CFOP =====

function solveCFOP(cube, options = {}) {
  const { verbose = true, maxCrossDepth = 7 } = options

  const result = {
    cross: { solution: '', steps: 0 },
    f2l: { solution: '', steps: 0, details: {} },
    oll: { solution: '', steps: 0 },
    pll: { solution: '', steps: 0 },
    solution: '',
    totalSteps: 0,
    verified: false
  }

  // Cross
  if (verbose) console.log('[1/4] Cross...')
  const crossResult = solveCross(cube, maxCrossDepth)
  result.cross = crossResult

  if (crossResult.failed) {
    if (verbose) console.log('  ❌ Cross 求解失败')
    return { ...result, failed: 'Cross' }
  }

  if (verbose) console.log(`  ✅ ${crossResult.solution} (${crossResult.steps}步)`)

  // F2L
  if (verbose) console.log('[2/4] F2L...')
  const f2lResult = solveF2L(cube)
  result.f2l = f2lResult

  if (verbose) {
    for (const [slot, detail] of Object.entries(f2lResult.details)) {
      console.log(`  ${slot}: L${detail.level} ${detail.done ? '✅' : '❌'}`)
    }
  }

  if (verbose) console.log(`  ✅ (${f2lResult.steps}步)`)

  // OLL
  if (verbose) console.log('[3/4] OLL...')
  const ollResult = solveOLL(cube)
  result.oll = ollResult

  if (ollResult.failed) {
    if (verbose) console.log('  ❌ OLL 求解失败')
  } else {
    if (verbose) console.log(`  ✅ ${ollResult.solution} (${ollResult.steps}步)`)
    cube.move(ollResult.solution)
  }

  // PLL
  if (verbose) console.log('[4/4] PLL...')
  const pllResult = solvePLL(cube)
  result.pll = pllResult

  if (pllResult.failed) {
    if (verbose) console.log('  ❌ PLL 求解失败')
  } else {
    if (verbose) console.log(`  ✅ ${pllResult.solution} (${pllResult.steps}步)`)
  }

  // 验证
  result.verified = cube.isSolved()
  result.solution = [result.cross.solution, result.f2l.solution, result.oll.solution, result.pll.solution]
    .filter(s => s)
    .join(' ')
  result.totalSteps = result.solution.split(' ').length

  return result
}

module.exports = {
  solveCFOP,
  solveCross,
  solveF2L,
  solveOLL,
  solvePLL
}
