import { Capacitor, registerPlugin } from '@capacitor/core'

const YouTubeMusic = registerPlugin('YouTubeMusic')

export async function getNativeStreamUrl(videoId: string): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) return null

    try {
        const result = await (YouTubeMusic as any).getStreamUrl({ videoId }) as { streamUrl: string }
        return result.streamUrl
    } catch (e) {
        console.error('Native stream error:', e)
        return null
    }
}