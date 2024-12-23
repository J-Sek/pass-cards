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
          background: '#eceffe',
          surface: '#f7f7ff',
          'on-surface': '#3f357a',
          primary: '#8330f7',
          'on-primary': '#fffeff',
          secondary: '#df9100',
          'on-secondary': '#ffffff',
          error: '#ba1a1a',
          'on-error': '#ffffff',
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
          secondary: '#fff588',
          'on-secondary': '#985008',
          error: '#ffb4ab',
          'on-error': '#690005',
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
