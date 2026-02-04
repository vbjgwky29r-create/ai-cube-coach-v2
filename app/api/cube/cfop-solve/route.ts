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
  optimalReference: number
  isReferenceSolution: boolean // 标记这是参考解法
}

// 完整的 OLL 公式库（57 个情况）
const OLL_FORMULAS: Record<string, { alg: string; moves: number }> = {
  // Cross cases (最常见)
  'OLL 21': { alg: "R U2 R' U' R U R' U' R U' R'", moves: 11 },
  'OLL 22': { alg: "R U2 R2 U' R2 U' R2 U2 R", moves: 9 },
  'OLL 23': { alg: "R2 D' R U2 R' D R U2 R", moves: 9 },
  'OLL 24': { alg: "r U R' U' r' F R F'", moves: 8 },
  'OLL 25': { alg: "F' r U R' U' r' F R", moves: 8 },
  'OLL 26': { alg: "R U2 R' U' R U' R'", moves: 7 },
  'OLL 27': { alg: "R U R' U R U2 R'", moves: 7 },
  // T Shape
  'OLL 33': { alg: "R U R' U' R' F R F'", moves: 8 },
  'OLL 45': { alg: "F R U R' U' F'", moves: 6 },
  // P Shape
  'OLL 31': { alg: "R' U' F U R U' R' F' R", moves: 9 },
  'OLL 32': { alg: "L U F' U' L' U L F L'", moves: 9 },
  'OLL 43': { alg: "F' U' L' U L F", moves: 6 },
  'OLL 44': { alg: "F U R U' R' F'", moves: 6 },
  // Square Shape
  'OLL 5': { alg: "l' U2 L U L' U l", moves: 7 },
  'OLL 6': { alg: "r U2 R' U' R U' r'", moves: 7 },
  // Small Lightning Bolt
  'OLL 7': { alg: "r U R' U R U2 r'", moves: 7 },
  'OLL 8': { alg: "l' U' L U' L' U2 l", moves: 7 },
  'OLL 11': { alg: "r U R' U R' F R F' R U2 r'", moves: 11 },
  'OLL 12': { alg: "M' R' U' R U' R' U2 R U' R r'", moves: 11 },
  // Fish Shape
  'OLL 9': { alg: "R U R' U' R' F R2 U R' U' F'", moves: 11 },
  'OLL 10': { alg: "R U R' U R' F R F' R U2 R'", moves: 11 },
  'OLL 35': { alg: "R U2 R2 F R F' R U2 R'", moves: 9 },
  'OLL 37': { alg: "F R' F' R U R U' R'", moves: 8 },
  // Knight Move Shape
  'OLL 13': { alg: "F U R U' R2 F' R U R U' R'", moves: 11 },
  'OLL 14': { alg: "R' F R U R' F' R F U' F'", moves: 10 },
  'OLL 15': { alg: "l' U' l L' U' L U l' U l", moves: 10 },
  'OLL 16': { alg: "r U r' R U R' U' r U' r'", moves: 10 },
  // Corners Oriented
  'OLL 28': { alg: "r U R' U' r' R U R U' R'", moves: 10 },
  'OLL 57': { alg: "R U R' U' M' U R U' r'", moves: 9 },
  // C Shape
  'OLL 34': { alg: "R U R2 U' R' F R U R U' F'", moves: 11 },
  'OLL 46': { alg: "R' U' R' F R F' U R", moves: 8 },
  // W Shape
  'OLL 36': { alg: "L' U' L U' L' U L U L F' L' F", moves: 12 },
  'OLL 38': { alg: "R U R' U R U' R' U' R' F R F'", moves: 12 },
  // Big Lightning Bolt
  'OLL 39': { alg: "L F' L' U' L U F U' L'", moves: 9 },
  'OLL 40': { alg: "R' F R U R' U' F' U R", moves: 9 },
  // Awkward Shape
  'OLL 29': { alg: "R U R' U' R U' R' F' U' F R U R'", moves: 13 },
  'OLL 30': { alg: "F R' F R2 U' R' U' R U R' F2", moves: 11 },
  'OLL 41': { alg: "R U R' U R U2 R' F R U R' U' F'", moves: 13 },
  'OLL 42': { alg: "R' U' R U' R' U2 R F R U R' U' F'", moves: 13 },
  // I Shape
  'OLL 51': { alg: "F U R U' R' U R U' R' F'", moves: 10 },
  'OLL 52': { alg: "R U R' U R U' B U' B' R'", moves: 10 },
  'OLL 55': { alg: "R' F R U R U' R2 F' R2 U' R' U R U R'", moves: 15 },
  'OLL 56': { alg: "r' U' r U' R' U R U' R' U R r' U r", moves: 14 },
  // Small L Shape
  'OLL 47': { alg: "R' U' R' F R F' R' F R F' U R", moves: 12 },
  'OLL 48': { alg: "F R U R' U' R U R' U' F'", moves: 10 },
  'OLL 49': { alg: "r U' r2 U r2 U r2 U' r", moves: 9 },
  'OLL 50': { alg: "r' U r2 U' r2 U' r2 U r'", moves: 9 },
  'OLL 53': { alg: "l' U2 L U L' U' L U L' U l", moves: 11 },
  'OLL 54': { alg: "r U2 R' U' R U R' U' R U' r'", moves: 11 },
  // Dot cases
  'OLL 1': { alg: "R U2 R2 F R F' U2 R' F R F'", moves: 11 },
  'OLL 2': { alg: "r U r' U2 r U2 R' U2 R U' r'", moves: 11 },
  'OLL 3': { alg: "r' R2 U R' U r U2 r' U M'", moves: 10 },
  'OLL 4': { alg: "M U' r U2 r' U' R U' R' M'", moves: 10 },
  'OLL 17': { alg: "F R' F' R2 r' U R U' R' U' M'", moves: 11 },
  'OLL 18': { alg: "r U R' U R U2 r2 U' R U' R' U2 r", moves: 13 },
  'OLL 19': { alg: "r' R U R U R' U' M' R' F R F'", moves: 12 },
  'OLL 20': { alg: "r U R' U' M2 U R U' R' U' M'", moves: 11 },
}

// 完整的 PLL 公式库（21 个情况）
const PLL_FORMULAS: Record<string, { alg: string; moves: number }> = {
  // Edges Only
  'Ua': { alg: "M2 U M U2 M' U M2", moves: 7 },
  'Ub': { alg: "M2 U' M U2 M' U' M2", moves: 7 },
  'H': { alg: "M2 U M2 U2 M2 U M2", moves: 7 },
  'Z': { alg: "M' U M2 U M2 U M' U2 M2", moves: 9 },
  // Adjacent Corner Swap
  'Aa': { alg: "x L2 D2 L' U' L D2 L' U L'", moves: 9 },
  'Ab': { alg: "x' L2 D2 L U L' D2 L U' L", moves: 9 },
  'F': { alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", moves: 18 },
  'Ga': { alg: "R2 U R' U R' U' R U' R2 U' D R' U R D'", moves: 14 },
  'Gb': { alg: "R' U' R U D' R2 U R' U R U' R U' R2 D", moves: 14 },
  'Gc': { alg: "R2 U' R U' R U R' U R2 U D' R U' R' D", moves: 14 },
  'Gd': { alg: "R U R' U' D R2 U' R U' R' U R' U R2 D'", moves: 14 },
  'Ja': { alg: "x R2 F R F' R U2 r' U r U2", moves: 10 },
  'Jb': { alg: "R U R' F' R U R' U' R' F R2 U' R'", moves: 13 },
  'Ra': { alg: "R U' R' U' R U R D R' U' R D' R' U2 R'", moves: 14 },
  'Rb': { alg: "R2 F R U R U' R' F' R U2 R' U2 R", moves: 12 },
  'T': { alg: "R U R' U' R' F R2 U' R' U' R U R' F'", moves: 14 },
  // Diagonal Corner Swap
  'E': { alg: "x' L' U L D' L' U' L D L' U' L D' L' U L D", moves: 16 },
  'Na': { alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", moves: 20 },
  'Nb': { alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R", moves: 17 },
  'V': { alg: "R' U R' U' y R' F' R2 U' R' U R' F R F", moves: 14 },
  'Y': { alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'", moves: 17 },
}

// 获取 OLL 公式的平均步数
const OLL_AVG_MOVES = 9
// 获取 PLL 公式的平均步数
const PLL_AVG_MOVES = 12

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
    
    const solution = await generateCFOPSolution(trimmedScramble, optimalMoves)

    return NextResponse.json({
      success: true,
      scramble: trimmedScramble,
      solution,
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

async function generateCFOPSolution(scramble: string, optimalMoves: number): Promise<CFOPSolution> {
  // 更严格的 prompt，提供具体的公式参考
  const systemPrompt = `你是一位专业的魔方CFOP教练。生成高效的CFOP解法。

【重要】步数必须符合以下标准：
- Cross: 4-6步（绝对不超过6步）
- F2L: 每组配对5-7步，总共20-24步
- OLL: 使用标准公式6-11步
- PLL: 使用标准公式7-14步
- CFOP总步数通常在40-50步之间

【OLL公式参考】（选择匹配的情况）：
- OLL 26 (Sune): R U2 R' U' R U' R' (7步)
- OLL 27 (Anti-Sune): R U R' U R U2 R' (7步)
- OLL 21: R U2 R' U' R U R' U' R U' R' (11步)
- OLL 22: R U2 R2 U' R2 U' R2 U2 R (9步)
- OLL 45: F R U R' U' F' (6步)
- OLL 44: F U R U' R' F' (6步)
- OLL 33: R U R' U' R' F R F' (8步)

【PLL公式参考】（选择匹配的情况）：
- Ua: M2 U M U2 M' U M2 (7步)
- Ub: M2 U' M U2 M' U' M2 (7步)
- H: M2 U M2 U2 M2 U M2 (7步)
- T: R U R' U' R' F R2 U' R' U' R U R' F' (14步)
- Aa: x L2 D2 L' U' L D2 L' U L' (9步)
- Jb: R U R' F' R U R' U' R' F R2 U' R' (13步)

输出JSON格式（只输出JSON，不要其他文字）：
{"cross":{"moves":"...","steps":5,"description":"完成白色底面十字"},"f2l":{"moves":"...","steps":22,"pairs":["FR:5步","BR:6步","BL:5步","FL:6步"],"description":"完成前两层"},"oll":{"moves":"R U2 R' U' R U' R'","steps":7,"caseName":"OLL 26 (Sune)","description":"完成顶面黄色朝向"},"pll":{"moves":"M2 U M U2 M' U M2","steps":7,"caseName":"Ua Perm","description":"完成最后一层排列"},"totalSteps":41,"fullSolution":"...","orientation":"白底绿前"}`

  const userPrompt = `打乱公式: ${scramble}

生成高效的CFOP解法。严格要求：
1. Cross ≤ 6步
2. F2L 每组 ≤ 7步
3. OLL/PLL 必须使用标准公式
4. 只输出JSON`

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
  
  // 添加最优解参考和标记
  solution.optimalReference = optimalMoves
  solution.isReferenceSolution = true
  
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
  
  // 如果 Cross 步数异常（超过 8 步），标记需要优化
  if (solution.cross.steps > 8) {
    console.warn('[CFOP] Cross steps too high:', solution.cross.steps)
    // 不修改，但记录警告
  }
  
  // 如果 OLL 步数异常，使用标准公式替换
  if (solution.oll.steps > 15 || solution.oll.steps < 4) {
    const ollCase = solution.oll.caseName?.match(/OLL\s*(\d+)/)?.[0] || 'OLL 26'
    const formula = OLL_FORMULAS[ollCase] || OLL_FORMULAS['OLL 26']
    solution.oll.moves = formula.alg
    solution.oll.steps = formula.moves
    solution.oll.caseName = ollCase
  }
  
  // 如果 PLL 步数异常，使用标准公式替换
  if (solution.pll.steps > 20 || solution.pll.steps < 5) {
    const pllMatch = solution.pll.caseName?.match(/([A-Z][a-z]?)(?:\s*Perm)?/i)
    const pllCase = pllMatch ? pllMatch[1] : 'Ua'
    const formula = PLL_FORMULAS[pllCase] || PLL_FORMULAS['Ua']
    solution.pll.moves = formula.alg
    solution.pll.steps = formula.moves
    solution.pll.caseName = pllCase + ' Perm'
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
        temperature: 0.3, // 更低的温度以获得更稳定的输出
        max_tokens: 1000,
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
    temperature: 0.3,
    max_tokens: 1000,
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
