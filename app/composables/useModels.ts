export function useModels() {
  const models = [
    'openai/gpt-5-nano',
    'anthropic/claude-haiku-4.5',
    'google/gemini-2.5-flash'
  ]

  const model = useCookie<string>('model', { default: () => 'openai/gpt-5-nano' })

  return {
    models,
    model
  }
}
