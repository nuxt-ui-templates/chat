import * as schema from '../database/schema'

export { sql, eq, and, or, desc } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return hubDrizzle({ schema })
}

export type Chat = typeof schema.chats.$inferSelect
export type Message = typeof schema.messages.$inferSelect
