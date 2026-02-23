<template lang="pug">
card-wrapper(v-model:open='isOpen' :zoom-level='zoomLevel')
  v-card.p-6.pass-card(
    :ripple='false'
    v-bind='!isOpen ? { onClick: toggleOpen } : {}'
    :elevation='isOpen ? 4 : 2'
  )
    .card-characters
      v-chip(
        v-for='(ch, i) in characters'
        :key='i'
        :variant='cellVariants[isHighlighted(i) ? 1 : 0]'
        :style='`--c: ${ch.color || "initial"}`'
        :ripple='isOpen'
        rounded="lg"
        v-bind='isOpen ? { onClick: () => highlightRow(i), onDblclick: () => highlightColumn(i) } : {}'
      ) {{ !isOpen ? '·' : ch.value }}
      // ◉ | ▣ | ⬢
    .card-number {{ footer }}
</template>

<script setup lang="ts">
const props = defineProps<{
  chipVariant: 'text' | 'tonal' | 'flat' | 'outlined'
  zoomLevel: number
  footer: string
  characters: TSign[]
}>()

const isOpen = ref(false)
const toggleOpen = () => isOpen.value = true
defineExpose({ toggleOpen, isOpen })

const cardSize = 10

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

<style lang="sass" scoped>
.card-characters
  display: grid
  grid-template-columns: repeat(v-bind(cardSize), 1fr)
  gap: 4px

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

.card-number
  opacity: .2
  position: absolute
  font-size: .6rem
  bottom: 4px
  left: 50%
  transform: translateX(-50%)
</style>