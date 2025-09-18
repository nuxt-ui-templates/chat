import { generateText, tool, type UIToolInvocation } from 'ai'
import { put } from '@vercel/blob'
import z from 'zod'

export const generateImage = tool({
  description: 'Generate an image',
  inputSchema: z.object({
    prompt: z.string().describe('The prompt to generate the image from')
  }),
  execute: async ({ prompt }) => {
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
        try {
          const filename = `image-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`
          const { url } = await put(filename, new Blob([file.uint8Array]), { access: 'public' })
          filespath.push(url)
        } catch (error) {
          console.error(error)
        }
      }
    }

    return {
      images: filespath
    }
  }
})

export type GenerateImageUIToolInvocation = UIToolInvocation<typeof generateImage>
