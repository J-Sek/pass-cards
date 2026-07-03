import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import AutoImport from 'unplugin-auto-import/vite'

const app = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    // Mirror Nuxt's auto-imports so the real SFCs mount unchanged: Vue + VueUse
    // APIs and everything exported from app/composables and app/utils.
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        { '@vueuse/router': ['useRouteQuery', 'useRouteHash'] },
      ],
      dirs: ['./app/composables', './app/utils'],
      dts: false,
    }),
  ],
  resolve: {
    alias: { '~': app, '@': app },
    // @vueuse/router pulls in a second vue-router copy; a mismatched instance
    // breaks route injection, so force everyone onto the app's single copy.
    dedupe: ['vue', 'vue-router', 'vuetify'],
  },
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    testTimeout: 15000,
    server: { deps: { inline: ['vuetify'] } },
    browser: {
      enabled: true,
      // headless: true,
      provider: playwright(),
      // Desktop width: settings panel slides aside (not over the cards) and the
      // >=1200px layout is exercised, matching typical usage.
      instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
    },
  },
})
