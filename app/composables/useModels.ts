import { MODELS } from '#shared/utils/models'

const DEFAULT_MODEL = 'anthropic/claude-haiku-5.5'

export function useModels() {
  const model = useCookie<string>('model', { default: () => DEFAULT_MODEL })

  // A model saved before it was removed from the list would be rejected by the server
  if (!MODELS.some(m => m.value === model.value)) {
    model.value = DEFAULT_MODEL
  }

  return {
    models: MODELS,
    model
  }
}
