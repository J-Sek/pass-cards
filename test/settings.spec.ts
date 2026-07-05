import { describe, expect, it } from 'vitest'
import IndexPage from '~/pages/index.vue'
import {
  closeCard,
  fillCredentials,
  mountApp,
  openCard,
  openSettings,
  pickChip,
  waitForCards,
} from './support'

describe('settings', () => {
  it('applies rows, chip style and font to the rendered cards', async () => {
    const { el } = mountApp(IndexPage)
    await fillCredentials(el, 'yolo', '2077')
    await waitForCards(el, 3)

    await openSettings(el)

    await pickChip(el, 'rows', '2')
    await waitForCards(el, 6)

    await pickChip(el, 'style', 'outlined')
    const card = el.querySelectorAll<HTMLElement>('.pass-card')[0]!
    await openCard(card)
    expect(card.querySelector('.card-characters .v-chip.v-chip--variant-outlined')).toBeTruthy()
    await closeCard(card)

    await pickChip(el, 'font', 'Red Hat Mono')
    await vi.waitFor(() => {
      if (!el.querySelector('.cards-grid.font-1')) throw new Error('font not applied')
    })
  })
})
