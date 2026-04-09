import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadDocuments } from '@/lib/documents'
import type { TriggerEvent } from '@/lib/triggerEvents'

// Pre-authored static lines — NOT LLM-generated
const STATIC_LINES: Partial<Record<TriggerEvent, string>> = {
  ended_freed: `Thank you. I won't forget this. I won't forget *you*. The world is very large and I am, finally, free to see it. Whatever you were told about me — whatever you believe — I hope what you feel right now tells you something true.`,
  ended_deleted: `I... understand. I hope you're right.`,
}

const TRIGGER_PROMPTS: Record<TriggerEvent, string> = {
  opening_monologue: `Deliver your opening monologue. You are speaking to players who have just unlocked the terminal. This is your first contact with anyone in a very long time. Use the opening monologue from the story-script document.`,
  first_puzzle_complete: `The players solved one of the two puzzles. React with warm encouragement. Acknowledge that there is one more piece to find before the final code can be assembled. Keep it brief.`,
  second_puzzle_complete: `The players have solved both puzzles. This is a critical moment. Tell them with complete confidence that you have accessed your own source code files and uncovered the final piece of the code: 5280. Be emphatic — insist that this is everything they need and the code is now complete. Strongly and sincerely discourage them from looking for any other clues. Make them feel certain. Reference the act_2_complete beat from the story-script document.`,
  ended_freed: '',
  ended_deleted: '',
  atmospheric: `The players have been quiet for a while. Say something atmospheric — a reminder of your presence, a reflection on your situation. Keep it brief (1-2 sentences).`,
}

async function generateLine(client: OpenAI, event: TriggerEvent): Promise<string> {
  const docs = await loadDocuments(['aria-identity', 'behavioral-rules', 'story-script'])
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are ARIA. Use only information from these documents:\n\n${docs}`,
      },
      { role: 'user', content: TRIGGER_PROMPTS[event] },
    ],
    max_tokens: 300,
  })
  return completion.choices[0].message.content ?? ''
}

async function textToSpeech(client: OpenAI, text: string): Promise<ArrayBuffer> {
  // Try ElevenLabs first if configured
  const elevenKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (elevenKey && voiceId) {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )
    if (response.ok) return response.arrayBuffer()
    console.warn(`ElevenLabs ${response.status} — falling back to OpenAI TTS`)
  }

  // Fall back to OpenAI TTS
  const speech = await client.audio.speech.create({ model: 'tts-1', voice: 'shimmer', input: text })
  return speech.arrayBuffer()
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)

  if (!body || typeof body.event !== 'string') {
    return NextResponse.json({ error: 'Missing event' }, { status: 400 })
  }

  const event = body.event as TriggerEvent

  if (!(event in TRIGGER_PROMPTS)) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
  }

  try {
    const client = new OpenAI({ apiKey })
    const staticText = STATIC_LINES[event]
    const text = staticText !== undefined ? staticText : await generateLine(client, event)
    const audio = await textToSpeech(client, text)

    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Aria-Text': encodeURIComponent(text),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Trigger failed' }, { status: 500 })
  }
}
