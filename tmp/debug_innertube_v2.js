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
  {
    name: 'WEB_EMBEDDED_PLAYER',
    version: '2.20231219.01.00',
    apiKey: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    androidSdkVersion: undefined,
    extraContext: {
      thirdParty: {
        embedUrl: 'https://www.youtube.com/',
      },
    },
  },
  {
    name: 'WEB',
    version: '2.20231219.01.00',
    apiKey: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    androidSdkVersion: undefined,
    extraContext: undefined,
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

      console.log(`[Stream] ${client.name}: HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.playabilityStatus) {
        console.log(`[Stream] ${client.name} Status: ${data.playabilityStatus.status}`);
        if (data.playabilityStatus.reason) {
          console.log(`[Stream] ${client.name} Reason: ${data.playabilityStatus.reason}`);
        }
        if (data.streamingData?.adaptiveFormats) {
            console.log(`[Stream] ${client.name} Success: Found ${data.streamingData.adaptiveFormats.length} formats`);
        } else {
            console.log(`[Stream] ${client.name} No streamingData found.`);
        }
      } else {
        console.log(`[Stream] ${client.name} No playabilityStatus. Full response:`, JSON.stringify(data).substring(0, 500));
      }
    } catch (e) {
      console.error(`[Stream] ${client.name} Error:`, e.message);
    }
    console.log('---');
  }
}

test();
