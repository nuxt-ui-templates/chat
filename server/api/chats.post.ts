export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { input } = await readBody(event)
  const db = useDrizzle()

  const [chat] = await db.insert(tables.chats).values({
    title: '',
    userId: session.user?.id || session.id
  }).returning()

  await db.insert(tables.messages).values({
    chatId: chat.id,
    role: 'user',
    parts: [{ type: 'text', text: input }]
  })

  return chat
})
