import { del } from '@vercel/blob'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required to delete files'
    })
  }

  const username = session.user.username

  const { url } = await readValidatedBody(event, z.object({
    url: z.string().url()
  }).parse)

  if (!url.includes(`/${username}/`)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to delete this file'
    })
  }

  try {
    await del(url)
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to delete file'
    })
  }
})
