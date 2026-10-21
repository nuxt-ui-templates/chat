import { createError, defineEventHandler, getRouterParam } from 'nuxt/server'
import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const chatId = getRouterParam(event, 'chatId', { decode: true })!

  const userId = user.id

  const chat = await db.query.chats.findFirst({
    where: () => eq(schema.chats.id, chatId)
  })

  if (chat && chat.userId !== userId) {
    throw createError({
      status: 403,
      statusText: 'You do not have permission to upload files to this chat'
    })
  }

  const username = user.username

  return blob.handleUpload(event, {
    formKey: 'files',
    multiple: false,
    ensure: {
      maxSize: FILE_UPLOAD_CONFIG.maxSize,
      types: [...FILE_UPLOAD_CONFIG.types]
    },
    put: {
      addRandomSuffix: true,
      prefix: `${username}/${chatId}`
    }
  })
})
