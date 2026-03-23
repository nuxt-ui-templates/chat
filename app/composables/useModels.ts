import { MODELS } from '#shared/utils/models'

export function useModels() {
  const model = useCookie<string>('model', { default: () => 'anthropic/claude-haiku-4.5' })

  return {
    models: MODELS,
    model
  }
}
