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
      // ◉ | ▣ | ⬢
    .card-number {{ footer }}
</template>

<script setup lang="ts">
import { useVirtualFocus } from '@vuetify/v0'
import { useFocusTrap } from 'vuetify/lib/composables/focusTrap.js'

const props = defineProps<{
  chipVariant: 'text' | 'tonal' | 'flat' | 'outlined'
  zoomLevel: number
  footer: string
  characters: TSign[]
}>()

const emit = defineEmits<{ opened: []; closed: [] }>()

const isOpen = ref(false)
const open = () => isOpen.value = true
const close = () => isOpen.value = false
const toggleOpen = open
defineExpose({ open, close, toggleOpen, isOpen })

const cardSize = 10

// Keyboard navigation within the card grid via aria-activedescendant.
// The grid keeps DOM focus while a virtual cursor moves between cells.
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

// The arrow-cursor ring is only shown while navigating by keyboard. A mouse
// click hides it (and repositions the cursor) so we never show two outlines.
const cursorVisible = ref(false)

// Trap Tab focus inside the open card. The grid is the only tabbable child, so
// Tab / Shift+Tab just cycle back to it instead of escaping to the page.
const cardRef = ref<any>()
const contentEl = computed(() => cardRef.value?.$el as HTMLElement | undefined)
useFocusTrap(
  { retainFocus: true, captureFocus: true },
  { isActive: isOpen, localTop: computed(() => isOpen.value), contentEl },
)

// Single tap highlights the row, a quick second tap on the same cell highlights
// the column instead. Debounced so a double tap never flashes the row first —
// the row is only committed once the tap settles. Shared by click and Enter.
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
    // A pending tap on a different cell resolves to its row before this one.
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
  // Mouse mode: hide the keyboard cursor ring and move the cursor to the clicked
  // cell so arrows resume from here. Keep DOM focus on the grid, not the chip.
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
      // Movement is handled by useVirtualFocus' own listener; here we just reveal
      // the cursor and stop the key from also driving the outer card grid.
      cursorVisible.value = true
      e.stopPropagation()
      break
    case 'Enter':
      // Let Tab fall through to the focus trap; everything else stays local.
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
  emit('opened')
  await nextTick()
  gridRef.value?.focus()
})

const highlightMap = (length: number) => Array.from({ length })
  .map((_, i) => i)
  .reduce((o, n) => ({ ...o, [n]: false }), {} as Record<number, boolean>)

const highlightedRows = reactive(highlightMap(cardSize))
const highlightedColumns = reactive(highlightMap(cardSize))

const highlightedCells = reactive(highlightMap(cardSize ** 2))
const hasAnyHighlights = computed(() => Object.values(highlightedCells).some(Boolean))

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
  const { row } = getCoordinates(cellIndex)
  highlightedRows[row] = !highlightedRows[row]
  props.characters.forEach((_, i) => highlightedCells[i] = isHighlighted(i))
}

function highlightColumn(cellIndex: number) {
  if (!isOpen.value) return
  const { column } = getCoordinates(cellIndex)
  highlightedColumns[column] = !highlightedColumns[column]
  props.characters.forEach((_, i) => highlightedCells[i] = isHighlighted(i))
}

function isHighlighted(cellIndex: number): boolean {
  const { row, column } = getCoordinates(cellIndex)
  return highlightedRows[row] || highlightedColumns[column] || false
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