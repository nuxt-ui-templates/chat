export function useModels() {
  const models = [
    { label: 'GPT-5 Nano', value: 'openai/gpt-5-nano', icon: 'i-simple-icons-openai' },
    { label: 'Claude Haiku 4.5', value: 'anthropic/claude-haiku-4.5', icon: 'i-simple-icons-anthropic' },
    { label: 'Gemini 3 Flash', value: 'google/gemini-3-flash', icon: 'i-simple-icons-google' }
  ]

  const model = useCookie<string>('model', { default: () => 'openai/gpt-5-nano' })

  return {
    models,
    model
  }
}
