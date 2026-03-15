'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Library, Heart, Plus, User, Settings, LogOut, Music } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { CreatePlaylistModal } from '@/components/playlist/create-playlist-modal';

// Helper functions for auto-generated covers
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
  // Pick gradient based on playlist name so it's consistent
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length
  return gradients[index]
}

function getPlaylistInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated, signOut } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    window.addEventListener('playlist-updated', fetchPlaylists);
    return () => window.removeEventListener('playlist-updated', fetchPlaylists);
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      if (data.playlists) setPlaylists(data.playlists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Library, label: 'Library', href: '/library' },
    { icon: Heart, label: 'Liked Songs', href: '/liked' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className="w-[256px] fixed left-0 top-0 bottom-0 bg-[#000000] border-r border-[rgba(255,255,255,0.06)] flex flex-col z-40 hidden md:flex transition-all duration-200">
      {/* Top section: Logo */}
      <div className="flex items-center gap-3 pt-6 pb-8 px-4">
        <img 
          src="/images/logo.jpeg"
          alt="Sonic"
          className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="text-[22px] font-bold text-white">Sonic</span>
      </div>

      {/* Nav section */}
      <div className="px-4 py-2">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#52525b] mb-4">
          MENU
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 ${
                  isActive
                    ? 'bg-[rgba(37,99,235,0.15)] text-[#2563eb] border-l-2 border-[#2563eb] font-medium'
                    : 'text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.04)] hover:text-white border-l-2 border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Playlists section */}
      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#52525b] mb-4">
          PLAYLISTS
        </p>
        
        <div className="space-y-1 mb-4">
          {playlists.map((playlist: any) => {
            const isActive = pathname === `/playlist/${playlist.id}`;
            const songCount = playlist.playlist_songs?.[0]?.count || 0;
            
            return (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 group ${
                  isActive
                    ? 'bg-[rgba(255,255,255,0.08)] text-white font-medium'
                    : 'text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${getPlaylistGradient(playlist.name)} flex-shrink-0 animate-scale-in`}>
                  <span className="text-white text-[10px] font-black tracking-tight">
                    {getPlaylistInitials(playlist.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate leading-tight">{playlist.name}</p>
                  <p className="text-[10px] text-[#52525b] group-hover:text-[#a1a1aa] transition-colors">
                    {songCount} {songCount === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-[12px] text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-all duration-200 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center flex-shrink-0 border border-dashed border-[rgba(255,255,255,0.1)] group-hover:border-white/20 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">New Playlist</span>
        </button>
      </div>

      <CreatePlaylistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreated={(p) => {
          setPlaylists([p, ...playlists]);
          router.push(`/playlist/${p.id}`);
        }}
      />

      {/* Bottom section: User card */}
      {isAuthenticated && (
        <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3 p-2 rounded-[16px] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 group">
            <div className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-white truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-[12px] text-[#52525b] truncate">
                {user?.email}
              </p>
            </div>

            <button 
              onClick={() => signOut()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#52525b] hover:text-white hover:bg-[#222222] transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
