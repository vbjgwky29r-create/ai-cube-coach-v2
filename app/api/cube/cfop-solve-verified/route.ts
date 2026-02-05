import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
// @ts-expect-error - cubejs doesn't have type definitions
import Cube from 'cubejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * 验证解法是否能还原魔方
 */
function verifySolution(scramble: string, solution: string): boolean {
  try {
    const cube = new Cube()
    cube.move(scramble)
    cube.move(solution)
    return cube.isSolved()
  } catch (e) {
    console.error('[Verify] Error:', e)
    return false
  }
}

/**
 * 使用 AI 生成 CFOP 解法
 */
async function generateCFOPWithAI(scramble: string, attempt: number = 1): Promise<any> {
  const prompt = `你是一个专业的魔方 CFOP 解法专家。请为以下打乱公式生成标准的 CFOP 解法。

打乱公式：${scramble}

要求：
1. 必须严格按照 CFOP 方法（Cross → F2L → OLL → PLL）
2. 使用标准的魔方公式记号（R, U, F, L, D, B 及其变体 R', U2 等）
3. Cross 通常 4-8 步
4. F2L 每个槽位 5-8 步，共 4 个槽位
5. OLL 使用标准的 57 种情况之一
6. PLL 使用标准的 21 种情况之一
7. 确保解法能够正确还原魔方

${attempt > 1 ? `\n注意：这是第 ${attempt} 次尝试，之前的解法无法还原魔方。请仔细检查每一步。\n` : ''}

请以 JSON 格式返回：
{
  "cross": "F2 R2 B2 L2",
  "f2l": "R U R' U' R U R' U' R U R' U' R U R'",
  "oll": "R U2 R' U' R U R' U' R U' R'",
  "pll": "M2 U M U2 M' U M2"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的魔方 CFOP 解法专家，能够生成正确的 CFOP 解法。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('AI 返回空内容')
  }

  return JSON.parse(content)
}

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

    console.log('[CFOP-Verified] Generating solution for scramble:', trimmedScramble)
    
    // 获取 Kociemba 最优解作为参考
    let optimalMoves = 22
    let optimalSolution = ''
    try {
      Cube.initSolver()
      const cube = new Cube()
      cube.move(trimmedScramble)
      optimalSolution = cube.solve()
      optimalMoves = optimalSolution.split(' ').filter((s: string) => s).length
      console.log('[CFOP-Verified] Optimal solution:', optimalMoves, 'moves')
    } catch (e) {
      console.error('[CFOP-Verified] Failed to get optimal solution:', e)
    }
    
    // 尝试生成并验证解法（最多 3 次）
    let solution: any = null
    let fullSolution = ''
    let verified = false
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[CFOP-Verified] Attempt ${attempt}/3`)
      
      try {
        solution = await generateCFOPWithAI(trimmedScramble, attempt)
        fullSolution = `${solution.cross} ${solution.f2l} ${solution.oll} ${solution.pll}`.trim()
        
        // 验证解法
        verified = verifySolution(trimmedScramble, fullSolution)
        
        if (verified) {
          console.log(`[CFOP-Verified] ✅ Solution verified on attempt ${attempt}`)
          break
        } else {
          console.log(`[CFOP-Verified] ❌ Solution failed verification on attempt ${attempt}`)
        }
      } catch (e) {
        console.error(`[CFOP-Verified] Error on attempt ${attempt}:`, e)
      }
    }
    
    // 如果 3 次都失败，使用 Kociemba 作为回退
    if (!verified) {
      console.log('[CFOP-Verified] All attempts failed, using Kociemba fallback')
      return NextResponse.json({
        success: false,
        error: 'AI 生成的解法无法验证，请使用最优解',
        scramble: trimmedScramble,
        optimalSolution: optimalSolution,
        optimalMoves: optimalMoves
      })
    }
    
    // 计算步数
    const crossSteps = solution.cross.split(' ').filter((s: string) => s).length
    const f2lSteps = solution.f2l.split(' ').filter((s: string) => s).length
    const ollSteps = solution.oll.split(' ').filter((s: string) => s).length
    const pllSteps = solution.pll.split(' ').filter((s: string) => s).length
    const totalSteps = crossSteps + f2lSteps + ollSteps + pllSteps

    return NextResponse.json({
      success: true,
      verified: true,
      scramble: trimmedScramble,
      solution: {
        cross: {
          moves: solution.cross,
          steps: crossSteps,
          description: '完成白色底面十字'
        },
        f2l: {
          moves: solution.f2l,
          steps: f2lSteps,
          description: '完成前两层'
        },
        oll: {
          moves: solution.oll,
          steps: ollSteps,
          description: '完成顶面黄色朝向'
        },
        pll: {
          moves: solution.pll,
          steps: pllSteps,
          description: '完成最后一层排列'
        },
        totalSteps,
        fullSolution,
        orientation: '白底绿前',
        optimalReference: optimalMoves
      },
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
