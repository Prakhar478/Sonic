'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">🎵</div>
      <h1 className="text-2xl font-bold text-white">You're offline</h1>
      <p className="text-[#a1a1aa] text-center max-w-sm">
        No internet connection. Connect to the internet to stream music.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-[#2563eb] text-white rounded-full font-medium hover:bg-[#1d4ed8] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
