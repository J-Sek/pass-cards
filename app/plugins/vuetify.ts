import '../assets/main.scss';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';


const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#f7f7ff',
          'on-background': '#3f357a',
          surface: '#f7f7ff',
          'surface-dim': '#dcdffb',
          'surface-bright': '#f7f7ff',
          'surface-container-lowest': '#fdfbff',
          'surface-container-low': '#f2f3fe',
          'surface-container': '#eceffe',
          'surface-container-high': '#e8eafd',
          'surface-container-highest': '#e3e6fc',
          'on-surface': '#3f357a',
          outline: '#64748b',
          'outline-variant': '#e2e8f0',
          primary: '#8330f7',
          'on-primary': '#fffeff',
          'primary-container': '#ede8ff',
          'on-primary-container': '#4a148c',
          secondary: '#df9100',
          'on-secondary': '#ffffff',
          'secondary-container': '#fffac6',
          'on-secondary-container': '#7c420b',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#410002',
        },
        variables: {},
      },
      dark: {
        dark: true,
        colors: {
          background: '#211b3d',
          'on-background': '#e3e6fc',
          surface: '#211b3d',
          'surface-dim': '#211b3d',
          'surface-bright': '#523ea8',
          'surface-container-lowest': '#120e23',
          'surface-container-low': '#3f357a',
          'surface-container': '#413680',
          'surface-container-high': '#47398f',
          'surface-container-highest': '#4f3ca0',
          'on-surface': '#e3e6fc',
          outline: '#94a3b8',
          'outline-variant': '#334155',
          primary: '#dfd5ff',
          'on-primary': '#6019be',
          'primary-container': '#731ee3',
          'on-primary-container': '#ede8ff',
          secondary: '#fff588',
          'on-secondary': '#985008',
          'secondary-container': '#bb6802',
          'on-secondary-container': '#fffac6',
          error: '#ffb4ab',
          'on-error': '#690005',
          'error-container': '#930009',
          'on-error-container': '#ffb4ab',
        },
        variables: {},
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VSelect: {
      variant: 'outlined',
      hideDetails: 'auto',
      density: 'compact',
    },
    VTextField: {
      variant: 'outlined',
      hideDetails: 'auto',
      density: 'compact',
    },
    VOtpInput: {
      variant: 'outlined',
      hideDetails: 'auto',
      density: 'compact',
      style: 'padding: 0'
    },
    VBtn: {
      rounded: 'pill',
      variant: 'flat',
      color: 'secondary',
    },
    VChip: {
      label: true,
      size: 'small',
    },
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VCardTitle: {
      class: 'text-h5',
    },
  },
})

export default defineNuxtPlugin((app) => {
  app.vueApp.use(vuetify);
});
