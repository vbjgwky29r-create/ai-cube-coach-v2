import fs from 'node:fs'
import path from 'node:path'
import { checkCrossIntact, CubeState } from './cfop-solver-cubejs'
import { getF2LPairState, encodeF2LPairState, F2LSlotName } from './f2l-pair-state'
import { isF2LSlotSolvedByFacelets } from './f2l-slot-check'

type SlotTable = {
  moves: string[]
  table: Record<string, string>
  states?: number
}

type F2LPdb = {
  meta: {
    version: number
    createdAt: string
    moveSet: string
  }
  slots: Record<string, SlotTable>
}

type F2LPdbResult = {
  success: boolean
  solution: string
  steps: number
  slots: { slot: F2LSlotName; solution: string; solved: boolean }[]
  method: 'pdb' | 'pdb+u'
}

let cachedPdb: F2LPdb | null = null

function loadPdb(): F2LPdb {
  if (cachedPdb) return cachedPdb
  const filePath = path.join(process.cwd(), 'data', 'f2l-pdb.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  cachedPdb = JSON.parse(raw) as F2LPdb
  return cachedPdb
}

function countMoves(solution: string): number {
  if (!solution) return 0
  return solution.split(' ').filter(Boolean).length
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items]
  const result: T[][] = []
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const perm of permutations(rest)) {
      result.push([items[i], ...perm])
    }
  }
  return result
}

function isSlotSolved(stateStr: string, slot: F2LSlotName): boolean {
  return isF2LSlotSolvedByFacelets(stateStr, slot)
}

function trySolveSlotWithU(
  state: CubeState,
  slot: F2LSlotName,
  table: SlotTable
): { nextState: CubeState; solution: string } | null {
  const preMoves = ['', 'U', "U'", 'U2']

  for (const pre of preMoves) {
    const preState = pre ? state.move(pre) : state
    const pairState = getF2LPairState(preState.asString(), slot)
    const key = encodeF2LPairState(pairState)
    const alg = table.table[key]
    if (alg === undefined) continue

    const combined = pre ? `${pre} ${alg}`.trim() : alg
    const nextState = alg ? preState.move(alg) : preState

    if (!checkCrossIntact(nextState)) continue
    if (!isSlotSolved(nextState.asString(), slot)) continue

    return { nextState, solution: combined }
  }

  return null
}

export function solveF2LWithPdb(state: CubeState): F2LPdbResult {
  const pdb = loadPdb()
  const slotList: F2LSlotName[] = ['FR', 'FL', 'BL', 'BR']
  const orders = permutations(slotList)

  let best: {
    solution: string
    steps: number
    slots: { slot: F2LSlotName; solution: string; solved: boolean }[]
    method: 'pdb' | 'pdb+u'
  } | null = null

  for (const order of orders) {
    let currentState = state
    const slotResults: { slot: F2LSlotName; solution: string; solved: boolean }[] = []
    const solvedSlots: F2LSlotName[] = []
    let totalMoves = 0
    let usedU = false

    let failed = false
    for (const slot of order) {
      const table = pdb.slots[slot]
      if (!table) {
        failed = true
        break
      }

      const result = trySolveSlotWithU(currentState, slot, table)
      if (!result) {
        failed = true
        break
      }

      const nextState = result.nextState
      const solved = isSlotSolved(nextState.asString(), slot)
      const preserved = solvedSlots.every((s) => isSlotSolved(nextState.asString(), s))

      if (!solved || !preserved) {
        failed = true
        break
      }

      if (result.solution.startsWith('U')) usedU = true
      totalMoves += countMoves(result.solution)
      slotResults.push({ slot, solution: result.solution, solved: true })
      solvedSlots.push(slot)
      currentState = nextState
    }

    if (failed) continue

    const fullSolution = slotResults.map((s) => s.solution).filter(Boolean).join(' ')
    const method: 'pdb' | 'pdb+u' = usedU ? 'pdb+u' : 'pdb'

    if (!best || totalMoves < best.steps) {
      best = { solution: fullSolution, steps: totalMoves, slots: slotResults, method }
    }
  }

  if (!best) {
    return { success: false, solution: '', steps: 0, slots: [], method: 'pdb' }
  }

  return {
    success: true,
    solution: best.solution,
    steps: best.steps,
    slots: best.slots,
    method: best.method,
  }
}
