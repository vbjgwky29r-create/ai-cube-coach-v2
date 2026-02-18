// Minimal compatibility exports required by current F2L utilities.
// Solver logic lives in cfop-latest.ts and cfop-fixed-solver.js.

export const EDGE_POSITIONS: Record<string, number[]> = {
  UF: [7, 19],
  UL: [3, 37],
  UB: [1, 46],
  UR: [5, 10],
  DF: [28, 25],
  DL: [30, 43],
  DB: [34, 52],
  DR: [32, 16],
  FR: [23, 12],
  FL: [21, 41],
  BL: [50, 39],
  BR: [48, 14],
}

export const EDGE_COLORS: Record<string, string[]> = {
  UF: ['U', 'F'],
  UL: ['U', 'L'],
  UB: ['U', 'B'],
  UR: ['U', 'R'],
  DF: ['D', 'F'],
  DL: ['D', 'L'],
  DB: ['D', 'B'],
  DR: ['D', 'R'],
  FR: ['F', 'R'],
  FL: ['F', 'L'],
  BL: ['B', 'L'],
  BR: ['B', 'R'],
}

export const CORNER_POSITIONS: Record<string, number[]> = {
  URF: [8, 9, 20],
  UFL: [6, 18, 38],
  ULB: [0, 36, 47],
  UBR: [2, 45, 11],
  DFR: [29, 26, 15],
  DLF: [27, 44, 24],
  DBL: [33, 53, 42],
  DRB: [35, 17, 51],
}

export const CORNER_COLORS: Record<string, string[]> = {
  URF: ['U', 'R', 'F'],
  UFL: ['U', 'F', 'L'],
  ULB: ['U', 'L', 'B'],
  UBR: ['U', 'B', 'R'],
  DFR: ['D', 'F', 'R'],
  DLF: ['D', 'L', 'F'],
  DBL: ['D', 'B', 'L'],
  DRB: ['D', 'R', 'B'],
}

export const F2L_SLOT_PAIRS: Record<string, { corner: string; edge: string }> = {
  FR: { corner: 'DFR', edge: 'FR' },
  FL: { corner: 'DLF', edge: 'FL' },
  BL: { corner: 'DBL', edge: 'BL' },
  BR: { corner: 'DRB', edge: 'BR' },
}
