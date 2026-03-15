import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prakhar.sonic',
  appName: 'Sonic',
  webDir: 'www',
  server: {
    url: 'https://sonic-amber-three.vercel.app',
    cleartext: true
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;