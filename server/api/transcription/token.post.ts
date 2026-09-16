import { gateway } from 'ai'

defineRouteMeta({
  openAPI: {
    description: 'Create a short-lived token to stream dictation audio to the transcription model.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  // Each token lets the browser stream audio for up to 5 minutes on the project's gateway credit,
  // consider rate limiting this route if your users are not trusted
  return gateway.experimental_transcription.getToken({
    model: TRANSCRIPTION_MODEL,
    expiresAfterSeconds: 300
  })
})
