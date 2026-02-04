/**
 * 本地测试 OCR 功能
 * 使用方法: npx ts-node scripts/test-ocr.ts
 */

import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

const client = new OpenAI()

/**
 * 后处理：修正常见的 OCR 识别错误
 */
function postProcessFormula(text: string): string {
  let result = text
  
  // 移除多余的空格和换行
  result = result.replace(/\s+/g, ' ').trim()
  
  // 修正常见错误
  result = result.replace(/[''`´]/g, "'")
  result = result.replace(/[²]/g, "2")
  result = result.replace(/\b([urfdlbmesxyz])(['2]?)\b/gi, (match, letter, modifier) => {
    return letter.toUpperCase() + (modifier || '')
  })
  result = result.replace(/([URFDLBMESXYZ])\s+(['2])/g, '$1$2')
  result = result.replace(/([URFDLBMESXYZ]['2]?)(?=[URFDLBMESXYZ])/g, '$1 ')
  result = result.replace(/[^URFDLBMESXYZ'2\s]/gi, '')
  result = result.replace(/\s+/g, ' ').trim()
  
  return result
}

async function testOcr() {
  console.log('=== 测试 OCR 功能 ===\n')
  
  // 读取测试图片
  const imagePath = path.join(__dirname, '..', 'test-ocr-image.png')
  
  if (!fs.existsSync(imagePath)) {
    console.error('测试图片不存在:', imagePath)
    process.exit(1)
  }
  
  const imageBuffer = fs.readFileSync(imagePath)
  const base64 = imageBuffer.toString('base64')
  const imageUrl = `data:image/png;base64,${base64}`
  
  console.log('图片大小:', Math.round(imageBuffer.length / 1024), 'KB')
  console.log('正在调用 OpenAI Vision API...\n')
  
  try {
    const response = await client.chat.completions.create({
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
      temperature: 0.1
    })

    const content = response.choices[0]?.message?.content || ''
    
    console.log('=== 原始响应 ===')
    console.log(content)
    console.log()
    
    // 解析响应
    const scrambleMatch = content.match(/SCRAMBLE:\s*(.*)/)
    const solutionMatch = content.match(/SOLUTION:\s*(.*)/)
    
    let scramble = scrambleMatch ? scrambleMatch[1].trim() : ''
    let solution = solutionMatch ? solutionMatch[1].trim() : ''
    
    console.log('=== 解析结果 ===')
    console.log('打乱公式 (原始):', scramble)
    console.log('复原公式 (原始):', solution)
    console.log()
    
    // 后处理
    scramble = postProcessFormula(scramble)
    solution = postProcessFormula(solution)
    
    console.log('=== 后处理结果 ===')
    console.log('打乱公式:', scramble)
    console.log('复原公式:', solution)
    console.log()
    
    // 验证
    console.log('=== 验证 ===')
    const expectedScramble = "U' R' L U' B D' F' U' L F R2 L2 D' F2 R2 F2 R2 U2 B2 R2 F2"
    console.log('期望打乱:', expectedScramble)
    console.log('打乱匹配:', scramble === expectedScramble ? '✅ 完全匹配' : '❌ 不匹配')
    
    // 计算相似度
    const scrambleWords = scramble.split(' ')
    const expectedWords = expectedScramble.split(' ')
    let matchCount = 0
    for (let i = 0; i < Math.min(scrambleWords.length, expectedWords.length); i++) {
      if (scrambleWords[i] === expectedWords[i]) matchCount++
    }
    console.log('打乱相似度:', `${matchCount}/${expectedWords.length} (${Math.round(matchCount/expectedWords.length*100)}%)`)
    
  } catch (error) {
    console.error('OCR 测试失败:', error)
  }
}

testOcr()
