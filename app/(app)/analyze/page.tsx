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

export default function AnalyzePage() {
  const [scramble, setScramble] = useState("R U R' U' R' F R2 U' R' U' R U R' F'")
  const [solution, setSolution] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingOptimal, setGeneratingOptimal] = useState(false)
  const [optimalProgress, setOptimalProgress] = useState(0)
  const [optimalStage, setOptimalStage] = useState('')
  const [result, setResult] = useState<AnyObj | null>(null)
  const [optimalResult, setOptimalResult] = useState<AnyObj | null>(null)
  const [optimalError, setOptimalError] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [keyboardTarget, setKeyboardTarget] = useState<'scramble' | 'solution'>('solution')
  const [showCube, setShowCube] = useState(true)

  const [stageResult, setStageResult] = useState<AnyObj | null>(null)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [stageLoading, setStageLoading] = useState<Stage | null>(null)
  const [stageError, setStageError] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement | null>(null)

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

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || '')
        resolve(result.includes(',') ? result.split(',')[1] : result)
      }
      reader.onerror = () => reject(new Error('failed_to_read_image'))
      reader.readAsDataURL(blob)
    })

  const compressImage = async (file: File): Promise<Blob> => {
    if (!file.type.startsWith('image/')) return file
    const objectUrl = URL.createObjectURL(file)
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('failed_to_decode_image'))
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
        throw new Error(data?.error || 'CFOP stage solve failed')
      }
      setStageResult(data)
      return data
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  const handleStageSolve = async (stage: Stage) => {
    const normalized = normalizeScrambleInput(scramble.trim())
    if (!normalized) {
      setStageError('Please input scramble first.')
      return
    }
    setSelectedStage(stage)
    setStageError(null)
    setStageLoading(stage)
    try {
      const data = await ensureStageResult(normalized)
      const moves = data?.solution?.[stage]?.moves
      if (!moves || !String(moves).trim()) {
        setStageError(stage === 'pll' ? 'PLL Skip' : `${stage.toUpperCase()} has no moves`)
      }
    } catch (e: any) {
      setStageError(String(e?.message || 'Stage solve failed'))
    } finally {
      setStageLoading(null)
    }
  }

  const generateNetOnly = () => {
    const trimmed = scramble.trim()
    if (!trimmed || trimmed.length < 3) {
      setOptimalError('Please input scramble first.')
      return
    }
    const normalized = normalizeScrambleInput(trimmed)
    try {
      const state = unflattenCubeState(applyScramble(createSolvedCube(), normalized))
      setOptimalError(null)
      setOptimalResult({
        scramble: normalized,
        cubeState: state,
        optimalSolution: '',
        steps: 0,
        explanations: ['Cube net generated.'],
      })
    } catch {
      setOptimalError('Invalid scramble, cannot generate cube net.')
    }
  }

  const generateOptimal = async () => {
    const trimmed = scramble.trim()
    if (!trimmed || trimmed.length < 3) {
      setOptimalError('Please input scramble first.')
      return
    }

    const normalized = normalizeScrambleInput(trimmed)

    let seedCubeState: CubeState | null = null
    try {
      seedCubeState = unflattenCubeState(applyScramble(createSolvedCube(), normalized))
    } catch {
      seedCubeState = null
    }

    setGeneratingOptimal(true)
    setOptimalProgress(3)
    setOptimalStage('Initializing')
    setOptimalError(null)
    setOptimalResult((prev) => ({
      ...(prev || {}),
      scramble: normalized,
      cubeState: seedCubeState,
      optimalSolution: prev?.optimalSolution || '',
      steps: prev?.steps || 0,
      explanations: prev?.explanations || ['Solving by stages: Cross -> F2L -> OLL -> PLL'],
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
    }, 2000)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort('optimal_timeout'), 600000)

    try {
      const { ok, data } = await requestOptimal(normalized, controller.signal)
      if (!ok) {
        setOptimalError(data?.error || 'Generate optimal failed')
        if (data) {
          setOptimalResult((prev) => ({
            ...(prev || {}),
            ...data,
            cubeState: data.cubeState || prev?.cubeState || seedCubeState,
            explanations: data.explanations || [data.error || 'No verified complete solution yet.'],
          }))
        }
        return
      }

      setOptimalProgress(100)
      setOptimalStage('Done')
      setOptimalResult(data)
    } catch (e: any) {
      const msg = String(e?.message || '')
      const isAbort = controller.signal.aborted || e?.name === 'AbortError' || /aborted|abort/i.test(msg)
      setOptimalError(isAbort ? 'Generation timed out. Please retry.' : (msg || 'Generate optimal failed'))
      setOptimalResult((prev) => ({
        ...(prev || {}),
        scramble: normalized,
        cubeState: prev?.cubeState || seedCubeState,
        explanations: prev?.explanations || ['Generate optimal failed. Please retry.'],
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
      alert('Please input your solution first.')
      return
    }
    setAnalyzing(true)
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
        alert(data?.error || 'Analyze request failed')
        return
      }
      setResult(data)
    } catch (e: any) {
      const isAbort = controller.signal.aborted || e?.name === 'AbortError'
      alert(isAbort ? 'Analyze timeout, please retry.' : 'Analyze failed, please retry.')
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
      if (!response.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'OCR request failed')
      }
      if (data.scramble) setScramble(data.scramble)
      if (data.solution) setSolution(data.solution)
      if (!data.scramble && !data.solution) {
        alert('OCR did not extract scramble/solution. Please try clearer image.')
      }
    } catch (err: any) {
      const msg = String(err?.message || 'OCR failed')
      alert(`OCR failed: ${msg}`)
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
      setSelectedStage(null)
      setStageError(null)
    } else {
      setSolution('')
    }
  }

  const handleSpace = () => handleKeyboardInput(' ')

  const cubeStateRaw = optimalResult?.cubeState
  const cubeState: CubeState | null = cubeStateRaw
    ? (typeof cubeStateRaw === 'string' ? unflattenCubeState(cubeStateRaw) : cubeStateRaw)
    : null
  const pllMovesRaw = optimalResult?.cfop?.pll?.moves
  const pllMovesDisplay = typeof pllMovesRaw === 'string' && pllMovesRaw.trim().length > 0
    ? pllMovesRaw
    : 'PLL Skip'
  const stageMoves = selectedStage ? String(stageResult?.solution?.[selectedStage]?.moves || '') : ''

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="px-4 max-w-6xl mx-auto grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-slate-600" />
                Cube Analyze
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Scramble</label>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePickImage} className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={ocrLoading}>
                      {ocrLoading ? 'OCR...' : 'Upload'}
                    </button>
                    <button onClick={() => setKeyboardTarget('scramble')} className={cn('text-[10px] px-2 py-0.5 rounded', keyboardTarget === 'scramble' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                      Keyboard
                    </button>
                    {cubeState && (
                      <button onClick={() => setShowCube(!showCube)} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center gap-1">
                        {showCube ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showCube ? 'Hide Net' : 'Show Net'}
                      </button>
                    )}
                  </div>
                </div>
                <Input value={scramble} readOnly onClick={() => setKeyboardTarget('scramble')} placeholder="Please input scramble" className="font-cube text-sm cursor-pointer" />
                {generatingOptimal && (
                  <div className="mt-2">
                    <Progress value={optimalProgress} className="h-2" />
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{optimalStage || 'Solving'}</span>
                      <span>{Math.round(optimalProgress)}%</span>
                    </div>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-5 gap-2">
                  <button onClick={() => handleStageSolve('cross')} className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50" disabled={!!stageLoading || !scramble.trim()}>
                    {stageLoading === 'cross' ? 'Cross...' : 'Cross'}
                  </button>
                  <button onClick={() => handleStageSolve('f2l')} className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50" disabled={!!stageLoading || !scramble.trim()}>
                    {stageLoading === 'f2l' ? 'F2L...' : 'F2L'}
                  </button>
                  <button onClick={() => handleStageSolve('oll')} className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50" disabled={!!stageLoading || !scramble.trim()}>
                    {stageLoading === 'oll' ? 'OLL...' : 'OLL'}
                  </button>
                  <button onClick={() => handleStageSolve('pll')} className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50" disabled={!!stageLoading || !scramble.trim()}>
                    {stageLoading === 'pll' ? 'PLL...' : 'PLL'}
                  </button>
                  <button onClick={generateNetOnly} className="text-[10px] px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50" disabled={!scramble.trim()}>
                    Net
                  </button>
                </div>
                {selectedStage && (
                  <div className="mt-2 text-[10px] bg-slate-50 border border-slate-200 rounded p-2">
                    <div className="text-slate-500 mb-1">{selectedStage.toUpperCase()}:</div>
                    <code className="font-cube text-slate-800 break-all">{stageMoves || (selectedStage === 'pll' ? 'PLL Skip' : 'No moves')}</code>
                  </div>
                )}
                {stageError && <p className="mt-1 text-[10px] text-red-600">{stageError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Your Solution</label>
                  <button onClick={() => setKeyboardTarget('solution')} className={cn('text-[10px] px-2 py-0.5 rounded', keyboardTarget === 'solution' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                    Keyboard
                  </button>
                </div>
                <Textarea value={solution} readOnly onClick={() => setKeyboardTarget('solution')} placeholder="Please input your solution" rows={3} className="font-cube text-sm resize-none cursor-pointer" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Current target: <span className="font-semibold text-orange-500">{keyboardTarget === 'scramble' ? 'Scramble' : 'Solution'}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => setShowKeyboard(!showKeyboard)} className="lg:hidden text-slate-500 px-2 h-7">
                    {showKeyboard ? 'Hide' : 'Show'}
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

              <Button onClick={handleAnalyze} disabled={analyzing || !solution.trim()} className={cn('w-full py-5 text-base font-semibold bg-slate-900 text-white hover:bg-slate-800', analyzing && 'animate-pulse')}>
                {analyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Analyze Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <pre className="text-xs whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-200">{JSON.stringify(result, null, 2)}</pre>
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
                  Cube Net
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
                  Optimal (CFOP)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-[10px] text-slate-500">Steps</p>
                  <p className="text-2xl font-bold text-green-600">{optimalResult?.steps || '-'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Formula:</p>
                  <code className="block bg-slate-100 p-2 rounded text-xs break-all font-cube border border-slate-200 text-slate-800">
                    {optimalResult?.optimalSolution || (generatingOptimal ? `Solving... (${optimalStage || 'CFOP'})` : 'No optimal solution generated yet.')}
                  </code>
                </div>

                {optimalError && <p className="text-xs text-red-600">{optimalError}</p>}

                {optimalResult?.cfop && (
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <div><span className="text-slate-500">Cross:</span> {optimalResult.cfop?.cross?.moves || '-'}</div>
                    <div><span className="text-slate-500">F2L:</span> {optimalResult.cfop?.f2l?.moves || '-'}</div>
                    <div><span className="text-slate-500">OLL:</span> {optimalResult.cfop?.oll?.moves || '-'}</div>
                    <div><span className="text-slate-500">PLL:</span> {pllMovesDisplay}</div>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={generateOptimal} disabled={generatingOptimal} className="w-full text-xs">
                  {generatingOptimal ? 'Generating...' : 'Refresh Optimal'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  )
}
