const videoId = '4adZ7AguVcw';
const CLIENTS = [
  {
    name: 'ANDROID_MUSIC',
    version: '6.42.52',
    apiKey: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    userAgent: 'com.google.android.apps.youtube.music/6.42.52 (Linux; U; Android 11) gzip',
    androidSdkVersion: 30,
  },
  {
    name: 'ANDROID',
    version: '18.11.34',
    apiKey: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    userAgent: 'com.google.android.youtube/18.11.34 (Linux; U; Android 11) gzip',
    androidSdkVersion: 30,
  },
  {
    name: 'IOS',
    version: '19.09.3',
    apiKey: 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc',
    userAgent: 'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
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
        console.log(`[Stream] ${client.name} Reason: ${data.playabilityStatus.reason}`);
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
