'use client'
import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { getNativeStreamUrl } from '@/lib/youtube-music-native'

interface Props {
  videoId: string
  isPlaying: boolean
  volume: number
  onReady: (duration: number) => void
  onProgress: (time: number) => void
  onEnded: () => void
  onError: () => void
  seekTo?: number
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// ─── Native Android Player (audio tag) ───────────────────────────────────────
function NativePlayer({
  videoId, isPlaying, volume,
  onReady, onProgress, onEnded, onError, seekTo
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const loadedId = useRef('')

  useEffect(() => {
    if (!videoId || videoId.length !== 11) return
    if (loadedId.current === videoId) return
    loadedId.current = videoId

    const load = async () => {
      try {
        const streamUrl = await getNativeStreamUrl(videoId)
        if (!streamUrl) { onError(); return }
        const audio = audioRef.current
        if (!audio) return
        audio.src = streamUrl
        audio.volume = volume
        audio.load()
      } catch {
        onError()
      }
    }
    load()
  }, [videoId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.play().catch(() => { })
    else audio.pause()
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

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

// ─── Web YouTube IFrame Player ────────────────────────────────────────────────
function WebPlayer({
  videoId, isPlaying, volume,
  onReady, onProgress, onEnded, onError, seekTo
}: Props) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'yt-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  }, [])

  useEffect(() => {
    if (!videoId || videoId.length !== 11) return
    readyRef.current = false
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }

    const create = () => {
      if (!containerRef.current || !window.YT?.Player) return
      if (playerRef.current) playerRef.current.destroy()

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1, controls: 0, disablekb: 1,
          fs: 0, iv_load_policy: 3, modestbranding: 1,
          rel: 0, playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            readyRef.current = true
            e.target.setVolume(volume * 100)
            onReady(e.target.getDuration())
            if (isPlaying) e.target.playVideo()
          },
          onStateChange: (e: any) => {
            const YT = window.YT.PlayerState
            if (e.data === YT.PLAYING) {
              if (intervalRef.current) clearInterval(intervalRef.current)
              intervalRef.current = setInterval(() => {
                onProgress(playerRef.current?.getCurrentTime?.() || 0)
              }, 500)
            } else {
              if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
            }
            if (e.data === YT.ENDED) onEnded()
          },
          onError: () => onError(),
        },
      })
    }

    if (window.YT?.Player) create()
    else window.onYouTubeIframeAPIReady = create

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [videoId])

  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return
    isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo()
  }, [isPlaying])

  useEffect(() => { playerRef.current?.setVolume?.(volume * 100) }, [volume])

  useEffect(() => {
    if (seekTo !== undefined && readyRef.current) {
      playerRef.current?.seekTo?.(seekTo, true)
    }
  }, [seekTo])

  return (
    <div style={{ position: 'fixed', left: '-9999px', bottom: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}>
      <div ref={containerRef} />
    </div>
  )
}

// ─── Main Export — picks correct player ───────────────────────────────────────
export function YouTubePlayer(props: Props) {
  if (Capacitor.isNativePlatform()) {
    return <NativePlayer {...props} />
  }
  return <WebPlayer {...props} />
}