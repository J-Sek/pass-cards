import { useTheme } from 'vuetify'

export function useAppTheme() {
  const { global, change, current, cycle } = useTheme()
  const preferred = usePreferredColorScheme()
  const motion = usePreferredReducedMotion()
  const forceDark = useRouteQuery('dark', '', { transform: Boolean })

  if (localStorage.theme === 'dark'
    || !localStorage.theme && preferred.value === 'dark'
    || forceDark.value
  ) {
    change('dark')
  }

  const storedTheme = useLocalStorage('theme', '')
  watch(global.name, v => storedTheme.value = v)

  function clickOrigin (e: MouseEvent) {
    const { clientX: x, clientY: y }  = e ?? {}
    const { offsetWidth: w, offsetHeight: h }  = document.body

    return `${Math.min(99, 100 * x / w)}% ${100 * y / h}%`
  }

  function toggleTheme (e?: MouseEvent) {
    if (!document.startViewTransition || motion.value === 'reduce') {
      cycle()
      return
    }

    const origin = e ? clickOrigin(e) : '50% 0%'
    const style = document.createElement('style')
    style.textContent =
      `::view-transition-old(root) { animation: none; }` +
      `::view-transition-new(root) { animation: v-circle-in 300ms ease-out; }` +
      `@keyframes v-circle-in {` +
      `  from { clip-path: circle(0% at ${origin}); }` +
      `  to { clip-path: circle(150% at ${origin}); }` +
      `}`
    document.head.appendChild(style)

    const transition = document.startViewTransition(() => cycle())
    transition.finished.then(() => {
      style.remove()
    })
  }

  return {
    isDark: toRef(() => current.value.dark),
    themeName: toRef(() => global.name.value),
    toggleTheme,
  }
}
