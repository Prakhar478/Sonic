import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: playlist } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: songs } = await supabase
    .from('playlist_songs')
    .select('*')
    .eq('playlist_id', id)
    .order('position', { ascending: true })

  return NextResponse.json({ playlist, songs: songs || [] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, description, cover_image, color } = body

  const { data, error } = await supabase
    .from('playlists')
    .update({ 
      ...(name && { name }), 
      ...(description !== undefined && { description }), 
      ...(cover_image && { cover_image }),
      ...(color && { color }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ playlist: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('playlists').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
