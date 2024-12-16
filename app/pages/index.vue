<template lang="pug">
v-main
  .d-flex.align-center.justify-center.pt-6
    .d-flex.align-center.position-relative
      v-card.py-1.px-3.settings-card(variant='outlined' :class='{ "settings-card--visible": showSettings }')
        .settings-card__content
          .d-flex.align-center
            .text-body-2(style='width: 55px') Rows:
            v-chip-group(v-model='setRows')
              v-chip(v-for='v in setRowsOptions' :key='v' :value='v') {{ v }}
          .d-flex.align-center.mt-n1
            .text-body-2(style='width: 55px') Style:
            v-chip-group.text-uppercase(v-model='chipVariant')
              v-chip(v-for='v in chipVariants' :key='v' :value='v') {{ v }}
          .d-flex.align-center.mt-n1
            .text-body-2(style='width: 55px') Font:
            v-chip-group.text-uppercase(v-model='fontFamily')
              v-chip(v-for='v in fontFamilyOptions' :key='v' :value='v') {{ v }}
      v-card.pa-6(width='400' style='z-index: 1')
        .d-flex.mb-n3
          v-form
            v-text-field(prefix='Username:' persistent-placeholder)
            v-otp-input.mx-n2(:length='6' persistent-placeholder maxLength='4' type='text')
          v-divider.ml-3.mr-1(vertical)
          .d-flex.flex-column.ga-2.mr-n6
            v-btn(size='small' variant='text' icon='mdi-cog-outline' @click='showSettings = !showSettings')
            v-btn(size='small' variant='text' icon='mdi-restore')

  .d-flex.align-center.justify-center
    .cards-grid.py-6
      v-card.pa-6(
        :width='cardColumns * 30 - 4 + 48'
        v-for='card in cards'
        :key='card.index'
        :class='fontClass'
        ref='cardPreviews'
        @click='selectedCard = card; showCard = true'
      )
        .card-characters
          v-chip(:variant='chipVariant' v-for='(ch, i) in card.characters' :key='i' :color='ch.color') ◉
          // ◉ | ▣ | ⬢

  v-dialog(
    v-if='selectedCard'
    v-model='showCard'
    :target='cardPreviews[selectedCard.index]'
    :min-width='cardColumns * 30 - 4 + 48'
    :width='zoomLevel * cardColumns * 30 - 4 + 48'
  )
    v-card.pa-6(:style='{ zoom: zoomLevel }' :class='fontClass')
      .card-characters(:style='`grid-template-columns: repeat(${cardColumns}, 1fr)`')
        v-chip(:variant='chipVariant' v-for='(ch, i) in selectedCard.characters' :key='i' :color='ch.color') {{ ch.value }}
</template>

<script setup lang="ts">
const { width: windowWidth } = useWindowSize()

const username = useLocalStorage('username', '')
const pin = ref('')

const showSettings = ref(false)
const selectedCard = ref<any | null>(null)
const cardPreviews = ref([])
const showCard = ref(false)
const zoomLevel = computed(() => windowWidth.value > 800 ? 2 : Math.max(1, windowWidth.value / 400))

const setRowsOptions = [1, 2, 3, 4]
const setRows = useLocalStorage('set-rows', 1)

const chipVariants = ['text', 'tonal', 'flat', 'outlined']
const chipVariant = useLocalStorage('chip-variant', 'tonal')

const fontFamilyOptions = ['Azeret Mono', 'Red Hat Mono']
const fontFamily = useLocalStorage('font-family', 'Azeret Mono')
const fontClass = computed(() => `font-${fontFamilyOptions.indexOf(fontFamily.value)}`)

const setColumns = ref(3)
const cardColumns = ref(10)
const cardRows = ref(10)

const allCharacters = computed(() => [
  [
    'abcdefghijklmnopqrstuvwxyz',
    'abcdefghijklmnopqrstuvwxyz'.toUpperCase(),
  ].join('').split('').map(v => ({ value: v, color: 'primary' })),

  '1234567890'.split('').map(v => ({ value: v, color: 'secondary' })),
  '!?@#$%&'.split('').map(v => ({ value: v, color: 'success' })),
  '+-|'.split('').map(v => ({ value: v, color: 'info' })),

  [
    '€§·↓', // ALT +         5|7|8|U
    '¡¿±↑', // ALT + SHIFT + 1|2|9|U|M
  ].join('').split('').map(v => ({ value: v, color: 'error' })),
].flatMap(x => x))

const cards = computed(() => Array.from({ length: setColumns.value * setRows.value })
  .map((_, ci) => ({
    index: ci,
    characters: Array.from({ length: cardColumns.value * cardRows.value })
      .map((_, chi) => randomElement(allCharacters.value)),
  }))
)
</script>

<style lang="sass" scoped>
.font-0
  --code-font-family: 'Azeret Mono'
  --code-font-weight: 400
.font-1
  --code-font-family: 'Red Hat Mono'
  --code-font-weight: 500

.cards-grid
  display: grid
  grid-template-columns: repeat(v-bind(setColumns), 1fr)
  gap: 12px

  padding: 12px
  max-width: 100vw
  overflow-x: auto

.card-characters
  display: grid
  grid-template-columns: repeat(v-bind(cardColumns), 1fr)
  gap: 4px

  > .v-chip
    font-family: var(--code-font-family), monospace
    font-weight: var(--code-font-weight)
    padding: 0
    justify-content: center

.settings-card
  position: absolute
  width: 360px
  z-index: 0
  top: 2px
  left: 20px
  right: 20px
  --card-shift-x: 0%
  --card-shift-y: 0%
  transform: translate(var(--card-shift-x), var(--card-shift-y))
  transition: transform .3s ease-in-out

  &.settings-card--visible
    --card-shift-y: calc(100% - 24px)

    .settings-card__content
      padding-top: 12px

    + .v-card
      margin-bottom: 130px

  .settings-card__content
    padding-left: 8px

  + .v-card
    transition: margin-bottom .3s ease-in-out

  @media (min-width: 1200px)
    left: 0px
    right: 0px
    width: 370px

    &.settings-card--visible
      --card-shift-y: 0%
      --card-shift-x: 376px

      + .v-card
        margin-bottom: 0

    .settings-card__content
      padding-top: 0 !important
      padding-left: 24px
</style>