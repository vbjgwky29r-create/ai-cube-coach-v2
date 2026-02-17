/**
 * F2L API
 *
 * POST /api/cube/f2l-solve
 * Body: { scramble: string, cross?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import Cube from 'cubejs'
import {
  applyScramble,
  checkCrossIntact,
  createSolvedCubeState,
  type CubeState,
  solveCross,
  solveF2L,
  isF2LComplete,
} from '@/lib/cube/cfop-solver-cubejs'
import { solveF2LWithPdb } from '@/lib/cube/f2l-pdb-solver'
import * as permutationF2L from '@/lib/cube/f2l-solver-permutation.js'

function validateFormula(formula: string): boolean {
  if (!formula || formula.trim().length === 0) {
    return false
  }
  const validPattern = /^[\sURFDLBMESXYZurfdlbmesxyz'2]+$/
  return validPattern.test(formula)
}

/**
 * 解析并标准化公式
 * 保留宽转（r/l/u/d/f/b）和中层转（M/E/S）的大小写区别
 */
function normalizeFormula(formula: string): string {
  return formula
    .trim()
    .replace(/\s+/g, ' ')
    // 只将大写基础转体（R/L/U/D/F/B）标准化，保留宽转和中层转的小写
    .replace(/\b([URFDLB])\b/g, (match) => match.toUpperCase())
}

type SlotName = 'FR' | 'FL' | 'BL' | 'BR'

function solveF2LWithPermutationHybrid(state: CubeState): {
  success: boolean
  solution: string
  steps: number
  slots: Array<{ slot: SlotName; solution: string; solved: boolean }>
  finalState: CubeState
  method: string
} {
  const solver = permutationF2L as unknown as {
    solveF2L?: (cube: any) => {
      solution?: string
      slots?: Record<string, { solution?: string; success?: boolean }>
    }
  }

  if (typeof solver.solveF2L !== 'function') {
    return {
      success: false,
      solution: '',
      steps: 0,
      slots: [],
      finalState: state,
      method: 'hybrid-unavailable',
    }
  }

  const workCube = new Cube(state.cube as Cube)
  const raw = solver.solveF2L(workCube)
  const solution = raw?.solution ? normalizeFormula(raw.solution) : ''
  const finalState = solution ? state.move(solution) : state

  const slotOrder: SlotName[] = ['FR', 'FL', 'BL', 'BR']
  const slots = slotOrder.map((slot) => {
    const slotRaw = raw?.slots?.[slot]
    const solved = isF2LComplete(finalState) || !!slotRaw?.success
    return {
      slot,
      solution: slotRaw?.solution ? normalizeFormula(slotRaw.solution) : '',
      solved,
    }
  })

  const success = checkCrossIntact(finalState) && isF2LComplete(finalState)

  return {
    success,
    solution,
    steps: solution ? solution.split(' ').filter(Boolean).length : 0,
    slots,
    finalState,
    method: 'hybrid-permutation',
  }
}

export async function POST(request: NextRequest) {
  try {
    const { scramble, cross } = await request.json()

    if (!scramble) {
      return NextResponse.json({ error: '缺少打乱公式' }, { status: 400 })
    }

    const normalizedScramble = normalizeFormula(scramble)
    if (!validateFormula(normalizedScramble)) {
      return NextResponse.json({ error: '打乱公式格式不正确' }, { status: 400 })
    }

    let normalizedCross = ''
    if (cross) {
      normalizedCross = normalizeFormula(cross)
      if (!validateFormula(normalizedCross)) {
        return NextResponse.json({ error: 'Cross 公式格式不正确' }, { status: 400 })
      }
    }

    const cube = createSolvedCubeState()
    const scrambled = applyScramble(cube, normalizedScramble)

    let crossSolution = normalizedCross
    let state = scrambled
    if (!crossSolution) {
      crossSolution = solveCross(scrambled)
    }
    if (crossSolution) {
      state = state.move(crossSolution)
    }

    const hybrid = solveF2LWithPermutationHybrid(state)
    let finalState = hybrid.finalState
    let f2lMoves = hybrid.solution
    let f2lSteps = hybrid.steps
    let f2lSlots: any = hybrid.slots
    let f2lMethod: string = hybrid.method

    if (!hybrid.success) {
      const pdbResult = solveF2LWithPdb(state)
      finalState = pdbResult.solution ? state.move(pdbResult.solution) : state
      f2lMoves = pdbResult.solution
      f2lSteps = pdbResult.steps
      f2lSlots = pdbResult.slots
      f2lMethod = pdbResult.method

      if (!pdbResult.success) {
        const fallback = solveF2L(state)
        finalState = fallback.solution ? state.move(fallback.solution) : state
        f2lMoves = fallback.solution
        f2lSteps = fallback.steps
        f2lSlots = fallback.slots as any
        f2lMethod = 'fallback-v2'
      }
    }

    return NextResponse.json({
      success: true,
      scramble: normalizedScramble,
      cross: {
        moves: crossSolution,
        steps: crossSolution ? crossSolution.split(' ').filter(Boolean).length : 0,
        intact: checkCrossIntact(finalState),
      },
      f2l: {
        moves: f2lMoves,
        steps: f2lSteps,
        slots: f2lSlots,
        method: f2lMethod,
        complete: isF2LComplete(finalState),
      },
    })
  } catch (error: any) {
    console.error('[F2L Solve API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'F2L 求解失败', success: false },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cube/f2l-solve',
    method: 'POST',
    description: 'F2L 求解接口（可选带入 Cross 公式）',
    parameters: {
      scramble: {
        type: 'string',
        description: '打乱公式',
        example: "R U F' R' U' F",
      },
      cross: {
        type: 'string',
        description: '可选 Cross 公式，若不提供则自动求解',
      },
    },
    response: {
      success: 'boolean',
      cross: 'Cross 解法与完整性',
      f2l: 'F2L 解法与完成情况',
    },
  })
}
