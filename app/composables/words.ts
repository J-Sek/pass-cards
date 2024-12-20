export function useWords() {
  let idleCallbackId = null as any
  const wordsArray = shallowRef<string[]>([])

  async function loadWords() {
    if (wordsArray.value.length > 0) return
    cancelIdleCallback(idleCallbackId)
    const response = await $fetch<string>('/words.txt', { headers: { 'content-type': 'plain/text' } })
    wordsArray.value = response.split(/\r?\n/)
  }

  onMounted(() => {
    idleCallbackId = requestIdleCallback(() => loadWords())
  })

  return {
    loadWords,
    wordsArray,
  }
}