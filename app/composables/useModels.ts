import { MODELS } from '#shared/utils/models'

export function useModels() {
  const model = useCookie<string>('model', { default: () => 'openai/gpt-5-nano' })

  return {
    models: MODELS,
    model
  }
}
