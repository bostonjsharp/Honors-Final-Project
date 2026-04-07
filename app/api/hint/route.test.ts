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
  it('returns a text response', async () => {
    const res = await POST(makeRequest({ question: 'help me', gameState: 'act_1' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(typeof json.text).toBe('string')
    expect(json.text.length).toBeGreaterThan(0)
  })

  it('calls GPT with gpt-4o-mini model', async () => {
    await POST(makeRequest({ question: 'help me', gameState: 'act_1' }))
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o-mini' })
    )
  })

  it('returns 400 for missing question', async () => {
    const res = await POST(makeRequest({ gameState: 'act_1' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing gameState', async () => {
    const res = await POST(makeRequest({ question: 'help' }))
    expect(res.status).toBe(400)
  })
})
