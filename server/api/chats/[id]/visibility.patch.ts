import { createError, defineEventHandler, getRouterParam, readValidatedBody } from 'nuxt/server'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const id = getRouterParam(event, 'id', { decode: true })!

  const { visibility } = await readValidatedBody(event, z.object({
    visibility: z.enum(['public', 'private'])
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

  const [updated] = await db.update(schema.chats)
    .set({ visibility })
    .where(and(
      eq(schema.chats.id, id),
      eq(schema.chats.userId, session.user?.id || session.id)
    ))
    .returning()

  if (!updated) {
    throw createError({ status: 404, statusText: 'Chat not found' })
  }

  return updated
})
