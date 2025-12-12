import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { id } = getRouterParams(event)

  const chat = await db.query.chats.findFirst({
    where: () => and(eq(schema.chats.id, id as string), eq(schema.chats.userId, session.user?.id || session.id))
  })

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found'
    })
  }

  const username = session.user?.username || session.id
  const chatFolder = `${username}/${id}`

  try {
    const { blobs } = await blob.list({
      prefix: chatFolder
    })

    if (blobs.length > 0) {
      await Promise.all(
        blobs.map(b =>
          blob.del(b.pathname).catch(error =>
            console.error('[delete-chat] Failed to delete file:', b.pathname, error)
          )
        )
      )
    }
  } catch (error) {
    console.error('Failed to list/delete chat files:', error)
  }

  return await db.delete(schema.chats)
    .where(and(eq(schema.chats.id, id as string), eq(schema.chats.userId, session.user?.id || session.id)))
    .returning()
})
