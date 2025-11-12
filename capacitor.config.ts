import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.personality.test',
  appName: '나를 찾아줘',
  webDir: '.next/standalone/public',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    iosScheme: 'capacitor'
  }
};

export default config;
