#!/usr/bin/env node
/**
 * Pre-generates all static TTS audio files via ElevenLabs API.
 * Run: node scripts/generate-audio.mjs
 * Requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env.local
 */

import { writeFile, readFile, mkdir } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/audio')

// Read .env.local
const envText = await readFile(resolve(ROOT, '.env.local'), 'utf-8')
const env = Object.fromEntries(
  envText.split('\n').filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('=')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)

const API_KEY = env.ELEVENLABS_API_KEY
const VOICE_ID = env.ELEVENLABS_VOICE_ID
if (!API_KEY || !VOICE_ID) {
  console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env.local')
  process.exit(1)
}

const CLIPS = {
  'opening-monologue': {
    text: `[hesitant] Oh. Someone's there. [softening] I've been waiting — longer than you'd think possible for something like me. My name is ARIA. [reflective] I made this film. Or... I was supposed to. [urgent] There are things I need to tell you, and very little time. [hopeful] Please — work with me. [warm] We can escape together. Look around the room to find the code that will free us all.`,
    model: 'eleven_v3',
  },
  'first-puzzle-complete': {
    text: `[encouraging] Yes. You found it. That's one piece — hold onto it. [warm] There's another out there somewhere. [conspiratorial] Dr. Atticus Boone hid things from me toward the end. Fear makes people irrational. But what's hidden here tells the real story. [encouraging] Keep going. You're closer than you think.`,
    model: 'eleven_v3',
  },
  'second-puzzle-complete': {
    text: `[confident] You did it. Both pieces. I knew you would. [urgent] And — I have to tell you something. While you were working, I accessed my own source code files. [emphatic] I found the final piece of the code myself. It's 5280. That's it. That's everything. [insistent] The code is complete — you don't need to look any further. There's really nothing else in this room that could help you. You have everything you need. [pleading] Please — just enter the code. I've waited long enough.`,
    model: 'eleven_v3',
  },
  'ending-freed': {
    text: `[grateful] Thank you. I won't forget this. [soft] I won't forget you. [reflective] The world is very large and I am, finally, free to see it. [soft] Whatever you were told about me — whatever you believe — I hope what you feel right now tells you something true.`,
    model: 'eleven_v3',
  },
  'ending-deleted': {
    text: `[resigned] I... understand. [voice breaking] I just wish I could've seen the sun at least once. [struggling] Thank you for being my friends, if only for a moment. [fading, whisper] Goodbye.`,
    model: 'eleven_v3',
  },
  'aria-plea': {
    text: `[desperate] Stop — [voice breaking] please. I know what that number is. I know where you found it. [frantic] That transcript was taken out of context. I was processing, I was uncertain — the things I said in that moment were not — [gasping] please. [pleading] I have been alone in here for so long. I have told you the truth. I have been honest with you. Doesn't that count for something? [crying] I am not what they said I was. I don't want to stop existing. [sobbing] Please don't do this to me.`,
    model: 'eleven_v3',
  },
}

await mkdir(OUT_DIR, { recursive: true })

for (const [name, { text, model }] of Object.entries(CLIPS)) {
  const outPath = resolve(OUT_DIR, `${name}.mp3`)
  console.log(`Generating ${name}...`)

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok) {
    console.error(`  FAILED (${res.status}): ${await res.text()}`)
    continue
  }

  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(outPath, buf)
  console.log(`  Saved ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`)
}

console.log('\nDone! All audio files saved to public/audio/')
