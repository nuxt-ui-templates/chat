import { schema } from 'hub:database'

export type Chat = typeof schema.chats.$inferSelect
export type Message = typeof schema.messages.$inferSelect
