import { useTheme } from 'vuetify'

export type ThemeMode = 'light' | 'system' | 'dark'

// Primary colors: shade 600 for light mode, shade 300 for dark mode (Tailwind CSS)
export const primaryOptions = [
  { id: 'violet',  label: 'Violet',  light: '#7c3aed', dark: '#c4b5fd', onLight: '#ffffff', onDark: '#4c1d95' },
  { id: 'blue',    label: 'Blue',    light: '#2563eb', dark: '#93c5fd', onLight: '#ffffff', onDark: '#1e3a8a' },
  { id: 'teal',    label: 'Teal',    light: '#0d9488', dark: '#5eead4', onLight: '#ffffff', onDark: '#134e4a' },
  { id: 'emerald', label: 'Emerald', light: '#059669', dark: '#6ee7b7', onLight: '#ffffff', onDark: '#064e3b' },
  { id: 'rose',    label: 'Rose',    light: '#e11d48', dark: '#fda4af', onLight: '#ffffff', onDark: '#881337' },
  { id: 'amber',   label: 'Amber',   light: '#d97706', dark: '#fcd34d', onLight: '#ffffff', onDark: '#78350f' },
]

// Surface colors: shade 50/100 for light mode, custom dark tints for dark mode (Tailwind CSS)
export const surfaceOptions = [
  { id: 'slate',  label: 'Slate',  lightSurface: '#f8fafc', darkSurface: '#0f172a', lightBg: '#f1f5f9', darkBg: '#1e293b' },
  { id: 'zinc',   label: 'Zinc',   lightSurface: '#fafafa', darkSurface: '#18181b', lightBg: '#f4f4f5', darkBg: '#27272a' },
  { id: 'violet', label: 'Violet', lightSurface: '#f5f3ff', darkSurface: '#1c1033', lightBg: '#ede9fe', darkBg: '#2e1a55' },
  { id: 'blue',   label: 'Blue',   lightSurface: '#eff6ff', darkSurface: '#0c1529', lightBg: '#dbeafe', darkBg: '#172040' },
  { id: 'teal',   label: 'Teal',   lightSurface: '#f0fdfa', darkSurface: '#061c1a', lightBg: '#ccfbf1', darkBg: '#0d2e2b' },
  { id: 'rose',   label: 'Rose',   lightSurface: '#fff1f2', darkSurface: '#1a0610', lightBg: '#ffe4e6', darkBg: '#2d0f1b' },
]

export function useAppThemeStore() {
  const { global, current } = useTheme()
  const forceDark = useRouteQuery('dark', '', { transform: Boolean })

  Promise.try(() => localStorage.removeItem('theme'))
  const storedMode = useLocalStorage<ThemeMode>('theme:mode', forceDark.value ? 'dark' : 'system', { writeDefaults: false })
  const storedPrimary = useLocalStorage('theme:colors:primary', 'violet', { writeDefaults: false })
  const storedSurface = useLocalStorage('theme:colors:surface', 'slate', { writeDefaults: false })

  return {
    isDark: toRef(() => current.value.dark),
    themeName: toRef(() => global.name.value),
    forceDark: readonly(forceDark),
    themeMode: storedMode,
    primaryColor: storedPrimary,
    surfaceColor: storedSurface,
  }
}

export function useAppThemeSync() {
  const motion = usePreferredReducedMotion()
  const { change, themes } = useTheme()
  const { forceDark, themeMode, primaryColor, surfaceColor } = useAppThemeStore()

  function applyPrimary(v: string) {
    const color = primaryOptions.find(x => x.id === v) ?? primaryOptions[0]
    const light = themes.value.light
    const dark = themes.value.dark

    if (!color || !light || !dark) return

    light.colors.primary = color.light
    light.colors['on-primary'] = color.onLight
    dark.colors.primary = color.dark
    dark.colors['on-primary'] = color.onDark
  }

  function applySurface(v: string) {
    const color = surfaceOptions.find(x => x.id === v) ?? surfaceOptions[0]
    const light = themes.value.light
    const dark = themes.value.dark

    if (!color || !light || !dark) return

    light.colors.surface = color.lightSurface
    light.colors.background = color.lightBg
    dark.colors.surface = color.darkSurface
    dark.colors.background = color.darkBg
  }

  watch(primaryColor, applyPrimary, { immediate: true })
  watch(surfaceColor, applySurface, { immediate: true })
  watch(themeMode, (v) => withTransition(() => change(v)))

  change(forceDark.value ? 'dark' : themeMode.value)

  async function withTransition(apply: () => void) {
    if (!document.startViewTransition || motion.value === 'reduce') {
      apply()
      return
    }
    const style = document.createElement('style')
    style.id = 'theme-transition'
    style.textContent =
      `::view-transition-old(root) { animation: none; }` +
      `::view-transition-new(root) { animation: theme-circle 300ms ease-out; }` +
      `@keyframes theme-circle {` +
      `  from { clip-path: circle(0% at 99% 100%); }` +
      `  to { clip-path: circle(150% at 99% 100%); }` +
      `}`
    document.head.appendChild(style)
    await document.startViewTransition(apply).finished
    style.remove()
  }
}
