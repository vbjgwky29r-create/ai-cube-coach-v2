'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, Target, TrendingUp, BookOpen, Calendar, 
  ExternalLink, Play, Zap, Brain, CheckCircle2, 
  AlertTriangle, Star, Clock, Dumbbell
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfessionalAnalysisProps {
  analysis: {
    extracted_data?: {
      scramble?: string
      solution?: string
      move_count?: number
      time_seconds?: number
      tps?: number
    }
    cfop_breakdown?: {
      cross?: {
        moves?: string
        move_count?: number
        efficiency?: string
        could_be_xcross?: boolean
        xcross_suggestion?: string
      }
      f2l_pairs?: Array<{
        pair_number: number
        moves?: string
        move_count?: number
        efficiency?: string
        optimization?: string
        alternative_solution?: string
      }>
      oll?: {
        case_name?: string
        moves?: string
        is_optimal?: boolean
        better_algorithm?: string
        coll_available?: boolean
        coll_suggestion?: string
      }
      pll?: {
        case_name?: string
        moves?: string
        is_optimal?: boolean
        better_algorithm?: string
      }
    }
    advanced_techniques?: {
      xcross_used?: boolean
      xxcross_used?: boolean
      coll_used?: boolean
      slot_control_used?: boolean
      good_lookahead?: boolean
      techniques_to_learn?: string[]
    }
    skill_assessment?: {
      level?: string
      strengths?: string[]
      weaknesses?: string[]
      priority_improvements?: string[]
    }
    skill_level?: {
      level: string
      description: string
      nextGoal: string
    }
    weekly_training_plan?: {
      [key: string]: {
        focus: string
        exercises: string[]
        duration: string
      }
    }
    learning_resources?: {
      videos?: Array<{
        title: string
        url: string
        relevance: string
      }>
      websites?: Array<{
        name: string
        url: string
        content: string
      }>
      practice_tools?: Array<{
        name: string
        description: string
      }>
    }
    coach_summary?: string
  }
}

export function ProfessionalAnalysis({ analysis }: ProfessionalAnalysisProps) {
  const { 
    extracted_data, 
    cfop_breakdown, 
    advanced_techniques, 
    skill_assessment,
    skill_level,
    weekly_training_plan, 
    learning_resources,
    coach_summary 
  } = analysis

  // 获取效率颜色
  const getEfficiencyColor = (efficiency?: string) => {
    if (!efficiency) return 'text-slate-500'
    if (efficiency.includes('优秀') || efficiency.includes('excellent')) return 'text-green-600'
    if (efficiency.includes('良好') || efficiency.includes('good')) return 'text-blue-600'
    return 'text-amber-600'
  }

  // 获取 TPS 等级颜色
  const getTpsColor = (tps?: number) => {
    if (!tps) return 'from-slate-400 to-slate-500'
    if (tps >= 7) return 'from-purple-500 to-pink-500'
    if (tps >= 5) return 'from-green-500 to-emerald-500'
    if (tps >= 3) return 'from-blue-500 to-cyan-500'
    return 'from-amber-500 to-orange-500'
  }

  return (
    <div className="space-y-4">
      {/* 教练总结 */}
      {coach_summary && (
        <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-5 h-5 text-purple-600" />
              AI 教练总结
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{coach_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* 数据概览 */}
      {extracted_data && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-5 h-5 text-yellow-500" />
              还原数据
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <p className="text-xs text-blue-600 mb-1 font-medium">步数</p>
                <p className="text-3xl font-bold text-blue-700">{extracted_data.move_count || '-'}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <p className="text-xs text-green-600 mb-1 font-medium">用时</p>
                <p className="text-3xl font-bold text-green-700">{extracted_data.time_seconds?.toFixed(2) || '-'}s</p>
              </div>
              <div className={cn(
                "text-center p-4 rounded-xl border",
                "bg-gradient-to-br",
                getTpsColor(extracted_data.tps).replace('from-', 'from-').replace('to-', 'to-').replace('-500', '-50').replace('-500', '-100'),
                "border-current"
              )}>
                <p className="text-xs mb-1 font-medium" style={{ color: 'inherit' }}>TPS</p>
                <p className={cn(
                  "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  getTpsColor(extracted_data.tps)
                )}>
                  {extracted_data.tps?.toFixed(1) || '-'}
                </p>
              </div>
            </div>

            {/* 技能等级 */}
            {skill_level && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">{skill_level.level}</span>
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-sm opacity-90 mb-2">{skill_level.description}</p>
                <p className="text-xs opacity-75">🎯 下一目标：{skill_level.nextGoal}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CFOP 分解 */}
      {cfop_breakdown && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-orange-500" />
              CFOP 分解分析
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {/* Cross */}
            {cfop_breakdown.cross && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-700">Cross</span>
                    <span className="text-xs text-blue-500">{cfop_breakdown.cross.move_count} 步</span>
                    <span className={cn("text-xs", getEfficiencyColor(cfop_breakdown.cross.efficiency))}>
                      {cfop_breakdown.cross.efficiency}
                    </span>
                  </div>
                  {cfop_breakdown.cross.could_be_xcross && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                      可做 XCross
                    </span>
                  )}
                </div>
                {cfop_breakdown.cross.moves && (
                  <div className="font-mono text-sm text-slate-800 mb-2">{cfop_breakdown.cross.moves}</div>
                )}
                {cfop_breakdown.cross.xcross_suggestion && (
                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                    💡 {cfop_breakdown.cross.xcross_suggestion}
                  </div>
                )}
              </div>
            )}

            {/* F2L Pairs */}
            {cfop_breakdown.f2l_pairs && cfop_breakdown.f2l_pairs.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-green-700">F2L</span>
                  <span className="text-xs text-green-500">
                    {cfop_breakdown.f2l_pairs.reduce((sum, p) => sum + (p.move_count || 0), 0)} 步
                  </span>
                </div>
                <div className="space-y-2">
                  {cfop_breakdown.f2l_pairs.map((pair, idx) => (
                    <div key={idx} className="bg-white/60 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-green-700">第 {pair.pair_number} 组</span>
                        <span className={cn("text-xs", getEfficiencyColor(pair.efficiency))}>
                          {pair.efficiency}
                        </span>
                      </div>
                      {pair.moves && (
                        <div className="font-mono text-xs text-slate-700">{pair.moves}</div>
                      )}
                      {pair.optimization && (
                        <div className="text-xs text-amber-600 mt-1">⚡ {pair.optimization}</div>
                      )}
                      {pair.alternative_solution && (
                        <div className="text-xs text-green-600 mt-1 font-mono">
                          ✨ 更优解：{pair.alternative_solution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OLL */}
            {cfop_breakdown.oll && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-yellow-700">OLL</span>
                    {cfop_breakdown.oll.case_name && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        {cfop_breakdown.oll.case_name}
                      </span>
                    )}
                  </div>
                  {cfop_breakdown.oll.is_optimal ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                {cfop_breakdown.oll.moves && (
                  <div className="font-mono text-sm text-slate-800 mb-2">{cfop_breakdown.oll.moves}</div>
                )}
                {cfop_breakdown.oll.better_algorithm && (
                  <div className="text-xs text-green-600 font-mono bg-green-50 p-2 rounded">
                    ✨ 更优公式：{cfop_breakdown.oll.better_algorithm}
                  </div>
                )}
                {cfop_breakdown.oll.coll_available && cfop_breakdown.oll.coll_suggestion && (
                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded mt-2">
                    🎯 COLL 建议：{cfop_breakdown.oll.coll_suggestion}
                  </div>
                )}
              </div>
            )}

            {/* PLL */}
            {cfop_breakdown.pll && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-purple-700">PLL</span>
                    {cfop_breakdown.pll.case_name && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                        {cfop_breakdown.pll.case_name}
                      </span>
                    )}
                  </div>
                  {cfop_breakdown.pll.is_optimal ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                {cfop_breakdown.pll.moves && (
                  <div className="font-mono text-sm text-slate-800 mb-2">{cfop_breakdown.pll.moves}</div>
                )}
                {cfop_breakdown.pll.better_algorithm && (
                  <div className="text-xs text-green-600 font-mono bg-green-50 p-2 rounded">
                    ✨ 更优公式：{cfop_breakdown.pll.better_algorithm}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 高级技巧分析 */}
      {advanced_techniques && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-indigo-500" />
              高级技巧分析
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              <TechniqueTag label="XCross" used={advanced_techniques.xcross_used} />
              <TechniqueTag label="XXCross" used={advanced_techniques.xxcross_used} />
              <TechniqueTag label="COLL" used={advanced_techniques.coll_used} />
              <TechniqueTag label="控槽法" used={advanced_techniques.slot_control_used} />
              <TechniqueTag label="预判" used={advanced_techniques.good_lookahead} />
            </div>
            
            {advanced_techniques.techniques_to_learn && advanced_techniques.techniques_to_learn.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700 mb-2">📚 建议学习的技巧：</p>
                <ul className="text-sm text-amber-600 space-y-1">
                  {advanced_techniques.techniques_to_learn.map((tech, idx) => (
                    <li key={idx}>• {tech}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 技能评估 */}
      {skill_assessment && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-green-500" />
              技能评估
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {skill_assessment.strengths && skill_assessment.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-700 mb-2">✅ 优点：</p>
                <ul className="text-sm text-green-600 space-y-1">
                  {skill_assessment.strengths.map((s, idx) => (
                    <li key={idx}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {skill_assessment.weaknesses && skill_assessment.weaknesses.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700 mb-2">⚠️ 需改进：</p>
                <ul className="text-sm text-amber-600 space-y-1">
                  {skill_assessment.weaknesses.map((w, idx) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {skill_assessment.priority_improvements && skill_assessment.priority_improvements.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-700 mb-2">🎯 优先改进：</p>
                <ol className="text-sm text-blue-600 space-y-1">
                  {skill_assessment.priority_improvements.map((p, idx) => (
                    <li key={idx}>{idx + 1}. {p}</li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 周训练计划 */}
      {weekly_training_plan && Object.keys(weekly_training_plan).length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-blue-500" />
              周训练计划
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-2">
              {Object.entries(weekly_training_plan).map(([day, plan], idx) => (
                <div key={day} className={cn(
                  "p-3 rounded-lg border",
                  idx === 6 ? "bg-slate-50 border-slate-200" : "bg-blue-50 border-blue-200"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {getDayName(day)}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {plan.duration}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-700 mb-1">{plan.focus}</p>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {plan.exercises.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 学习资源 */}
      {learning_resources && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-slate-100 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-purple-500" />
              推荐学习资源
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* 视频 */}
            {learning_resources.videos && learning_resources.videos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4" /> 视频教程
                </p>
                <div className="space-y-2">
                  {learning_resources.videos.map((video, idx) => (
                    <a
                      key={idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-700">{video.title}</span>
                        <ExternalLink className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-xs text-red-600 mt-1">{video.relevance}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 网站 */}
            {learning_resources.websites && learning_resources.websites.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> 学习网站
                </p>
                <div className="space-y-2">
                  {learning_resources.websites.map((site, idx) => (
                    <a
                      key={idx}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700">{site.name}</span>
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-xs text-blue-600 mt-1">{site.content}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 练习工具 */}
            {learning_resources.practice_tools && learning_resources.practice_tools.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" /> 练习工具
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {learning_resources.practice_tools.map((tool, idx) => (
                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium text-green-700">{tool.name}</span>
                      <p className="text-xs text-green-600 mt-1">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 技巧标签组件
function TechniqueTag({ label, used }: { label: string; used?: boolean }) {
  return (
    <div className={cn(
      "px-3 py-2 rounded-lg text-center text-sm font-medium transition-colors",
      used 
        ? "bg-green-100 text-green-700 border border-green-300" 
        : "bg-slate-100 text-slate-500 border border-slate-200"
    )}>
      {used ? '✓ ' : ''}{label}
    </div>
  )
}

// 获取星期名称
function getDayName(day: string): string {
  const dayMap: { [key: string]: string } = {
    day1: '周一',
    day2: '周二',
    day3: '周三',
    day4: '周四',
    day5: '周五',
    day6: '周六',
    day7: '周日'
  }
  return dayMap[day] || day
}
