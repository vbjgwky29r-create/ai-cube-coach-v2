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
  const middleMoves = ['M', 'E', 'S', 'm', 'e', 's']

  // 旋转动作（转体）
  const rotations = ['x', 'y', 'z']

  // 快捷公式
  const shortcuts = [
    { label: 'Sexy Move', notation: "R U R' U'", color: 'from-orange-500/20 to-red-500/20' },
    { label: 'Sledgehammer', notation: "R' F R F'", color: 'from-blue-500/20 to-indigo-500/20' },
    { label: 'Sune', notation: "R U R' U R U2 R'", color: 'from-green-500/20 to-emerald-500/20' },
    { label: 'T-Perm', notation: "R U R' U' R' F R2 U' R'", color: 'from-purple-500/20 to-pink-500/20' },
  ]

  const handleKeyPress = (key: string) => {
    onInput(key)
  }

  const canAddModifier = () => {
    const trimmed = value.trimEnd()
    // 检查最后一个字符是否是动作字母
    const lastChar = trimmed.slice(-1)
    return /^[RLUDFBrludfbMESmesxyz]$/.test(lastChar) &&
           !lastChar.endsWith("'") &&
           !lastChar.endsWith('2')
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* 基础动作 */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">基础</div>
        <div className="grid grid-cols-6 gap-1">
          {basicMoves.map((move) => (
            <button
              key={move}
              onClick={handleKeyPress.bind(null, move)}
              className="key-basic font-cube"
            >
              {move}
            </button>
          ))}
        </div>
      </div>

      {/* 宽层动��� */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">两层</div>
        <div className="grid grid-cols-6 gap-1">
          {wideMoves.map((move) => (
            <button
              key={move}
              onClick={handleKeyPress.bind(null, move)}
              className="key-basic key-wide font-cube"
            >
              {move}
            </button>
          ))}
        </div>
      </div>

      {/* 中层动作 */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">中层</div>
        <div className="grid grid-cols-6 gap-1">
          {middleMoves.map((move, idx) => (
            <button
              key={move}
              onClick={handleKeyPress.bind(null, move)}
              className={cn(
                "key-basic font-cube key-middle",
                idx >= 3 && "bg-emerald-50/50 border-emerald-300/50 text-emerald-700"
              )}
            >
              {move}
            </button>
          ))}
        </div>
      </div>

      {/* 旋转动作 */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">转体</div>
        <div className="grid grid-cols-3 gap-1">
          {rotations.map((rot) => (
            <button
              key={rot}
              onClick={handleKeyPress.bind(null, rot)}
              className="key-basic key-rotation font-cube"
            >
              {rot}
            </button>
          ))}
        </div>
      </div>

      {/* 修饰符 */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">修饰</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => handleKeyPress("'")}
            disabled={!canAddModifier()}
            className="key-basic font-cube bg-yellow-50 border-yellow-300 text-yellow-800 disabled:opacity-30 disabled:hover:scale-100"
          >
            &apos;
          </button>
          <button
            onClick={() => handleKeyPress('2')}
            disabled={!canAddModifier()}
            className="key-basic font-cube bg-pink-50 border-pink-300 text-pink-800 disabled:opacity-30 disabled:hover:scale-100"
          >
            2
          </button>
        </div>
      </div>

      {/* 快捷公式 */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">常用公式</div>
        <div className="grid grid-cols-2 gap-1">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.label}
              onClick={handleKeyPress.bind(null, shortcut.notation)}
              className={cn(
                "p-2 rounded-lg text-left transition-all duration-200",
                "bg-gradient-to-r " + shortcut.color,
                "hover:scale-[1.02] active:scale-[0.98]",
                "border border-white/10 hover:border-white/20"
              )}
            >
              <div className="font-semibold text-xs text-white">{shortcut.label}</div>
              <div className="text-[10px] text-white/70 font-cube truncate">{shortcut.notation}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200">
        <button
          onClick={onSpace}
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all active:scale-95 text-xs"
        >
          空格
        </button>
        <button
          onClick={onBackspace}
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 text-xs"
        >
          ← 删除
        </button>
        <button
          onClick={onClear}
          className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 transition-all active:scale-95 text-xs font-semibold text-white"
        >
          清空
        </button>
      </div>
    </div>
  )
}
