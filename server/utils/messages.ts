import { z } from 'zod'

// Users only send text and uploaded files, reasoning and tool parts come from the model
export const userMessageSchema = z.object({
  id: z.string().optional(),
  role: z.literal('user'),
  parts: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('text'), text: z.string() }),
    z.object({ type: z.literal('file'), mediaType: z.string(), url: z.string(), filename: z.string().optional() })
  ]))
})
