import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'vuetify'],
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    testTimeout: 15000,
    server: { deps: { inline: ['vuetify'] } },
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
    },
  },
})
