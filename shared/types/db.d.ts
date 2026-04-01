import type { chats, messages, votes } from 'hub:db:schema'

export type Chat = typeof chats.$inferSelect
export type Message = typeof messages.$inferSelect
export type Vote = typeof votes.$inferSelect
