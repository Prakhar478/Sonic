const videoId = '4adZ7AguVcw';
const CLIENTS = [
  {
    name: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER',
    version: '2.0',
    apiKey: 'AIzaSyDCU8hByM-4DrUqRUYnGn-3llEO78bcxq8',
    userAgent: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/538.1 (KHTML, like Gecko) Version/6.0 TV Safari/538.1',
    androidSdkVersion: undefined,
    extraContext: {
      thirdParty: {
        embedUrl: 'https://www.youtube.com/',
      },
    },
  },
];

async function test() {
  for (const client of CLIENTS) {
    try {
      console.log(`[Stream] Testing ${client.name}...`);
      const res = await fetch(
        `https://www.youtube.com/youtubei/v1/player?key=${client.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': client.userAgent,
            'Origin': 'https://www.youtube.com',
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: client.name,
                clientVersion: client.version,
                hl: 'en',
                gl: 'US',
                ...(client.androidSdkVersion && { androidSdkVersion: client.androidSdkVersion }),
              },
              ...(client.extraContext && client.extraContext),
            },
            videoId,
            playbackContext: {
              contentPlaybackContext: { signatureTimestamp: 19369 },
            },
          }),
        }
      );

      const data = await res.json();
      const formats = data.streamingData?.formats || [];
      const withUrl = formats.filter(f => f.url);

      console.log(`[Stream] ${client.name}: Formats Total: ${formats.length} | With URL: ${withUrl.length}`);
      
      if (withUrl.length > 0) {
          console.log(`[Stream] ${client.name} Sample Mime: ${withUrl[0].mimeType}`);
          console.log(`[Stream] ${client.name} Sample URL Snippet: ${withUrl[0].url.substring(0, 50)}...`);
      }
    } catch (e) {
      console.error(`[Stream] ${client.name} Error:`, e.message);
    }
  }
}

test();
