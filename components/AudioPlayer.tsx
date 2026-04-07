'use client'
import { useRef, useImperativeHandle, forwardRef } from 'react'

export interface AudioPlayerHandle {
  playBlob: (audioBlob: Blob) => void
  playFallback: (src: string) => void
}

const AudioPlayer = forwardRef<AudioPlayerHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useImperativeHandle(ref, () => ({
    playBlob(audioBlob: Blob) {
      const url = URL.createObjectURL(audioBlob)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.onended = () => URL.revokeObjectURL(url)
        audioRef.current.play()
      } else {
        URL.revokeObjectURL(url)
      }
    },
    playFallback(src: string) {
      if (audioRef.current) {
        audioRef.current.src = src
        audioRef.current.play()
      }
    },
  }))

  return <audio ref={audioRef} style={{ display: 'none' }} />
})

AudioPlayer.displayName = 'AudioPlayer'
export default AudioPlayer
