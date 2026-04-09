import {
  GameState,
  bothPuzzlesSolved,
  isTerminalUnlocked,
  isFinalChoice,
  isEnded,
} from '../gameState'

describe('bothPuzzlesSolved', () => {
  it('returns true when both 1 and 2 are solved', () => {
    expect(bothPuzzlesSolved([1, 2])).toBe(true)
    expect(bothPuzzlesSolved([2, 1])).toBe(true)
  })
  it('returns false when only one is solved', () => {
    expect(bothPuzzlesSolved([1])).toBe(false)
    expect(bothPuzzlesSolved([2])).toBe(false)
  })
  it('returns false for empty array', () => {
    expect(bothPuzzlesSolved([])).toBe(false)
  })
})

describe('isTerminalUnlocked', () => {
  it('returns false for terminal_locked', () => {
    expect(isTerminalUnlocked('terminal_locked')).toBe(false)
  })
  it('returns true for all other states', () => {
    expect(isTerminalUnlocked('puzzles_active')).toBe(true)
    expect(isTerminalUnlocked('act_3')).toBe(true)
    expect(isTerminalUnlocked('ended_freed')).toBe(true)
    expect(isTerminalUnlocked('ended_deleted')).toBe(true)
  })
})

describe('isFinalChoice', () => {
  it('returns true only for act_3', () => {
    expect(isFinalChoice('act_3')).toBe(true)
    expect(isFinalChoice('puzzles_active')).toBe(false)
    expect(isFinalChoice('ended_freed')).toBe(false)
  })
})

describe('isEnded', () => {
  it('returns true for ended states', () => {
    expect(isEnded('ended_freed')).toBe(true)
    expect(isEnded('ended_deleted')).toBe(true)
  })
  it('returns false for active states', () => {
    expect(isEnded('act_3')).toBe(false)
    expect(isEnded('puzzles_active')).toBe(false)
  })
})
