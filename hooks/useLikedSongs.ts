import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function useLikedSongs(videoId?: string) {
  const { isAuthenticated } = useAuthStore()
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if current song is liked
  useEffect(() => {
    if (!videoId || !isAuthenticated) { setIsLiked(false); return }
    fetch(`/api/liked/${videoId}`)
      .then(r => r.json())
      .then(d => setIsLiked(d.liked))
      .catch(() => setIsLiked(false))
  }, [videoId, isAuthenticated])

  const toggleLike = useCallback(async (song: {
    videoId: string
    title: string
    artist: string
    thumbnail: string
    duration: number
  }) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/liked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song),
      })
      const data = await res.json()
      setIsLiked(data.liked)
    } catch (e) {
      console.error('Toggle like failed:', e)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  return { isLiked, isLoading, toggleLike }
}
