/**
 * @jest-environment node
 */
import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/auth', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  process.env.TERMINAL_PASSWORD = 'player-secret'
  process.env.OPERATOR_PASSWORD = 'operator-secret'
})

afterEach(() => {
  delete process.env.TERMINAL_PASSWORD
  delete process.env.OPERATOR_PASSWORD
})

describe('POST /api/auth', () => {
  it('returns ok: true and operator: false for player password', async () => {
    const res = await POST(makeRequest({ password: 'player-secret' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.operator).toBe(false)
  })

  it('returns ok: true and operator: true for operator password', async () => {
    const res = await POST(makeRequest({ password: 'operator-secret' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.operator).toBe(true)
  })

  it('returns 401 for wrong password', async () => {
    const res = await POST(makeRequest({ password: 'wrong' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for missing password field', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 500 when no passwords are configured', async () => {
    delete process.env.TERMINAL_PASSWORD
    delete process.env.OPERATOR_PASSWORD
    const res = await POST(makeRequest({ password: 'anything' }))
    expect(res.status).toBe(500)
  })
})
