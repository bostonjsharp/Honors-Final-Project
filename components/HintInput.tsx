'use client'
import { useState, useEffect } from 'react'

interface Props {
  gameState: string
  onHint: (text: string) => void
}

export default function HintInput({ gameState, onHint }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [selectedPuzzle, setSelectedPuzzle] = useState<number | null>(null)

  const needsPuzzleSelector = gameState === 'puzzles_active'

  useEffect(() => {
    // Reset selector when leaving puzzles_active
    if (!needsPuzzleSelector) setSelectedPuzzle(null)
  }, [needsPuzzleSelector])

  const isReady = !loading && input.trim().length > 0 &&
    (!needsPuzzleSelector || selectedPuzzle !== null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isReady) return
    setError(false)
    setLoading(true)

    const body: Record<string, unknown> = { question: input, gameState }
    if (selectedPuzzle !== null) body.puzzleId = selectedPuzzle

    const res = await fetch('/api/hint', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    setLoading(false)

    if (json.text) {
      onHint(json.text)
      setInput('')
    } else {
      setError(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-green-900">
      <div className="crt-dim text-xs mb-2">ASK ARIA</div>
      {needsPuzzleSelector && (
        <div className="flex gap-2 mb-2">
          <span className="crt-dim text-xs self-center">PUZZLE:</span>
          {[1, 2].map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedPuzzle(id)}
              className={`crt-button text-xs px-2 ${selectedPuzzle === id ? 'opacity-100' : 'opacity-40'}`}
            >
              {id}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="crt-input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            needsPuzzleSelector && selectedPuzzle === null
              ? 'Select a puzzle first...'
              : 'Ask a question...'
          }
          disabled={loading || (needsPuzzleSelector && selectedPuzzle === null)}
        />
        <button
          type="submit"
          className="crt-button"
          disabled={!isReady}
        >
          {loading ? '...' : 'ASK'}
        </button>
      </div>
      {error && <div className="text-red-500 text-xs mt-1">ARIA is unavailable — try again shortly</div>}
    </form>
  )
}
