'use client'
import { useState } from 'react'

interface Props {
  puzzleId: number
  codeLength: number
  solved: boolean
  onCorrect: (puzzleId: number) => void
}

export default function PuzzleInput({ puzzleId, codeLength, solved, onCorrect }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  if (solved) {
    return (
      <div className="p-4 border-t border-green-900 opacity-50">
        <div className="crt-dim text-xs tracking-wider">PUZZLE {puzzleId} — SOLVED ✓</div>
      </div>
    )
  }

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
      onCorrect(puzzleId)
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
          placeholder={Array.from({ length: codeLength }, () => '_').join(' ')}
          maxLength={codeLength}
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
