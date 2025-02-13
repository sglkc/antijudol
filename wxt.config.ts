import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    permissions: ['activeTab', 'scripting'],
  },
  runner: {
    chromiumArgs: ['--user-data-dir=./.wxt/chrome-data'],
  }
});
