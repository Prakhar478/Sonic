'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Library as LibraryIcon, Heart, Plus, LogIn, Music,
  Play, Youtube, X, Loader2, ListMusic, Check
} from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';

interface Playlist {
  id: string;
  name: string;
  cover_image: string | null;
  playlist_songs: { count: number }[];
}

interface ImportedPlaylist {
  title: string;
  thumbnail: string;
  songCount: number;
  songs: any[];
}

function ImportModal({ onClose }: { onClose: (refresh?: boolean) => void }) {
  const router = useRouter();
  const { playSong } = usePlayerStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<ImportedPlaylist | null>(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/playlist-import?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed to import playlist');
      else setResult(data);
    } catch {
      setError('Something went wrong. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/playlist-import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          thumbnail: result.thumbnail,
          songs: result.songs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save playlist');
      } else {
        setSaved(true);
        // Navigate to the new playlist after short delay
        setTimeout(() => {
          onClose(true);
          router.push(`/playlist/${data.playlist.id}`);
        }, 1200);
      }
    } catch {
      setError('Failed to save playlist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePlay = () => {
    if (result?.songs.length) {
      playSong(result.songs[0], result.songs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            <h2 className="text-white font-bold text-[16px]">Import YouTube Playlist</h2>
          </div>
          <button onClick={() => onClose()} className="text-[#52525b] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="text-[#a1a1aa] text-sm mb-2 block">Playlist URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setResult(null); setSaved(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                placeholder="https://youtube.com/playlist?list=..."
                className="flex-1 bg-[#0d0d0d] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#52525b] focus:outline-none focus:border-[#2563eb] transition-colors"
              />
              <button
                onClick={handleImport}
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 bg-[#2563eb] text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-[#1d4ed8] transition-colors flex items-center gap-2 flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
              </button>
            </div>
            <p className="text-[#52525b] text-xs mt-2">Paste any public YouTube playlist link</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-[#0d0d0d] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 space-y-3">
              {/* Playlist info */}
              <div className="flex items-center gap-3">
                {result.thumbnail ? (
                  <img src={result.thumbnail} alt={result.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-6 h-6 text-[#52525b]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{result.title}</p>
                  <p className="text-[#a1a1aa] text-xs mt-0.5">{result.songCount} songs found</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Play now */}
                <button
                  onClick={handlePlay}
                  className="flex-1 py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-colors border border-[rgba(255,255,255,0.06)]"
                >
                  <Play className="w-4 h-4" fill="white" />
                  Play Now
                </button>

                {/* Save to library */}
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex-1 py-2.5 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${saved
                    ? 'bg-green-600 text-white'
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-70'
                    }`}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : saved ? (
                    <><Check className="w-4 h-4" /> Saved!</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Save to Library</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { isAuthenticated } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchPlaylists();
    else setIsLoading(false);
  }, [isAuthenticated]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      if (data.playlists) setPlaylists(data.playlists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (refresh?: boolean) => {
    setShowImport(false);
    if (refresh) fetchPlaylists();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <LibraryIcon className="w-16 h-16 text-[#52525b] mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your library</h2>
        <p className="text-sm text-[#71717a] mb-6 text-center max-w-sm">
          Create playlists, save songs, and build your personal music collection.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-sm transition-all hover:scale-105 active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      {showImport && <ImportModal onClose={handleModalClose} />}

      <div className="px-6 pt-6 pb-32 overflow-y-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LibraryIcon className="w-8 h-8 text-[#2563eb]" />
            <h1 className="text-3xl font-black text-white tracking-tight">Your Library</h1>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[rgba(255,255,255,0.08)] text-[#a1a1aa] hover:text-white hover:border-[#2563eb] text-sm font-medium transition-all"
          >
            <Youtube className="w-4 h-4 text-red-500" />
            Import Playlist
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Liked Songs */}
          <Link
            href="/liked"
            className="relative group aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#4c1d95] to-[#2563eb] shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-2">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <h3 className="text-2xl font-black text-white leading-tight">Liked Songs</h3>
              <p className="text-sm font-medium text-white/80">Your favorite music</p>
            </div>
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="w-12 h-12 rounded-full bg-[#2563eb] flex items-center justify-center shadow-xl">
                <Play className="w-5 h-5 text-white ml-1" fill="white" />
              </div>
            </div>
          </Link>

          {playlists.map((playlist) => {
            const songCount = playlist.playlist_songs?.[0]?.count || 0;
            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="group flex flex-col gap-4 p-4 rounded-2xl bg-[#141414] border border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl bg-[#0a0a0a]">
                  {playlist.cover_image ? (
                    <img src={playlist.cover_image} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 opacity-20 text-[#27272a]" />
                    </div>
                  )}
                  <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center shadow-xl">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white truncate group-hover:text-[#2563eb] transition-colors">{playlist.name}</h3>
                  <p className="text-xs text-[#71717a] font-medium mt-1">Playlist • {songCount} songs</p>
                </div>
              </Link>
            );
          })}

          {!isLoading && playlists.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#141414] border border-dashed border-[#27272a] flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-[#27272a]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create your first playlist</h3>
              <p className="text-[#71717a] text-sm max-w-xs">Click the plus button in the sidebar or import a YouTube playlist above!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}