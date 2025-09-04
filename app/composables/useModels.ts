export function useModels() {
  const models = [
    // OpenAI Models
    'openai/gpt-5',
    'openai/gpt-5-mini',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    // Anthropic Claude Models
    'anthropic/claude-sonnet-4',
    'anthropic/claude-sonnet-3.7',
    // Google Gemini Models
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash'
  ]

  const model = useCookie<string>('model', { default: () => 'openai/gpt-4o-mini' })

  return {
    models,
    model
  }
}
