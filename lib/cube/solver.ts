/**
 * 魔方求解器
 *
 * 使用 Kociemba 算法计算最优解
 */

// import type { Move } from './parser' // 未使用，已注释

export interface SolutionResult {
  solution: string      // 解法公式
  length: number        // 步数
  phase1?: string       // 阶段1解法（调试用）
  phase2?: string       // 阶段2解法
  solved: boolean       // 是否成功
  error?: string        // 错误信息
}

/**
 * 简化的Kociemba求解器
 *
 * 注意: 完整的Kociemba算法实现很复杂
 * 这里先提供一个基础版本，后续可以替换为完整的实现
 */

// 魔方状态表示（54个面的颜色）
// 顺序: U1-U9, R1-R9, F1-F9, D1-D9, L1-L9, B1-B9
type CubeFaceState = string // 54字符的字符串

/**
 * 将打乱公式转换为魔方状态字符串
 * TODO: 实现此功能
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function applyScrambleToState(_scramble: string): CubeFaceState {
  // 还原状态
  const solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'

  // 简化版：使用模拟器计算状态
  // 完整实现需要完整的魔方模拟
  return solved
}

/**
 * Kociemba两阶段算法 - 简化版
 *
 * 实际项目中应该使用完整的Kociemba实现
 * 这里提供一个接口，便于后续替换
 */
export class KociembaSolver {
  /**
   * 求解魔方
   * @param scramble 打乱公式
   * @returns 解法结果
   */
  solve(scramble: string): SolutionResult {
    try {
      // 验证输入
      if (!scramble || scramble.trim().length === 0) {
        return {
          solution: '',
          length: 0,
          solved: false,
          error: '打乱公式不能为空',
        }
      }

      // 调用cube-solver库
      const solver = require('cube-solver')
      const solution = solver.solve(scramble)

      if (!solution || solution.length === 0) {
        return {
          solution: '',
          length: 0,
          solved: false,
          error: '无法求解',
        }
      }

      // cube-solver 返回字符串，需要计算步数
      const moves = solution.trim().split(/\s+/).filter(Boolean)

      return {
        solution: solution,
        length: moves.length,
        solved: true,
      }
    } catch (e) {
      return {
        solution: '',
        length: 0,
        solved: false,
        error: e instanceof Error ? e.message : '求解失败',
      }
    }
  }

  /**
   * 从魔方状态求解（如果已有魔方状态而非打乱公式）
   * TODO: 实现此功能
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  solveFromState(_state: CubeFaceState): SolutionResult {
    // 完整实现需要支持从状态求解
    return {
      solution: '',
      length: 0,
      solved: false,
      error: '暂不支持从状态求解',
    }
  }
}

/**
 * 单例实例
 */
const solver = new KociembaSolver()

/**
 * 求解魔方（便捷函数）
 */
export function solveCube(scramble: string): SolutionResult {
  return solver.solve(scramble)
}

/**
 * 计算解法的步数
 */
export function countMoves(solution: string): number {
  if (!solution) return 0
  return solution.trim().split(/\s+/).filter(Boolean).length
}

/**
 * 比较两个解法的效率
 */
export function compareSolutions(
  solution1: string,
  solution2: string
): {
  better: string       // 更好的解法 ('1' | '2' | 'equal')
  difference: number   // 步数差
  winner: string       // 获胜者的完整解法
} {
  const moves1 = countMoves(solution1)
  const moves2 = countMoves(solution2)

  if (moves1 < moves2) {
    return { better: '1', difference: moves2 - moves1, winner: solution1 }
  } else if (moves2 < moves1) {
    return { better: '2', difference: moves1 - moves2, winner: solution2 }
  } else {
    return { better: 'equal', difference: 0, winner: solution1 }
  }
}

/**
 * 生成解法分析报告
 */
export interface SolutionAnalysis {
  userSolution: string
  userMoves: number
  optimalSolution: string
  optimalMoves: number
  efficiency: number        // 效率评分 0-10
  improvement: string       // 改进建议
}

export function analyzeSolution(
  userSolution: string,
  optimalSolution: string
): SolutionAnalysis {
  const userMoves = countMoves(userSolution)
  const optimalMoves = countMoves(optimalSolution)

  // 计算效率评分 (10分制)
  let efficiency: number
  if (userMoves <= optimalMoves) {
    efficiency = 10
  } else if (userMoves <= optimalMoves * 1.2) {
    efficiency = 8
  } else if (userMoves <= optimalMoves * 1.5) {
    efficiency = 6
  } else if (userMoves <= optimalMoves * 2) {
    efficiency = 4
  } else {
    efficiency = 2
  }

  // 生成改进建议
  let improvement = ''
  const diff = userMoves - optimalMoves

  if (diff <= 0) {
    improvement = '你的解法已经是最优的！'
  } else if (diff <= 3) {
    improvement = `你的解法很好，只需要${diff}步就能达到最优。`
  } else if (diff <= 5) {
    improvement = `有改进空间，可以减少${diff}步。尝试使用更高效的公式。`
  } else {
    improvement = `建议学习一些高级公式，可以减少${diff}步以上。`
  }

  return {
    userSolution,
    userMoves,
    optimalSolution,
    optimalMoves,
    efficiency,
    improvement,
  }
}
