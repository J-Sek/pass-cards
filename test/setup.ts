import 'vuetify/styles'
import { afterEach } from 'vitest'
import { cleanupMounts } from './support'

// Nuxt injects $fetch (ofetch) as a global; words.ts uses it to load /words.txt,
// which Vite serves from public/. A thin fetch wrapper is enough for tests.
;(globalThis as any).$fetch = (url: string, opts?: any) =>
  fetch(url, opts).then(r => r.text())

// Disable view transitions: card-wrapper falls back to its synchronous open/close
// path. Same result, minus the animation whose skipped-transition promise rejects
// (unhandled) when a card opens/closes quickly or the tree unmounts mid-flight.
;(document as any).startViewTransition = undefined

afterEach(() => {
  cleanupMounts()
  localStorage.clear()
})
