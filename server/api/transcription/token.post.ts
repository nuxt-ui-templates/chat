import { gateway } from 'ai'

defineRouteMeta({
  openAPI: {
    description: 'Create a short-lived token to stream dictation audio to the transcription model.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  return gateway.experimental_transcription.getToken({
    model: TRANSCRIPTION_MODEL,
    expiresAfterSeconds: 300
  })
})
