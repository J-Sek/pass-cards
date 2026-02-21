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
      v-tooltip:top='"Open developer website"'
    )
    .ml-auto.mr-3.text-body-2.opacity-40 {{ $config.public.version }}
    theme-config-menu(location='top end' offset='8' viewport-margin='4')
      template(#activator='{ props }')
        v-btn.my-n3(
          variant='text' rounded='lg' size='small' color='grey'
          :icon='mdiThemeLightDark'
          v-bind='props'
          v-tooltip:top='"Configure theme"'
        )
  slot
</template>

<script setup lang="ts">
import { mdiCardAccountDetailsOutline, mdiThemeLightDark } from '@mdi/js'
const { isDark } = useAppThemeStore()
</script>
