<template lang="pug">
card-wrapper(v-model:open='isOpen' :zoom-level='zoomLevel')
  v-card.p-6.pass-card(
    ref='cardRef'
    :ripple='false'
    tabindex='-1'
    @mousedown.prevent
    v-bind='!isOpen ? { onClick: toggleOpen } : {}'
    class='elevation-overlay'
    :data-open='isOpen'
    :elevation='isOpen ? 4 : 2'
  )
    .card-characters(
      ref='gridRef'
      role='grid'
      :tabindex='isOpen ? 0 : -1'
      :class='{ "show-cursor": cursorVisible }'
      @keydown='onInnerKeydown'
    )
      v-chip(
        v-for='(ch, i) in characters'
        :key='i'
        :id='cellId(i)'
        :ref='setChipRef(i)'
        tabindex='-1'
        :variant='cellVariants[isHighlighted(i) ? 1 : 0]'
        :active='isHighlighted(i)'
        :style='`--c: ${ch.color || "initial"}`'
        :ripple='isOpen'
        rounded="lg"
        @mousedown.prevent
        v-bind='isOpen ? { onClick: () => onChipClick(i) } : {}'
      ) {{ !isOpen ? '·' : ch.value }}
    .card-number {{ footer }}
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
import { VCard, VChip } from 'vuetify/components'
import { createGroup, useVirtualFocus } from '@vuetify/v0'
import { range } from '@vuetify/v0/utilities'
import { useFocusTrap } from 'vuetify/lib/composables/focusTrap.js'
import CardWrapper from './card-wrapper.vue'
import type { TSign } from './types'

const props = defineProps<{
  chipVariant: 'text' | 'tonal' | 'flat' | 'outlined'
  zoomLevel: number
  footer: string
  characters: TSign[]
}>()

const emit = defineEmits<{ closed: [] }>()

const isOpen = ref(false)
const open = () => isOpen.value = true
const close = () => isOpen.value = false
const toggleOpen = open
defineExpose({ open, close, toggleOpen, isOpen })

const cardSize = 10

const uid = useId()
const cellId = (i: number) => `${uid}-cell-${i}`

const gridRef = ref<HTMLElement>()
const chipEls = reactive<Record<number, HTMLElement | undefined>>({})
const setChipRef = (i: number) => (el: any) => {
  chipEls[i] = el?.$el ?? el ?? undefined
}

const { highlightedId, highlight, clear } = useVirtualFocus(
  () => props.characters.map((_, i) => ({ id: i, el: () => chipEls[i] })),
  {
    control: gridRef,
    columns: cardSize,
  },
)

const cursorVisible = ref(false)

const cardRef = ref<any>()
const contentEl = computed(() => cardRef.value?.$el as HTMLElement | undefined)
useFocusTrap(
  { retainFocus: true, captureFocus: true },
  { isActive: isOpen, localTop: computed(() => isOpen.value), contentEl },
)

const TAP_DELAY = 250
let tapTimer: ReturnType<typeof setTimeout> | null = null
let tapCellIndex = -1

function tapCell (i: number) {
  if (tapTimer != null) {
    clearTimeout(tapTimer)
    tapTimer = null
    if (tapCellIndex === i) {
      tapCellIndex = -1
      highlightColumn(i)
      return
    }
    highlightRow(tapCellIndex)
  }
  tapCellIndex = i
  tapTimer = setTimeout(() => {
    tapTimer = null
    tapCellIndex = -1
    highlightRow(i)
  }, TAP_DELAY)
}

function onChipClick (i: number) {
  cursorVisible.value = false
  highlight(i)
  gridRef.value?.focus({ preventScroll: true })
  tapCell(i)
}

function onInnerKeydown (e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'Home':
    case 'End':
      cursorVisible.value = true
      e.stopPropagation()
      break
    case 'Enter':
      e.preventDefault()
      e.stopPropagation()
      cursorVisible.value = true
      if (highlightedId.value != null) tapCell(Number(highlightedId.value))
      break
    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      close()
      break
  }
}

watch(isOpen, async (opened) => {
  cursorVisible.value = false
  if (!opened) {
    if (tapTimer != null) { clearTimeout(tapTimer); tapTimer = null; tapCellIndex = -1 }
    clear()
    emit('closed')
    return
  }
  await nextTick()
  gridRef.value?.focus({ preventScroll: true })
})

const rows = createGroup()
const cols = createGroup()
rows.onboard(range(cardSize).map(id => ({ id })))
cols.onboard(range(cardSize).map(id => ({ id })))

const hasAnyHighlights = computed(() => !rows.isNoneSelected.value || !cols.isNoneSelected.value)

const cellVariants = computed<any[]>(() => [
  isOpen.value && hasAnyHighlights.value ? 'text' : props.chipVariant,
  isOpen.value && props.chipVariant === 'text' ? 'tonal' : props.chipVariant,
])

function getCoordinates(cellIndex: number) {
  return {
    row: Math.floor(cellIndex / cardSize),
    column: cellIndex % cardSize
  }
}

function highlightRow(cellIndex: number) {
  if (!isOpen.value) return
  rows.toggle(getCoordinates(cellIndex).row)
}

function highlightColumn(cellIndex: number) {
  if (!isOpen.value) return
  cols.toggle(getCoordinates(cellIndex).column)
}

function isHighlighted(cellIndex: number): boolean {
  const { row, column } = getCoordinates(cellIndex)
  return rows.selectedIds.has(row) || cols.selectedIds.has(column)
}
</script>

<style lang="sass">
.card-characters
  display: grid
  grid-template-columns: repeat(v-bind(cardSize), 1fr)
  gap: 4px

  &:focus
    outline: none

  &.show-cursor > .v-chip[data-highlighted]
    outline: 2px solid rgb(var(--v-theme-primary))
    outline-offset: 1px

  > .v-chip
    font-family: var(--code-font-family), monospace
    font-weight: var(--code-font-weight)
    padding: 0
    justify-content: center
    width: calc(var(--v-chip-height) + 0px)
    color: var(--c)

    &.v-chip--variant-flat
      background-color: var(--c)
      color: color(from var(--c) xyz-d65 clamp(0, (.36 / y - 1) * infinity, 1) clamp(0, (.36 / y - 1) * infinity, 1) clamp(0, (.36 / y - 1) * infinity, 1))

.pass-card[data-open='true']
  .card-characters:has(> .v-chip[active="true"])
    > .v-chip:not([active="true"])
      opacity: .5

.card-number
  opacity: .2
  position: absolute
  font-size: .6rem
  bottom: 4px
  left: 50%
  transform: translateX(-50%)
</style>