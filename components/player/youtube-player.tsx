'use client'
import { useEffect, useRef } from 'react'

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

export function YouTubePlayer({
  videoId, isPlaying, volume,
  onReady, onProgress, onEnded, onError, seekTo
}: Props) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const readyRef = useRef(false)

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'yt-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  }, [])

  // Create player when videoId changes
  useEffect(() => {
    // Don't initialize if videoId is empty or invalid
    if (!videoId || videoId.length !== 11) return

    readyRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const create = () => {
      if (!containerRef.current || !window.YT?.Player) return

      if (playerRef.current) {
        playerRef.current.destroy()
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
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
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
            }
            if (e.data === YT.ENDED) onEnded()
          },
          onError: () => onError(),
        },
      })
    }

    if (window.YT?.Player) {
      create()
    } else {
      window.onYouTubeIframeAPIReady = create
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [videoId])

  // Sync play/pause
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return
    isPlaying
      ? playerRef.current.playVideo()
      : playerRef.current.pauseVideo()
  }, [isPlaying])

  // Sync volume
  useEffect(() => {
    playerRef.current?.setVolume?.(volume * 100)
  }, [volume])

  // Seek
  useEffect(() => {
    if (seekTo !== undefined && readyRef.current) {
      playerRef.current?.seekTo?.(seekTo, true)
    }
  }, [seekTo])

  // Hidden — audio only, 1x1 pixel off screen
  return (
    <div
      style={{
        position: 'fixed',
        left: '-9999px',
        bottom: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <div ref={containerRef} />
    </div>
  )
}
