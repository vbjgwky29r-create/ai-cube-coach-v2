/**
 * CFOP 模式识别模块
 *
 * 通过分析魔方状态识别 OLL/PLL 情况
 */

import {
  createSolvedCube,
  findCornerAt,
  findEdgeAt,
  findCornerById,
  findEdgeById,
  type CubeState,
} from './cube-state-v3'

import { ALL_OLL_CASES, type OLLCase } from './oll-formulas'
import { ALL_PLL_CASES, type PLLCase } from './pll-formulas'

// ============================================================
// OLL 识别
// ============================================================

export interface OLLRecognitionResult {
  caseId: string
  name: string
  confidence: number
  suggestedAlgorithm: string
}

/**
 * 识别 OLL 情况
 *
 * 方法：分析顶层（U面）的颜色模式
 */
export function recognizeOLL(state: CubeState): OLLRecognitionResult | null {
  // 1. 统计顶层正确朝向的棱块和角块
  const { orientedEdges, orientedCorners } = countOrientedULayer(state)

  // 2. 根据模式分类
  const candidates = ALL_OLL_CASES.filter(oll =>
    oll.edges === orientedEdges && oll.corners === orientedCorners
  )

  if (candidates.length === 0) {
    return null
  }

  if (candidates.length === 1) {
    const oll = candidates[0]
    return {
      caseId: oll.id,
      name: oll.name,
      confidence: 1.0,
      suggestedAlgorithm: oll.algorithm,
    }
  }

  // 3. 多个候选时，进一步分析形状
  // 简化：返回第一个候选
  const oll = candidates[0]
  return {
    caseId: oll.id,
    name: oll.name,
    confidence: 0.8,
    suggestedAlgorithm: oll.algorithm,
  }
}

/**
 * 统计顶层正确朝向的块数量
 */
function countOrientedULayer(state: CubeState): {
  orientedEdges: number
  orientedCorners: number
} {
  let orientedEdges = 0
  let orientedCorners = 0

  // 检查顶层棱块（UF, UL, UB, UR）
  const uEdges = ['UF', 'UL', 'UB', 'UR']
  for (const edgeId of uEdges) {
    const edge = findEdgeById(state, edgeId)
    if (edge && edge.position.y === 1 && edge.orientation === 0) {
      orientedEdges++
    }
  }

  // 检查顶层角块（URF, UFL, ULB, UBR）
  // 角块朝向=0 表示 U/D 面颜色朝上/下
  const uCorners = ['URF', 'UFL', 'ULB', 'UBR']
  for (const cornerId of uCorners) {
    const corner = findCornerById(state, cornerId)
    if (corner && corner.position.y === 1 && corner.orientation === 0) {
      orientedCorners++
    }
  }

  return { orientedEdges, orientedCorners }
}

// ============================================================
// PLL 识别
// ============================================================

export interface PLLRecognitionResult {
  caseId: string
  name: string
  confidence: number
  suggestedAlgorithm: string
}

/**
 * 识别 PLL 情况
 *
 * 方法：分析顶层的块排列
 */
export function recognizePLL(state: CubeState): PLLRecognitionResult | null {
  // 1. 检查是否已还原（无PLL需要）
  const solved = createSolvedCube()

  // 检查所有块是否在正确位置
  let allCorrect = true

  // 检查棱块
  for (const solvedEdge of solved.edges) {
    const edge = findEdgeById(state, solvedEdge.id)
    if (!edge ||
        edge.position.x !== solvedEdge.position.x ||
        edge.position.y !== solvedEdge.position.y ||
        edge.position.z !== solvedEdge.position.z) {
      allCorrect = false
      break
    }
  }

  if (allCorrect) {
    return {
      caseId: 'PLL_NONE',
      name: 'Already Solved',
      confidence: 1.0,
      suggestedAlgorithm: '',
    }
  }

  // 2. 分析块的位置变化
  const edgePerm = analyzeEdgePermutation(state)
  const cornerPerm = analyzeCornerPermutation(state)

  // 3. 根据排列模式匹配PLL
  const candidates = ALL_PLL_CASES.filter(pll => {
    // 这里需要更复杂的模式匹配逻辑
    // 简化：返回基于启发式的猜测
    return true
  })

  // 4. 简化策略：返回T-Perm作为默认
  const pll = ALL_PLL_CASES.find(p => p.id === 'PLL_T')!

  return {
    caseId: pll.id,
    name: pll.name,
    confidence: 0.5,
    suggestedAlgorithm: pll.algorithm,
  }
}

/**
 * 分析棱块排列
 */
function analyzeEdgePermutation(state: CubeState): string[] {
  const solved = createSolvedCube()
  const permutations: string[] = []

  for (const solvedEdge of solved.edges) {
    // 只检查顶层
    if (solvedEdge.position.y !== 1) continue

    const edge = findEdgeAt(state, solvedEdge.position)
    if (!edge) continue

    // 找到当前位置是哪个块
    if (edge.id !== solvedEdge.id) {
      permutations.push(`${solvedEdge.id}→${edge.id}`)
    }
  }

  return permutations
}

/**
 * 分析角块排列
 */
function analyzeCornerPermutation(state: CubeState): string[] {
  const solved = createSolvedCube()
  const permutations: string[] = []

  for (const solvedCorner of solved.corners) {
    // 只检查顶层
    if (solvedCorner.position.y !== 1) continue

    const corner = findCornerAt(state, solvedCorner.position)
    if (!corner) continue

    // 找到当前位置是哪个块
    if (corner.id !== solvedCorner.id) {
      permutations.push(`${solvedCorner.id}→${corner.id}`)
    }
  }

  return permutations
}

// ============================================================
// 完整 CFOP 识别
// ============================================================

export interface CFOPAnalysis {
  cross: boolean
  f2l: {
    slots: {
      slot: string
      complete: boolean
    }[]
    complete: boolean
  }
  oll: OLLRecognitionResult | null
  pll: PLLRecognitionResult | null
}

/**
 * 分析 CFOP 各阶段状态
 */
export function analyzeCFOPState(state: CubeState): CFOPAnalysis {
  const { isCrossComplete } = require('./cube-state-v3')

  return {
    cross: isCrossComplete(state),
    f2l: analyzeF2LState(state),
    oll: recognizeOLL(state),
    pll: recognizePLL(state),
  }
}

/**
 * 分析 F2L 状态
 */
function analyzeF2LState(state: CubeState): {
  slots: { slot: string; complete: boolean }[]
  complete: boolean
} {
  const slots = ['FR', 'FL', 'BL', 'BR']
  const slotStates = slots.map(slot => {
    const isComplete = checkF2LSlot(state, slot)
    return { slot, complete: isComplete }
  })

  return {
    slots: slotStates,
    complete: slotStates.every(s => s.complete),
  }
}

/**
 * 检查单个 F2L 槽位
 */
function checkF2LSlot(state: CubeState, slot: string): boolean {
  const slotCorners: Record<string, string> = {
    FR: 'DFR',
    FL: 'DLF',
    BL: 'DBL',
    BR: 'DBR',
  }

  const slotEdges: Record<string, string> = {
    FR: 'FR',
    FL: 'FL',
    BL: 'BL',
    BR: 'BR',
  }

  const cornerId = slotCorners[slot]
  const edgeId = slotEdges[slot]

  const corner = findCornerById(state, cornerId)
  const edge = findEdgeById(state, edgeId)

  if (!corner || !edge) return false

  // 检查位置
  const solved = createSolvedCube()
  const solvedCorner = solved.corners.find(c => c.id === cornerId)!
  const solvedEdge = solved.edges.find(e => e.id === edgeId)!

  return (
    corner.position.x === solvedCorner.position.x &&
    corner.position.y === solvedCorner.position.y &&
    corner.position.z === solvedCorner.position.z &&
    corner.orientation === 0 &&
    edge.position.x === solvedEdge.position.x &&
    edge.position.y === solvedEdge.position.y &&
    edge.position.z === solvedEdge.position.z &&
    edge.orientation === 0
  )
}
