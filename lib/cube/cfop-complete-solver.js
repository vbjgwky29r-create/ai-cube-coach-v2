/**
 * 完整 CFOP 求解器
 *
 * 集成 Cross + F2L + OLL + PLL
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

// ===== F2L 求解器 (使用块排列验证方法) =====

const F2L_STANDARD_FORMULAS = {
  'FR': ['R U R\'', 'U R U\' R\'', 'R U\' R\' U R U\' R\'', 'F\' U F', 'U\' F\' U F'],
  'FL': ['L\' U\' L', 'U\' L\' U L', 'L U L\' U\' L U L\'', 'F U\' F\'', 'U F U\' F\''],
  'BL': ['L U L\'', 'U L U\' L\'', 'L\' U\' L U L U\' L\'', 'B\' U B', 'U\' B\' U B'],
  'BR': ['R\' U\' R', 'U R\' U\' R', 'R U R\' U\' R U R\'', 'B U\' B\'', 'U B U\' B\'']
}

// 块编号
const CORNERS = { URF: 0, UFL: 1, ULB: 2, UBR: 3, DFR: 4, DLF: 5, DBL: 6, DRB: 7 }
const EDGES = { UR: 0, UF: 1, UL: 2, UB: 3, DR: 4, DF: 5, DL: 6, DB: 7, FR: 8, FL: 9, BL: 10, BR: 11 }

// 槽位定义
const F2L_SLOTS = {
  FR: { corner: CORNERS.DFR, edge: EDGES.FR, cornerPiece: CORNERS.DFR, edgePiece: EDGES.FR },
  FL: { corner: CORNERS.DLF, edge: EDGES.FL, cornerPiece: CORNERS.DLF, edgePiece: EDGES.FL },
  BL: { corner: CORNERS.DBL, edge: EDGES.BL, cornerPiece: CORNERS.DBL, edgePiece: EDGES.BL },
  BR: { corner: CORNERS.DRB, edge: EDGES.BR, cornerPiece: CORNERS.DRB, edgePiece: EDGES.BR }
}

function isF2LSlotComplete(cube, slot) {
  const state = cube.toJSON()
  const slotInfo = F2L_SLOTS[slot]

  // 使用内部状态检查
  const cornerCorrect = state.cp[slotInfo.corner] === slotInfo.cornerPiece &&
                        state.co[slotInfo.corner] === 0
  const edgeCorrect = state.ep[slotInfo.edge] === slotInfo.edgePiece &&
                      state.eo[slotInfo.edge] === 0

  return cornerCorrect && edgeCorrect
}

function tryF2LFormula(cube, slot) {
  const formulas = F2L_STANDARD_FORMULAS[slot] || []

  for (const formula of formulas) {
    try {
      const testCube = new Cube(cube)
      testCube.move(formula)
      // 检查是否完成或更接近完成
      if (isF2LSlotComplete(testCube, slot)) {
        return formula
      }
    } catch (e) {
      // 忽略错误，继续尝试下一个公式
    }
  }

  // 如果没有直接完成的公式，尝试 setup + 公式
  const setups = ['U', "U'", 'U2', 'R U R\'', 'L\' U\' L']
  for (const setup of setups) {
    const testCube = new Cube(cube)
    testCube.move(setup)

    for (const formula of formulas) {
      try {
        const verifyCube = new Cube(testCube)
        verifyCube.move(formula)
        if (isF2LSlotComplete(verifyCube, slot)) {
          return setup + ' ' + formula
        }
      } catch (e) {
        // 忽略
      }
    }
  }

  return ''
}

function solveF2LSlot(cube, slot) {
  if (isF2LSlotComplete(cube, slot)) {
    return { solution: '', steps: 0, done: true }
  }

  // 尝试标准公式
  const formula = tryF2LFormula(cube, slot)

  if (formula) {
    const testCube = new Cube(cube)
    testCube.move(formula)
    return {
      solution: formula,
      steps: formula.split(' ').length,
      done: isF2LSlotComplete(testCube, slot)
    }
  }

  // 如果标准公式不行，尝试 setup + 公式
  const setups = ['U', "U'", 'U2']
  for (const setup of setups) {
    const testCube = new Cube(cube)
    testCube.move(setup)

    const formula2 = tryF2LFormula(testCube, slot)
    if (formula2) {
      const verifyCube = new Cube(testCube)
      verifyCube.move(formula2)
      if (isF2LSlotComplete(verifyCube, slot)) {
        return {
          solution: setup + ' ' + formula2,
          steps: (setup + ' ' + formula2).split(' ').length,
          done: true
        }
      }
    }
  }

  return { solution: '', steps: 0, done: false }
}

function solveF2L(cube, maxSlots = 4) {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const solution = []
  const details = {}

  for (const slot of slots) {
    const result = solveF2LSlot(cube, slot)

    details[slot] = {
      done: result.done,
      solution: result.solution,
      steps: result.steps
    }

    if (result.solution) {
      solution.push(result.solution)
      cube.move(result.solution)
    }
  }

  return {
    solution: solution.join(' '),
    steps: solution.join(' ').split(' ').length,
    details,
    allDone: Object.values(details).every(d => d.done)
  }
}

// ===== OLL 求解器 =====

const OLL_FORMULAS = [
  'F R U R\' U\' F\'',     // OLL 1
  'R U R\' U R U2 R\'',    // OLL 2 (Sune)
  'R\' F R U R\' U\' F\'', // OLL 3
  'R U R\' U\' R\' F R F\'', // OLL 4
  'L\' U\' L U L\' U\' L',   // OLL 21 (反Sune)
  'F R U R\' U\' R U R\' U\' F\'', // OLL 26
  'R U R\' U R U2 R\' U R U R\' U\' R U2 R\'', // OLL 27
  'r U R\' U\' r\' F R F\'', // OLL 57
  'R U R\' U R U2 R\'',    // 常用
  'F R U R\' U\' F\'',     // 常用
]

function isOLLComplete(cube) {
  const s = cube.asString()
  // 检查 U 面 (0-8) 是否全是 U
  return s.substring(0, 9).split('').every(c => c === 'U')
}

function solveOLL(cube) {
  if (isOLLComplete(cube)) {
    return { solution: '', steps: 0, done: true }
  }

  const state = cube.asString().substring(0, 9)
  const topColors = state.split('').sort().join('')
  const uCount = state.split('').filter(c => c === 'U').length

  // 根据顶面情况选择公式
  for (const formula of OLL_FORMULAS) {
    try {
      const testCube = new Cube(cube)
      testCube.move(formula)
      if (isOLLComplete(testCube)) {
        return { solution: formula, steps: formula.split(' ').length, done: true }
      }
    } catch (e) {
      // 继续尝试
    }
  }

  // 如果直接公式不行，尝试 2-look OLL
  // 第一步：顶面十字
  const crossFormulas = ['F R U R\' U\' F\'', 'F U R U\' R\' F\'', 'R U R\' U R U2 R\'']
  for (const f1 of crossFormulas) {
    const testCube = new Cube(cube)
    testCube.move(f1)

    // 检查是否有十字
    const afterState = testCube.asString().substring(0, 9)
    const crossEdges = [afterState[1], afterState[3], afterState[5], afterState[7]].filter(c => c === 'U').length

    if (crossEdges >= 2) {
      // 继续第二步
      for (const f2 of OLL_FORMULAS) {
        try {
          const verifyCube = new Cube(testCube)
          verifyCube.move(f2)
          if (isOLLComplete(verifyCube)) {
            return { solution: f1 + ' ' + f2, steps: (f1 + ' ' + f2).split(' ').length, done: true }
          }
        } catch (e) {
          // 继续
        }
      }
    }
  }

  return { solution: '', steps: 0, done: false, failed: true }
}

// ===== PLL 求解器 =====

const PLL_FORMULAS = [
  'R U R\' F\' R U R\' U\' R\' F R2 U\' R\'', // T-Perm
  'R\' U L\' U2 R U\' R\' U2 R L', // U-Perm
  'M2 U M2 U2 M2 U M2', // H-Perm
  'R U\' R U R U R U\' R\' U\' R2', // U-Perm alt
  'R\' U R\' U\' R\' U\' R\' U R U R2', // U-Perm alt2
]

function isPLLComplete(cube) {
  return cube.isSolved()
}

function solvePLL(cube) {
  if (isPLLComplete(cube)) {
    return { solution: '', steps: 0, done: true }
  }

  for (const formula of PLL_FORMULAS) {
    try {
      const testCube = new Cube(cube)
      testCube.move(formula)
      if (isPLLComplete(testCube)) {
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
        if (isPLLComplete(verifyCube)) {
          return { solution: u + ' ' + formula, steps: (u + ' ' + formula).split(' ').length, done: true }
        }
      } catch (e) {
        // 继续
      }
    }
  }

  return { solution: '', steps: 0, done: false, failed: true }
}

// ===== 完整 CFOP 求解 =====

function solveCFOP(cube, options = {}) {
  const { verbose = false, maxCrossDepth = 7 } = options

  const result = {
    scramble: '',
    cross: { solution: '', steps: 0 },
    f2l: { solution: '', steps: 0, details: {} },
    oll: { solution: '', steps: 0 },
    pll: { solution: '', steps: 0 },
    solution: '',
    totalSteps: 0,
    verified: false
  }

  const startTime = Date.now()

  // Cross
  if (verbose) console.log('[1/4] Cross...')
  const crossResult = solveCross(cube, maxCrossDepth)
  result.cross = crossResult

  if (crossResult.failed) {
    if (verbose) console.log('  ❌ Cross 求解失败')
    return { ...result, failed: 'Cross', verified: false }
  }

  if (verbose) console.log(`  ✅ ${crossResult.solution || '(已完成)'} (${crossResult.steps}步)`)

  // F2L
  if (verbose) console.log('[2/4] F2L...')
  const f2lResult = solveF2L(cube)
  result.f2l = f2lResult

  if (verbose) {
    for (const [slot, detail] of Object.entries(f2lResult.details)) {
      console.log(`  ${slot}: ${detail.done ? '✅' : '❌'} ${detail.solution || '-'}`)
    }
  }

  if (!f2lResult.allDone && f2lResult.steps === 0) {
    if (verbose) console.log('  ❌ F2L 求解失败')
    return { ...result, failed: 'F2L', verified: false }
  }

  if (verbose) console.log(`  ✅ (${f2lResult.steps}步)`)

  // OLL
  if (verbose) console.log('[3/4] OLL...')
  const ollResult = solveOLL(cube)
  result.oll = ollResult

  if (ollResult.failed) {
    if (verbose) console.log('  ❌ OLL 求解失败')
  } else {
    if (verbose) console.log(`  ✅ ${ollResult.solution || '(已完成)'} (${ollResult.steps}步)`)
  }

  // PLL
  if (verbose) console.log('[4/4] PLL...')
  const pllResult = solvePLL(cube)
  result.pll = pllResult

  if (pllResult.failed) {
    if (verbose) console.log('  ❌ PLL 求解失败')
  } else {
    if (verbose) console.log(`  ✅ ${pllResult.solution || '(已完成)'} (${pllResult.steps}步)`)
  }

  // 验证
  result.verified = cube.isSolved()
  result.solution = [result.cross.solution, result.f2l.solution, result.oll.solution, result.pll.solution]
    .filter(s => s)
    .join(' ')
  result.totalSteps = result.solution.split(' ').length
  result.elapsed = Date.now() - startTime

  return result
}

// ===== 导出 =====

module.exports = {
  solveCFOP,
  solveCross,
  solveF2L,
  solveOLL,
  solvePLL,
  isF2LSlotComplete,
  isOLLComplete,
  isPLLComplete
}
