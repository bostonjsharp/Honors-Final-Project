'use client'
import { useEffect, useRef } from 'react'

export interface TranscriptEntry {
  id: string
  text: string
  speaker?: string   // defaults to 'ARIA' when omitted
  timestamp: Date
}

interface Props {
  entries: TranscriptEntry[]
}

export default function Transcript({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {entries.map(entry => (
        <div key={entry.id}>
          <span className="crt-dim text-xs">
            [{entry.timestamp.toLocaleTimeString()}] {entry.speaker ?? 'ARIA'} &gt;&nbsp;
          </span>
          <span>{entry.text}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
