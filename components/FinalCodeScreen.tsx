'use client'
import { useState } from 'react'

interface Props {
  puzzle1Answer: string
  puzzle2Answer: string
  error?: string | null
  onSubmit: (finalPiece: string) => void
}

export default function FinalCodeScreen({ puzzle1Answer, puzzle2Answer, error, onSubmit }: Props) {
  const [finalPiece, setFinalPiece] = useState('')
  const [localError, setLocalError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = finalPiece.trim()
    if (!trimmed) {
      setLocalError(true)
      return
    }
    setLocalError(false)
    onSubmit(trimmed)
  }

  return (
    <div className="p-4 border-t border-green-900">
      <div className="crt-dim text-xs mb-3 tracking-wider">PUZZLE 3 — ENTER FINAL CODE:</div>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="tracking-widest text-lg opacity-70">{puzzle1Answer}</span>
          <span className="crt-dim text-lg">—</span>
          <span className="tracking-widest text-lg opacity-70">{puzzle2Answer}</span>
          <span className="crt-dim text-lg">—</span>
          <input
            className="crt-input w-28 text-lg tracking-widest"
            value={finalPiece}
            onChange={e => setFinalPiece(e.target.value)}
            placeholder="_ _ _ _"
            maxLength={10}
            autoFocus
          />
          <button type="submit" className="crt-button">SUBMIT</button>
        </div>
        {localError && (
          <div className="text-red-500 text-xs mt-1">ENTER THE FINAL PIECE</div>
        )}
        {error && !localError && (
          <div className="text-red-500 text-xs mt-1">{error}</div>
        )}
      </form>
    </div>
  )
}
