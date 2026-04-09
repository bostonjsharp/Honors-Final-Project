/**
 * @jest-environment node
 */
import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/documents', () => ({
  loadDocuments: jest.fn().mockResolvedValue('mock document content'),
}))

const mockCreate = jest.fn().mockResolvedValue({
  choices: [{ message: { content: 'A lateral hint from ARIA.' } }],
})

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}))

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/hint', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  process.env.OPENAI_API_KEY = 'test-key'
  jest.clearAllMocks()
})

afterEach(() => {
  delete process.env.OPENAI_API_KEY
})

describe('POST /api/hint', () => {
  it('returns a text response for puzzles_active state', async () => {
    const res = await POST(makeRequest({ question: 'help me', gameState: 'puzzles_active' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(typeof json.text).toBe('string')
    expect(json.text.length).toBeGreaterThan(0)
  })

  it('accepts optional puzzleId and returns 200', async () => {
    const res = await POST(makeRequest({ question: 'help me', gameState: 'puzzles_active', puzzleId: 1 }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(typeof json.text).toBe('string')
  })

  it('includes puzzle-scoped instruction in system prompt when puzzleId provided', async () => {
    await POST(makeRequest({ question: 'help me', gameState: 'puzzles_active', puzzleId: 2 }))
    const callArgs = mockCreate.mock.calls[0][0]
    expect(callArgs.messages[0].content).toContain('Puzzle 2')
  })

  it('calls GPT with gpt-4o-mini model', async () => {
    await POST(makeRequest({ question: 'help me', gameState: 'puzzles_active' }))
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o-mini' })
    )
  })

  it('returns 400 for missing question', async () => {
    const res = await POST(makeRequest({ gameState: 'puzzles_active' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing gameState', async () => {
    const res = await POST(makeRequest({ question: 'help' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 if OPENAI_API_KEY is not set', async () => {
    delete process.env.OPENAI_API_KEY
    const res = await POST(makeRequest({ question: 'help', gameState: 'puzzles_active' }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('LLM not configured')
  })

  it('returns 500 if OpenAI call throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('rate limit'))
    const res = await POST(makeRequest({ question: 'help', gameState: 'puzzles_active' }))
    expect(res.status).toBe(500)
  })
})
