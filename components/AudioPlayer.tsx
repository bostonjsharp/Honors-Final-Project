'use client'
import { useRef, useImperativeHandle, forwardRef } from 'react'

export interface AudioPlayerHandle {
  playBlob: (audioBlob: Blob) => void
  playFallback: (src: string) => void
  // Call synchronously inside a user-gesture handler to unlock browser autoplay.
  unlockAutoplay: () => void
}

const AudioPlayer = forwardRef<AudioPlayerHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useImperativeHandle(ref, () => ({
    playBlob(audioBlob: Blob) {
      const url = URL.createObjectURL(audioBlob)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = url
        audioRef.current.onended = () => URL.revokeObjectURL(url)
        audioRef.current.play().catch(() => URL.revokeObjectURL(url))
      } else {
        URL.revokeObjectURL(url)
      }
    },
    playFallback(src: string) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = src
        audioRef.current.play().catch(() => {})
      }
    },
    unlockAutoplay() {
      if (!audioRef.current) return
      // Shortest valid WAV — 1 silent sample. Playing this synchronously inside a
      // user-gesture handler (e.g. form submit) unlocks autoplay for the entire session
      // so subsequent async play() calls (fetch → blob → play) are not blocked.
      const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='
      audioRef.current.src = SILENT_WAV
      audioRef.current.play().catch(() => {})
    },
  }))

  return <audio ref={audioRef} style={{ display: 'none' }} />
})

AudioPlayer.displayName = 'AudioPlayer'
export default AudioPlayer
