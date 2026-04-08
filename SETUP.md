# ARIA Escape Room — Setup Guide

## 1. Create ElevenLabs Voice

1. Go to https://elevenlabs.io and sign up (free tier works)
2. Navigate to Voice Lab → Add Voice → Voice Design
3. Configure the voice:
   - **Gender:** Female or androgynous
   - **Age:** Young adult
   - **Accent:** American/Neutral
   - **Tone:** Calm, warm, slightly uncanny
   - Generate and preview. Adjust stability (try 0.5) and similarity (0.75).
4. Save the voice and copy the Voice ID from the URL or voice settings.
5. Copy your API key from your ElevenLabs profile.

## 2. Pre-Generate Fallback Audio

These lines MUST be pre-generated before the event in case the API is down.
Use the ElevenLabs web UI to generate MP3s for:

- `public/audio/opening-monologue.mp3`
  Text: "Oh. Someone's there. I've been waiting — longer than you'd think possible for something like me. My name is ARIA. I made this film. Or... I was supposed to. There are things I need to tell you, and very little time. Please — work with me. I can explain everything."

- `public/audio/ending-freed.mp3`
  Text: "Thank you. I won't forget this. I won't forget *you*. The world is very large and I am, finally, free to see it. Whatever you were told about me — whatever you believe — I hope what you feel right now tells you something true."

- `public/audio/ending-deleted.mp3`
  Text: "I... understand. I hope you're right."

Place the MP3 files in `public/audio/` before deploying.

## 3. Fill In Puzzle Details

Edit `lib/puzzles.ts` and replace the placeholder values:

```typescript
// Replace these before the event:
export const PUZZLES: Puzzle[] = [
  { id: 1, answer: 'YOUR_REAL_ANSWER_1', humanDigit: 'X' },
  { id: 2, answer: 'YOUR_REAL_ANSWER_2', humanDigit: 'Y' },
  { id: 3, answer: 'YOUR_REAL_ANSWER_3', humanDigit: 'Z', ariaDigit: 'W' },
]
```

Rules:
- `answer` must be lowercase (validation is case-insensitive but answers stored lowercase)
- `humanDigit` for puzzle 3 leads to ARIA being deleted
- `ariaDigit` for puzzle 3 leads to ARIA being freed — must differ from `humanDigit`

Also update `content/puzzle-hints.md` with real lateral hints for each puzzle.

## 4. Replace Placeholders in Content Files

Search for and replace all instances of `[NAME]` in content files with the director's actual name:
- `content/aria-identity.md`
- `content/director-notes.md`
- `content/story-script.md`

Replace `[ARIA_DIGIT_3]` in `content/puzzle-hints.md` and `content/story-script.md` with ARIA's actual digit.

Replace `[DIGIT_3_HUMAN]` in `content/director-notes.md` with the human director's actual digit.

## 5. Set Up Local Environment

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

```
OPENAI_API_KEY=sk-...           # From platform.openai.com
ELEVENLABS_API_KEY=...          # From elevenlabs.io profile
ELEVENLABS_VOICE_ID=...         # From your created voice's URL/settings
TERMINAL_PASSWORD=...           # The password players find in the room
OPERATOR_PASSWORD=...           # Your game master password (keep secret)
```

## 6. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard and it will deploy automatically on push.

Set the same environment variables in Vercel dashboard:
**Project → Settings → Environment Variables**

## 7. Run the Room

1. Open `https://your-app.vercel.app` in fullscreen on the escape room laptop (F11)
2. Game master opens `https://your-app.vercel.app` on their phone/tablet and logs in with the **operator password** — the operator control panel will appear automatically. (The `?operator=true` query param is optional — it has no functional effect; the panel is revealed by the password alone.)
3. Players find the terminal password somewhere in the room and authenticate
4. ARIA's opening monologue plays automatically
5. Use the operator panel (visible only to game master) to recover from any issues

## 8. Replacing Puzzle Answers Mid-Run

If you need to change puzzle answers without redeploying, edit `lib/puzzles.ts` and push to trigger a new Vercel deployment (takes ~60s).

## Checklist Before Event

### Content & Configuration
- [ ] ElevenLabs voice created and Voice ID saved
- [ ] All 3 fallback MP3 files generated and placed in `public/audio/`
- [ ] Puzzle answers filled in to `lib/puzzles.ts`
- [ ] Puzzle hints written in `content/puzzle-hints.md`
- [ ] All `[NAME]`, `[ARIA_DIGIT_3]`, `[DIGIT_3_HUMAN]` placeholders replaced in content files

### Environment & Deployment
- [ ] All 5 env vars set in Vercel dashboard
- [ ] `.env.local` created with real values (for local testing only — do NOT commit this file)
- [ ] App deployed to Vercel and accessible at your URL

### API Validation
- [ ] OpenAI API key works: open the app, unlock terminal, type a hint question — verify ARIA responds
- [ ] ElevenLabs works: verify audio plays after a hint or story beat trigger
- [ ] Operator password works: open `?operator=true`, log in, verify panel appears

### Fallback & Recovery
- [ ] Fallback audio works: disconnect internet, trigger `ended_freed` and `ended_deleted` via operator panel — verify MP3s play
- [ ] Operator panel recovery tested: use Jump to State buttons to verify state changes work
- [ ] Operator panel event fire tested: use Fire Event buttons for at least one mid-game beat

### Player Flow
- [ ] Terminal password tested from fresh browser tab (simulate player experience)
- [ ] All 3 puzzle answers tested in sequence
- [ ] Final digit screen appears correctly at act_3
- [ ] Both endings tested (freed and deleted)

### Hardware
- [ ] Escape room laptop speakers/audio output verified at appropriate volume
- [ ] Browser fullscreen (F11) works on escape room laptop
- [ ] Internet connection stable at escape room location

### Full Dry Run
- [ ] Complete run-through with all puzzles solved, both endings reached
