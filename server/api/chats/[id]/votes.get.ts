import { createError, defineEventHandler, getRouterParam } from 'nuxt/server'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const id = getRouterParam(event, 'id', { decode: true })!

  const chat = await db.query.chats.findFirst({
    where: () => and(
      eq(schema.chats.id, id),
      eq(schema.chats.userId, session.user?.id || session.id)
    )
  })

  if (!chat) {
    throw createError({ status: 404, statusText: 'Chat not found' })
  }

  return await db.select().from(schema.votes).where(eq(schema.votes.chatId, id))
})
