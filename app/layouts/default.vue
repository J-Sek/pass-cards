<template lang="pug">
v-app.bg-surface-container
  v-app-bar
    v-app-bar-title
      .d-flex.align-center
        v-avatar(image='/images/icon.svg' size='32')
        .ml-3 #[b(:style='{ color: isDark ? "#e1b847" : "" }') Pass Cards]
  v-footer.border-t.pr-2(app)
    .d-flex.align-center &copy; 2024 #[v-divider.mx-3.my-1(vertical opacity='.7')] J_SEK Solutions
    v-btn.ml-auto.bg-surface-dim.my-n3(rounded='lg' size='small' icon='mdi-theme-light-dark' @click='toggleTheme' v-tooltip:bottom='"Toggle theme"')
  slot
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useAppTheme()
</script>
