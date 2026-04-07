import { NextRequest, NextResponse } from 'next/server'
import { loadDocuments, DocumentName } from '@/lib/documents'
import type { GameState } from '@/lib/gameState'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const openaiModule = require('openai')
const OpenAI = openaiModule.default ?? openaiModule

function getDocsForState(state: GameState): DocumentName[] {
  const base: DocumentName[] = ['aria-identity', 'behavioral-rules']
  if (state === 'act_1' || state === 'act_1_complete') {
    return [...base, 'puzzle-hints']
  }
  if (state === 'act_2' || state === 'act_2_complete') {
    return [...base, 'puzzle-hints', 'director-notes']
  }
  if (state === 'act_3') {
    return [...base, 'puzzle-hints', 'director-notes', 'story-script']
  }
  return base
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.question !== 'string' || !body.question.trim()) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
  }
  if (!body.gameState) {
    return NextResponse.json({ error: 'Missing gameState' }, { status: 400 })
  }

  const docs = await loadDocuments(getDocsForState(body.gameState as GameState))

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are ARIA. Respond in character using only the information in the documents below. Keep responses concise — they will be spoken aloud.\n\n${docs}`,
      },
      { role: 'user', content: body.question },
    ],
    max_tokens: 200,
  })

  const text = completion.choices[0].message.content ?? ''
  return NextResponse.json({ text })
}
