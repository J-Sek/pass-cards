import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import IndexPage from '~/pages/index.vue'
import ThemeConfigMenu from '~/components/theme-config-menu.vue'
import { useAppThemeSync } from '~/composables/theme'
import { fillCredentials, mountApp, userEvent, waitForCards } from './support'

const ThemeHarness = defineComponent({
  setup() {
    useAppThemeSync()
    return () => h('div', [
      h(IndexPage),
      h(ThemeConfigMenu, { location: 'top end' }, {
        activator: ({ props }: any) => h('button', {
          ...props,
          id: 'theme-btn',
          style: 'position:fixed;top:0;left:0;z-index:3000',
        }, 'Theme'),
      }),
    ])
  },
})

const cssVar = (el: HTMLElement, name: string) =>
  getComputedStyle(el).getPropertyValue(name).replace(/\s/g, '')

const menu = () => document.querySelector<HTMLElement>('.v-overlay__content')!

describe('theme', () => {
  it('applies mode, primary colour and surface tint from the theme menu', async () => {
    const { el } = mountApp(ThemeHarness)

    await fillCredentials(el, 'yolo', '2077')
    await waitForCards(el, 3)

    expect(el.classList.contains('v-theme--light')).toBe(true)

    await userEvent.click(el.querySelector('#theme-btn')!)
    await vi.waitFor(() => {
      if (!document.querySelector('.v-overlay__content .v-tab')) throw new Error('menu not open')
    })

    const darkTab = [...menu().querySelectorAll<HTMLElement>('.v-tab')]
      .find(t => t.textContent!.includes('Dark'))!
    await userEvent.click(darkTab)
    await vi.waitFor(() => {
      if (!el.classList.contains('v-theme--dark')) throw new Error('dark not applied')
    })
    expect(localStorage.getItem('theme:mode')).toBe('dark')

    await userEvent.click(menu().querySelector('[aria-label="Select Blue"]')!)
    await vi.waitFor(() => {
      if (cssVar(el, '--v-theme-primary') !== '147,197,253') {
        throw new Error(`primary is ${cssVar(el, '--v-theme-primary')}`)
      }
    })
    expect(localStorage.getItem('theme:colors:primary')).toBe('blue')

    await userEvent.click(menu().querySelector('[aria-label="Select Teal tint"]')!)
    await vi.waitFor(() => {
      if (cssVar(el, '--v-theme-surface') !== '6,28,26') {
        throw new Error(`surface is ${cssVar(el, '--v-theme-surface')}`)
      }
    })
    expect(localStorage.getItem('theme:colors:surface')).toBe('teal')
  })
})
