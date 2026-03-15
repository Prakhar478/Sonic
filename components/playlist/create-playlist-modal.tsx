'use client'
import { useState } from 'react'
import { X, Music } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: (playlist: any) => void
}

export function CreatePlaylistModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (data.playlist) {
        onCreated(data.playlist)
        setName('')
        setDescription('')
        onClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Create Playlist</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="w-20 h-20 rounded-xl bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
            <Music className="w-8 h-8 text-[#52525b]" />
          </div>
          <div className="flex-1 space-y-3">
            <input
              type="text"
              placeholder="Playlist name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-white text-sm placeholder-[#52525b] focus:outline-none focus:border-[#2563eb] transition-colors"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-white text-sm placeholder-[#52525b] focus:outline-none focus:border-[#2563eb] transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#a1a1aa] text-sm hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isLoading}
            className="flex-1 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
