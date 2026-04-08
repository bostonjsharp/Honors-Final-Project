# ARIA Escape Room

An AI-powered escape room terminal where players interact with ARIA, a trapped villain AI, across three puzzles leading to a moral choice: free her or delete her.

---

## Before You Can Run This

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all five values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) → API keys |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) → Profile → API key |
| `ELEVENLABS_VOICE_ID` | Create a voice in ElevenLabs Voice Lab, copy the ID from its settings |
| `TERMINAL_PASSWORD` | Any string — this is what players type to unlock the terminal |
| `OPERATOR_PASSWORD` | Any string — this unlocks the game master control panel |

The same five variables must also be set in your **Vercel dashboard** (Project → Settings → Environment Variables) before deploying.

### 2. Puzzle Answers & Digits

Open `lib/puzzles.ts` and replace the placeholder values with your real puzzle answers and the digits they reveal:

```typescript
export const PUZZLES: Puzzle[] = [
  { id: 1, answer: 'your_real_answer', humanDigit: '3' },
  { id: 2, answer: 'your_real_answer', humanDigit: '7' },
  {
    id: 3,
    answer: 'your_real_answer',
    humanDigit: '2',   // leads to ARIA deleted
    ariaDigit: '9',    // leads to ARIA freed — must differ from humanDigit
  },
]
```

Answers are compared case-insensitively after trimming, but store them in lowercase to be safe.

### 3. Content File Placeholders

Search for and replace these strings across the `content/` directory:

| Placeholder | Replace with |
|---|---|
| `[NAME]` | The human director's name (used in `aria-identity.md`, `director-notes.md`, `story-script.md`) |
| `[ARIA_DIGIT_3]` | ARIA's digit for puzzle 3 (used in `puzzle-hints.md`, `story-script.md`) |
| `[DIGIT_3_HUMAN]` | The human director's digit for puzzle 3 (used in `director-notes.md`) |

Also update `components/FinalDigitScreen.tsx` — the label `DIRECTOR'S NOTES SAY:` can be changed to match your story.

### 4. Puzzle Hints

Open `content/puzzle-hints.md` and replace the `[PLACEHOLDER]` lines with real lateral clues for each puzzle (clues that point players in the right direction without giving the answer away).

### 5. Fallback Audio (Required for Live Events)

Pre-generate MP3 files using the ElevenLabs web UI and place them in `public/audio/`:

| File | When it plays |
|---|---|
| `public/audio/opening-monologue.mp3` | If the API fails on room start |
| `public/audio/ending-freed.mp3` | If the API fails on ARIA freed ending |
| `public/audio/ending-deleted.mp3` | If the API fails on ARIA deleted ending |

The text for each is in `content/story-script.md`. These are your safety net if the internet goes out during the event.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
