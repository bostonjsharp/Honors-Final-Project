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
    expect(json.digit).toBeUndefined()
  })

  it('returns valid: true and digit for correct answer', async () => {
    const res = await POST(makeRequest({ puzzleId: 1, answer: 'placeholder_answer_1' }))
    const json = await res.json()
    expect(json.valid).toBe(true)
    expect(json.digit).toBeDefined()
  })

  it('returns valid: true case-insensitively', async () => {
    const res = await POST(makeRequest({ puzzleId: 1, answer: 'PLACEHOLDER_ANSWER_1' }))
    const json = await res.json()
    expect(json.valid).toBe(true)
  })

  it('returns 400 for missing fields', async () => {
    const res = await POST(makeRequest({ puzzleId: 1 }))
    expect(res.status).toBe(400)
  })
})
