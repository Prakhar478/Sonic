// ─── User & Auth ───────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Song & Stream ─────────────────────────────────────────
export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;          // seconds
  uploaderUrl?: string;
  uploaderAvatar?: string;
}

export interface AudioStream {
  url: string;
  format: string;
  quality: string;
  mimeType: string;
  bitrate: number;
  contentLength: number;
}

export interface PipedStreamResponse {
  title: string;
  uploader: string;
  uploaderUrl: string;
  uploaderAvatar: string;
  thumbnailUrl: string;
  duration: number;
  audioStreams: AudioStream[];
}

export interface PipedSearchResponse {
  items: PipedSearchItem[];
  nextpage: string | null;
  suggestion: string | null;
  corrected: boolean;
}

export interface PipedSearchItem {
  url: string;
  type: 'stream' | 'channel' | 'playlist';
  title: string;
  thumbnail: string;
  uploaderName: string;
  uploaderUrl: string;
  uploaderAvatar: string;
  duration: number;
  views: number;
  uploaded: number;
  uploadedDate: string;
  shortDescription: string;
}

// ─── Playlist ──────────────────────────────────────────────
export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  is_public: boolean;
  created_at: string;
  song_count?: number;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  video_id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  position: number;
  added_at: string;
}

// ─── Liked Songs ───────────────────────────────────────────
export interface LikedSong {
  id: string;
  user_id: string;
  video_id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  liked_at: string;
}

// ─── Player ────────────────────────────────────────────────
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;            // 0–1
  progress: number;          // seconds
  duration: number;          // seconds
  repeat: RepeatMode;
  shuffle: boolean;
  streamUrl: string | null;
}

// ─── API Response ──────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// ─── Payment (stub) ────────────────────────────────────────
export interface Payment {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  created_at: string;
}
