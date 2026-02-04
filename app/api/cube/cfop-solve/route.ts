import { NextRequest, NextResponse } from 'next/server'

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
  // 简化的 system prompt，减少 token 数量
  const systemPrompt = `生成CFOP魔方解法JSON：
{"cross":{"moves":"...","steps":4,"description":"..."},"f2l":{"moves":"...","steps":20,"pairs":["...","...","...","..."],"description":"..."},"oll":{"moves":"...","steps":7,"caseName":"...","description":"..."},"pll":{"moves":"...","steps":10,"caseName":"...","description":"..."},"totalSteps":41,"fullSolution":"...","orientation":"白底"}
要求：简洁实用，快速生成。`

  const userPrompt = `打乱: ${scramble}\n生成CFOP解法JSON。`

  // 检查是否使用火山引擎 API
  const volcengineApiKey = process.env.VOLCENGINE_API_KEY
  const volcengineModel = process.env.VOLCENGINE_MODEL
  
  if (volcengineApiKey && volcengineModel) {
    console.log('[CFOP] Using Volcengine API')
    return await callVolcengineAPI(systemPrompt, userPrompt, volcengineApiKey, volcengineModel)
  }
  
  // 否则使用 OpenAI API
  console.log('[CFOP] Using OpenAI API')
  return await callOpenAIAPI(systemPrompt, userPrompt)
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
    
    // 火山引擎使用 /chat/completions 端点（兼容 OpenAI 格式）
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Volcengine API error: ${response.status} ${errorText}`)
      throw new Error(`Volcengine API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[CFOP] Volcengine API response received')
    
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('No content in Volcengine API response')
    }

    // 解析 JSON 响应
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const solution = JSON.parse(jsonMatch[0])
    return solution
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

  const client = new OpenAI({
    apiKey,
  })

  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 600,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content in OpenAI API response')
  }

  // 解析 JSON 响应
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in response')
  }

  const solution = JSON.parse(jsonMatch[0])
  return solution
}
