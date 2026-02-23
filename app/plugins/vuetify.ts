import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#eceffe',
          surface: '#f7f7ff',
          'on-surface': '#3f357a',
          primary: '#8330f7',
          'on-primary': '#fffeff',
        },
        variables: {},
      },
      dark: {
        dark: true,
        colors: {
          background: '#413680',
          surface: '#211b3d',
          'on-surface': '#e3e6fc',
          primary: '#dfd5ff',
          'on-primary': '#6019be',
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
    global: {
      ripple: false,
    },
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
    VChip: {
      label: true,
      size: 'small',
    },
    VCard: {
      rounded: 'lg',
    },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  }
})

export default defineNuxtPlugin((app) => {
  app.vueApp.use(vuetify);
});
