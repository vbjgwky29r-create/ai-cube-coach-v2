/**
 * 完整CFOP求解器 - 修复版本
 *
 * 修复Cross检查bug：正确检查十字的4个棱块位置
 */

const Cube = require('cubejs')
const fs = require('fs')
const path = require('path')
const f2lPermutation = require('./f2l-solver-permutation.js')

// ============================================================
// Cross求解器 - 修复版
// ============================================================

function solveCross(cube, maxDepth = 7) {
  // Robust cross check via cubejs permutation/orientation arrays.
  // Edge indices: DR=4, DF=5, DL=6, DB=7.
  function checkComplete(c) {
    const state = c.toJSON()
    const dEdges = [4, 5, 6, 7]
    return dEdges.every(pos => state.ep[pos] === pos && state.eo[pos] === 0)
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

// ============================================================
// F2L求解器 - 使用V2验证驱动
// ============================================================

const SLOT_INDICES = {
  'FR': [29, 26, 15, 12, 23],
  'FL': [27, 44, 24, 40, 21],
  'BL': [33, 42, 53, 48, 39],
  'BR': [35, 51, 17, 50, 14],
}

const SLOT_COLORS = {
  'FR': { corner: ['D', 'F', 'R'], edge: ['F', 'R'] },
  'FL': { corner: ['D', 'F', 'L'], edge: ['F', 'L'] },
  'BL': { corner: ['D', 'B', 'L'], edge: ['B', 'L'] },
  'BR': { corner: ['D', 'B', 'R'], edge: ['B', 'R'] },
}

function isSlotComplete(stateStr, slot) {
  const idx = SLOT_INDICES[slot]
  const colors = SLOT_COLORS[slot]

  const corner = stateStr[idx[0]] + stateStr[idx[1]] + stateStr[idx[2]]
  const edge = stateStr[idx[3]] + stateStr[idx[4]]

  return corner.split('').sort().join('') === colors.corner.sort().join('') &&
         edge.split('').sort().join('') === colors.edge.sort().join('') &&
         stateStr[idx[0]] === 'D'  // 角块D面朝下
}

function isCrossIntact(stateStr) {
  // 检查Cross的4个棱块是否完好
  return stateStr[28] === 'D' && stateStr[19] === 'F' &&  // DF
         stateStr[30] === 'D' && stateStr[37] === 'L' &&  // DL
         stateStr[34] === 'D' && stateStr[10] === 'R' &&  // DR
         stateStr[32] === 'D' && stateStr[46] === 'B'     // DB
}

function checkGoal(cube, slot) {
  const s = cube.asString()
  return isSlotComplete(s, slot) && isCrossIntact(s)
}

// ============================================================
// 完整F2L公式库
// ============================================================

const F2L_FORMULAS = {
  'FR': [
    "R U R'", "R U R' U' R' U R", "R U' R' U R U' R'", "R' U R U' R' U' R",
    "R' U' R U R U R'", "U' R U R'", "U R U' R'", "U R U' R' U' R U R'",
    "R' U' R U R U R'", "R U R'", "U R U' R' U2 R U' R'", "R' U2 R U R' U' R",
    "U' R U R' U2 R U' R'", "U' R U' R' U R U R'", "R U' R' U2 R U R'",
    "U R U2 R' U' R U R'", "U' R U R' U R U' R'", "U' F' U F U R U' R'",
    "U2 R U R' U R U' R'", "U2 R U' R' U' R U R'", "U F R' F' R U' R U R'",
    "U R U' R' U' R U R'", "U' R' U R U' R' U R", "R U R' U' R U R' U' R U R'",
    "R U' R' U R U' R'", "U R U' R' U' R U R'", "R U' R' U2 R U' R' U R U' R'",
    "R U' R' U R U' R'", "U' R U' R' U R U R'", "U R U' R' U R U' R'",
    "U R U' R' U' R U R'", "U2 R U' R' U R U' R'", "U' F' U F U R U' R'",
    "U R U' R' U' R U' R' U R U' R'", "R U' R' U' R U R' U' R U R'",
    "R U R' F R' F' R U R'", "R U R' U' R U R' U' R U R'",
    "U' R' U R U' R' U R", "R U R' U' R U R' U' R U R'", "R U' R' U R U' R'",
    "U R U' R' U' R U R'", "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'",
    "U' R' U R U' R' U R", "U R U' R' U' R U' R' U R U' R'", "R U R' U' R U R' U' R U R'",
    // 翻转修正
    "R U R' U' R U' R' U2 R U R'", "R U' R' U2 R U' R' U' R U R'"
  ],
  'FL': [
    "L' U' L", "U L' U' L", "U' L' U L", "U L' U L U' L' U L",
    "L U L' U' L' U' L", "L' U' L", "U' L' U L U2 L' U L", "L U2 L' U' L U L'",
    "U L' U' L U2 L' U L", "U L' U L U' L' U' L", "L' U L U2 L' U' L",
    "U' L' U2 L U L' U' L'", "U L' U' L U' L' U L", "U' L' U2 L U' L' U L",
    "L' U' L U L' U' L", "U2 L' U L U L' U' L'", "U' L' U L U' L' U L",
    "U F U' F' U' L' U L", "U2 L' U' L U' L' U L", "U2 L' U L U L' U' L'",
    "U' F' L F L' U L' U' L'", "U' L' U L U L' U' L'", "U L U' L' U L U' L'",
    "L' U' L U L' U' L U L' U' L'", "L' U L U' L' U L", "U' L' U L U L' U' L",
    "L' U L U2 L' U L U' L' U L", "L' U L U' L' U L", "U L' U L U' L' U' L",
    "U' L' U L U' L' U L", "U' L' U L U L' U' L'", "U2 L' U L U' L' U L",
    "U F U' F' U' L' U L", "U' L' U L U L' U L U' L' U L", "L' U L U L' U' L U L' U' L'",
    "L' U' L F' L F L' U' L'", "L' U' L U L' U' L U L' U' L'",
    "U L U' L' U L U' L'", "L' U' L U L' U' L U L' U' L'", "L' U L U' L' U L",
    "U' L' U L U L' U' L'", "L' U L U2 L' U L U' L' U L", "L' U L U' L' U L",
    "U L' U L U' L' U' L", "U' L' U' L U L' U L U' L' U L", "L' U' L U L' U' L U L' U' L'",
    // 翻转修正
    "L' U' L U L' U L' U2 L' U' L", "L' U L U2 L' U L U L' U' L"
  ],
  'BL': [
    "L U L'", "U' L U' L'", "U L U' L'", "U' L U' L' U L U L'",
    "L' U' L U L U L", "L U L'", "U L' U L' U' L U L'", "L' U2 L U' L' U L",
    "U' L U' L' U2 L U' L'", "U' L' U L U L' U L", "L' U' L U2 L' U' L",
    "U L' U2 L' U L' U L", "U' L U' L' U L U' L'", "U L' U2 L' U' L' U L",
    "L' U L' U' L' U L", "U2 L' U' L U L' U L", "U L' U L' U' L U L",
    "U' F U' F' U' L U L'", "U2 L' U L' U' L U L'", "U2 L' U' L' U L' U L",
    "U F' L' F L U L' U L", "U' L U' L' U' L' U L", "U' L U L' U' L U L",
    "L' U L' U' L' U L U' L U L'", "L' U' L U' L' U L", "U' L' U L U L' U' L",
    "L' U' L U2 L' U' L U' L' U L", "L' U' L U' L' U L", "U L' U' L U L' U L",
    "U' L' U L U' L' U L", "U' L' U L U L' U' L'", "U2 L' U L U' L' U L",
    "U F' U' F U' L U L'", "U' L' U L U L' U L U' L' U L", "L' U L U L' U' L U L' U' L'",
    "L' U' L F' L' F L' U L", "L' U' L U L' U' L U L' U' L'",
    "U L' U' L U L' U L'", "L' U' L U L' U' L U L' U' L'", "L' U L' U' L' U L",
    "U' L' U L U L' U' L'", "L' U L U2 L' U L U' L' U L", "L' U' L U' L' U L",
    "U L' U' L U L' U L", "U' L' U' L U L' U L U L' U L", "L' U' L U L' U' L U L' U' L'",
    // 翻转修正
    "L U L' U' L' U' L U2 L' U L'", "L' U2 L U' L U L' U L'"
  ],
  'BR': [
    "R' U' R", "U R' U' R", "U' R' U R", "U R' U' R U' R U' R'",
    "R' U R U' R' U R", "R' U' R", "U' R U' R' U2 R' U R", "R U2 R' U' R U R'",
    "U R' U' R U2 R' U R", "U R U R' U' R' U' R", "R' U R U2 R' U R",
    "U' R U2 R' U R' U' R", "U R' U' R U R' U' R", "U' R U2 R' U R' U' R",
    "R' U R U' R' U R", "U2 R' U R U' R' U' R", "U' R U' R' U R' U' R",
    "U' F U F' U R' U' R", "U2 R' U' R U R' U' R", "U2 R' U R U R' U' R",
    "U' F R F' R' U' R' U R", "U R' U' R U' R' U' R", "U R' U' R U R' U' R",
    "R U' R U R U' R' U R U' R'", "R U' R' U R U' R'", "U' R U R' U' R' U R",
    "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'", "U' R U R' U' R' U' R",
    "U R U' R' U R' U' R", "U R U' R' U' R' U' R", "U2 R' U R' U R' U' R",
    "U' F U F' U R' U' R", "U R U' R' U' R' U R' U' R U' R'", "R U R' U R U' R' U R U' R'",
    "R U' R F R F' R U' R'", "R U' R' U R U' R' U R U' R'",
    "U R' U' R U R' U' R", "R U' R U R U' R' U R U' R'", "R U' R' U R U' R'",
    "U' R U R' U' R' U R", "U R U' R' U' R' U R' U' R U' R'", "R U' R U R U' R' U R U' R'",
    "R U' R' U2 R U' R' U R U' R'", "R U' R' U R U' R'", "U' R U R' U' R' U' R",
    "U R' U' R U R' U' R", "U R U' R' U' R' U' R", "U2 R' U R' U R' U' R",
    "U' F U F' U R' U' R", "U R U' R' U' R' U R' U' R U' R'", "R U R' U R U' R' U R U' R'",
    // 翻转修正
    "R' U' R U R' U R U2 R' U' R'", "R U' R' U R U2 R' U' R'"
  ]
}

const SETUP_MOVES = {
  'FR': ['R U R\'', 'R\' U\' R', 'R U2 R\'', 'R\' U2 R'],
  'FL': ['L\' U\' L', 'L U L\'', 'L\' U2 L', 'L U2 L\''],
  'BL': ['L U L\'', 'L\' U\' L', 'L U2 L\'', 'L\' U2 L'],
  'BR': ['R\' U\' R', 'R U R\'', 'R\' U2 R', 'R U2 R\''],
}

function tryFormula(cube, slot, setup, formula) {
  const test = new Cube(cube)
  try {
    if (setup) test.move(setup)
    test.move(formula)
  } catch (e) {
    return null
  }
  if (checkGoal(test, slot)) return formula
  return null
}

function solveSlot(cube, slot, verbose = false) {
  if (checkGoal(cube, slot)) {
    if (verbose) console.log(`    ${slot}: 已完成 ✅`)
    return { solution: '', steps: 0, done: true }
  }

  // 直接尝试
  for (const formula of F2L_FORMULAS[slot]) {
    const result = tryFormula(cube, slot, '', formula)
    if (result) {
      if (verbose) console.log(`      ✅ ${result}`)
      return { solution: result, steps: result.split(' ').length, done: true }
    }
  }

  // U调整
  for (const u of ['U', "U'", 'U2']) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, u, formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${u} + ${formula}`)
        return { solution: u + ' ' + formula, steps: (u + ' ' + formula).split(' ').length, done: true }
      }
    }
  }

  // Setup
  for (const setup of SETUP_MOVES[slot]) {
    for (const formula of F2L_FORMULAS[slot]) {
      const result = tryFormula(cube, slot, setup, formula)
      if (result) {
        if (verbose) console.log(`      ✅ ${setup} + ${formula}`)
        return { solution: setup + ' ' + formula, steps: (setup + ' ' + formula).split(' ').length, done: true }
      }
    }
    for (const u of ['U', "U'", 'U2']) {
      for (const formula of F2L_FORMULAS[slot]) {
        const result = tryFormula(cube, slot, setup + ' ' + u, formula)
        if (result) {
          if (verbose) console.log(`      ✅ ${setup} + ${u} + ${formula}`)
          return { solution: setup + ' ' + u + ' ' + formula, steps: (setup + ' ' + u + ' ' + formula).split(' ').length, done: true }
        }
      }
    }
  }

  if (verbose) console.log(`      ❌ 未找到公式`)
  return { solution: '', steps: 0, done: false }
}

function solveF2L(cube, options = {}) {
  const { verbose = false, f2l = {} } = options
  const result = f2lPermutation.solveF2L(cube, f2l)
  const status = f2lPermutation.checkF2LStatus(cube)
  const crossIntact = typeof f2lPermutation.isCrossSolved === 'function'
    ? !!f2lPermutation.isCrossSolved(cube)
    : isCrossIntact(cube.asString())
  const strictAllDone = Object.values(status).every(Boolean) && crossIntact
  const details = {
    FR: { done: !!status.FR, solution: result.slots?.FR?.solution || '' },
    FL: { done: !!status.FL, solution: result.slots?.FL?.solution || '' },
    BL: { done: !!status.BL, solution: result.slots?.BL?.solution || '' },
    BR: { done: !!status.BR, solution: result.slots?.BR?.solution || '' },
  }

  if (verbose) console.log('  F2L status:', status)

  return {
    solution: (result.solution || '').trim(),
    steps: (result.solution || '').trim().split(' ').filter(Boolean).length,
    details,
    allDone: strictAllDone,
    crossIntact,
    slotHistory: result.slotHistory || [],
    roundScores: result.roundScores || [],
    rawSlots: result.slots || {}
  }
}
function extractAlgorithmsFromTs(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8')
    const matches = [...text.matchAll(/algorithm:\s*"([^"]+)"/g)]
    return [...new Set(matches.map(m => m[1].trim()).filter(Boolean))]
  } catch {
    return []
  }
}

function extractAlgorithmsFromMaster(category) {
  try {
    const filePath = path.join(__dirname, 'formulas.ts')
    const text = fs.readFileSync(filePath, 'utf8')
    const rx = category === 'OLL'
      ? /notation:\s*"([^"]+)"[\s\S]{0,220}?category:\s*FormulaCategory\.OLL/g
      : /notation:\s*"([^"]+)"[\s\S]{0,220}?category:\s*FormulaCategory\.PLL/g
    const matches = [...text.matchAll(rx)]
    return [...new Set(matches.map(m => m[1].trim()).filter(Boolean))]
  } catch {
    return []
  }
}

function isFirstTwoLayersSolved(cube) {
  const s = cube.asString()
  const face = (offset) => s.substring(offset, offset + 9)
  const U = face(0), R = face(9), F = face(18), D = face(27), L = face(36), B = face(45)
  const dSolved = D === 'DDDDDDDDD'
  const sideOK =
    R.substring(3, 9) === 'RRRRRR' &&
    F.substring(3, 9) === 'FFFFFF' &&
    L.substring(3, 9) === 'LLLLLL' &&
    B.substring(3, 9) === 'BBBBBB'
  return dSolved && sideOK && U.length === 9
}

function countUOnTop(cube) {
  return cube.asString().substring(0, 9).split('').filter(ch => ch === 'U').length
}

function areUEdgesOriented(cube) {
  const U = cube.asString().substring(0, 9)
  const edgeIdx = [1, 3, 5, 7]
  return edgeIdx.every(i => U[i] === 'U')
}

function searchByIDDFS(startCube, isGoal, {
  moves,
  maxDepth = 10,
  maxNodes = 500000
}) {
  let nodes = 0

  function dfs(cube, depthLeft, lastFace, path, seen) {
    nodes++
    if (nodes > maxNodes) return null

    if (isGoal(cube)) return path.join(' ')
    if (depthLeft === 0) return null

    const key = `${cube.asString()}|${depthLeft}`
    if (seen.has(key)) return null
    seen.add(key)

    for (const move of moves) {
      const face = move[0]
      if (lastFace && face === lastFace) continue

      const next = new Cube(cube)
      next.move(move)
      path.push(move)
      const found = dfs(next, depthLeft - 1, face, path, seen)
      if (found !== null) return found
      path.pop()
    }
    return null
  }

  for (let d = 1; d <= maxDepth; d++) {
    const found = dfs(new Cube(startCube), d, '', [], new Set())
    if (found !== null) return found
  }
  return null
}
// ============================================================
// OLL/PLL（简单版）
// ============================================================

function solveOLL(cube, options = {}) {
  const { enableSearchFallback = true, searchMaxDepth = 12, searchMaxNodes = 5000000 } = options
  const isUOriented = (c) => c.asString().substring(0, 9).split('').every(x => x === 'U')
  if (isUOriented(cube)) {
    return { solution: '', steps: 0, done: true }
  }

  const AUF = ['', 'U', "U'", 'U2']
  const ollAlgorithms = [
    ...extractAlgorithmsFromMaster('OLL'),
    ...extractAlgorithmsFromTs(path.join(__dirname, 'oll-formulas.ts')),
  ]

  for (const pre of AUF) {
    for (const alg of ollAlgorithms) {
      const seq = [pre, alg].filter(Boolean).join(' ')
      if (!seq) continue
      try {
        const test = new Cube(cube)
        test.move(seq)
        if (isUOriented(test) && isFirstTwoLayersSolved(test)) {
          return { solution: seq, steps: seq.split(' ').filter(Boolean).length, done: true }
        }
      } catch {}
    }
  }

  // Deterministic 2-look OLL fallback:
  // 1) orient U edges (cross), 2) orient U corners (Sune/Anti-Sune).
  const twoLookSteps = []
  const edgeAlg = "F R U R' U' F'"
  let edgeGuard = 0
  while (!areUEdgesOriented(cube) && edgeGuard < 8) {
    let progressed = false
    for (const pre of AUF) {
      const seq = [pre, edgeAlg].filter(Boolean).join(' ')
      const test = new Cube(cube)
      try {
        test.move(seq)
      } catch {
        continue
      }
      if (areUEdgesOriented(test) || countUOnTop(test) > countUOnTop(cube)) {
        cube.move(seq)
        if (seq) twoLookSteps.push(seq)
        progressed = true
        break
      }
    }
    if (!progressed) break
    edgeGuard++
  }

  const sune = "R U R' U R U2 R'"
  const antiSune = "R U2 R' U' R U' R'"
  let cornerGuard = 0
  while (!isUOriented(cube) && cornerGuard < 12) {
    let progressed = false
    for (const pre of AUF) {
      for (const alg of [sune, antiSune]) {
        const seq = [pre, alg].filter(Boolean).join(' ')
        const test = new Cube(cube)
        try {
          test.move(seq)
        } catch {
          continue
        }
        if (isUOriented(test) || countUOnTop(test) > countUOnTop(cube)) {
          cube.move(seq)
          if (seq) twoLookSteps.push(seq)
          progressed = true
          break
        }
      }
      if (progressed) break
    }
    if (!progressed) break
    cornerGuard++
  }

  if (isUOriented(cube) && isFirstTwoLayersSolved(cube)) {
    const seq = twoLookSteps.join(' ').trim()
    return {
      solution: seq,
      steps: seq ? seq.split(' ').filter(Boolean).length : 0,
      done: true,
      method: '2look_fallback',
    }
  }

  // Macro BFS fallback for OLL:
  // search over AUF + edge/sune macros while preserving first two layers.
  const macros = [
    "F R U R' U' F'",
    "R U R' U R U2 R'",
    "R U2 R' U' R U' R'",
  ]
  const macroAuff = ['', 'U', "U'", 'U2']
  const macroSeqs = []
  for (const pre of macroAuff) {
    for (const m of macros) {
      for (const post of macroAuff) {
        const seq = [pre, m, post].filter(Boolean).join(' ')
        if (seq) macroSeqs.push(seq)
      }
    }
  }
  const uniqMacroSeqs = [...new Set(macroSeqs)]
  const seen = new Set([cube.asString()])
  const queue = [{ cube: new Cube(cube), seq: '' }]
  const maxMacroDepth = 3
  while (queue.length > 0) {
    const cur = queue.shift()
    if (!cur) break
    const depth = cur.seq ? cur.seq.split(' | ').length : 0
    if (isUOriented(cur.cube) && isFirstTwoLayersSolved(cur.cube)) {
      const flat = cur.seq.split(' | ').join(' ').trim()
      return {
        solution: flat,
        steps: flat ? flat.split(' ').filter(Boolean).length : 0,
        done: true,
        method: 'macro_bfs_fallback',
      }
    }
    if (depth >= maxMacroDepth) continue
    for (const m of uniqMacroSeqs) {
      const next = new Cube(cur.cube)
      try {
        next.move(m)
      } catch {
        continue
      }
      if (!isFirstTwoLayersSolved(next)) continue
      const key = next.asString()
      if (seen.has(key)) continue
      seen.add(key)
      queue.push({
        cube: next,
        seq: cur.seq ? `${cur.seq} | ${m}` : m,
      })
    }
  }

  // Search fallback: orient U face while keeping first two layers solved.
  if (enableSearchFallback) {
    const searchMoves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'L', "L'", 'L2', 'B', "B'", 'B2']
    const searchSolution = searchByIDDFS(
      cube,
      (c) => isUOriented(c) && isFirstTwoLayersSolved(c),
      { moves: searchMoves, maxDepth: searchMaxDepth, maxNodes: searchMaxNodes }
    )
    if (searchSolution !== null) {
      return {
        solution: searchSolution,
        steps: searchSolution.split(' ').filter(Boolean).length,
        done: true,
        method: 'search_fallback',
      }
    }
  }

  return { solution: '', steps: 0, done: false, failed: true }
}

function solvePLL(cube, options = {}) {
  const {
    enableSearchFallback = true,
    searchMaxDepth = 14,
    searchMaxNodes = 8000000,
    enableMultiStageFallback = false,
  } = options
  if (cube.isSolved()) {
    return { solution: '', steps: 0, done: true }
  }

  const PLL_CASES = [
    // Edges only
    { id: 'Ua', category: 'edges', subgroup: '3e', subgroupZh: '三棱换', alg: "R U' R U R U R U' R' U' R2" },
    { id: 'Ub', category: 'edges', subgroup: '3e', subgroupZh: '三棱换', alg: "R2 U R U R' U' R' U' R' U R'" },
    { id: 'H', category: 'edges', subgroup: '4e', subgroupZh: '四棱换', alg: "M2 U M2 U2 M2 U M2" },
    { id: 'Z', category: 'edges', subgroup: '4e', subgroupZh: '四棱换', alg: "M2 U M2 U M' U2 M2 U2 M'" },
    // Corners only
    { id: 'Aa', category: 'corners', subgroup: '3c', subgroupZh: '三角换', alg: "x R' U R' D2 R U' R' D2 R2 x'" },
    { id: 'Ab', category: 'corners', subgroup: '3c', subgroupZh: '三角换', alg: "x R2 D2 R U R' D2 R U' R x'" },
    { id: 'E', category: 'corners', subgroup: '4c', subgroupZh: '四角换', alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x" },
    // Both corners and edges
    { id: 'T', category: 'both', subgroup: '2c2e_a', subgroupZh: '两角换+两棱换', alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
    { id: 'Jb', category: 'both', subgroup: '2c2e_a', subgroupZh: '两角换+两棱换', alg: "R U R' F' R U R' U' R' F R2 U' R'" },
    { id: 'Ja', category: 'both', subgroup: '2c2e_a', subgroupZh: '两角换+两棱换', alg: "R' U L' U2 R U' R' U2 R L" },
    { id: 'Ra', category: 'both', subgroup: '2c2e_a', subgroupZh: '两角换+两棱换', alg: "R U' R' U' R U R D R' U' R D' R' U2 R'" },
    { id: 'Rb', category: 'both', subgroup: '2c2e_a', subgroupZh: '两角换+两棱换', alg: "R2 F R U R U' R' F' R U2 R' U2 R U' R'" },
    { id: 'F', category: 'both', subgroup: '2c2e_a', subgroupZh: '两角换+两棱换', alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
    { id: 'Y', category: 'both', subgroup: '2c2e_b', subgroupZh: '两角换+两棱换', alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
    { id: 'V', category: 'both', subgroup: '2c2e_b', subgroupZh: '两角换+两棱换', alg: "R' U R' U' y R' F' R2 U' R' U R' F R F y'" },
    { id: 'Na', category: 'both', subgroup: 'diag_mix', subgroupZh: '斜向角棱混换', alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
    { id: 'Nb', category: 'both', subgroup: 'diag_mix', subgroupZh: '斜向角棱混换', alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
    { id: 'Ga', category: 'both', subgroup: '3c3e', subgroupZh: '三角换+三棱换', alg: "R2 U R' U R' U' R U' R2 D U' R' U R D'" },
    { id: 'Gb', category: 'both', subgroup: '3c3e', subgroupZh: '三角换+三棱换', alg: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
    { id: 'Gc', category: 'both', subgroup: '3c3e', subgroupZh: '三角换+三棱换', alg: "R2 U' R U' R U R' U R2 D' U R U' R' D" },
    { id: 'Gd', category: 'both', subgroup: '3c3e', subgroupZh: '三角换+三棱换', alg: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
  ]

  function pllCategoryByPermutation(c) {
    const s = c.toJSON()
    const uCornersSolved = [0, 1, 2, 3].every(pos => s.cp[pos] === pos)
    const uEdgesSolved = [0, 1, 2, 3].every(pos => s.ep[pos] === pos)
    if (!uCornersSolved && uEdgesSolved) return 'corners'
    if (uCornersSolved && !uEdgesSolved) return 'edges'
    return 'both'
  }

  const AUF = ['', 'U', "U'", 'U2']

  // 1) Shape-first single-PLL solve: choose candidate pool by permutation category.
  const category = pllCategoryByPermutation(cube)
  const categoryCases = PLL_CASES.filter(x => x.category === category)
  const preferredCases = [...categoryCases, ...PLL_CASES.filter(x => x.category !== category)]

  let bestSingle = null
  for (const pre of AUF) {
    for (const entry of preferredCases) {
      for (const post of AUF) {
        const seq = [pre, entry.alg, post].filter(Boolean).join(' ')
        if (!seq) continue
        try {
          const test = new Cube(cube)
          test.move(seq)
          if (test.isSolved()) {
            const candidate = {
              solution: seq,
              steps: seq.split(' ').filter(Boolean).length,
              done: true,
              method: `single_${entry.id}`,
              caseId: entry.id,
              category,
              subgroup: entry.subgroup || '',
              subgroupZh: entry.subgroupZh || '',
              labelZh: `${entry.id}（${entry.subgroupZh || '未分组'}）`,
            }
            if (!bestSingle || candidate.steps < bestSingle.steps) {
              bestSingle = candidate
            }
          }
        } catch {}
      }
    }
  }
  if (bestSingle) return bestSingle

  // Two-stage PLL fallback:
  // try one PLL algorithm to transform case, then a second to finish.
  const stagePllAlgs = PLL_CASES.map(x => x.alg)

  if (enableMultiStageFallback) {
    for (const pre1 of AUF) {
      for (const a1 of stagePllAlgs) {
        for (const post1 of AUF) {
          const seq1 = [pre1, a1, post1].filter(Boolean).join(' ')
          const mid = new Cube(cube)
          try {
            if (seq1) mid.move(seq1)
          } catch {
            continue
          }
          if (mid.isSolved()) {
            return { solution: seq1, steps: seq1.split(' ').filter(Boolean).length, done: true, method: '2stage_fallback' }
          }

          for (const pre2 of AUF) {
            for (const a2 of stagePllAlgs) {
              for (const post2 of AUF) {
                const seq2 = [pre2, a2, post2].filter(Boolean).join(' ')
                const test = new Cube(mid)
                try {
                  if (seq2) test.move(seq2)
                } catch {
                  continue
                }
                if (test.isSolved()) {
                  const full = [seq1, seq2].filter(Boolean).join(' ')
                  return {
                    solution: full,
                    steps: full.split(' ').filter(Boolean).length,
                    done: true,
                    method: '2stage_fallback',
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Search fallback: solve cube while preserving first two layers.
  if (enableSearchFallback) {
    const searchMoves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'L', "L'", 'L2', 'B', "B'", 'B2']
    const searchSolution = searchByIDDFS(
      cube,
      (c) => c.isSolved() && isFirstTwoLayersSolved(c),
      { moves: searchMoves, maxDepth: searchMaxDepth, maxNodes: searchMaxNodes }
    )
    if (searchSolution !== null) {
      return {
        solution: searchSolution,
        steps: searchSolution.split(' ').filter(Boolean).length,
        done: true,
        method: 'search_fallback',
      }
    }
  }

  return { solution: '', steps: 0, done: false, failed: true }
}
// ============================================================
// 完整CFOP
// ============================================================

function runCFOPOnce(cube, options = {}) {
  const { verbose = false, crossMaxDepth = 7, f2l = {}, oll = {}, pll = {} } = options
  const result = {
    cross: {}, f2l: {}, oll: {}, pll: {},
    solution: '', totalSteps: 0, verified: false
  }

  const startTime = Date.now()

  // Cross
  if (verbose) console.log('[1/4] Cross...')
  result.cross = solveCross(cube, crossMaxDepth)
  if (verbose) console.log(`  ${result.cross.failed ? '❌' : '✅'} ${result.cross.solution}`)

  if (result.cross.failed) {
    return { ...result, failed: 'Cross' }
  }
  if (result.cross.solution) {
    cube.move(result.cross.solution)
  }

  // F2L
  if (verbose) console.log('[2/4] F2L...')
  const f2lResult = solveF2L(cube, { verbose, f2l })
  result.f2l = f2lResult
  if (verbose) console.log(`  ${f2lResult.allDone ? '✅' : '⚠️'} (${f2lResult.steps}步)`)
  if (!f2lResult.allDone) {
    result.verified = false
    result.failed = 'F2L'
    result.solution = [result.cross.solution, result.f2l.solution].filter(Boolean).join(' ')
    result.totalSteps = result.solution ? result.solution.split(' ').filter(Boolean).length : 0
    result.elapsed = Date.now() - startTime
    return result
  }

  // OLL
  if (verbose) console.log('[3/4] OLL...')
  result.oll = solveOLL(cube, oll)
  if (result.oll.failed) {
    if (verbose) console.log('  ❌ OLL失败')
  } else {
    if (verbose && result.oll.solution) console.log(`  ✅ ${result.oll.solution}`)
    if (result.oll.solution) cube.move(result.oll.solution)
  }

  // PLL
  if (verbose) console.log('[4/4] PLL...')
  result.pll = solvePLL(cube, pll)
  if (result.pll.failed) {
    if (verbose) console.log('  ❌ PLL失败')
  } else {
    if (verbose && result.pll.solution) console.log(`  ✅ ${result.pll.solution}`)
    if (result.pll.solution) cube.move(result.pll.solution)
  }

  result.verified = cube.isSolved()
  result.solution = [result.cross.solution, result.f2l.solution, result.oll.solution, result.pll.solution]
    .filter(s => s).join(' ')
  result.totalSteps = result.solution.split(' ').length
  result.elapsed = Date.now() - startTime

  return result
}

function solveCFOP(cube, options = {}) {
  const {
    verbose = false,
    crossMaxDepth = 7,
    f2l = {},
    oll = {},
    pll = {},
    stepBudget = 65,
    enableQualityRetry = true,
  } = options

  const original = new Cube(cube)
  const rotational = runCFOPOnce(new Cube(original), {
    verbose,
    crossMaxDepth,
    f2l: { rotationSlots: 3, ...f2l },
    oll,
    pll,
  })

  let best = rotational
  const needConservative = !best.verified || best.totalSteps > stepBudget
  if (needConservative) {
    const conservative = runCFOPOnce(new Cube(original), {
      verbose,
      crossMaxDepth,
      f2l: { rotationSlots: 0, ...f2l },
      oll,
      pll,
    })
    if (!best.verified && conservative.verified) {
      best = conservative
    } else if (best.verified && conservative.verified && conservative.totalSteps < best.totalSteps) {
      best = conservative
    }
  }

  if (enableQualityRetry && best.verified && best.totalSteps > stepBudget) {
    const compact = runCFOPOnce(new Cube(original), {
      verbose,
      crossMaxDepth,
      f2l: {
        maxRounds: 8,
        quickDepth: 7,
        quickNodes: 80000,
        slotIter: 12,
        frblDepth: 9,
        flbrDepth: 9,
        slotNodes: 6000000,
        globalFallbackDepth: 11,
        globalFallbackNodes: 5000000,
        deepSlotPasses: 1,
      },
      oll: { ...oll, enableSearchFallback: false },
      pll: { ...pll, enableSearchFallback: true, searchMaxDepth: 8, searchMaxNodes: 1200000 },
    })
    if (compact.verified && compact.totalSteps < best.totalSteps) {
      best = compact
    }
  }

  best.quality = {
    stepBudget,
    withinBudget: best.verified && best.totalSteps <= stepBudget,
  }
  return best
}

module.exports = {
  solveCFOP,
  solveCross,
  solveF2L,
  solveOLL,
  solvePLL,
  isSlotComplete,
  isCrossIntact
}


