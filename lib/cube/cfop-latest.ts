import Cube from 'cubejs'
import { isF2LSlotSolvedByFacelets, type F2LSlotName } from './f2l-slot-check'

const latestSolver = require('./cfop-fixed-solver.js')

type CubeJs = InstanceType<typeof Cube>

export interface LatestCFOPDetailedResult {
  scramble: string
  cross: { moves: string; steps: number }
  f2l: {
    moves: string
    steps: number
    slots: Array<{ slot: string; moves: string; solved: boolean }>
    slotHistory?: Array<{ slot: string; solution: string; round: number; score: number }>
  }
  oll: { moves: string; steps: number; caseId: string; caseName: string }
  pll: {
    moves: string
    steps: number
    caseId: string
    caseName: string
    subgroup?: string
    subgroupZh?: string
  }
  totalSteps: number
  solution: string
  verified: boolean
}

export function createSolvedCubeState(): CubeJs {
  return new Cube()
}

export function applyScramble(state: CubeJs, scramble: string): CubeJs {
  const next = new Cube(state)
  if (scramble.trim()) next.move(scramble)
  return next
}

export function isCrossComplete(state: CubeJs): boolean {
  const json = state.toJSON()
  const dEdges = [4, 5, 6, 7]
  return dEdges.every((pos) => json.ep[pos] === pos && json.eo[pos] === 0)
}

export function isF2LComplete(state: CubeJs): boolean {
  const asString = state.asString()
  const slots: F2LSlotName[] = ['FR', 'FL', 'BL', 'BR']
  return slots.every((slot) => isF2LSlotSolvedByFacelets(asString, slot))
}

function countMoves(formula: string): number {
  return formula.trim() ? formula.trim().split(/\s+/).length : 0
}

function normalizeMoves(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function extractPLLCase(method: string, fallbackCaseId: string): string {
  if (fallbackCaseId) return fallbackCaseId
  if (method.startsWith('single_')) return method.replace('single_', '')
  return 'Unknown'
}

export function solveCFOPDetailedVerified(scramble: string): LatestCFOPDetailedResult {
  const scrambledCube = new Cube()
  if (scramble.trim()) scrambledCube.move(scramble.trim())

  const raw = latestSolver.solveCFOP(scrambledCube, {})
  const crossMoves = normalizeMoves(raw?.cross?.solution)
  const f2lMoves = normalizeMoves(raw?.f2l?.solution)
  const ollMoves = normalizeMoves(raw?.oll?.solution)
  const pllMoves = normalizeMoves(raw?.pll?.solution)
  const solution = normalizeMoves(raw?.solution)
  const pllCaseId = extractPLLCase(
    normalizeMoves(raw?.pll?.method),
    normalizeMoves(raw?.pll?.caseId),
  )

  const slotOrder: Array<'FL' | 'FR' | 'BL' | 'BR'> = ['FL', 'FR', 'BL', 'BR']
  const slots = slotOrder.map((slot) => ({
    slot,
    moves: normalizeMoves(raw?.f2l?.rawSlots?.[slot]?.solution || raw?.f2l?.details?.[slot]?.solution),
    solved: !!raw?.f2l?.details?.[slot]?.done,
  }))

  const verifyCube = new Cube()
  if (scramble.trim()) verifyCube.move(scramble.trim())
  if (solution) verifyCube.move(solution)
  const verified = !!raw?.verified && verifyCube.isSolved()

  return {
    scramble: scramble.trim(),
    cross: {
      moves: crossMoves,
      steps: raw?.cross?.steps ?? countMoves(crossMoves),
    },
    f2l: {
      moves: f2lMoves,
      steps: raw?.f2l?.steps ?? countMoves(f2lMoves),
      slots,
      slotHistory: raw?.f2l?.slotHistory || [],
    },
    oll: {
      moves: ollMoves,
      steps: raw?.oll?.steps ?? countMoves(ollMoves),
      caseId: normalizeMoves(raw?.oll?.caseId) || 'Unknown',
      caseName: normalizeMoves(raw?.oll?.method) || 'Unknown',
    },
    pll: {
      moves: pllMoves,
      steps: raw?.pll?.steps ?? countMoves(pllMoves),
      caseId: pllCaseId,
      caseName: normalizeMoves(raw?.pll?.labelZh) || pllCaseId,
      subgroup: normalizeMoves(raw?.pll?.subgroup),
      subgroupZh: normalizeMoves(raw?.pll?.subgroupZh),
    },
    totalSteps: raw?.totalSteps ?? countMoves(solution),
    solution,
    verified,
  }
}
