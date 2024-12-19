<template lang="pug">
v-app.bg-surface-container
  v-app-bar
    v-app-bar-title
      .d-flex.align-center
        v-avatar(image='/images/icon.svg' size='32')
        .ml-3 #[b(:style='{ color: isDark ? "#e1b847" : "" }') Pass Cards]
  v-footer.border-t.pr-2(app)
    .d-flex.align-center &copy; 2024 #[v-divider.mx-3.my-1(vertical opacity='.7')] J_SEK Solutions
    v-btn.ml-2.my-n3.opacity-60(
      variant='text' rounded='lg' size='small' color='primary'
      :icon='mdiCardAccountDetailsOutline'
      target='_blank' href='https://jsek.work/'
      v-tooltip:bottom='"Open developer website"'
    )
    v-btn.ml-auto.bg-surface-dim.my-n3(
      rounded='lg' size='small'
      :icon='mdiThemeLightDark'
      @click='toggleTheme'
      v-tooltip:bottom='"Toggle theme"'
    )
  slot
</template>

<script setup lang="ts">
import { mdiCardAccountDetailsOutline, mdiThemeLightDark } from '@mdi/js'
const { isDark, toggleTheme } = useAppTheme()
</script>
