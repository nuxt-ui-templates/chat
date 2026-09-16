export function useChatSettings() {
  const webSearch = useCookie<boolean>('web-search', { default: () => true })
  const reasoning = useCookie<boolean>('reasoning', { default: () => true })

  return {
    webSearch,
    reasoning
  }
}
