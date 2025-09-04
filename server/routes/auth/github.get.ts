export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: ghUser }) {
    const db = useDrizzle()
    const session = await getUserSession(event)

    let user = await db.query.users.findFirst({
      where: (user, { eq }) => and(eq(user.provider, 'github'), eq(user.providerId, ghUser.id.toString()))
    })
    if (!user) {
      [user] = await db.insert(tables.users).values({
        id: session.id,
        name: ghUser.name || '',
        email: ghUser.email || '',
        avatar: ghUser.avatar_url || '',
        username: ghUser.login,
        provider: 'github',
        providerId: ghUser.id.toString()
      }).returning()
    } else {
      // Assign anonymous chats with session id to user
      await db.update(tables.chats).set({
        userId: user.id
      }).where(eq(tables.chats.userId, session.id))
    }

    await setUserSession(event, { user })

    return sendRedirect(event, '/')
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/')
  }
})
