<template lang="pug">
v-main(scrollable)
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
              :icon='showSettings ? (windowWidth > 1200 ? mdiArrowLeft : mdiArrowUp) : mdiCogOutline'
              @click='showSettings = !showSettings'
            )
            v-btn(size='small' variant='text' :icon='mdiRestore' @click='pin = ""')

  .d-flex.align-center.justify-center
    v-progress-circular.mx-auto.mt-16(v-if='isLoadingCards' size='80' width='3' indeterminate)
    .cards-grid.py-6(
      v-else-if='cards.length'
      :class='fontClass'
    )
      .v-card-outter(
        v-for='card in cards' :key='card.index'
        :style='{ width: `${cardSize * 30 - 4 + 48}px` }'
      )
        pass-card(
          :zoom-level='zoomLevel'
          :characters='card.characters'
          :chip-variant='chipVariant'
          :footer='`${card.index + 1} / ${cards.length}`'
          :ripple='false'
          ref='cardsRef'
        )
</template>

<script setup lang="ts">
import { mdiArrowLeft, mdiArrowUp, mdiCogOutline, mdiRestore } from '@mdi/js'
import { useWords } from '~/composables/words';
import { waitFor } from '~/utils/timing';

const { width: windowWidth, height: windowHeight } = useWindowSize()

const username = useLocalStorage('username', '')
const pin = ref('')
const pinLength = 4

const showSettings = ref(false)
const cardsRef = ref<any[]>([])
const zoomLevel = computed(() => {
  const viewportSize = Math.min(windowWidth.value, windowHeight.value - 64)
  return viewportSize > 740 ? 2 : Math.max(1, viewportSize / 370)
})

const setRowsOptions = [1, 2, 3, 4]
const setRows = useLocalStorage('set-rows', 1)

const chipVariants = ['text', 'tonal', 'flat', 'outlined']
const chipVariant = useLocalStorage<'text' | 'tonal' | 'flat' | 'outlined'>('chip-variant', 'tonal')

const fontFamilyOptions = ['Azeret Mono', 'Red Hat Mono']
const fontFamily = useLocalStorage('font-family', 'Azeret Mono')
const fontClass = computed(() => `font-${fontFamilyOptions.indexOf(fontFamily.value)}`)

const setColumns = 3
const cardSize = 10

const seed = computed(() => {
  if (!username.value?.length || pin.value?.length != pinLength)
    return 0
  return hashCode(username.value + String(pin.value))
})

function getColor(baseColor: string, rotateHue?: number) {
  return rotateHue
    ? `oklch(from rgb(var(--v-theme-${baseColor})) l c calc(mod(h + ${rotateHue * 360}, 360)))`
    : `rgb(var(--v-theme-${baseColor}))`
}

const separators = computed<TSign[]>(() => '+------|······'.split('').map(v => ({ value: v, color: getColor('primary', .8) })))
const allCharacters = computed<TSign[]>(() => [
  [
    'abcdefghijklmnopqrstuvwxyz',
    'abcdefghijklmnopqrstuvwxyz'.toUpperCase(),
  ].join('').split('').map(v => ({ value: v, color: getColor('primary') })),

  '1234567890'.split('').map(v => ({ value: v, color: getColor('primary', .2) })),
  '!?@#$%&'.split('').map(v => ({ value: v, color: getColor('primary', .4) })),
  separators.value,
  [
    '€§↓',  // ALT +         5|7|U
    '¡¿↑',  // ALT + SHIFT + 1|2|U
  ].join('').split('').map(v => ({ value: v, color: getColor('primary', 6) })),
].flatMap(x => x))

const isLoadingCards = ref(false)

const cards = shallowRef<TCard[]>([])

const { loadWords, wordsArray } = useWords()

async function computeCards() {
  if (!seed.value) {
    cards.value = []
  } else {
    isLoadingCards.value = true
    const r = new Randomizer(seed.value)
    loadWords()
    await waitFor(() => wordsArray.value.length > 0, 50)
    r.setWords(wordsArray.value)
    await delay(150)
    // TODO: push to background worker
    cards.value = Array.from({ length: setColumns * setRows.value })
      .map((_, ci) => ({
        index: ci,
        characters: [
          ...r.nextWord().split('')
            .map((v) => ({ value: v, color: getColor('primary') })),
          r.nextElement(separators.value),
          ...Array.from({ length: cardSize ** 2 - 8 })
            .map((_, chi) => r.nextElement(allCharacters.value)),
        ],
      }))
    await delay(150)
    isLoadingCards.value = false
  }
}

watch(setRows, computeCards)
watch(seed, computeCards, { immediate: true })

const autofill = useRouteQuery('autofill', '', { transform: Number })

onMounted(async () => {
  if (autofill.value) {
    username.value = 'yolo'
    pin.value = '2077'
    await nextTick()
    await waitFor(() => cardsRef.value.length > 0, 50)
    cardsRef.value.at(autofill.value - 1).toggleOpen()
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
  overflow-x: auto

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
    --card-shift-y: calc(100% - 18px)

    .settings-card__content
      padding-top: 8px

    + .v-card
      margin-bottom: 130px

  .settings-card__content
    padding-left: 8px
    padding-bottom: 2px
    transition: padding-top .3s ease-in-out

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
        padding-top: 0

      + .v-card
        margin-bottom: 0

    .settings-card__content
      padding-left: 12px
      padding-top: 0
      padding-bottom: 0
</style>