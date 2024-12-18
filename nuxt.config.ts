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
        { rel: "icon", type: "image/svg+xml", href: "/images/icon.svg" },
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
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    'unplugin-fonts/nuxt',
    '@nuxtjs/plausible',
  ],

  components: [{ path: 'components', pathPrefix: false, extensions: ['vue'] }],

  build: {
    transpile: ['vuetify'],
  },

  unfonts: {
    fontsource: {
      families: [
        { name: 'Azeret Mono', weights: [400, 500, 700] },
        { name: 'Red Hat Mono', weights: [400, 500, 700] },
        { name: 'Kanit', weights: [400, 500, 700] },
      ],
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

  plausible: {
    domain: targetDomain,
  },

  compatibilityDate: '2024-12-16',
})