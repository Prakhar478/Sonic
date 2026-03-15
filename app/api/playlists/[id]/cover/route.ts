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

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `${user.id}/${id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('playlist-covers')
    .upload(path, file, { upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('playlist-covers')
    .getPublicUrl(path)

  // Update playlist cover_image
  await supabase.from('playlists')
    .update({ cover_image: publicUrl })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ url: publicUrl })
}
