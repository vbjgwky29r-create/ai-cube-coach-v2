/**
 * 魔方公式 OCR 识别 API
 * 使用 OpenAI Vision API 识别魔方星球截图中的公式
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 延迟初始化 OpenAI 客户端，避免构建时报错
let client: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI()
  }
  return client
}

/**
 * 后处理：修正常见的 OCR 识别错误
 */
function postProcessFormula(text: string): string {
  let result = text
  
  // 移除多余的空格和换行
  result = result.replace(/\s+/g, ' ').trim()
  
  // 修正常见错误
  // 1. 将 ' 的变体统一为标准的 '
  result = result.replace(/[''`´]/g, "'")
  
  // 2. 确保数字 2 正确（有时被识别为其他字符）
  result = result.replace(/[²]/g, "2")
  
  // 3. 修正字母大小写（魔方公式使用大写字母）
  result = result.replace(/\b([urfdlbmesxyz])(['2]?)\b/gi, (match, letter, modifier) => {
    return letter.toUpperCase() + (modifier || '')
  })
  
  // 4. 确保修饰符正确（' 和 2）
  // 移除字母和修饰符之间的空格
  result = result.replace(/([URFDLBMESXYZ])\s+(['2])/g, '$1$2')
  
  // 5. 添加空格分隔（如果公式是连续的）
  result = result.replace(/([URFDLBMESXYZ]['2]?)(?=[URFDLBMESXYZ])/g, '$1 ')
  
  // 6. 移除非法字符
  result = result.replace(/[^URFDLBMESXYZ'2\s]/gi, '')
  
  // 7. 最终清理：确保单词之间只有一个空格
  result = result.replace(/\s+/g, ' ').trim()
  
  return result
}

/**
 * POST /api/ocr/cube-formula
 * 接收图片 base64，使用 OpenAI Vision 识别魔方公式
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    // 构建图片 URL（支持 base64 和 URL）
    const imageUrl = image.startsWith('http') 
      ? image 
      : `data:image/png;base64,${image}`

    // 调用 OpenAI Vision API
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的魔方公式识别专家。你的任务是从魔方星球（Cube Planet）应用的截图中精确提取打乱公式和复原公式。

魔方公式使用以下记号：
- 基础面转动：U, R, F, D, L, B（分别代表上、右、前、下、左、后）
- 中层转动：M, E, S
- 整体转动：x, y, z
- 修饰符：' 表示逆时针（90度），2 表示180度

重要规则：
1. 每个动作由一个字母和可选的修饰符组成，如：U, U', U2, R, R', R2
2. 动作之间用空格分隔
3. ' 是撇号（逆时针标记），不是数字 1 或字母 l
4. 2 是数字二，表示转动 180 度
5. 所有字母都是大写

请仔细识别图片中的：
1. "打乱公式"区域的内容
2. "复原公式"区域的内容

输出格式（严格遵守）：
SCRAMBLE: [打乱公式]
SOLUTION: [复原公式]

如果某个区域无法识别，输出 SCRAMBLE: 或 SOLUTION: 后留空。`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请识别这张魔方星球截图中的打乱公式和复原公式。注意区分 \' (撇号) 和 2 (数字二)。'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1 // 低温度以获得更稳定的输出
    })

    const content = response.choices[0]?.message?.content || ''
    
    // 解析响应
    const scrambleMatch = content.match(/SCRAMBLE:\s*(.*)/)
    const solutionMatch = content.match(/SOLUTION:\s*(.*)/)
    
    let scramble = scrambleMatch ? scrambleMatch[1].trim() : ''
    let solution = solutionMatch ? solutionMatch[1].trim() : ''
    
    // 后处理修正常见错误
    scramble = postProcessFormula(scramble)
    solution = postProcessFormula(solution)

    console.log('[OCR Cube Formula] 原始响应:', content)
    console.log('[OCR Cube Formula] 处理后 - 打乱:', scramble)
    console.log('[OCR Cube Formula] 处理后 - 解法:', solution)

    return NextResponse.json({
      scramble,
      solution,
      raw: content // 返回原始响应用于调试
    })

  } catch (error: unknown) {
    console.error('[OCR Cube Formula] 错误:', error)
    const errorMessage = error instanceof Error ? error.message : 'OCR识别失败'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
