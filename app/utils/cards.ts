import type { TCard, TSign } from './types'
import { hashCode, Randomizer } from './randomizer'
import { graphemeLength } from './text'
import { range } from '@vuetify/v0/utilities'

export const cardSize = 10
export const pinLength = 4

export function computeSeed(username: string, pin: string): number {
  if (!username?.length || graphemeLength(pin) != pinLength)
    return 0
  return hashCode(username + String(pin))
}

export function getColor(baseColor: string, rotateHue?: number) {
  return rotateHue
    ? `oklch(from rgb(var(--v-theme-${baseColor})) l c calc(mod(h + ${rotateHue * 360}, 360)))`
    : `rgb(var(--v-theme-${baseColor}))`
}

const signs = (characters: string, rotateHue?: number): TSign[] =>
  characters.split('').map(value => ({ value, color: getColor('primary', rotateHue) }))

const letters = 'abcdefghijklmnopqrstuvwxyz'
const altKeyGlyphs = '€§↓¡¿↑'

export const separators: TSign[] = signs('+------|······', .8)

export const allCharacters: TSign[] = [
  ...signs(letters + letters.toUpperCase()),
  ...signs('1234567890', .2),
  ...signs('!?@#$%&', .4),
  ...separators,
  ...signs(altKeyGlyphs, 6),
]

export function generateCards(seed: number, words: string[], count: number): TCard[] {
  const r = new Randomizer(seed)
  r.setWords(words)
  return range(count)
    .map((ci) => ({
      index: ci,
      characters: [
        ...signs(r.nextWord()),
        r.nextElement(separators),
        ...range(cardSize ** 2 - 8)
          .map(() => r.nextElement(allCharacters)),
      ],
    }))
}
