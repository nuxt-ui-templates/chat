export function useLLM() {
  const models = [
    'openai/gpt-5-mini',
    'openai/gpt-5-nano'
  ]
  const model = useCookie<string>('llm-model', { default: () => 'openai/gpt-5-mini' })

  return {
    models,
    model
  }
}
