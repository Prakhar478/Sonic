'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { Library as LibraryIcon, Heart, ListMusic, Plus, LogIn, Music, Play } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface Playlist {
  id: string;
  name: string;
  cover_image: string | null;
  playlist_songs: { count: number }[];
}

export default function LibraryPage() {
  const { isAuthenticated, profile, user } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <LibraryIcon className="w-16 h-16 text-[#52525b] mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">
          Sign in to view your library
        </h2>
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
    <div className="px-6 pt-6 pb-32 overflow-y-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LibraryIcon className="w-8 h-8 text-[#2563eb]" />
          <h1 className="text-3xl font-black text-white tracking-tight">Your Library</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Liked Songs card */}
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
                  <img 
                    src={playlist.cover_image} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#27272a]">
                    <Music className="w-16 h-16 opacity-20" />
                  </div>
                )}
                <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 group-hover:scale-105">
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

        {/* Empty state playlists */}
        {!isLoading && playlists.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 rounded-3xl bg-[#141414] border border-dashed border-[#27272a] flex items-center justify-center mb-6">
               <Plus className="w-8 h-8 text-[#27272a]" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Create your first playlist</h3>
             <p className="text-[#71717a] text-sm max-w-xs">It only takes a second. Click the plus button in the sidebar or search for songs!</p>
          </div>
        )}
      </div>
    </div>
  );
}
