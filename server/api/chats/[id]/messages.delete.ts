import { createError, defineEventHandler, getRouterParam, readValidatedBody } from 'nuxt/server'
import { db, schema } from 'hub:db'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const id = getRouterParam(event, 'id', { decode: true })!

  const { messageId, type } = await readValidatedBody(event, z.object({
    messageId: z.string(),
    type: z.enum(['edit', 'regenerate'])
  }))

  const chat = await db.query.chats.findFirst({
    where: () => and(
      eq(schema.chats.id, id),
      eq(schema.chats.userId, session.user?.id || session.id)
    )
  })

  if (!chat) {
    throw createError({ status: 404, statusText: 'Chat not found' })
  }

  const allMessages = await db.select({ id: schema.messages.id, role: schema.messages.role })
    .from(schema.messages)
    .where(eq(schema.messages.chatId, id))
    .orderBy(asc(schema.messages.createdAt), asc(schema.messages.id))

  const targetIndex = allMessages.findIndex(m => m.id === messageId)
  if (targetIndex === -1) {
    throw createError({ status: 404, statusText: 'Message not found' })
  }

  const targetRole = allMessages[targetIndex]!.role
  if (type === 'edit' && targetRole !== 'user') {
    throw createError({ status: 400, statusText: 'Can only edit user messages' })
  }
  if (type === 'regenerate' && targetRole !== 'assistant') {
    throw createError({ status: 400, statusText: 'Can only regenerate assistant messages' })
  }

  const startIndex = type === 'edit' ? targetIndex + 1 : targetIndex
  const idsToDelete = allMessages.slice(startIndex).map(m => m.id)

  if (idsToDelete.length > 0) {
    await db.delete(schema.messages).where(inArray(schema.messages.id, idsToDelete))
  }

  return { success: true }
})
