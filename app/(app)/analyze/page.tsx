'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CubeKeyboard } from '@/components/cube/cube-keyboard'
import { CubeNet, ColorLegend } from '@/components/cube/cube-net'
import { CoachPlanCard } from '@/components/cube/coach-plan-card'
import { Sparkles, Zap, Trophy, Target, Box, Eye, EyeOff, MapPin, Clock, TrendingUp, Fingerprint, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { applyScramble, createSolvedCube, unflattenCubeState, type CubeState } from '@/lib/cube/cube-state'

export default function AnalyzePage() {
  const [scramble, setScramble] = useState('R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'')
  const [solution, setSolution] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingOptimal, setGeneratingOptimal] = useState(false)
  const [optimalProgress, setOptimalProgress] = useState(0)
  const [optimalStage, setOptimalStage] = useState('')
  const [result, setResult] = useState<any>(null)
  const [optimalResult, setOptimalResult] = useState<any>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [keyboardTarget, setKeyboardTarget] = useState<'scramble' | 'solution'>('solution')
  const [showCube, setShowCube] = useState(true)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_optimalError, setOptimalError] = useState<string | null>(null)

  const normalizeScrambleInput = (input: string) =>
    input
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => {
        const m = token.match(/^([RLUDFBrludfb])(2|'|2'|'2)?$/)
        if (!m) return ''
        const face = m[1].toUpperCase()
        const suffixRaw = m[2] || ''
        const suffix = suffixRaw.includes('2') ? '2' : suffixRaw.includes("'") ? "'" : ''
        return `${face}${suffix}`
      })
      .filter(Boolean)
      .join(' ')

  const generateOptimal = async () => {
    if (!scramble.trim() || scramble.trim().length < 3) {
      setOptimalError('璇疯緭鍏ヨ嚦灏?涓瓧绗︾殑鎵撲贡鍏紡')
      return
    }

    const normalizedScramble = normalizeScrambleInput(scramble)
    const initialCubeState = normalizedScramble
      ? unflattenCubeState(applyScramble(createSolvedCube(), normalizedScramble))
      : null

    setGeneratingOptimal(true)
    setOptimalProgress(5)
    setOptimalStage('Initializing')
    setOptimalError(null)
    setOptimalResult((prev: any) => ({
      ...(prev || {}),
      scramble: normalizedScramble || scramble.trim(),
      cubeState: initialCubeState,
      optimalSolution: prev?.optimalSolution || '',
      steps: prev?.steps || 0,
      explanations: prev?.explanations || ['Solving CFOP by stages: Cross -> F2L -> OLL -> PLL'],
    }))
    const progressTimer = window.setInterval(() => {
      setOptimalProgress((p) => {
        if (p < 60) return p + 1
        if (p < 85) return p + 0.5
        return p
      })
    }, 1000)
    const stageTimer = window.setInterval(() => {
      setOptimalStage((prev) => {
        if (prev === 'Initializing') return 'Cross'
        if (prev === 'Cross') return 'F2L'
        if (prev === 'F2L') return 'OLL'
        if (prev === 'OLL') return 'PLL'
        return prev
      })
    }, 1800)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 90000)

    try {
      const response = await fetch('/api/cube/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble: scramble.trim() }),
        signal: controller.signal,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setOptimalError(data?.error || 'API request failed')
        if (data) {
          setOptimalResult((prev: any) => ({
            ...(prev || {}),
            ...data,
            cubeState: data.cubeState || prev?.cubeState || initialCubeState,
            explanations: data.explanations || [data.error || 'Solver did not return a verified full solution yet.'],
          }))
        }
        return
      }

      setOptimalProgress(100)
      setOptimalStage('Done')
      setOptimalResult(data)
    } catch (e: any) {
      console.error('Generate optimal failed:', e)
      setOptimalError(e?.message || 'Failed to generate optimal solution')
      setOptimalResult((prev: any) => ({
        ...(prev || {}),
        scramble: normalizedScramble || scramble.trim(),
        cubeState: prev?.cubeState || initialCubeState,
        optimalSolution: prev?.optimalSolution || '',
        steps: prev?.steps || 0,
        explanations: prev?.explanations || ['Optimal solve failed, please retry.'],
      }))
    } finally {
      window.clearInterval(progressTimer)
      window.clearInterval(stageTimer)
      window.clearTimeout(timeoutId)
      window.setTimeout(() => setOptimalProgress(0), 300)
      window.setTimeout(() => setOptimalStage(''), 300)
      setGeneratingOptimal(false)
    }
  }

  const handleAnalyze = async () => {
    if (!solution.trim()) {
      alert('Please enter your solution first.')
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
      if (!response.ok) {
        alert(data?.error || 'Analyze request failed. Please retry.')
        return
      }
      setResult(data)
    } catch (e) {
      console.error(e)
      alert('Analyze failed. Please retry.')
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

    // 妫€鏌ユ槸鍚︽槸淇グ绗︼紙' 鎴?2锛?
    if (value === "'" || value === '2') {
      // 淇グ绗︼細鍘绘帀鏈熬绌烘牸锛屽姞涓婁慨楗扮锛屽啀鍔犵┖鏍?
      setValue(currentValue.trimEnd() + value + ' ')
    } else if (value === ' ') {
      // 绌烘牸鐩存帴娣诲姞
      setValue(currentValue + value)
    } else {
      // 鏅€氬瓧姣嶏細鐩存帴鍔犲瓧姣嶅悗鑷姩鍔犵┖鏍?
      setValue(currentValue + value + ' ')
    }
  }

  const handleBackspace = () => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution

    // 濡傛灉鏈熬鏄┖鏍硷紝鍒犻櫎绌烘牸鍜屽墠闈㈢殑瀛楁瘝/淇グ绗?
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
    if (score >= 9) return { label: '浼樼', emoji: '馃弳' }
    if (score >= 7) return { label: '鑹ソ', emoji: '馃憤' }
    if (score >= 5) return { label: '涓瓑', emoji: '馃挭' }
    if (score >= 3) return { label: '闇€鏀硅繘', emoji: '馃搱' }
    return { label: '鍔犳补', emoji: '馃幆' }
  }

  const getEfficiencyInfo = getEfficiencyLabel(0)

  // 鑾峰彇榄旀柟鐘舵€佺敤浜庡彲瑙嗗寲
  const cubeStateRaw = optimalResult?.cubeState
  const cubeState: CubeState | null = cubeStateRaw
    ? (typeof cubeStateRaw === 'string'
      ? unflattenCubeState(cubeStateRaw)
      : cubeStateRaw)
    : null

  return (
    <div className="min-h-screen py-4 sm:py-6">
      {/* 鑳屾櫙瑁呴グ */}
      <div className="px-4 relative z-10">
        <div className="max-w-md sm:max-w-lg mx-auto lg:max-w-none lg:mx-0 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
          {/* Header */}
          <div className="lg:col-span-2 text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900">
                瑙ｆ硶鍒嗘瀽
              </h1>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              杈撳叆鎵撲贡鍏紡鍜屼綘鐨勮В娉曪紝AI甯綘鎵惧嚭浼樺寲绌洪棿
            </p>
          </div>

          {/* 宸︿晶锛氳緭鍏ュ尯鍩?*/}
          <div className="w-full space-y-4">
            {/* 杈撳叆鍖哄煙 + 閿洏鍚堜綋 */}
            <Card className="card-cube border border-slate-200 shadow-sm overflow-hidden">
              {/* 杈撳叆妗嗗尯鍩?*/}
              <div className="border-b border-slate-200 bg-slate-50/50 p-4 space-y-3">
                {/* 鎵撲贡鍏紡 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      馃幉 鎵撲贡鍏紡
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
                        褰撳墠杈撳叆
                      </button>
                      <button
                        onClick={generateOptimal}
                        className="text-[10px] px-2 py-0.5 rounded transition-colors bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 disabled:opacity-50"
                        disabled={generatingOptimal || !scramble.trim()}
                      >
                        {generatingOptimal ? 'Generating...' : 'Generate Cube Net'}
                      </button>
                      {cubeState && (
                        <>
                          <button
                            onClick={() => setShowCube(!showCube)}
                            className="text-[10px] px-2 py-0.5 rounded transition-colors bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1"
                          >
                            {showCube ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {showCube ? 'Hide Cube Net' : 'Show Cube Net'}
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
                      placeholder="鐐瑰嚮涓嬫柟鎸夐挳杈撳叆..."
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
                        鉁?
                      </button>
                    )}
                  </div>
                  {generatingOptimal && (
                    <div className="mt-2">
                      <Progress value={optimalProgress} className="h-2" />
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{optimalStage || 'Solving'}</span>
                        <span>{optimalProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 瑙ｆ硶 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      鉁?浣犵殑瑙ｆ硶
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
                      褰撳墠杈撳叆
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={solution}
                      readOnly
                      onClick={() => setKeyboardTarget('solution')}
                      placeholder="鐐瑰嚮涓嬫柟鎸夐挳杈撳叆..."
                      rows={3}
                      className="font-cube text-sm resize-none pr-8 cursor-pointer"
                    />
                    {solution && (
                      <button
                        onClick={() => setSolution('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        鉁?
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 铏氭嫙閿洏 */}
              <div className="p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    鐐瑰嚮涓嬫柟鎸夐挳杈撳叆鍒?<span className="font-semibold text-orange-500">
                      {keyboardTarget === 'scramble' ? '馃幉 鎵撲贡鍏紡' : '鉁?瑙ｆ硶'}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className="lg:hidden text-slate-500 px-2 h-7"
                  >
                    {showKeyboard ? '闅愯棌' : '閿洏'}
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

            {/* 鍒嗘瀽鎸夐挳 */}
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
                  鍒嗘瀽涓?..
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  寮€濮嬪垎鏋?
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
                      鍒嗘瀽缁撴灉
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">浣犵殑姝ユ暟</p>
                        <p className="text-2xl font-bold text-blue-600">{result.summary.steps}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">Optimal steps</p>
                        <p className="text-2xl font-bold text-green-600">{result.summary.optimalSteps}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">鏁堢巼璇勫垎</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className={`text-2xl font-bold bg-gradient-to-r ${getEfficiencyColor(result.summary.efficiency)} bg-clip-text text-transparent`}>
                            {result.summary.efficiency.toFixed(1)}
                          </p>
                          <span className="text-lg">{getEfficiencyInfo.emoji}</span>
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-[10px] text-slate-500 mb-0.5">棰勪及鐢ㄦ椂</p>
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
                        浼樺寲寤鸿
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
                              鍙妭鐪?{opt.savings} 姝?
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">鍘?</span>
                              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-cube text-[10px] text-slate-700">
                                {opt.from}
                              </code>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">浼樺寲:</span>
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
                        璇嗗埆鐨勫叕寮?
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
                        馃摎 鏂板叕寮忔帹鑽?
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
                        鍙傝€冩渶浼樿В
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <code className="block bg-slate-100 p-3 rounded-lg text-xs break-all font-cube border border-slate-200 text-slate-800">
                        {result.summary.optimalSolution}
                      </code>
                    </CardContent>
                  </Card>
                )}

                {/* ========== 澧炲己鍒嗘瀽缁撴灉 ========== */}

                {/* 姝ラ瀹氫綅鍒嗘瀽 */}
                {result.stepOptimizations && result.stepOptimizations.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '700ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        闂瀹氫綅鍒嗘瀽
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2">
                      {result.stepOptimizations.map((opt: any, idx: number) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                              Step {opt.stepRange[0]}-{opt.stepRange[1]}
                            </span>
                            <span className="text-xs font-semibold text-red-700">{opt.problemType}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                            <div>
                              <span className="text-slate-500">鍘?</span>
                              <code className="ml-1 bg-slate-100 px-1 rounded">{opt.originalMoves}</code>
                            </div>
                            <div>
                              <span className="text-slate-500">浼樺寲:</span>
                              <code className="ml-1 bg-green-100 text-green-700 px-1 rounded">{opt.optimizedMoves}</code>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">{opt.reason}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 鏃堕棿鍒嗚В */}
                {result.timeBreakdown && result.timeBreakdown.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '800ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        鏃堕棿鍒嗚В
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

                {/* F2L妲戒綅鍒嗘瀽 */}
                {result.f2lSlots && result.f2lSlots.slots && result.f2lSlots.slots.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '900ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        馃幉 F2L 妲戒綅鍒嗘瀽
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
                              <div className="text-xs font-medium mb-1">{slot.slotNumber}鍙锋Ы</div>
                              <div className="text-lg font-bold">{slot.steps} steps</div>
                              {slot.usedFormula && (
                                <div className="text-[10px] text-slate-600">{slot.usedFormula}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {result.f2lSlots.orderSuggestion && (
                        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded">
                          馃挕 {result.f2lSlots.orderSuggestion}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 椤跺眰璇嗗埆 (OLL/PLL) */}
                {(result.ollCase || result.pllCase) && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1000ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        馃敮 椤跺眰璇嗗埆
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-3">
                      {result.ollCase && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">OLL 鎯呭喌</div>
                          <div className="font-medium text-sm">{result.ollCase.caseName}</div>
                          <div className="text-xs text-slate-500">浣犵殑姝ユ暟: {result.ollCase.userSteps} / 鏈€浼? {result.ollCase.optimalSteps}</div>
                        </div>
                      )}
                      {result.pllCase && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">PLL 鎯呭喌</div>
                          <div className="font-medium text-sm">{result.pllCase.caseName}</div>
                          <div className="text-xs text-slate-500">浣犵殑姝ユ暟: {result.pllCase.userSteps} / 鏈€浼? {result.pllCase.optimalSteps}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 涓庨珮绾х帺瀹跺姣?*/}
                {result.comparison && result.comparison.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1100ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        涓庨珮绾х帺瀹跺姣?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-1 text-slate-500">闃舵</th>
                            <th className="text-right py-1 text-slate-500">浣犵殑姝ユ暟</th>
                            <th className="text-right py-1 text-slate-500">楂樼骇鐜╁</th>
                            <th className="text-right py-1 text-slate-500">鎻愬崌绌洪棿</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.comparison.map((comp: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-1">{comp.stage}</td>
                              <td className="text-right">{comp.userSteps} steps</td>
                              <td className="text-right">{comp.advancedSteps} steps</td>
                              <td className="text-right font-medium text-blue-600">+{comp.improvementPotential}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}

                {/* 浼樺厛鏀硅繘寤鸿 */}
                {result.prioritizedRecommendations && result.prioritizedRecommendations.length > 0 && (
                  <Card className="card-cube border border-slate-200 shadow-sm result-card" style={{ animationDelay: '1200ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        馃搵 鏈懆鏀硅繘璁″垝
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
                            <span className="text-slate-500">褰撳墠:</span> {rec.currentStatus} 鈫?<span className="text-slate-500">鐩爣:</span> {rec.targetStatus}
                          </div>
                          <div className="text-xs font-medium text-orange-700 mb-1">棰勮鏀硅繘: {rec.estimatedImprovement}</div>
                          <div className="text-xs text-slate-500">
                            <div className="font-medium mb-1">琛屽姩椤?</div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {rec.actionItems.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">鈴憋笍 {rec.timeToSeeResults}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 鎵嬫寚鎶€宸у缓璁?*/}
                <CoachPlanCard result={result} />

                {result.fingerprintTips && result.fingerprintTips.length > 0 && (
                  <Card className="card-cube shadow-sm result-card" style={{ animationDelay: '1300ms' }}>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-indigo-500" />
                        鎵嬫寚鎶€宸ф彁绀?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 space-y-2">
                      {result.fingerprintTips.slice(0, 5).map((tip: any, idx: number) => (
                        <div key={idx} className="bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                          <div className="text-xs font-medium mb-1">{tip.moveSequence}</div>
                          <div className="text-xs text-slate-600">{tip.description}</div>
                          <div className="text-[10px] text-indigo-600 mt-1">
                            Difficulty: {tip.difficulty === 'easy' ? 'Easy' : tip.difficulty === 'medium' ? 'Medium' : 'Hard'}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Example Section - 鏈垎鏋愭椂鏄剧ず */}
            {!result && (
              <Card className="card-cube shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    浣跨敤绀轰緥
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-transparent border border-orange-100">
                      <div className="text-xl mb-1">1锔忊儯</div>
                      <p className="text-xs text-slate-600">杈撳叆浣犱娇鐢ㄧ殑鎵撲贡鍏紡锛屾垨浣跨敤榛樿绀轰緥</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-transparent border border-blue-100">
                      <div className="text-xl mb-1">2锔忊儯</div>
                      <p className="text-xs text-slate-600">Enter your solve formula in the keyboard area.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-transparent border border-purple-100">
                      <div className="text-xl mb-1">3锔忊儯</div>
                      <p className="text-xs text-slate-600">鐐瑰嚮"寮€濮嬪垎鏋?鏌ョ湅AI鍒嗘瀽缁撴灉</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 鍙充晶锛氶瓟鏂瑰睍寮€鍥?+ 鏈€浼樿В锛堟闈㈢锛?*/}
          <div className="hidden lg:block w-[320px] space-y-4 lg:sticky lg:top-6">
            {/* 榄旀柟灞曞紑鍥?*/}
            {showCube && cubeState && (
              <Card className="card-cube border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Box className="w-4 h-4 text-purple-500" />
                    榄旀柟灞曞紑鍥?
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

            {/* 鏈€浼樿В鍗＄墖 */}
            {(optimalResult || generatingOptimal) && (
              <Card className="card-cube border border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-green-500" />
                    鏈€浼樿В
                    {generatingOptimal && <span className="text-xs text-slate-400">鐢熸垚涓?..</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  {/* 姝ユ暟 */}
                  <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-[10px] text-slate-500">Optimal steps</p>
                    <p className="text-2xl font-bold text-green-600">{optimalResult?.steps || '-'}</p>
                  </div>

                  {/* 鏈€浼樿В鍏紡 */}
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">瑙ｆ硶鍏紡:</p>
                    <code className="block bg-slate-100 p-2 rounded text-xs break-all font-cube border border-slate-200 text-slate-800">
                      {optimalResult?.optimalSolution || `Solving... (${optimalStage || 'CFOP'})`}
                    </code>
                  </div>

                  {optimalResult?.cfop && (
                    <div className="text-[10px] text-slate-600 space-y-1">
                      <div><span className="text-slate-500">Cross:</span> {optimalResult.cfop?.cross?.moves || '-'}</div>
                      <div><span className="text-slate-500">F2L:</span> {optimalResult.cfop?.f2l?.moves || '-'}</div>
                      <div><span className="text-slate-500">OLL:</span> {optimalResult.cfop?.oll?.moves || '-'}</div>
                      <div><span className="text-slate-500">PLL:</span> {optimalResult.cfop?.pll?.moves || '-'}</div>
                    </div>
                  )}

                  {/* 璇嗗埆鐨勫叕寮?*/}
                  {optimalResult.formulas && optimalResult.formulas.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">鍖呭惈鍏紡:</p>
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

                  {/* 瑙ｈ */}
                  {optimalResult.explanations && optimalResult.explanations.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">瑙ｈ:</p>
                      <ul className="text-[10px] text-slate-600 space-y-0.5">
                        {optimalResult.explanations.map((exp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-500">*</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 閲嶆柊鐢熸垚鎸夐挳 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateOptimal}
                    disabled={generatingOptimal}
                    className="w-full text-xs"
                  >
                    {generatingOptimal ? '鐢熸垚涓?..' : '鍒锋柊鏈€浼樿В'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 鎻愮ず鍗＄墖 */}
            {!cubeState && (
              <Card className="card-cube shadow-sm">
                <CardContent className="p-4 text-center">
                  <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    杈撳叆鎵撲贡鍏紡鍚庯紝杩欓噷浼氭樉绀洪瓟鏂瑰睍寮€鍥惧拰鏈€浼樿В
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

