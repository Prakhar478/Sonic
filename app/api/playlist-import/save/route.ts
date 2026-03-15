import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, thumbnail, songs } = await request.json()

    if (!title?.trim() || !Array.isArray(songs) || songs.length === 0) {
        return NextResponse.json({ error: 'Title and songs required' }, { status: 400 })
    }

    // 1. Create the playlist
    const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .insert({
            user_id: user.id,
            name: title.trim(),
            description: `Imported from YouTube • ${songs.length} songs`,
            cover_image: thumbnail || null,
            is_public: false,
        })
        .select()
        .single()

    if (playlistError) {
        return NextResponse.json({ error: playlistError.message }, { status: 500 })
    }

    // 2. Bulk insert all songs with position index
    const rows = songs.map((song: any, index: number) => ({
        playlist_id: playlist.id,
        video_id: song.videoId,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration || 0,
        position: index,
    }))

    // Insert in batches of 100 to avoid Supabase payload limits
    const BATCH = 100
    for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase
            .from('playlist_songs')
            .insert(rows.slice(i, i + BATCH))

        if (error) {
            // Playlist was created — clean it up on failure
            await supabase.from('playlists').delete().eq('id', playlist.id)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    }

    return NextResponse.json({ playlist })
}