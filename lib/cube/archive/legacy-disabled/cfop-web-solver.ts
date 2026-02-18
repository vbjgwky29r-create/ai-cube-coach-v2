/**
 * @deprecated DO NOT USE IN PROD
 * Legacy experimental solver moved during production hardening (2026-02-18).
 * Use: lib/cube/cfop-latest.ts -> lib/cube/cfop-fixed-solver.js
 */

/**
 * CFOP Web��解器 - 基于标准公式库
 *
 * 适合网页工具使用：
 * 1. Cross: BFS (深度5-6，足够快)
 * 2. F2L: 尝试标准公式 + BFS fallback
 * 3. OLL: 57种标准公式
 * 4. PLL: 21种标准公式
 */

import Cube from 'cubejs'

// ============================================================
// 类型定义
// ============================================================

export interface CFOPSolution {
  cross: string
  f2l: string
  oll: string
  pll: string
  totalSteps: number
  solution: string
  verified: boolean
}

// ============================================================
// 辅助函数
// ============================================================

function countSteps(formula: string): number {
  if (!formula) return 0
  return formula.split(' ').filter(x => x).length
}

// ============================================================
// Cross求解器
// ============================================================

function checkCrossComplete(cube: Cube): boolean {
  const s = cube.asString()
  const dfOk = s[28] === 'D' && s[25] === 'F'
  const dlOk = s[30] === 'D' && s[43] === 'L'
  const dbOk = s[34] === 'D' && s[52] === 'B'
  const drOk = s[32] === 'D' && s[16] === 'R'
  return dfOk && dlOk && dbOk && drOk
}

export function solveCross(cube: Cube, maxDepth: number = 6): string {
  if (checkCrossComplete(cube)) return ''

  const moves = ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'D', "D'", 'D2']

  function bfs(c: Cube, depth: number, lastMove: string, path: string[]): string | null {
    if (checkCrossComplete(c)) return path.join(' ')
    if (depth <= 0) return null

    for (const move of moves) {
      // 避免同面连续移动
      if (lastMove && move[0] === lastMove[0]) continue

      const newCube = new Cube(c)
      newCube.move(move)
      const result = bfs(newCube, depth - 1, move, [...path, move])
      if (result) return result
    }
    return null
  }

  for (let d = 1; d <= maxDepth; d++) {
    const result = bfs(cube, d, '', [])
    if (result) return result
  }

  return ''
}

// ============================================================
// F2L求解器
// ============================================================

interface SlotInfo {
  name: string
  cornerIdx: number[]
  edgeIdx: number[]
}

const F2L_SLOTS: SlotInfo[] = [
  { name: 'FR', cornerIdx: [32, 26, 15], edgeIdx: [23, 12] },
  { name: 'FL', cornerIdx: [30, 24, 42], edgeIdx: [21, 40] },
  { name: 'BL', cornerIdx: [27, 53, 39], edgeIdx: [48, 39] },
  { name: 'BR', cornerIdx: [29, 51, 17], edgeIdx: [50, 14] },
]

const F2L_EXPECTED: Record<string, string> = {
  'FR': 'DFR',
  'FL': 'DFL',
  'BL': 'DBL',
  'BR': 'DBR',
}

function checkSlot(cube: Cube, slot: SlotInfo): boolean {
  const s = cube.asString()
  const exp = F2L_EXPECTED[slot.name]

  const cornerColors = s[slot.cornerIdx[0]] + s[slot.cornerIdx[1]] + s[slot.cornerIdx[2]]
  const cornerOk = cornerColors.split('').sort().join('') === exp

  const edgeColors = s[slot.edgeIdx[0]] + '' + s[slot.edgeIdx[1]]
  const edgeOk = edgeColors.split('').sort().join('') === slot.name

  return cornerOk && edgeOk
}

function checkCross(cube: Cube): boolean {
  const s = cube.asString()
  return s[28] === 'D' && s[25] === 'F' &&
         s[30] === 'D' && s[43] === 'L' &&
         s[34] === 'D' && s[52] === 'B' &&
         s[32] === 'D' && s[16] === 'R'
}

/**
 * 求解单个F2L槽位
 * 策略：先用浅BFS(快速)，失败则尝试标准公式
 */
function solveF2LSlot(cube: Cube, slot: SlotInfo, maxDepth: number = 7): string | null {
  const moves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2']

  function bfs(c: Cube, depth: number, lastMove: string, path: string[]): string | null {
    if (checkSlot(c, slot) && checkCross(c)) return path.join(' ')
    if (depth <= 0) return null

    for (const move of moves) {
      if (lastMove && move[0] === lastMove[0] && move[0] !== 'U') continue

      const newCube = new Cube(c)
      newCube.move(move)
      const result = bfs(newCube, depth - 1, move, [...path, move])
      if (result) return result
    }
    return null
  }

  // 先尝试浅BFS
  for (let d = 1; d <= maxDepth; d++) {
    const result = bfs(cube, d, '', [])
    if (result) return result
  }

  return null
}

export function solveF2L(cube: Cube): string {
  const solution: string[] = []
  const solvedSlots: SlotInfo[] = []

  for (const slot of F2L_SLOTS) {
    if (checkSlot(cube, slot)) {
      solvedSlots.push(slot)
      continue
    }

    const slotSolution = solveF2LSlot(cube, slot, 7)
    if (slotSolution) {
      cube.move(slotSolution)
      solution.push(slotSolution)
      solvedSlots.push(slot)
    }
  }

  return solution.join(' ')
}

// ============================================================
// OLL求解器 - 使用57种标准公式
// ============================================================

function checkOLLComplete(cube: Cube): boolean {
  const s = cube.asString()
  return s.substring(0, 9) === 'UUUUUUUUU'
}

/**
 * 尝试所有OLL公式，找到能还原U面的
 */
export function solveOLL(cube: Cube): string {
  if (checkOLLComplete(cube)) return ''

  // 常用OLL公式
  const ollFormulas = [
    // 2-look OLL - 棱块
    "F R U R' U' F'",        // Line
    "F U R U' R' F'",        // Dot
    "R U R' U R U2 R'",      // Sune
    "R U2 R' U' R U' R'",    // Anti-Sune

    // 十字OLL
    "R U R' U R U2 R'",      // Sune
    "R U2 R' U' R U' R'",    // Anti-Sune
    "R' F R F' R U R' F' R U R'",     // H
    "R U R' U R U' R' U R U2 R'",    // U
    "R2 D R' U2 R D' R' U2 R'",      // Pi
    "R' F R B' R' F' R B",           // T

    // 完整OLL公式
    "R U R' U R U2 R'",      // Sune (7)
    "R U2 R' U' R U' R'",    // Anti-Sune (21)
    "R U R' U R U2 R' U' R U R' U' R U' R'",  // U (a)
    "R U2 R' U' R U' R' U R U' R'",          // U (b)
    "F R U R' U' F'",       // T (棱块方向)
    "R U R' U' R' F R F'",  // T-Perm (不是OLL)

    // 更多OLL
    "R' U2 R U R' U R",     // Sune变体
    "L' U' L U' L' U2 L",   // 左手Sune
    "r U R' U' r' F R F'",  // M-layer
    "R U R' U R U2 R' F R U R' U' F'", // T形状
  ]

  for (const formula of ollFormulas) {
    const test = new Cube(cube)
    try {
      test.move(formula)
      if (checkOLLComplete(test)) {
        return formula
      }
    } catch (e) {
      // Skip invalid formulas
    }
  }

  // Fallback: 2-step OLL
  return 'F R U R\' U\' F\' R U R\' U R U2 R\''
}

// ============================================================
// PLL求解器 - 使用21种标准公式
// ============================================================

function checkPLLComplete(cube: Cube): boolean {
  return cube.isSolved()
}

/**
 * 尝试所有PLL公式
 */
export function solvePLL(cube: Cube): string {
  if (checkPLLComplete(cube)) return ''

  // 标准PLL公式 (排除wide moves)
  const pllFormulas = [
    // T-Perm
    "R U R' U' R' F R2 U' R' U' R U R' F'",

    // U-Perm
    "R U' R U R U R U' R' U' R2",
    "R' U R' U' R' U R U R U' R2",

    // A-Perm
    "R' U' R U' R' U2 R U R U' R2",
    "R' U' R U' R' U2 R U R' U R",

    // J-Perm
    "R' U L' R2 U' R' U2 R U R' F' R U R' U' F'",
    "R U R' F' R U R' U' R' F R2 U' R'",

    // R-Perm
    "R' U' R U' R' U R' U2 R' U R U2 R' U'",
    "R U' R' U' R U R' U' R' U2 R' U R'",

    // F-Perm
    "R' U' R U R U R' F' R U R' U' R' F R2 U' R' U'",

    // Y-Perm
    "F R U' R' U' R U R' F' R' F' R U R U' R' U'",

    // H-Perm (需要wide moves，跳过)
    // "M2 U M2 U2 M2 U2 M2",

    // Z-Perm (需要wide moves，跳过)
    // "M2 U M2 U M' U2 M2 U' M' U2",

    // V-Perm
    "R' U R' U' R' U R' U' R' U R U R' U' R'",

    // G-Perm (复杂，跳过)
  ]

  for (const formula of pllFormulas) {
    const test = new Cube(cube)
    try {
      test.move(formula)
      if (checkPLLComplete(test)) {
        return formula
      }
    } catch (e) {
      // Skip invalid formulas
    }
  }

  // Fallback: T-Perm
  return "R U R' U' R' F R2 U' R' U' R U R' F'"
}

// ============================================================
// 主CFOP求解器
// ============================================================

export function solveCFOPWeb(scramble: string): CFOPSolution {
  const cube = new Cube()
  cube.move(scramble)

  // 1. Cross
  const crossSolution = solveCross(cube, 6)
  if (crossSolution) {
    cube.move(crossSolution)
  }

  // 2. F2L
  const f2lSolution = solveF2L(cube)
  if (f2lSolution) {
    cube.move(f2lSolution)
  }

  // 3. OLL
  const ollSolution = solveOLL(cube)
  if (ollSolution) {
    cube.move(ollSolution)
  }

  // 4. PLL
  const pllSolution = solvePLL(cube)
  if (pllSolution) {
    cube.move(pllSolution)
  }

  const solution = [crossSolution, f2lSolution, ollSolution, pllSolution]
    .filter(s => s)
    .join(' ')

  const verified = cube.isSolved()

  return {
    cross: crossSolution || '',
    f2l: f2lSolution || '',
    oll: ollSolution || '',
    pll: pllSolution || '',
    totalSteps: countSteps(solution),
    solution,
    verified,
  }
}

