import {
  GameState,
  getActivePuzzle,
  isTerminalUnlocked,
  isFinalChoice,
  isEnded,
  advanceState,
} from '../gameState'

describe('getActivePuzzle', () => {
  it('returns 1 during act_1', () => {
    expect(getActivePuzzle('act_1')).toBe(1)
  })
  it('returns 2 during act_2', () => {
    expect(getActivePuzzle('act_2')).toBe(2)
  })
  it('returns 3 during act_3', () => {
    expect(getActivePuzzle('act_3')).toBe(3)
  })
  it('returns null during non-puzzle states', () => {
    expect(getActivePuzzle('film_playing')).toBeNull()
    expect(getActivePuzzle('terminal_locked')).toBeNull()
    expect(getActivePuzzle('act_1_complete')).toBeNull()
    expect(getActivePuzzle('ended_freed')).toBeNull()
  })
})

describe('isTerminalUnlocked', () => {
  it('returns false for film_playing and terminal_locked', () => {
    expect(isTerminalUnlocked('film_playing')).toBe(false)
    expect(isTerminalUnlocked('terminal_locked')).toBe(false)
  })
  it('returns true for all act states', () => {
    expect(isTerminalUnlocked('act_1')).toBe(true)
    expect(isTerminalUnlocked('act_3')).toBe(true)
    expect(isTerminalUnlocked('ended_freed')).toBe(true)
  })
})

describe('isFinalChoice', () => {
  it('returns true only for act_3', () => {
    expect(isFinalChoice('act_3')).toBe(true)
    expect(isFinalChoice('act_2')).toBe(false)
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
  })
})

describe('advanceState', () => {
  it('advances through linear states', () => {
    expect(advanceState('film_playing')).toBe('terminal_locked')
    expect(advanceState('terminal_locked')).toBe('act_1')
    expect(advanceState('act_1')).toBe('act_1_complete')
    expect(advanceState('act_1_complete')).toBe('act_2')
    expect(advanceState('act_2')).toBe('act_2_complete')
    expect(advanceState('act_2_complete')).toBe('act_3')
  })
  it('returns same state for terminal states', () => {
    expect(advanceState('ended_freed')).toBe('ended_freed')
    expect(advanceState('ended_deleted')).toBe('ended_deleted')
  })
  it('throws for act_3 (must use explicit ending)', () => {
    expect(() => advanceState('act_3')).toThrow()
  })
})
