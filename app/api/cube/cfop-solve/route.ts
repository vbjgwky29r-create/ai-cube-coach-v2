import { NextRequest, NextResponse } from 'next/server'
// @ts-expect-error - cubejs doesn't have type definitions
import Cube from 'cubejs'

interface CFOPSolution {
  cross: {
    moves: string
    steps: number
    description: string
  }
  f2l: {
    moves: string
    steps: number
    pairs: string[]
    description: string
  }
  oll: {
    moves: string
    steps: number
    caseName: string
    description: string
  }
  pll: {
    moves: string
    steps: number
    caseName: string
    description: string
  }
  totalSteps: number
  fullSolution: string
  orientation: string
  optimalReference: number // Kociemba 最优解步数作为参考
}

// OLL 公式库（使用最短公式）
const OLL_FORMULAS: Record<string, { alg: string; moves: number }> = {
  'OLL 21': { alg: "R U2 R' U' R U R' U' R U' R'", moves: 11 },
  'OLL 22': { alg: "R U2 R2 U' R2 U' R2 U2 R", moves: 9 },
  'OLL 23': { alg: "R2 D' R U2 R' D R U2 R", moves: 9 },
  'OLL 24': { alg: "r U R' U' r' F R F'", moves: 8 },
  'OLL 25': { alg: "F' r U R' U' r' F R", moves: 8 },
  'OLL 26': { alg: "R U2 R' U' R U' R'", moves: 7 },
  'OLL 27': { alg: "R U R' U R U2 R'", moves: 7 },
  'OLL 33': { alg: "R U R' U' R' F R F'", moves: 8 },
  'OLL 45': { alg: "F R U R' U' F'", moves: 6 },
  'OLL 43': { alg: "F' U' L' U L F", moves: 6 },
  'OLL 44': { alg: "F U R U' R' F'", moves: 6 },
  'OLL 7': { alg: "r U R' U R U2 r'", moves: 7 },
  'OLL 8': { alg: "l' U' L U' L' U2 l", moves: 7 },
  'OLL 5': { alg: "l' U2 L U L' U l", moves: 7 },
  'OLL 6': { alg: "r U2 R' U' R U' r'", moves: 7 },
  'OLL 37': { alg: "F R' F' R U R U' R'", moves: 8 },
  'OLL 46': { alg: "R' U' R' F R F' U R", moves: 8 },
  'OLL 28': { alg: "r U R' U' r' R U R U' R'", moves: 10 },
  'OLL 57': { alg: "R U R' U' M' U R U' r'", moves: 9 },
}

// PLL 公式库（使用最短公式）
const PLL_FORMULAS: Record<string, { alg: string; moves: number }> = {
  'Ua': { alg: "M2 U M U2 M' U M2", moves: 7 },
  'Ub': { alg: "M2 U' M U2 M' U' M2", moves: 7 },
  'H': { alg: "M2 U M2 U2 M2 U M2", moves: 7 },
  'Z': { alg: "M' U M2 U M2 U M' U2 M2", moves: 9 },
  'Aa': { alg: "x L2 D2 L' U' L D2 L' U L'", moves: 9 },
  'Ab': { alg: "x' L2 D2 L U L' D2 L U' L", moves: 9 },
  'Ja': { alg: "x R2 F R F' R U2 r' U r U2", moves: 10 },
  'Jb': { alg: "R U R' F' R U R' U' R' F R2 U' R'", moves: 13 },
  'T': { alg: "R U R' U' R' F R2 U' R' U' R U R' F'", moves: 14 },
  'Rb': { alg: "R2 F R U R U' R' F' R U2 R' U2 R", moves: 12 },
  'Ra': { alg: "R U' R' U' R U R D R' U' R D' R' U2 R'", moves: 14 },
  'F': { alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", moves: 18 },
  'Ga': { alg: "R2 U R' U R' U' R U' R2 U' D R' U R D'", moves: 14 },
  'Gb': { alg: "R' U' R U D' R2 U R' U R U' R U' R2 D", moves: 14 },
  'Gc': { alg: "R2 U' R U' R U R' U R2 U D' R U' R' D", moves: 14 },
  'Gd': { alg: "R U R' U' D R2 U' R U' R' U R' U R2 D'", moves: 14 },
  'E': { alg: "x' L' U L D' L' U' L D L' U' L D' L' U L D", moves: 16 },
  'Na': { alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", moves: 20 },
  'Nb': { alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R", moves: 17 },
  'V': { alg: "R' U R' U' y R' F' R2 U' R' U R' F R F", moves: 14 },
  'Y': { alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'", moves: 17 },
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

    console.log('[CFOP] Generating solution for scramble:', trimmedScramble)
    
    // 获取 Kociemba 最优解作为参考
    let optimalMoves = 22 // 默认值
    try {
      Cube.initSolver()
      const cube = new Cube()
      cube.move(trimmedScramble)
      const optimalSolution = cube.solve()
      optimalMoves = optimalSolution.split(' ').filter((s: string) => s).length
      console.log('[CFOP] Optimal solution:', optimalMoves, 'moves')
    } catch (e) {
      console.error('[CFOP] Failed to get optimal solution:', e)
    }
    
    const solution = await generateCFOPSolution(trimmedScramble, optimalMoves)

    return NextResponse.json({
      success: true,
      scramble: trimmedScramble,
      solution,
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

async function generateCFOPSolution(scramble: string, optimalMoves: number): Promise<CFOPSolution> {
  // 专业级 prompt，强调步数约束
  const systemPrompt = `你是一位专业的魔方CFOP教练。生成高效的CFOP解法。

严格步数约束：
- Cross: 最多6步（通常4-5步）
- F2L: 每组配对最多8步，总共最多28步（通常20-24步）
- OLL: 使用标准公式，最多11步
- PLL: 使用标准公式，最多14步
- 总步数应接近${optimalMoves + 20}步（Kociemba最优解是${optimalMoves}步）

输出JSON格式：
{"cross":{"moves":"F2 R U R' F2 U'","steps":6,"description":"完成白色底面十字"},"f2l":{"moves":"U R U' R' U' F' U F ...","steps":24,"pairs":["FR槽位:5步","BR槽位:6步","BL槽位:6步","FL槽位:7步"],"description":"完成前两层"},"oll":{"moves":"R U2 R' U' R U' R'","steps":7,"caseName":"OLL 26 (Sune)","description":"完成顶面黄色朝向"},"pll":{"moves":"M2 U M U2 M' U M2","steps":7,"caseName":"Ua Perm","description":"完成最后一层排列"},"totalSteps":44,"fullSolution":"...","orientation":"白底绿前"}`

  const userPrompt = `打乱公式: ${scramble}

请生成高效的CFOP解法。注意：
1. Cross必须在6步以内完成
2. F2L每组配对控制在6-8步
3. OLL/PLL使用标准公式
4. 只输出JSON，不要其他文字`

  // 检查是否使用火山引擎 API
  const volcengineApiKey = process.env.VOLCENGINE_API_KEY
  const volcengineModel = process.env.VOLCENGINE_MODEL
  
  let solution: CFOPSolution
  
  if (volcengineApiKey && volcengineModel) {
    console.log('[CFOP] Using Volcengine API')
    solution = await callVolcengineAPI(systemPrompt, userPrompt, volcengineApiKey, volcengineModel)
  } else {
    console.log('[CFOP] Using OpenAI API')
    solution = await callOpenAIAPI(systemPrompt, userPrompt)
  }
  
  // 添加最优解参考
  solution.optimalReference = optimalMoves
  
  // 验证和修正步数
  solution = validateAndFixSolution(solution)
  
  return solution
}

function validateAndFixSolution(solution: CFOPSolution): CFOPSolution {
  // 确保步数计算正确
  const countMoves = (moves: string): number => {
    if (!moves || moves.trim() === '') return 0
    return moves.trim().split(/\s+/).filter(m => m.match(/^[RLUDFBrludfbMESxyz]['2]?$/)).length
  }
  
  // 重新计算步数
  solution.cross.steps = countMoves(solution.cross.moves)
  solution.f2l.steps = countMoves(solution.f2l.moves)
  solution.oll.steps = countMoves(solution.oll.moves)
  solution.pll.steps = countMoves(solution.pll.moves)
  
  // 计算总步数
  solution.totalSteps = solution.cross.steps + solution.f2l.steps + solution.oll.steps + solution.pll.steps
  
  // 生成完整解法
  solution.fullSolution = [
    solution.cross.moves,
    solution.f2l.moves,
    solution.oll.moves,
    solution.pll.moves
  ].filter(m => m).join(' ')
  
  // 如果 OLL 步数异常，尝试使用标准公式
  if (solution.oll.steps > 15 || solution.oll.steps < 4) {
    const ollCase = solution.oll.caseName?.match(/OLL\s*(\d+)/)?.[0] || 'OLL 26'
    const formula = OLL_FORMULAS[ollCase] || OLL_FORMULAS['OLL 26']
    solution.oll.moves = formula.alg
    solution.oll.steps = formula.moves
  }
  
  // 如果 PLL 步数异常，尝试使用标准公式
  if (solution.pll.steps > 20 || solution.pll.steps < 5) {
    const pllCase = solution.pll.caseName?.match(/([A-Z][a-z]?)\s*Perm/)?.[1] || 'Ua'
    const formula = PLL_FORMULAS[pllCase] || PLL_FORMULAS['Ua']
    solution.pll.moves = formula.alg
    solution.pll.steps = formula.moves
  }
  
  // 重新计算总步数
  solution.totalSteps = solution.cross.steps + solution.f2l.steps + solution.oll.steps + solution.pll.steps
  solution.fullSolution = [
    solution.cross.moves,
    solution.f2l.moves,
    solution.oll.moves,
    solution.pll.moves
  ].filter(m => m).join(' ')
  
  return solution
}

async function callVolcengineAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string
): Promise<CFOPSolution> {
  const baseURL = 'https://ark.cn-beijing.volces.com/api/v3'
  
  try {
    console.log('[CFOP] Calling Volcengine API with model:', model)
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5, // 降低温度以获得更稳定的输出
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Volcengine API error: ${response.status} ${errorText}`)
      throw new Error(`Volcengine API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in Volcengine API response')
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Volcengine API call failed:', error)
    throw error
  }
}

async function callOpenAIAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<CFOPSolution> {
  const { OpenAI } = await import('openai')
  
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const client = new OpenAI({ apiKey })

  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 800,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content in OpenAI API response')
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in response')
  }

  return JSON.parse(jsonMatch[0])
}
