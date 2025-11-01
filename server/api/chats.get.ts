import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  return (await db.select().from(schema.chats).where(eq(schema.chats.userId, session.user?.id || session.id))).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})
