# PROJECT MEMORY (Persistent Rules)

Last Updated: 2026-02-19
Owner: Product requirements (user-confirmed)

## 1) Product Goal (Core)
- This project is an AI Rubik's Cube coach.
- Core workflow:
  1. Compute a fast, real CFOP solution.
  2. Compare with the human solution.
  3. Give actionable coaching suggestions.

## 2) Solver Constraints (Must Follow)
- Never use inverse-scramble output as the user-facing solution.
- Solution must be CFOP staged: `Cross -> F2L -> OLL -> PLL`.
- Stage validation is required:
  - Cross complete after Cross stage.
  - F2L complete after F2L stage.
  - Cube solved after full solution.

## 3) Verification Input Policy
- Do NOT use casual short scrambles for primary validation.
- Primary regression should use repository verified scrambles/formulas first.
- If adding new cases, use WCA-style standard scrambles (20 moves).

## 4) Output Policy for Real-World Check
- Every verification report must print both:
  - `Scramble: ...`
  - `Solution: ...`
- This is mandatory so physical cube verification can be done by hand.

## 5) Current Priority
- Priority now: solver correctness + coaching quality.
- Payment/subscription/API-key billing is later phase work.

## 6) F2L Historical Lessons (Must Remember)
- F2L is the main bottleneck.
- Prefer `cube.toJSON()` (`cp/ep/co/eo`) for piece-location logic.
- Do not rely on `asString()` alone for F2L piece tracking.
- Keep hybrid/segmented approaches (tiered/permutation/PDB) as practical options.
- Default execution order should prioritize hybrid permutation solver first, then `PDB`, then legacy fallback.
- Human-style F2L policy (critical):
  - Solve by layered method: `STANDARD` -> `EASY_NONSTANDARD` -> `HARD_NONSTANDARD`.
  - Convert non-standard to standard first, then insert.
  - Slot choice is dynamic by ease (not fixed order); `FL -> FR -> BL -> BR` is only a tie-break preference.
  - First 3 slots may use rotation (`y/y'/y2`) when it reduces awkward B-face handling; last slot should avoid rotation when possible.
  - Do not break already solved slots in subsequent slot solves (slot locking).
  - Slot decision should be score-driven each round:
    - estimate standardization cost for all remaining slots first;
    - choose lower score slot first.
  - Current score factors: standardization class priority, move count, rotation count, B-face usage.

## 6.1) Golden F2L Case (User-Validated)
- Scramble: `R U2 R2 F2 L2 D F2 L2 U2 L2 D' R2 L U2 B2 D R2 B U'`
- Cross: `L' B R' D' L2 B2`
- Human-style target flow (important):
  1. `FL`: standard and direct insert.
  2. `FR`: prefer `R U' R'` standardization, then direct standard insert.
  3. `BL`: prefer `U L U L'` standardization, then direct standard insert.
  4. `BR`: prefer `U L U' L'` standardization, then direct standard insert.
- Optimization focus from this case:
  - "Standardize then insert" must beat/replace blind local search.
  - Avoid raw `B/B'` in F2L unless no practical alternative exists.
  - Keep slot continuity: do not solve-and-break previous slots.

## 7) Session Execution Rule
- At the start of each implementation session:
  1. Read this file.
  2. Ensure all solver/validation work follows these rules.

## 8) API Solver Source of Truth
- All API endpoints that need CFOP reference (`/api/cube/analyze`, `/api/cube/cfop-solve`, `/api/cube/optimal`, `/api/cube/f2l-solve`) must call the latest fixed solver via `lib/cube/cfop-latest.ts`.
- Do not route production coaching logic through legacy solvers (`cfop-solver-cubejs.ts`, versioned/experimental solver files, or ad-hoc script solvers).

## 9) Analyze Product Flow (Locked, 2026-02-19)
- OCR scope is `scramble only`.
- OCR must not provide/guess user solution.
- Analyze input policy:
  - `scramble`: manual input or OCR result.
  - `solution`: manual user input is optional.
  - If user solution is empty, system must analyze with generated reference solution for the same scramble.
- UI behavior after OCR success:
  - Update scramble.
  - Clear user solution.
  - Clear stale analysis/stage/reference outputs from previous scramble.
- Error messaging policy:
  - For invalid user solution, do not blame rotations only.
  - Must include multiple possible causes: missing/extra moves, notation typo, omitted rotations.
- Coaching output policy:
  - Do not output problem-only items.
  - Every recommendation must include `problem + improvement plan`.
