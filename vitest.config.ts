import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import AutoImport from 'unplugin-auto-import/vite'

const app = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
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
    dedupe: ['vue', 'vue-router', 'vuetify'],
  },
  test: {
    globals: true,
    testTimeout: 15000,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          setupFiles: ['./test/setup.ts'],
          include: ['test/*.spec.ts'],
          server: { deps: { inline: ['vuetify'] } },
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', viewport: { width: 1280, height: 800 } }],
          },
        },
      },
    ],
  },
})
