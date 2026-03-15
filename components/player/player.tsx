'use client';

import { useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, Heart, ListMusic, Music
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player-store';
import { YouTubePlayer } from './youtube-player';
import { useLikedSongs } from '@/hooks/useLikedSongs';

export function Player() {
  const progressRef = useRef<HTMLDivElement>(null);

  const {
    currentSong, isPlaying, volume, progress, duration,
    repeat, shuffle, seekTo, togglePlay, next, prev,
    setVolume, setProgress, setDuration, seek, toggleRepeat, toggleShuffle,
  } = usePlayerStore();

  const { isLiked, toggleLike } = useLikedSongs(currentSong?.videoId);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width * (duration || 0));
  };

  const likeProps = {
    videoId: currentSong.videoId, title: currentSong.title,
    artist: currentSong.artist, thumbnail: currentSong.thumbnail,
    duration: currentSong.duration,
  };

  return (
    <>
      <YouTubePlayer
        videoId={currentSong.videoId}
        isPlaying={isPlaying}
        volume={volume}
        seekTo={seekTo}
        onReady={(d) => setDuration(d)}
        onProgress={(t) => setProgress(t)}
        onEnded={() => next()}
        onError={() => next()}
      />

      {/* ── MOBILE PLAYER (below md) ── */}
      <div className="md:hidden fixed bottom-[56px] left-0 right-0 z-50 bg-[rgba(0,0,0,0.95)] backdrop-blur-2xl border-t border-[rgba(255,255,255,0.08)]">

        {/* Progress bar — full width at top */}
        <div className="h-0.5 w-full bg-[rgba(255,255,255,0.08)] cursor-pointer" onClick={handleProgressClick}>
          <div className="h-full bg-[#2563eb] transition-all duration-100" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Song info + like row */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-1">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#141414] border border-[rgba(255,255,255,0.08)]">
            {currentSong.thumbnail
              ? <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Music className="w-5 h-5 text-[#52525b]" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{currentSong.title}</p>
            <p className="text-[11px] text-[#a1a1aa] truncate mt-0.5">{currentSong.artist}</p>
          </div>
          <button onClick={() => toggleLike(likeProps)} className={cn('flex-shrink-0 p-1', isLiked ? 'text-[#2563eb]' : 'text-[#a1a1aa]')}>
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Controls row — all 5 controls with equal spacing */}
        <div className="flex items-center justify-between px-6 py-3">
          {/* Shuffle */}
          <button onClick={toggleShuffle} className={cn('flex flex-col items-center gap-0.5 relative', shuffle ? 'text-[#2563eb]' : 'text-[#a1a1aa]')}>
            <Shuffle className="w-5 h-5" />
            {shuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563eb]" />}
          </button>

          <button onClick={prev} className="text-white">
            <SkipBack className="w-6 h-6" />
          </button>

          <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center shadow-lg">
            {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-0.5" fill="currentColor" />}
          </button>

          <button onClick={next} className="text-white">
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Repeat */}
          <button onClick={toggleRepeat} className={cn('flex flex-col items-center relative', repeat !== 'off' ? 'text-[#2563eb]' : 'text-[#a1a1aa]')}>
            {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            {repeat !== 'off' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563eb]" />}
          </button>
        </div>

        {/* Time row */}
        <div className="flex items-center justify-between px-5 pb-2">
          <span className="text-[10px] text-[#52525b] font-mono">{formatDuration(progress)}</span>
          <span className="text-[10px] text-[#52525b] font-mono">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* ── DESKTOP PLAYER (md+) ── */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 h-[88px] bg-[rgba(0,0,0,0.92)] backdrop-blur-2xl border-t border-[rgba(255,255,255,0.08)] px-6 items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4 w-[30%] min-w-0">
          <div className="w-[52px] h-[52px] rounded-[10px] overflow-hidden flex-shrink-0 bg-[#141414] border border-[rgba(255,255,255,0.08)]">
            {currentSong.thumbnail
              ? <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Music className="w-6 h-6 text-[#52525b]" /></div>
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-[12px] font-medium text-[#a1a1aa] truncate mt-0.5">{currentSong.artist}</p>
          </div>
          <button onClick={() => toggleLike(likeProps)} className={cn('flex-shrink-0 ml-2', isLiked ? 'text-[#2563eb]' : 'text-[#a1a1aa] hover:text-white')}>
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center flex-1 w-[40%] px-4 gap-2">
          <div className="flex items-center gap-6">
            <button onClick={toggleShuffle} className={cn('relative transition-all', shuffle ? 'text-[#2563eb]' : 'text-[#a1a1aa] hover:text-white')}>
              <Shuffle className="w-4 h-4" />
              {shuffle && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563eb]" />}
            </button>
            <button onClick={prev} className="text-[#a1a1aa] hover:text-white transition-all">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center transition-all">
              {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
            </button>
            <button onClick={next} className="text-[#a1a1aa] hover:text-white transition-all">
              <SkipForward className="w-5 h-5" />
            </button>
            <button onClick={toggleRepeat} className={cn('relative transition-all', repeat !== 'off' ? 'text-[#2563eb]' : 'text-[#a1a1aa] hover:text-white')}>
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              {repeat !== 'off' && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563eb]" />}
            </button>
          </div>
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-[10px] font-mono text-[#a1a1aa] min-w-[32px] text-right">{formatDuration(progress)}</span>
            <div className="h-1 flex-1 relative cursor-pointer group flex items-center" onClick={handleProgressClick}>
              <div className="absolute inset-0 h-1 rounded-full bg-[rgba(255,255,255,0.1)]" />
              <div className="absolute h-1 rounded-full bg-[#2563eb] transition-all duration-100" style={{ width: `${progressPercent}%` }} />
              <div className="absolute h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow" style={{ left: `calc(${progressPercent}% - 6px)` }} />
            </div>
            <span className="text-[10px] font-mono text-[#a1a1aa] min-w-[32px]">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-4 w-[30%]">
          <button className="text-[#a1a1aa] hover:text-white transition-all">
            <ListMusic className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 w-28 group">
            <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-[#a1a1aa] hover:text-white transition-all">
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="h-1 flex-1 relative rounded-full bg-[rgba(255,255,255,0.1)] flex items-center cursor-pointer overflow-hidden">
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute h-1 rounded-full bg-[#a1a1aa] group-hover:bg-[#2563eb] transition-colors" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}