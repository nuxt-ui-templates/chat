import { db, schema } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  try {
    return await db.query.chats.findMany({
      where: () => eq(schema.chats.userId, session.user?.id || session.id),
      orderBy: () => desc(schema.chats.createdAt)
    })
  } catch (error) {
    // In case of database connection failure (e.g. Vercel without Turso), return empty array
    // to allow the UI to load.
    console.error('Failed to fetch chats:', error)
    return []
  }
})
