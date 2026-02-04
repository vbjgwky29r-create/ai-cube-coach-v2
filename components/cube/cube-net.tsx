'use client'

import { CubeState, type CubeColor } from '@/lib/cube/cube-state'

interface CubeNetProps {
  state: CubeState
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 魔方展开图组件 - 响应式优化版
 *
 * 展示6个面的平面展开图：
 *
 *       U U U
 *       U U U
 *       U U U
 * L L L F F F R R R B B B
 * L L L F F F R R R B B B
 * L L L F F F R R R B B B
 *       D D D
 *       D D D
 *       D D D
 */
export function CubeNet({ state, showLabels = true, size = 'md' }: CubeNetProps) {
  // 响应式尺寸
  const cellSize = size === 'sm' ? 14 : size === 'lg' ? 28 : 20
  const fontSize = size === 'sm' ? 9 : size === 'lg' ? 13 : 11
  const gap = size === 'sm' ? 1 : 2

  // 颜色映射
  const getColorStyle = (color: CubeColor) => {
    const colors: Record<CubeColor, { bg: string; border: string }> = {
      'U': { bg: '#ffffff', border: '#d1d5db' },
      'R': { bg: '#ef4444', border: '#b91c1c' },
      'F': { bg: '#22c55e', border: '#15803d' },
      'D': { bg: '#facc15', border: '#ca8a04' },
      'L': { bg: '#f97316', border: '#c2410c' },
      'B': { bg: '#3b82f6', border: '#1d4ed8' },
    }
    return colors[color]
  }

  // 单个方格组件
  const Cell = ({ color }: { color: CubeColor }) => {
    const style = getColorStyle(color)
    return (
      <div
        style={{
          width: cellSize,
          height: cellSize,
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: 2,
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      />
    )
  }

  // 单个面组件
  const Face = ({ face, label }: { face: CubeColor[][], label?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && (
        <span style={{
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          fontWeight: 600,
          color: '#64748b',
          marginBottom: 2,
        }}>
          {label}
        </span>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${cellSize}px)`,
        gridTemplateRows: `repeat(3, ${cellSize}px)`,
        gap: 1,
        backgroundColor: '#94a3b8',
        padding: 1,
        borderRadius: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {face.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} color={color} />
          ))
        )}
      </div>
    </div>
  )

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: gap,
      padding: 8,
    }}>
      {/* U 面 */}
      <Face face={state.U} label={showLabels ? 'U' : undefined} />

      {/* 中间四行: L, F, R, B */}
      <div style={{ display: 'flex', gap: gap }}>
        <Face face={state.L} label={showLabels ? 'L' : undefined} />
        <Face face={state.F} label={showLabels ? 'F' : undefined} />
        <Face face={state.R} label={showLabels ? 'R' : undefined} />
        <Face face={state.B} label={showLabels ? 'B' : undefined} />
      </div>

      {/* D 面 */}
      <Face face={state.D} label={showLabels ? 'D' : undefined} />
    </div>
  )
}

/**
 * 紧凑版魔方展开图（用于小空间）
 */
export function CompactCubeNet({ state }: { state: CubeState }) {
  const cellSize = 10
  const fontSize = 8

  const getColorStyle = (color: CubeColor) => {
    const colors: Record<CubeColor, { bg: string; border: string }> = {
      'U': { bg: '#ffffff', border: '#d1d5db' },
      'R': { bg: '#ef4444', border: '#b91c1c' },
      'F': { bg: '#22c55e', border: '#15803d' },
      'D': { bg: '#facc15', border: '#ca8a04' },
      'L': { bg: '#f97316', border: '#c2410c' },
      'B': { bg: '#3b82f6', border: '#1d4ed8' },
    }
    return colors[color]
  }

  const Cell = ({ color }: { color: CubeColor }) => {
    const style = getColorStyle(color)
    return (
      <div
        style={{
          width: cellSize,
          height: cellSize,
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: 1,
          boxSizing: 'border-box',
        }}
      />
    )
  }

  const MiniFace = ({ face, label }: { face: CubeColor[][], label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize, color: '#64748b', marginBottom: 1, fontWeight: 600 }}>{label}</span>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${cellSize}px)`,
        gridTemplateRows: `repeat(3, ${cellSize}px)`,
        gap: 0.5,
        backgroundColor: '#94a3b8',
        padding: 0.5,
        borderRadius: 2,
      }}>
        {face.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} color={color} />
          ))
        )}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <MiniFace face={state.U} label="U" />
      <div style={{ display: 'flex', gap: 1 }}>
        <MiniFace face={state.L} label="L" />
        <MiniFace face={state.F} label="F" />
        <MiniFace face={state.R} label="R" />
        <MiniFace face={state.B} label="B" />
      </div>
      <MiniFace face={state.D} label="D" />
    </div>
  )
}

/**
 * 颜色图例
 */
export function ColorLegend() {
  const legendItems: { key: CubeColor; bg: string; name: string }[] = [
    { key: 'U', bg: '#ffffff', name: '白 (上)' },
    { key: 'D', bg: '#facc15', name: '黄 (下)' },
    { key: 'F', bg: '#22c55e', name: '绿 (前)' },
    { key: 'B', bg: '#3b82f6', name: '蓝 (后)' },
    { key: 'R', bg: '#ef4444', name: '红 (右)' },
    { key: 'L', bg: '#f97316', name: '橙 (左)' },
  ]

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 12, 
      justifyContent: 'center',
      padding: '8px 0',
    }}>
      {legendItems.map(({ key, bg, name }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: bg,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 3,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          />
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{name}</span>
        </div>
      ))}
    </div>
  )
}
