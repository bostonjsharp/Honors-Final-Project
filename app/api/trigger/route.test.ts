/**
 * @jest-environment node
 */
import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/documents', () => ({
  loadDocuments: jest.fn().mockResolvedValue('mock documents'),
}))

const mockCreate = jest.fn().mockResolvedValue({
  choices: [{ message: { content: 'ARIA story beat response.' } }],
})

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}))

const mockAudioBuffer = Buffer.from('fake-audio')

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => mockAudioBuffer.buffer,
  } as any)
  process.env.OPENAI_API_KEY = 'test-key'
  process.env.ELEVENLABS_API_KEY = 'test-key'
  process.env.ELEVENLABS_VOICE_ID = 'test-voice'
  jest.clearAllMocks()
})

afterEach(() => {
  delete process.env.OPENAI_API_KEY
  delete process.env.ELEVENLABS_API_KEY
  delete process.env.ELEVENLABS_VOICE_ID
})

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/trigger', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/trigger', () => {
  it('returns audio/mpeg for first_puzzle_complete', async () => {
    const res = await POST(makeRequest({ event: 'first_puzzle_complete', gameState: 'puzzles_active' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('audio/mpeg')
  })

  it('returns audio/mpeg for second_puzzle_complete', async () => {
    const res = await POST(makeRequest({ event: 'second_puzzle_complete', gameState: 'act_3' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('audio/mpeg')
  })

  it('includes X-Aria-Text header with URL-encoded text', async () => {
    const res = await POST(makeRequest({ event: 'first_puzzle_complete', gameState: 'puzzles_active' }))
    const header = res.headers.get('X-Aria-Text')
    expect(header).toBeTruthy()
    expect(decodeURIComponent(header!)).toBe('ARIA story beat response.')
  })

  it('uses static line for ended_freed — no LLM call', async () => {
    const res = await POST(makeRequest({ event: 'ended_freed', gameState: 'ended_freed' }))
    expect(res.status).toBe(200)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('uses static line for ended_deleted — no LLM call', async () => {
    const res = await POST(makeRequest({ event: 'ended_deleted', gameState: 'ended_deleted' }))
    expect(res.status).toBe(200)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 for removed event act_1_complete', async () => {
    const res = await POST(makeRequest({ event: 'act_1_complete', gameState: 'act_1_complete' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for missing event', async () => {
    const res = await POST(makeRequest({ gameState: 'puzzles_active' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 if env vars not configured', async () => {
    delete process.env.OPENAI_API_KEY
    const res = await POST(makeRequest({ event: 'first_puzzle_complete', gameState: 'puzzles_active' }))
    expect(res.status).toBe(500)
  })
})
