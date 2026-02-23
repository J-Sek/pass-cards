<template lang="pug">
v-app.bg-surface-container
  v-app-bar
    v-app-bar-title
      .flex.items-center
        v-avatar(image='/images/icon.svg' size='32')
        .ml-3 #[b(:style='{ color: isDark ? "#e1b847" : "" }') Pass Cards]
  v-footer.border-t.pr-2(app)
    .flex.items-center.text-sm &copy; {{ year }} #[v-divider.mx-3.my-1(vertical opacity='.7')] J_SEK Solutions
    v-btn(
      :icon='mdiCardAccountDetailsOutline'
      v-tooltip:top='"Open developer website"'
      class='ml-2 -my-3 opacity-60 text-primary'
      href='https://jsek.work/'
      rounded='lg'
      size='small'
      target='_blank'
      variant='text'
    )
    .ml-auto.mr-3.text-sm.opacity-60 {{ $config.public.version }}
    theme-config-menu(location='top end' offset='8' viewport-margin='4')
      template(#activator='{ props }')
        v-btn(
          v-bind='props'
          v-tooltip:top='"Configure theme"'
          :icon='mdiThemeLightDark'
          class='-my-3 text-grey-500'
          rounded='lg'
          size='small'
          variant='text'
        )
  slot
</template>

<script setup lang="ts">
import { mdiCardAccountDetailsOutline, mdiThemeLightDark } from '@mdi/js'
const { isDark } = useAppThemeStore()
const year = new Date().getFullYear()
</script>
