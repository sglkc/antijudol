import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    permissions: ['offscreen'],
    host_permissions: ['https://*.youtube.com/*']
  },
  runner: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  }
});
