/**
 * Converts a File object to an object URL for preview purposes
 */
export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revokes object URLs and clears the files array
 */
export function clearFiles(files: Ref<File[]>) {
  files.value.forEach((file) => {
    const url = createObjectUrl(file)
    URL.revokeObjectURL(url)
  })
  files.value = []
}

/**
 * Converts an array of File objects to data URLs (base64)
 * Useful for sending files in API requests
 */
export async function convertFilesToDataURLs(files: File[]) {
  return Promise.all(
    files.map(
      file =>
        new Promise<{
          type: 'file'
          mediaType: string
          url: string
        }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              type: 'file',
              mediaType: file.type,
              url: reader.result as string
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )
  )
}
