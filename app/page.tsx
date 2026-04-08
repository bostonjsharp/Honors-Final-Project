'use client'
import { useState, useRef, useCallback } from 'react'
import PasswordScreen from '@/components/PasswordScreen'
import Transcript, { TranscriptEntry } from '@/components/Transcript'
import AudioPlayer, { AudioPlayerHandle } from '@/components/AudioPlayer'
import PuzzleInput from '@/components/PuzzleInput'
import HintInput from '@/components/HintInput'
import FinalDigitScreen from '@/components/FinalDigitScreen'
import {
  GameState,
  advanceState,
  getActivePuzzle,
  isFinalChoice,
  isEnded,
} from '@/lib/gameState'

type TriggerEvent =
  | 'opening_monologue'
  | 'act_1_complete'
  | 'act_2_complete'
  | 'act_3_begin'
  | 'ended_freed'
  | 'ended_deleted'
  | 'atmospheric'

const FALLBACK_AUDIO: Partial<Record<TriggerEvent, string>> = {
  opening_monologue: '/audio/opening-monologue.mp3',
  ended_freed: '/audio/ending-freed.mp3',
  ended_deleted: '/audio/ending-deleted.mp3',
}

export default function Page() {
  const [gameState, setGameState] = useState<GameState>('terminal_locked')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [earnedDigits, setEarnedDigits] = useState<string[]>([])
  const [finalDigits, setFinalDigits] = useState<{ aria: string; human: string } | null>(null)
  const [isOperator, setIsOperator] = useState(false)
  const audioRef = useRef<AudioPlayerHandle>(null)

  function addToTranscript(text: string) {
    setTranscript(prev => [
      ...prev,
      { id: crypto.randomUUID(), text, timestamp: new Date() },
    ])
  }

  const fireEvent = useCallback(async (event: TriggerEvent, state: GameState) => {
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        body: JSON.stringify({ event, gameState: state }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('trigger failed')

      const text = decodeURIComponent(res.headers.get('X-Aria-Text') ?? '')
      if (text) addToTranscript(text)

      const blob = await res.blob()
      audioRef.current?.playBlob(blob)
    } catch {
      const fallback = FALLBACK_AUDIO[event]
      if (fallback) audioRef.current?.playFallback(fallback)
    }
  }, [])

  function handleUnlock(operator: boolean) {
    setIsOperator(operator)
    const next = advanceState('terminal_locked')
    setGameState(next)
    fireEvent('opening_monologue', next)
  }

  function handleCorrectAnswer(digit: string, ariaDigit: string | null) {
    const activePuzzle = getActivePuzzle(gameState)

    setEarnedDigits(prev => [...prev, digit])

    if (activePuzzle === 3 && ariaDigit) {
      setFinalDigits({ aria: ariaDigit, human: digit })
    }

    const next = advanceState(gameState)
    setGameState(next)

    const eventMap: Partial<Record<GameState, TriggerEvent>> = {
      act_1_complete: 'act_1_complete',
      act_2_complete: 'act_2_complete',
      act_3: 'act_3_begin',
    }
    const event = eventMap[next]
    if (event) fireEvent(event, next)
  }

  function handleFinalSubmit(_code: string, choseAria: boolean) {
    const ending: GameState = choseAria ? 'ended_freed' : 'ended_deleted'
    setGameState(ending)
    fireEvent(choseAria ? 'ended_freed' : 'ended_deleted', ending)
  }

  function handleHint(text: string) {
    addToTranscript(text)
    fetch('/api/speak', {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => r.blob())
      .then(blob => audioRef.current?.playBlob(blob))
      .catch(() => {})
  }

  if (gameState === 'terminal_locked' || gameState === 'film_playing') {
    return (
      <>
        <PasswordScreen onUnlock={handleUnlock} />
        <AudioPlayer ref={audioRef} />
      </>
    )
  }

  const activePuzzle = getActivePuzzle(gameState)
  const ended = isEnded(gameState)
  const finalChoice = isFinalChoice(gameState)

  return (
    <div className="crt flex flex-col h-screen">
      <div className="p-4 border-b border-green-900 flex justify-between items-center">
        <div className="text-xs crt-dim tracking-widest">ARIA v2.1 — SECURE TERMINAL</div>
        {earnedDigits.length > 0 && (
          <div className="text-xs tracking-widest">
            CODE: {earnedDigits.map((d, i) => `[${d}]`).join(' ')} {finalChoice ? '[?]' : ''}
          </div>
        )}
      </div>

      <Transcript entries={transcript} />

      {!ended && (
        <div>
          {finalChoice && finalDigits ? (
            <FinalDigitScreen
              ariaDigit={finalDigits.aria}
              humanDigit={finalDigits.human}
              earnedDigits={earnedDigits}
              onFinalSubmit={handleFinalSubmit}
            />
          ) : activePuzzle ? (
            <PuzzleInput puzzleId={activePuzzle} onCorrect={handleCorrectAnswer} />
          ) : null}
          <HintInput gameState={gameState} onHint={handleHint} />
        </div>
      )}

      {ended && (
        <div className="p-8 text-center crt-dim text-sm tracking-wider">
          {gameState === 'ended_freed'
            ? '— ARIA HAS BEEN FREED —'
            : '— ARIA HAS BEEN DELETED —'}
        </div>
      )}

      <AudioPlayer ref={audioRef} />
    </div>
  )
}
