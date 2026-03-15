'use client'
import { useEffect, useState } from 'react'
import { Heart, Music, Play } from 'lucide-react'
import { usePlayerStore } from '@/stores/player-store'
import { useAuthStore } from '@/stores/auth-store'
import { cn, formatDuration } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface LikedSong {
  id: string
  video_id: string
  title: string
  artist: string
  thumbnail: string
  duration: number
  liked_at: string
}

export default function LikedPage() {
  const [songs, setSongs] = useState<LikedSong[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()
  const { playSong, currentSong, isPlaying } = usePlayerStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetch('/api/liked')
      .then(r => r.json())
      .then(d => setSongs(d.songs || []))
      .finally(() => setIsLoading(false))
  }, [isAuthenticated])

  const handlePlay = (song: LikedSong, index: number) => {
    const queue = songs.map(s => ({
      videoId: s.video_id,
      title: s.title,
      artist: s.artist,
      thumbnail: s.thumbnail,
      duration: s.duration,
    }))
    playSong(queue[index], queue)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-6 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#2563eb]/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-[#2563eb]" fill="currentColor" />
        </div>
        <div>
          <p className="text-[#a1a1aa] text-sm">Playlist</p>
          <h1 className="text-3xl font-bold text-white">Liked Songs</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">{songs.length} songs</p>
        </div>
      </div>

      {/* Songs list */}
      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Heart className="w-12 h-12 text-[#52525b]" />
          <p className="text-[#a1a1aa]">No liked songs yet</p>
          <p className="text-[#52525b] text-sm">Hit the heart button on any song</p>
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map((song, index) => {
            const isActive = currentSong?.videoId === song.video_id
            return (
              <div
                key={song.id}
                onClick={() => handlePlay(song, index)}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all duration-200',
                  isActive ? 'bg-[#2563eb]/10' : 'hover:bg-[#141414]'
                )}
              >
                <span className="w-6 text-center text-sm text-[#52525b] group-hover:hidden">
                  {isActive && isPlaying ? (
                    <span className="text-[#2563eb]">♪</span>
                  ) : (
                    index + 1
                  )}
                </span>
                <Play className="w-4 h-4 text-white hidden group-hover:block flex-shrink-0" />
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#141414]">
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-4 h-4 text-[#52525b]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isActive ? 'text-[#2563eb]' : 'text-white')}>
                    {song.title}
                  </p>
                  <p className="text-xs text-[#a1a1aa] truncate mt-0.5">{song.artist}</p>
                </div>
                <span className="text-xs text-[#52525b] font-mono">{formatDuration(song.duration)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
