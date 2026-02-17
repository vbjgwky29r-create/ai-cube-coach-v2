import { F2L_SLOT_PAIRS } from './cfop-solver-cubejs'
import { findCornerByColors, findEdgeByColors, getCornerColors, getEdgeColors } from './piece-locator'

export type F2LSlotName = 'FR' | 'FL' | 'BL' | 'BR'

export type F2LPairState = {
  cornerLoc: string
  cornerOri: number
  edgeLoc: string
  edgeOri: number
}

export function getF2LPairState(stateStr: string, slot: F2LSlotName): F2LPairState {
  const pair = F2L_SLOT_PAIRS[slot]
  const cornerColors = getCornerColors(pair.corner)
  const edgeColors = getEdgeColors(pair.edge)

  const corner = findCornerByColors(stateStr, cornerColors)
  const edge = findEdgeByColors(stateStr, edgeColors)

  return {
    cornerLoc: corner.location,
    cornerOri: corner.orientation,
    edgeLoc: edge.location,
    edgeOri: edge.orientation,
  }
}

export function encodeF2LPairState(state: F2LPairState): string {
  return `${state.cornerLoc},${state.cornerOri}|${state.edgeLoc},${state.edgeOri}`
}
