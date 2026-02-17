import {
  CORNER_COLORS,
  CORNER_POSITIONS,
  EDGE_COLORS,
  EDGE_POSITIONS,
} from './cfop-solver-cubejs'

function hasSameElements<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, i) => val === sortedB[i])
}

export function findCornerByColors(
  stateStr: string,
  targetColors: string[]
): { location: string; orientation: number } {
  for (const [loc, pos] of Object.entries(CORNER_POSITIONS)) {
    const colors = [stateStr[pos[0]], stateStr[pos[1]], stateStr[pos[2]]]
    if (!hasSameElements(colors, targetColors)) continue

    let primaryColor = targetColors.includes('U') ? 'U' : 'D'
    if (primaryColor === 'D' && !targetColors.includes('D')) {
      primaryColor = 'U'
    }

    let orient = 0
    if (stateStr[pos[0]] === primaryColor) orient = 0
    else if (stateStr[pos[1]] === primaryColor) orient = 1
    else orient = 2

    return { location: loc, orientation: orient }
  }

  throw new Error(`Corner not found for colors: ${targetColors.join('')}`)
}

export function findEdgeByColors(
  stateStr: string,
  targetColors: string[]
): { location: string; orientation: number } {
  for (const [loc, pos] of Object.entries(EDGE_POSITIONS)) {
    const colors = [stateStr[pos[0]], stateStr[pos[1]]]
    if (colors[0] === targetColors[0] && colors[1] === targetColors[1]) {
      return { location: loc, orientation: 0 }
    }
    if (colors[0] === targetColors[1] && colors[1] === targetColors[0]) {
      return { location: loc, orientation: 1 }
    }
  }

  throw new Error(`Edge not found for colors: ${targetColors.join('')}`)
}

export function getCornerColors(id: string): string[] {
  const colors = CORNER_COLORS[id]
  if (!colors) throw new Error(`Unknown corner id: ${id}`)
  return colors
}

export function getEdgeColors(id: string): string[] {
  const colors = EDGE_COLORS[id]
  if (!colors) throw new Error(`Unknown edge id: ${id}`)
  return colors
}
