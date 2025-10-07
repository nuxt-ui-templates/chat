export interface FileWithStatus {
  file: File
  id: string
  previewUrl: string
  status: 'uploading' | 'uploaded' | 'error'
  uploadedUrl?: string
  error?: string
}

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function clearFiles(files: Ref<FileWithStatus[]>) {
  files.value.forEach((fileWithStatus) => {
    URL.revokeObjectURL(fileWithStatus.previewUrl)
  })
  files.value = []
}

export async function uploadFileToBlob(file: File, chatId: string): Promise<{
  url: string
  pathname: string
  contentType: string
  size: number
}> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('chatId', chatId)

  return await $fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
}

export async function uploadFilesToBlob(files: File[], chatId: string) {
  return Promise.all(
    files.map(async (file) => {
      const response = await uploadFileToBlob(file, chatId)

      return {
        type: 'file' as const,
        mediaType: response.contentType,
        url: response.url
      }
    })
  )
}
