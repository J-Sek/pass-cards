import { createVuetify } from 'vuetify';
import { vuetifyOptions } from '@pass-cards/core';

export default defineNuxtPlugin((app) => {
  app.vueApp.use(createVuetify(vuetifyOptions));
});
