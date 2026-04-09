import { validateAnswer, PUZZLES } from '../puzzles'

describe('PUZZLES shape', () => {
  it('has exactly 2 puzzles', () => {
    expect(PUZZLES).toHaveLength(2)
  })
  it('puzzle ids are 1 and 2', () => {
    expect(PUZZLES.map(p => p.id)).toEqual([1, 2])
  })
  it('has no digit fields', () => {
    PUZZLES.forEach(p => {
      expect((p as any).humanDigit).toBeUndefined()
      expect((p as any).ariaDigit).toBeUndefined()
    })
  })
})

describe('validateAnswer', () => {
  it('returns true for puzzle 1 correct answer', () => {
    expect(validateAnswer(1, '31926')).toBe(true)
  })
  it('returns true for puzzle 2 correct answer', () => {
    expect(validateAnswer(2, '3279')).toBe(true)
  })
  it('returns true for trimmed input', () => {
    expect(validateAnswer(1, '  31926  ')).toBe(true)
  })
  it('returns false for wrong answer', () => {
    expect(validateAnswer(1, '99999')).toBe(false)
  })
  it('returns false for unknown puzzle id', () => {
    expect(validateAnswer(99, 'anything')).toBe(false)
  })
})
