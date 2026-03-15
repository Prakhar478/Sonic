'use client'
import { useState, useEffect } from 'react'
import { X, Plus, Check, Music, ListMusic } from 'lucide-react'

interface Song {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  song: Song | null
}

export function AddToPlaylistModal({ isOpen, onClose, song }: Props) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addedTo, setAddedTo] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!isOpen || !song) return
    
    // Fetch playlists first
    fetch('/api/playlists')
      .then(r => r.json())
      .then(async d => {
        const lists = d.playlists || []
        setPlaylists(lists)
        
        // Check which playlists already have this song
        // We'll do this by fetching each playlist's details
        // Note: For a large number of playlists, this could be optimized into a single API call / search
        try {
          const memberships = await Promise.all(
            lists.map(async (p: any) => {
              const res = await fetch(`/api/playlists/${p.id}`)
              const data = await res.json()
              const songs = data.songs || []
              return songs.some((s: any) => s.video_id === song.videoId) ? p.id : null
            })
          )
          setAddedTo(memberships.filter((id): id is string => id !== null))
        } catch (e) {
          console.error('Failed to check playlist memberships:', e)
        }
      })
  }, [isOpen, song])

  if (!isOpen || !song) return null

  const handleAdd = async (playlistId: string) => {
    if (addedTo.includes(playlistId)) return
    try {
      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song),
      })
      
      // Mark as added whether it's 200 (new) or 409 (already exists)
      if (res.ok || res.status === 409) {
        setAddedTo(prev => [...prev, playlistId])
        
        // Notify other components (like Sidebar) to refresh
        window.dispatchEvent(new CustomEvent('playlist-updated'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      const data = await res.json()
      if (data.playlist) {
        setPlaylists(prev => [data.playlist, ...prev])
        await handleAdd(data.playlist.id)
        setNewName('')
        setCreating(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-sm font-semibold text-white">Add to playlist</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Song preview */}
        <div className="flex items-center gap-3 px-5 py-3 bg-[#1a1a1a]">
          <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{song.title}</p>
            <p className="text-xs text-[#a1a1aa] truncate">{song.artist}</p>
          </div>
        </div>

        {/* Playlists list */}
        <div className="max-h-64 overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <ListMusic className="w-8 h-8 text-[#52525b]" />
              <p className="text-sm text-[#a1a1aa]">No playlists yet</p>
            </div>
          ) : (
            playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => handleAdd(playlist.id)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#1a1a1a] transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {playlist.cover_image ? (
                    <img src={playlist.cover_image} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-[#52525b]" />
                  )}
                </div>
                <span className="flex-1 text-left text-sm text-white truncate">{playlist.name}</span>
                {addedTo.includes(playlist.id) ? (
                  <Check className="w-4 h-4 text-[#2563eb] flex-shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-[#52525b] group-hover:text-white flex-shrink-0 transition-colors" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Create new playlist */}
        <div className="border-t border-[rgba(255,255,255,0.06)] p-4">
          {creating ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Playlist name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateAndAdd()}
                className="flex-1 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-white text-sm placeholder-[#52525b] focus:outline-none focus:border-[#2563eb]"
              />
              <button
                onClick={handleCreateAndAdd}
                disabled={!newName.trim() || isLoading}
                className="px-3 py-2 bg-[#2563eb] rounded-lg text-white text-sm disabled:opacity-50"
              >
                {isLoading ? '...' : 'Add'}
              </button>
              <button onClick={() => setCreating(false)} className="px-3 py-2 text-[#a1a1aa] text-sm">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-3 py-2 text-[#2563eb] hover:text-blue-400 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New playlist
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
