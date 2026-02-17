import { CORNER_COLORS, CORNER_POSITIONS, EDGE_COLORS, EDGE_POSITIONS } from './cfop-solver-cubejs'

export type F2LSlotName = 'FR' | 'FL' | 'BL' | 'BR'

const SLOT_PIECES: Record<F2LSlotName, { corner: string; edge: string }> = {
  FR: { corner: 'DFR', edge: 'FR' },
  FL: { corner: 'DLF', edge: 'FL' },
  BL: { corner: 'DBL', edge: 'BL' },
  BR: { corner: 'DRB', edge: 'BR' },
}

export function isF2LSlotSolvedByFacelets(stateStr: string, slot: F2LSlotName): boolean {
  const pieces = SLOT_PIECES[slot]
  const cornerPos = CORNER_POSITIONS[pieces.corner]
  const edgePos = EDGE_POSITIONS[pieces.edge]
  const cornerColors = CORNER_COLORS[pieces.corner]
  const edgeColors = EDGE_COLORS[pieces.edge]

  const cornerOk = cornerPos.every((idx, i) => stateStr[idx] === cornerColors[i])
  const edgeOk = edgePos.every((idx, i) => stateStr[idx] === edgeColors[i])

  return cornerOk && edgeOk
}

export function getF2LSlotDetail(stateStr: string, slot: F2LSlotName): { ok: boolean; detail: string } {
  const pieces = SLOT_PIECES[slot]
  const cornerPos = CORNER_POSITIONS[pieces.corner]
  const edgePos = EDGE_POSITIONS[pieces.edge]
  const cornerColors = CORNER_COLORS[pieces.corner]
  const edgeColors = EDGE_COLORS[pieces.edge]

  const cornerOk = cornerPos.every((idx, i) => stateStr[idx] === cornerColors[i])
  const edgeOk = edgePos.every((idx, i) => stateStr[idx] === edgeColors[i])

  if (cornerOk && edgeOk) {
    return { ok: true, detail: `${slot} OK` }
  }

  const cornerActual = cornerPos.map((idx) => `${idx}=${stateStr[idx]}`).join(',')
  const edgeActual = edgePos.map((idx) => `${idx}=${stateStr[idx]}`).join(',')
  return {
    ok: false,
    detail: `${slot} corner(${cornerActual}) edge(${edgeActual})`,
  }
}
