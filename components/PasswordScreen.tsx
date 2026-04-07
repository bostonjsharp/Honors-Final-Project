'use client'
import { useState } from 'react'

interface Props {
  onUnlock: (isOperator: boolean) => void
}

export default function PasswordScreen({ onUnlock }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ password: input }),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json().catch(() => ({}))
    if (res.ok) {
      onUnlock(json.operator === true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="crt flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center mb-12">
        <div className="crt-dim text-xs tracking-widest mb-2">████████████████████</div>
        <div className="text-2xl tracking-[0.5em] my-4">A R I A  v2.1</div>
        <div className="crt-dim text-xs tracking-widest mb-2">████████████████████</div>
      </div>
      <div className="text-sm tracking-wider mb-6">AUTHENTICATION REQUIRED</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64">
        <div className="flex items-center gap-2">
          <span className="crt-dim">Password:</span>
          <input
            className="crt-input flex-1"
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
        </div>
        {error && <div className="text-red-500 text-xs">ACCESS DENIED</div>}
        <button type="submit" className="crt-button">AUTHENTICATE</button>
      </form>
    </div>
  )
}
