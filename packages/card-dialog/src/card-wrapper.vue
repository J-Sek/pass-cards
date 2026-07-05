<template lang="pug">
div
  .card-page(:class='{ open: isOpen, animating }')
    slot
  .backdrop(@click.stop='open = false')
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ zoomLevel: number }>()

const open = defineModel<boolean>('open', { default: false })
const isOpen = ref(false)
const animating = ref(false)

watch(open, (v) => {
  if (!document.startViewTransition) {
    isOpen.value = v
  } else {
    animating.value = true
    document.startViewTransition(() => isOpen.value = v)
      .finished.then(() => animating.value = false)
  }
})
</script>

<style>
.card-page {
  position: relative;

  + .backdrop {
    position: fixed;
    inset: 0;
    z-index: 998;
    backdrop-filter: blur(4px);
    background-color: #0006;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s linear;
  }

  &.animating {
    view-transition-name: card;
  }

  &.open {
    position: fixed;
    inset: 64px 0 42px;
    margin: auto;
    width: fit-content;
    height: fit-content;
    scale: v-bind(zoomLevel);
    z-index: 999;

    > .v-card {
      overflow: auto;
      min-height: 150px;
      max-height: calc(100dvh - 78px);
      border: 2px solid rgba(var(--v-theme-on-surface), .2);
    }

    + .backdrop {
      pointer-events: all;
      opacity: 1;
    }
  }
}

</style>