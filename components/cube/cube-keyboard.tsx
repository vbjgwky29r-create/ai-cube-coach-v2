'use client'

import { cn } from '@/lib/utils'

interface CubeKeyboardProps {
  onInput: (value: string) => void
  onBackspace: () => void
  onClear: () => void
  onSpace: () => void
  value?: string
  className?: string
}

export function CubeKeyboard({ onInput, onBackspace, onClear, onSpace, value = '', className }: CubeKeyboardProps) {
  // 基础动作按钮
  const basicMoves = ['R', 'L', 'U', 'D', 'F', 'B']

  // 宽层动作（两层连拨）
  const wideMoves = ['r', 'l', 'u', 'd', 'f', 'b']

  // 中层动作
  const middleMoves = ['M', 'E', 'S']

  // 旋转动作（转体）
  const rotations = ['x', 'y', 'z']

  // 快捷公式
  const shortcuts = [
    { label: 'Sexy Move', notation: "R U R' U'", color: 'bg-orange-500' },
    { label: 'Sledgehammer', notation: "R' F R F'", color: 'bg-blue-500' },
    { label: 'Sune', notation: "R U R' U R U2 R'", color: 'bg-green-500' },
    { label: 'T-Perm', notation: "R U R' U' R' F R2 U' R'", color: 'bg-purple-500' },
  ]

  const handleKeyPress = (key: string) => {
    onInput(key)
  }

  const canAddModifier = () => {
    const trimmed = value.trimEnd()
    const lastChar = trimmed.slice(-1)
    return /^[RLUDFBrludfbMESmesxyz]$/.test(lastChar) &&
           !lastChar.endsWith("'") &&
           !lastChar.endsWith('2')
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 基础动作 */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">基础动作</div>
        <div className="grid grid-cols-6 gap-1.5">
          {basicMoves.map((move) => (
            <button
              key={move}
              onClick={handleKeyPress.bind(null, move)}
              className="h-11 rounded-lg font-mono font-bold text-base bg-white border-2 border-slate-200 text-slate-700 hover:border-orange-400 hover:bg-orange-50 active:scale-95 transition-all shadow-sm"
            >
              {move}
            </button>
          ))}
        </div>
      </div>

      {/* 宽层动作 */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">两层转动</div>
        <div className="grid grid-cols-6 gap-1.5">
          {wideMoves.map((move) => (
            <button
              key={move}
              onClick={handleKeyPress.bind(null, move)}
              className="h-11 rounded-lg font-mono font-bold text-base bg-blue-50 border-2 border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-100 active:scale-95 transition-all shadow-sm"
            >
              {move}
            </button>
          ))}
        </div>
      </div>

      {/* 中层 + 转体 + 修饰符 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 中层动作 */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">中层</div>
          <div className="grid grid-cols-3 gap-1.5">
            {middleMoves.map((move) => (
              <button
                key={move}
                onClick={handleKeyPress.bind(null, move)}
                className="h-11 rounded-lg font-mono font-bold text-base bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
              >
                {move}
              </button>
            ))}
          </div>
        </div>

        {/* 转体 */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">转体</div>
          <div className="grid grid-cols-3 gap-1.5">
            {rotations.map((rot) => (
              <button
                key={rot}
                onClick={handleKeyPress.bind(null, rot)}
                className="h-11 rounded-lg font-mono font-bold text-base bg-purple-50 border-2 border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-100 active:scale-95 transition-all shadow-sm"
              >
                {rot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 修饰符 */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">修饰符</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleKeyPress("'")}
            disabled={!canAddModifier()}
            className="h-11 rounded-lg font-mono font-bold text-lg bg-amber-50 border-2 border-amber-300 text-amber-700 hover:border-amber-500 hover:bg-amber-100 active:scale-95 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-amber-300 disabled:hover:bg-amber-50"
          >
            &apos; <span className="text-xs font-normal">(逆时针)</span>
          </button>
          <button
            onClick={() => handleKeyPress('2')}
            disabled={!canAddModifier()}
            className="h-11 rounded-lg font-mono font-bold text-lg bg-pink-50 border-2 border-pink-300 text-pink-700 hover:border-pink-500 hover:bg-pink-100 active:scale-95 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-pink-300 disabled:hover:bg-pink-50"
          >
            2 <span className="text-xs font-normal">(180°)</span>
          </button>
        </div>
      </div>

      {/* 快捷公式 */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">常用公式</div>
        <div className="grid grid-cols-2 gap-2">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.label}
              onClick={handleKeyPress.bind(null, shortcut.notation)}
              className={cn(
                "p-3 rounded-xl text-left transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                shortcut.color,
                "text-white shadow-md hover:shadow-lg"
              )}
            >
              <div className="font-semibold text-sm">{shortcut.label}</div>
              <div className="text-xs opacity-90 font-mono mt-0.5 truncate">{shortcut.notation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
        <button
          onClick={onSpace}
          className="h-11 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95 text-sm font-medium text-slate-600"
        >
          空格
        </button>
        <button
          onClick={onBackspace}
          className="h-11 rounded-lg bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95 text-sm font-medium text-slate-600"
        >
          ← 删除
        </button>
        <button
          onClick={onClear}
          className="h-11 rounded-lg bg-red-500 hover:bg-red-600 transition-all active:scale-95 text-sm font-semibold text-white shadow-sm"
        >
          清空
        </button>
      </div>
    </div>
  )
}
