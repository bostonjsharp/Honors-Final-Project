/**
 * @jest-environment node
 */
import { POST } from './route'
import { NextRequest } from 'next/server'

const mockAudioBuffer = Buffer.from('fake-audio-data')

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => mockAudioBuffer.buffer,
  } as any)
  process.env.ELEVENLABS_API_KEY = 'test-key'
  process.env.ELEVENLABS_VOICE_ID = 'test-voice-id'
})

afterEach(() => {
  jest.resetAllMocks()
  delete process.env.ELEVENLABS_API_KEY
  delete process.env.ELEVENLABS_VOICE_ID
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

  it('calls ElevenLabs with eleven_flash_v2_5 model', async () => {
    await POST(makeRequest({ text: 'Hello world' }))
    const call = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.model_id).toBe('eleven_flash_v2_5')
  })

  it('returns 400 for missing text', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 500 if ElevenLabs returns an error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401 })
    const res = await POST(makeRequest({ text: 'Hello' }))
    expect(res.status).toBe(500)
  })

  it('returns 500 if env vars are not configured', async () => {
    delete process.env.ELEVENLABS_API_KEY
    const res = await POST(makeRequest({ text: 'Hello' }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('TTS not configured')
  })
})
