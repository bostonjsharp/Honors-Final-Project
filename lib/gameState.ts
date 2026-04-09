export type GameState =
  | 'terminal_locked'
  | 'puzzles_active'
  | 'act_3'
  | 'ended_freed'
  | 'ended_deleted'

export function bothPuzzlesSolved(solved: number[]): boolean {
  return solved.includes(1) && solved.includes(2)
}

export function isTerminalUnlocked(state: GameState): boolean {
  return state !== 'terminal_locked'
}

export function isFinalChoice(state: GameState): boolean {
  return state === 'act_3'
}

export function isEnded(state: GameState): boolean {
  return state === 'ended_freed' || state === 'ended_deleted'
}
