import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cardSize, computeSeed, generateCards } from '~/utils/cards'
import type { TCard } from '~/utils/types'

const words = readFileSync(new URL('../../public/words.txt', import.meta.url), 'utf8').split(/\r?\n/)

const firstLines = (card: TCard) => [0, 1].map(row =>
  card.characters.slice(row * cardSize, (row + 1) * cardSize).map(s => s.value).join(''))

describe('computeSeed', () => {
  it('requires a username and a full pin', () => {
    expect(computeSeed('', '2077')).toBe(0)
    expect(computeSeed('yolo', '207')).toBe(0)
    expect(computeSeed('yolo', '20777')).toBe(0)
    expect(computeSeed('yolo', '2077')).not.toBe(0)
  })

  it('is deterministic and sensitive to both inputs', () => {
    expect(computeSeed('yolo', '2077')).toBe(computeSeed('yolo', '2077'))
    expect(computeSeed('yolo', '1234')).not.toBe(computeSeed('yolo', '2077'))
    expect(computeSeed('other', '2077')).not.toBe(computeSeed('yolo', '2077'))
  })
})

describe('generateCards', () => {
  it('fills every card completely', () => {
    const cards = generateCards(computeSeed('yolo', '2077'), words, 6)
    expect(cards).toHaveLength(6)
    for (const card of cards) {
      expect(card.characters).toHaveLength(cardSize ** 2)
      expect(card.characters.every(c => c.value.length > 0)).toBe(true)
    }
  })

  it('username + pin => stable card faces', () => {
    const [first, second] = generateCards(computeSeed('yolo', '2077'), words, 2)
    expect(firstLines(first!)).toMatchInlineSnapshot(`
      [
        "nearing+yN",
        "szHF§o?b·§",
      ]
    `)
    expect(firstLines(second!)).toMatchInlineSnapshot(`
      [
        "binding·CI",
        "kO5€-w&-6Q",
      ]
    `)
  })

  it('a different pin reshuffles the cards', () => {
    const a = generateCards(computeSeed('yolo', '2077'), words, 2)
    const b = generateCards(computeSeed('yolo', '1234'), words, 2)
    expect(firstLines(a[0]!)).not.toEqual(firstLines(b[0]!))
    expect(firstLines(a[1]!)).not.toEqual(firstLines(b[1]!))
  })
})
