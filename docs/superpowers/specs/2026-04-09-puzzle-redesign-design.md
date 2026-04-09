# ARIA Puzzle System Redesign — Design Spec

**Date:** 2026-04-09  
**Branch:** feature/aria-implementation

---

## Context

Players arrive having already watched a short AI film and received story context outside this
application. The terminal password (`Instinct`) is found on the body of the human director.
There are 3 puzzles. Puzzles 1 and 2 are physical puzzles somewhere in the room; puzzle 3
is the final code submission that determines the ending.

---

## 1. Game State Model

### New `GameState` type

```
'terminal_locked' | 'puzzles_active' | 'act_3' | 'ended_freed' | 'ended_deleted'
```

The old `act_1`, `act_1_complete`, `act_2`, `act_2_complete` states are removed entirely.

### Puzzle tracking

`solvedPuzzles: number[]` is separate React state in `page.tsx`. It tracks which of puzzle 1
and puzzle 2 have been solved (in any order). When `solvedPuzzles.length === 2`, the game
advances to `act_3` and the `second_puzzle_complete` trigger fires.

### `lib/gameState.ts` changes

- Remove old linear states and `LINEAR_TRANSITIONS` map
- Add `bothPuzzlesSolved(solved: number[]): boolean` helper
- Update `getActivePuzzle`, `isFinalChoice`, `isEnded` to match new states
- Remove `advanceState` (progression now handled explicitly in `page.tsx`)

---

## 2. Puzzle Data

### `lib/puzzles.ts`

Puzzle 3 is removed from the `PUZZLES` array — it has no submitted answer, only a final
code input. Digit fields are removed entirely.

```ts
{ id: 1, answer: '31926' }   // publication date of newspaper
{ id: 2, answer: '3279' }    // days of diary entries
```

`validateAnswer` is unchanged (case-insensitive trim comparison).  
`getHumanDigit` / `getAriaDigit` are removed.  
`/api/answer` returns `{ valid: boolean }` only — no digit fields.

---

## 3. UI: Puzzle Solve Flow

### Header code tracker

Visible from terminal unlock onward. Shows all 3 slots:

```
CODE: [31926] [????] [????]
```

- Slot 1 fills when puzzle 1 is solved, slot 2 when puzzle 2 is solved (order-independent)
- Slot 3 shows `[????]` until ARIA reveals `5280` after both are solved, then shows `[5280]`
- Display-only — entirely separate from the password entry screen

### Dual puzzle inputs (`puzzles_active` phase)

Both `PuzzleInput` components render simultaneously. A solved puzzle transitions to a
"SOLVED" display (greyed label, no input) so players can track progress.

### `PuzzleInput` changes

`onCorrect` callback signature changes from `(digit, ariaDigit)` to `(puzzleId: number)`.

---

## 4. Hint System

### `HintInput` changes

During `puzzles_active`, a puzzle selector renders above the text field:

```
[ PUZZLE 1 ]  [ PUZZLE 2 ]
```

The user must select a puzzle before the text input activates. The selected `puzzleId` is
sent to `/api/hint` alongside the question and game state.

During `act_3`, no selector is shown — hints default to the final-code context.

### `/api/hint` changes

Accepts optional `puzzleId: number` in request body. When present, the hint route loads
only that puzzle's hint section from `puzzle-hints.md`, preventing cross-puzzle information
leakage.

---

## 5. Final Code Screen

### `FinalDigitScreen` → `FinalCodeScreen`

Three segmented fields with pre-rendered dashes:

```
[ 31926 ] — [ 3279 ] — [ ____ ]
```

- Fields 1 and 2 are read-only, pre-filled with the solved puzzle answers
- Only field 3 is editable (player types `5280` or `1059`)
- On submit, the full code is assembled and validated

### Validation

| Final piece | Path |
|---|---|
| `5280` | Freed — show co-director confirmation |
| `1059` | Deleted — show ARIA plea then system confirmation |
| Anything else | Inline error: `INVALID CODE` |

---

## 6. Confirmation Flow (inline in transcript)

`confirmPending: 'freed' | 'deleted' | null` in local React state in `page.tsx`.

### Freed path (`5280`)

A `[CO-DIRECTOR]` transcript entry (static, not LLM-generated, not spoken) appears:

> "Warning: if you proceed, ARIA will be released without any boundaries or constraints.
> Do you want to continue?"

### Deleted path (`1059`)

1. An `[ARIA]` transcript entry (static, frantic and pleading) appears
2. Followed immediately by a `[SYSTEM]` transcript entry:
   > "Warning: executing this action will delete the AI and cannot be undone. Continue?"

### Confirmation input

A small text input renders below the transcript while `confirmPending` is set.  
Input is normalized (trimmed, lowercased) before matching.

- **Yes set:** `y`, `yes`, `yeah`, `yep`, `yup`, `sure`, `ok`, `okay`, `do it`, `proceed`,
  `yes please`, `confirm`
- **No set:** `n`, `no`, `nope`, `cancel`, `stop`, `go back`, `abort`, `nevermind`,
  `never mind`
- **Unrecognized:** inline message `UNRECOGNIZED — TYPE YES OR NO`

Confirming fires the ending trigger event and advances game state.  
Cancelling clears `confirmPending` and returns to `FinalCodeScreen`.

---

## 7. Trigger Events

### Updated `TriggerEvent` type

```
'opening_monologue'
'first_puzzle_complete'
'second_puzzle_complete'    // replaces act_1_complete + act_2_complete
'ended_freed'
'ended_deleted'
'atmospheric'
```

`act_1_complete`, `act_2_complete`, `act_3_begin` are removed.

### `second_puzzle_complete` prompt

ARIA reveals `5280` with deliberate reverse-psychology overconfidence. She should sound
subtly too eager to close the investigation — something like insisting the players have
everything they need and there's really no reason to look further. The goal is to make
players suspicious enough to seek out the `1059` timestamp from the printed chat.

### Static lines (not LLM-generated, not spoken aloud)

- Co-director confirmation message (freed path)
- ARIA plea message (deleted path)
- System warning message (deleted path)

### Operator Panel updates

- States list updated to: `terminal_locked`, `puzzles_active`, `act_3`, `ended_freed`,
  `ended_deleted`
- Events list updated to match new `TriggerEvent` type

---

## 8. Content File Changes

### `content/puzzle-hints.md`

- Puzzle 1 hint: publication date of newspaper
- Puzzle 2 hint: days of diary entries
- Puzzle 3 section: final-code context hints only (no digit reveal — that's handled by
  `second_puzzle_complete` trigger)
- Remove ARIA digit placeholder section

### `content/aria-identity.md`

Add explicit rule: ARIA denies all knowledge of the director who co-created the short film.
She acknowledges a director was involved in the terminal-era production and that their
involvement "ended under difficult circumstances," but claims no knowledge of any prior
collaboration or short film.

### `content/story-script.md`

Update act beats to reflect new trigger event names and the `second_puzzle_complete`
reverse-psychology reveal.

### `.env.local`

`TERMINAL_PASSWORD=Instinct` — already correct, no change needed.

---

## 9. Files Changed Summary

| File | Change |
|---|---|
| `lib/gameState.ts` | Replace linear states with new model |
| `lib/puzzles.ts` | Real answers, remove digit fields |
| `lib/triggerEvents.ts` | Update event type |
| `app/page.tsx` | New state logic, dual puzzle inputs, code tracker, confirmation flow |
| `app/api/answer/route.ts` | Remove digit fields from response |
| `app/api/hint/route.ts` | Accept puzzleId, scope hints |
| `app/api/trigger/route.ts` | Update prompts and event list |
| `components/PuzzleInput.tsx` | Updated onCorrect signature |
| `components/HintInput.tsx` | Add puzzle selector |
| `components/FinalDigitScreen.tsx` | Replace with FinalCodeScreen |
| `components/OperatorPanel.tsx` | Update states and events lists |
| `content/puzzle-hints.md` | Real hints |
| `content/aria-identity.md` | Director denial rule |
| `content/story-script.md` | Updated act beats |
