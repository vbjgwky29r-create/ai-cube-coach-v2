'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { CubeKeyboard } from '@/components/cube/cube-keyboard'
import { CubeNet, ColorLegend } from '@/components/cube/cube-net'
import { CoachPlanCard } from '@/components/cube/coach-plan-card'
import { Sparkles, Zap, Trophy, Target, Box, Eye, EyeOff, MapPin, Clock, TrendingUp, Fingerprint, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unflattenCubeState, type CubeState } from '@/lib/cube/cube-state'

export default function AnalyzePage() {
  const [scramble, setScramble] = useState('R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'')
  const [solution, setSolution] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingOptimal, setGeneratingOptimal] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [optimalResult, setOptimalResult] = useState<any>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [keyboardTarget, setKeyboardTarget] = useState<'scramble' | 'solution'>('solution')
  const [showCube, setShowCube] = useState(true)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_optimalError, setOptimalError] = useState<string | null>(null)

  const generateOptimal = async () => {
    if (!scramble.trim() || scramble.trim().length < 3) {
      setOptimalError('请输入至少3个字符的打乱公式')
      return
    }

    setGeneratingOptimal(true)
    setOptimalError(null)

    try {
      const response = await fetch('/api/cube/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble: scramble.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }))
        throw new Error(errorData.error || 'API 请求失败')
      }

      const data = await response.json()
      setOptimalResult(data)
    } catch (e: any) {
      console.error('生成最优解失败:', e)
      setOptimalError(e?.message || '生成失败')
      // 失败时至少设置一个基本结果（不含最优解）
      setOptimalResult({
        scramble: scramble.trim(),
        optimalSolution: '',
        steps: 0,
        cubeState: null,
        formulas: [],
        explanations: ['最优解生成失败，请稍后再试'],
      })
    } finally {
      setGeneratingOptimal(false)
    }
  }

  const handleAnalyze = async () => {
    if (!solution.trim()) {
      alert('请输入你的解法')
      return
    }

    setAnalyzing(true)

    try {
      const response = await fetch('/api/cube/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble, solution }),
      })

      const data = await response.json()
      setResult(data)
    } catch (e) {
      console.error(e)
      alert('分析失败，请稍后重试')
    } finally {
      setAnalyzing(false)
    }
  }

  const handlePickImage = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setOcrLoading(true)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = String(reader.result || '')
          const payload = result.includes(',') ? result.split(',')[1] : result
          resolve(payload)
        }
        reader.onerror = () => reject(new Error('failed_to_read_image'))
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/ocr/cube-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mode: 'simple' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'ocr_request_failed')

      if (data.scramble) setScramble(data.scramble)
      if (data.solution) setSolution(data.solution)
      if (!data.scramble && !data.solution) {
        alert('OCR did not extract scramble/solution. Please try a clearer screenshot.')
      }
    } catch (err) {
      console.error('[OCR Upload] Failed:', err)
      alert('Image OCR failed. Please try again.')
    } finally {
      setOcrLoading(false)
      e.target.value = ''
    }
  }

  const handleKeyboardInput = (value: string) => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution

    // 检查是否是修饰符（' 或 2）
    if (value === "'" || value === '2') {
      // 修饰符：去掉末尾空格，加上修饰符，再加空格
      setValue(currentValue.trimEnd() + value + ' ')
    } else if (value === ' ') {
      // 空格直接添加
      setValue(currentValue + value)
    } else {
      // 普通字母：直接加字母后自动加空格
      setValue(currentValue + value + ' ')
    }
  }

  const handleBackspace = () => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution

    // 如果末尾是空格，删除空格和前面的字母/修饰符
    const trimmed = currentValue.trimEnd()
    if (trimmed.length > 0) {
      setValue(trimmed.slice(0, -1) + ' ')
    } else {
      setValue('')
    }
  }

  const handleClear = () => {
    if (keyboardTarget === 'scramble') {
      setScramble('')
    } else {
      setSolution('')
    }
  }

  const handleSpace = () => {
    handleKeyboardInput(' ')
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-green-400'
    if (score >= 5) return 'from-yellow-500 to-yellow-400'
    return 'from-red-500 to-red-400'
  }

  const getEfficiencyLabel = (score: number) => {
    if (score >= 9) return { label: '优秀', emoji: '🏆' }
    if (score >= 7) return { label: '良好', emoji: '👍' }
    if (score >= 5) return { label: '中等', emoji: '💪' }
    if (score >= 3) return { label: '需改进', emoji: '📈' }
    return { label: '加油', emoji: '🎯' }
  }

  const getEfficiencyInfo = getEfficiencyLabel(0)

  // 获取魔方状态用于可视化
  const cubeStateRaw = optimalResult?.cubeState
  const cubeState: CubeState | null = cubeStateRaw
    ? (typeof cubeStateRaw === 'string'
      ? unflattenCubeState(cubeStateRaw)
      : cubeStateRaw)
    : null

  return (
    <div className="min-h-screen py-4 sm:py-6">
      {/* 背景装饰 */}
      <div className="px-4 relative z-10">
        <div className="max-w-md sm:max-w-lg mx-auto lg:max-w-none lg:mx-0 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
          {/* Header */}
          <div className="lg:col-span-2 text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900">
                解法分析
              </h1>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              输入打乱公式和你的解法，AI帮你找出优化空间
            </p>
          </div>

          {/* 左侧：输入区域 */}
          <div className="w-full space-y-4">
            {/* 输入区域 + 键盘合体 */}
            <Card className="card-cube border border-slate-200 shadow-sm overflow-hidden">
              {/* 输入框区域 */}
              <div className="border-b border-slate-200 bg-slate-50/50 p-4 space-y-3">
                {/* 打乱公式 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      🎲 打乱公式
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePickImage}
                        className="text-[10px] px-2 py-0.5 rounded transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                        disabled={ocrLoading}
                      >
                        {ocrLoading ? 'OCR...' : 'Upload Image'}
                      </button>
                      <button
                        onClick={() => setKeyboardTarget('scramble')}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded transition-colors",
                          keyboardTarget === 'scramble'
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        )}
                      >
                        当前输入
                      </button>
                      <button
                        onClick={generateOptimal}
                        className="text-[10px] px-2 py-0.5 rounded transition-colors bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 disabled:opacity-50"
                        disabled={generatingOptimal || !scramble.trim()}
                      >
                        {generatingOptimal ? '生成中...' : '生成展开图'}
                      </button>
                      {cubeState && (
                        <>
                          <button
                            onClick={() => setShowCube(!showCube)}
                            className="text-[10px] px-2 py-0.5 rounded transition-colors bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1"
                          >
                            {showCube ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {showCube ? '隐藏' : '展开图'}
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      value={scramble}
                      readOnly
                      onClick={() => setKeyboardTarget('scramble')}
                      placeholder="点击下方按钮输入..."
                      className="font-cube text-sm pr-16 h-10 cursor-pointer"
                    />
                    {scramble && (
                      <button
                        onClick={() => {
                          setScramble('')
                          setOptimalResult(null)
                        }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* 解法 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      ✨ 你的解法
                    </label>
                    <button
                      onClick={() => setKeyboardTarget('solution')}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded transition-colors",
                        keyboardTarget === 'solution'
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      )}
                    >
                      当前输入
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={solution}
                      readOnly
                      onClick={() => setKeyboardTarget('solution')}
                      placeholder="点击下方按钮输入..."
                      rows={3}
                      className="font-cube text-sm resize-none pr-8 cursor-pointer"
                    />
                    {solution && (
                      <button
                        onClick={() => setSolution('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 虚拟键盘 */}
              <div className="p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    点击下方按钮输入到 <span className="font-semibold text-orange-500">
                      {keyboardTarget === 'scramble' ? '🎲 打乱公式' : '✨ 解法'}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className="lg:hidden text-slate-500 px-2 h-7"
                  >
                    {showKeyboard ? '隐藏' : '键盘'}
                  </Button>
                </div>

                {showKeyboard && (
                  <CubeKeyboard
                    onInput={handleKeyboardInput}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                    onSpace={handleSpace}
                    value={keyboardTarget === 'scramble' ? scramble : solution}
                  />
                )}
              </div>
            </Card>

            {/* 分析按钮 */}
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !solution.trim()}
              className={cn(
                "w-full py-5 text-base font-semibold shadow-sm border border-slate-300 bg-slate-900 text-white hover:bg-slate-800",
                analyzing && "animate-pulse"
              )}
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 0 0 00018 0z" />
                  </svg>
                  分析中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  开始分析
                </span>
              )}
            </Button>

            {/* Result Section */}
            {result && (
              <div className="space-y-4">
                {/* Summary Card */}
                <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '0ms' }}>
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      分析结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">你的步数</p>
                        <p className="text-2xl font-bold text-blue-600">{result.summary.steps}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">最优步数</p>
                        <p className="text-2xl font-bold text-green-600">{result.summary.optimalSteps}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">效率评分</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className={`text-2xl font-bold bg-gradient-to-r ${getEfficiencyColor(result.summary.efficiency)} bg-clip-text text-transparent`}>
                            {result.summary.efficiency.toFixed(1)}
                          </p>
                          <span className="text-lg">{getEfficiencyInfo.emoji}</span>
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">预估用时</p>
                        <p className="text-2xl font-bold text-purple-600">{result.summary.estimatedTime}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optimizations */}
                {result.optimizations && result.optimizations.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '100ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        优化建议
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2">
                      {result.optimizations.map((opt: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500 text-white">
                              可节省 {opt.savings} 步
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">原:</span>
                              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-cube text-[10px] text-slate-700">
                                {opt.from}
                              </code>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">优化:</span>
                              <code className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-cube text-[10px]">
                                {opt.to}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recognized Formulas */}
                {result.formulas && result.formulas.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '300ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        识别的公式
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {result.formulas.map((formula: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-slate-700"
                          >
                            {formula.name}
                            <span className="text-[10px] text-slate-500">({formula.category})</span>
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learnings */}
                {result.learnings && result.learnings.length > 0 && (
                  <Card className="card-cube border border-slate-200 shadow-sm result-card" style={{ animationDelay: '400ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        📚 新公式推荐
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-3">
                      {result.learnings.map((learning: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-800">{learning.formulaName}</h4>
                            <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 rounded text-white">
                              {learning.category}
                            </span>
                          </div>
                          <code className="block bg-slate-100 p-2 rounded text-xs mb-2 font-cube border border-slate-200 text-slate-800">
                            {learning.notation}
                          </code>
                          <p className="text-xs text-slate-600">{learning.explanation}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Optimal Solution */}
                {result.summary.optimalSolution && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '600ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        参考最优解
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <code className="block bg-slate-100 p-3 rounded-lg text-xs break-all font-cube border border-slate-200 text-slate-800">
                        {result.summary.optimalSolution}
                      </code>
                    </CardContent>
                  </Card>
                )}

                {/* ========== 增强分析结果 ========== */}

                {/* 步骤定位分析 */}
                {result.stepOptimizations && result.stepOptimizations.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '700ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        问题定位分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2">
                      {result.stepOptimizations.map((opt: any, idx: number) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                              第{opt.stepRange[0]}-{opt.stepRange[1]}步
                            </span>
                            <span className="text-xs font-semibold text-red-700">{opt.problemType}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                            <div>
                              <span className="text-slate-500">原:</span>
                              <code className="ml-1 bg-slate-100 px-1 rounded">{opt.originalMoves}</code>
                            </div>
                            <div>
                              <span className="text-slate-500">优化:</span>
                              <code className="ml-1 bg-green-100 text-green-700 px-1 rounded">{opt.optimizedMoves}</code>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">{opt.reason}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 时间分解 */}
                {result.timeBreakdown && result.timeBreakdown.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '800ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        时间分解
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="space-y-2">
                        {result.timeBreakdown.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-16 text-xs font-medium text-slate-600">{item.stage}</div>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(item.percentage, 100)}%`,
                                  backgroundColor: item.bottleneck ? '#ef4444' : item.percentage > 30 ? '#f59e0b' : '#10b981'
                                }}
                              />
                            </div>
                            <div className="text-xs text-slate-500 w-12 text-right">{item.percentage}%</div>
                            <div className="text-xs text-slate-500 w-16 text-right">{item.estimatedTime}s</div>
                          </div>
                        ))}
                        {result.tpsAnalysis && (
                          <div className="mt-3 pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">TPS: {result.tpsAnalysis.userTPS}</span>
                              <span className="text-slate-400">({result.tpsAnalysis.levelName})</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* F2L槽位分析 */}
                {result.f2lSlots && result.f2lSlots.slots && result.f2lSlots.slots.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '900ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        🎲 F2L 槽位分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {result.f2lSlots.slots.map((slot: any, idx: number) => {
                          const getEfficiencyColor = (eff: string) => {
                            const colors: Record<string, string> = {
                              excellent: 'bg-green-100 text-green-700 border-green-300',
                              good: 'bg-blue-100 text-blue-700 border-blue-300',
                              fair: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                              poor: 'bg-red-100 text-red-700 border-red-300',
                            }
                            return colors[eff] || colors.fair
                          }
                          return (
                            <div key={idx} className={`p-2 rounded-lg border ${getEfficiencyColor(slot.efficiency)}`}>
                              <div className="text-xs font-medium mb-1">{slot.slotNumber}号槽</div>
                              <div className="text-lg font-bold">{slot.steps}步</div>
                              {slot.usedFormula && (
                                <div className="text-[10px] text-slate-600">{slot.usedFormula}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {result.f2lSlots.orderSuggestion && (
                        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded">
                          💡 {result.f2lSlots.orderSuggestion}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 顶层识别 (OLL/PLL) */}
                {(result.ollCase || result.pllCase) && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1000ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        🔯 顶层识别
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-3">
                      {result.ollCase && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">OLL 情况</div>
                          <div className="font-medium text-sm">{result.ollCase.caseName}</div>
                          <div className="text-xs text-slate-500">你的步数: {result.ollCase.userSteps} / 最优: {result.ollCase.optimalSteps}</div>
                        </div>
                      )}
                      {result.pllCase && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">PLL 情况</div>
                          <div className="font-medium text-sm">{result.pllCase.caseName}</div>
                          <div className="text-xs text-slate-500">你的步数: {result.pllCase.userSteps} / 最优: {result.pllCase.optimalSteps}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 与高级玩家对比 */}
                {result.comparison && result.comparison.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1100ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        与高级玩家对比
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-1 text-slate-500">阶段</th>
                            <th className="text-right py-1 text-slate-500">你的步数</th>
                            <th className="text-right py-1 text-slate-500">高级玩家</th>
                            <th className="text-right py-1 text-slate-500">提升空间</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.comparison.map((comp: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-1">{comp.stage}</td>
                              <td className="text-right">{comp.userSteps}步</td>
                              <td className="text-right">{comp.advancedSteps}步</td>
                              <td className="text-right font-medium text-blue-600">+{comp.improvementPotential}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}

                {/* 优先改进建议 */}
                {result.prioritizedRecommendations && result.prioritizedRecommendations.length > 0 && (
                  <Card className="card-cube border border-slate-200 shadow-sm result-card" style={{ animationDelay: '1200ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        📋 本周改进计划
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-3">
                      {result.prioritizedRecommendations.slice(0, 3).map((rec: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                              {rec.priority}
                            </span>
                            <span className="font-semibold text-sm">{rec.title}</span>
                          </div>
                          <div className="text-xs text-slate-600 mb-2">
                            <span className="text-slate-500">当前:</span> {rec.currentStatus} → <span className="text-slate-500">目标:</span> {rec.targetStatus}
                          </div>
                          <div className="text-xs font-medium text-orange-700 mb-1">预计改进: {rec.estimatedImprovement}</div>
                          <div className="text-xs text-slate-500">
                            <div className="font-medium mb-1">行动项:</div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {rec.actionItems.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">⏱️ {rec.timeToSeeResults}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 手指技巧建议 */}
                <CoachPlanCard result={result} />

                {result.fingerprintTips && result.fingerprintTips.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1300ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-indigo-500" />
                        手指技巧提示
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2">
                      {result.fingerprintTips.slice(0, 5).map((tip: any, idx: number) => (
                        <div key={idx} className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                          <div className="text-xs font-medium mb-1">{tip.moveSequence}</div>
                          <div className="text-xs text-slate-600">{tip.description}</div>
                          <div className="text-[10px] text-indigo-600 mt-1">
                            难度: {tip.difficulty === 'easy' ? '简单' : tip.difficulty === 'medium' ? '中等' : '较难'}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Example Section - 未分析时显示 */}
            {!result && (
              <Card className="card-cube shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    使用示例
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-transparent border border-orange-100">
                      <div className="text-xl mb-1">1️⃣</div>
                      <p className="text-xs text-slate-600">输入你使用的打乱公式，或使用默认示例</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-transparent border border-blue-100">
                      <div className="text-xl mb-1">2️⃣</div>
                      <p className="text-xs text-slate-600">使用虚拟键盘或直接输入复原步骤</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-transparent border border-purple-100">
                      <div className="text-xl mb-1">3️⃣</div>
                      <p className="text-xs text-slate-600">点击"开始分析"查看AI分析结果</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：魔方展开图 + 最优解（桌面端） */}
          <div className="hidden lg:block w-[320px] space-y-4 lg:sticky lg:top-6">
            {/* 魔方展开图 */}
            {showCube && cubeState && (
              <Card className="card-cube border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Box className="w-4 h-4 text-purple-500" />
                    魔方展开图
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="flex justify-center mb-3">
                    <CubeNet state={cubeState} showLabels={true} size="md" />
                  </div>
                  <ColorLegend />
                </CardContent>
              </Card>
            )}

            {/* 最优解卡片 */}
            {optimalResult && (
              <Card className="card-cube border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-green-500" />
                    最优解
                    {generatingOptimal && <span className="text-xs text-slate-400">生成中...</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {/* 步数 */}
                  <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-[10px] text-slate-500">最优步数</p>
                    <p className="text-2xl font-bold text-green-600">{optimalResult.steps}</p>
                  </div>

                  {/* 最优解公式 */}
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">解法公式:</p>
                    <code className="block bg-slate-100 p-2 rounded text-xs break-all font-cube border border-slate-200 text-slate-800">
                      {optimalResult.optimalSolution}
                    </code>
                  </div>

                  {/* 识别的公式 */}
                  {optimalResult.formulas && optimalResult.formulas.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">包含公式:</p>
                      <div className="flex flex-wrap gap-1">
                        {optimalResult.formulas.map((formula: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 text-slate-700"
                          >
                            {formula.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 解说 */}
                  {optimalResult.explanations && optimalResult.explanations.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">解说:</p>
                      <ul className="text-[10px] text-slate-600 space-y-0.5">
                        {optimalResult.explanations.map((exp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-500">•</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 重新生成按钮 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateOptimal}
                    disabled={generatingOptimal}
                    className="w-full text-xs"
                  >
                    {generatingOptimal ? '生成中...' : '刷新最优解'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 提示卡片 */}
            {!cubeState && (
              <Card className="card-cube shadow-sm">
                <CardContent className="p-4 text-center">
                  <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    输入打乱公式后，这里会显示魔方展开图和最优解
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
