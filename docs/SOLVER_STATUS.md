# Solver Status (Single Production Solver)

Last Updated: 2026-02-19

## Core Product Guardrail (Do Not Break)
- CFOP solver is the core product capability.
- Single production entry must remain: `lib/cube/cfop-latest.ts`.
- Single production runtime must remain: `lib/cube/cfop-fixed-solver.js`.
- Any production API (`/api/cube/analyze`, `/api/cube/cfop-solve`, `/api/cube/optimal`, `/api/cube/f2l-solve`) must call `solveCFOPDetailedVerified` from `@/lib/cube/cfop-latest` only.
- Do not switch production traffic to experimental solvers.
- Do not bypass `cfop-latest` by importing other solver files directly.
- If solver behavior must change, update `cfop-fixed-solver.js` behind `cfop-latest` and re-run verification before release.

## Production Solver (Only Valid One)
- API entry: `lib/cube/cfop-latest.ts`
- Runtime solver: `lib/cube/cfop-fixed-solver.js`
- Rule: All production CFOP endpoints must use `cfop-latest`.

## WCA-Style Verification (Latest)
- Scramble: `B' R D F2 U' R' D B' D' U2 B2 U2 L U2 L' D2 L2 B2 U2 L'`
- Scramble moves: `20`
- Solver output: has solution, replay solved = `true`, verified = `true`
- Stage shape: Cross/F2L/OLL/PLL all returned

## Online WCA Scrambles Verification (2026-02-18)
Source: WCA official competition page
- URL: `https://www.worldcubeassociation.org/competitions/FMCLondonSummer2023`

1. Scramble:
- `R' U' F R F' D2 U2 F2 D2 L2 R' U2 R2 F' D2 L B' D' U2 F2 L' U R' U' F`
- Moves: `25`
- Result: `hasSolution=true`, `verified=true`, `replaySolved=true`

2. Scramble:
- `R' U' F D R' F2 D2 L2 U2 F D2 B' L2 B R2 B' L' D B' D' F R D' R' U' F`
- Moves: `26`
- Result: `hasSolution=true`, `verified=true`, `replaySolved=true`

Decision: `lib/cube/cfop-fixed-solver.js` (via `lib/cube/cfop-latest.ts`) is approved as current production solver.

## Legacy Solver Policy
The following are classified as development-phase invalid solvers for production use:
- `lib/cube/cfop-solver-cubejs.ts`
- `lib/cube/cfop-solver.ts`
- `lib/cube/cfop-solver-v3.js`
- `lib/cube/cfop-complete-solver.js`
- `lib/cube/cfop-web-solver.ts`
- `lib/cube/cfop-tiered-f2l.js`
- `lib/cube/cfop-solver-coordinate.ts`
- `lib/cube/archive/*`
- `lib/cube/*solver*` experimental variants not wired through `cfop-latest`

## Practical Rule to Avoid Confusion
- If adding/changing API logic, import from `@/lib/cube/cfop-latest` only.
- Treat other solver files as historical experiments or offline research references.
- Physical consolidation completed:
  - Legacy solver files were moved to `lib/cube/archive/legacy-disabled/`.
  - Each moved file has `@deprecated DO NOT USE IN PROD` header.

## Analyze Flow Status (2026-02-19)
- Production is deployed on `main`.
- Related commits:
  - `7a8e808` (analyze/coaching structure update)
  - `1ea7e68` (OCR-scramble-only runtime behavior fix)
- Current expected behavior:
  - Screenshot OCR only extracts scramble.
  - OCR path clears stale user solution and stale previous analysis state.
  - Analyze uses user solution if provided; otherwise falls back to current-scramble reference solution.
  - Invalid user solution error explains multiple causes (not rotations only).
  - Analyze recommendations are presented as `problem + fix` pairs.
