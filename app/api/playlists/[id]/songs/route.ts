import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, title, artist, thumbnail, duration } = await request.json()

  // Check if song already exists in this playlist
  const { data: existing } = await supabase
    .from('playlist_songs')
    .select('id')
    .eq('playlist_id', id)
    .eq('video_id', videoId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Song already in playlist', alreadyExists: true }, { status: 409 })
  }

  // Get current max position
  const { data: last } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = (last?.position ?? -1) + 1

  const { error } = await supabase.from('playlist_songs').insert({
    playlist_id: id,
    video_id: videoId,
    title,
    artist,
    thumbnail,
    duration,
    position,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { songId } = await request.json()
  await supabase.from('playlist_songs').delete().eq('id', songId).eq('playlist_id', id)
  return NextResponse.json({ success: true })
}
