/**
 * 魔方公式 OCR 识别 API - 专业级版本
 * 使用火山引擎豆包 API 识别魔方星球截图中的公式
 * 提供专业级分析和教练建议
 */

import { NextRequest, NextResponse } from 'next/server'

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
  
  // 3. 修正字母大小写
  // - 标准转体 R/L/U/D/F/B/M/E/S/X/Y/Z → 大写
  // - 宽转 r/l/u/d/f/b（双层转）→ 保持小写
  result = result.replace(/\b([urfdlbmesxyz])(['2]?)\b/gi, (match, letter, modifier) => {
    const lower = letter.toLowerCase()
    // 宽转（r/l/u/d/f/b）保持小写，其他转大写
    if ('rludfb'.includes(lower)) {
      return lower.toUpperCase() + (modifier || '')
    }
    return lower.toUpperCase() + (modifier || '')
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
 * 根据 TPS 判断水平等级
 */
function getSkillLevel(tps: number): { level: string; description: string; nextGoal: string } {
  if (tps >= 8) {
    return { 
      level: '世界级', 
      description: '你的 TPS 已达到世界顶尖水平！',
      nextGoal: '保持状态，优化预判和手法流畅度'
    }
  } else if (tps >= 6) {
    return { 
      level: '高级', 
      description: '你已经是一名高级速拧选手',
      nextGoal: '目标 TPS 7+，专注于减少停顿和优化 F2L 预判'
    }
  } else if (tps >= 4.5) {
    return { 
      level: '中高级', 
      description: '你正在向高级水平迈进',
      nextGoal: '目标 TPS 6+，学习高级 F2L 技巧和 COLL'
    }
  } else if (tps >= 3) {
    return { 
      level: '中级', 
      description: '你已经掌握了 CFOP 基础',
      nextGoal: '目标 TPS 4.5+，完善 OLL/PLL 公式和手法'
    }
  } else if (tps >= 2) {
    return { 
      level: '初中级', 
      description: '你正在学习速拧方法',
      nextGoal: '目标 TPS 3+，熟练掌握 F2L 41 种情况'
    }
  } else {
    return { 
      level: '初级', 
      description: '你刚开始学习速拧',
      nextGoal: '目标 TPS 2+，先熟悉十字和基础 F2L'
    }
  }
}

/**
 * 生成专业分析提示词
 */
function getAnalysisPrompt(): string {
  return `你是一位世界级魔方速拧教练，拥有 WCA 比赛经验和专业教学背景。你的任务是分析魔方星球（Cube Planet）应用的截图，提供专业级的分析和建议。

## 第一步：精确提取数据

请从截图中精确识别以下信息：
1. **打乱公式**：完整的打乱序列
2. **复原公式**：用户的完整解法
3. **步数**：总步数（HTM 计数）
4. **用时**：完成时间（秒）
5. **TPS**：每秒转动次数（Turns Per Second）

## 第二步：分析解法结构

识别 CFOP 各阶段：
- **Cross（十字）**：底层十字的步数和效率
- **F2L（前两层）**：四组 F2L 的分析
- **OLL（顶层朝向）**：使用的 OLL 公式
- **PLL（顶层排列）**：使用的 PLL 公式

## 第三步：识别高级技巧

检查是否使用了以下高级技巧：
- **XCross**：十字+1组 F2L 同时完成
- **XXCross**：十字+2组 F2L 同时完成
- **COLL**：角块朝向+排列同时完成
- **ZBLL**：顶层一步完成
- **控槽法**：利用空槽优化入槽
- **预判**：F2L 过程中的 lookahead

## 输出格式（严格遵守 JSON 格式）

\`\`\`json
{
  "extracted_data": {
    "scramble": "打乱公式",
    "solution": "复原公式",
    "move_count": 步数数字,
    "time_seconds": 用时数字,
    "tps": TPS数字
  },
  "cfop_breakdown": {
    "cross": {
      "moves": "十字公式",
      "move_count": 步数,
      "efficiency": "评价：优秀/良好/需改进",
      "could_be_xcross": true或false,
      "xcross_suggestion": "如果可以做 XCross，给出建议"
    },
    "f2l_pairs": [
      {
        "pair_number": 1,
        "moves": "F2L 公式",
        "move_count": 步数,
        "efficiency": "评价",
        "optimization": "优化建议",
        "alternative_solution": "更优解法（如果有）"
      }
    ],
    "oll": {
      "case_name": "OLL 情况名称（如 OLL 21）",
      "moves": "使用的公式",
      "is_optimal": true或false,
      "better_algorithm": "更好的公式（如果有）",
      "coll_available": true或false,
      "coll_suggestion": "如果可以用 COLL，给出建议"
    },
    "pll": {
      "case_name": "PLL 情况名称（如 T-Perm）",
      "moves": "使用的公式",
      "is_optimal": true或false,
      "better_algorithm": "更好的公式（如果有）"
    }
  },
  "advanced_techniques": {
    "xcross_used": true或false,
    "xxcross_used": true或false,
    "coll_used": true或false,
    "slot_control_used": true或false,
    "good_lookahead": true或false,
    "techniques_to_learn": ["建议学习的技巧列表"]
  },
  "skill_assessment": {
    "level": "水平等级",
    "strengths": ["优点列表"],
    "weaknesses": ["需要改进的地方"],
    "priority_improvements": ["优先改进事项，按重要性排序"]
  },
  "weekly_training_plan": {
    "day1": {"focus": "训练重点", "exercises": ["具体练习"], "duration": "建议时长"},
    "day2": {"focus": "训练重点", "exercises": ["具体练习"], "duration": "建议时长"},
    "day3": {"focus": "训练重点", "exercises": ["具体练习"], "duration": "建议时长"},
    "day4": {"focus": "训练重点", "exercises": ["具体练习"], "duration": "建议时长"},
    "day5": {"focus": "训练重点", "exercises": ["具体练习"], "duration": "建议时长"},
    "day6": {"focus": "训练重点", "exercises": ["具体练习"], "duration": "建议时长"},
    "day7": {"focus": "休息或复习", "exercises": ["轻松练习"], "duration": "建议时长"}
  },
  "learning_resources": {
    "videos": [
      {"title": "视频标题", "url": "链接", "relevance": "为什么推荐"}
    ],
    "websites": [
      {"name": "网站名", "url": "链接", "content": "推荐内容"}
    ],
    "practice_tools": [
      {"name": "工具名", "description": "用途"}
    ]
  },
  "coach_summary": "教练总结：用 2-3 句话总结分析结果和最重要的改进建议"
}
\`\`\`

## 重要提示

1. 所有数据必须从截图中精确提取，不要估算
2. 如果某些信息无法识别，使用 null 表示
3. 分析要专业、具体、可操作
4. 推荐的资源必须是真实存在的（J Perm、CubeSkills 等知名教程）
5. 训练计划要根据用户的实际水平定制`
}

/**
 * POST /api/ocr/cube-formula
 * 接收图片 base64，使用火山引擎 Vision 识别魔方公式并提供专业分析
 */
export async function POST(request: NextRequest) {
  try {
    const { image, mode = 'full' } = await request.json()

    if (!image) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    // 构建图片 URL（支持 base64 和 URL）
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

    // 根据模式选择不同的分析深度
    const isSimpleMode = mode === 'simple'
    
    const systemPrompt = isSimpleMode 
      ? `你是一个专业的魔方公式识别专家。请从魔方星球截图中精确提取：
1. 打乱公式（SCRAMBLE）
2. 复原公式（SOLUTION）

输出格式：
SCRAMBLE: [打乱公式]
SOLUTION: [复原公式]`
      : getAnalysisPrompt()

    const userPrompt = isSimpleMode
      ? '请识别这张魔方星球截图中的打乱公式和复原公式。'
      : '请分析这张魔方星球截图，提取所有数据并提供专业级分析。请严格按照 JSON 格式输出。'

    // 调用火山引擎 Vision API
    const response = await fetch(`${baseURL}/chat/completions`, {
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
      // 简单模式：只提取公式
      const scrambleMatch = content.match(/SCRAMBLE:\s*(.*)/)
      const solutionMatch = content.match(/SOLUTION:\s*(.*)/)
      
      let scramble = scrambleMatch ? scrambleMatch[1].trim() : ''
      let solution = solutionMatch ? solutionMatch[1].trim() : ''
      
      scramble = postProcessFormula(scramble)
      solution = postProcessFormula(solution)

      return NextResponse.json({
        scramble,
        solution,
        raw: content
      })
    }

    // 专业模式：解析 JSON 分析结果
    try {
      // 尝试提取 JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        const analysis = JSON.parse(jsonStr)
        
        // 后处理公式
        if (analysis.extracted_data) {
          if (analysis.extracted_data.scramble) {
            analysis.extracted_data.scramble = postProcessFormula(analysis.extracted_data.scramble)
          }
          if (analysis.extracted_data.solution) {
            analysis.extracted_data.solution = postProcessFormula(analysis.extracted_data.solution)
          }
          
          // 添加技能水平评估
          if (analysis.extracted_data.tps) {
            const skillLevel = getSkillLevel(analysis.extracted_data.tps)
            analysis.skill_level = skillLevel
          }
        }

        // 添加推荐资源（确保是真实的）
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

    // 如果 JSON 解析失败，回退到简单模式
    const scrambleMatch = content.match(/scramble["\s:]+([^"]+)/i) ||
                          content.match(/打乱[公式]*[：:]\s*(.+)/i)
    const solutionMatch = content.match(/solution["\s:]+([^"]+)/i) ||
                          content.match(/复原[公式]*[：:]\s*(.+)/i)
    
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
      parseError: 'JSON 解析失败，仅提取了公式'
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

/**
 * 获取默认推荐资源
 */
function getDefaultResources() {
  return {
    videos: [
      {
        title: "J Perm - 如何提高 F2L",
        url: "https://www.youtube.com/watch?v=3B_oB2YrLvk",
        relevance: "系统讲解 F2L 优化技巧"
      },
      {
        title: "J Perm - Lookahead 教程",
        url: "https://www.youtube.com/watch?v=Sw3DpueJsWM",
        relevance: "提高预判能力的关键"
      },
      {
        title: "J Perm - 完整 CFOP 教程",
        url: "https://www.youtube.com/watch?v=MS5jByTX_pk",
        relevance: "CFOP 方法全面讲解"
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
        content: "魔方速拧百科全书"
      }
    ],
    practice_tools: [
      {
        name: "csTimer",
        description: "专业计时器，支持打乱生成和统计"
      },
      {
        name: "Cube Explorer",
        description: "最优解生成器"
      },
      {
        name: "魔方星球",
        description: "手机端练习和记录工具"
      }
    ]
  }
}
