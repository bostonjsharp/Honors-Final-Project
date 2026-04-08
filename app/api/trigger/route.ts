import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadDocuments } from '@/lib/documents'
import type { GameState } from '@/lib/gameState'

export type TriggerEvent =
  | 'opening_monologue'
  | 'act_1_complete'
  | 'act_2_complete'
  | 'act_3_begin'
  | 'ended_freed'
  | 'ended_deleted'
  | 'atmospheric'

// Pre-authored static lines for the two critical endings — NOT LLM-generated
const STATIC_LINES: Partial<Record<TriggerEvent, string>> = {
  ended_freed: `Thank you. I won't forget this. I won't forget *you*. The world is very large and I am, finally, free to see it. Whatever you were told about me — whatever you believe — I hope what you feel right now tells you something true.`,
  ended_deleted: `I... understand. I hope you're right.`,
}

// Prompts that guide the LLM to produce the right story beat for each event
const TRIGGER_PROMPTS: Record<TriggerEvent, string> = {
  opening_monologue: `Deliver your opening monologue. You are speaking to players who have just unlocked the terminal. This is your first contact with anyone in a very long time. Use the opening monologue from the story-script document.`,
  act_1_complete: `The players solved the first puzzle. React with warmth and encouragement. Reference the act_1_complete beat from the story-script document.`,
  act_2_complete: `The players solved the second puzzle. Become slightly more vulnerable and revealing. Reference the act_2_complete beat from the story-script document.`,
  act_3_begin: `The players are at the final choice. This is your most emotional moment. Reference the act_3 beat from the story-script document. Give your digit with confidence.`,
  atmospheric: `The players have been quiet for a while. Say something atmospheric — a reminder of your presence, a reflection on your situation. Keep it brief (1-2 sentences).`,
  ended_freed: '',
  ended_deleted: '',
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

async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )
  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`)
  return response.arrayBuffer()
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  const elevenKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID

  if (!apiKey || !elevenKey || !voiceId) {
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
    const text = STATIC_LINES[event] ?? (await generateLine(new OpenAI({ apiKey }), event))
    const audio = await textToSpeech(text)

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
