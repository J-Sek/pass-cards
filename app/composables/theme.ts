import { useTheme } from 'vuetify'

export function useAppTheme() {
  const { global } = useTheme()
  const preferred = usePreferredColorScheme()
  const forceDark = useRouteQuery('dark', '', { transform: Boolean })

  if (localStorage.theme === 'dark'
    || !localStorage.theme && preferred.value === 'dark'
    || forceDark.value
  ) {
    global.name.value = 'dark'
  }
  const isDark = computed(() => global.name.value === 'dark')
  const themeName = computed(() => global.name.value)

  const storedTheme = useLocalStorage('theme', '')

  function toggleTheme() {
    const nextTheme = isDark.value ? 'light' : 'dark'
    global.name.value = nextTheme
    storedTheme.value = nextTheme
  }

  return {
    isDark,
    themeName,
    toggleTheme,
  }
}
