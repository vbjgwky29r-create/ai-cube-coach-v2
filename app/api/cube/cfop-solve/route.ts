/**
 * AI CFOP 解法 API
 * 
 * 使用 OpenAI API 生成符合人类思维的 CFOP 解法
 * 包含 Cross → F2L → OLL → PLL 四个阶段
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 延迟初始化 OpenAI 客户端，避免构建时报错
let client: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.VOLCENGINE_API_KEY || process.env.OPENAI_API_KEY
    const baseURL = process.env.VOLCENGINE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
    console.log('[CFOP] Initializing client, API key exists:', !!apiKey)
    console.log('[CFOP] Base URL:', baseURL)
    if (!apiKey) {
      throw new Error('VOLCENGINE_API_KEY or OPENAI_API_KEY environment variable is not set')
    }
    client = new OpenAI({ 
      apiKey,
      baseURL 
    })
  }
  return client
}

interface CFOPSolution {
  cross: {
    moves: string
    steps: number
    description: string
  }
  f2l: {
    moves: string
    steps: number
    pairs: string[]  // 4 个 F2L 对的描述
    description: string
  }
  oll: {
    moves: string
    steps: number
    caseName: string  // OLL 情况名称
    description: string
  }
  pll: {
    moves: string
    steps: number
    caseName: string  // PLL 情况名称
    description: string
  }
  totalSteps: number
  fullSolution: string
  orientation: string  // 使用的底色，如 "白底绿前"
}

export async function POST(request: NextRequest) {
  try {
    const { scramble } = await request.json()

    if (!scramble || typeof scramble !== 'string') {
      return NextResponse.json(
        { error: '请提供打乱公式' },
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

    // 调用 AI 生成 CFOP 解法
    const solution = await generateCFOPSolution(trimmedScramble)

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

async function generateCFOPSolution(scramble: string): Promise<CFOPSolution> {
  const systemPrompt = `你是一位专业的魔方教练，精通 CFOP 解法。你的任务是为给定的打乱公式生成一个符合人类思维的 CFOP 解法。

解法要求：
1. 使用标准魔方记号（R, L, U, D, F, B 及其变体 ', 2）
2. 按照 CFOP 四个阶段分解：Cross（底层十字）→ F2L（前两层）→ OLL（顶层朝向）→ PLL（顶层排列）
3. 选择最优的底色（通常是白底或黄底，选择 Cross 最简单的那个）
4. F2L 阶段要分别描述 4 个角块-棱块对的插入
5. OLL 和 PLL 要识别具体的情况名称（如 OLL 21, T-Perm 等）
6. 每个阶段都要有简短的中文说明

输出格式必须是严格的 JSON，结构如下：
{
  "cross": {
    "moves": "D R' F D2",
    "steps": 4,
    "description": "白色十字，先放置白红棱块"
  },
  "f2l": {
    "moves": "U R U' R' U' F' U F | U2 R U R' U R U' R' | ...",
    "steps": 28,
    "pairs": [
      "红绿角块配对插入",
      "橙绿角块配对插入",
      "红蓝角块配对插入",
      "橙蓝角块配对插入"
    ],
    "description": "四个 F2L 对依次插入"
  },
  "oll": {
    "moves": "R U2 R' U' R U' R'",
    "steps": 7,
    "caseName": "OLL 21 (Cross)",
    "description": "十字情况，调整四个角块朝向"
  },
  "pll": {
    "moves": "R U R' U' R' F R2 U' R' U' R U R' F'",
    "steps": 14,
    "caseName": "T-Perm",
    "description": "T 排列，交换两个角块和两个棱块"
  },
  "totalSteps": 53,
  "fullSolution": "D R' F D2 U R U' R' ...",
  "orientation": "白底绿前"
}`

  const userPrompt = `打乱公式: ${scramble}

请生成 CFOP 解法。注意：
1. 解法必须能够正确还原魔方
2. 选择最优的底色
3. 使用常见的 F2L、OLL、PLL 公式
4. 只输出 JSON，不要有其他文字`

  const model = process.env.VOLCENGINE_MODEL || 'gpt-4.1-mini'
  console.log('[CFOP] Using model:', model)
  
  const response = await getOpenAIClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  })

  const content = response.choices[0]?.message?.content || ''
  
  // 解析 JSON
  try {
    // 尝试提取 JSON（可能被包裹在 markdown 代码块中）
    let jsonStr = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }
    
    const solution = JSON.parse(jsonStr.trim()) as CFOPSolution
    return solution
  } catch (parseError) {
    console.error('Failed to parse CFOP solution:', parseError)
    console.error('Raw content:', content)
    
    // 返回一个默认的解法结构
    return {
      cross: {
        moves: '',
        steps: 0,
        description: '解析失败'
      },
      f2l: {
        moves: '',
        steps: 0,
        pairs: [],
        description: '解析失败'
      },
      oll: {
        moves: '',
        steps: 0,
        caseName: '',
        description: '解析失败'
      },
      pll: {
        moves: '',
        steps: 0,
        caseName: '',
        description: '解析失败'
      },
      totalSteps: 0,
      fullSolution: '',
      orientation: '白底绿前'
    }
  }
}
