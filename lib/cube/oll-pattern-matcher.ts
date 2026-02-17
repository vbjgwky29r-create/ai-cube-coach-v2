/**
 * OLL 识别器 - 基于 Pattern 匹配
 *
 * 核心思路：
 * 1. 从已还原状态开始，应用公式的逆序生成 OLL case 的 pattern
 * 2. 识别时用实际状态与 pattern 库匹配
 * 3. 支持旋转归一化（y/y'/y2）
 *
 * cubejs asString 格式: U(0-8) R(9-17) F(18-26) D(27-35) L(36-44) B(45-53)
 */

import Cube from 'cubejs'
import { ALL_OLL_CASES } from './oll-formulas'
import type { OLLCase } from './oll-formulas'

// ============================================================
// 类型定义
// ============================================================

export interface OLLPattern {
  id: string
  name: string
  category: string
  pattern: string        // 21位pattern: U面9片 + F/R/B/L上排各3片
  algorithm: string
}

export interface OLLMatch {
  case: OLLCase
  pattern: OLLPattern
  rotation: string       // 需要应用的旋转（'', 'y', "y'", 'y2'）
  confidence: number
}

// ============================================================
// Pattern 提取
// ============================================================

/**
 * 提取顶层 pattern（U面 + 侧面关键位置）
 */
const U_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const SIDE_TOP_INDICES = [
  18, 19, 20,  // F 上排
  9, 10, 11,   // R 上排
  45, 46, 47,  // B 上排
  36, 37, 38,  // L 上排
]

const PATTERN_INDICES = [...U_INDICES, ...SIDE_TOP_INDICES]

export function extractOLLPattern(stateStr: string): string {
  return PATTERN_INDICES.map(i => stateStr[i]).join('')
}

// ============================================================
// 公式逆序
// ============================================================

/**
 * 逆序单个移动
 */
function invertMove(move: string): string {
  if (move.endsWith('2')) return move
  if (move.endsWith("'")) return move.slice(0, -1)
  return move + "'"
}

/**
 * 逆序整个算法
 */
export function invertAlgorithm(algorithm: string): string {
  if (!algorithm) return ''
  const moves = algorithm.trim().split(/\s+/).filter(Boolean)
  const inverted = moves.map(invertMove).reverse()
  return inverted.join(' ')
}

// ============================================================
// Pattern 生成
// ============================================================

/**
 * 从算法生成 OLL pattern
 *
 * 流程：
 * 1. 从已还原状态开始
 * 2. 应用算法的逆序
 * 3. 提取结果状态的 pattern
 */
export function patternFromAlgorithm(id: string, algorithm: string): string {
  if (!algorithm) return ''  // 已完成状态

  const cube = new Cube()
  cube.move(invertAlgorithm(algorithm))
  return extractOLLPattern(cube.asString())
}

/**
 * 生成所有 OLL pattern
 */
export function generateOLLPatterns(): OLLPattern[] {
  const patterns: OLLPattern[] = []

  for (const ollCase of ALL_OLL_CASES) {
    if (ollCase.id === 'DONE' || !ollCase.algorithm) continue

    const pattern = patternFromAlgorithm(ollCase.id, ollCase.algorithm)

    patterns.push({
      id: ollCase.id,
      name: ollCase.name,
      category: ollCase.category,
      pattern,
      algorithm: ollCase.algorithm,
    })
  }

  return patterns
}

// ============================================================
// OLL 识别
// ============================================================

/**
 * 旋转归一化 - 尝试所有 y 旋转
 */
const Y_ROTATIONS = ['', 'y', "y'", 'y2'] as const

function normalizeWithY(stateStr: string, cubeObj: Cube): Array<{ rotation: string; pattern: string }> {
  const result: Array<{ rotation: string; pattern: string }> = []

  for (const rot of Y_ROTATIONS) {
    if (!rot) {
      result.push({ rotation: '', pattern: extractOLLPattern(stateStr) })
      continue
    }

    const cloned = new Cube(cubeObj)
    cloned.move(rot)
    result.push({ rotation: rot, pattern: extractOLLPattern(cloned.asString()) })
  }

  return result
}

/**
 * 通过 pattern 匹配识别 OLL
 *
 * @param stateOrCube 状态字符串或 Cube 对象
 */
export function recognizeOLLByPattern(stateOrCube: string | Cube): OLLMatch | null {
  let stateStr: string
  let cubeObj: Cube | null = null

  if (typeof stateOrCube === 'string') {
    stateStr = stateOrCube
    cubeObj = null
  } else {
    stateStr = stateOrCube.asString()
    cubeObj = stateOrCube
  }

  // 检查是否已完成
  const uFace = stateStr.substring(0, 9)
  if (uFace === 'UUUUUUUUU') {
    return {
      case: { id: 'DONE', name: 'Complete', category: 'done', edges: 4, corners: 4, algorithm: '' },
      pattern: { id: 'DONE', name: 'Complete', category: 'done', pattern: '', algorithm: '' },
      rotation: '',
      confidence: 1,
    }
  }

  // 生成 pattern 库（可以缓存）
  const patterns = generateOLLPatterns()

  // 尝试所有 y 旋转
  let rotations: Array<{ rotation: string; pattern: string }>

  if (cubeObj) {
    rotations = normalizeWithY(stateStr, cubeObj)
  } else {
    // 如果只传了字符串，无法正确旋转（因为 Cube.fromString 不可用）
    // 只返回原始 pattern
    rotations = [{ rotation: '', pattern: extractOLLPattern(stateStr) }]
  }

  for (const { rotation, pattern } of rotations) {
    const found = patterns.find(p => p.pattern === pattern)

    if (found) {
      const ollCase = ALL_OLL_CASES.find(c => c.id === found.id)!
      return {
        case: ollCase,
        pattern: found,
        rotation,
        confidence: 1,
      }
    }
  }

  // 未匹配 - 回退到简单计数方法
  return null
}

// ============================================================
// 获取 OLL 解法
// ============================================================

/**
 * 获取 OLL 解法（包含旋转）
 */
export function getOLLAlgorithmWithRotation(stateOrCube: string | Cube): { algorithm: string; rotation: string } | null {
  const match = recognizeOLLByPattern(stateOrCube)

  if (match && match.case.algorithm) {
    return {
      algorithm: match.case.algorithm,
      rotation: match.rotation,
    }
  }

  return null
}

/**
 * 获取完整的 OLL 解法（包含前置旋转）
 */
export function getFullOLLAlgorithm(stateOrCube: string | Cube): string | null {
  const result = getOLLAlgorithmWithRotation(stateOrCube)

  if (result) {
    const { rotation, algorithm } = result
    return rotation ? `${rotation} ${algorithm}` : algorithm
  }

  return null
}

// ============================================================
// 2-Look OLL（简化版）
// ============================================================

/**
 * 2-Look OLL 求解
 *
 * 第一步：顶面十字
 * 第二步：角块
 */
export function solveOLL2Look(cube: Cube): { cube: Cube; solution: string; steps: string[] } {
  const steps: string[] = []
  let currentCube = cube
  let totalSolution = ''

  // 检查是否已完成
  const uFace = currentCube.asString().substring(0, 9)
  if (uFace === 'UUUUUUUUU') {
    return { cube: currentCube, solution: '', steps: [] }
  }

  // 尝试完整 OLL 识别
  const fullMatch = recognizeOLLByPattern(currentCube.asString())
  if (fullMatch && fullMatch.case.algorithm) {
    const alg = fullMatch.rotation ? `${fullMatch.rotation} ${fullMatch.case.algorithm}` : fullMatch.case.algorithm
    currentCube = new Cube(currentCube)
    currentCube.move(alg)
    return {
      cube: currentCube,
      solution: alg,
      steps: [`OLL: ${fullMatch.case.name}`],
    }
  }

  // 回退到 2-Look 方法
  // 第一步：顶面十字
  const pattern = extractOLLPattern(currentCube.asString())
  const uEdges = [pattern[1], pattern[3], pattern[5], pattern[7]]
  const uEdgeCount = uEdges.filter(c => c === 'U').length

  if (uEdgeCount === 0) {
    // 点状 → 十字
    const alg = "F R U R' U' F' U2 F R U R' U' F'"
    currentCube = new Cube(currentCube)
    currentCube.move(alg)
    totalSolution += alg + ' '
    steps.push('OLL Step 1: Dot → Cross')
  } else if (uEdgeCount === 2) {
    // 检查是线形还是L形
    const isLine = (pattern[1] === 'U' && pattern[7] === 'U') || (pattern[3] === 'U' && pattern[5] === 'U')
    if (isLine) {
      // 线形 → 十字
      const alg = "F R U R' U' F'"
      currentCube = new Cube(currentCube)
      currentCube.move(alg)
      totalSolution += alg + ' '
      steps.push('OLL Step 1: Line → Cross')
    } else {
      // L形 → 十字
      const alg = "F R U R' U' F'"
      currentCube = new Cube(currentCube)
      currentCube.move(alg)
      totalSolution += alg + ' '
      steps.push('OLL Step 1: L-Shape → Cross (with U adjustment)')
    }
  }

  // 第二步：角块（使用 Sune）
  const newUFace = currentCube.asString().substring(0, 9)
  if (newUFace !== 'UUUUUUUUU') {
    const sune = "R U R' U R U2 R'"

    // 最多应用3次 Sune
    for (let i = 0; i < 3; i++) {
      currentCube = new Cube(currentCube)
      currentCube.move(sune)
      totalSolution += sune + ' '
      steps.push(`OLL Step 2: Sune #${i + 1}`)

      if (currentCube.asString().substring(0, 9) === 'UUUUUUUUU') {
        break
      }
    }
  }

  return {
    cube: currentCube,
    solution: totalSolution.trim(),
    steps,
  }
}
