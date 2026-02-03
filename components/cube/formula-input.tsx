'use client'

import { useState, useEffect } from 'react'
import { Delete, X, ChevronDown, ChevronUp } from 'lucide-react'

interface FormulaInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  readOnly?: boolean
}

type BlockType = 'basic' | 'wide' | 'rotation' | 'middle'

/**
 * 方块式公式输入组件
 * 每个动作显示为独立方块（R' R2 算一个方块），支持点击删除
 * 支持所有魔方动作：基础(RLUDFB)、宽层(rludfb)、转体(xyz)、中层(MES)
 */
export function FormulaInput({
  value,
  onChange,
  placeholder = '点击方块输入',
  maxLength = 200,
  readOnly = false
}: FormulaInputProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 解析公式为方块数组
  const parseBlocks = (formula: string): Array<{ char: string; type: BlockType }> => {
    if (!formula) return []

    const parts = formula.trim().split(/\s+/).filter(p => p.length > 0)
    const blocks: Array<{ char: string; type: BlockType }> = []

    for (const part of parts) {
      const moves = part.match(/[RLUDFBrludfbxyzMES][2']?/g) || []
      for (const move of moves) {
        const baseChar = move[0]
        let type: BlockType = 'basic'

        if (/[rludfb]/.test(baseChar)) {
          type = 'wide'
        } else if (/[xyz]/.test(baseChar)) {
          type = 'rotation'
        } else if (/[MES]/.test(baseChar)) {
          type = 'middle'
        }

        blocks.push({ char: move, type })
      }
    }

    return blocks
  }

  const [blocks, setBlocks] = useState(parseBlocks(value))

  // 当外部值变化时更新方块
  useEffect(() => {
    setBlocks(parseBlocks(value))
  }, [value])

  // 当方块变化时更新外部值
  useEffect(() => {
    const formula = blocks.map(b => b.char).join(' ')
    const cleaned = formula.replace(/\s+/g, ' ').trim()
    if (cleaned !== value) {
      onChange(cleaned)
    }
  }, [blocks])

  // 添加动作
  const addMove = (base: string, modifier: '' | "'" | '2' = '') => {
    if (readOnly) return
    const char = base + modifier
    let type: BlockType = 'basic'

    if (/[rludfb]/.test(base)) {
      type = 'wide'
    } else if (/[xyz]/.test(base)) {
      type = 'rotation'
    } else if (/[MES]/.test(base)) {
      type = 'middle'
    }

    setBlocks([...blocks, { char, type }])
  }

  // 删除指定位置的方块
  const removeBlock = (index: number) => {
    if (readOnly) return
    const newBlocks = [...blocks]
    newBlocks.splice(index, 1)
    setBlocks(newBlocks)
  }

  // 删除最后一个方块
  const backspace = () => {
    if (readOnly || blocks.length === 0) return
    const newBlocks = [...blocks]
    newBlocks.pop()
    setBlocks(newBlocks)
  }

  // 清空所有
  const clear = () => {
    if (readOnly) return
    setBlocks([])
    onChange('')
  }

  // 方块颜色样式 - 简化为3种颜色
  const getBlockStyle = (block: { char: string; type: BlockType }) => {
    const baseClass = "rounded flex items-center justify-center font-mono font-bold cursor-pointer select-none transition-all active:scale-95 border"

    // 有修饰符的用橙色
    if (block.char.endsWith("'") || block.char.endsWith("2")) {
      return `${baseClass} bg-orange-400 text-white border-orange-600`
    }

    // 高级动作（宽层/转体/中层）用紫色
    if (block.type === 'wide' || block.type === 'rotation' || block.type === 'middle') {
      return `${baseClass} bg-purple-500 text-white border-purple-700`
    }

    // 基础动作用白色
    return `${baseClass} bg-white text-slate-800 border-slate-400`
  }

  return (
    <div className="space-y-2">
      {/* 方块显示区 */}
      <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2.5 bg-slate-50 rounded-lg border border-slate-200">
        {blocks.length === 0 ? (
          <span className="text-slate-400 text-sm pointer-events-none self-center">
            {placeholder}
          </span>
        ) : (
          blocks.map((block, index) => (
            <div
              key={index}
              onClick={() => removeBlock(index)}
              className={cn(
                getBlockStyle(block),
                "w-9 h-9 text-sm sm:w-10 sm:h-10 sm:text-base"
              )}
              title="点击删除"
            >
              {block.char}
            </div>
          ))
        )}
      </div>

      {/* 控制按钮 - 始终显示键盘 */}
      {!readOnly && (
        <div className="space-y-2 py-2 px-1 bg-slate-100 rounded-lg">
          {/* 基础动作 */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] sm:text-xs text-slate-600 w-8 shrink-0 font-medium">基础</span>
            <div className="flex flex-wrap gap-0.5">
              {['R', 'L', 'U', 'D', 'F', 'B'].map((move) => (
                <div key={move} className="flex gap-0.5">
                  <button
                    onClick={() => addMove(move)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-white border border-slate-400 text-slate-800 font-mono font-bold text-sm sm:text-base"
                  >
                    {move}
                  </button>
                  <button
                    onClick={() => addMove(move, "'")}
                    className="w-7 h-8 sm:w-8 sm:h-9 rounded bg-orange-400 border border-orange-600 text-white font-mono font-bold text-xs sm:text-sm"
                  >
                    {move}&apos;
                  </button>
                  <button
                    onClick={() => addMove(move, '2')}
                    className="w-7 h-8 sm:w-8 sm:h-9 rounded bg-orange-400 border border-orange-600 text-white font-mono font-bold text-xs sm:text-sm"
                  >
                    {move}2
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 高级动作 */}
          <div className="space-y-1">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 hover:text-slate-800 w-full"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>高级动作 (宽层/转体/中层)</span>
            </button>

            {showAdvanced && (
              <div className="space-y-1.5 pl-2">
                {/* 宽层 */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] sm:text-xs text-slate-600 w-8 shrink-0">宽层</span>
                  <div className="flex flex-wrap gap-0.5">
                    {['r', 'l', 'u', 'd', 'f', 'b'].map((move) => (
                      <div key={move} className="flex gap-0.5">
                        <button
                          onClick={() => addMove(move)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-500 border border-purple-700 text-white font-mono font-bold text-sm"
                        >
                          {move}
                        </button>
                        <button
                          onClick={() => addMove(move, "'")}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded bg-purple-600 border border-purple-900 text-white font-mono font-bold text-xs"
                        >
                          {move}&apos;
                        </button>
                        <button
                          onClick={() => addMove(move, '2')}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded bg-purple-600 border border-purple-900 text-white font-mono font-bold text-xs"
                        >
                          {move}2
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 转体 */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] sm:text-xs text-slate-600 w-8 shrink-0">转体</span>
                  <div className="flex flex-wrap gap-0.5">
                    {['x', 'y', 'z'].map((move) => (
                      <div key={move} className="flex gap-0.5">
                        <button
                          onClick={() => addMove(move)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-500 border border-purple-700 text-white font-mono font-bold text-sm"
                        >
                          {move}
                        </button>
                        <button
                          onClick={() => addMove(move, "'")}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded bg-purple-600 border border-purple-900 text-white font-mono font-bold text-xs"
                        >
                          {move}&apos;
                        </button>
                        <button
                          onClick={() => addMove(move, '2')}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded bg-purple-600 border border-purple-900 text-white font-mono font-bold text-xs"
                        >
                          {move}2
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 中层 */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] sm:text-xs text-slate-600 w-8 shrink-0">中层</span>
                  <div className="flex flex-wrap gap-0.5">
                    {['M', 'E', 'S'].map((move) => (
                      <div key={move} className="flex gap-0.5">
                        <button
                          onClick={() => addMove(move)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-purple-500 border border-purple-700 text-white font-mono font-bold text-sm"
                        >
                          {move}
                        </button>
                        <button
                          onClick={() => addMove(move, "'")}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded bg-purple-600 border border-purple-900 text-white font-mono font-bold text-xs"
                        >
                          {move}&apos;
                        </button>
                        <button
                          onClick={() => addMove(move, '2')}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded bg-purple-600 border border-purple-900 text-white font-mono font-bold text-xs"
                        >
                          {move}2
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 编辑按钮 */}
          <div className="flex gap-1.5 pt-1 border-t border-slate-300">
            <button
              onClick={backspace}
              className="flex-1 h-9 rounded bg-slate-200 border border-slate-400 text-slate-700 hover:bg-slate-300 active:bg-slate-400 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
            >
              <Delete className="w-3.5 h-3.5" />
              删除
            </button>
            <button
              onClick={clear}
              className="flex-1 h-9 rounded bg-red-500 border border-red-700 text-white hover:bg-red-600 active:bg-red-700 transition-colors flex items-center justify-center gap-1 text-xs font-medium"
            >
              <X className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
