import { type Component, defineComponent, h } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { createMemoryHistory, createRouter } from 'vue-router'
import { userEvent } from 'vitest/browser'
import PassCard from '~/components/pass-card.vue'
import CardWrapper from '~/components/card-wrapper.vue'
import ThemeConfigMenu from '~/components/theme-config-menu.vue'

// ponytail: theme/defaults mirror app/plugins/vuetify.ts by hand (that file wraps
// createVuetify in defineNuxtPlugin, so it can't be imported outside Nuxt). If the
// plugin's theme colours change, update these too.
function makeVuetify() {
  return createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'system',
      themes: {
        light: {
          dark: false,
          colors: {
            background: '#eceffe',
            surface: '#f7f7ff',
            'on-surface': '#3f357a',
            primary: '#8330f7',
            'on-primary': '#fffeff',
          },
        },
        dark: {
          dark: true,
          colors: {
            background: '#413680',
            surface: '#211b3d',
            'on-surface': '#e3e6fc',
            primary: '#dfd5ff',
            'on-primary': '#6019be',
          },
        },
      },
    },
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
    defaults: {
      global: { ripple: false },
      VTextField: { variant: 'outlined', hideDetails: 'auto', density: 'compact' },
      VOtpInput: { variant: 'outlined', hideDetails: 'auto', density: 'compact' },
      VChip: { label: true, size: 'small' },
      VCard: { rounded: 'lg' },
    },
  })
}

const mounted: VueWrapper[] = []

interface MountOptions {
  props?: Record<string, unknown>
  setup?: () => void
}

// Mounts `Comp` the way the app does: inside <v-app>, with a router (for
// useRouteQuery) and the app's Vuetify instance. `setup` runs inside the root's
// setup — used to call useAppThemeSync() like app.vue does.
export function mountApp(Comp: Component, { props = {}, setup }: MountOptions = {}) {
  const vuetify = makeVuetify()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }],
  })
  const Root = defineComponent({
    setup() {
      setup?.()
      return () => h(components.VApp, null, { default: () => h(Comp, props) })
    },
  })
  const wrapper = mount(Root, {
    attachTo: document.body,
    global: {
      plugins: [vuetify, router],
      components: { PassCard, CardWrapper, ThemeConfigMenu },
    },
  })
  mounted.push(wrapper)
  return { wrapper, vuetify, router, el: wrapper.element as HTMLElement }
}

export function cleanupMounts() {
  mounted.splice(0).forEach(w => w.unmount())
  document.querySelectorAll('.v-overlay-container').forEach(e => e.remove())
}

// --- interaction helpers, all driven through real user events ---------------

export async function fillCredentials(el: HTMLElement, username: string, pin: string) {
  const usernameInput = el.querySelector<HTMLInputElement>('.v-text-field input')!
  await userEvent.fill(usernameInput, username)

  // v-otp-input is driven by one real input (the rest are decorative spacers);
  // filling it sets the whole code and overwrites any previous one.
  const otp = el.querySelector<HTMLInputElement>('.v-otp-input__input')!
  await userEvent.fill(otp, pin)
}

export async function waitForCards(el: HTMLElement, count?: number) {
  await vi.waitFor(() => {
    const cards = el.querySelectorAll('.pass-card')
    if (!cards.length) throw new Error('cards not rendered yet')
    if (count != null && cards.length !== count) {
      throw new Error(`expected ${count} cards, found ${cards.length}`)
    }
  })
  return el.querySelectorAll<HTMLElement>('.pass-card')
}

export async function openCard(card: HTMLElement) {
  await userEvent.click(card)
  await vi.waitFor(() => {
    if (card.getAttribute('data-open') !== 'true') throw new Error('card not open yet')
  })
}

export async function closeCard(card: HTMLElement) {
  // The open card focuses its grid, which handles Escape -> close.
  await userEvent.keyboard('{Escape}')
  await vi.waitFor(() => {
    if (card.getAttribute('data-open') === 'true') throw new Error('card still open')
  })
}

// The form card holds two icon buttons: [settings toggle, restore].
export async function openSettings(el: HTMLElement) {
  await userEvent.click(el.querySelectorAll('button.v-btn')[0]!)
  await vi.waitFor(() => {
    if (el.querySelector('.settings-card')!.hasAttribute('inert')) {
      throw new Error('settings still inert')
    }
  })
}

// Settings chip-groups, in DOM order: [Rows, Style, Font].
export async function pickChip(el: HTMLElement, group: number, text: string) {
  const groupEl = el.querySelectorAll('.settings-card .v-chip-group')[group]!
  const chip = [...groupEl.querySelectorAll<HTMLElement>('.v-chip')]
    .find(c => c.textContent!.trim() === text)
  if (!chip) throw new Error(`chip "${text}" not found in group ${group}`)
  await userEvent.click(chip)
}

// A card face shows middots while closed and real characters once open.
export function revealedText(card: HTMLElement) {
  return [...card.querySelectorAll('.card-characters .v-chip')].map(c => c.textContent!.trim())
}

export { userEvent }
