'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CubeKeyboard } from '@/components/cube/cube-keyboard'
import { CubeNet, ColorLegend } from '@/components/cube/cube-net'
import { ProfessionalAnalysis } from '@/components/cube/professional-analysis'
import { Sparkles, Zap, Trophy, Target, Box, ChevronDown, ChevronUp, MapPin, Clock, TrendingUp, Fingerprint, AlertCircle, Copy, Check, Camera, Loader2, Brain, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unflattenCubeState, type CubeState } from '@/lib/cube/cube-state'

export default function AnalyzePage() {
  const [scramble, setScramble] = useState('')
  const [solution, setSolution] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingOptimal, setGeneratingOptimal] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [optimalResult, setOptimalResult] = useState<any>(null)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [keyboardTarget, setKeyboardTarget] = useState<'scramble' | 'solution'>('scramble')
  const [showCubeNet, setShowCubeNet] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_optimalError, setOptimalError] = useState<string | null>(null)
  
  // CFOP 解法相关状态
  const [solveType, setSolveType] = useState<'machine' | 'cfop'>('cfop')
  const [cfopResult, setCfopResult] = useState<any>(null)
  const [generatingCfop, setGeneratingCfop] = useState(false)
  
  // OCR 相关状态
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<{ scramble: string; solution: string } | null>(null)
  const [showOcrPreview, setShowOcrPreview] = useState(false)
  const [professionalAnalysis, setProfessionalAnalysis] = useState<any>(null)
  const [showProfessionalAnalysis, setShowProfessionalAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const scrambleRef = useRef<HTMLDivElement>(null)
  const solutionRef = useRef<HTMLDivElement>(null)

  // 自动滚动到当前输入框
  useEffect(() => {
    const targetRef = keyboardTarget === 'scramble' ? scrambleRef : solutionRef
    if (targetRef.current && showKeyboard) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [keyboardTarget, showKeyboard])

  const generateOptimal = async () => {
    if (!scramble.trim() || scramble.trim().length < 3) {
      setOptimalError('请输入至少3个字符的打乱公式')
      return
    }

    setGeneratingOptimal(true)
    setOptimalError(null)
    setCfopResult(null)

    try {
      // 同时调用两个 API：获取魔方状态和 CFOP 解法
      const [optimalResponse, cfopResponse] = await Promise.all([
        fetch('/api/cube/optimal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scramble: scramble.trim() }),
        }),
        fetch('/api/cube/cfop-solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scramble: scramble.trim() }),
        })
      ])

      // 处理魔方状态结果（用于展开图）
      if (optimalResponse.ok) {
        const optimalData = await optimalResponse.json()
        setOptimalResult(optimalData)
      }

      // 处理 CFOP 解法结果
      if (cfopResponse.ok) {
        const cfopData = await cfopResponse.json()
        setCfopResult(cfopData.solution)
      } else {
        throw new Error('CFOP 解法生成失败')
      }
    } catch (e: any) {
      console.error('生成 CFOP 解法失败:', e)
      setOptimalError(e?.message || '生成失败')
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

  const handleKeyboardInput = (value: string) => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution

    if (value === "'" || value === '2') {
      setValue(currentValue.trimEnd() + value + ' ')
    } else if (value === ' ') {
      setValue(currentValue + value)
    } else {
      setValue(currentValue + value + ' ')
    }
  }

  const handleBackspace = () => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution

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
      setOptimalResult(null)
    } else {
      setSolution('')
    }
  }

  const handleSpace = () => {
    handleKeyboardInput(' ')
  }

  // OCR 截图识别处理
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOcrLoading(true)
    setOcrResult(null)
    setProfessionalAnalysis(null)

    try {
      // 读取文件为 base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        
        try {
          // 调用专业分析 API
          const response = await fetch('/api/ocr/cube-formula', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, mode: 'full' }),
          })

          if (!response.ok) {
            throw new Error('识别失败')
          }

          const data = await response.json()
          
          if (data.scramble || data.solution) {
            setOcrResult({
              scramble: data.scramble || '',
              solution: data.solution || ''
            })
            
            // 如果有专业分析结果，保存并显示
            if (data.analysis) {
              setProfessionalAnalysis(data.analysis)
              setShowProfessionalAnalysis(true)
            }
            
            setShowOcrPreview(true)
          } else {
            alert('未能识别到公式，请确保截图包含打乱公式或复原公式')
          }
        } catch (err) {
          console.error('OCR 请求失败:', err)
          alert('识别失败，请重试')
        } finally {
          setOcrLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('文件读取失败:', err)
      setOcrLoading(false)
      alert('文件读取失败')
    }

    // 清空 input 以便可以重复选择同一文件
    e.target.value = ''
  }

  // 确认并应用 OCR 结果
  const applyOcrResult = () => {
    if (ocrResult) {
      if (ocrResult.scramble) {
        setScramble(ocrResult.scramble)
      }
      if (ocrResult.solution) {
        setSolution(ocrResult.solution)
      }
      setShowOcrPreview(false)
      setOcrResult(null)
    }
  }

  // 取消 OCR 结果
  const cancelOcrResult = () => {
    setShowOcrPreview(false)
    setOcrResult(null)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-400'
    if (score >= 5) return 'from-amber-500 to-yellow-400'
    return 'from-red-500 to-orange-400'
  }

  const getEfficiencyLabel = (score: number) => {
    if (score >= 9) return { label: '优秀', emoji: '🏆' }
    if (score >= 7) return { label: '良好', emoji: '👍' }
    if (score >= 5) return { label: '中等', emoji: '💪' }
    if (score >= 3) return { label: '需改进', emoji: '📈' }
    return { label: '加油', emoji: '🎯' }
  }

  const cubeState: CubeState | null = optimalResult?.cubeState
    ? unflattenCubeState(optimalResult.cubeState)
    : null

  return (
    <div className="min-h-screen pb-6">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">解法分析</h1>
          </div>
          <p className="text-slate-500 text-sm">AI 分析 · 精准优化</p>
          
          {/* 截图识别按钮 */}
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
              className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
            >
              {ocrLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  识别中...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  上传魔方星球截图
                </>
              )}
            </Button>
          </div>
        </div>

        {/* OCR 识别结果预览弹窗 */}
        {showOcrPreview && ocrResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl shadow-2xl my-4">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="w-5 h-5 text-blue-500" />
                  {professionalAnalysis ? 'AI 专业分析结果' : '识别结果预览'}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* 公式编辑区 */}
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">请检查识别结果，可以直接编辑修正错误</p>
                  
                  {/* 打乱公式 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">🎲 打乱公式</label>
                    <textarea
                      value={ocrResult.scramble}
                      onChange={(e) => setOcrResult({ ...ocrResult, scramble: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      rows={2}
                      placeholder="未识别到打乱公式"
                    />
                  </div>
                  
                  {/* 复原公式 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">✨ 复原公式</label>
                    <textarea
                      value={ocrResult.solution}
                      onChange={(e) => setOcrResult({ ...ocrResult, solution: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      rows={3}
                      placeholder="未识别到复原公式"
                    />
                  </div>
                </div>
                
                {/* 专业分析结果 */}
                {professionalAnalysis && (
                  <div className="border-t border-slate-200 pt-4">
                    <ProfessionalAnalysis analysis={professionalAnalysis} />
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
                  <Button
                    variant="outline"
                    onClick={cancelOcrResult}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={applyOcrResult}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    确认并应用公式
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="space-y-4">
          
          {/* 魔方展开图 - 移动端和桌面端都显示 */}
          {showCubeNet && cubeState && (
            <Card className="card-cube shadow-lg overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-3 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Box className="w-5 h-5 text-purple-500" />
                  魔方展开图
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCubeNet(false)}
                  className="text-slate-400 hover:text-slate-600 h-8 px-2"
                >
                  收起
                </Button>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex flex-col items-center gap-4">
                  <CubeNet state={cubeState} showLabels={true} size="md" />
                  <ColorLegend />
                </div>
                
                {/* CFOP 解法信息 */}
                {cfopResult && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-slate-800">CFOP 解法</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{cfopResult.totalSteps} 步</span>
                        <span className="text-xs text-slate-500">{cfopResult.orientation}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(cfopResult.fullSolution, 'cfop')}
                        className="h-7 px-2 text-xs"
                      >
                        {copiedField === 'cfop' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedField === 'cfop' ? '已复制' : '复制'}
                      </Button>
                    </div>
                    
                    {/* Cross */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-700">Cross</span>
                        <span className="text-xs text-blue-500">{cfopResult.cross.steps} 步</span>
                      </div>
                      <div className="font-mono text-sm text-slate-800">{cfopResult.cross.moves}</div>
                      <p className="text-xs text-slate-500 mt-1">{cfopResult.cross.description}</p>
                    </div>
                    
                    {/* F2L */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-green-700">F2L</span>
                        <span className="text-xs text-green-500">{cfopResult.f2l.steps} 步</span>
                      </div>
                      <div className="font-mono text-sm text-slate-800 break-all">{cfopResult.f2l.moves}</div>
                      <p className="text-xs text-slate-500 mt-1">{cfopResult.f2l.description}</p>
                    </div>
                    
                    {/* OLL */}
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-yellow-700">OLL</span>
                        <span className="text-xs text-yellow-600">{cfopResult.oll.steps} 步</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">{cfopResult.oll.caseName}</span>
                      </div>
                      <div className="font-mono text-sm text-slate-800">{cfopResult.oll.moves}</div>
                      <p className="text-xs text-slate-500 mt-1">{cfopResult.oll.description}</p>
                    </div>
                    
                    {/* PLL */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-purple-700">PLL</span>
                        <span className="text-xs text-purple-500">{cfopResult.pll.steps} 步</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{cfopResult.pll.caseName}</span>
                      </div>
                      <div className="font-mono text-sm text-slate-800">{cfopResult.pll.moves}</div>
                      <p className="text-xs text-slate-500 mt-1">{cfopResult.pll.description}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 未生成展开图时的提示 */}
          {!cubeState && (
            <Card className="card-cube shadow-sm">
              <CardContent className="py-6 text-center">
                <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">输入打乱公式，生成最优解和展开图</p>
                {showCubeNet === false && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCubeNet(true)}
                    className="text-xs"
                  >
                    显示展开图区域
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* 输入区域 */}
          <Card className="card-cube shadow-lg overflow-hidden" ref={inputAreaRef}>
            <CardContent className="p-0">
              {/* 打乱公式输入 */}
              <div 
                ref={scrambleRef}
                className={cn(
                  "p-4 border-b-2 transition-colors cursor-pointer",
                  keyboardTarget === 'scramble' 
                    ? "bg-orange-50 border-orange-300" 
                    : "bg-white border-slate-100 hover:bg-slate-50"
                )}
                onClick={() => setKeyboardTarget('scramble')}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    🎲 打乱公式
                    {keyboardTarget === 'scramble' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white">输入中</span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    {scramble && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(scramble, 'scramble')
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        {copiedField === 'scramble' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        generateOptimal()
                      }}
                      disabled={generatingOptimal || !scramble.trim()}
                      className="h-7 px-3 text-xs bg-orange-500 hover:bg-orange-600"
                    >
                      {generatingOptimal ? '生成中...' : '生成 CFOP 解法'}
                    </Button>
                  </div>
                </div>
                
                {/* 公式显示区域 - 可滚动 */}
                <div className="relative">
                  <div 
                    className={cn(
                      "min-h-[48px] max-h-[120px] overflow-y-auto rounded-lg p-3 font-mono text-sm leading-relaxed",
                      keyboardTarget === 'scramble' 
                        ? "bg-white border-2 border-orange-400 shadow-inner" 
                        : "bg-slate-50 border border-slate-200"
                    )}
                  >
                    {scramble || (
                      <span className="text-slate-400">点击此处输入打乱公式...</span>
                    )}
                  </div>
                  {scramble && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setScramble('')
                        setOptimalResult(null)
                      }}
                      className="absolute right-2 top-2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors text-xs"
                      title="清空"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 解法输入 */}
              <div 
                ref={solutionRef}
                className={cn(
                  "p-4 border-b-2 transition-colors cursor-pointer",
                  keyboardTarget === 'solution' 
                    ? "bg-blue-50 border-blue-300" 
                    : "bg-white border-slate-100 hover:bg-slate-50"
                )}
                onClick={() => setKeyboardTarget('solution')}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    ✨ 你的解法
                    {keyboardTarget === 'solution' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">输入中</span>
                    )}
                  </label>
                  {solution && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(solution, 'solution')
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      {copiedField === 'solution' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  )}
                </div>
                
                {/* 公式显示区域 - 可滚动，更大高度 */}
                <div className="relative">
                  <div 
                    className={cn(
                      "min-h-[80px] max-h-[200px] overflow-y-auto rounded-lg p-3 font-mono text-sm leading-relaxed",
                      keyboardTarget === 'solution' 
                        ? "bg-white border-2 border-blue-400 shadow-inner" 
                        : "bg-slate-50 border border-slate-200"
                    )}
                  >
                    {solution || (
                      <span className="text-slate-400">点击此处输入你的解法...</span>
                    )}
                  </div>
                  {solution && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSolution('')
                      }}
                      className="absolute right-2 top-2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors text-xs"
                      title="清空"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 虚拟键盘 */}
              <div className="bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-600">
                    当前输入: <span className={cn(
                      "font-semibold px-2 py-0.5 rounded",
                      keyboardTarget === 'scramble' 
                        ? "bg-orange-100 text-orange-700" 
                        : "bg-blue-100 text-blue-700"
                    )}>
                      {keyboardTarget === 'scramble' ? '🎲 打乱公式' : '✨ 解法'}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className="text-slate-500 h-7 px-2 text-xs"
                  >
                    {showKeyboard ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        收起键盘
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        展开键盘
                      </>
                    )}
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
            </CardContent>
          </Card>

          {/* 分析按钮 */}
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !solution.trim()}
            className={cn(
              "w-full py-6 text-lg font-semibold shadow-lg rounded-xl",
              "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
              "disabled:from-slate-300 disabled:to-slate-400",
              analyzing && "animate-pulse"
            )}
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                分析中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                开始分析
              </span>
            )}
          </Button>

          {/* 分析结果 */}
          {result && (
            <div className="space-y-4">
              {/* 概要卡片 */}
              <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '0ms' }}>
                <CardHeader className="border-b border-slate-100 py-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    分析结果
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1 font-medium">你的步数</p>
                      <p className="text-3xl font-bold text-blue-700">{result.summary.steps}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <p className="text-xs text-green-600 mb-1 font-medium">最优步数</p>
                      <p className="text-3xl font-bold text-green-700">{result.summary.optimalSteps}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                      <p className="text-xs text-amber-600 mb-1 font-medium">效率评分</p>
                      <div className="flex items-center justify-center gap-1">
                        <p className={`text-3xl font-bold bg-gradient-to-r ${getEfficiencyColor(result.summary.efficiency)} bg-clip-text text-transparent`}>
                          {result.summary.efficiency.toFixed(1)}
                        </p>
                        <span className="text-xl">{getEfficiencyLabel(result.summary.efficiency).emoji}</span>
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <p className="text-xs text-purple-600 mb-1 font-medium">预估用时</p>
                      <p className="text-3xl font-bold text-purple-700">{result.summary.estimatedTime}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 优化建议 */}
              {result.optimizations && result.optimizations.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '100ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="w-5 h-5 text-orange-500" />
                      优化建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {result.optimizations.map((opt: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs px-3 py-1 rounded-full bg-orange-500 text-white font-medium">
                            可节省 {opt.savings} 步
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 w-8 flex-shrink-0">原:</span>
                            <code className="bg-white px-3 py-1.5 rounded-lg font-mono text-sm text-slate-700 border border-slate-200 break-all">
                              {opt.from}
                            </code>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 w-8 flex-shrink-0">优化:</span>
                            <code className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-mono text-sm border border-green-200 break-all">
                              {opt.to}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 识别的公式 */}
              {result.formulas && result.formulas.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '200ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      识别的公式
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {result.formulas.map((formula: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-slate-700"
                        >
                          {formula.name}
                          <span className="text-xs text-slate-500">({formula.category})</span>
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 新公式推荐 */}
              {result.learnings && result.learnings.length > 0 && (
                <Card className="card-cube shadow-lg border-2 border-orange-200 result-card" style={{ animationDelay: '300ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      📚 新公式推荐
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {result.learnings.map((learning: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                              {idx + 1}
                            </span>
                            <h4 className="font-semibold text-slate-800">{learning.formulaName}</h4>
                          </div>
                          <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 rounded-full text-white">
                            {learning.category}
                          </span>
                        </div>
                        <code className="block bg-white p-3 rounded-lg font-mono text-sm mb-3 border border-slate-200 text-slate-800 break-all">
                          {learning.notation}
                        </code>
                        <p className="text-sm text-slate-600">{learning.explanation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 参考最优解 */}
              {result.summary.optimalSolution && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '400ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="w-5 h-5 text-green-500" />
                      参考最优解
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">{result.summary.optimalSteps} 步</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.summary.optimalSolution, 'result-optimal')}
                        className="h-7 px-2 text-xs"
                      >
                        {copiedField === 'result-optimal' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedField === 'result-optimal' ? '已复制' : '复制'}
                      </Button>
                    </div>
                    <code className="block bg-slate-50 p-4 rounded-xl font-mono text-sm break-all border border-slate-200 text-slate-800 leading-relaxed">
                      {result.summary.optimalSolution}
                    </code>
                  </CardContent>
                </Card>
              )}

              {/* 步骤定位分析 */}
              {result.stepOptimizations && result.stepOptimizations.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '500ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="w-5 h-5 text-red-500" />
                      问题定位分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {result.stepOptimizations.map((opt: any, idx: number) => (
                      <div key={idx} className="bg-red-50 p-4 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-medium">
                            第{opt.stepRange[0]}-{opt.stepRange[1]}步
                          </span>
                          <span className="text-sm font-semibold text-red-700">{opt.problemType}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-slate-500">原:</span>
                            <code className="ml-2 bg-white px-2 py-1 rounded border border-slate-200">{opt.originalMoves}</code>
                          </div>
                          <div>
                            <span className="text-slate-500">优化:</span>
                            <code className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">{opt.optimizedMoves}</code>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">{opt.reason}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 时间分解 */}
              {result.timeBreakdown && result.timeBreakdown.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '600ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="w-5 h-5 text-blue-500" />
                      时间分解
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {result.timeBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-20 text-sm font-medium text-slate-600">{item.stage}</div>
                          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(item.percentage, 100)}%`,
                                backgroundColor: item.bottleneck ? '#ef4444' : item.percentage > 30 ? '#f59e0b' : '#10b981'
                              }}
                            />
                          </div>
                          <div className="text-sm text-slate-500 w-12 text-right">{item.percentage}%</div>
                          <div className="text-sm text-slate-500 w-14 text-right">{item.estimatedTime}s</div>
                        </div>
                      ))}
                      {result.tpsAnalysis && (
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">TPS: <strong>{result.tpsAnalysis.userTPS}</strong></span>
                            <span className="text-slate-500">({result.tpsAnalysis.levelName})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* F2L槽位分析 */}
              {result.f2lSlots && result.f2lSlots.slots && result.f2lSlots.slots.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '700ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      🎲 F2L 槽位分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {result.f2lSlots.slots.map((slot: any, idx: number) => {
                        const getEfficiencyStyle = (eff: string) => {
                          const styles: Record<string, string> = {
                            excellent: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-300',
                            good: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-300',
                            fair: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300',
                            poor: 'bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-300',
                          }
                          return styles[eff] || styles.fair
                        }
                        return (
                          <div key={idx} className={`p-3 rounded-xl border ${getEfficiencyStyle(slot.efficiency)}`}>
                            <div className="text-sm font-medium mb-1">{slot.slotNumber}号槽</div>
                            <div className="text-2xl font-bold">{slot.steps}步</div>
                            {slot.usedFormula && (
                              <div className="text-xs opacity-80 mt-1">{slot.usedFormula}</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {result.f2lSlots.orderSuggestion && (
                      <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-xl border border-blue-200">
                        💡 {result.f2lSlots.orderSuggestion}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 顶层识别 */}
              {(result.ollCase || result.pllCase) && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '800ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      🔯 顶层识别
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {result.ollCase && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <div className="text-xs text-purple-600 mb-1 font-medium">OLL 情况</div>
                        <div className="font-semibold text-slate-800">{result.ollCase.caseName}</div>
                        <div className="text-sm text-slate-500 mt-1">你的步数: {result.ollCase.userSteps} / 最优: {result.ollCase.optimalSteps}</div>
                      </div>
                    )}
                    {result.pllCase && (
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                        <div className="text-xs text-indigo-600 mb-1 font-medium">PLL 情况</div>
                        <div className="font-semibold text-slate-800">{result.pllCase.caseName}</div>
                        <div className="text-sm text-slate-500 mt-1">你的步数: {result.pllCase.userSteps} / 最优: {result.pllCase.optimalSteps}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 与高级玩家对比 */}
              {result.comparison && result.comparison.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '900ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      与高级玩家对比
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 text-slate-500 font-medium">阶段</th>
                            <th className="text-right py-2 text-slate-500 font-medium">你的步数</th>
                            <th className="text-right py-2 text-slate-500 font-medium">高级玩家</th>
                            <th className="text-right py-2 text-slate-500 font-medium">提升空间</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.comparison.map((comp: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 font-medium">{comp.stage}</td>
                              <td className="text-right py-2">{comp.userSteps}步</td>
                              <td className="text-right py-2">{comp.advancedSteps}步</td>
                              <td className="text-right py-2 font-semibold text-blue-600">+{comp.improvementPotential}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 优先改进建议 */}
              {result.prioritizedRecommendations && result.prioritizedRecommendations.length > 0 && (
                <Card className="card-cube shadow-lg border-2 border-orange-200 result-card" style={{ animationDelay: '1000ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      📋 本周改进计划
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {result.prioritizedRecommendations.slice(0, 3).map((rec: any, idx: number) => (
                      <div key={idx} className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                            {rec.priority}
                          </span>
                          <span className="font-semibold text-slate-800">{rec.title}</span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          <span className="text-slate-500">当前:</span> {rec.currentStatus} → <span className="text-slate-500">目标:</span> {rec.targetStatus}
                        </div>
                        <div className="text-sm font-medium text-orange-700 mb-2">预计改进: {rec.estimatedImprovement}</div>
                        <div className="text-sm text-slate-600">
                          <div className="font-medium mb-1">行动项:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {rec.actionItems.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-slate-400 mt-2">⏱️ {rec.timeToSeeResults}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* 手指技巧建议 */}
              {result.fingerprintTips && result.fingerprintTips.length > 0 && (
                <Card className="card-cube shadow-lg result-card" style={{ animationDelay: '1100ms' }}>
                  <CardHeader className="border-b border-slate-100 py-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Fingerprint className="w-5 h-5 text-indigo-500" />
                      手指技巧提示
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {result.fingerprintTips.slice(0, 5).map((tip: any, idx: number) => (
                      <div key={idx} className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500 text-white font-medium">{tip.move}</span>
                          <span className="text-sm font-medium text-indigo-700">{tip.finger}</span>
                        </div>
                        <p className="text-sm text-slate-600">{tip.tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 使用示例 - 无结果时显示 */}
          {!result && (
            <Card className="card-cube shadow-lg">
              <CardHeader className="border-b border-slate-100 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  使用示例
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-transparent border border-orange-100">
                    <div className="text-2xl mb-2">1️⃣</div>
                    <p className="text-sm text-slate-600">输入打乱公式</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-transparent border border-blue-100">
                    <div className="text-2xl mb-2">2️⃣</div>
                    <p className="text-sm text-slate-600">输入你的解法</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-transparent border border-purple-100">
                    <div className="text-2xl mb-2">3️⃣</div>
                    <p className="text-sm text-slate-600">AI 分析优化建议</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
