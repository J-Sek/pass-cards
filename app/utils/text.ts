const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function graphemeLength(text: string): number {
  let count = 0
  for (const _ of graphemeSegmenter.segment(text)) count++
  return count
}
