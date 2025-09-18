import { generateText, tool, type UIToolInvocation } from 'ai'
import { put } from '@vercel/blob'
import z from 'zod'

export const generateImage = tool({
  description: 'Generate an image',
  inputSchema: z.object({
    prompt: z.string().describe('The prompt to generate the image from'),
    username: z.string().describe('The username of the user')
  }),
  execute: async ({ prompt, username }) => {
    const result = await generateText({
      model: 'google/gemini-2.5-flash-image-preview',
      providerOptions: {
        google: { responseModalities: ['IMAGE'] }
      },
      prompt
    })

    const imageFiles = result.files.filter(f =>
      f.mediaType?.startsWith('image/')
    )
    const filespath: string[] = []

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const filename = `${username}/image-${Date.now()}.png`
        const { url } = await put(filename, new Blob([new Uint8Array(file.uint8Array)]), {
          access: 'public',
          addRandomSuffix: true
        })
        filespath.push(url)
      }
    }

    return {
      images: filespath
    }
  }
})

export type GenerateImageUIToolInvocation = UIToolInvocation<typeof generateImage>
