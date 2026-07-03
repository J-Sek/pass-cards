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

    // Rows: 3 columns x 2 rows = 6 cards.
    await pickChip(el, 0, '2')
    await waitForCards(el, 6)

    // Style: switch chips to the outlined variant, then open a card to check.
    await pickChip(el, 1, 'outlined')
    const card = el.querySelectorAll<HTMLElement>('.pass-card')[0]!
    await openCard(card)
    expect(card.querySelector('.card-characters .v-chip.v-chip--variant-outlined')).toBeTruthy()
    await closeCard(card)

    // Font: the grid switches to the Red Hat Mono font class (font-1).
    await pickChip(el, 2, 'Red Hat Mono')
    await vi.waitFor(() => {
      if (!el.querySelector('.cards-grid.font-1')) throw new Error('font not applied')
    })
  })
})
