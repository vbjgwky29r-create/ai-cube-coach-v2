/**
 * OCR 识别工具
 * 使用百度云端 OCR 进行高精度文字识别
 */

import Tesseract from 'tesseract.js'

/**
 * 识别结果
 */
export interface OCRResult {
  scramble: string
  solution: string
  confidence: number
  rawText: string
  debug?: {
    extractedScramble: string
    extractedSolution: string
    rawLines: string[]
    allFormulas?: string[]
  }
}

/**
 * 调用后端百度OCR API
 */
async function recognizeWithBaiduAPI(imageFile: File | Blob): Promise<{ text: string; wordsResult: Array<{ words: string }> }> {
  console.log('[OCR] 调用百度OCR API...')

  // 将图片转换为 base64
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 去掉 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(imageFile)
  })

  // 调用后端 API
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'OCR识别失败')
  }

  const data = await response.json()
  return {
    text: data.text,
    wordsResult: data.wordsResult
  }
}

/**
 * 从文本中提取所有可能的魔方公式
 */
function extractAllPossibleFormulas(text: string): string[] {
  const formulas: string[] = []

  // 模式1: 标准空格分隔的公式 (至少3个动作)
  const pattern1 = text.match(/\b[RLUDFBrludfb][2']?\s+[RLUDFBrludfb][2']?\s+[RLUDFBrludfb][2']?\b/g)
  if (pattern1) {
    formulas.push(...pattern1.map(f => f.trim()))
  }

  // 模式2: 按行分析 - 查找包含大量魔方字符的行
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    const cubeChars = (trimmed.match(/[RLUDFBrludfb'2]/g) || []).length
    if (cubeChars >= 8) {
      const formulaMatch = trimmed.match(/[RLUDFBrludfb'2\s]+/g)
      if (formulaMatch) {
        formulas.push(formulaMatch.join(' '))
      }
    }
  }

  return formulas
}

/**
 * 清理公式字符串
 */
function cleanFormula(formula: string): string {
  let cleaned = formula
    .replace(/[\u3000\u3001\u3002]/g, ' ')
    .replace(/[０-９Ａ-ｚａ-ｚ］［：]/g, (c) => {
      const code = c.charCodeAt(0)
      return String.fromCharCode(code - 65248)
    })
    .replace(/[^RLUDFBrludfbxyzMESmes'2\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  cleaned = fixOCRErrors(cleaned)
  return cleaned
}

/**
 * 修正OCR常见的识别错误
 * 云端OCR对单引号识别不准，需要特别处理
 */
function fixOCRErrors(formula: string): string {
  let fixed = formula

  // OCR经常把 ' 识别错或丢失，尝试根据上下文推断
  // 例如：FF 可能是 F' F 或 F F'，但魔方公式很少连续相同动作
  fixed = fixed.replace(/([RLUDFBrludfb])\1/g, (m) => m[0] + "'")

  // 常见OCR错误修正
  fixed = fixed.replace(/[RLUDFBrludfb]`/g, (m) => m[0] + "'")
  fixed = fixed.replace(/[RLUDFBrludfb],/g, (m) => m[0] + "'")
  fixed = fixed.replace(/[RLUDFBrludfb]\./g, (m) => m[0] + "'")

  // 处理合并的公式字符
  const parts: string[] = []
  for (const part of fixed.split(/\s+/).filter(p => p.length > 0)) {
    const moves = part.match(/[RLUDFBrludfb][2']?/g)
    if (moves && moves.length > 1) {
      parts.push(...moves)
    } else {
      parts.push(part)
    }
  }
  fixed = parts.join(' ')

  // 修复连续的数字
  fixed = fixed.replace(/([RLUDFBrludfb])22+/g, '$12')

  // 修复缺失的空格
  fixed = fixed.replace(/([RLUDFBrludfb][2']?)([RLUDFBrludfb])/g, '$1 $2')

  return fixed
}

/**
 * 清理OCR识别结果中的垃圾内容
 * 过滤掉明显错误的重复模式
 */
function cleanGarbageContent(text: string): string {
  const lines = text.split('\n')
  const cleanedLines: string[] = []

  for (const line of lines) {
    // 跳过包含过多重复字符的行（如 LLLLL）
    if (/([A-Z])\1{3,}/i.test(line)) {
      continue
    }
    // 跳过包含明显非魔方公式的内容
    if (/[录像回放]|CROSS|F2L|OLL|PLL|CFOP/i.test(line)) {
      continue
    }
    cleanedLines.push(line)
  }

  return cleanedLines.join('\n')
}

function countMoves(formula: string): number {
  return formula.split(/\s+/).filter(p => p.length > 0).length
}

/**
 * 从截图中识别魔方公式
 * 优先使用百度云端 OCR，回退到 Tesseract.js
 */
export async function recognizeCubeFormulas(imageFile: File | Blob): Promise<OCRResult> {
  console.log('开始OCR识别...')

  let rawText = ''
  let confidence = 0
  let ocrEngine = 'unknown'

  // 优先使用百度云端 OCR
  try {
    console.log('[OCR] 尝试使用百度云端OCR...')
    const baiduResult = await recognizeWithBaiduAPI(imageFile)
    rawText = baiduResult.text
    confidence = 85
    ocrEngine = 'BaiduOCR'
    console.log('[OCR] 百度OCR识别成功')
  } catch (e: any) {
    console.warn('[OCR] 百度OCR失败，回退到Tesseract:', e.message)
  }

  // 回退到 Tesseract.js
  if (!rawText) {
    console.log('[OCR] 使用Tesseract.js识别...')
    const result = await Tesseract.recognize(
      imageFile,
      'eng+chi_sim',
      {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        },
      }
    )
    rawText = result.data.text
    confidence = result.data.confidence
    ocrEngine = 'Tesseract'
  }

  console.log(`[OCR] 使用引擎: ${ocrEngine}`)
  console.log('[OCR] 识别原始文本:', rawText)
  console.log('[OCR] 置信度:', confidence)

  // 清理垃圾内容
  rawText = cleanGarbageContent(rawText)
  console.log('[OCR] 清理后文本:', rawText)

  // 将文本按行分割
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  console.log('识别的行数:', lines.length)

  // 提取所有可能的公式
  const allPossibleFormulas = extractAllPossibleFormulas(rawText)
  console.log('[OCR] 找到的所有可能公式:', allPossibleFormulas)

  // 清理并去重
  const cleanedFormulas = [...new Set(allPossibleFormulas.map(f => cleanFormula(f)))]
    .filter(f => f.length >= 3)
    .filter(f => countMoves(f) >= 3)
    .sort((a, b) => countMoves(a) - countMoves(b))

  // 从标签区域提取
  let sectionScramble = ''
  let sectionSolution = ''

  const hasScrambleKeyword = (l: string) => {
    const noSpace = l.replace(/\s/g, '')
    return noSpace.includes('打乱') ||
           (l.includes('打') && l.includes('乱')) ||
           l.toLowerCase().includes('scramble')
  }

  const hasSolutionKeyword = (l: string) => {
    const noSpace = l.replace(/\s/g, '')
    // "复原公式"优先于"解法"，避免"解法：CFOP"这样的行被误认为标签
    if (noSpace.includes('复原公式') || noSpace.includes('复原')) return true
    if (noSpace.includes('解法公式')) return true  // 必须是"解法公式"而不是单独的"解法"
    if (l.toLowerCase().includes('solution')) return true
    return false
  }

  const isLikelyLabel = (l: string, hasKeyword: boolean) => {
    if (!hasKeyword) return false
    // 标签通常较短，或者只包含关键词和少量其他字符
    const noSpace = l.replace(/\s/g, '')
    if (noSpace.length <= 15) return true
    // 如果包含"公式"二字，更可能是标签
    if (l.includes('公式')) return true
    return false
  }

  const scrambleCandidates = lines.map((l, i) => ({ line: l, index: i, isLabel: isLikelyLabel(l, hasScrambleKeyword(l)) }))
    .filter(x => hasScrambleKeyword(x.line))

  const solutionCandidates = lines.map((l, i) => ({ line: l, index: i, isLabel: isLikelyLabel(l, hasSolutionKeyword(l)) }))
    .filter(x => hasSolutionKeyword(x.line))

  console.log('[OCR] 打乱候选:', scrambleCandidates.map(x => ({idx: x.index, line: x.line.substring(0,20), isLabel: x.isLabel})))
  console.log('[OCR] 解法候选:', solutionCandidates.map(x => ({idx: x.index, line: x.line.substring(0,20), isLabel: x.isLabel})))

  const scrambleKeywordIndex = scrambleCandidates.length > 0
    ? (scrambleCandidates.find(x => x.isLabel)?.index ?? scrambleCandidates[0].index)
    : -1

  const solutionKeywordIndex = solutionCandidates.length > 0
    ? (solutionCandidates.find(x => x.isLabel)?.index ?? solutionCandidates[0].index)
    : -1

  console.log('[OCR] 打乱关键词索引:', scrambleKeywordIndex, '解法关键词索引:', solutionKeywordIndex)

  // 提取打乱
  if (scrambleKeywordIndex >= 0) {
    let scrambleParts: string[] = []
    // 只有当解法关键词在打乱关键词之后，才用它作为结束标记
    const endIndex = solutionKeywordIndex >= 0 && solutionKeywordIndex > scrambleKeywordIndex
      ? solutionKeywordIndex
      : Math.min(scrambleKeywordIndex + 4, lines.length) // 最多取关键词后4行

    for (let i = scrambleKeywordIndex + 1; i < endIndex; i++) {
      const moves = (lines[i].match(/[RLUDFBrludfb][2']?/g) || [])
      if (moves.length > 0) {
        scrambleParts.push(...moves)
      }
    }

    // 打乱公式通常 15-25 步
    if (scrambleParts.length >= 15 && scrambleParts.length <= 25) {
      sectionScramble = scrambleParts.join(' ')
      console.log('[OCR] 从打乱区域提取:', sectionScramble, `(${scrambleParts.length}步)`)
    } else if (scrambleParts.length > 25) {
      // 步数太多，只取前20步
      sectionScramble = scrambleParts.slice(0, 20).join(' ')
      console.log('[OCR] 打乱步数过多，截取前20步:', sectionScramble)
    } else if (scrambleParts.length >= 10) {
      // 步数较少但也接受
      sectionScramble = scrambleParts.join(' ')
      console.log('[OCR] 从打乱区域提取(步数偏少):', sectionScramble, `(${scrambleParts.length}步)`)
    }
  }

  // 提取解法 - 只提取在解法关键词之后、且不在打乱区域的内容
  if (solutionKeywordIndex >= 0) {
    let solutionParts: string[] = []
    // 如果解法关键词在打乱关键词之前，从解法后开始到打乱前，或到结尾
    const startIndex = solutionKeywordIndex + 1
    const endIndex = scrambleKeywordIndex > solutionKeywordIndex
      ? scrambleKeywordIndex
      : Math.min(solutionKeywordIndex + 30, lines.length) // 最多30行（解法可能很长）

    for (let i = startIndex; i < endIndex; i++) {
      const moves = (lines[i].match(/[RLUDFBrludfb][2']?/g) || [])
      if (moves.length > 0) {
        solutionParts.push(...moves)
      }
    }

    // 解法通常较长，但也要有最低限制
    if (solutionParts.length >= 20) {
      sectionSolution = solutionParts.join(' ')
      console.log('[OCR] 从解法区域提取:', sectionSolution, `(${solutionParts.length}步)`)
    }
  }

  console.log('[OCR] 清理后的公式:', cleanedFormulas.map(f => `${countMoves(f)}步: ${f}`))

  // 智能判断打乱和解法
  let scramble = ''
  let solution = ''

  // 优先使用基于关键词区域的提取结果（最准确）
  if (sectionScramble) {
    scramble = sectionScramble
    console.log('[OCR] 使用区域提取的打乱:', scramble)
  }
  if (sectionSolution) {
    solution = sectionSolution
    console.log('[OCR] 使用区域提取的解法:', solution)
  }

  // 如果区域提取失败，使用智能选择
  if (!scramble || !solution) {
    if (cleanedFormulas.length === 0) {
      console.log('[OCR] 未找到任何公式')
    } else if (cleanedFormulas.length === 1) {
      // 只有一个公式：短的是打乱，长的是解法
      const moves = countMoves(cleanedFormulas[0])
      if (moves >= 5 && moves <= 30 && !scramble) {
        scramble = cleanedFormulas[0]
        console.log('[OCR] 单公式作为打乱:', scramble)
      } else if (!solution) {
        solution = cleanedFormulas[0]
        console.log('[OCR] 单公式作为解法:', solution)
      }
    } else {
      // 按步数排序
      const sortedByMoves = [...cleanedFormulas].sort((a, b) => countMoves(a) - countMoves(b))
      console.log('[OCR] 按步数排序:', sortedByMoves.map(f => `${countMoves(f)}步`))

      // 如果没有打乱，选最短的（通常是打乱）
      if (!scramble) {
        const shortFormulas = sortedByMoves.filter(f => {
          const m = countMoves(f)
          return m >= 5 && m <= 30
        })
        if (shortFormulas.length > 0) {
          // 在短公式中选包含修饰符最多的（更像打乱）
          const scored = shortFormulas.map(f => ({
            formula: f,
            score: (f.match(/[2']/g) || []).length
          }))
          scored.sort((a, b) => b.score - a.score)
          scramble = scored[0].formula
          console.log('[OCR] 智能选择打乱:', scramble, `(${countMoves(scramble)}步)`)
        }
      }

      // 如果没有解法，选最长的（通常是解法）
      if (!solution) {
        const remaining = sortedByMoves.filter(f => f !== scramble)
        if (remaining.length > 0) {
          solution = remaining[remaining.length - 1]
          console.log('[OCR] 智能选择解法:', solution, `(${countMoves(solution)}步)`)
        }
      }
    }
  }

  return {
    scramble,
    solution,
    confidence,
    rawText,
    debug: {
      extractedScramble: scramble,
      extractedSolution: solution,
      rawLines: lines,
      allFormulas: cleanedFormulas.map(f => `${countMoves(f)}步: ${f.substring(0, 50)}${f.length > 50 ? '...' : ''}`)
    }
  }
}

/**
 * 验证公式是否有效
 */
export function isValidFormula(formula: string): boolean {
  if (!formula || formula.length < 3) return false

  const validMoves = ['R', 'L', 'U', 'D', 'F', 'B', 'r', 'l', 'u', 'd', 'f', 'b',
                      'x', 'y', 'z', 'M', 'E', 'S']
  const modifiers = ["'", '2', '']

  const parts = formula.split(/\s+/)
  for (const part of parts) {
    if (part.length === 0) continue

    const face = part[0].toUpperCase()
    const mod = part.slice(1)

    if (!validMoves.includes(face) && !validMoves.includes(face.toLowerCase())) {
      return false
    }

    if (mod && !modifiers.includes(mod)) {
      return false
    }
  }

  return true
}
