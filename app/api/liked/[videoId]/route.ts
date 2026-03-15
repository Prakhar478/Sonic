import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ liked: false })

  const { data } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  return NextResponse.json({ liked: !!data })
}
