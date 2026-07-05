<template lang="pug">
v-main(scrollable)
  .flex.items-center.justify-center.pt-6
    .flex.items-center.relative
      v-card.p-6.mx-3(width='360' style='z-index: 1')
        .flex(class='-mb-3')
          v-form
            v-text-field(prefix='Username:' persistent-placeholder v-model='username')
            v-otp-input(class='-mx-2' :length='pinLength' persistent-placeholder type='text' v-model='pin')
          v-divider.ml-3.mr-1(vertical)
          .flex.flex-col.gap-2(class='-mr-4')
            v-btn(size='small' variant='text' icon @click='showSettings = !showSettings')
              transition(name='swap-scale')
                v-icon(:key='settingsIcon' :icon='settingsIcon')
            v-btn(size='small' variant='text' icon @click='restore')
              v-icon.restore-icon(
                :icon='mdiRestore'
                :style='{ transform: `rotate(${restoreSpin}deg)` }'
              )
      v-card.py-1.px-2.settings-card(
        variant='outlined'
        :class='{ "settings-card--visible": showSettings }'
        :inert='!showSettings'
      )
        .settings-card__content
          .flex.items-center
            .text-sm(style='width: 50px') Rows:
            v-chip-group(v-model='setRows')
              v-chip(v-for='v in setRowsOptions' :key='v' :value='v' :text='v')
          .flex.items-center(class='-mt-1')
            .text-sm(style='width: 50px') Style:
            v-chip-group.uppercase(v-model='chipVariant')
              v-chip(v-for='v in chipVariants' :key='v' :value='v' :text='v')
          .flex.items-center(class='-mt-1')
            .text-sm(style='width: 50px') Font:
            v-chip-group.uppercase(v-model='fontFamily')
              v-chip(v-for='v in fontFamilyOptions' :key='v' :value='v' :text='v')

  .flex.items-center.justify-center
    v-progress-circular.mx-auto.mt-16(v-if='isLoadingCards' size='80' width='3' indeterminate)
    .cards-grid(
      v-else-if='cards.length'
      ref='gridRef'
      role='grid'
      tabindex='0'
      :class='fontClass'
      @focus='onGridFocus'
      @keydown.enter.prevent='openHighlighted'
      @keydown.space.prevent='openHighlighted'
    )
      .v-card-outter(
        v-for='card in cards' :key='card.index'
        :id='cardCellId(card.index)'
        :ref='setCardEl(card.index)'
        :style='{ width: `${cardSize * 30 - 4 + 48}px` }'
      )
        pass-card(
          :zoom-level='zoomLevel'
          :characters='card.characters'
          :chip-variant='chipVariant'
          :footer='`${card.index + 1} / ${cards.length}`'
          :ripple='false'
          ref='cardsRef'
          @closed='onCardClosed'
        )
</template>

<script setup lang="ts">
import { mdiArrowLeft, mdiArrowUp, mdiCogOutline, mdiRestore } from '@mdi/js'
import { PassCard } from '@pass-cards/card-dialog'
import { useVirtualFocus } from '@vuetify/v0'
import { clamp, range } from '@vuetify/v0/utilities'
import { useWords } from '~/composables/words';
import { cardSize, computeSeed, generateCards, pinLength } from '~/utils/cards';
import { waitFor } from '~/utils/timing';

const { width: windowWidth, height: windowHeight } = useWindowSize()

const username = useLocalStorage('username', '')
const pin = ref('')

const showSettings = ref(false)
const settingsIcon = computed(() =>
  showSettings.value ? (windowWidth.value > 1200 ? mdiArrowLeft : mdiArrowUp) : mdiCogOutline)

const restoreSpin = ref(0)
function restore() {
  pin.value = ''
  restoreSpin.value -= 360
}

const cardsRef = ref<any[]>([])
const zoomLevel = computed(() => {
  const viewportSize = Math.min(windowWidth.value, windowHeight.value - 64)
  return clamp(viewportSize / 370, 1, 2)
})

const setRowsOptions = [1, 2, 3, 4]
const setRows = useLocalStorage('set-rows', 1)

const chipVariants = ['text', 'tonal', 'flat', 'outlined']
const chipVariant = useLocalStorage<'text' | 'tonal' | 'flat' | 'outlined'>('chip-variant', 'tonal')

const fontFamilyOptions = ['Azeret Mono', 'Red Hat Mono']
const fontFamily = useLocalStorage('font-family', 'Azeret Mono')
const fontClass = computed(() => `font-${fontFamilyOptions.indexOf(fontFamily.value)}`)

const setColumns = 3

const seed = computed(() => computeSeed(username.value, pin.value))

const isLoadingCards = ref(false)

const cards = shallowRef<TCard[]>([])

const gridUid = useId()
const cardCellId = (i: number) => `${gridUid}-card-${i}`

const gridRef = ref<HTMLElement>()
const cardEls = reactive<Record<number, HTMLElement | undefined>>({})
const setCardEl = (i: number) => (el: any) => {
  cardEls[i] = (el ?? undefined) as HTMLElement | undefined
}

const { highlightedId, highlight, clear } = useVirtualFocus(
  () => cards.value.map(c => ({ id: c.index, el: () => cardEls[c.index] })),
  {
    control: gridRef,
    columns: setColumns,
  },
)

const keyboardActive = ref(false)
const NAV_KEYS = ['Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape']
useEventListener('keydown', (e: KeyboardEvent) => {
  if (NAV_KEYS.includes(e.key)) keyboardActive.value = true
})
useEventListener('pointerdown', () => { keyboardActive.value = false })

function onGridFocus() {
  if (keyboardActive.value && highlightedId.value == null && cards.value.length) {
    highlight(cards.value[0]!.index)
  }
}

function openHighlighted() {
  if (highlightedId.value == null) return
  cardsRef.value[Number(highlightedId.value)]?.open()
}

function onCardClosed() {
  nextTick(() => gridRef.value?.focus({ preventScroll: true }))
}

watch(cards, () => clear())

const { loadWords, wordsArray } = useWords()

async function computeCards() {
  if (!seed.value) {
    cards.value = []
  } else {
    isLoadingCards.value = true
    loadWords()
    await waitFor(() => wordsArray.value.length > 0, 50)
    await delay(150)
    cards.value = generateCards(seed.value, wordsArray.value, setColumns * setRows.value)
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

<style lang="sass">
.font-0
  --code-font-family: 'Azeret Mono'
  --code-font-weight: 400
.font-1
  --code-font-family: 'Red Hat Mono'
  --code-font-weight: 500

.swap-scale-enter-active,
.swap-scale-leave-active
  transition: transform .25s ease, opacity .25s ease
.swap-scale-leave-active
  position: absolute
.swap-scale-enter-from,
.swap-scale-leave-to
  transform: scale(0)
  opacity: 0

.restore-icon
  transition: transform .5s ease

.cards-grid
  display: grid
  grid-template-columns: repeat(v-bind(setColumns), 1fr)
  gap: 12px

  padding: 32px
  overflow-x: auto

  &:focus
    outline: none

  &:focus-visible .v-card-outter[data-highlighted]
    outline: 2px solid rgb(var(--v-theme-primary))
    outline-offset: 4px
    border-radius: 16px

.settings-card
  position: absolute
  width: 342px
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

  .settings-card__content
    padding-left: 8px
    padding-bottom: 2px
    transition: padding-top .3s ease-in-out

  @media (min-width: 1200px)
    left: 12px
    top: 6px
    bottom: 6px
    width: 344px
    padding-top: 0 !important

    &.settings-card--visible
      --card-shift-y: 0%
      --card-shift-x: 350px

      .settings-card__content
        padding-top: 0

    .settings-card__content
      padding-left: 12px
      padding-top: 0
      padding-bottom: 0

.v-card:has(+ .settings-card)
  transition: margin-bottom .3s ease-in-out

.v-card:has(+ .settings-card--visible)
  margin-bottom: 130px

  @media (min-width: 1200px)
    margin-bottom: 0
</style>