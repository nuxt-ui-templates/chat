import { db, schema } from 'hub:db'
import { and, eq, gte, gt } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { messageId, type } = await readValidatedBody(event, z.object({
    messageId: z.string(),
    type: z.enum(['edit', 'regenerate'])
  }).parse)

  const chat = await db.query.chats.findFirst({
    where: () => and(
      eq(schema.chats.id, id as string),
      eq(schema.chats.userId, session.user?.id || session.id)
    )
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  const message = await db.query.messages.findFirst({
    where: () => and(
      eq(schema.messages.id, messageId),
      eq(schema.messages.chatId, id as string)
    )
  })

  if (!message) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  // Edit: delete messages after the edited one (keep the user message itself)
  // Regenerate: delete the assistant message and everything after it
  const operator = type === 'edit' ? gt : gte

  await db.delete(schema.messages).where(
    and(
      eq(schema.messages.chatId, id as string),
      operator(schema.messages.createdAt, message.createdAt)
    )
  )

  return { success: true }
})
