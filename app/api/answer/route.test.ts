/**
 * @jest-environment node
 */
import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/answer', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/answer', () => {
  it('returns valid: false for wrong answer', async () => {
    const res = await POST(makeRequest({ puzzleId: 1, answer: 'wrong' }))
    const json = await res.json()
    expect(json.valid).toBe(false)
  })

  it('returns valid: true for puzzle 1 correct answer and no digit field', async () => {
    const res = await POST(makeRequest({ puzzleId: 1, answer: '31926' }))
    const json = await res.json()
    expect(json.valid).toBe(true)
    expect(json.digit).toBeUndefined()
    expect(json.ariaDigit).toBeUndefined()
  })

  it('returns valid: true for puzzle 2 correct answer', async () => {
    const res = await POST(makeRequest({ puzzleId: 2, answer: '3279' }))
    const json = await res.json()
    expect(json.valid).toBe(true)
  })

  it('returns valid: true for trimmed input', async () => {
    const res = await POST(makeRequest({ puzzleId: 1, answer: '  31926  ' }))
    const json = await res.json()
    expect(json.valid).toBe(true)
  })

  it('returns 400 for missing answer field', async () => {
    const res = await POST(makeRequest({ puzzleId: 1 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing puzzleId field', async () => {
    const res = await POST(makeRequest({ answer: '31926' }))
    expect(res.status).toBe(400)
  })
})
