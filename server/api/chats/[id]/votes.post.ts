import { createError, defineEventHandler, getRouterParam, readValidatedBody } from 'nuxt/server'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const id = getRouterParam(event, 'id', { decode: true })!

  const { messageId, isUpvoted } = await readValidatedBody(event, z.object({
    messageId: z.string(),
    isUpvoted: z.boolean().optional()
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

  const message = await db.query.messages.findFirst({
    where: () => and(
      eq(schema.messages.id, messageId),
      eq(schema.messages.chatId, id)
    )
  })

  if (!message) {
    throw createError({ status: 404, statusText: 'Message not found' })
  }

  if (message.role !== 'assistant') {
    throw createError({ status: 400, statusText: 'Can only vote on assistant messages' })
  }

  if (isUpvoted === undefined) {
    await db.delete(schema.votes).where(
      and(
        eq(schema.votes.chatId, id),
        eq(schema.votes.messageId, messageId)
      )
    )
  } else {
    await db.insert(schema.votes).values({
      chatId: id,
      messageId,
      isUpvoted
    }).onConflictDoUpdate({
      target: [schema.votes.chatId, schema.votes.messageId],
      set: { isUpvoted }
    })
  }

  return { chatId: id, messageId, isUpvoted }
})
