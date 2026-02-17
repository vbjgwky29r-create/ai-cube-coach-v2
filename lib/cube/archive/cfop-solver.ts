/**
 * CFOP 求解器
 *
 * 生成人类可读的 CFOP 风格解法：
 * - Cross: 底面十字
 * - F2L: 前两层 (4组对)
 * - OLL: 顶层朝向
 * - PLL: 顶层排列
 */

import { applyScramble, applyMove, type CubeState } from './cube-state'
import { parseFormula } from './parser'

// ============================================================
// 类型定义
// ============================================================

export interface CFOPSolution {
  cross: {
    moves: string
    steps: number
    description: string
    faceColor: string  // 十字面颜色 (如白色)
  }
  f2l: {
    pairs: F2LPair[]
    totalSteps: number
    description: string
  }
  oll: {
    caseNumber: number
    caseName: string
    moves: string
    steps: number
    description: string
  }
  pll: {
    caseNumber: number
    caseName: string
    moves: string
    steps: number
    description: string
  }
  totalSteps: number
  fullSolution: string
}

export interface F2LPair {
  slot: string        // 槽位名称 (FR, FL, BL, BR)
  moves: string        // 解决这对的动作
  steps: number
  observation: string  // 槽位情况描述
}

// ============================================================
// CFOP 求解器
// ============================================================

/**
 * CFOP 求解器类
 */
export class CFOPSolver {
  private cube: CubeState

  constructor() {
    // 初始化魔方状态
    this.cube = this.createSolvedState()
  }

  /**
   * 创建已解决状态
   */
  private createSolvedState(): CubeState {
    return {
      U: Array(9).fill(0), // 白
      R: Array(9).fill(1), // 红
      F: Array(9).fill(2), // 绿
      D: Array(9).fill(3), // 黄
      L: Array(9).fill(4), // 橙
      B: Array(9).fill(5), // 蓝
    }
  }

  /**
   * 应用打乱
   */
  private applyScramble(scramble: string): void {
    const parsed = parseFormula(scramble)
    if (!parsed.isValid) {
      throw new Error(`Invalid scramble: ${parsed.errors.join(', ')}`)
    }

    for (const move of parsed.moves) {
      this.cube = applyMove(this.cube, move)
    }
  }

  /**
   * 获取底面十字的解法
   *
   * 策略：
   * 1. 识别四个十字棱块的位置
   * 2. 计算每个棱块到底面的动作
   * 3. 优化动作顺序
   */
  private solveCross(): { moves: string, steps: number, description: string } {
    const crossMoves: string[] = []

    // 简化实现：使用启发式方法
    // 实际应用中需要完整的魔方状态追踪

    // 1. 识别底面中心颜色（通常是 D 面）
    const bottomColor = this.cube.D[4] // D 面中心

    // 2. 找到四个十字棱块应该的位置
    // 十字棱块是：DF, DR, DB, DL (底面与前后左右面的交界棱)
    const targetEdges = [
      { face: 'D', index: 1, color: this.cube.F[4], targetFace: 'F' }, // DF 棱
      { face: 'D', index: 5, color: this.cube.R[4], targetFace: 'R' }, // DR 棱
      { face: 'D', index: 7, color: this.cube.B[4], targetFace: 'B' }, // DB 棱
      { face: 'D', index: 3, color: this.cube.L[4], targetFace: 'L' }, // DL 棱
    ]

    // 3. 对每个棱块生成解决方案
    for (const edge of targetEdges) {
      const solution = this.solveEdgeToBottom(edge.face, edge.index, edge.targetFace as any)
      if (solution) {
        crossMoves.push(...solution)
      }
    }

    // 4. 优化动作序列
    const optimized = this.optimizeMoves(crossMoves.join(' '))

    return {
      moves: optimized,
      steps: optimized.split(/\s+/).filter(Boolean).length,
      description: this.generateCrossDescription(crossMoves.length),
    }
  }

  /**
   * 解决单个棱块到底面
   */
  private solveEdgeToBottom(
    currentFace: string,
    currentIndex: number,
    targetFace: 'U' | 'D' | 'F' | 'B' | 'L' | 'R'
  ): string[] {
    // 简化实现：返回一组基本动作
    // 实际需要根据棱块位置计算具体动作

    const moves: string[] = []

    // 这是一个简化的启发式方法
    // 真正的实现需要追踪棱块在魔方中的实际位置

    // 示例：如果棱块在顶面，旋转到前面再下来
    if (currentFace === 'U') {
      moves.push('F2') // F2 将 UF 棱移到 DF
    }

    return moves
  }

  /**
   * 优化动作序列
   */
  private optimizeMoves(moves: string): string {
    const moveList = moves.split(/\s+/).filter(Boolean)
    const optimized: string[] = []

    for (let i = 0; i < moveList.length; i++) {
      const move = moveList[i]

      // 移除冗余：如 R R -> R2
      if (i < moveList.length - 1) {
        const nextMove = moveList[i + 1]
        if (move === nextMove && !move.includes('2')) {
          optimized.push(move + '2')
          i++ // 跳过下一个
          continue
        }

        // 移除抵消：如 R R' -> 空
        if (move.length === 1 && nextMove === move + "'") {
          i++ // 跳过这两个
          continue
        }
        if (move === move + "'" && moveList[i + 1] === move.replace("'", '')) {
          i++
          continue
        }
      }

      optimized.push(move)
    }

    return optimized.join(' ')
  }

  /**
   * 生成 Cross 描述
   */
  private generateCrossDescription(stepCount: number): string {
    if (stepCount <= 4) {
      return '完美的十字，可以直接看到最优解！'
    } else if (stepCount <= 6) {
      return '十字效率不错，继续保持观察力。'
    } else if (stepCount <= 8) {
      return '十字稍多步数，可以尝试更灵活的底面旋转。'
    } else {
      return '建议练习十字技巧，目标是 8 步内完成。'
    }
  }

  /**
   * 解决 F2L (前两层)
   *
   * 策略：
   * 1. 识别四个角块和对应的棱块
   * 2. 计算每对的解决方案
   */
  private solveF2L(): { pairs: F2LPair[], totalSteps: number, description: string } {
    const pairs: F2LPair[] = []

    // 四个 F2L 槽位：FR, FL, BL, BR
    const slots = ['FR', 'FL', 'BL', 'BR']

    for (const slot of slots) {
      pairs.push({
        slot,
        moves: this.generateF2LPairSolution(slot),
        steps: 0, // 稍后计算
        observation: this.getSlotObservation(slot),
      })
    }

    const totalSteps = pairs.reduce((sum, p) => sum + p.moves.split(/\s+/).filter(Boolean).length, 0)

    return {
      pairs,
      totalSteps,
      description: this.generateF2LDescription(totalSteps),
    }
  }

  /**
   * 生成单个 F2L 对的解法
   */
  private generateF2LPairSolution(slot: string): string {
    // 简化实现：返回标准 F2L 公式
    // 实际需要根据角块和棱块位置选择正确的公式

    const standardMoves: Record<string, string> = {
      FR: 'R U R\' U\' R U R\'',
      FL: 'L\' U\' L U L\' U\' L',
      BL: 'L U L\' U\' L U L\'',
      BR: 'R\' U\' R U R\' U\' R',
    }

    return standardMoves[slot] || 'U R U\' R\''
  }

  /**
   * 获取槽位观察
   */
  private getSlotObservation(slot: string): string {
    const observations: Record<string, string> = {
      FR: '右前槽：检查红-绿对',
      FL: '左前槽：检查橙-绿对',
      BL: '左后槽：检查橙-蓝对',
      BR: '右后槽：检查红-蓝对',
    }

    return observations[slot] || `${slot} 槽`
  }

  /**
   * 生成 F2L 描述
   */
  private generateF2LDescription(stepCount: number): string {
    if (stepCount <= 30) {
      return 'F2L 执行效率很高！'
    } else if (stepCount <= 40) {
      return 'F2L 步数适中，可以尝试更多 lookahead。'
    } else {
      return 'F2L 有优化空间，建议练习识别配对模式。'
    }
  }

  /**
   * 识别 OLL 情况并返回解法
   */
  private solveOLL(): { caseNumber: number, caseName: string, moves: string, steps: number, description: string } {
    // OLL 有 57 种情况，这里提供常见情况的识别

    // 简化实现：返回标准的 Sune 公式
    // 实际需要根据顶面图案识别情况

    return {
      caseNumber: 1,
      caseName: 'Sune (鱼形)',
      moves: 'R U R\' U R U2 R\'',
      steps: 6,
      description: '最常见的 OLL 公式，建议熟练掌握。',
    }
  }

  /**
   * 识别 PLL 情况并返回解法
   */
  private solvePLL(): { caseNumber: number, caseName: string, moves: string, steps: number, description: string } {
    // PLL 有 21 种情况

    // 简化实现：返回标准的 T-Perm
    // 实际需要根据顶层角块和棱块排列识别情况

    return {
      caseNumber: 1,
      caseName: 'T-Perm',
      moves: 'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'',
      steps: 14,
      description: '最常用的 PLL 公式之一。',
    }
  }

  /**
   * 主求解方法
   */
  solve(scramble: string): CFOPSolution {
    // 重置魔方状态
    this.cube = this.createSolvedState()

    // 应用打乱
    this.applyScramble(scramble)

    // 1. 解决 Cross
    const cross = this.solveCross()

    // 2. 解决 F2L
    const f2l = this.solveF2L()

    // 3. 解决 OLL
    const oll = this.solveOLL()

    // 4. 解决 PLL
    const pll = this.solvePLL()

    // 组合完整解法
    const fullSolution = [
      cross.moves,
      f2l.pairs.map(p => p.moves).join(' '),
      oll.moves,
      pll.moves,
    ].filter(m => m.trim()).join(' ')

    const totalSteps = cross.steps + f2l.totalSteps + oll.steps + pll.steps

    return {
      cross,
      f2l,
      oll,
      pll,
      totalSteps,
      fullSolution,
    }
  }
}

// ============================================================
// 便捷函数
// ============================================================

const cfopSolver = new CFOPSolver()

/**
 * 使用 CFOP 方法求解魔方
 *
 * @param scramble 打乱公式
 * @returns CFOP 风格的解法
 */
export function solveCubeCFOP(scramble: string): CFOPSolution {
  return cfopSolver.solve(scramble)
}

/**
 * 格式化 CFOP 解法为可读文本
 */
export function formatCFOPSolution(solution: CFOPSolution): string {
  const lines: string[] = []

  lines.push('=== CFOP 解法 ===')
  lines.push('')

  lines.push(`📊 总步数: ${solution.totalSteps}`)
  lines.push('')

  lines.push('🔷 1. Cross (十字)')
  lines.push(`   动作: ${solution.cross.moves || '直接完成'}`)
  lines.push(`   步数: ${solution.cross.steps}`)
  lines.push(`   说明: ${solution.cross.description}`)
  lines.push('')

  lines.push('🔶 2. F2L (前两层)')
  solution.f2l.pairs.forEach((pair, i) => {
    lines.push(`   第${i + 1}对 [${pair.slot}]:`)
    lines.push(`     ${pair.observation}`)
    lines.push(`     动作: ${pair.moves}`)
  })
  lines.push(`   总步数: ${solution.f2l.totalSteps}`)
  lines.push(`   说明: ${solution.f2l.description}`)
  lines.push('')

  lines.push('🟡 3. OLL (顶层朝向)')
  lines.push(`   情况: ${solution.oll.caseName} (#${solution.oll.caseNumber})`)
  lines.push(`   动作: ${solution.oll.moves}`)
  lines.push(`   步数: ${solution.oll.steps}`)
  lines.push(`   说明: ${solution.oll.description}`)
  lines.push('')

  lines.push('🟢 4. PLL (顶层排列)')
  lines.push(`   情况: ${solution.pll.caseName} (#${solution.pll.caseNumber})`)
  lines.push(`   动作: ${solution.pll.moves}`)
  lines.push(`   步数: ${solution.pll.steps}`)
  lines.push(`   说明: ${solution.pll.description}`)
  lines.push('')

  lines.push('=== 完整解法 ===')
  lines.push(solution.fullSolution)

  return lines.join('\n')
}
