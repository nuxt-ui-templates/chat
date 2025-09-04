import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from '../database/schema'

export { sql, eq, and, or, desc } from 'drizzle-orm'

export const tables = schema

export function useDrizzle() {
  return drizzle({
    connection: {
      connectionString: process.env.DATABASE_URL
    },
    schema
  })
}

export type Chat = typeof schema.chats.$inferSelect
export type Message = typeof schema.messages.$inferSelect
