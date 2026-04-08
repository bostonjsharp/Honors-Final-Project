import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  const isOperator = body.password === process.env.OPERATOR_PASSWORD
  const isPlayer = body.password === process.env.TERMINAL_PASSWORD

  if (!isPlayer && !isOperator) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, operator: isOperator })
}
