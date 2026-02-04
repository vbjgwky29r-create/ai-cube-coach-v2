import { NextRequest, NextResponse } from 'next/server'
import { solveCFOP, type CFOPSolution } from '@/lib/cube/cfop-solver'
// @ts-expect-error - cubejs doesn't have type definitions
import Cube from 'cubejs'

export async function POST(request: NextRequest) {
  try {
    const { scramble } = await request.json()

    if (!scramble || typeof scramble !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的打乱公式' },
        { status: 400 }
      )
    }

    const trimmedScramble = scramble.trim()
    if (!trimmedScramble) {
      return NextResponse.json(
        { error: '打乱公式不能为空' },
        { status: 400 }
      )
    }

    console.log('[CFOP] Generating solution for scramble:', trimmedScramble)
    
    // 获取 Kociemba 最优解作为参考
    let optimalMoves = 22
    let optimalSolution = ''
    try {
      Cube.initSolver()
      const cube = new Cube()
      cube.move(trimmedScramble)
      optimalSolution = cube.solve()
      optimalMoves = optimalSolution.split(' ').filter((s: string) => s).length
      console.log('[CFOP] Optimal solution:', optimalMoves, 'moves -', optimalSolution)
    } catch (e) {
      console.error('[CFOP] Failed to get optimal solution:', e)
    }
    
    // 使用专业 CFOP 求解器
    const solution = solveCFOP(trimmedScramble)
    
    // 添加最优解参考
    const enhancedSolution: CFOPSolution & { optimalReference: number; isReferenceSolution: boolean } = {
      ...solution,
      optimalReference: optimalMoves,
      isReferenceSolution: false // 这是真正的算法求解，不是 AI 生成的参考
    }

    return NextResponse.json({
      success: true,
      scramble: trimmedScramble,
      solution: enhancedSolution,
      optimalSolution: optimalSolution,
    })
  } catch (error) {
    console.error('CFOP solve error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error details:', errorMessage)
    return NextResponse.json(
      { error: '生成解法失败，请稍后重试', details: errorMessage },
      { status: 500 }
    )
  }
}
