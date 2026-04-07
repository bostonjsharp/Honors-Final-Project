import { NextRequest, NextResponse } from 'next/server'
import { validateAnswer, getHumanDigit, getAriaDigit } from '@/lib/puzzles'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.puzzleId !== 'number' || typeof body.answer !== 'string') {
    return NextResponse.json({ error: 'Missing puzzleId or answer' }, { status: 400 })
  }

  const { puzzleId, answer } = body
  const valid = validateAnswer(puzzleId, answer)

  if (!valid) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    digit: getHumanDigit(puzzleId),
    ariaDigit: getAriaDigit(puzzleId),
  })
}
