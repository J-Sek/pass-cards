export function randomAmount(max: number) {
  return Math.round(max * Math.random())
}

export function randomElement<T>(array: T[]): T {
  return array[randomAmount(array.length - 1)]!
}
