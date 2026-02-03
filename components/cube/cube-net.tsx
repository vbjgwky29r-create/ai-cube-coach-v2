'use client'

import { CubeState, type CubeColor } from '@/lib/cube/cube-state'

interface CubeNetProps {
  state: CubeState
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 魔方展开图组件 - 移动端优化版
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
  // 固定尺寸，确保移动端一致
  const cellSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 24
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12
  const labelWidth = size === 'sm' ? 16 : size === 'lg' ? 24 : 20

  // 内联样式确保颜色正确应用
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
          boxSizing: 'border-box',
          minWidth: cellSize,
          minHeight: cellSize,
        }}
      />
    )
  }

  // 单个面组件
  const Face = ({ face, label }: { face: CubeColor[][], label?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && (
        <span style={{
          width: labelWidth,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          fontWeight: 'bold',
          color: '#64748b',
          flexShrink: 0
        }}>
          {label}
        </span>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${cellSize}px)`,
        gridTemplateRows: `repeat(3, ${cellSize}px)`,
        gap: '1px',
        backgroundColor: '#cbd5e1',
        border: '1px solid #cbd5e1',
        boxSizing: 'border-box',
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      {/* U 面 */}
      <Face face={state.U} label={showLabels ? 'U' : undefined} />

      {/* 中间四行: L, F, R, B */}
      <div style={{ display: 'flex', gap: '2px' }}>
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
 * 紧凑版魔方展开图（用于边栏）
 */
export function CompactCubeNet({ state }: { state: CubeState }) {
  const cellSize = 12
  const labelWidth = 12
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
          boxSizing: 'border-box',
        }}
      />
    )
  }

  const MiniFace = ({ face }: { face: CubeColor[][] }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${cellSize}px)`,
      gridTemplateRows: `repeat(3, ${cellSize}px)`,
      gap: '0.5px',
      backgroundColor: '#e5e7eb',
    }}>
      {face.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <Cell key={`${rowIndex}-${colIndex}`} color={color} />
        ))
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* U 面 */}
      <div style={{ display: 'flex' }}>
        <span style={{ width: labelWidth, fontSize, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>U</span>
        <MiniFace face={state.U} />
      </div>

      {/* 中间层 */}
      <div style={{ display: 'flex', gap: '1px' }}>
        <MiniFaceRow faces={[state.L, state.F, state.R, state.B]} labels={['L', 'F', 'R', 'B']} />
      </div>

      {/* D 面 */}
      <div style={{ display: 'flex' }}>
        <span style={{ width: labelWidth, fontSize, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>D</span>
        <MiniFace face={state.D} />
      </div>
    </div>
  )
}

function MiniFaceRow({ faces, labels }: { faces: CubeColor[][][]; labels: string[] }) {
  const cellSize = 12
  const labelWidth = 12

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
          boxSizing: 'border-box',
        }}
      />
    )
  }

  const MiniFace = ({ face }: { face: CubeColor[][] }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${cellSize}px)`,
      gridTemplateRows: `repeat(3, ${cellSize}px)`,
      gap: '0.5px',
      backgroundColor: '#e5e7eb',
    }}>
      {face.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <Cell key={`${rowIndex}-${colIndex}`} color={color} />
        ))
      )}
    </div>
  )

  return (
    <>
      {faces.map((face, idx) => (
        <div key={labels[idx]} style={{ display: 'flex' }}>
          <span style={{ width: labelWidth, fontSize: 8, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{labels[idx]}</span>
          <MiniFace face={face} />
        </div>
      ))}
    </>
  )
}

/**
 * 颜色图例
 */
export function ColorLegend() {
  const legendStyle: Record<CubeColor, { bg: string; name: string }> = {
    'U': { bg: '#ffffff', name: '白' },
    'R': { bg: '#ef4444', name: '红' },
    'F': { bg: '#22c55e', name: '绿' },
    'D': { bg: '#facc15', name: '黄' },
    'L': { bg: '#f97316', name: '橙' },
    'B': { bg: '#3b82f6', name: '蓝' },
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
      {(Object.entries(legendStyle) as [CubeColor, { bg: string; name: string }][]).map(([key, { bg, name }]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: bg,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '2px',
            }}
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>{name}</span>
        </div>
      ))}
    </div>
  )
}
