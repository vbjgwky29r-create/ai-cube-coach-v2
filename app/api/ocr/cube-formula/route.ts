/**
 * 榄旀柟鍏紡 OCR 璇嗗埆 API - 涓撲笟绾х増鏈?
 * 浣跨敤鐏北寮曟搸璞嗗寘 API 璇嗗埆榄旀柟鏄熺悆鎴浘涓殑鍏紡
 * 鎻愪緵涓撲笟绾у垎鏋愬拰鏁欑粌寤鸿
 */

import { NextRequest, NextResponse } from 'next/server'
import { applyScramble, createSolvedCubeState } from '@/lib/cube/cfop-latest'

export const maxDuration = 60

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function requestVolcengineWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastError: unknown = null
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetchWithTimeout(url, init, 25000)
      if (response.ok) return response
      if (response.status < 500 && response.status !== 429) return response
      lastError = new Error(`upstream status ${response.status}`)
    } catch (error) {
      lastError = error
    }
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)))
    }
  }
  throw lastError instanceof Error ? lastError : new Error('upstream request failed')
}

function extractCandidateLines(text: string): string[] {
  const lines = text.replace(/\r/g, '').split('\n')
  const out: string[] = []
  for (const line of lines) {
    const m = line.match(/^\s*(?:S\d+|SOLUTION\d*|CANDIDATE\d+)\s*[:?]\s*(.+)\s*$/i)
    if (m && m[1]) out.push(m[1].trim())
  }
  if (out.length > 0) return out
  const fallback = text.match(/(?:S\d+|SOLUTION\d*)\s*[:?]\s*([A-Za-z0-9'\s]+)/gi) || []
  return fallback.map((x) => x.replace(/^[^:?]*[:?]\s*/, '').trim()).filter(Boolean)
}

/**
 * 鍚庡鐞嗭細淇甯歌鐨?OCR 璇嗗埆閿欒
 */
function parseMoveTokens(text: string): string[] {
  const normalized = text
    .replace(/[鈥欌€榒麓]/g, "'")
    .replace(/[虏]/g, '2')
    .replace(/[\r\n\t,锛?锛泑]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return []

  const parts = normalized.split(' ').filter(Boolean)
  const out: string[] = []

  for (const part of parts) {
    const token = part.replace(/[^A-Za-z0-9']/g, '')
    if (!token) continue

    if (token === "'" || token === '2' || token === "2'" || token === "'2") {
      if (out.length === 0) continue
      const last = out[out.length - 1]
      if (/[2']$/.test(last)) continue
      out[out.length - 1] = `${last}${token.includes('2') ? '2' : "'"}`
      continue
    }

    const direct = token.match(/^([RLUDFBrludfb])([2']|2'|'2)?$/)
    if (direct) {
      const rawFace = direct[1]
      const face = /[rludfb]/.test(rawFace) ? rawFace : rawFace.toUpperCase()
      const modRaw = direct[2] || ''
      const mod = modRaw.includes('2') ? '2' : modRaw.includes("'") ? "'" : ''
      out.push(`${face}${mod}`)
      continue
    }

    const embedded = token.match(/[RLUDFBrludfb](?:2|')?/g)
    if (!embedded) continue
    for (const m of embedded) {
      const rawFace = m[0]
      const face = /[rludfb]/.test(rawFace) ? rawFace : rawFace.toUpperCase()
      const mod = m.includes('2') ? '2' : m.includes("'") ? "'" : ''
      out.push(`${face}${mod}`)
    }
  }

  return out.filter((m) => /^[RLUDFBrludfb][2']?$/.test(m))
}

function postProcessFormula(text: string): string {
  return parseMoveTokens(text).join(' ')
}

function extractLabelBlock(content: string, label: 'SCRAMBLE' | 'SOLUTION'): string {
  const lines = content.replace(/\r/g, '').split('\n')
  const labelRe = new RegExp(`^\\s*${label}\\s*:`, 'i')
  const anyLabelRe = /^\s*(SCRAMBLE|SOLUTION)\s*:/i
  const moveLineRe = /^[\sRLUDFBrludfb2'鈥欌€榒.,;:|/-]+$/

  const idx = lines.findIndex((line) => labelRe.test(line))
  if (idx < 0) return ''

  const first = lines[idx].replace(labelRe, '').trim()
  const chunks: string[] = [first]
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    if (anyLabelRe.test(line)) break
    if (!moveLineRe.test(line)) break
    chunks.push(line)
  }
  return chunks.join(' ').trim()
}

function normalizeMoves(formula: string): string[] {
  return parseMoveTokens(formula)
}

const OUTER_MOVE_SET = [
  'R', "R'", 'R2',
  'L', "L'", 'L2',
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
  'r', "r'", 'r2',
  'l', "l'", 'l2',
  'u', "u'", 'u2',
  'd', "d'", 'd2',
  'f', "f'", 'f2',
  'b', "b'", 'b2',
]

function canSolveMoves(scramble: string, moves: string[]): boolean {
  if (!scramble || moves.length === 0) return false
  try {
    const state = applyScramble(createSolvedCubeState(), scramble)
    return state.move(moves.join(' ')).isSolved()
  } catch {
    return false
  }
}

function autoFixOneEdit(scramble: string, solution: string): string | null {
  const moves = normalizeMoves(solution)
  if (moves.length === 0) return null
  if (canSolveMoves(scramble, moves)) return moves.join(' ')
  let evalCount = 0
  const evalLimit = 24000
  const test = (candidate: string[]): boolean => {
    evalCount += 1
    if (evalCount > evalLimit) return false
    return canSolveMoves(scramble, candidate)
  }

  // 1) deletion (drop one noisy token)
  for (let i = 0; i < moves.length; i++) {
    const candidate = moves.slice(0, i).concat(moves.slice(i + 1))
    if (test(candidate)) {
      return candidate.join(' ')
    }
  }

  // 2) substitution (fix one wrong token)
  for (let i = 0; i < moves.length; i++) {
    for (const mv of OUTER_MOVE_SET) {
      if (mv === moves[i]) continue
      const candidate = moves.slice()
      candidate[i] = mv
      if (test(candidate)) {
        return candidate.join(' ')
      }
    }
  }

  // 3) insertion (recover one missed token)
  for (let i = 0; i <= moves.length; i++) {
    for (const mv of OUTER_MOVE_SET) {
      const candidate = moves.slice(0, i).concat([mv], moves.slice(i))
      if (test(candidate)) {
        return candidate.join(' ')
      }
    }
  }

  // 4) delete two noisy tokens
  for (let i = 0; i < moves.length; i++) {
    for (let j = i + 1; j < moves.length; j++) {
      const candidate = moves.filter((_, idx) => idx !== i && idx !== j)
      if (test(candidate)) {
        return candidate.join(' ')
      }
    }
  }

  // 5) substitute one + delete one
  for (let i = 0; i < moves.length; i++) {
    for (const mv of OUTER_MOVE_SET) {
      if (mv === moves[i]) continue
      const sub = moves.slice()
      sub[i] = mv
      for (let j = 0; j < sub.length; j++) {
        const candidate = sub.slice(0, j).concat(sub.slice(j + 1))
        if (test(candidate)) {
          return candidate.join(' ')
        }
      }
    }
  }

  return null
}

function canSolve(scramble: string, solution: string): boolean {
  if (!scramble || !solution) return false
  try {
    const state = applyScramble(createSolvedCubeState(), scramble)
    const moves = normalizeMoves(solution)
    if (moves.length === 0) return false
    const after = state.move(moves.join(' '))
    return after.isSolved()
  } catch {
    return false
  }
}

/**
 * 鏍规嵁 TPS 鍒ゆ柇姘村钩绛夌骇
 */
function getSkillLevel(tps: number): { level: string; description: string; nextGoal: string } {
  if (tps >= 8) {
    return {
      level: 'Expert',
      description: 'Very high turning speed with strong lookahead and stable execution.',
      nextGoal: 'Improve consistency under pressure and reduce risky regrips in late stages.',
    }
  }
  if (tps >= 6) {
    return {
      level: 'Advanced',
      description: 'Fast and efficient solve pace with solid CFOP fundamentals.',
      nextGoal: 'Push toward 7+ TPS while keeping F2L fluid and reducing pauses.',
    }
  }
  if (tps >= 4.5) {
    return {
      level: 'Upper Intermediate',
      description: 'Good baseline speed with room to improve transitions and lookahead.',
      nextGoal: 'Reach 6+ TPS and improve OLL/PLL recognition speed.',
    }
  }
  if (tps >= 3) {
    return {
      level: 'Intermediate',
      description: 'Basic CFOP flow is present, but pauses still affect continuity.',
      nextGoal: 'Target 4.5+ TPS and train smoother F2L pair tracking.',
    }
  }
  if (tps >= 2) {
    return {
      level: 'Beginner+',
      description: 'Core method is usable, but execution is still cautious.',
      nextGoal: 'Reach 3+ TPS by drilling common triggers and reducing hesitations.',
    }
  }
  return {
    level: 'Beginner',
    description: 'Early stage solving speed; focus on move accuracy first.',
    nextGoal: 'Build reliable turning mechanics and move toward 2+ TPS.',
  }
}

function getAnalysisPrompt(): string {
  return `浣犳槸涓€浣嶄笘鐣岀骇榄旀柟閫熸嫥鏁欑粌锛屾嫢鏈?WCA 姣旇禌缁忛獙鍜屼笓涓氭暀瀛﹁儗鏅€備綘鐨勪换鍔℃槸鍒嗘瀽榄旀柟鏄熺悆锛圕ube Planet锛夊簲鐢ㄧ殑鎴浘锛屾彁渚涗笓涓氱骇鐨勫垎鏋愬拰寤鸿銆?

## 绗竴姝ワ細绮剧‘鎻愬彇鏁版嵁

璇蜂粠鎴浘涓簿纭瘑鍒互涓嬩俊鎭細
1. **鎵撲贡鍏紡**锛氬畬鏁寸殑鎵撲贡搴忓垪
2. **澶嶅師鍏紡**锛氱敤鎴风殑瀹屾暣瑙ｆ硶
3. **姝ユ暟**锛氭€绘鏁帮紙HTM 璁℃暟锛?
4. **鐢ㄦ椂**锛氬畬鎴愭椂闂达紙绉掞級
5. **TPS**锛氭瘡绉掕浆鍔ㄦ鏁帮紙Turns Per Second锛?

## 绗簩姝ワ細鍒嗘瀽瑙ｆ硶缁撴瀯

璇嗗埆 CFOP 鍚勯樁娈碉細
- **Cross锛堝崄瀛楋級**锛氬簳灞傚崄瀛楃殑姝ユ暟鍜屾晥鐜?
- **F2L锛堝墠涓ゅ眰锛?*锛氬洓缁?F2L 鐨勫垎鏋?
- **OLL锛堥《灞傛湞鍚戯級**锛氫娇鐢ㄧ殑 OLL 鍏紡
- **PLL锛堥《灞傛帓鍒楋級**锛氫娇鐢ㄧ殑 PLL 鍏紡

## 绗笁姝ワ細璇嗗埆楂樼骇鎶€宸?

妫€鏌ユ槸鍚︿娇鐢ㄤ簡浠ヤ笅楂樼骇鎶€宸э細
- **XCross**锛氬崄瀛?1缁?F2L 鍚屾椂瀹屾垚
- **XXCross**锛氬崄瀛?2缁?F2L 鍚屾椂瀹屾垚
- **COLL**锛氳鍧楁湞鍚?鎺掑垪鍚屾椂瀹屾垚
- **ZBLL**锛氶《灞備竴姝ュ畬鎴?
- **鎺фЫ娉?*锛氬埄鐢ㄧ┖妲戒紭鍖栧叆妲?
- **棰勫垽**锛欶2L 杩囩▼涓殑 lookahead

## 杈撳嚭鏍煎紡锛堜弗鏍奸伒瀹?JSON 鏍煎紡锛?

\`\`\`json
{
  "extracted_data": {
    "scramble": "鎵撲贡鍏紡",
    "solution": "澶嶅師鍏紡",
    "move_count": 姝ユ暟鏁板瓧,
    "time_seconds": 鐢ㄦ椂鏁板瓧,
    "tps": TPS鏁板瓧
  },
  "cfop_breakdown": {
    "cross": {
      "moves": "鍗佸瓧鍏紡",
      "move_count": 姝ユ暟,
      "efficiency": "璇勪环锛氫紭绉€/鑹ソ/闇€鏀硅繘",
      "could_be_xcross": true鎴杅alse,
      "xcross_suggestion": "濡傛灉鍙互鍋?XCross锛岀粰鍑哄缓璁?
    },
    "f2l_pairs": [
      {
        "pair_number": 1,
        "moves": "F2L 鍏紡",
        "move_count": 姝ユ暟,
        "efficiency": "璇勪环",
        "optimization": "浼樺寲寤鸿",
        "alternative_solution": "鏇翠紭瑙ｆ硶锛堝鏋滄湁锛?
      }
    ],
    "oll": {
      "case_name": "OLL 鎯呭喌鍚嶇О锛堝 OLL 21锛?,
      "moves": "浣跨敤鐨勫叕寮?,
      "is_optimal": true鎴杅alse,
      "better_algorithm": "鏇村ソ鐨勫叕寮忥紙濡傛灉鏈夛級",
      "coll_available": true鎴杅alse,
      "coll_suggestion": "濡傛灉鍙互鐢?COLL锛岀粰鍑哄缓璁?
    },
    "pll": {
      "case_name": "PLL 鎯呭喌鍚嶇О锛堝 T-Perm锛?,
      "moves": "浣跨敤鐨勫叕寮?,
      "is_optimal": true鎴杅alse,
      "better_algorithm": "鏇村ソ鐨勫叕寮忥紙濡傛灉鏈夛級"
    }
  },
  "advanced_techniques": {
    "xcross_used": true鎴杅alse,
    "xxcross_used": true鎴杅alse,
    "coll_used": true鎴杅alse,
    "slot_control_used": true鎴杅alse,
    "good_lookahead": true鎴杅alse,
    "techniques_to_learn": ["寤鸿瀛︿範鐨勬妧宸у垪琛?]
  },
  "skill_assessment": {
    "level": "姘村钩绛夌骇",
    "strengths": ["浼樼偣鍒楄〃"],
    "weaknesses": ["闇€瑕佹敼杩涚殑鍦版柟"],
    "priority_improvements": ["浼樺厛鏀硅繘浜嬮」锛屾寜閲嶈鎬ф帓搴?]
  },
  "weekly_training_plan": {
    "day1": {"focus": "璁粌閲嶇偣", "exercises": ["鍏蜂綋缁冧範"], "duration": "寤鸿鏃堕暱"},
    "day2": {"focus": "璁粌閲嶇偣", "exercises": ["鍏蜂綋缁冧範"], "duration": "寤鸿鏃堕暱"},
    "day3": {"focus": "璁粌閲嶇偣", "exercises": ["鍏蜂綋缁冧範"], "duration": "寤鸿鏃堕暱"},
    "day4": {"focus": "璁粌閲嶇偣", "exercises": ["鍏蜂綋缁冧範"], "duration": "寤鸿鏃堕暱"},
    "day5": {"focus": "璁粌閲嶇偣", "exercises": ["鍏蜂綋缁冧範"], "duration": "寤鸿鏃堕暱"},
    "day6": {"focus": "璁粌閲嶇偣", "exercises": ["鍏蜂綋缁冧範"], "duration": "寤鸿鏃堕暱"},
    "day7": {"focus": "浼戞伅鎴栧涔?, "exercises": ["杞绘澗缁冧範"], "duration": "寤鸿鏃堕暱"}
  },
  "learning_resources": {
    "videos": [
      {"title": "瑙嗛鏍囬", "url": "閾炬帴", "relevance": "涓轰粈涔堟帹鑽?}
    ],
    "websites": [
      {"name": "缃戠珯鍚?, "url": "閾炬帴", "content": "鎺ㄨ崘鍐呭"}
    ],
    "practice_tools": [
      {"name": "宸ュ叿鍚?, "description": "鐢ㄩ€?}
    ]
  },
  "coach_summary": "鏁欑粌鎬荤粨锛氱敤 2-3 鍙ヨ瘽鎬荤粨鍒嗘瀽缁撴灉鍜屾渶閲嶈鐨勬敼杩涘缓璁?
}
\`\`\`

## 閲嶈鎻愮ず

1. 鎵€鏈夋暟鎹繀椤讳粠鎴浘涓簿纭彁鍙栵紝涓嶈浼扮畻
2. 濡傛灉鏌愪簺淇℃伅鏃犳硶璇嗗埆锛屼娇鐢?null 琛ㄧず
3. 鍒嗘瀽瑕佷笓涓氥€佸叿浣撱€佸彲鎿嶄綔
4. 鎺ㄨ崘鐨勮祫婧愬繀椤绘槸鐪熷疄瀛樺湪鐨勶紙J Perm銆丆ubeSkills 绛夌煡鍚嶆暀绋嬶級
5. 璁粌璁″垝瑕佹牴鎹敤鎴风殑瀹為檯姘村钩瀹氬埗`
}

/**
 * POST /api/ocr/cube-formula
 * 鎺ユ敹鍥剧墖 base64锛屼娇鐢ㄧ伀灞卞紩鎿?Vision 璇嗗埆榄旀柟鍏紡骞舵彁渚涗笓涓氬垎鏋?
 */
export async function POST(request: NextRequest) {
  try {
    const { image, mode = 'full' } = await request.json()

    if (!image) {
      return NextResponse.json({ error: '缂哄皯鍥剧墖鏁版嵁' }, { status: 400 })
    }

    // 鏋勫缓鍥剧墖 URL锛堟敮鎸?base64 鍜?URL锛?
    const imageUrl = image.startsWith('http') 
      ? image 
      : `data:image/png;base64,${image}`

    const apiKey = process.env.VOLCENGINE_API_KEY
    const model = process.env.VOLCENGINE_MODEL || 'ep-20260205011220-2gksn'
    const baseURL = process.env.VOLCENGINE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'

    if (!apiKey) {
      throw new Error('Missing VOLCENGINE_API_KEY environment variable')
    }

    console.log('[OCR] Using Volcengine API - Professional Analysis Mode')
    console.log('[OCR] Base URL:', baseURL)
    console.log('[OCR] Model:', model)

    // 鏍规嵁妯″紡閫夋嫨涓嶅悓鐨勫垎鏋愭繁搴?
    const isSimpleMode = mode === 'simple'
    
    const systemPrompt = isSimpleMode 
      ? `You are a Rubik's cube OCR extractor.
Only extract SCRAMBLE from the screenshot.
Do not extract or guess any solution.
Output exactly one line:
SCRAMBLE: [moves]` 
      : getAnalysisPrompt()

    const userPrompt = isSimpleMode
      ? '请识别这张魔方星球截图中的打乱公式。'
      : '请分析这张魔方星球截图，提取关键信息并按 JSON 格式输出。'

    // 璋冪敤鐏北寮曟搸 Vision API
    const response = await requestVolcengineWithRetry(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[OCR] Volcengine API error:', response.status, errorText)
      throw new Error(`Volcengine API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    console.log('[OCR] Raw response length:', content.length)

    if (isSimpleMode) {
      const scrambleBlock = extractLabelBlock(content, 'SCRAMBLE')
      const scrambleMatch = content.match(/SCRAMBLE:\s*(.*)/i)
      let scramble = scrambleBlock || (scrambleMatch ? scrambleMatch[1].trim() : '')
      scramble = postProcessFormula(scramble)
      return NextResponse.json({
        scramble,
        solution: '',
        raw: content
      })
    }

    // 涓撲笟妯″紡锛氳В鏋?JSON 鍒嗘瀽缁撴灉
    try {
      // 灏濊瘯鎻愬彇 JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        const analysis = JSON.parse(jsonStr)
        
        // 鍚庡鐞嗗叕寮?
        if (analysis.extracted_data) {
          if (analysis.extracted_data.scramble) {
            analysis.extracted_data.scramble = postProcessFormula(analysis.extracted_data.scramble)
          }
          if (analysis.extracted_data.solution) {
            analysis.extracted_data.solution = postProcessFormula(analysis.extracted_data.solution)
          }
          
          // 娣诲姞鎶€鑳芥按骞宠瘎浼?
          if (analysis.extracted_data.tps) {
            const skillLevel = getSkillLevel(analysis.extracted_data.tps)
            analysis.skill_level = skillLevel
          }
        }

        // 娣诲姞鎺ㄨ崘璧勬簮锛堢‘淇濇槸鐪熷疄鐨勶級
        if (!analysis.learning_resources) {
          analysis.learning_resources = getDefaultResources()
        }

        console.log('[OCR Professional] Analysis complete')

        return NextResponse.json({
          success: true,
          scramble: analysis.extracted_data?.scramble || '',
          solution: analysis.extracted_data?.solution || '',
          analysis: analysis,
          raw: content
        })
      }
    } catch (parseError) {
      console.error('[OCR] JSON parse error:', parseError)
    }

    // 濡傛灉 JSON 瑙ｆ瀽澶辫触锛屽洖閫€鍒扮畝鍗曟ā寮?
    const scrambleMatch = content.match(/scramble["\s:]+([^"]+)/i) ||
                          content.match(/鎵撲贡[鍏紡]*[锛?]\s*(.+)/i)
    const solutionMatch = content.match(/solution["\s:]+([^"]+)/i) ||
                          content.match(/澶嶅師[鍏紡]*[锛?]\s*(.+)/i)
    
    let scramble = scrambleMatch ? scrambleMatch[1].trim() : ''
    let solution = solutionMatch ? solutionMatch[1].trim() : ''
    
    scramble = postProcessFormula(scramble)
    solution = postProcessFormula(solution)

    return NextResponse.json({
      success: true,
      scramble,
      solution,
      analysis: null,
      raw: content,
      parseError: 'JSON 解析失败，仅提取到公式'
    })

  } catch (error: unknown) {
    console.error('[OCR Cube Formula] 閿欒:', error)
    const rawError = error instanceof Error ? error.message : 'OCR request failed'
    const errorMessage = /fetch failed|aborted|network|timeout/i.test(rawError)
      ? 'OCR upstream network timeout, please retry'
      : rawError
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * 鑾峰彇榛樿鎺ㄨ崘璧勬簮
 */
function getDefaultResources() {
  return {
    videos: [
      {
        title: "J Perm - 濡備綍鎻愰珮 F2L",
        url: "https://www.youtube.com/watch?v=3B_oB2YrLvk",
        relevance: "系统讲解 F2L 优化技巧"
      },
      {
        title: "J Perm - Lookahead 鏁欑▼",
        url: "https://www.youtube.com/watch?v=Sw3DpueJsWM",
        relevance: "提升 lookahead 预判能力"
      },
      {
        title: "J Perm - 瀹屾暣 CFOP 鏁欑▼",
        url: "https://www.youtube.com/watch?v=MS5jByTX_pk",
        relevance: "CFOP 鏂规硶鍏ㄩ潰璁茶В"
      }
    ],
    websites: [
      {
        name: "J Perm 算法库",
        url: "https://jperm.net/algs",
        content: "OLL、PLL、COLL 等公式查询"
      },
      {
        name: "CubeSkills",
        url: "https://www.cubeskills.com",
        content: "Feliks Zemdegs 的专业教程"
      },
      {
        name: "SpeedSolving Wiki",
        url: "https://www.speedsolving.com/wiki",
        content: "榄旀柟閫熸嫥鐧剧鍏ㄤ功"
      }
    ],
    practice_tools: [
      {
        name: "csTimer",
        description: "专业计时器，支持打乱生成和统计"
      },
      {
        name: "Cube Explorer",
        description: "最优解生成工具"
      },
      {
        name: "榄旀柟鏄熺悆",
        description: "鎵嬫満绔粌涔犲拰璁板綍宸ュ叿"
      }
    ]
  }
}


