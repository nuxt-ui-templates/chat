import { generateText, tool, type UIToolInvocation } from 'ai'
import { put } from '@vercel/blob'
import z from 'zod'

export const generateImage = tool({
  description: 'Generate an image from text prompt, or edit/modify existing images',
  inputSchema: z.object({
    prompt: z.string().describe('The prompt to generate the image from, or instructions for editing an existing image'),
    username: z.string().describe('The username of the user'),
    images: z.array(z.object({
      url: z.string().describe('The URL of the image'),
      mediaType: z.string().describe('MIME type of the image (e.g., image/png, image/jpeg)')
    })).optional().describe('Optional array of images to edit or use as input')
  }),
  execute: async ({ prompt, username, images }) => {
    // Prepare messages for the AI model
    const messages = []

    if (images && images.length > 0) {
      const content = [
        {
          type: 'text' as const,
          text: prompt
        },
        ...images.map(img => ({
          type: 'file' as const,
          mediaType: img.mediaType,
          data: Buffer.from(img.url, 'base64')
        }))
      ]

      messages.push({
        role: 'user' as const,
        content
      })
    }

    const result = await generateText({
      model: 'google/gemini-2.5-flash-image-preview',
      providerOptions: {
        google: { responseModalities: ['IMAGE'] }
      },
      ...(messages.length > 0 ? { messages } : { prompt })
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
