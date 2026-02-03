/**
 * 魔方公式解析器
 *
 * 支持的标准记法:
 * - 面转动: R L U D F B (右左上下前后)
 * - 方向: 无(顺时针90°) '(逆时针90°) 2(180°)
 * - 宽转动: r l u d f b (多层)
 * - 中层转动: M E S (中间层)
 * - 宽中层转动: m e s
 * - 旋转: x y z (整体旋转)
 * - 括号: (R U R' U') 表示重复
 * - 重复: (R U R' U')' 表示重复3次
 */

// 注意: 以下常量保留用于文档和类型定义
// 标准魔方面
// const FACES = ['R', 'L', 'U', 'D', 'F', 'B'] as const
// const WIDE_FACES = ['r', 'l', 'u', 'd', 'f', 'b'] as const
// 中层动作 (M=Middle, E=Equator, S=Standing)
// const MIDDLE_FACES = ['M', 'E', 'S'] as const
// const WIDE_MIDDLE_FACES = ['m', 'e', 's'] as const
// const ROTATIONS = ['x', 'y', 'z'] as const
// const MODIFIERS = ["'", '2', ''] as const

export type Move = {
  face: string
  modifier: '' | "'" | '2'
  isWide: boolean
  isMiddle: boolean
}

export type ParsedFormula = {
  moves: Move[]
  count: number
  raw: string
  isValid: boolean
  errors: string[]
}

/**
 * 解析魔方公式
 */
export function parseFormula(input: string): ParsedFormula {
  const raw = input.trim()
  const moves: Move[] = []
  const errors: string[] = []

  if (!raw) {
    return { moves: [], count: 0, raw, isValid: false, errors: ['空公式'] }
  }

  // 预处理：标准化记法 + 处理括号和重复
  let expanded = normalizeNotation(raw)
  expanded = expandFormula(expanded)

  // 分割成单个动作
  const tokens = expanded.split(/\s+/).filter(Boolean)

  for (const token of tokens) {
    const parsed = parseMove(token)
    if (parsed) {
      moves.push(parsed)
    } else {
      errors.push(`无法识别的动作: ${token}`)
    }
  }

  return {
    moves,
    count: moves.length,
    raw,
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 解析单个动作
 * 支持: R L U D F B, r l u d f b (���层), M E S m e s (中层), x y z (旋转)
 */
function parseMove(token: string): Move | null {
  // 标准化当前 token (处理 2' 情况)
  const normalizedToken = token.replace(/2['"]/g, '2')

  // 优先匹配中层动作 (大写 M, E, S)
  const middleMatch = normalizedToken.match(/^([MES])(2?['"]?)$/)
  if (middleMatch) {
    const [, face, rawModifier] = middleMatch
    let modifier: '' | "'" | '2' = ''
    if (rawModifier.includes('2')) {
      modifier = '2'
    } else if (rawModifier.includes("'") || rawModifier.includes('"')) {
      modifier = "'"
    }
    return {
      face,  // M, E, S (保持大写)
      modifier,
      isWide: false,
      isMiddle: true,
    }
  }

  // 匹配宽中层动作 (小写 m, e, s)
  const wideMiddleMatch = normalizedToken.match(/^([mes])(2?['"]?)$/)
  if (wideMiddleMatch) {
    const [, face, rawModifier] = wideMiddleMatch
    let modifier: '' | "'" | '2' = ''
    if (rawModifier.includes('2')) {
      modifier = '2'
    } else if (rawModifier.includes("'") || rawModifier.includes('"')) {
      modifier = "'"
    }
    return {
      face,  // m, e, s (保持小写)
      modifier,
      isWide: true,
      isMiddle: true,
    }
  }

  // 匹配旋转 (x, y, z)
  const rotationMatch = normalizedToken.match(/^([xyz])(2?['"]?)$/)
  if (rotationMatch) {
    const [, face, rawModifier] = rotationMatch
    let modifier: '' | "'" | '2' = ''
    if (rawModifier.includes('2')) {
      modifier = '2'
    } else if (rawModifier.includes("'") || rawModifier.includes('"')) {
      modifier = "'"
    }
    return {
      face,
      modifier,
      isWide: false,
      isMiddle: false,
    }
  }

  // 匹配标准面动作 (大写 R L U D F B) - 保持大写
  const faceMatch = normalizedToken.match(/^([RLUDFB])(2?['"]?)$/)
  if (faceMatch) {
    const [, face, rawModifier] = faceMatch
    // 标准化修饰符: 2' 和 '2 都变成 2 (180度顺时针=逆时针)
    // 但单独的 ' 要保留
    let modifier: '' | "'" | '2' = ''
    if (rawModifier.includes('2')) {
      modifier = '2'
    } else if (rawModifier.includes("'") || rawModifier.includes('"')) {
      modifier = "'"
    }
    return {
      face,
      modifier,
      isWide: false,
      isMiddle: false,
    }
  }

  // 匹配宽层动作 (小写 r l u d f b) - 保持小写
  const wideMatch = normalizedToken.match(/^([rludfb])(2?['"]?)$/)
  if (wideMatch) {
    const [, face, rawModifier] = wideMatch
    let modifier: '' | "'" | '2' = ''
    if (rawModifier.includes('2')) {
      modifier = '2'
    } else if (rawModifier.includes("'") || rawModifier.includes('"')) {
      modifier = "'"
    }
    return {
      face,  // 保持小写
      modifier,
      isWide: true,
      isMiddle: false,
    }
  }

  return null
}

/**
 * 标准化魔方记法
 * - 处理无空格的公式 (RRU -> R R U)
 * - 移除180度后的 ' (U2' -> U2, U'2 -> U2)
 * - 统一空格分隔
 */
export function normalizeNotation(formula: string): string {
  // 先移除所有空格，处理连续相同字母
  let result = formula.replace(/\s+/g, '')

  // 处理连续相同字母：RRR -> R R R
  result = result.replace(/([RLUDFBrludfbMESmesxyz])\1*/g, (match) => {
    return match.split('').join(' ')
  })

  // 处理带修饰符的情况：R2R2 -> R2 R2, R'R' -> R' R'
  // 需要更仔细的处理，因为修饰符跟在字母后面
  result = result.replace(/([RLUDFBrludfbMESmesxyz])([2']?)/g, '$1$2 ')

  // 180度后的 ' 是多余的 (U2' = U2)
  result = result.replace(/2['"]/g, '2')
  // '2 也是多余的 ('U2 = U2)
  result = result.replace(/['"]2/g, '2')

  // 标准化空格
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

/**
 * 展开公式中的括号和重复
 * 例如: (R U R' U')' -> R U R' U' R U R' U' R U R' U'
 */
export function expandFormula(formula: string): string {
  let result = formula

  // 处理重复标记: (sequence)N
  while (true) {
    const repeatMatch = result.match(/\(([^)]+)\)(\d+)/)
    if (!repeatMatch) break

    const [, sequence, count] = repeatMatch
    const expanded = sequence.repeat(parseInt(count, 10))
    result = result.replace(repeatMatch[0], expanded)
  }

  // 处理括号: (sequence) -> sequence
  result = result.replace(/\(([^)]+)\)/g, '$1')

  return result
}

/**
 * 将动作数组转回字符串
 * 保持原始大小写：基础动作大写(R)，宽层小写(r)，中层大写(M)，旋转小写(x)
 */
export function movesToString(moves: Move[]): string {
  return moves.map(m => m.face + m.modifier).join(' ')
}

/**
 * 验证公式是否有效（基本语法检查）
 */
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  if (!formula || formula.trim().length === 0) {
    return { valid: false, error: '公式不能为空' }
  }

  const parsed = parseFormula(formula)
  if (!parsed.isValid) {
    return { valid: false, error: parsed.errors[0] }
  }

  // 检查是否有非法字符
  const validChars = /^[RLUDFBrludfbxyz\s'2()0-9]+$/
  if (!validChars.test(formula)) {
    return { valid: false, error: '包含非法字符' }
  }

  return { valid: true }
}

/**
 * 计算公式的ETM (Execution Turn Metric) - 执行转动数
 * 每个动作算1次，包括2转动
 */
export function calculateETM(moves: Move[]): number {
  return moves.length
}

/**
 * 计算公式的STM (Slice Turn Metric) - 切片转动数
 * 双层转动算2次
 */
export function calculateSTM(moves: Move[]): number {
  return moves.reduce((sum, move) => {
    if (move.isWide) return sum + 2
    return sum + 1
  }, 0)
}

/**
 * 美化公式显示
 */
export function formatFormula(formula: string): string {
  const parsed = parseFormula(formula)
  if (!parsed.isValid) return formula

  return parsed.moves.map(m => {
    let s = m.face
    if (m.isWide) s = s.toLowerCase()
    return s + m.modifier
  }).join(' ')
}

/**
 * 提取公式中的子序列（用于识别公式片段）
 */
export function extractSubsequences(formula: string, minLength: number = 3, maxLength: number = 10): string[] {
  const parsed = parseFormula(formula)
  if (!parsed.isValid) return []

  const subsequences: string[] = []
  const moves = parsed.moves

  for (let start = 0; start < moves.length; start++) {
    for (let len = minLength; len <= maxLength && start + len <= moves.length; len++) {
      const subMoves = moves.slice(start, start + len)
      subsequences.push(movesToString(subMoves))
    }
  }

  return subsequences
}
