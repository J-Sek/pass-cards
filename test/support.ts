import { type Component, defineComponent, h } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createMemoryHistory, createRouter } from 'vue-router'
import { userEvent } from 'vitest/browser'
import { vuetifyOptions } from '@pass-cards/core'
import ThemeConfigMenu from '~/components/theme-config-menu.vue'

function makeVuetify() {
  return createVuetify({ ...vuetifyOptions, components, directives })
}

const mounted: VueWrapper[] = []

interface MountOptions {
  props?: Record<string, unknown>
  setup?: () => void
}

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
      components: { ThemeConfigMenu },
    },
  })
  mounted.push(wrapper)
  return { wrapper, vuetify, router, el: wrapper.element as HTMLElement }
}

export function cleanupMounts() {
  mounted.splice(0).forEach(w => w.unmount())
  document.querySelectorAll('.v-overlay-container').forEach(e => e.remove())
}

export async function fillCredentials(el: HTMLElement, username: string, pin: string) {
  const usernameInput = el.querySelector<HTMLInputElement>('.v-text-field input')!
  await userEvent.fill(usernameInput, username)

  const otpInput = el.querySelector<HTMLInputElement>('.v-otp-input__input')!
  await userEvent.fill(otpInput, pin)
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
  await userEvent.keyboard('{Escape}')
  await vi.waitFor(() => {
    if (card.getAttribute('data-open') === 'true') throw new Error('card still open')
  })
}

export async function openSettings(el: HTMLElement) {
  const [settingsToggle] = el.querySelectorAll('button.v-btn')
  await userEvent.click(settingsToggle!)
  await vi.waitFor(() => {
    if (el.querySelector('.settings-card')!.hasAttribute('inert')) {
      throw new Error('settings still inert')
    }
  })
}

const settingsGroups = ['rows', 'style', 'font'] as const

export async function pickChip(el: HTMLElement, group: typeof settingsGroups[number], text: string) {
  const groupEl = el.querySelectorAll('.settings-card .v-chip-group')[settingsGroups.indexOf(group)]!
  const chip = [...groupEl.querySelectorAll<HTMLElement>('.v-chip')]
    .find(c => c.textContent!.trim() === text)
  if (!chip) throw new Error(`chip "${text}" not found in ${group} group`)
  await userEvent.click(chip)
}

export function revealedText(card: HTMLElement) {
  return [...card.querySelectorAll('.card-characters .v-chip')].map(c => c.textContent!.trim())
}

export { userEvent }
