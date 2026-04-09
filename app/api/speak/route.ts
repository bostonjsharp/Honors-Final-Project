import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Voice used for OpenAI TTS. Options: alloy, echo, fable, onyx, nova, shimmer.
// 'shimmer' is soft and measured — a good fit for ARIA's character.
const OPENAI_VOICE = 'shimmer'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.text !== 'string' || !body.text.trim()) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  }

  const text: string = body.text

  // --- ElevenLabs (preferred when configured) ---
  const elevenKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID

  if (elevenKey && voiceId) {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    if (response.ok) {
      const audio = await response.arrayBuffer()
      return new NextResponse(audio, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      })
    }

    // ElevenLabs failed — fall through to OpenAI TTS
    console.warn(`ElevenLabs ${response.status} — falling back to OpenAI TTS`)
  }

  // --- OpenAI TTS (fallback / default) ---
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return NextResponse.json({ error: 'No TTS provider configured' }, { status: 500 })
  }

  try {
    const openai = new OpenAI({ apiKey: openaiKey })
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: OPENAI_VOICE,
      input: text,
    })
    const audio = await speech.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  } catch (err) {
    console.error('OpenAI TTS error:', err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
