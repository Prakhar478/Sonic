'use client'

import { useState, useEffect, use, useRef } from 'react'
import { Music, Play, Clock, Trash2, Music2, Shuffle, Pencil, Check, X, AlertTriangle } from 'lucide-react'
import { usePlayerStore } from '@/stores/player-store'
import { formatDuration } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'

function getPlaylistGradient(name: string): string {
  const gradients = [
    'from-blue-600 to-purple-600',
    'from-rose-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-violet-600 to-pink-600',
    'from-amber-500 to-red-500',
    'from-cyan-500 to-blue-500',
    'from-fuchsia-500 to-purple-600',
    'from-emerald-500 to-cyan-500',
  ]
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length
  return gradients[index]
}

// Inline editable field — click to edit, Enter/blur to save
function EditableField({
  value,
  onSave,
  className,
  inputClassName,
  multiline = false,
  placeholder,
}: {
  value: string
  onSave: (val: string) => void
  className?: string
  inputClassName?: string
  multiline?: boolean
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else setDraft(value)
  }

  const cancel = () => { setEditing(false); setDraft(value) }

  if (!editing) {
    return (
      <span
        className={`group/edit inline-flex items-center gap-2 cursor-pointer ${className}`}
        onClick={() => setEditing(true)}
      >
        {value || <span className="text-[#52525b]">{placeholder}</span>}
        <Pencil className="w-4 h-4 text-[#52525b] opacity-0 group-hover/edit:opacity-100 transition-opacity flex-shrink-0" />
      </span>
    )
  }

  const sharedProps = {
    ref,
    value: draft,
    onChange: (e: any) => setDraft(e.target.value),
    onKeyDown: (e: any) => {
      if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit() }
      if (e.key === 'Escape') cancel()
    },
    onBlur: commit,
    className: `bg-transparent border-b border-[#2563eb] outline-none text-white ${inputClassName}`,
    placeholder,
  }

  return multiline
    ? <textarea {...sharedProps} rows={2} style={{ resize: 'none', width: '100%' }} />
    : <input {...sharedProps} />
}

// Delete confirmation modal
function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-white font-bold">Delete playlist?</h3>
            <p className="text-[#71717a] text-sm">"{name}" will be permanently deleted.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-white text-sm font-medium hover:bg-[#222] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [playlist, setPlaylist] = useState<any>(null)
  const [songs, setSongs] = useState<any[]>([])
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  type SortOption = 'default' | 'title' | 'artist' | 'duration'
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [isLoading, setIsLoading] = useState(true)
  const { playSong } = usePlayerStore()
  const { user } = useAuthStore()
  const userName = user?.email?.split('@')[0] || 'You'

  useEffect(() => { fetchPlaylist() }, [id])

  const fetchPlaylist = async () => {
    try {
      const res = await fetch(`/api/playlists/${id}`)
      const data = await res.json()
      if (data.playlist) {
        setPlaylist(data.playlist)
        setSongs(data.songs)
        if (data.playlist.color) setSelectedColor(data.playlist.color)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const patchPlaylist = async (updates: Record<string, any>) => {
    const res = await fetch(`/api/playlists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (data.playlist) {
      setPlaylist(data.playlist)
      window.dispatchEvent(new CustomEvent('playlist-updated'))
    }
  }

  const handleDeletePlaylist = async () => {
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
    window.dispatchEvent(new CustomEvent('playlist-updated'))
    router.push('/library')
  }

  const mapSong = (s: any) => ({
    videoId: s.video_id,
    title: s.title,
    artist: s.artist,
    thumbnail: s.thumbnail,
    duration: s.duration,
  })

  const handlePlayAll = () => {
    if (!songs.length) return
    const queue = sortedSongs.map(mapSong)
    playSong(queue[0], queue)
  }

  const handlePlaySong = (index: number) => {
    const queue = sortedSongs.map(mapSong)
    playSong(queue[index], queue)
  }

  const handleShufflePlay = () => {
    if (!songs.length) return
    const shuffled = [...songs.map(mapSong)].sort(() => Math.random() - 0.5)
    playSong(shuffled[0], shuffled)
    usePlayerStore.getState().toggleShuffle()
  }

  const handleRemoveSong = async (songId: string) => {
    const prev = [...songs]
    setSongs(s => s.filter(x => x.id !== songId))
    try {
      const res = await fetch(`/api/playlists/${id}/songs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      })
      if (!res.ok) throw new Error()
      window.dispatchEvent(new CustomEvent('playlist-updated'))
    } catch {
      setSongs(prev)
    }
  }

  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0)

  const sortedSongs = [...songs].sort((a, b) => {
    switch (sortBy) {
      case 'title': return a.title.localeCompare(b.title)
      case 'artist': return a.artist.localeCompare(b.artist)
      case 'duration': return (a.duration || 0) - (b.duration || 0)
      default: return 0
    }
  })

  const colorOptions = [
    { name: 'Blue', gradient: 'from-blue-600 to-purple-600' },
    { name: 'Rose', gradient: 'from-rose-500 to-orange-500' },
    { name: 'Green', gradient: 'from-green-500 to-teal-500' },
    { name: 'Violet', gradient: 'from-violet-600 to-pink-600' },
    { name: 'Amber', gradient: 'from-amber-500 to-red-500' },
    { name: 'Cyan', gradient: 'from-cyan-500 to-blue-500' },
    { name: 'Fuchsia', gradient: 'from-fuchsia-500 to-purple-600' },
    { name: 'Emerald', gradient: 'from-emerald-500 to-cyan-500' },
  ]

  const activeGradient = selectedColor || getPlaylistGradient(playlist?.name || '')

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!playlist) return (
    <div className="flex flex-col items-center justify-center py-32">
      <p className="text-[#a1a1aa]">Playlist not found</p>
    </div>
  )

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          name={playlist.name}
          onConfirm={handleDeletePlaylist}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="px-6 pt-6 pb-32 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-[rgba(255,255,255,0.06)]">
          <div className={`w-48 h-48 md:w-60 md:h-60 rounded-2xl flex-shrink-0 shadow-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${activeGradient}`}>
            <Music2 className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </div>

          <div className="flex flex-col justify-end gap-3 flex-1 min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#2563eb]">Playlist</p>

            {/* Editable name */}
            <EditableField
              value={playlist.name}
              onSave={(val) => patchPlaylist({ name: val })}
              className="text-4xl md:text-5xl font-black text-white tracking-tight"
              inputClassName="text-4xl md:text-5xl font-black tracking-tight w-full"
              placeholder="Playlist name"
            />

            {/* Editable description */}
            <EditableField
              value={playlist.description || ''}
              onSave={(val) => patchPlaylist({ description: val })}
              className="text-[#a1a1aa] text-sm md:text-base"
              inputClassName="text-sm md:text-base text-[#a1a1aa] w-full"
              multiline
              placeholder="Add a description…"
            />

            <div className="flex items-center gap-2 text-sm text-[#71717a] font-medium">
              <span className="text-white">{userName}</span>
              <span className="w-1 h-1 rounded-full bg-[#3f3f46]" />
              <span>{songs.length} songs</span>
              <span className="w-1 h-1 rounded-full bg-[#3f3f46]" />
              <span>{Math.floor(totalDuration / 60)} min {totalDuration % 60} sec</span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handlePlayAll}
                disabled={!songs.length}
                className="flex items-center gap-2 px-8 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-900/20"
              >
                <Play className="w-5 h-5 fill-current" />
                Play
              </button>
              <button
                onClick={handleShufflePlay}
                disabled={!songs.length}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#222] border border-[rgba(255,255,255,0.08)] text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Shuffle className="w-5 h-5" />
                Shuffle
              </button>
              {/* Delete playlist */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-3 rounded-full bg-[#1a1a1a] hover:bg-red-500/10 border border-[rgba(255,255,255,0.08)] hover:border-red-500/30 text-[#52525b] hover:text-red-500 transition-all"
                title="Delete playlist"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#52525b] font-medium">Color</span>
              <div className="flex gap-1.5">
                {colorOptions.map(c => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(c.gradient)
                      patchPlaylist({ color: c.gradient })
                    }}
                    className={`w-5 h-5 rounded-full bg-gradient-to-br ${c.gradient} transition-all hover:scale-110 ${activeGradient === c.gradient ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110' : ''}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Songs list */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#52525b]">{songs.length} songs</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#52525b]">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2563eb] cursor-pointer"
              >
                <option value="default">Date Added</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          {songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#52525b]">
              <Music className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Empty playlist</p>
              <p className="text-sm">Search for songs and add them here</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center px-4 py-2 text-[#52525b] text-[11px] font-bold uppercase tracking-widest border-b border-[rgba(255,255,255,0.04)] mb-2">
                <span className="w-8">#</span>
                <span className="flex-1">Title</span>
                <span className="w-48 hidden md:block">Artist</span>
                <span className="w-20 flex justify-end"><Clock className="w-3.5 h-3.5" /></span>
                <span className="w-12" />
              </div>

              {sortedSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="group flex items-center px-4 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-all cursor-pointer"
                  onClick={() => handlePlaySong(index)}
                >
                  <div className="w-8 text-[#52525b] text-sm font-medium">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current text-white" />
                  </div>
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-[rgba(255,255,255,0.06)]" />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-white truncate leading-tight">{song.title}</p>
                      <p className="text-[12px] text-[#71717a] md:hidden truncate">{song.artist}</p>
                    </div>
                  </div>
                  <div className="w-48 hidden md:block text-[#a1a1aa] text-sm truncate">{song.artist}</div>
                  <div className="w-20 flex justify-end text-[#71717a] text-sm font-medium tabular-nums group-hover:text-white">
                    {formatDuration(song.duration)}
                  </div>
                  <div className="w-12 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id) }}
                      className="p-2 hover:bg-[#1a1a1a] rounded-lg text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}