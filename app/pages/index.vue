<template lang="pug">
v-main
  .d-flex.align-center.justify-center.pt-6
    .d-flex.align-center.position-relative
      v-card.py-1.px-2.settings-card(variant='outlined' :class='{ "settings-card--visible": showSettings }')
        .settings-card__content
          .d-flex.align-center
            .text-body-2(style='width: 50px') Rows:
            v-chip-group(v-model='setRows')
              v-chip(v-for='v in setRowsOptions' :key='v' :value='v') {{ v }}
          .d-flex.align-center.mt-n1
            .text-body-2(style='width: 50px') Style:
            v-chip-group.text-uppercase(v-model='chipVariant')
              v-chip(v-for='v in chipVariants' :key='v' :value='v') {{ v }}
          .d-flex.align-center.mt-n1
            .text-body-2(style='width: 50px') Font:
            v-chip-group.text-uppercase(v-model='fontFamily')
              v-chip(v-for='v in fontFamilyOptions' :key='v' :value='v') {{ v }}
      v-card.pa-6.mx-3(width='350' style='z-index: 1')
        .d-flex.mb-n3
          v-form
            v-text-field(prefix='Username:' persistent-placeholder v-model='username')
            v-otp-input.mx-n2(:length='pinLength' persistent-placeholder type='text' v-model='pin')
          v-divider.ml-3.mr-1(vertical)
          .d-flex.flex-column.ga-2.mr-n4
            v-btn(
              size='small' variant='text'
              :icon='showSettings ? (windowWidth > 1200 ? "mdi-arrow-left" : "mdi-arrow-up") : "mdi-cog-outline"'
              @click='showSettings = !showSettings'
            )
            v-btn(size='small' variant='text' icon='mdi-restore' @click='pin = ""')

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
    :model-value='selectedCardVisible'
    @update:model-value='showCard = false'
    :target='cardPreviews[selectedCard.index]'
    :min-width='cardColumns * 30 - 4 + 48'
    :width='zoomLevel * (cardColumns * 30 - 4 + 48)'
    scrim='#000'
  )
    v-card.pa-6(:style='{ zoom: zoomLevel }' :class='fontClass' border)
      .card-characters(:style='`grid-template-columns: repeat(${cardColumns}, 1fr)`')
        v-chip(:variant='chipVariant' v-for='(ch, i) in selectedCard.characters' :key='i' :color='ch.color') {{ ch.value }}
</template>

<script setup lang="ts">
const { width: windowWidth } = useWindowSize()

const username = useLocalStorage('username', '')
const pin = ref('')
const pinLength = 4

const showSettings = ref(false)
const selectedCard = ref<any | null>(null)
const cardPreviews = ref([])
const showCard = ref(false)
const selectedCardVisible = refDebounced(showCard, 100)
const zoomLevel = computed(() => windowWidth.value > 700 ? 2 : Math.max(1, windowWidth.value / 350))

const setRowsOptions = [1, 2, 3, 4]
const setRows = useLocalStorage('set-rows', 1)

const chipVariants = ['text', 'tonal', 'flat', 'outlined']
const chipVariant = useLocalStorage('chip-variant', 'tonal')

const fontFamilyOptions = ['Azeret Mono', 'Red Hat Mono']
const fontFamily = useLocalStorage('font-family', 'Azeret Mono')
const fontClass = computed(() => `font-${fontFamilyOptions.indexOf(fontFamily.value)}`)

const setColumns = 3
const cardColumns = 10
const cardRows = 10

const seed = computed(() => {
  if (!username.value?.length || pin.value?.length != pinLength)
    return 0
  return hashCode(username.value + String(pin.value))
})

type TSign = { value: string, color: string }
const allCharacters = computed<TSign[]>(() => [
  [
    'abcdefghijklmnopqrstuvwxyz',
    'abcdefghijklmnopqrstuvwxyz'.toUpperCase(),
  ].join('').split('').map(v => ({ value: v, color: 'primary' })),

  '1234567890'.split('').map(v => ({ value: v, color: 'secondary' })),
  '!?@#$%&'.split('').map(v => ({ value: v, color: 'success' })),
  '+------|······'.split('').map(v => ({ value: v, color: 'info' })),

  [
    '€§↓',  // ALT +         5|7|U
    '¡¿↑',  // ALT + SHIFT + 1|2|U
  ].join('').split('').map(v => ({ value: v, color: 'error' })),
].flatMap(x => x))

type TCard = { index: number, characters: TSign[] }
const cards = shallowRef<TCard[]>([])

function computeCards() {
  if (!seed.value) {
    cards.value = []
  } else {
    const r = new Randomizer(seed.value)
    cards.value = Array.from({ length: setColumns * setRows.value })
      .map((_, ci) => ({
        index: ci,
        characters: Array.from({ length: cardColumns * cardRows })
          .map((_, chi) => r.nextElement(allCharacters.value)),
      }))
  }
}

watch(setRows, computeCards)
watch(seed, computeCards, { immediate: true })

const autofill = useRouteQuery('autofill', '', { transform: Number })

onMounted(() => {
  if (autofill.value) {
    username.value = 'yolo'
    pin.value = '2077'
    nextTick(() => {
      selectedCard.value = cards.value.at(autofill.value)
      showCard.value = true
    })
  }
})
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
    width: calc(var(--v-chip-height) + 0px)

.settings-card
  position: absolute
  width: 332px
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
    left: 12px
    top: 6px
    bottom: 6px
    width: 344px
    padding-top: 0 !important

    &.settings-card--visible
      --card-shift-y: 0%
      --card-shift-x: 340px

      .settings-card__content
        padding-left: 12px
        padding-top: 0

      + .v-card
        margin-bottom: 0
</style>