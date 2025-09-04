export function useLLM() {
  const models = [
    'openai/gpt-4.1-mini',
    'openai/gpt-5-mini',
    'openai/gpt-5-nano'
  ]
  const model = useCookie<string>('llm-model', { default: () => 'openai/gpt-4.1-mini' })

  return {
    models,
    model
  }
}
