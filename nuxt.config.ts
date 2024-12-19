import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

const appTitle = 'Pass Cards'
const appDescription = 'Security utility to help me remember master passwords'
const targetDomain = process.env.BASE_URL

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  devtools: { enabled: false },
  sourcemap: false,
  ssr: false,

  app: {
    head: {
      htmlAttrs: { lang: 'en-US', style: 'overflow-y: auto', class: 'c-app' },
      titleTemplate: appTitle,
      title: 'Loading...',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `https://${targetDomain}?utm_source=oglink` },
        { property: 'og:image', content: `https://${targetDomain}/images/screenshot.png` },
        { property: 'og:image:width', content: '1280' },
        { property: 'og:image:height', content: '720' },
        { name: 'theme-color', content: '#211b3d' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/images/pwa/icon-192.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/images/icon.svg' },
      ],
    },
    pageTransition: { name: 'fade-transition', mode: 'out-in' },
    layoutTransition: { name: 'fade-transition', mode: 'out-in' },
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error typical Vuetify config
        config.plugins.push(vuetify({
          autoImport: { labs: true },
          styles: { configFile: './assets/settings.scss' },
        }));
      });
    },
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'unplugin-fonts/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/plausible',
  ],

  components: [{ path: 'components', pathPrefix: false, extensions: ['vue'] }],

  build: {
    transpile: ['vuetify'],
  },

  unfonts: {
    fontsource: {
      families: [
        { name: 'Azeret Mono', weights: [400], subset: 'latin' },
        { name: 'Red Hat Mono', weights: [500], subset: 'latin' },
        { name: 'Kanit', weights: [400, 500, 700], subset: 'latin' },
      ],
    },
  },

  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: appTitle,
      short_name: appTitle,
      theme_color: '#211b3d',
      description: appDescription,
      display_override: ['minimal-ui'],
      display: 'standalone',
      icons: [
        { src: '/images/pwa/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/images/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/images/pwa/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      screenshots : [
        {
          src: '/images/screenshot.jpg',
          sizes: '1280x720',
          type: 'image/jpg',
          platform: 'wide',
        }
      ],
      orientation: 'any',
      categories: ['security']
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  $development: {
    plausible: {
      enabled: false,
    },
  },

  $production: {
    plausible: {
      domain: targetDomain,
    },
  },

  compatibilityDate: '2024-12-16',
})