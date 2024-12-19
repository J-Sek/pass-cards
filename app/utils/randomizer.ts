// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(seed: number) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export class Randomizer {
  private readonly _next: () => number
  private _words: string[] = []

  constructor(seed: number) {
    this._next = mulberry32(seed)
  }

  setWords(array: string[]) {
    this._words = array;
  }

  nextNumber(max: number): number {
    return Math.round(this._next() * max)
  }

  nextElement<T>(array: T[]): T {
    return array[this.nextNumber(array.length - 1)]!
  }

  nextWord(): string {
    return this._words[this.nextNumber(this._words.length - 1)]!
  }
}

export function hashCode(text: string): number {
  return text.split('')
    .reduce((hash, n) => {
      const chr = n.charCodeAt(0)
      hash = ((hash << 5) - hash) + chr
      hash |= 0
      return hash
    }, 0)
}
