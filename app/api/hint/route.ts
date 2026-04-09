import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadDocuments, DocumentName } from '@/lib/documents'
import type { GameState } from '@/lib/gameState'

function getDocsForState(state: GameState): DocumentName[] {
  const base: DocumentName[] = ['aria-identity', 'behavioral-rules']
  if (state === 'puzzles_active') {
    return [...base, 'puzzle-hints']
  }
  if (state === 'act_3') {
    return [...base, 'puzzle-hints', 'director-notes', 'story-script']
  }
  return base
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'LLM not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)

  if (!body || typeof body.question !== 'string' || !body.question.trim()) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
  }
  if (!body.gameState) {
    return NextResponse.json({ error: 'Missing gameState' }, { status: 400 })
  }

  const puzzleId: number | undefined =
    typeof body.puzzleId === 'number' ? body.puzzleId : undefined

  const puzzleScope = puzzleId
    ? `The player is asking about Puzzle ${puzzleId} specifically. Only reference hints for Puzzle ${puzzleId}.`
    : ''

  const previousHints: string[] = Array.isArray(body.previousHints) ? body.previousHints : []

  const client = new OpenAI({ apiKey })
  const docs = await loadDocuments(getDocsForState(body.gameState as GameState))

  // Build conversation history so the LLM avoids repeating earlier hints.
  const historyMessages = previousHints.flatMap(h => [
    { role: 'user' as const, content: '(player asked for a hint)' },
    { role: 'assistant' as const, content: h },
  ])

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are ARIA. Respond in character using only the information in the documents below. Keep responses concise — they will be spoken aloud. Each hint should be slightly more specific than the last. ${puzzleScope}\n\n${docs}`,
        },
        ...historyMessages,
        { role: 'user', content: body.question },
      ],
      max_tokens: 200,
    })

    const text = completion.choices[0].message.content ?? ''
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Hint generation failed' }, { status: 500 })
  }
}
