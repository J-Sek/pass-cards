import { describe, expect, it } from 'vitest'
import IndexPage from '~/pages/index.vue'
import {
  closeCard,
  fillCredentials,
  mountApp,
  openCard,
  revealedText,
  waitForCards,
} from './support'

const hasLetters = (texts: string[]) => texts.some(t => /[a-z0-9]/i.test(t))

describe('cards', () => {
  it('reveals cards, opens them one at a time, and reacts to a new code', async () => {
    const { el } = mountApp(IndexPage)

    // Nothing to show until a username and a full 4-digit code are entered.
    expect(el.querySelectorAll('.pass-card')).toHaveLength(0)

    await fillCredentials(el, 'yolo', '2077')
    const cards = await waitForCards(el, 3)

    // Closed cards hide their characters behind middots.
    expect(revealedText(cards[0]!).every(t => t === '·')).toBe(true)

    // Open the first card -> its characters become visible.
    await openCard(cards[0]!)
    const firstFace = revealedText(cards[0]!)
    expect(hasLetters(firstFace)).toBe(true)

    // Only one card is open at a time: close it, then open another.
    await closeCard(cards[0]!)
    expect(cards[0]!.getAttribute('data-open')).not.toBe('true')

    await openCard(cards[1]!)
    expect(hasLetters(revealedText(cards[1]!))).toBe(true)
    await closeCard(cards[1]!)

    // Changing the code reseeds every card with different content.
    await fillCredentials(el, 'yolo', '1234')
    const reseeded = await waitForCards(el, 3)
    await openCard(reseeded[0]!)
    const newFace = revealedText(reseeded[0]!)
    expect(hasLetters(newFace)).toBe(true)
    expect(newFace.join('')).not.toBe(firstFace.join(''))
  })
})
