'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Play, Clock, Heart, Plus, MoreHorizontal } from 'lucide-react'
import { usePlayerStore } from '@/stores/player-store'
import { useAuthStore } from '@/stores/auth-store'
import { AddToPlaylistModal } from '@/components/playlist/add-to-playlist-modal'
import Image from 'next/image'

interface Song {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: number
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2,'0')}`
}

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  
  const [results, setResults] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null)

  const { playSong, currentSong, isPlaying } = usePlayerStore()

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        if (data.error) {
          setError(data.error)
        } else {
          setResults(data.songs || [])
        }
      } catch {
        setError('Search failed. Try again.')
      } finally {
        setIsLoading(false)
      }
    }, []
  )

  useEffect(() => {
    if (q) {
      search(q)
    } else {
      setResults([])
    }
  }, [q, search])

  const handlePlay = (song: Song, index: number) => {
    playSong(song, results)
  }

  return (
    <div className="px-6 pt-8 pb-32">
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-20">
          <p className="text-[#a1a1aa]">{error}</p>
        </div>
      )}

      {/* Empty state (No results for query) */}
      {!isLoading && !error && results.length === 0 && q && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 border border-[rgba(255,255,255,0.08)]">
             <Search className="w-8 h-8 text-[#333333]" />
          </div>
          <p className="text-[16px] font-medium text-white mb-2">
            No results for "{q}"
          </p>
          <p className="text-[14px] text-[#a1a1aa]">
            Try different keywords
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div>
          <h2 className="text-[20px] font-bold text-white mb-6">
            Results for "{q}"
          </h2>

          <div className="grid gap-0">
            {/* Header row */}
            <div className="flex items-center px-4 py-2 text-[12px] text-[#52525b] uppercase tracking-wider border-b border-[rgba(255,255,255,0.04)] mb-2 group">
              <span className="w-8 flex-shrink-0">#</span>
              <span className="flex-1">Title</span>
              <span className="w-24 text-right flex-shrink-0 flex items-center justify-end gap-2 pr-2">
                <Clock className="w-4 h-4" />
              </span>
            </div>

            {results.map((song, index) => {
              const isCurrentSong = currentSong?.videoId === song.videoId
              const isHovered = hoveredIndex === index

              return (
                <div
                  key={song.videoId}
                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer group transition-all duration-150 ${isCurrentSong ? 'bg-[#2563eb]/10' : 'hover:bg-[rgba(255,255,255,0.05)]'}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handlePlay(song, index)}
                >
                  {/* Index / Play icon */}
                  <div className="w-8 flex-shrink-0">
                    {isHovered || isCurrentSong ? (
                      <Play className={`w-4 h-4 ${isCurrentSong ? 'text-[#2563eb]' : 'text-white'}`} fill="currentColor" />
                    ) : (
                      <span className={`text-[14px] ${isCurrentSong ? 'text-[#2563eb]' : 'text-[#52525b]'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mr-3 shadow-lg">
                    <img
                      src={song.thumbnail || '/images/song-placeholder.jpeg'}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = '/images/song-placeholder.jpeg'
                      }}
                    />
                  </div>

                  {/* Title + Artist */}
                  <div className="flex-1 min-w-0 mr-4">
                    <p className={`text-[14px] font-medium truncate ${isCurrentSong ? 'text-[#2563eb]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-[12px] text-[#a1a1aa] truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-[13px] text-[#52525b] w-24 text-right flex-shrink-0 group-hover:text-[#a1a1aa] transition-colors pr-2">
                    {formatDuration(song.duration)}
                  </span>

                  {/* More Menu */}
                  <div className="relative w-10 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAddToPlaylistSong(song)
                      }}
                      className="p-2 text-[#52525b] hover:text-white hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <AddToPlaylistModal
            isOpen={!!addToPlaylistSong}
            onClose={() => setAddToPlaylistSong(null)}
            song={addToPlaylistSong}
          />
        </div>
      )}

      {/* Initial state (No query yet) */}
      {!isLoading && !q && (
        <div className="text-center py-32">
          <Search className="w-16 h-16 text-[#1a1a1a] mx-auto mb-6" />
          <h3 className="text-[20px] font-bold text-white mb-2">
            Search for music
          </h3>
          <p className="text-[14px] text-[#a1a1aa] max-w-[300px] mx-auto">
            Find your favorite songs, artists, and playlists using the search bar above.
          </p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
