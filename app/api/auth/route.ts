import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  const terminalPassword = process.env.TERMINAL_PASSWORD
  const operatorPassword = process.env.OPERATOR_PASSWORD

  if (!terminalPassword && !operatorPassword) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const isOperator = operatorPassword ? body.password === operatorPassword : false
  const isPlayer = terminalPassword ? body.password === terminalPassword : false

  if (!isPlayer && !isOperator) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, operator: isOperator })
}
