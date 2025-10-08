import { list, del } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { id } = getRouterParams(event)
  const db = useDrizzle()

  const chat = await db.query.chats.findFirst({
    where: (chat, { eq }) => and(eq(chat.id, id as string), eq(chat.userId, session.user?.id || session.id))
  })

  if (!chat) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found'
    })
  }

  const username = session.user.username
  const chatFolder = `${username}/${id}/`

  try {
    const { blobs } = await list({
      prefix: chatFolder
    })

    await Promise.all(
      blobs.map(blob =>
        del(blob.url).catch(error =>
          console.error('Failed to delete file:', blob.pathname, error)
        )
      )
    )
  } catch (error) {
    console.error('Failed to list/delete chat files:', error)
  }

  return await db.delete(tables.chats)
    .where(and(eq(tables.chats.id, id as string), eq(tables.chats.userId, session.user.id)))
    .returning()
})
