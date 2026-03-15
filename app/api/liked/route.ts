import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — fetch all liked songs for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('liked_songs')
    .select('*')
    .order('liked_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ songs: data })
}

// POST — like or unlike a song (toggle)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { videoId, title, artist, thumbnail, duration } = body

  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

  // Check if already liked
  const { data: existing } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  if (existing) {
    // Unlike
    await supabase.from('liked_songs').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  } else {
    // Like
    await supabase.from('liked_songs').insert({
      user_id: user.id,
      video_id: videoId,
      title,
      artist,
      thumbnail,
      duration,
    })
    return NextResponse.json({ liked: true })
  }
}
