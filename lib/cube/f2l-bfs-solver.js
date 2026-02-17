/**
 * F2L BFS求���器
 *
 * 使用搜索算法为每个槽位找到解法，同时保持Cross完好
 */

const Cube = require('cubejs')

// ============================================================
// 内部状态常量
// ============================================================

const CORNERS = { URF: 0, UFL: 1, ULB: 2, UBR: 3, DFR: 4, DLF: 5, DBL: 6, DRB: 7 }
const EDGES = { UR: 0, UF: 1, UL: 2, UB: 3, DR: 4, DF: 5, DL: 6, DB: 7, FR: 8, FL: 9, BL: 10, BR: 11 }

const F2L_SLOTS = {
  FR: { corner: CORNERS.DFR, edge: EDGES.FR },
  FL: { corner: CORNERS.DLF, edge: EDGES.FL },
  BL: { corner: CORNERS.DBL, edge: EDGES.BL },
  BR: { corner: CORNERS.DRB, edge: EDGES.BR }
}

// ============================================================
// 状态检查函数
// ============================================================

function isSlotComplete(cube, slot) {
  const state = cube.toJSON()
  const slotInfo = F2L_SLOTS[slot]

  const cornerOk = state.cp[slotInfo.corner] === slotInfo.corner &&
                   state.co[slotInfo.corner] === 0
  const edgeOk = state.ep[slotInfo.edge] === slotInfo.edge &&
                 state.eo[slotInfo.edge] === 0

  return cornerOk && edgeOk
}

function isCrossIntact(cube) {
  const s = cube.asString()
  return s[28] === 'D' && s[30] === 'D' && s[34] === 'D' && s[32] === 'D'
}

function checkGoal(cube, slot) {
  return isSlotComplete(cube, slot) && isCrossIntact(cube)
}

// ============================================================
// BFS求解单个槽位
// ============================================================

function solveSlotBFS(cube, slot, maxDepth = 6) {
  // 如果已经完成，返回空
  if (checkGoal(cube, slot)) {
    return { solution: '', steps: 0, done: true }
  }

  // F2L可用的转动（不破坏Cross的D层转动）
  const moves = ['U', "U'", 'U2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2']

  function bfs(c, depth, lastFace, path) {
    if (checkGoal(c, slot)) {
      return { solution: path.join(' '), steps: path.length, done: true }
    }
    if (depth <= 0) return null

    for (const move of moves) {
      const face = move[0]

      // 避免连续转动同一面
      if (lastFace && face === lastFace) continue

      // 避免破坏Cross的D层转动
      if (face === 'D') continue

      const newCube = new Cube(c)
      newCube.move(move)

      // 检查Cross是否完好，如果破坏则跳过
      if (!isCrossIntact(newCube)) continue

      const result = bfs(newCube, depth - 1, face, [...path, move])
      if (result) return result
    }

    return null
  }

  // 逐步增加深度搜索
  for (let d = 1; d <= maxDepth; d++) {
    const result = bfs(cube, d, '', [])
    if (result) return result
  }

  return { solution: '', steps: 0, done: false, failed: true }
}

// ============================================================
// 求解所有F2L槽位
// ============================================================

function solveF2LBFS(cube, options = {}) {
  const { verbose = false, maxDepth = 6 } = options
  const solution = []
  const details = {}

  // 计算槽位复杂度并排序
  const slots = ['FR', 'FL', 'BL', 'BR']
  const slotComplexity = slots.map(slot => {
    const state = cube.toJSON()
    const slotInfo = F2L_SLOTS[slot]

    const cornerPos = state.cp.indexOf(slotInfo.corner)
    const edgePos = state.ep.indexOf(slotInfo.edge)

    const cornerInU = cornerPos < 4
    const edgeInU = edgePos < 4

    let score = 0
    if (cornerInU) score -= 2  // U层的块优先
    if (edgeInU) score -= 2
    if (cornerInU && edgeInU) score -= 1  // 都在U层更优先

    return { slot, score }
  })

  slotComplexity.sort((a, b) => a.score - b.score)

  if (verbose) {
    console.log('  槽位解决顺序:', slotComplexity.map(s => s.slot).join(' -> '))
  }

  // 逐个求解
  for (const { slot } of slotComplexity) {
    if (verbose) console.log(`  求解 ${slot}...`)

    const startTime = Date.now()
    const result = solveSlotBFS(cube, slot, maxDepth)
    const elapsed = Date.now() - startTime

    details[slot] = {
      done: result.done,
      solution: result.solution,
      steps: result.steps,
      elapsed
    }

    if (verbose) {
      if (result.done) {
        console.log(`    ✅ ${result.solution} (${result.steps}步, ${elapsed}ms)`)
      } else {
        console.log(`    ❌ 未找到解法 (深度${maxDepth})`)
      }
    }

    if (result.solution) {
      cube.move(result.solution)
      solution.push(result.solution)
    }
  }

  return {
    solution: solution.join(' '),
    steps: solution.join(' ').split(' ').length,
    details,
    allDone: Object.values(details).every(d => d.done)
  }
}

// ============================================================
// 导出
// ============================================================

module.exports = {
  solveF2LBFS,
  solveSlotBFS,
  isSlotComplete,
  isCrossIntact
}
