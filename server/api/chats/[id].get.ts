import { createError, defineEventHandler, getRouterParam } from 'nuxt/server'
import { db, schema } from 'hub:db'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const id = getRouterParam(event, 'id', { decode: true })!

  const chat = await db.query.chats.findFirst({
    where: () => eq(schema.chats.id, id),
    with: {
      messages: {
        orderBy: () => asc(schema.messages.createdAt)
      }
    }
  })

  if (!chat) {
    throw createError({ status: 404, statusText: 'Chat not found' })
  }

  const userId = session.user?.id || session.id
  const isOwner = chat.userId === userId

  if (chat.visibility === 'private' && !isOwner) {
    throw createError({ status: 404, statusText: 'Chat not found' })
  }

  const { userId: _, ...rest } = chat
  return { ...rest, isOwner }
})
