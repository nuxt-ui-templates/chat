import type { UIToolInvocation } from 'ai'
import { tool } from 'ai'
import { z } from 'zod'

export const weatherTool = tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for')
  }),
  execute: async ({ location }) => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      location,
      temperature: 72 + Math.floor(Math.random() * 21) - 10
    }
  }
})

export type WeatherUIToolInvocation = UIToolInvocation<typeof weatherTool>
