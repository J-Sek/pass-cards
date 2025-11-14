<template lang="pug">
div
  .card-page(ref='self' :class='wrapperClasses')
    slot
  .backdrop(@click.stop='open = false')
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { TransitionPresets } from '@vueuse/core'
import { useMotionProperties, useMotionTransitions } from '@vueuse/motion'

function delay(seconds: number) {
  return new Promise(r => setTimeout(r, seconds * 1000))
}

const props = defineProps<{ zoomLevel: number }>()

const self = ref<HTMLElement>(null!)
const offsetTop = 64
const footerHeight = 42
const padding = 8

const open = defineModel<boolean>('open', { default: false })

const isFixed = ref(false)
const isClosing = ref(false)

const wrapperClasses = computed(() => ({
  'open': isFixed.value,
  'closing': isClosing.value,
}))

const { motionProperties: transform } = useMotionProperties(self, { x: 0, y: 0 })
const { push, stop } = useMotionTransitions()
const transition = { type: 'keyframes', ease: TransitionPresets.easeOutCubic, duration: 250 }
let isAnimating = false

const { width: windowWidth, height: windowHeight } = useWindowSize()

function getOpenCoordinates() {
  const { width } = self.value.parentElement!.getBoundingClientRect()
  const cardOuterSize = (2 * padding + width) * props.zoomLevel
  return {
    x: (windowWidth.value - cardOuterSize) / 2,
    y: offsetTop + Math.max(8, (windowHeight.value - (offsetTop + footerHeight) - cardOuterSize) / 2),
  }
}

watchDebounced(open, async (v) => {
  const { x, y } = self.value.parentElement!.getBoundingClientRect()
  const { x: openX, y: openY } = getOpenCoordinates()

  await waitFor(() => !isAnimating, 50)
  isAnimating = true
  if (v) {
    isFixed.value = true
    push('x', openX, transform, { from: x, ...transition })
    push('y', openY, transform, { from: y, ...transition })
    push('scale', props.zoomLevel, transform, { from: 1, ...transition })
    push('padding', 8, transform, { from: 0, ...transition })
    await delay(.4)
    stop()
  } else {
    isClosing.value = true
    push('x', x, transform, { from: openX, ...transition })
    push('y', y, transform, { from: openY, ...transition })
    push('scale', 1, transform, { from: props.zoomLevel, ...transition })
    push('padding', 0, transform, { from: 1, ...transition })
    await delay(.4)
    stop()
    isClosing.value = false
    isFixed.value = false
    self.value.style.transform = ''
  }
  isAnimating = false
}, { debounce: 50 })

watch(() => windowWidth.value + windowHeight.value, async () => {
  await waitFor(() => !isAnimating, 50)
  if (open.value) {
    const { x: openX, y: openY } = getOpenCoordinates()
    self.value.style.transform = `translate3d(${openX}px, ${openY}px, 0px) scale(${props.zoomLevel})`
  }
})
</script>

<style scoped>
.card-page {
  position: relative;
  display: block;
  top: 0;
  left: 0;
  transform-origin: 0 0;

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

  &.open {
    position: fixed;
    max-height: calc(100dvh - 80px);
    z-index: 999;

    &:not(.closing) {
      overflow: auto;

      + .backdrop {
        pointer-events: all;
        opacity: 1;
      }
    }
  }
}
</style>