import { NextRequest, NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  // Updated cache key for final logic
  const cacheKey = `search:yt:final:${q.toLowerCase().trim()}`
  const cached = getCache(cacheKey)
  if (cached) return NextResponse.json(cached)

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
  }

  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('q', q)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('videoCategoryId', '10')
    searchUrl.searchParams.set('videoEmbeddable', 'true')
    searchUrl.searchParams.set('maxResults', '20')
    searchUrl.searchParams.set('key', apiKey)

    const searchRes = await fetch(searchUrl.toString())
    const searchData = await searchRes.json()

    if (!searchRes.ok) {
      console.error('YouTube search error:', searchData)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    const videoIds = (searchData.items || [])
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => item.id.videoId)
      .join(',')

    if (!videoIds) return NextResponse.json({ songs: [], query: q })

    const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
    detailsUrl.searchParams.set('part', 'contentDetails')
    detailsUrl.searchParams.set('id', videoIds)
    detailsUrl.searchParams.set('key', apiKey)

    const detailsRes = await fetch(detailsUrl.toString())
    const detailsData = await detailsRes.json()

    const durationMap: Record<string, number> = {}
    for (const item of detailsData.items || []) {
      const iso = item.contentDetails?.duration || 'PT0S'
      const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        durationMap[item.id] =
          (parseInt(match[1] || '0') * 3600) +
          (parseInt(match[2] || '0') * 60) +
          parseInt(match[3] || '0')
      }
    }

    const songs = (searchData.items || [])
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"'),
        artist: item.snippet.channelTitle
          .replace(/VEVO$/i, '')
          .replace(/- Topic$/i, '')
          .trim(),
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        duration: durationMap[item.id.videoId] || 0,
      }))
      .filter((song: any) => {
        if (song.duration > 0 && song.duration < 60) return false
        if (song.duration > 600) return false
        if (/slowed|reverb|nightcore|sped up/i.test(song.title)) return false
        if (/karaoke|guitar lesson|tutorial|wedding|tribute/i.test(song.title)) return false
        if (/\(lyrics?\)|\[lyrics?\]/i.test(song.title)) return false
        if (/lyrics & meaning|lyrics and meaning/i.test(song.title)) return false
        if (/live performance|open mic/i.test(song.title)) return false
        if (/\[가사|번역|해석/i.test(song.title)) return false  // Korean lyrics videos
        return true
      })
      .sort((a: any, b: any) => {
        const officialScore = (s: any) => {
          const t = s.title.toLowerCase()
          const ar = s.artist.toLowerCase()
          if (t.includes('official audio')) return 3
          if (t.includes('official music video') || t.includes('official video')) return 2
          if (ar === 'yung kai' || ar.endsWith('vevo') || ar.endsWith('topic')) return 1
          return 0
        }
        return officialScore(b) - officialScore(a)
      })
      .slice(0, 10)

    const result = { songs, query: q }
    setCache(cacheKey, result, 15 * 60 * 1000)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
