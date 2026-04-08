'use client'
import type { GameState } from '@/lib/gameState'
import type { TriggerEvent } from '@/lib/triggerEvents'

const ALL_STATES: GameState[] = [
  'terminal_locked', 'act_1', 'act_1_complete',
  'act_2', 'act_2_complete', 'act_3', 'ended_freed', 'ended_deleted',
]

const EVENTS: TriggerEvent[] = [
  'opening_monologue', 'act_1_complete', 'act_2_complete',
  'act_3_begin', 'ended_freed', 'ended_deleted', 'atmospheric',
]

interface Props {
  currentState: GameState
  onJumpToState: (state: GameState) => void
  onFireEvent: (event: TriggerEvent) => void
}

export default function OperatorPanel({ currentState, onJumpToState, onFireEvent }: Props) {
  return (
    <div className="fixed bottom-0 right-0 bg-black border border-yellow-500 text-yellow-500 p-4 text-xs w-72 z-50 font-mono">
      <div className="font-bold tracking-widest mb-2">OPERATOR PANEL</div>
      <div className="mb-1 opacity-60">Current: {currentState}</div>

      <div className="mb-3">
        <div className="mb-1 opacity-60">Jump to state:</div>
        <div className="flex flex-wrap gap-1">
          {ALL_STATES.map(s => (
            <button
              key={s}
              onClick={() => onJumpToState(s)}
              className="border border-yellow-500 px-1 py-0.5 hover:bg-yellow-500 hover:text-black text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 opacity-60">Fire event:</div>
        <div className="flex flex-wrap gap-1">
          {EVENTS.map(e => (
            <button
              key={e}
              onClick={() => onFireEvent(e)}
              className="border border-yellow-500 px-1 py-0.5 hover:bg-yellow-500 hover:text-black text-xs"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
