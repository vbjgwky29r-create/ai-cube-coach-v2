'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CubeKeyboard } from '@/components/cube/cube-keyboard'
import { CubeNet, ColorLegend } from '@/components/cube/cube-net'
import { Sparkles, Trophy, Target, Box, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { applyScramble, createSolvedCube, unflattenCubeState, type CubeState } from '@/lib/cube/cube-state'

type AnyObj = Record<string, any>
type Stage = 'cross' | 'f2l' | 'oll' | 'pll'

type StageView = {
  moves: string
  steps: number
  note: string
  slots?: Array<{ slot: string; moves: string; solved?: boolean }>
}

const STAGE_ORDER: Stage[] = ['cross', 'f2l', 'oll', 'pll']
const STAGE_LABEL: Record<Stage, string> = {
  cross: 'Cross',
  f2l: 'F2L',
  oll: 'OLL',
  pll: 'PLL',
}

function createEmptyStageViews(): Record<Stage, StageView> {
  return {
    cross: { moves: '', steps: 0, note: '' },
    f2l: { moves: '', steps: 0, note: '', slots: [] },
    oll: { moves: '', steps: 0, note: '' },
    pll: { moves: '', steps: 0, note: '' },
  }
}

function normalizeF2LSlots(
  slotsRaw: unknown,
  slotHistoryRaw: unknown
): Array<{ slot: string; moves: string; solved?: boolean }> {
  const history = Array.isArray(slotHistoryRaw) ? (slotHistoryRaw as AnyObj[]) : []
  if (history.length > 0) {
    return history
      .map((item) => {
        const slot = String(item?.slot || '').toUpperCase()
        if (!slot) return null
        return {
          slot,
          moves: String(item?.solution || item?.moves || '').trim(),
          solved: true,
        }
      })
      .filter(Boolean) as Array<{ slot: string; moves: string; solved?: boolean }>
  }

  const arr = Array.isArray(slotsRaw) ? (slotsRaw as AnyObj[]) : []
  return arr
    .map((item) => {
      const slot = String(item?.slot || '').toUpperCase()
      if (!slot) return null
      return {
        slot,
        moves: String(item?.moves || '').trim(),
        solved: Boolean(item?.solved),
      }
    })
    .filter(Boolean) as Array<{ slot: string; moves: string; solved?: boolean }>
}

export default function AnalyzePage() {
  const [scramble, setScramble] = useState("R U R' U' R' F R2 U' R' U' R U R' F'")
  const [solution, setSolution] = useState('')

  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnyObj | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const [solvingSteps, setSolvingSteps] = useState(false)
  const [stageResult, setStageResult] = useState<AnyObj | null>(null)
  const [stageViews, setStageViews] = useState<Record<Stage, StageView>>(createEmptyStageViews())
  const [stageError, setStageError] = useState<string | null>(null)

  const [generatingOptimal, setGeneratingOptimal] = useState(false)
  const [optimalProgress, setOptimalProgress] = useState(0)
  const [optimalStage, setOptimalStage] = useState('')
  const [optimalResult, setOptimalResult] = useState<AnyObj | null>(null)
  const [optimalError, setOptimalError] = useState<string | null>(null)

  const [ocrLoading, setOcrLoading] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [keyboardTarget, setKeyboardTarget] = useState<'scramble' | 'solution'>('solution')
  const [showCube, setShowCube] = useState(true)

  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const parseScrambleInput = (input: string) => {
    const cleaned = input
      .replace(/[’‘`´]/g, "'")
      .replace(/[\u00A0\u3000]/g, ' ')
      .trim()
    const tokens = cleaned.split(/\s+/).filter(Boolean)
    const invalidTokens: string[] = []
    const normalizedTokens: string[] = []
    for (const token of tokens) {
      const m = token.match(/^([RLUDFBrludfb])(2|'|2'|'2)?$/)
      if (!m) {
        invalidTokens.push(token)
        continue
      }
      const face = m[1].toUpperCase()
      const suffixRaw = m[2] || ''
      const suffix = suffixRaw.includes('2') ? '2' : suffixRaw.includes("'") ? "'" : ''
      normalizedTokens.push(`${face}${suffix}`)
    }
    return { normalized: normalizedTokens.join(' '), invalidTokens, inputCount: tokens.length }
  }

  const updateStageViewsFromResult = (data: AnyObj) => {
    const next = createEmptyStageViews()
    for (const stage of STAGE_ORDER) {
      const raw = data?.solution?.[stage] || {}
      const moves = String(raw?.moves || '').trim()
      const stepsRaw = Number(raw?.steps || 0)
      const steps = Number.isFinite(stepsRaw) ? stepsRaw : 0
      const note = moves
        ? ''
        : stage === 'pll'
          ? 'PLL Skip（已在 OLL 后完成）'
          : '该阶段已完成（0 步）'
      next[stage] = {
        moves,
        steps,
        note,
        slots: stage === 'f2l' ? normalizeF2LSlots(raw?.slots, raw?.slotHistory) : undefined,
      }
    }
    setStageViews(next)
  }

  const ensureStageResult = async (normalized: string) => {
    if (stageResult?.scramble === normalized && stageResult?.solution) return stageResult
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort('cfop_stage_timeout'), 180000)
    try {
      const response = await fetch('/api/cube/cfop-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble: normalized }),
        signal: controller.signal,
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || '分步求解失败')
      }
      setStageResult(data)
      return data
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  const handleSolveSteps = async () => {
    const { normalized, invalidTokens, inputCount } = parseScrambleInput(scramble.trim())
    if (inputCount === 0 || !normalized) {
      setStageError('请先输入打乱公式。')
      return
    }
    if (invalidTokens.length > 0) {
      setStageError(`打乱公式包含非法符号: ${invalidTokens.join(', ')}`)
      return
    }
    setStageError(null)
    setSolvingSteps(true)
    try {
      const data = await ensureStageResult(normalized)
      updateStageViewsFromResult(data)
    } catch (e: any) {
      setStageError(String(e?.message || '分步求解失败'))
    } finally {
      setSolvingSteps(false)
    }
  }

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || '')
        resolve(result.includes(',') ? result.split(',')[1] : result)
      }
      reader.onerror = () => reject(new Error('图片读取失败'))
      reader.readAsDataURL(blob)
    })

  const compressImage = async (file: File): Promise<Blob> => {
    if (!file.type.startsWith('image/')) return file
    const objectUrl = URL.createObjectURL(file)
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('图片解码失败'))
        img.src = objectUrl
      })
      const maxSide = 1600
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return file
      ctx.drawImage(image, 0, 0, width, height)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
      return blob || file
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }

  const generateNetOnly = () => {
    const { normalized, invalidTokens, inputCount } = parseScrambleInput(scramble.trim())
    if (inputCount === 0 || !normalized) {
      setOptimalError('请先输入打乱公式。')
      return
    }
    if (invalidTokens.length > 0) {
      setOptimalError(`打乱公式包含非法符号: ${invalidTokens.join(', ')}`)
      return
    }
    try {
      const state = unflattenCubeState(applyScramble(createSolvedCube(), normalized))
      setOptimalError(null)
      setOptimalResult({
        scramble: normalized,
        cubeState: state,
        optimalSolution: '',
        steps: 0,
        explanations: ['已生成魔方展开图，请先核对打乱是否正确。'],
      })
    } catch {
      setOptimalError('打乱公式无效，无法生成展开图。')
    }
  }

  const requestOptimal = async (normalized: string, signal: AbortSignal) => {
    let payload: AnyObj | null = null
    for (let i = 0; i < 2; i++) {
      try {
        const response = await fetch('/api/cube/optimal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scramble: normalized }),
          signal,
        })
        payload = await response.json().catch(() => null)
        if (response.ok) return { ok: true, data: payload }
        if (response.status >= 500 && i === 0 && !signal.aborted) continue
        return { ok: false, data: payload }
      } catch (error) {
        if (i === 0 && !signal.aborted) continue
        throw error
      }
    }
    return { ok: false, data: payload }
  }

  const generateOptimal = async () => {
    const { normalized, invalidTokens, inputCount } = parseScrambleInput(scramble.trim())
    if (inputCount === 0 || !normalized) {
      setOptimalError('请先输入打乱公式。')
      return
    }
    if (invalidTokens.length > 0) {
      setOptimalError(`打乱公式包含非法符号: ${invalidTokens.join(', ')}`)
      return
    }

    let seedCubeState: CubeState | null = null
    try {
      seedCubeState = unflattenCubeState(applyScramble(createSolvedCube(), normalized))
    } catch {
      seedCubeState = null
    }

    setGeneratingOptimal(true)
    setOptimalProgress(3)
    setOptimalStage('初始化')
    setOptimalError(null)
    setOptimalResult((prev) => ({
      ...(prev || {}),
      scramble: normalized,
      cubeState: seedCubeState,
      optimalSolution: prev?.optimalSolution || '',
      steps: prev?.steps || 0,
      explanations: prev?.explanations || ['按阶段求解: Cross -> F2L -> OLL -> PLL'],
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
        if (prev === '初始化') return 'Cross'
        if (prev === 'Cross') return 'F2L'
        if (prev === 'F2L') return 'OLL'
        if (prev === 'OLL') return 'PLL'
        return prev
      })
    }, 2000)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort('optimal_timeout'), 600000)

    try {
      const { ok, data } = await requestOptimal(normalized, controller.signal)
      if (!ok) {
        setOptimalError(data?.error || '推荐解生成失败')
        return
      }
      setOptimalProgress(100)
      setOptimalStage('完成')
      setOptimalResult(data)
    } catch (e: any) {
      const msg = String(e?.message || '')
      const isAbort = controller.signal.aborted || e?.name === 'AbortError'
      setOptimalError(isAbort ? '生成超时，请重试。' : msg || '推荐解生成失败')
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
      alert('请先输入你的还原公式。')
      return
    }
    setAnalyzing(true)
    setAnalyzeError(null)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort('analyze_timeout'), 120000)
    try {
      const response = await fetch('/api/cube/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble, solution }),
        signal: controller.signal,
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setAnalyzeError(data?.error || '分析请求失败')
        return
      }
      setResult(data)
    } catch (e: any) {
      const isAbort = controller.signal.aborted || e?.name === 'AbortError'
      setAnalyzeError(isAbort ? '分析超时，请重试。' : '分析失败，请重试。')
    } finally {
      window.clearTimeout(timeoutId)
      setAnalyzing(false)
    }
  }

  const handlePickImage = () => imageInputRef.current?.click()

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setOcrLoading(true)
      const compressed = await compressImage(file)
      const base64 = await blobToBase64(compressed)
      const response = await fetch('/api/ocr/cube-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mode: 'simple' }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'OCR 请求失败')
      if (data.scramble) setScramble(data.scramble)
      if (data.solution) setSolution(data.solution)
      if (!data.scramble && !data.solution) {
        alert('OCR 未识别到打乱或还原公式，请上传更清晰图片。')
      }
    } catch (err: any) {
      alert(`OCR 失败: ${String(err?.message || '未知错误')}`)
    } finally {
      setOcrLoading(false)
      e.target.value = ''
    }
  }

  const handleKeyboardInput = (value: string) => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution
    if (value === "'" || value === '2') setValue(currentValue.trimEnd() + value + ' ')
    else if (value === ' ') setValue(currentValue + value)
    else setValue(currentValue + value + ' ')
  }

  const handleBackspace = () => {
    const setValue = keyboardTarget === 'scramble' ? setScramble : setSolution
    const currentValue = keyboardTarget === 'scramble' ? scramble : solution
    const trimmed = currentValue.trimEnd()
    if (trimmed.length > 0) setValue(trimmed.slice(0, -1) + ' ')
    else setValue('')
  }

  const handleClear = () => {
    if (keyboardTarget === 'scramble') {
      setScramble('')
      setOptimalResult(null)
      setStageResult(null)
      setStageViews(createEmptyStageViews())
      setStageError(null)
    } else {
      setSolution('')
    }
  }

  const cubeStateRaw = optimalResult?.cubeState
  const cubeState: CubeState | null = cubeStateRaw
    ? (typeof cubeStateRaw === 'string' ? unflattenCubeState(cubeStateRaw) : cubeStateRaw)
    : null

  const stageSummaryFormula = STAGE_ORDER.map((s) => stageViews[s].moves).filter(Boolean).join(' ')
  const stageSummarySteps = STAGE_ORDER.reduce((sum, s) => sum + (stageViews[s].steps || 0), 0)
  const hasStageResult = STAGE_ORDER.some((s) => stageViews[s].moves || stageViews[s].note)
  const summary = result?.summary || null
  const topRecommendations = Array.isArray(result?.prioritizedRecommendations)
    ? result.prioritizedRecommendations.slice(0, 3)
    : []
  const resultWarning = typeof result?.warning === 'string' ? result.warning : ''
  const resultDegraded = Boolean(result?.degraded)

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="px-4 max-w-6xl mx-auto grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-slate-600" />
                魔方分析
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">打乱公式</label>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePickImage} className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={ocrLoading}>
                      {ocrLoading ? '识别中...' : '上传图片'}
                    </button>
                    <button onClick={() => setKeyboardTarget('scramble')} className={cn('text-[10px] px-2 py-0.5 rounded', keyboardTarget === 'scramble' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                      键盘
                    </button>
                    {cubeState && (
                      <button onClick={() => setShowCube(!showCube)} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1">
                        {showCube ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showCube ? '隐藏展开图' : '显示展开图'}
                      </button>
                    )}
                  </div>
                </div>
                <Input value={scramble} readOnly onClick={() => setKeyboardTarget('scramble')} placeholder="请输入打乱公式" className="font-cube text-sm cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={generateNetOnly} className="text-[11px] px-2 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50" disabled={!scramble.trim()}>
                  1) 生成展开图（先核对打乱）
                </button>
                <button onClick={handleSolveSteps} className="text-[11px] px-2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={solvingSteps || !scramble.trim()}>
                  {solvingSteps ? '2) 分步求解中...' : '2) 生成完整分步解法'}
                </button>
              </div>
              {stageError && <p className="text-[11px] text-red-600">{stageError}</p>}

              {hasStageResult && (
                <div className="space-y-2">
                  {STAGE_ORDER.map((stage) => {
                    const view = stageViews[stage]
                    return (
                      <div key={stage} className="text-[11px] bg-slate-50 border border-slate-200 rounded p-2">
                        <div className="text-slate-600 mb-1 font-semibold">{STAGE_LABEL[stage]} 阶段</div>
                        <div className="text-slate-500 mb-1">公式:</div>
                        <code className="font-cube text-slate-800 break-all">{view.moves || view.note || '暂无公式'}</code>
                        {stage === 'f2l' && (
                          <div className="mt-2 space-y-1">
                            <div className="text-slate-500">F2L 分槽（按实际求解顺序）:</div>
                            {(view.slots || []).map((slot, idx) => (
                              <div key={`${slot.slot}-${idx}`} className="text-slate-700">
                                {slot.slot}: <span className="font-cube">{slot.moves || '该槽位已完成（0 步）'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div className="text-[11px] bg-green-50 border border-green-200 rounded p-2">
                    <div className="font-semibold text-green-700 mb-1">分步汇总（Cross + F2L + OLL + PLL）</div>
                    <div className="mb-1 text-slate-700">总步数: {stageSummarySteps}</div>
                    <code className="font-cube text-slate-800 break-all">{stageSummaryFormula || '无汇总公式'}</code>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">你的还原公式</label>
                  <button onClick={() => setKeyboardTarget('solution')} className={cn('text-[10px] px-2 py-0.5 rounded', keyboardTarget === 'solution' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                    键盘
                  </button>
                </div>
                <Textarea value={solution} readOnly onClick={() => setKeyboardTarget('solution')} placeholder="请输入你的还原公式" rows={3} className="font-cube text-sm resize-none cursor-pointer" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">当前输入目标: <span className="font-semibold text-orange-500">{keyboardTarget === 'scramble' ? '打乱公式' : '还原公式'}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => setShowKeyboard(!showKeyboard)} className="lg:hidden text-slate-500 px-2 h-7">
                    {showKeyboard ? '隐藏' : '显示'}
                  </Button>
                </div>
                {showKeyboard && (
                  <CubeKeyboard
                    onInput={handleKeyboardInput}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                    onSpace={() => handleKeyboardInput(' ')}
                    value={keyboardTarget === 'scramble' ? scramble : solution}
                  />
                )}
              </div>

              <Button onClick={handleAnalyze} disabled={analyzing || !solution.trim()} className={cn('w-full py-5 text-base font-semibold bg-slate-900 text-white hover:bg-slate-800', analyzing && 'animate-pulse')}>
                {analyzing ? '分析中...' : '开始分析'}
              </Button>
            </CardContent>
          </Card>

          {(result || analyzeError) && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  分析结果
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                {analyzeError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3">{analyzeError}</div>}
                {!analyzeError && (
                  <div className="space-y-3">
                    {resultWarning && (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                        {resultWarning}
                      </div>
                    )}
                    {resultDegraded && (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                        参考解未通过验证，本次结果按降级模式展示，请重试同一打乱或更换打乱再分析。
                      </div>
                    )}

                    {summary && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="text-[10px] text-slate-500">你的步数</p>
                          <p className="text-sm font-semibold text-slate-800">{summary.userSteps ?? '-'}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="text-[10px] text-slate-500">参考步数</p>
                          <p className="text-sm font-semibold text-slate-800">{summary.optimalSteps ?? '-'}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="text-[10px] text-slate-500">效率</p>
                          <p className="text-sm font-semibold text-slate-800">{summary.efficiency ?? '-'}%</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded p-2">
                          <p className="text-[10px] text-slate-500">等级</p>
                          <p className="text-sm font-semibold text-slate-800">{String(summary.level || '-')}</p>
                        </div>
                      </div>
                    )}

                    {topRecommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700">训练建议（Top 3）</p>
                        {topRecommendations.map((r: AnyObj, idx: number) => (
                          <div key={`${r.title || 'rec'}-${idx}`} className="bg-slate-50 border border-slate-200 rounded p-2">
                            <p className="text-xs font-semibold text-slate-800">{idx + 1}. {r.title || '建议'}</p>
                            <p className="text-[11px] text-slate-600">{r.currentStatus || r.estimatedImprovement || ''}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 h-fit">
          {showCube && cubeState && (
            <Card className="border border-slate-200 shadow-sm">
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

          {(generatingOptimal || !!optimalResult?.optimalSolution) && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-green-500" />
                  推荐解 (CFOP)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-[10px] text-slate-500">步数</p>
                  <p className="text-2xl font-bold text-green-600">{optimalResult?.steps || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">公式:</p>
                  <code className="block bg-slate-100 p-2 rounded text-xs break-all font-cube border border-slate-200 text-slate-800">
                    {optimalResult?.optimalSolution || (generatingOptimal ? `求解中... (${optimalStage || 'CFOP'})` : '尚未生成推荐解。')}
                  </code>
                </div>
                {optimalError && <p className="text-xs text-red-600">{optimalError}</p>}
                <Button variant="outline" size="sm" onClick={generateOptimal} disabled={generatingOptimal} className="w-full text-xs">
                  {generatingOptimal ? '生成中...' : '重新生成推荐解'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
    </div>
  )
}
