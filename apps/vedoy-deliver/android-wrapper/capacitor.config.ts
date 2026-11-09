import type { CapacitorConfig } from '@capacitor/cli';
// Online pilot. Capacitor server.url should NOT be used for a production Google Play app.
const config: CapacitorConfig = {
  appId: 'vedoystudio.vedoydeliver',
  appName: 'Vedoy Deliver',
  webDir: 'www',
  server: { url: 'https://vedoy-deliver.vercel.app', cleartext: false },
  android: { allowMixedContent: false }
};
export default config;
