import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { vuetifyOptions } from '@pass-cards/core'
import { PassCard, type TSign } from '../src'

const characters: TSign[] = Array.from({ length: 100 }, (_, i) => ({
  value: String.fromCharCode(97 + (i % 26)),
  color: '',
}))

function mountCard() {
  const wrapper = mount(PassCard, {
    props: { chipVariant: 'tonal' as const, zoomLevel: 1, footer: '1 / 1', characters },
    global: { plugins: [createVuetify({ ...vuetifyOptions, components, directives })] },
    attachTo: document.body,
  })
  const el = wrapper.element as HTMLElement
  return {
    wrapper,
    el,
    card: () => el.querySelector<HTMLElement>('.pass-card')!,
    grid: () => el.querySelector<HTMLElement>('.card-characters')!,
    chips: () => [...el.querySelectorAll<HTMLElement>('.card-characters .v-chip')],
    litChips: () => [...el.querySelectorAll<HTMLElement>('.card-characters .v-chip--variant-tonal')],
  }
}

async function openCard(ctx: ReturnType<typeof mountCard>) {
  await userEvent.click(ctx.card())
  await vi.waitFor(() => {
    if (ctx.card().getAttribute('data-open') !== 'true') throw new Error('card not open yet')
  })
}

function clickBackdropOutsideCard(ctx: ReturnType<typeof mountCard>) {
  return userEvent.click(ctx.el.querySelector<HTMLElement>('.backdrop')!, { position: { x: 5, y: 5 } })
}

const cursorIndex = (grid: HTMLElement) =>
  Number(grid.getAttribute('aria-activedescendant')?.match(/(\d+)$/)?.[1])

describe('pass-card', () => {
  beforeEach(() => {
    ;(document as any).startViewTransition = undefined
  })

  it('hides characters until opened, then focuses the grid', async () => {
    const ctx = mountCard()

    expect(ctx.chips().every(c => c.textContent!.trim() === '·')).toBe(true)

    await openCard(ctx)
    expect(ctx.chips().map(c => c.textContent!.trim()).slice(0, 3)).toEqual(['a', 'b', 'c'])
    expect(document.activeElement).toBe(ctx.grid())
  })

  it('opens and closes through a view transition when available', async () => {
    const startViewTransition = vi.fn((update: () => void) => {
      update()
      return { finished: Promise.resolve() }
    })
    ;(document as any).startViewTransition = startViewTransition
    const ctx = mountCard()

    await openCard(ctx)
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(ctx.el.querySelector('.card-page.open')).toBeTruthy()

    await clickBackdropOutsideCard(ctx)
    await vi.waitFor(() => {
      if (ctx.el.querySelector('.card-page.open')) throw new Error('still open')
    })
    expect(startViewTransition).toHaveBeenCalledTimes(2)
  })

  it('moves the virtual cursor with arrow keys while DOM focus stays on the grid', async () => {
    const ctx = mountCard()
    await openCard(ctx)

    await userEvent.keyboard('{ArrowRight}')
    const start = cursorIndex(ctx.grid())
    expect(Number.isNaN(start)).toBe(false)

    await userEvent.keyboard('{ArrowRight}')
    expect(cursorIndex(ctx.grid())).toBe(start + 1)

    await userEvent.keyboard('{ArrowDown}')
    expect(cursorIndex(ctx.grid())).toBe(start + 11)

    expect(document.activeElement).toBe(ctx.grid())
  })

  it('Enter highlights the row, a quick double-Enter the column', async () => {
    const ctx = mountCard()
    await openCard(ctx)

    await userEvent.keyboard('{ArrowRight}')
    const row = Math.floor(cursorIndex(ctx.grid()) / 10)

    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() => {
      if (ctx.litChips().length !== 10) throw new Error(`row not highlighted, ${ctx.litChips().length} lit`)
    })
    const litIdx = ctx.chips().flatMap((c, i) => c.classList.contains('v-chip--variant-tonal') ? [i] : [])
    expect(litIdx).toEqual(Array.from({ length: 10 }, (_, i) => row * 10 + i))

    await userEvent.keyboard('{Enter}{Enter}')
    await vi.waitFor(() => {
      if (ctx.litChips().length !== 19) throw new Error(`column not highlighted, ${ctx.litChips().length} lit`)
    })
  })

  it('Escape closes the card and emits closed', async () => {
    const ctx = mountCard()
    await openCard(ctx)

    await userEvent.keyboard('{Escape}')
    await vi.waitFor(() => {
      if (ctx.card().getAttribute('data-open') === 'true') throw new Error('still open')
    })
    expect(ctx.wrapper.emitted('closed')).toHaveLength(1)
  })
})
