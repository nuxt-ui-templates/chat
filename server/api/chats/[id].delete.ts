import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = getRouterParams(event)

  return await db.delete(schema.chats)
    .where(
      and(
        eq(schema.chats.id, id as string),
        eq(schema.chats.userId, session.user?.id || session.id)
      )
    )
    .returning()
})
