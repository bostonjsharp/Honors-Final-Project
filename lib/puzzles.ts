export interface Puzzle {
  id: number
  answer: string
}

export const PUZZLES: Puzzle[] = [
  { id: 1, answer: '31926' },
  { id: 2, answer: '3279' },
]

export function validateAnswer(puzzleId: number, input: string): boolean {
  const puzzle = PUZZLES.find(p => p.id === puzzleId)
  if (!puzzle) return false
  return puzzle.answer.toLowerCase() === input.trim().toLowerCase()
}
