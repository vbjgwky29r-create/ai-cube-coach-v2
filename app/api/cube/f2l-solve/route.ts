/**
 * F2L API
 *
 * POST /api/cube/f2l-solve
 * Body: { scramble: string, cross?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  applyScramble,
  createSolvedCubeState,
  isCrossComplete,
  isF2LComplete,
  solveCFOPDetailedVerified,
} from '@/lib/cube/cfop-latest'

function validateFormula(formula: string): boolean {
  if (!formula || formula.trim().length === 0) {
    return false
  }
  const validPattern = /^[\sURFDLBMESXYZurfdlbmesxyz'2]+$/
  return validPattern.test(formula)
}

/**
 * 解析并标准化公式
 * 保留宽转（r/l/u/d/f/b）和中层转（M/E/S）的大小写区别
 */
function normalizeFormula(formula: string): string {
  return formula
    .trim()
    .replace(/\s+/g, ' ')
    // 只将大写基础转体（R/L/U/D/F/B）标准化，保留宽转和中层转的小写
    .replace(/\b([URFDLB])\b/g, (match) => match.toUpperCase())
}

export async function POST(request: NextRequest) {
  try {
    const { scramble, cross } = await request.json()

    if (!scramble) {
      return NextResponse.json({ error: '缺少打乱公式' }, { status: 400 })
    }

    const normalizedScramble = normalizeFormula(scramble)
    if (!validateFormula(normalizedScramble)) {
      return NextResponse.json({ error: '打乱公式格式不正确' }, { status: 400 })
    }

    let normalizedCross = ''
    if (cross) {
      normalizedCross = normalizeFormula(cross)
      if (!validateFormula(normalizedCross)) {
        return NextResponse.json({ error: 'Cross 公式格式不正确' }, { status: 400 })
      }
    }
    const cfop = solveCFOPDetailedVerified(normalizedScramble)

    const afterCross = applyScramble(createSolvedCubeState(), normalizedScramble)
    if (cfop.cross.moves) afterCross.move(cfop.cross.moves)
    const afterF2L = applyScramble(createSolvedCubeState(), normalizedScramble)
    if (cfop.cross.moves) afterF2L.move(cfop.cross.moves)
    if (cfop.f2l.moves) afterF2L.move(cfop.f2l.moves)

    return NextResponse.json({
      success: true,
      scramble: normalizedScramble,
      cross: {
        moves: cfop.cross.moves,
        steps: cfop.cross.steps,
        intact: isCrossComplete(afterCross),
      },
      f2l: {
        moves: cfop.f2l.moves,
        steps: cfop.f2l.steps,
        slots: cfop.f2l.slots,
        method: 'cfop-latest',
        complete: isF2LComplete(afterF2L),
      },
      note: normalizedCross ? 'cross 参数已弃用；当前统一使用 cfop-latest 阶段求解结果。' : undefined,
    })
  } catch (error: unknown) {
    console.error('[F2L Solve API] Error:', error)
    const message = error instanceof Error ? error.message : 'F2L 求解失败'
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cube/f2l-solve',
    method: 'POST',
    description: 'F2L 求解接口（统一使用 cfop-latest 的 Cross/F2L 分段结果）',
    parameters: {
      scramble: {
        type: 'string',
        description: '打乱公式',
        example: "R U F' R' U' F",
      },
      cross: {
        type: 'string',
        description: '已弃用，保留兼容入参',
      },
    },
    response: {
      success: 'boolean',
      cross: 'cfop-latest 的 Cross 结果与完整性',
      f2l: 'cfop-latest 的 F2L 结果与完成情况',
    },
  })
}
