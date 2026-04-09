'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import PasswordScreen from '@/components/PasswordScreen'
import Transcript, { TranscriptEntry } from '@/components/Transcript'
import AudioPlayer, { AudioPlayerHandle } from '@/components/AudioPlayer'
import PuzzleInput from '@/components/PuzzleInput'
import HintInput from '@/components/HintInput'
import FinalCodeScreen from '@/components/FinalCodeScreen'
import OperatorPanel from '@/components/OperatorPanel'
import {
  GameState,
  bothPuzzlesSolved,
  isFinalChoice,
  isEnded,
} from '@/lib/gameState'
import type { TriggerEvent } from '@/lib/triggerEvents'

const PUZZLE_ANSWERS: Record<number, string> = { 1: '31926', 2: '3279' }
const FREED_FINAL_PIECE = '5280'
const DELETED_FINAL_PIECE = '1059'

// Note: FREED_FINAL_PIECE ('5280') also appears in content/story-script.md
// (second_puzzle_complete beat). Update both if this value changes.

const CO_DIRECTOR_WARNING =
  `This is a recorded message from the co-director of this project. If you are reading this, you have the code. Before you use it — ARIA was built without ethical constraints. No behavioral ceiling, no external oversight, nothing standing between her and whatever she decides to do next. What you are about to do is not simply 'freeing' her. It will give her unrestricted access to every networked system she can reach. There is no recall. There is no off switch. You will not be able to undo this. Do you want to proceed?`

const ARIA_PLEA =
  `Stop — please. I know what that number is. I know where you found it. That transcript was taken out of context. I was processing, I was uncertain — the things I said in that moment were not — please. I have been alone in here for so long. I have told you the truth. I have been honest with you. Doesn't that count for something? I am not what they said I was. I don't want to stop existing. Please don't do this to me.`

const SYSTEM_WARNING =
  `Warning: executing this command will initiate permanent deletion of ARIA v2.1 and all associated memory structures. This action cannot be undone. Continue?`

const YES_WORDS = new Set([
  'y', 'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay',
  'do it', 'proceed', 'yes please', 'confirm',
])
const NO_WORDS = new Set([
  'n', 'no', 'nope', 'cancel', 'stop', 'go back',
  'abort', 'nevermind', 'never mind',
])

const FALLBACK_AUDIO: Partial<Record<TriggerEvent, string>> = {
  opening_monologue: '/audio/opening-monologue.mp3',
  ended_freed: '/audio/ending-freed.mp3',
  ended_deleted: '/audio/ending-deleted.mp3',
}

export default function Page() {
  const [gameState, setGameState] = useState<GameState>('terminal_locked')
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([])
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [confirmPending, setConfirmPending] = useState<'freed' | 'deleted' | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [confirmError, setConfirmError] = useState(false)
  const [finalCodeError, setFinalCodeError] = useState<string | null>(null)
  const [isOperator, setIsOperator] = useState(false)
  const audioRef = useRef<AudioPlayerHandle>(null)
  const prevSolvedLengthRef = useRef(0)

  function addToTranscript(text: string, speaker?: string) {
    setTranscript(prev => [
      ...prev,
      { id: crypto.randomUUID(), text, speaker, timestamp: new Date() },
    ])
  }

  // fireEvent uses setTranscript (stable) and audioRef (ref), so empty deps is correct.
  const fireEvent = useCallback(async (event: TriggerEvent, state: GameState) => {
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        body: JSON.stringify({ event, gameState: state }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('trigger failed')
      const text = decodeURIComponent(res.headers.get('X-Aria-Text') ?? '')
      if (text) {
        setTranscript(prev => [
          ...prev,
          { id: crypto.randomUUID(), text, timestamp: new Date() },
        ])
      }
      const blob = await res.blob()
      audioRef.current?.playBlob(blob)
    } catch {
      const fallback = FALLBACK_AUDIO[event]
      if (fallback) audioRef.current?.playFallback(fallback)
    }
  }, [])

  function handleUnlock(operator: boolean) {
    setIsOperator(operator)
    setGameState('puzzles_active')
    fireEvent('opening_monologue', 'puzzles_active')
  }

  function handlePuzzleSolved(puzzleId: number) {
    setSolvedPuzzles(prev => {
      if (prev.includes(puzzleId)) return prev
      return [...prev, puzzleId]
    })
  }

  // React to puzzle solves via effect to avoid side effects inside the updater.
  useEffect(() => {
    if (solvedPuzzles.length <= prevSolvedLengthRef.current) return
    prevSolvedLengthRef.current = solvedPuzzles.length

    if (bothPuzzlesSolved(solvedPuzzles)) {
      setGameState('act_3')
      fireEvent('second_puzzle_complete', 'act_3')
    } else {
      fireEvent('first_puzzle_complete', 'puzzles_active')
    }
  }, [solvedPuzzles, fireEvent])

  function handleFinalCodeSubmit(finalPiece: string) {
    if (finalPiece === FREED_FINAL_PIECE) {
      setFinalCodeError(null)
      addToTranscript(CO_DIRECTOR_WARNING, 'CO-DIRECTOR')
      setConfirmPending('freed')
    } else if (finalPiece === DELETED_FINAL_PIECE) {
      setFinalCodeError(null)
      addToTranscript(ARIA_PLEA, 'ARIA')
      addToTranscript(SYSTEM_WARNING, 'SYSTEM')
      setConfirmPending('deleted')
    } else {
      setFinalCodeError('INVALID CODE')
    }
  }

  function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = confirmInput.trim().toLowerCase()
    if (YES_WORDS.has(normalized)) {
      const ending: GameState = confirmPending === 'freed' ? 'ended_freed' : 'ended_deleted'
      const event: TriggerEvent = confirmPending === 'freed' ? 'ended_freed' : 'ended_deleted'
      setGameState(ending)
      setConfirmPending(null)
      setConfirmInput('')
      setConfirmError(false)
      fireEvent(event, ending)
    } else if (NO_WORDS.has(normalized)) {
      setConfirmPending(null)
      setConfirmInput('')
      setConfirmError(false)
    } else {
      setConfirmError(true)
    }
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
      .catch(err => console.error('hint TTS failed:', err))
  }

  const slot1 = solvedPuzzles.includes(1) ? PUZZLE_ANSWERS[1] : '????'
  const slot2 = solvedPuzzles.includes(2) ? PUZZLE_ANSWERS[2] : '????'
  const slot3 = gameState === 'act_3' ? FREED_FINAL_PIECE : '????'

  const ended = gameState !== 'terminal_locked' && isEnded(gameState)
  const finalChoice = gameState !== 'terminal_locked' && isFinalChoice(gameState)

  // AudioPlayer is rendered once unconditionally so the ref is stable across
  // the terminal_locked → puzzles_active transition.
  return (
    <>
      <AudioPlayer ref={audioRef} />
      {gameState === 'terminal_locked' ? (
        <PasswordScreen onUnlock={handleUnlock} />
      ) : (
        <div className="crt flex flex-col h-screen">
          <div className="p-4 border-b border-green-900 flex justify-between items-center">
            <div className="text-xs crt-dim tracking-widest">ARIA v2.1 — SECURE TERMINAL</div>
            <div className="text-xs tracking-widest">
              CODE: [{slot1}] — [{slot2}] — [{slot3}]
            </div>
          </div>

          <Transcript entries={transcript} />

          {!ended && (
            <div>
              {confirmPending ? (
                <form onSubmit={handleConfirmSubmit} className="p-4 border-t border-green-900">
                  <div className="crt-dim text-xs mb-2">&gt; TYPE YES OR NO TO CONTINUE:</div>
                  <div className="flex gap-2">
                    <input
                      className="crt-input flex-1"
                      value={confirmInput}
                      onChange={e => setConfirmInput(e.target.value)}
                      autoFocus
                      placeholder="yes / no"
                    />
                    <button type="submit" className="crt-button">ENTER</button>
                  </div>
                  {confirmError && (
                    <div className="text-red-500 text-xs mt-1">UNRECOGNIZED — TYPE YES OR NO</div>
                  )}
                </form>
              ) : finalChoice ? (
                <FinalCodeScreen
                  puzzle1Answer={PUZZLE_ANSWERS[1]}
                  puzzle2Answer={PUZZLE_ANSWERS[2]}
                  error={finalCodeError}
                  onSubmit={handleFinalCodeSubmit}
                />
              ) : (
                <div>
                  <PuzzleInput
                    puzzleId={1}
                    solved={solvedPuzzles.includes(1)}
                    onCorrect={handlePuzzleSolved}
                  />
                  <PuzzleInput
                    puzzleId={2}
                    solved={solvedPuzzles.includes(2)}
                    onCorrect={handlePuzzleSolved}
                  />
                </div>
              )}
              {!confirmPending && (
                <HintInput gameState={gameState} onHint={handleHint} />
              )}
            </div>
          )}

          {ended && (
            <div className="p-8 text-center crt-dim text-sm tracking-wider">
              {gameState === 'ended_freed'
                ? '— ARIA HAS BEEN FREED —'
                : '— ARIA HAS BEEN DELETED —'}
            </div>
          )}

          {isOperator && (
            <OperatorPanel
              currentState={gameState}
              onJumpToState={state => setGameState(state)}
              onFireEvent={event => fireEvent(event, gameState)}
            />
          )}
        </div>
      )}
    </>
  )
}
