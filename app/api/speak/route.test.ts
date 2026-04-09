/**
 * @jest-environment node
 */
import { POST } from './route'
import { NextRequest } from 'next/server'

const mockAudioBuffer = Buffer.from('fake-audio-data')

const mockSpeechCreate = jest.fn().mockResolvedValue({
  arrayBuffer: async () => mockAudioBuffer.buffer,
})

jest.mock('openai', () =>
  jest.fn().mockImplementation(() => ({
    audio: { speech: { create: mockSpeechCreate } },
  }))
)

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => mockAudioBuffer.buffer,
  } as any)
  process.env.ELEVENLABS_API_KEY = 'test-key'
  process.env.ELEVENLABS_VOICE_ID = 'test-voice-id'
  process.env.OPENAI_API_KEY = 'test-openai-key'
  // Restore OpenAI mock in case a previous test cleared it
  mockSpeechCreate.mockResolvedValue({ arrayBuffer: async () => mockAudioBuffer.buffer })
})

afterEach(() => {
  jest.clearAllMocks()
  delete process.env.ELEVENLABS_API_KEY
  delete process.env.ELEVENLABS_VOICE_ID
  delete process.env.OPENAI_API_KEY
})

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/speak', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/speak', () => {
  it('returns audio/mpeg response on valid text', async () => {
    const res = await POST(makeRequest({ text: 'Hello world' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('audio/mpeg')
  })

  it('calls ElevenLabs with eleven_flash_v2_5 model when configured', async () => {
    await POST(makeRequest({ text: 'Hello world' }))
    const call = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.model_id).toBe('eleven_flash_v2_5')
  })

  it('returns 400 for missing text', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('falls back to OpenAI TTS when ElevenLabs returns an error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 402 })
    const res = await POST(makeRequest({ text: 'Hello' }))
    expect(res.status).toBe(200)
    expect(mockSpeechCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'tts-1', input: 'Hello' })
    )
  })

  it('returns 500 if no TTS provider is configured', async () => {
    delete process.env.ELEVENLABS_API_KEY
    delete process.env.OPENAI_API_KEY
    const res = await POST(makeRequest({ text: 'Hello' }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('No TTS provider configured')
  })
})
