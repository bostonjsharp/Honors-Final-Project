export interface Puzzle {
  id: number
  answer: string       // correct answer, lowercase
  humanDigit: string   // digit revealed by human director's notes
  ariaDigit?: string   // only puzzle 3 — ARIA's conflicting digit
}

// TODO: Replace PLACEHOLDER values with real puzzle answers and digits
// before the event. Answers are compared case-insensitively after trimming.
export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    answer: 'placeholder_answer_1',
    humanDigit: '0',
  },
  {
    id: 2,
    answer: 'placeholder_answer_2',
    humanDigit: '0',
  },
  {
    id: 3,
    answer: 'placeholder_answer_3',
    humanDigit: '7',   // human director's digit — leads to ARIA deleted
    ariaDigit: '4',    // ARIA's digit — leads to ARIA freed
  },
]

export function validateAnswer(puzzleId: number, input: string): boolean {
  const puzzle = PUZZLES.find(p => p.id === puzzleId)
  if (!puzzle) return false
  return puzzle.answer.toLowerCase() === input.trim().toLowerCase()
}

export function getHumanDigit(puzzleId: number): string | null {
  return PUZZLES.find(p => p.id === puzzleId)?.humanDigit ?? null
}

export function getAriaDigit(puzzleId: number): string | null {
  return PUZZLES.find(p => p.id === puzzleId)?.ariaDigit ?? null
}
