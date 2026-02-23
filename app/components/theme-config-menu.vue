<template lang="pug">
v-menu(:close-on-content-click='false' capture-focus retain-focus)
  template(#activator='{ props }')
    slot(name='activator' v-bind='{ props }')

  v-card.p-6(rounded='lg' min-width='220')
    .text-xs.text-medium-emphasis.mb-2 Mode
    v-tabs.mb-6(
      v-model='themeMode'
      mandatory
      density='compact'
      slider-color='primary'
      slider-transition="fade"
      rounded='lg'
      inset
    )
      v-tab(rounded="lg" value='light' size='small' :prepend-icon='mdiWeatherSunny' text='Light')
      v-tab(rounded="lg" value='system' size='small' :prepend-icon='mdiThemeLightDark' text='System')
      v-tab(rounded="lg" value='dark' size='small' :prepend-icon='mdiWeatherNight' text='Dark')

    .text-xs.text-medium-emphasis.mb-2 Primary color
    .flex.gap-2.flex-wrap.mb-6
      button.swatch(
        v-for='p in primaryOptions'
        :key='p.id'
        :aria-label='`Select ${p.label}`'
        :style='{ background: isDark ? p.dark : p.light }'
        :class='{ active: primaryColor === p.id }'
        @click='primaryColor = p.id'
        v-tooltip:top='p.label'
      )

    .text-xs.text-medium-emphasis.mb-2 Surface tint
    .flex.gap-2.flex-wrap.mb-3
      button.swatch(
        v-for='s in surfaceOptions'
        :key='s.id'
        :aria-label='`Select ${s.label} tint`'
        :style='{ background: `color-mix(in srgb, ${isDark ? s.darkSurface : s.lightSurface}, rgb(var(--v-theme-on-surface)) 30%)` }'
        :class='{ active: surfaceColor === s.id }'
        @click='surfaceColor = s.id'
        v-tooltip:top='s.label'
      )
</template>

<script setup lang="ts">
import { mdiThemeLightDark, mdiWeatherSunny, mdiWeatherNight } from '@mdi/js'
import { primaryOptions, surfaceOptions } from '~/composables/theme'

const { isDark, themeMode, primaryColor, surfaceColor } = useAppThemeStore()
</script>

<style scoped>
@reference "../assets/tailwind.css";

.swatch {
  @apply size-[26px] rounded-full shrink-0;
  @apply border-[1.5px] border-gray-500/25;
  @apply active:scale-[.97];
}

.active {
  outline: 2px solid rgb(var(--v-theme-on-surface));
  outline-offset: 2px;
}
</style>
