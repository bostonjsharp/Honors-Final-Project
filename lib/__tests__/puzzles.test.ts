import { validateAnswer, getHumanDigit, getAriaDigit, PUZZLES } from '../puzzles'

describe('PUZZLES shape', () => {
  it('has exactly 3 puzzles', () => {
    expect(PUZZLES).toHaveLength(3)
  })
  it('puzzle 3 has an ariaDigit', () => {
    const p3 = PUZZLES.find(p => p.id === 3)
    expect(p3?.ariaDigit).toBeDefined()
  })
})

describe('validateAnswer', () => {
  it('returns true for correct answer (case-insensitive, trimmed)', () => {
    const answer = PUZZLES[0].answer
    expect(validateAnswer(1, answer)).toBe(true)
    expect(validateAnswer(1, '  ' + answer.toUpperCase() + '  ')).toBe(true)
  })
  it('returns false for wrong answer', () => {
    expect(validateAnswer(1, 'wrong')).toBe(false)
  })
  it('returns false for unknown puzzle id', () => {
    expect(validateAnswer(99, 'anything')).toBe(false)
  })
})

describe('getHumanDigit', () => {
  it('returns the digit for a valid puzzle', () => {
    expect(getHumanDigit(1)).toBe(PUZZLES[0].humanDigit)
  })
  it('returns null for unknown puzzle', () => {
    expect(getHumanDigit(99)).toBeNull()
  })
})

describe('getAriaDigit', () => {
  it('returns ariaDigit for puzzle 3', () => {
    expect(getAriaDigit(3)).toBe(PUZZLES[2].ariaDigit)
  })
  it('returns null for puzzles 1 and 2', () => {
    expect(getAriaDigit(1)).toBeNull()
    expect(getAriaDigit(2)).toBeNull()
  })
})
