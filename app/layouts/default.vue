<template lang="pug">
v-app.bg-surface-container
  v-app-bar
    v-app-bar-title
      .d-flex.align-center
        v-avatar(image='/images/icon.svg' size='32')
        .ml-3 #[b Pass Cards]
    template(#append)
      .d-flex.align-center.ga-2.align-self-stretch.mr-6
        v-btn.bg-surface-dim(rounded='lg' size='36' icon='mdi-theme-light-dark' @click='toggleTheme' v-tooltip:bottom='"Toggle theme"')
  v-footer.justify-center.border-t(app) &copy; 2024 - {{ new Date().getFullYear() }} | J_SEK Solutions
  slot
</template>

<script setup lang="ts">
const { toggleTheme } = useAppTheme()
</script>
