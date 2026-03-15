import { create } from 'zustand';

export interface Song {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: number
}

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerStore {
  // State
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: RepeatMode;
  shuffle: boolean;
  seekTo: number | undefined;

  // Playback actions
  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;

  // Player state actions
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  seek: (time: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;

  // Queue actions
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
}

function getShuffledIndex(currentIndex: number, length: number): number {
  if (length <= 1) return 0;
  let next: number;
  do {
    next = Math.floor(Math.random() * length);
  } while (next === currentIndex);
  return next;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  repeat: 'off',
  shuffle: false,
  seekTo: undefined,

  playSong: async (song, queue) => {
    // Guard — don't play if no videoId
    if (!song?.videoId) return

    if (queue) {
      const index = queue.findIndex((s) => s.videoId === song.videoId);
      set({
        queue,
        queueIndex: index >= 0 ? index : 0,
      });
    }

    set({
      currentSong: song,
      isPlaying: true,
      progress: 0,
      duration: song.duration || 0,
      seekTo: undefined,
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (repeat === 'one') {
      nextIndex = queueIndex;
    } else if (shuffle) {
      nextIndex = getShuffledIndex(queueIndex, queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0;
        else return; // end of queue
      }
    }

    set({ queueIndex: nextIndex });
    get().playSong(queue[nextIndex]);
  },

  prev: () => {
    const { queue, queueIndex, progress, repeat } = get();
    if (queue.length === 0) return;

    // If >3s into song, restart instead of going back
    if (progress > 3) {
      set({ progress: 0, seekTo: 0 });
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (repeat === 'all') prevIndex = queue.length - 1;
      else prevIndex = 0;
    }

    set({ queueIndex: prevIndex });
    get().playSong(queue[prevIndex]);
  },

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  seek: (time) => set({ progress: time, seekTo: time }),
  toggleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
    })),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  addToQueue: (song) =>
    set((s) => ({ queue: [...s.queue, song] })),
  removeFromQueue: (index) =>
    set((s) => ({
      queue: s.queue.filter((_, i) => i !== index),
      queueIndex: index < s.queueIndex ? s.queueIndex - 1 : s.queueIndex,
    })),
  clearQueue: () => set({ queue: [], queueIndex: -1 }),
  setQueue: (songs, startIndex = 0) =>
    set({ queue: songs, queueIndex: startIndex }),
}));
