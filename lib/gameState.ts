export type GameState =
  | 'film_playing'
  | 'terminal_locked'
  | 'act_1'
  | 'act_1_complete'
  | 'act_2'
  | 'act_2_complete'
  | 'act_3'
  | 'ended_freed'
  | 'ended_deleted'

const LINEAR_TRANSITIONS: Partial<Record<GameState, GameState>> = {
  film_playing: 'terminal_locked',
  terminal_locked: 'act_1',
  act_1: 'act_1_complete',
  act_1_complete: 'act_2',
  act_2: 'act_2_complete',
  act_2_complete: 'act_3',
}

export function advanceState(state: GameState): GameState {
  if (state === 'act_3') {
    throw new Error('act_3 branches — use "ended_freed" or "ended_deleted" explicitly')
  }
  if (state === 'ended_freed' || state === 'ended_deleted') return state
  return LINEAR_TRANSITIONS[state]!
}

export function getActivePuzzle(state: GameState): number | null {
  if (state === 'act_1') return 1
  if (state === 'act_2') return 2
  if (state === 'act_3') return 3
  return null
}

export function isTerminalUnlocked(state: GameState): boolean {
  return state !== 'film_playing' && state !== 'terminal_locked'
}

export function isFinalChoice(state: GameState): boolean {
  return state === 'act_3'
}

export function isEnded(state: GameState): boolean {
  return state === 'ended_freed' || state === 'ended_deleted'
}
