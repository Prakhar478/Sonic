'use client'
import { useEffect, useRef } from 'react'

interface Props {
  videoId: string
  title: string
  artist: string
  isPlaying: boolean
  volume: number
  onReady: (duration: number) => void
  onProgress: (time: number) => void
  onEnded: () => void
  onError: () => void
  seekTo?: number
}

export function YouTubePlayer({
  videoId, title, artist, isPlaying, volume,
  onReady, onProgress, onEnded, onError, seekTo
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const loadedVideoId = useRef<string>('')

  // Fetch stream URL from JioSaavn and load into audio
  useEffect(() => {
    if (!videoId || videoId.length !== 11) return
    if (loadedVideoId.current === videoId) return
    loadedVideoId.current = videoId

    const fetchStream = async () => {
      try {
        const params = new URLSearchParams({ title, artist })
        const res = await fetch(`/api/stream/${videoId}?${params}`)
        if (!res.ok) { onError(); return }
        const data = await res.json()
        if (!data.streamUrl) { onError(); return }

        const audio = audioRef.current
        if (!audio) return
        audio.src = data.streamUrl
        audio.volume = volume
        audio.load()
      } catch {
        onError()
      }
    }

    fetchStream()
  }, [videoId, title, artist])

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => { })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Seek
  useEffect(() => {
    if (seekTo !== undefined && audioRef.current) {
      audioRef.current.currentTime = seekTo
    }
  }, [seekTo])

  return (
    <audio
      ref={audioRef}
      onLoadedMetadata={() => onReady(audioRef.current?.duration || 0)}
      onTimeUpdate={() => onProgress(audioRef.current?.currentTime || 0)}
      onEnded={onEnded}
      onError={onError}
    />
  )
}