import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'
import type { UIMessage } from 'ai'
import { db, schema } from 'hub:db'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id, message } = await readValidatedBody(event, z.object({
    id: z.string(),
    message: z.custom<UIMessage>()
  }))

  const [chat] = await db.insert(schema.chats).values({
    id,
    title: '',
    userId: session.user?.id || session.id
  }).returning()

  if (!chat) {
    throw createError({ status: 500, statusText: 'Failed to create chat' })
  }

  await db.insert(schema.messages).values({
    id: message.id,
    chatId: chat.id,
    role: 'user',
    parts: message.parts
  })

  return chat
})
