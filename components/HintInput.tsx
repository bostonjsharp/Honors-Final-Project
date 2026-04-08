'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

interface Props {
  gameState: string
  onHint: (text: string) => void
}

const COOLDOWN_SECONDS = 30

export default function HintInput({ gameState, onHint }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS)
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || cooldown > 0) return
    setError(false)
    setLoading(true)

    const res = await fetch('/api/hint', {
      method: 'POST',
      body: JSON.stringify({ question: input, gameState }),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    setLoading(false)

    if (json.text) {
      onHint(json.text)
      setInput('')
      startCooldown()
    } else {
      setError(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-green-900">
      <div className="crt-dim text-xs mb-2">
        ASK ARIA {cooldown > 0 ? `— COOLDOWN: ${cooldown}s` : ''}
      </div>
      <div className="flex gap-2">
        <input
          className="crt-input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading || cooldown > 0}
        />
        <button
          type="submit"
          className="crt-button"
          disabled={loading || cooldown > 0 || !input.trim()}
        >
          {loading ? '...' : 'ASK'}
        </button>
      </div>
      {error && <div className="text-red-500 text-xs mt-1">ARIA is unavailable — try again shortly</div>}
    </form>
  )
}
