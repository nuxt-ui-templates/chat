import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const { message } = await readBody(event)
  console.log(message)

  const [chat] = await db.insert(schema.chats).values({
    title: '',
    userId: session.user?.id || session.id
  }).returning()

  if (!chat) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create chat' })
  }

  await db.insert(schema.messages).values({
    chatId: chat.id,
    role: 'user',
    parts: message.parts
  })

  return chat
})
