'use client'
import { useState } from 'react'

interface Props {
  puzzleId: number
  onCorrect: (digit: string, ariaDigit: string | null) => void
}

export default function PuzzleInput({ puzzleId, onCorrect }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/answer', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, answer: input }),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    setLoading(false)

    if (json.valid) {
      onCorrect(json.digit, json.ariaDigit ?? null)
      setInput('')
    } else {
      setError(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-green-900">
      <div className="crt-dim text-xs mb-2">PUZZLE {puzzleId} — ENTER CODE:</div>
      <div className="flex gap-2">
        <input
          className="crt-input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="_ _ _ _ _"
          disabled={loading}
        />
        <button type="submit" className="crt-button" disabled={loading}>
          {loading ? '...' : 'SUBMIT'}
        </button>
      </div>
      {error && <div className="text-red-500 text-xs mt-1">INCORRECT — TRY AGAIN</div>}
    </form>
  )
}
